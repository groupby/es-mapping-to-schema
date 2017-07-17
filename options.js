const _         = require('lodash');
const inspector = require('schema-inspector');

const VALIDATION_SCHEMA = {
  type:       'object',
  strict:     true,
  properties: {
    disableWarnings: {
      optional: true,
      def:      false,
      type:     'boolean'
    },
    arrayPaths: {
      optional: true,
      type:     'array',
      items:    {
        type: 'string'
      }
    },
    validation: {
      optional:   true,
      type:       'object',
      strict:     true,
      properties: {
        all: {
          optional:   true,
          type:       'object',
          properties: {
            strict: {
              optional: true,
              type:     'boolean'
            },
            optional: {
              optional: true,
              type:     'boolean'
            },
            minLength: {
              optional: true,
              type:     'integer'
            }
          }
        },
        paths: {
          optional:   true,
          type:       'object',
          properties: {
            '*': {
              type:  'array',
              items: {
                type:       'object',
                properties: {
                  path: {
                    type: 'string'
                  },
                  value: {
                    type: 'any'
                  }
                }
              }
            }
          }
        }
      }
    },
    sanitization: {
      optional:   true,
      type:       'object',
      strict:     true,
      properties: {
        all: {
          optional:   true,
          type:       'object',
          strict:     true,
          properties: {
            strict: {
              optional: true,
              type:     'boolean'
            },
            rules: {
              optional: true,
              type:     'array'
            },
            maxLength: {
              optional: true,
              type:     'integer',
              gte:      0
            },
            types: {
              optional: true,
              type:     'array',
              items:    {
                type: 'string'
              }
            }
          }
        },
        paths: {
          optional:   true,
          type:       'object',
          properties: {
            '*': {
              type:  'array',
              items: {
                type:       'object',
                properties: {
                  path: {
                    type: 'string'
                  },
                  value: {
                    type: 'any'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

const Options = function (params) {
  const self = this;
  params = _.cloneDeep(params);

  const result = inspector.validate(VALIDATION_SCHEMA, params);

  if (!result.valid) {
    throw new Error(result.format());
  }

  _.merge(self, params);

  return self;
};

module.exports = Options;