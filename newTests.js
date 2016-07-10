const chai   = require('chai');
const expect = chai.expect;
const _      = require('lodash');

const MappingToSchema = require('./index');

describe('es-mapping-to-schema tests', ()=> {
  it('should shorten all paths by one level', () => {
    const paths = {
      def: [
        {
          path: 'something.yo.this',
          value: true
        },
        {
          path: 'something.alkf.asfd',
          value: 'ddd'
        },
        {
          path: 'gone',
          value: 'asfdsd'
        }
      ],
      optional: [
        {
          path: 'other.that.wer',
          value: 2393
        }
      ]
    };

    const shortenedPaths = MappingToSchema.__nextPaths(paths);

    expect(shortenedPaths).to.eql({
      def: [
        {
          path: 'yo.this',
          value: true
        },
        {
          path: 'alkf.asfd',
          value: 'ddd'
        }
      ],
      optional: [
        {
          path: 'that.wer',
          value: 2393
        }
      ]
    });
  });

  it('should return the options applicable to a specific field', ()=>{
    const paths = {
      def: [
        {
          path: 'something.yo.this',
          value: true
        },
        {
          path: 'onTarget',
          value: 'asfdsd'
        }
      ],
      optional: [
        {
          path: 'onTarget',
          value: 2393
        }
      ]
    };

    const localOptions = MappingToSchema.__getLocalOptions(paths, 'onTarget');

    expect(localOptions).to.eql({
      def: 'asfdsd',
      optional: 2393
    });
  });
});