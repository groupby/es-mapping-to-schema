const chai   = require('chai');
const expect = chai.expect;
const _      = require('lodash');

const MappingToSchema = require('./index');

describe('es-mapping-to-schema tests', ()=> {
  it('should convert a mapping into a schema', () => {
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
          type:      'string',
          maxLength: 32766,
          rules:     ['trim']
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
          type:      'string',
          maxLength: 32766,
          rules:     ['trim']
        },
        variousTerm:            {
          type:      'string',
          maxLength: 32766,
          rules:     ['trim']
        },
        customer:               {
          type:       'object',
          properties: {
            customerId: {
              type:      'string',
              maxLength: 32766,
              rules:     ['trim']
            },
            projectId:  {
              type:      'string',
              maxLength: 32766,
              rules:     ['trim']
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
                  type:      'string',
                  maxLength: 32766,
                  rules:     ['trim']
                },
                value: {
                  type:      'string',
                  maxLength: 32766,
                  rules:     ['trim']
                }
              }
            }
          }
        }
      }
    };

    const schema = MappingToSchema(mapping);
    expect(schema).to.eql(expectedSchema);
  });

  it('should convert a mapping with an array into a schema', () => {
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
          type:      'string',
          maxLength: 32766,
          rules:     ['trim']
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
          type:      'string',
          maxLength: 32766,
          rules:     ['trim']
        },
        variousTerm:            {
          type:      'string',
          maxLength: 32766,
          rules:     ['trim']
        },
        customer:               {
          type:       'object',
          properties: {
            customerId: {
              type:      'string',
              maxLength: 32766,
              rules:     ['trim']
            },
            projectId:  {
              type:      'string',
              maxLength: 32766,
              rules:     ['trim']
            },
            localTime:  {
              type: 'date'
            }
          }
        },
        selectors:              {
          type:  'array',
          items: {
            selector: {
              type:       'object',
              properties: {
                name:  {
                  type:      'string',
                  maxLength: 32766,
                  rules:     ['trim']
                },
                value: {
                  type:      'string',
                  maxLength: 32766,
                  rules:     ['trim']
                }
              }
            }
          }
        }
      }
    };

    const schema = MappingToSchema(mapping, {arrayPaths: ['selectors']});
    expect(schema).to.eql(expectedSchema);
  });

  it('should convert a mapping into a schema with optional properties', () => {
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
          type:      'string',
          maxLength: 32766,
          rules:     ['trim']
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
          type:      'string',
          maxLength: 32766,
          rules:     ['trim']
        },
        variousTerm:            {
          type:      'string',
          maxLength: 32766,
          rules:     ['trim']
        },
        customer:               {
          type:       'object',
          optional:   true,
          properties: {
            customerId: {
              type:      'string',
              maxLength: 32766,
              rules:     ['trim']
            },
            projectId:  {
              type:      'string',
              maxLength: 32766,
              rules:     ['trim']
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
                  type:      'string',
                  maxLength: 32766,
                  rules:     ['trim']
                },
                value: {
                  type:      'string',
                  maxLength: 32766,
                  rules:     ['trim']
                }
              }
            }
          }
        }
      }
    };

    const schema = MappingToSchema(mapping, {optionalPaths: ['customer']});
    expect(schema).to.eql(expectedSchema);
  });

  it('should convert a mapping into a schema with strict properties', () => {
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
      strict:     true,
      properties: {
        booleanThing:           {
          type: 'boolean'
        },
        stringThing:            {
          type:      'string',
          maxLength: 32766,
          rules:     ['trim']
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
          type:      'string',
          maxLength: 32766,
          rules:     ['trim']
        },
        variousTerm:            {
          type:      'string',
          maxLength: 32766,
          rules:     ['trim']
        },
        customer:               {
          strict:     true,
          type:       'object',
          properties: {
            customerId: {
              type:      'string',
              maxLength: 32766,
              rules:     ['trim']
            },
            projectId:  {
              type:      'string',
              maxLength: 32766,
              rules:     ['trim']
            },
            localTime:  {
              type: 'date'
            }
          }
        },
        selectors:              {
          type:       'object',
          strict:     true,
          properties: {
            selector: {
              type:       'object',
              strict:     true,
              properties: {
                name:  {
                  type:      'string',
                  maxLength: 32766,
                  rules:     ['trim']
                },
                value: {
                  type:      'string',
                  maxLength: 32766,
                  rules:     ['trim']
                }
              }
            }
          }
        }
      }
    };

    const schema = MappingToSchema(mapping, {allStrict: true});
    expect(schema).to.eql(expectedSchema);
  });

  it('should convert a mapping into a schema with optional and strict properties', () => {
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
      strict:     true,
      properties: {
        booleanThing:           {
          type: 'boolean'
        },
        stringThing:            {
          type:      'string',
          maxLength: 32766,
          rules:     ['trim']
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
          type:      'string',
          maxLength: 32766,
          rules:     ['trim']
        },
        variousTerm:            {
          type:      'string',
          maxLength: 32766,
          rules:     ['trim']
        },
        customer:               {
          strict:     true,
          type:       'object',
          properties: {
            customerId: {
              type:      'string',
              maxLength: 32766,
              rules:     ['trim']
            },
            projectId:  {
              type:      'string',
              maxLength: 32766,
              rules:     ['trim']
            },
            localTime:  {
              type: 'date'
            }
          }
        },
        selectors:              {
          type:       'object',
          optional: true,
          properties: {
            selector: {
              type:       'object',
              strict:     true,
              properties: {
                name:  {
                  type:      'string',
                  maxLength: 32766,
                  rules:     ['trim']
                },
                value: {
                  type:      'string',
                  maxLength: 32766,
                  rules:     ['trim']
                }
              }
            }
          }
        }
      }
    };

    const schema = MappingToSchema(mapping, {optionalPaths: ['selectors'], allStrict: true});
    expect(schema).to.eql(expectedSchema);
  });
});