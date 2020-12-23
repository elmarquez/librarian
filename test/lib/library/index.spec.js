const { expect } = require('chai');
const { DATABASE_FILENAME } = require('../../../lib/constants');
const db = require('../../../lib/database');
const fs = require('fs');
const fsutils = require('nodejs-fs-utils');
const os = require('os');
const { join, sep } = require('path');
const library = require('../../../lib');

describe('lib / library', function() {

    const fixtures = join(process.cwd(), 'test', 'fixtures');
    const state1 = join(fixtures, 'state1');
    const state2 = join(fixtures, 'state2');

    let tmp = null;

    beforeEach(function(done) {
        fs.mkdtemp(`${os.tmpdir()}${sep}test-`, function(err, dtemp) {
            if (err) throw new Error(err);
            tmp = dtemp;
            done();
        });
    });

    xdescribe('info', function() {
        it('gets the list of all files in the directory', function() {
            fail();
        });
        it('gets the list of all files in the directory by extension', function() {
            fail();
        });
        it('gets the list of all files that have been deleted', function () {
            fail();
        });
        it('gets the list of all files that have changed content', function() {
            fail();
        });
        it('gets the list of all files that have changed location', function() {
            fail();
        });
    });

    xdescribe('update', function() {
        beforeEach(function(done) {
            fsutils.copy(state1, tmp, function (err) {
                if (err) console.error(err);
                done();
            });
        });
        it('updates the file index', function(done) {
            const args = { path: tmp, database: join(tmp, DATABASE_FILENAME) };
            library
                .update(args)
                .then(function() {
                    done();
                })
                .catch(function(err) {
                    fail(err);
                });
        });
    });

    xdescribe('updateFile', function() {
        it('gets the list of all files that have changed location', function() {
            fail();
        });
    });

});
