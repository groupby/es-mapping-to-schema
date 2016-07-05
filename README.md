## Elasticsearch Mapping to Schema Inspector schema

This allows you to convert an [elasticsearch mapping](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html), defined in JSON
into a schema that works with [Schema Inspector](http://atinux.github.io/schema-inspector/).

### Install:
```javascript
npm install --save es-mapping-to-schema
```

### Use:
```javascript
const MappingToSchema = require('es-mapping-to-schema');

const mapping = {
      _all:       {
        enabled: false
      },
      properties: {
        longThing:              {
          type: 'long'
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
    
const schema = MappingToSchema(mapping);

const expectedSchema = {
     type:       'object',
     properties: {
       longThing:              {
         type: 'integer'
       },
       doubleThing:            {
         type: 'number'
       },
       nonanalyzedStringThing: {
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
   
schema === expectedSchema; // true
```

Also supports specifying the optional and array properties, see tests for details.