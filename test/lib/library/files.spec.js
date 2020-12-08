const Promise = require('bluebird');
const { expect } = require('chai');
const files = require('../../../lib/library/files');
const fs = require('fs');
const os = require('os');
const { join, sep } = require('path');
const { copyDir } = require('../../../lib/utils');

describe('lib / library / files', function() {

    const fixtures = join(process.cwd(), 'test', 'fixtures');
    const state1 = join(fixtures, 'state1');
    const state2 = join(fixtures, 'state2');

    describe('exists', function() {

        it('returns true if the file exists and can be read', function(done) {
            const p = join(fixtures, 'state1', 'test1.pdf');
            files
                .exists(p)
                .then(function (e) {
                    expect(e).to.be.true;
                    done();
                })
                .catch(function (err) {
                    fail(err);
                });
        });

        it('returns false if the file does not exist', function(done) {
            const p = join(fixtures, 'state1', 'does-not-exist.md');
            files
                .exists(p)
                .then(function (e) {
                    expect(e).to.be.false;
                    done();
                })
                .catch(function (err) {
                    fail(err);
                });
        });

        xit('returns false if the file can not be read', function(done) {
            fail();
        });
    });

    describe('getAddedFiles', function() {
        const afterState = [
            { path: 'test1.pdf', hash: '1' },
            { path: 'test2.pdf', hash: '1' },
            { path: 'test3.pdf', hash: '1' }
        ];
        const beforeState = [
            { path: 'test1.pdf', hash: '1' },
            { path: 'test2.pdf', hash: '1' },
        ];
        let tmp = null;

        beforeEach(function(done) {
            fs.mkdtemp(`${os.tmpdir()}${sep}test-`, function(err, dtemp) {
                if (err) throw new Error(err);
                tmp = dtemp;
                copyDir(state1, tmp).then(() => done()).catch(fail);
            });
        });

        it('returns the list of added files', function(done) {
            const db = {
                connect: () => Promise.resolve(),
                getDocumentIdentifiers: () => Promise.resolve(beforeState),
            };
            spyOn(files, 'getFiles').and.returnValue(Promise.resolve(afterState));
            db.connect()
                .then(() => files.getAddedFiles(db, tmp))
                .then(function(addedFiles) {
                    expect(Array.isArray(addedFiles)).to.be.true;
                    expect(addedFiles.length).to.equal(1);
                    expect(addedFiles[0]).to.deep.equal(afterState[2]);
                    done();
                })
                .catch(fail);
        });
    });

    describe('getDeletedFiles', function() {
        const afterState = [
            { path: 'test3.pdf', hash: '1' }
        ];
        const beforeState = [
            { path: 'test1.pdf', hash: '1' },
            { path: 'test2.pdf', hash: '1' },
            { path: 'test3.pdf', hash: '1' }
        ];
        let tmp = null;

        beforeEach(function(done) {
            fs.mkdtemp(`${os.tmpdir()}${sep}test-`, function(err, dtemp) {
                if (err) throw new Error(err);
                tmp = dtemp;
                copyDir(state2, tmp).then(() => done()).catch((err) => fail(err));
            });
        });

        it('returns the list of deleted files', function(done) {
            const db = {
                connect: () => Promise.resolve(),
                getDocumentIdentifiers: () => Promise.resolve(beforeState),
            };
            files
                .getDeletedFiles(db, tmp)
                .then(function(deletedFiles) {
                    expect(deletedFiles).to.deep.equal(afterState);
                    expect(deletedFiles.length).to.equal(1);
                    expect(deletedFiles[0]).to.deep.equal(afterState[0]);
                    done();
                })
                .catch(fail);
        });
    });

    describe('getFiles', function() {
        const result = [ 'test1.pdf', 'test2.pdf', 'test3.pdf' ];
        let tmp = null;

        beforeEach(function(done) {
            fs.mkdtemp(`${os.tmpdir()}${sep}test-`, function(err, dtemp) {
                if (err) throw new Error(err);
                tmp = dtemp;
                copyDir(state1, tmp).then(() => done()).catch((err) => fail(err));
            });
        });

        it('get the list of files in a directory', function(done) {
            files.getFiles(tmp).then(function(files) {
                    expect(files).to.deep.equal(result);
                    done();
                })
                .catch(fail);
        });
    });

    describe('getUpdatedFiles', function() {
        const docs = [
            { path: 'test1.pdf', hash: 'abcdef', lastModified: '1997-01-01T01:01:01.000Z' },
            { path: 'test2.pdf', hash: 'abcdef', lastModified: '1997-01-01T01:01:01.000Z' },
            { path: 'test3.pdf', hash: 'abcdef', lastModified: '1997-01-01T01:01:01.000Z' },
            { path: 'test4.pdf', hash: 'abcdef', lastModified: '1997-01-01T01:01:01.000Z' },
        ];
        let tmp = null;

        beforeEach(function(done) {
            fs.mkdtemp(`${os.tmpdir()}${sep}test-`, function(err, dtemp) {
                if (err) throw new Error(err);
                tmp = dtemp;
                copyDir(state1, tmp).then(() => done()).catch((err) => fail(err));
            });
        });
        it('get the list of files that have changed', function(done) {
            const db = {
                getDocument: function(f) {
                    const doc = docs.reduce(function (dd, d) {
                        return f.path === d.path ? d : dd;
                    }, null);
                    return Promise.resolve(doc);
                },
                getFiles: () => Promise.resolve(docs),
            };
            files.getUpdatedFiles(db, tmp).then(function(updated) {
                expect(Array.isArray(updated)).to.be.true;
                expect(updated.length).to.equal(docs.length - 1);
                done();
            })
            .catch(fail);
        }, 20000000);
    });

});
