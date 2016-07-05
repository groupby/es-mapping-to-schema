const chai   = require('chai');
const expect = chai.expect;
const _      = require('lodash');

const MappingToSchema = require('./index');

describe('es-mapping-to-schema tests', ()=> {
  it('should convert a mapping into a schema', () => {
    const mapping = {
      "_all":       {
        "enabled": false
      },
      "properties": {
        "eventType": {
          "type": "string"
        },
        "customer":  {
          "properties": {
            "customerId": {
              "type":  "string",
              "index": "not_analyzed"
            },
            "projectId":  {
              "type":  "string",
              "index": "not_analyzed"
            }
          }
        },
        "search":    {
          "properties": {
            "totalRecordCount": {
              "type": "integer"
            },
            "recordEnd":        {
              "type": "integer"
            },
            "recordStart":      {
              "type": "integer"
            },
            "refinements":      {
              "type":              "nested",
              "include_in_parent": true,
              "properties":        {
                "refinement": {
                  "properties": {
                    "name":  {
                      "type":   "string",
                      "fields": {
                        "raw":        {
                          "type":  "string",
                          "index": "not_analyzed",
                          "store": true
                        },
                        "normalized": {
                          "type":     "string",
                          "analyzer": "facet_analyzer"
                        }
                      }
                    },
                    "value": {
                      "type":   "string",
                      "fields": {
                        "raw": {
                          "type":  "string",
                          "index": "not_analyzed",
                          "store": true
                        }
                      }
                    }
                  }
                }
              }
            },
            "searchTerm":       {
              "type":   "string",
              "fields": {
                "raw":         {
                  "type":  "string",
                  "index": "not_analyzed",
                  "store": true
                },
                "normalized":  {
                  "type":     "string",
                  "analyzer": "facet_analyzer"
                },
                "lang_en":     {
                  "type":     "string",
                  "analyzer": "english"
                },
                "lang_en_raw": {
                  "type":     "string",
                  "analyzer": "raw_diacritic_free"
                }
              }
            }
          }
        },
        "visit":     {
          "properties": {
            "visitorId":       {
              "type":  "string",
              "index": "not_analyzed"
            },
            "sessionId":       {
              "type":  "string",
              "index": "not_analyzed"
            },
            "sessionCookieId": {
              "type":  "string",
              "index": "not_analyzed"
            },
            "site":            {
              "type":  "string",
              "index": "not_analyzed"
            },
            "referer":         {
              "type":  "string",
              "index": "not_analyzed"
            },
            "serverTime":      {
              "type":   "date",
              "format": "dateOptionalTime"
            },
            "localTime":       {
              "type":   "date",
              "format": "dateOptionalTime"
            },
            "@timestamp":      {
              "type":   "date",
              "format": "dateOptionalTime"
            },
            "timezoneOffset":  {
              "type": "long"
            },
            "text":            {
              "type": "string"
            }
          }
        }
      }
    };

    const expectedSchema = {
      "type":       "object",
      "properties": {
        "eventType": {
          "type": "string",
          "maxLength": 32766
        },
        "customer":  {
          "type":       "object",
          "properties": {
            "customerId": {
              "type": "string",
              "maxLength": 32766
            },
            "projectId":  {
              "type": "string",
              "maxLength": 32766
            }
          }
        },
        "search":    {
          "type":       "object",
          "properties": {
            "totalRecordCount": {
              "type": "integer"
            },
            "recordEnd":        {
              "type": "integer"
            },
            "recordStart":      {
              "type": "integer"
            },
            "refinements":      {
              "type":       "object",
              "properties": {
                "refinement": {
                  "type":       "object",
                  "properties": {
                    "name":  {
                      "type": "string",
                      "maxLength": 32766
                    },
                    "value": {
                      "type": "string",
                      "maxLength": 32766
                    }
                  }
                }
              }
            },
            "searchTerm":       {
              "type": "string",
              "maxLength": 32766
            }
          }
        },
        "visit":     {
          "type":       "object",
          "properties": {
            "visitorId":       {
              "type": "string",
              "maxLength": 32766
            },
            "sessionId":       {
              "type": "string",
              "maxLength": 32766
            },
            "sessionCookieId": {
              "type": "string",
              "maxLength": 32766
            },
            "site":            {
              "type": "string",
              "maxLength": 32766
            },
            "referer":         {
              "type": "string",
              "maxLength": 32766
            },
            "serverTime":      {
              "type": "date"
            },
            "localTime":       {
              "type": "date"
            },
            "@timestamp":      {
              "type": "date"
            },
            "timezoneOffset":  {
              "type": "integer"
            },
            "text":            {
              "type": "string",
              "maxLength": 32766
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
      "_all":       {
        "enabled": false
      },
      "properties": {
        "eventType": {
          "type": "string"
        },
        "customer":  {
          "properties": {
            "customerId": {
              "type":  "string",
              "index": "not_analyzed"
            },
            "projectId":  {
              "type":  "string",
              "index": "not_analyzed"
            }
          }
        },
        "search":    {
          "properties": {
            "totalRecordCount": {
              "type": "integer"
            },
            "recordEnd":        {
              "type": "integer"
            },
            "recordStart":      {
              "type": "integer"
            },
            "refinements":      {
              "type":              "nested",
              "include_in_parent": true,
              "properties":        {
                "refinement": {
                  "properties": {
                    "name":  {
                      "type":   "string",
                      "fields": {
                        "raw":        {
                          "type":  "string",
                          "index": "not_analyzed",
                          "store": true
                        },
                        "normalized": {
                          "type":     "string",
                          "analyzer": "facet_analyzer"
                        }
                      }
                    },
                    "value": {
                      "type":   "string",
                      "fields": {
                        "raw": {
                          "type":  "string",
                          "index": "not_analyzed",
                          "store": true
                        }
                      }
                    }
                  }
                }
              }
            },
            "searchTerm":       {
              "type":   "string",
              "fields": {
                "raw":         {
                  "type":  "string",
                  "index": "not_analyzed",
                  "store": true
                },
                "normalized":  {
                  "type":     "string",
                  "analyzer": "facet_analyzer"
                },
                "lang_en":     {
                  "type":     "string",
                  "analyzer": "english"
                },
                "lang_en_raw": {
                  "type":     "string",
                  "analyzer": "raw_diacritic_free"
                }
              }
            }
          }
        },
        "visit":     {
          "properties": {
            "visitorId":       {
              "type":  "string",
              "index": "not_analyzed"
            },
            "sessionId":       {
              "type":  "string",
              "index": "not_analyzed"
            },
            "sessionCookieId": {
              "type":  "string",
              "index": "not_analyzed"
            },
            "site":            {
              "type":  "string",
              "index": "not_analyzed"
            },
            "referer":         {
              "type":  "string",
              "index": "not_analyzed"
            },
            "serverTime":      {
              "type":   "date",
              "format": "dateOptionalTime"
            },
            "localTime":       {
              "type":   "date",
              "format": "dateOptionalTime"
            },
            "@timestamp":      {
              "type":   "date",
              "format": "dateOptionalTime"
            },
            "timezoneOffset":  {
              "type": "long"
            },
            "text":            {
              "type": "string"
            }
          }
        }
      }
    };

    const expectedSchema = {
      "type":       "object",
      "properties": {
        "eventType": {
          "type": "string",
          "maxLength": 32766
        },
        "customer":  {
          "type":       "object",
          "properties": {
            "customerId": {
              "type": "string",
              "maxLength": 32766
            },
            "projectId":  {
              "type": "string",
              "maxLength": 32766
            }
          }
        },
        "search":    {
          "type":       "object",
          "properties": {
            "totalRecordCount": {
              "type": "integer"
            },
            "recordEnd":        {
              "type": "integer"
            },
            "recordStart":      {
              "type": "integer"
            },
            "refinements":      {
              "type":  "array",
              "items": {
                "refinement": {
                  "type":       "object",
                  "properties": {
                    "name":  {
                      "type": "string",
                      "maxLength": 32766
                    },
                    "value": {
                      "type": "string",
                      "maxLength": 32766
                    }
                  }
                }
              }
            },
            "searchTerm":       {
              "type": "string"
            }
          }
        },
        "visit":     {
          "type":       "object",
          "properties": {
            "visitorId":       {
              "type": "string",
              "maxLength": 32766
            },
            "sessionId":       {
              "type": "string",
              "maxLength": 32766
            },
            "sessionCookieId": {
              "type": "string",
              "maxLength": 32766
            },
            "site":            {
              "type": "string",
              "maxLength": 32766
            },
            "referer":         {
              "type": "string",
              "maxLength": 32766
            },
            "serverTime":      {
              "type": "date"
            },
            "localTime":       {
              "type": "date"
            },
            "@timestamp":      {
              "type": "date"
            },
            "timezoneOffset":  {
              "type": "integer"
            },
            "text":            {
              "type": "string",
              "maxLength": 32766
            }
          }
        }
      }
    };

    const schema = MappingToSchema(mapping, ['search.refinements']);
    expect(schema).to.eql(expectedSchema);
  });

  it('should convert a mapping into a schema with optional properties', () => {
    const mapping = {
      "_all":       {
        "enabled": false
      },
      "properties": {
        "eventType": {
          "type": "string"
        },
        "customer":  {
          "properties": {
            "customerId": {
              "type":  "string",
              "index": "not_analyzed"
            },
            "projectId":  {
              "type":  "string",
              "index": "not_analyzed"
            }
          }
        },
        "search":    {
          "properties": {
            "totalRecordCount": {
              "type": "integer"
            },
            "recordEnd":        {
              "type": "integer"
            },
            "recordStart":      {
              "type": "integer"
            },
            "refinements":      {
              "type":              "nested",
              "include_in_parent": true,
              "properties":        {
                "refinement": {
                  "properties": {
                    "name":  {
                      "type":   "string",
                      "fields": {
                        "raw":        {
                          "type":  "string",
                          "index": "not_analyzed",
                          "store": true
                        },
                        "normalized": {
                          "type":     "string",
                          "analyzer": "facet_analyzer"
                        }
                      }
                    },
                    "value": {
                      "type":   "string",
                      "fields": {
                        "raw": {
                          "type":  "string",
                          "index": "not_analyzed",
                          "store": true
                        }
                      }
                    }
                  }
                }
              }
            },
            "searchTerm":       {
              "type":   "string",
              "fields": {
                "raw":         {
                  "type":  "string",
                  "index": "not_analyzed",
                  "store": true
                },
                "normalized":  {
                  "type":     "string",
                  "analyzer": "facet_analyzer"
                },
                "lang_en":     {
                  "type":     "string",
                  "analyzer": "english"
                },
                "lang_en_raw": {
                  "type":     "string",
                  "analyzer": "raw_diacritic_free"
                }
              }
            }
          }
        },
        "visit":     {
          "properties": {
            "visitorId":       {
              "type":  "string",
              "index": "not_analyzed"
            },
            "sessionId":       {
              "type":  "string",
              "index": "not_analyzed"
            },
            "sessionCookieId": {
              "type":  "string",
              "index": "not_analyzed"
            },
            "site":            {
              "type":  "string",
              "index": "not_analyzed"
            },
            "referer":         {
              "type":  "string",
              "index": "not_analyzed"
            },
            "serverTime":      {
              "type":   "date",
              "format": "dateOptionalTime"
            },
            "localTime":       {
              "type":   "date",
              "format": "dateOptionalTime"
            },
            "@timestamp":      {
              "type":   "date",
              "format": "dateOptionalTime"
            },
            "timezoneOffset":  {
              "type": "long"
            },
            "text":            {
              "type": "string"
            }
          }
        }
      }
    };

    const expectedSchema = {
      "type":       "object",
      "properties": {
        "eventType": {
          "type": "string",
          "maxLength": 32766
        },
        "customer":  {
          "type":       "object",
          "properties": {
            "customerId": {
              "type": "string",
              "maxLength": 32766
            },
            "projectId":  {
              "type": "string",
              "maxLength": 32766
            }
          }
        },
        "search":    {
          "type":       "object",
          "properties": {
            "totalRecordCount": {
              "type": "integer"
            },
            "recordEnd":        {
              "optional": true,
              "type":     "integer"
            },
            "recordStart":      {
              "type": "integer"
            },
            "refinements":      {
              "type":       "object",
              "properties": {
                "refinement": {
                  "type":       "object",
                  "properties": {
                    "name":  {
                      "type": "string",
                      "maxLength": 32766
                    },
                    "value": {
                      "type": "string",
                      "maxLength": 32766
                    }
                  }
                }
              }
            },
            "searchTerm":       {
              "type": "string",
              "maxLength": 32766
            }
          }
        },
        "visit":     {
          "type":       "object",
          "properties": {
            "visitorId":       {
              "type": "string"
            },
            "sessionId":       {
              "type": "string",
              "maxLength": 32766
            },
            "sessionCookieId": {
              "type": "string",
              "maxLength": 32766
            },
            "site":            {
              "type": "string",
              "maxLength": 32766
            },
            "referer":         {
              "type": "string",
              "maxLength": 32766
            },
            "serverTime":      {
              "type": "date",
              "maxLength": 32766
            },
            "localTime":       {
              "type": "date"
            },
            "@timestamp":      {
              "type": "date"
            },
            "timezoneOffset":  {
              "type": "integer"
            },
            "text":            {
              "type": "string",
              "maxLength": 32766
            }
          }
        }
      }
    };

    const schema = MappingToSchema(mapping, null, ['search.recordEnd']);
    expect(schema).to.eql(expectedSchema);
  });
});