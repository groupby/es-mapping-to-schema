const chai      = require('chai');
const expect    = chai.expect;
const inspector = require('schema-inspector');

const MappingToSchema = require('./index');

describe('es-mapping-to-schema tests', ()=> {
  it('should convert a mapping into a validation and sanitization schemas', () => {
    const mapping = {
      _all:       {
        enabled: false
      },
      properties: {
        booleanThing:           {
          type: 'boolean'
        },
        stringThing:            {
          type: 'string'
        },
        integerThing:           {
          type: 'integer'
        },
        longThing:              {
          type: 'long'
        },
        shortThing:             {
          type: 'short'
        },
        byteThing:              {
          type: 'byte'
        },
        floatThing:             {
          type: 'float'
        },
        doubleThing:            {
          type: 'double'
        },
        nonanalyzedStringThing: {
          type:  'string',
          index: 'not_analyzed'
        },
        variousTerm:            {
          type:   'string',
          fields: {
            raw:         {
              type:  'string',
              index: 'not_analyzed',
              store: true
            },
            normalized:  {
              type:     'string',
              analyzer: 'facet_analyzer'
            },
            lang_en:     {
              type:     'string',
              analyzer: 'english'
            },
            lang_en_raw: {
              type:     'string',
              analyzer: 'raw_diacritic_free'
            }
          }
        },
        customer:               {
          type:       'object',
          properties: {
            customerId: {
              type:  'string',
              index: 'not_analyzed'
            },
            projectId:  {
              type:  'string',
              index: 'not_analyzed'
            },
            localTime:  {
              type:   'date',
              format: 'dateOptionalTime'
            }
          }
        },
        selectors:              {
          type:              'nested',
          include_in_parent: true,
          properties:        {
            selector: {
              properties: {
                name:  {
                  type:   'string',
                  fields: {
                    raw:        {
                      type:  'string',
                      index: 'not_analyzed',
                      store: true
                    },
                    normalized: {
                      type:     'string',
                      analyzer: 'facet_analyzer'
                    }
                  }
                },
                value: {
                  type:   'string',
                  fields: {
                    raw: {
                      type:  'string',
                      index: 'not_analyzed',
                      store: true
                    }
                  }
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
        booleanThing:           {
          type: 'boolean'
        },
        stringThing:            {
          type: 'string'
        },
        integerThing:           {
          type: 'integer'
        },
        longThing:              {
          type: 'integer'
        },
        shortThing:             {
          type: 'integer'
        },
        byteThing:              {
          type: 'integer'
        },
        floatThing:             {
          type: 'number'
        },
        doubleThing:            {
          type: 'number'
        },
        nonanalyzedStringThing: {
          type: 'string'
        },
        variousTerm:            {
          type: 'string'
        },
        customer:               {
          type:       'object',
          properties: {
            customerId: {
              type: 'string'
            },
            projectId:  {
              type: 'string'
            },
            localTime:  {
              type: 'date'
            }
          }
        },
        selectors:              {
          type:       'object',
          properties: {
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

    const schemas = MappingToSchema(mapping, {
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

    // console.log('schemas: ' + JSON.stringify(schemas, null, 2));

    expect(schemas.validation).to.eql(expectedSchema);
    expect(schemas.sanitization).to.eql(expectedSchema);
  });

  it('should convert a mapping with an array non-objects', ()=> {
    const mapping = {
      properties: {
        booleanThing: {
          type: 'boolean'
        },
        selectors:    {
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
    };

    const expectedSchema = {
      type:       'object',
      strict:     true,
      properties: {
        booleanThing: {
          type: 'boolean'
        },
        selectors:    {
          type:  'array',
          items: {
            type:       'object',
            strict:     true,
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
    };

    const schemas = MappingToSchema(mapping, {
      arrayPaths:   [
        'selectors'
      ],
      sanitization: {
        all: {
          strict: true,
          types:  [
            'object',
            'string',
            'integer',
            'number',
            'array',
            'boolean',
            'date'
          ]
        }
      },
      validation:   {
        all: {
          strict: true
        }
      }
    });

    expect(schemas.validation).to.eql(expectedSchema);
    expect(schemas.sanitization).to.eql(expectedSchema);

    const shouldPass = {
      booleanThing: true,
      selectors:    [
        {
          name:  'thing',
          value: 'other'
        }
      ]
    };

    expect(inspector.validate(schemas.validation, shouldPass).valid).to.eql(true);

    const shouldFail = {
      booleanThing: true,
      selectors:    [
        {
          name:  'thing',
          value: 'other',
          extra: 'this'
        }
      ]
    };

    expect(inspector.validate(schemas.validation, shouldFail).valid).to.eql(false);
  });

  it('should convert a mapping with an array of objects into schemas', () => {
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
      strict:     true,
      properties: {
        booleanThing: {
          type: 'boolean'
        },
        selectors:    {
          type:  'array',
          items: {
            type:       'object',
            strict:     true,
            properties: {
              selector: {
                type:       'object',
                strict:     true,
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
      }
    };

    const schemas = MappingToSchema(mapping, {
      arrayPaths:   [
        'selectors'
      ],
      sanitization: {
        all: {
          strict: true,
          types:  [
            'object',
            'string',
            'integer',
            'number',
            'array',
            'boolean',
            'date'
          ]
        }
      },
      validation:   {
        all: {
          strict: true
        }
      }
    });

    expect(schemas.validation).to.eql(expectedSchema);
    expect(schemas.sanitization).to.eql(expectedSchema);

    const shouldPass = {
      booleanThing: true,
      selectors:    [
        {
          selector: {
            name:  'thing',
            value: 'other'
          }
        }
      ]
    };

    expect(inspector.validate(schemas.validation, shouldPass).valid).to.eql(true);

    const shouldFail = {
      booleanThing: true,
      selectors:    [
        {
          selector: {
            name:  'thing',
            value: 'other'
          },
          extra:    'this'
        }
      ]
    };

    expect(inspector.validate(schemas.validation, shouldFail).valid).to.eql(false);
  });

  it('should convert a mapping into a schema with optional properties', () => {
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
          type:       'object',
          properties: {
            selector: {
              type:       'object',
              properties: {
                name:  {
                  type:     'string',
                  optional: true
                },
                value: {
                  type:     'string',
                  optional: true
                }
              }
            }
          }
        }
      }
    };

    const schemas = MappingToSchema(mapping, {
      validation:   {
        paths: {
          optional: [
            {
              path:  'selectors.selector.name',
              value: true
            },
            {
              path:  'selectors.selector.value',
              value: true
            }
          ]
        }
      },
      sanitization: {
        all:   {
          types: [
            'object',
            'string',
            'integer',
            'number',
            'array',
            'boolean',
            'date'
          ]
        },
        paths: {
          optional: [
            {
              path:  'selectors.selector.name',
              value: true
            },
            {
              path:  'selectors.selector.value',
              value: true
            }
          ]
        }
      }
    });

    expect(schemas.validation).to.eql(expectedSchema);
    expect(schemas.sanitization).to.eql(expectedSchema);
  });

  it('should convert a mapping into a schema with all strict properties', () => {
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
      strict:     true,
      properties: {
        booleanThing: {
          type: 'boolean'
        },
        selectors:    {
          type:       'object',
          strict:     true,
          properties: {
            selector: {
              type:       'object',
              strict:     true,
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

    const schemas = MappingToSchema(mapping, {
      validation:   {
        all: {
          strict: true
        }
      },
      sanitization: {
        all: {
          strict: true,
          types:  [
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
  });

  it('should convert a mapping into a schema with some strict properties', () => {
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
          type:       'object',
          strict:     true,
          properties: {
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

    const schemas = MappingToSchema(mapping, {
      validation:   {
        paths: {
          strict: [
            {
              path:  'selectors',
              value: true
            }
          ]
        }
      },
      sanitization: {
        all:   {
          types: [
            'object',
            'string',
            'integer',
            'number',
            'array',
            'boolean',
            'date'
          ]
        },
        paths: {
          strict: [
            {
              path:  'selectors',
              value: true
            }
          ]
        }
      }
    });

    expect(schemas.validation).to.eql(expectedSchema);
    expect(schemas.sanitization).to.eql(expectedSchema);
  });

  it('should convert a mapping into a schema with all strict, and some optional properties', () => {
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
      strict:     true,
      properties: {
        booleanThing: {
          type: 'boolean'
        },
        selectors:    {
          type:       'object',
          strict:     true,
          properties: {
            selector: {
              strict:     true,
              type:       'object',
              optional:   true,
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

    const schemas = MappingToSchema(mapping, {
      validation:   {
        all:   {
          strict: true
        },
        paths: {
          optional: [
            {
              path:  'selectors.selector',
              value: true
            }
          ]
        }
      },
      sanitization: {
        all:   {
          strict: true,
          types:  [
            'object',
            'string',
            'integer',
            'number',
            'array',
            'boolean',
            'date'
          ]
        },
        paths: {
          optional: [
            {
              path:  'selectors.selector',
              value: true
            }
          ]
        }
      }
    });

    expect(schemas.validation).to.eql(expectedSchema);
    expect(schemas.sanitization).to.eql(expectedSchema);
  });

  it('should convert a mapping into a schema with rules', () => {
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

    const expectedValidatationSchema = {
      type:       'object',
      properties: {
        booleanThing: {
          type: 'boolean'
        },
        selectors:    {
          type:       'object',
          properties: {
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

    const expectedSanitizationSchema = {
      type:       'object',
      properties: {
        booleanThing: {
          type: 'boolean'
        },
        selectors:    {
          type:       'object',
          properties: {
            selector: {
              type:       'object',
              properties: {
                name:  {
                  type:  'string',
                  rules: [
                    'trim',
                    'lowercase'
                  ]
                },
                value: {
                  type:  'string',
                  rules: [
                    'trim',
                    'lowercase'
                  ]
                }
              }
            }
          }
        }
      }
    };

    const schemas = MappingToSchema(mapping, {
      sanitization: {
        all: {
          rules: [
            'trim',
            'lowercase'
          ],
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

    expect(schemas.validation).to.eql(expectedValidatationSchema);
    expect(schemas.sanitization).to.eql(expectedSanitizationSchema);
  });

  it('should shorten all paths by one level', () => {
    const paths = {
      def:      [
        {
          path:  'something.yo.this',
          value: true
        },
        {
          path:  'something.alkf.asfd',
          value: 'ddd'
        },
        {
          path:  'gone',
          value: 'asfdsd'
        }
      ],
      optional: [
        {
          path:  'other.that.wer',
          value: 2393
        }
      ]
    };

    const shortenedPaths = MappingToSchema.__nextPaths(paths);

    expect(shortenedPaths).to.eql({
      def:      [
        {
          path:  'yo.this',
          value: true
        },
        {
          path:  'alkf.asfd',
          value: 'ddd'
        }
      ],
      optional: [
        {
          path:  'that.wer',
          value: 2393
        }
      ]
    });
  });

  it('should return the options applicable to a specific field', ()=> {
    const paths = {
      def:      [
        {
          path:  'something.yo.this',
          value: true
        },
        {
          path:  'onTarget',
          value: 'asfdsd'
        }
      ],
      optional: [
        {
          path:  'onTarget',
          value: 2393
        }
      ]
    };

    const localOptions = MappingToSchema.__getLocalOptions(paths, 'onTarget');

    expect(localOptions).to.eql({
      def:      'asfdsd',
      optional: 2393
    });
  });

  it('should produce a schemas with empty objects for every property if nothing else is needed', ()=> {
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

    const expectedValidataionSchema = {
      type:       'object',
      properties: {
        booleanThing: {
          type: 'boolean'
        },
        selectors:    {
          type:       'object',
          properties: {
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

    const expectedSanitizationSchema = {
      properties: {
        booleanThing: {},
        selectors:    {
          properties: {
            selector: {
              properties: {
                name:  {},
                value: {}
              }
            }
          }
        }
      }
    };

    const schemas = MappingToSchema(mapping);

    expect(schemas.validation).to.eql(expectedValidataionSchema);
    expect(schemas.sanitization).to.eql(expectedSanitizationSchema);
  });

  it('should throw if the root object does not have a type or properties field', ()=> {
    const mapping = {
      thing: {
        type: 'string'
      }
    };

    expect(() => MappingToSchema(mapping)).to.throw(/must have 'type' or 'properties' field/);
  });

  it('should handle mappings with properties named "type" or "properties"', ()=> {
    const mapping = {
      properties: {
        type:       {
          type: 'string'
        },
        properties: {
          type: 'string'
        },
        notType:    {
          type: 'string'
        }
      }
    };

    const expectedValidataionSchema = {
      type:       'object',
      properties: {
        type:       {
          type: 'string'
        },
        properties: {
          type: 'string'
        },
        notType:    {
          type: 'string'
        }
      }
    };

    const expectedSanitizationSchema = {
      properties: {
        type:       {},
        properties: {},
        notType:    {}
      }
    };

    const schemas = MappingToSchema(mapping);

    expect(schemas.validation).to.eql(expectedValidataionSchema);
    expect(schemas.sanitization).to.eql(expectedSanitizationSchema);
  });

  it('should apply path value to wildcarded path', ()=> {
    const mapping = {
      properties: {
        booleanThing: {
          type: 'boolean'
        },
        selectors:    {
          properties: {
            name:  {
              type: 'string'
            },
            value: {
              type: 'string'
            }
          }
        },
        notSelectors: {
          properties: {
            foo: {
              type: 'double'
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
          type:       'object',
          properties: {
            name:  {
              something: 'wildcard',
              type:      'string'
            },
            value: {
              something: 'wildcard',
              type:      'string'
            }
          }
        },
        notSelectors: {
          properties: {
            foo: {
              type: 'number'
            }
          },
          type:       'object'
        }
      }
    };

    const schemas = MappingToSchema(mapping, {
      validation:   {
        paths: {
          something: [
            {
              path:  'selectors.*',
              value: 'wildcard'
            }
          ]
        }
      },
      sanitization: {
        all:   {
          types: [
            'object',
            'string',
            'integer',
            'number',
            'array',
            'boolean',
            'date'
          ]
        },
        paths: {
          something: [
            {
              path:  'selectors.*',
              value: 'wildcard'
            }
          ]
        }
      }
    });

    expect(schemas.validation).to.eql(expectedSchema);
    expect(schemas.sanitization).to.eql(expectedSchema);
  });

  it('should filter down to only the paths that start with the target property', () => {
    const paths = {
      strict:   [
        {
          path:  'selectors.something',
          value: true
        },
        {
          path:  'notSelectors',
          value: true
        },
        {
          path:  'notSelectors.somethingElse',
          value: true
        }
      ],
      optional: [
        {
          path:  'selectors.something',
          value: true
        },
        {
          path:  'notSelectors',
          value: true
        },
        {
          path:  'notSelectors.somethingElse',
          value: true
        }
      ]
    };

    const expectedPicked = {
      strict:   [
        {
          path:  'selectors.something',
          value: true
        }
      ],
      optional: [
        {
          path:  'selectors.something',
          value: true
        }
      ]
    };

    const picked = MappingToSchema.__pickPaths(paths, 'selectors');

    expect(picked).to.eql(expectedPicked);
  });

  it('should allow arrays of simple objects', () => {
    const mapping = {
      properties: {
        arrayOfStrings: {
          type: 'string'
        }
      }
    };

    const expectedSchema = {
      type:       'object',
      properties: {
        arrayOfStrings: {
          type:  'array',
          items: {
            type: 'string'
          }
        }
      }
    };

    const schemas = MappingToSchema(mapping, {
      arrayPaths:   [
        'arrayOfStrings'
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
  });

  it('should apply rules to all string mappings', () => {
    const mapping = {
      properties: {
        someValue:  {
          type: 'integer'
        },
        someString: {
          type: 'string'
        },
        deeper:     {
          properties: {
            anotherString: {
              type: 'string'
            },
            aNumber:       {
              type: 'double'
            }
          }
        }
      }
    };

    const expectedSchema = {
      type:       'object',
      properties: {
        someValue:  {
          type: 'integer'
        },
        someString: {
          rules: [
            'trim',
            'lower'
          ]
        },
        deeper:     {
          type:       'object',
          properties: {
            anotherString: {
              rules: [
                'trim',
                'lower'
              ]
            },
            aNumber:       {
              type: 'number'
            }
          }
        }
      }
    };

    const schemas = MappingToSchema(mapping, {
      sanitization: {
        all: {
          types: [
            'object',
            'integer',
            'number',
            'array',
            'boolean',
            'date'
          ],
          rules: [
            'trim',
            'lower'
          ]
        }
      }
    });

    expect(schemas.sanitization).to.eql(expectedSchema);
  });
});