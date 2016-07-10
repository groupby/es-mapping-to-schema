## Elasticsearch Mapping to Schema Inspector schema

This allows you to convert an [elasticsearch mapping](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html), defined in JSON
into a schema that works with [Schema Inspector](http://atinux.github.io/schema-inspector/).

### Changelog:
3.0.0 - Completely changed the API and output. Now offers more options, and generates separate schemas for validation and 
sanitization. Previous version combined validation and sanitization into a single schema, with occasionally bad results.

### Install:
```javascript
npm install --save es-mapping-to-schema
```

### Basic Use:
Pass in the elasticsearch mapping and the options you want. It will return two schemas, one for validation, and one for sanitization. 

```javascript
const MappingToSchema = require('es-mapping-to-schema');

const mapping = {
  properties: {
    booleanThing: {
      type: 'boolean'
    },
    selectors:    {
      properties: {
        selector: {
          properties: {
            name:  {
              type: 'string'
            },
            value: {
              type: 'string'
            }
          }
        }
      }
    }
  }
};

const expectedSchema = {
  type:       'object',
  properties: {
    booleanThing: {
      type: 'boolean'
    },
    selectors:    {
      type:  'array',
      items: {
        selector: {
          type:       'object',
          properties: {
            name:  {
              type: 'string'
            },
            value: {
              type: 'string'
            }
          }
        }
      }
    }
  }
};

// Explicity specify the types to be added to sanitization schema.
const schemas = MappingToSchema(mapping, {
  arrayPaths:   [
    'selectors'
  ],
  sanitization: {
    all: {
      types: [
        'object',
        'string',
        'integer',
        'number',
        'array',
        'boolean',
        'date'
      ]
    }
  }
});

expect(schemas.validation).to.eql(expectedSchema);
expect(schemas.sanitization).to.eql(expectedSchema);
```

### Options:
```javascript
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
```
