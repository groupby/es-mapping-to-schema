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

const RecurseMappingToSchema = (mapping, schema, schemaType, options, localOptions) => {

  schema = determineType(mapping, schema, schemaType, options, localOptions);

  if (mapping.properties || mapping.type) {
    return recurseMappingObjects(mapping, schema, schemaType, options, localOptions);
  } else {
    return recurseMappingProperties(mapping, schema, schemaType, options);
  }
};

const recurseMappingProperties = (mapping, schema, schemaType, options) => {
  const nextOptions             = _.cloneDeep(options);
  nextOptions[schemaType].paths = nextPaths(nextOptions[schemaType].paths);
  nextOptions.arrayPaths        = shortenArrayPaths(nextOptions.arrayPaths);

  return _.reduce(mapping, (result, property, name) => {
    const nextLocalOptions = getLocalOptions(options[schemaType].paths, name);
    nextOptions.isArray    = _.includes(options.arrayPaths, name);

    schema[name] = {};
    result[name] = RecurseMappingToSchema(mapping[name], schema[name], schemaType, nextOptions, nextLocalOptions);

    return result;
  }, {});
};

const recurseMappingObjects = (mapping, schema, schemaType, options, localOptions) => {
  const optional = localOptions.optional || options[schemaType].all.optional;
  const strict   = localOptions.strict || options[schemaType].all.strict;

  if (mapping.properties || mapping.type === 'object' || mapping.type === 'nested') {
    if (options.isArray) {
      schema.items      = {};
      schema.items.type = 'object';

      if (mapping.properties) {
        schema.items.properties = RecurseMappingToSchema(mapping.properties, {}, schemaType, options, {});

        if (strict) {
          schema.items.strict = true;
        }
      }
    } else {
      if (mapping.properties) {
        schema.properties = RecurseMappingToSchema(mapping.properties, {}, schemaType, options, {});

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
    schema[field] = value;
  });

  return schema;
};

const determineType = (mapping, schema, schemaType, options, localOptions) => {
  const mappingType = mapping.properties ? 'object' : mapping.type;
  const type        = convertEsTypeToSchemaType(mappingType, options.isArray);

  if (schemaType === SANITIZATION_SCHEMA) {
    if (type && _.includes(options[schemaType].all.types, type)) {
      schema.type = type;
    }

    if (schema.type === 'string' && options[schemaType].all.maxLength) {
      schema.maxLength = options[schemaType].all.maxLength;
    }

    if (options[schemaType].all.rules && schema.type === 'string') {
      schema.rules = options[schemaType].all.rules;
    }
  }

  if (schemaType === VALIDATION_SCHEMA && type) {
    schema.type = type;
  }

  return schema;
};

const getLocalOptions = (currentPathObjects, name) => _.reduce(currentPathObjects, (result, currentPathObject, field) => {
  _.forEach(currentPathObject, specificPath => {
    if (specificPath.path === name || specificPath.path === '*') {
      result[field] = specificPath.value;
    }
  });

  return result;
}, {});

const nextPaths = currentPathObjects => _.reduce(currentPathObjects, (result, currentPathObject, field) => {
  result[field] = shortenPaths(currentPathObject);
  return result;
}, {});

const shortenPaths = currentPaths => _.reduce(currentPaths, (result, currentPath) => {
  const nextPath = _.join(_.drop(_.split(currentPath.path, '.'), 1), '.');
  if (nextPath.length > 0) {
    result.push({
      path:  nextPath,
      value: currentPath.value
    });
  }
  return result;
}, []);

const shortenArrayPaths = currentPaths => _.reduce(currentPaths, (result, currentPath) => {
  const nextPath = _.join(_.drop(_.split(currentPath, '.'), 1), '.');
  if (nextPath.length > 0) {
    result.push(nextPath);
  }
  return result;
}, []);

const MappingToSchema = (mapping, options) => {
  options = options || {};
  options = new Options(options);

  options = _.defaultsDeep(options, DEFAULTS);

  return {
    validation:   RecurseMappingToSchema(mapping, {}, VALIDATION_SCHEMA, options, {}),
    sanitization: RecurseMappingToSchema(mapping, {}, SANITIZATION_SCHEMA, options, {})
  };
};

const convertEsTypeToSchemaType = (type, isArray) => {
  if (_.includes(DIRECT_COPY_TYPES, type)) {
    return type === 'object' && isArray ? 'array' : type;
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
      case undefined:
        return null;
      default:
        console.log(`mapping type: ${type} is unsupported and will be ignored`);
        return null;
    }
  }
};

const DEFAULTS = {
  arrayPaths:   [],
  validation:   {
    all:   {
      strict:   false,
      optional: false
    },
    paths: {}
  },
  sanitization: {
    all:   {
      strict: false
    },
    paths: {}
  }
};

MappingToSchema.__nextPaths       = nextPaths;
MappingToSchema.__getLocalOptions = getLocalOptions;

module.exports = MappingToSchema;