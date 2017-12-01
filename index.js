const _       = require('lodash');
const Options = require('./options');

const DIRECT_COPY_TYPES = [
  'integer',
  'string',
  'number',
  'boolean',
  'date',
  'object'
];

const SANITIZATION_SCHEMA = 'sanitization';
const VALIDATION_SCHEMA   = 'validation';

const recurseMappingProperties = (mapping, schema, schemaType, options) => {
  return _.reduce(mapping, (result, property, name) => {
    const nextOptions             = _.cloneDeep(options);
    // Pull out only the paths that are relevant to this object
    nextOptions[schemaType].paths = pickPaths(nextOptions[schemaType].paths, name);

    // Shift paths
    nextOptions[schemaType].paths = nextPaths(nextOptions[schemaType].paths);
    nextOptions.arrayPaths = shortenArrayPaths(nextOptions.arrayPaths);

    const nextLocalOptions = getLocalOptions(options[schemaType].paths, name);
    nextOptions.isArray = _.includes(options.arrayPaths, name);

    schema[name] = determineType(mapping[name], {}, schemaType, nextOptions);
    result[name] = recurseMappingObjects(mapping[name], schema[name], schemaType, nextOptions, nextLocalOptions);

    return result;
  }, {});
};

const recurseMappingObjects = (mapping, schema, schemaType, options, localOptions) => {
  const optional = localOptions.optional || options[schemaType].all.optional;
  const strict   = localOptions.strict || options[schemaType].all.strict;

  if (mapping.properties || mapping.type === 'object' || mapping.type === 'nested' || options.isArray) {
    if (options.isArray) {
      schema.items = determineType(mapping, {}, schemaType, Object.assign({}, options, {isArray: false}));

      if (mapping.properties) {
        schema.items.properties = recurseMappingProperties(mapping.properties, {}, schemaType, options, {});

        if (strict) {
          schema.items.strict = true;
        }
      }
    } else {
      if (mapping.properties) {
        schema.properties = recurseMappingProperties(mapping.properties, {}, schemaType, options, {});

        if (strict) {
          schema.strict = true;
        }
      }
    }
  }

  if (schema.type && optional) {
    schema.optional = true;
  }

  _.forEach(localOptions, (value, field) => {
    if (options.isArray && field !== 'optional') {
      schema.items[field] = value;
    } else {
      schema[field] = value;
    }
  });

  return schema;
};

const determineType = (mapping, schema, schemaType, options) => {
  const mappingType = mapping.properties ? 'object' : mapping.type;
  const type        = convertEsTypeToSchemaType(mappingType, options.isArray, options.disableWarnings);

  if (schemaType === SANITIZATION_SCHEMA) {
    if (type && _.includes(options[schemaType].all.types, type)) {
      schema.type = type;
    }

    if (options[schemaType].all.maxLength && mapping.type === 'string' && schema.type !== 'array') {
      schema.maxLength = options[schemaType].all.maxLength;
    }

    // Important to check that the mapping.type is a string, and not schema.type
    // because schema.type may not be populated if we don't want type coercion
    if (options[schemaType].all.rules && mapping.type === 'string' && schema.type !== 'array') {
      schema.rules = options[schemaType].all.rules;
    }
  }

  if (schemaType === VALIDATION_SCHEMA && type) {
    schema.type = type;

    if (options[schemaType].all.minLength && mapping.type === 'string' && schema.type !== 'array') {
      schema.minLength = options[schemaType].all.minLength;
    }

    if (options[schemaType].all.maxLength && mapping.type === 'string' && schema.type !== 'array') {
      schema.maxLength = options[schemaType].all.maxLength;
    }
  }

  return schema;
};

const getLocalOptions = (currentPathObjects, name) => _.reduce(currentPathObjects, (result, currentPathObject, field) => {
  _.forEach(currentPathObject, (specificPath) => {
    if (specificPath.path === name || specificPath.path === '*') {
      result[field] = specificPath.value;
    }
  });

  return result;
}, {});

const pickPaths = (currentPathObjects, pickProperty) => {
  return _.reduce(currentPathObjects, (resultingPathObjects, currentPathObject, name) => {
    resultingPathObjects[name] = _.filter(currentPathObject, (currentPath) => _.startsWith(currentPath.path, pickProperty));
    return resultingPathObjects;
  }, {});
};

const nextPaths = (currentPathObjects) => _.reduce(currentPathObjects, (result, currentPathObject, field) => {
  result[field] = shortenPaths(currentPathObject);
  return result;
}, {});

const shortenPaths = (currentPaths) => _.reduce(currentPaths, (result, currentPath) => {
  const nextPath = _.join(_.drop(_.split(currentPath.path, '.'), 1), '.');
  if (nextPath.length > 0) {
    result.push({
      path:  nextPath,
      value: currentPath.value
    });
  }
  return result;
}, []);

const shortenArrayPaths = (currentPaths) => _.reduce(currentPaths, (result, currentPath) => {
  const nextPath = _.join(_.drop(_.split(currentPath, '.'), 1), '.');
  if (nextPath.length > 0) {
    result.push(nextPath);
  }
  return result;
}, []);

const MappingToSchema = (mapping, options) => {
  if (!_.isString(mapping.type) && !_.isObject(mapping.properties)) {
    throw new Error('root of mapping must have \'type\' or \'properties\' fields');
  }

  options = options || {};
  options = new Options(options);

  options = _.defaultsDeep(options, DEFAULTS);

  const baseValidationSchema   = determineType(mapping, {}, VALIDATION_SCHEMA, options);
  const baseSanitizationSchema = determineType(mapping, {}, SANITIZATION_SCHEMA, options);

  return {
    validation:   recurseMappingObjects(mapping, baseValidationSchema, VALIDATION_SCHEMA, options, {}),
    sanitization: recurseMappingObjects(mapping, baseSanitizationSchema, SANITIZATION_SCHEMA, options, {})
  };
};


const convertEsTypeToSchemaType = (type, isArray, disableWarnings) => {
  if (_.includes(DIRECT_COPY_TYPES, type)) {
    return isArray ? 'array' : type;
  } else {
    switch (type) {
    case 'nested':
      return isArray ? 'array' : 'object';
    case 'double':
    case 'float':
      return 'number';
    case 'long':
    case 'short':
    case 'byte':
      return 'integer';
    case 'text':
    case 'keyword':
      return 'string';
    case undefined:
      return null;
    default:
      if (!disableWarnings) {
        console.warn(`mapping type: ${_.isObject(type) ? JSON.stringify(type, null, 2) : type} is unsupported and will be ignored`);
      }
      return null;
    }
  }
};

const DEFAULTS = {
  disableWarnings: false,
  arrayPaths:      [],
  validation:      {
    all: {
      strict:   false,
      optional: false
    },
    paths: {}
  },
  sanitization: {
    all: {
      strict: false
    },
    paths: {}
  }
};

MappingToSchema.__pickPaths = pickPaths;
MappingToSchema.__nextPaths = nextPaths;
MappingToSchema.__getLocalOptions = getLocalOptions;

module.exports = MappingToSchema;
