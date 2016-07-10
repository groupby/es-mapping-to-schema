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

// This is a Lucene limitation
const MAX_STRING_SIZE = 32766;

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

    if (_.size(result[name]) === 0) {
      delete result[name];
    }

    return result;
  }, {});
};

const recurseMappingObjects = (mapping, schema, schemaType, options, localOptions) => {
  const optional = localOptions.optional || options[schemaType].all.optional;
  const strict   = localOptions.strict || options[schemaType].all.strict;

  if (mapping.properties || mapping.type === 'object' || mapping.type === 'nested') {
    if (options.isArray) {
      schema.items = RecurseMappingToSchema(mapping.properties, {}, schemaType, options, {});

      if (_.size(schema.items) === 0) {
        delete schema.items;
      }
    } else {
      if (mapping.properties) {
        schema.properties = RecurseMappingToSchema(mapping.properties, {}, schemaType, options, {});

        if (_.size(schema.properties) === 0) {
          delete schema.properties;
        }
      }

      if (strict) {
        schema.strict = true;
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
  let mappingType = mapping.properties ? 'object' : mapping.type;
  let type        = convertEsTypeToSchemaType(mappingType, options.isArray);

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
    if (specificPath.path === name) {
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

const Options = {
  // 'arrayPaths' are used to define properties in the mapping that appear as objects but should be validated as arrays
  // This is because elasticsearch does not explicitly support arrays, but schema inspector does
  arrayPaths:   [],
  // These are the rules and options that will apply only to validation schema generation
  validation:   {
    // 'all' fields are applied recursively to all appropriate fields
    // Currently supports 'strict' and 'optional' for validation
    all:   {
      strict:   false,
      optional: false
    },
    // 'paths' are specific path overrides.
    // For 'paths', any field, value, and path combination is allowed
    // In this case field 'pattern' is applied with value '/must be this/' to property 'path.to.some.property'
    paths: {
      pattern: [
        {
          path: 'path.to.some.property',
          value: /must be this/
        }
      ]
    }
  },
  // These are the rules and options that will apply only to sanitization schema generation
  sanitization: {
    // 'all' fields are applied recursively to all appropriate fields.
    // Currently supports 'strict', 'rules', and 'maxLength' for sanitization.
    // The 'types' field is special, in that you must explicitly list the types you want to sanitize
    // otherwise none will sanitized.
    all:   {
      strict: false,
      rules: [],
      maxLength: 10,
      types: []
    },
    // 'paths' are specific path overrides.
    // For 'paths', any field, value, and path combination is allowed
    // In this case field 'def' is applied with value 'default to this' to property 'path.to.some.property'
    paths: {
      def: [
        {
          path: 'path.to.some.property',
          value: 'default to this'
        }
      ]
    }
  }
};