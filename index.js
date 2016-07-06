const _ = require('lodash');

const DIRECT_COPY_TYPES = [
  'integer',
  'string',
  'number',
  'boolean',
  'date'
];

// This is a Lucene limitation
const MAX_STRING_SIZE = 32766;

const RecurseMappingToSchema = (schema, mapping, modifiers) => {
  if (mapping.properties) {
    if (modifiers.isArray) {
      schema.type  = 'array';
      schema.items = RecurseMappingToSchema({}, mapping.properties, modifiers);
    } else {
      schema.type       = 'object';
      schema.properties = RecurseMappingToSchema({}, mapping.properties, modifiers);

      if (modifiers.allStrict && !modifiers.isOptional) {
        schema.strict = true;
      }
    }

    if (modifiers.isOptional) {
      schema.optional = true
    }

    return schema;
  } else if (mapping.type) {
    if (_.includes(DIRECT_COPY_TYPES, mapping.type)) {
      schema.type = mapping.type;

      if (schema.type === 'string') {
        schema.maxLength = MAX_STRING_SIZE;
        schema.rules     = ['trim'];
      }
    } else {
      switch (mapping.type) {
        case 'double':
        case 'float':
          schema.type = 'number';
          break;
        case 'long':
        case 'short':
        case 'byte':
          schema.type = 'integer';
          break;
        default:
          console.log(`mapping type: ${mapping.type} is unsupported and will be ignored`);
          break;
      }
    }

    if (modifiers.isOptional) {
      schema.optional = true
    }

    return schema;
  } else {
    const nextModifiers         = _.cloneDeep(modifiers);
    nextModifiers.arrayPaths    = NextPaths(modifiers.arrayPaths);
    nextModifiers.isArray       = false;
    nextModifiers.optionalPaths = NextPaths(modifiers.optionalPaths);
    nextModifiers.isOptional    = false;

    return _.reduce(mapping, (result, property, name) => {
      const localModifiers      = _.cloneDeep(nextModifiers);
      localModifiers.isArray    = _.includes(modifiers.arrayPaths, name);
      localModifiers.isOptional = _.includes(modifiers.optionalPaths, name);

      schema[name] = {};
      result[name] = RecurseMappingToSchema(schema[name], mapping[name], localModifiers);
      return result;
    }, {});
  }
};

const NextPaths = currentPaths => _.reduce(currentPaths, (result, currentPath) => {
  const nextPath = _.join(_.drop(_.split(currentPath, '.'), 1), '.');
  if (nextPath.length > 0) {
    result.push(nextPath);
  }
  return result;
}, []);

const MappingToSchema = (mapping, options) => {
  options = options || {};

  const modifiers = {
    arrayPaths:    options.arrayPaths,
    allStrict:     options.allStrict && options.allStrict === true,
    isArray:       false,
    optionalPaths: options.optionalPaths,
    isOptional:    false
  };

  return RecurseMappingToSchema({}, mapping, modifiers);
};

module.exports = MappingToSchema;