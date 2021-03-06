var assert = require('assert');
var should = require('should');
var sass = require('node-sass');
var path = require('path');

import sassport from '../dist/index.js';
var assertRenderSync = require('./util/assertRenderSync.js');

describe('Sassport require() function', function() {

  describe('standard usage', function() {
    var sassportModule = sassport([])
      .assets(path.join(__dirname, 'assets-test'));

    var testData = '$vars: require("simple-js-test.js"); test { color: map-get($vars, "primaryColor"); }';

    it('should pass through the converted JS object', function(done) {
      sassportModule.render({ data: testData, outputStyle: 'compressed' }, function(err, result) {
        done(assert.equal(result.css.toString(), 'test{color:#c0ff33}\n'));
      });
    });
  });

  describe('requiring submodules', function() {
    var sassportModule = sassport([])
      .assets(path.join(__dirname, 'assets-test'));

    var testData = '$font-size: require("simple-js-test", "fontSize"); test { font-size: $font-size; }';

    it('should get the specified property of the converted JS object', function(done) {
      sassportModule.render({ data: testData, outputStyle: 'compressed' }, function(err, result) {
        done(assert.equal(result.css.toString(), 'test{font-size:16px}\n'));
      });
    });
  });

  describe('requiring modules without asset specification', function() {
    var sassportModule = sassport();

    var testData = '$vars: require("test/assets-test/simple-js-test"); test { color: map-get($vars, "primaryColor"); }';

    it('should resolve the JS object from the specified path relative to the calling source', function(done) {
      assertRenderSync(
        sassportModule,
        testData,
        'test{color:#c0ff33}\n',
        done);
    });
  });

  describe('the onRequire() hook', () => {
    let counter = 0;

    let sassportModule = sassport([], {
      onRequire: (filePath) => {
        counter++;

        return require(filePath);
      }
    });


    let testData = `
      $vars: require('test/assets-test/simple-js-test');
      $vars-2: require('test/assets-test/simple-js-test');

      test { color: map-get($vars, "primaryColor"); }
    `;

    it('should execute the onRequire() hook when requiring files in a Sass file', (done) => {
      sassportModule.render({
        data: testData,
        outputStyle: 'compressed'
      }, (err, res) => {
        assert.equal(res.css.toString(), `test{color:#c0ff33}\n`);
        done(assert.equal(counter, 2));
      });
    });
  })
});