const _       = require('lodash');
const Options = require('./options');

const DIRECT_COPY_TYPES = [
  'integer',
  'string',
  'number',
  'boolean',
  'date'
];

const SANITIZATION_SCHEMA = 'sanization';
const VALIDATION_SCHEMA = 'validation';

// This is a Lucene limitation
const MAX_STRING_SIZE = 32766;

const RecurseMappingToSchema = (mapping, schema, schemaType, options, localOptions) => {
  const optional = localOptions.optional || (options[schemaType].all.optional && !localOptions.strict);
  const strict   = localOptions.strict || (options[schemaType].all.strict && !localOptions.optional);

  localOptions = _.omit(localOptions, [
    'strict',
    'optional'
  ]);

  if (mapping.properties || mapping.type) {
    if (mapping.properties || mapping.type === 'object' || mapping.type === 'nested') {
      if (localOptions.isArray) {
        schema.type  = 'array';
        schema.items = RecurseMappingToSchema({}, mapping.properties, schemaType, options, {});
      } else {
        schema.type = 'object';

        if (mapping.properties) {
          schema.properties = RecurseMappingToSchema({}, mapping.properties, schemaType, options, {});
        }

        if (strict) {
          schema.strict = true;
        }
      }
    } else {
      const type = convertEsTypeToSchemaType(mapping.type);

      if (schemaType === SANITIZATION_SCHEMA) {
        if (type && _.includes(options[schemaType].all.types, type)) {
          schema.type = type;
        }

        if (schema.type === 'string' && options[schemaType].all.maxLength) {
          schema.maxLength = options[schemaType].all.maxLength;
        }

        if (options[schemaType].all.rules) {
          schema.rules = options[schemaType].all.rules;
        }
      }

      if (schemaType === VALIDATION_SCHEMA && type) {
        schema.type = type;
      }
    }

    if (schema.type && optional) {
      schema.optional = true;
    }

    _.forEach(localOptions, (value, field) => {
      schema[field] = value;
    });

    return schema;
  } else {
    const nextOptions             = _.cloneDeep(options);
    nextOptions[schemaType].paths = nextPaths(nextOptions[schemaType].paths);

    return _.reduce(mapping, (result, property, name) => {
      const nextLocalOptions = getLocalOptions(options[schemaType].paths, name);

      schema[name] = {};
      result[name] = RecurseMappingToSchema(mapping[name], schema[name], schemaType, nextOptions, nextLocalOptions);
      return result;
    }, {});
  }
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

const MappingToSchema = (mapping, options) => {
  options = options || {};
  options = new Options(options);

  return {
    validation:   RecurseMappingToSchema(mapping, {}, VALIDATION_SCHEMA, options, {}),
    sanitization: RecurseMappingToSchema(mapping, {}, SANITIZATION_SCHEMA, options, {})
  };
};

const convertEsTypeToSchemaType = (type) => {
  if (_.includes(DIRECT_COPY_TYPES, type)) {
    return type;
  } else {
    switch (type) {
      case 'double':
      case 'float':
        return 'number';
      case 'long':
      case 'short':
      case 'byte':
        return 'integer';
      default:
        console.log(`mapping type: ${type} is unsupported and will be ignored`);
        return null;
    }
  }
};

const args = {
  all:          {},
  validation:   {
    all:   {
      strict:   false,
      optional: false
    },
    paths: {
      'someOverride': [
        {
          path:  '',
          value: ''
        }
      ]
    }
  },
  sanitization: {
    all:   {
      strict:    false,
      rules:     [],
      maxLength: 0,
      types:     []
    },
    paths: {
      'someOverride': [
        {
          path:  '',
          value: ''
        }
      ]
    }
  }
};

MappingToSchema.__nextPaths = nextPaths;
MappingToSchema.__getLocalOptions = getLocalOptions;

module.exports = MappingToSchema;