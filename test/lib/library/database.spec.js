const { expect } = require('chai');
const Database = require('../../../lib/database');
const fs = require('fs');
const fsutils = require('nodejs-fs-utils');
const os = require('os');
const { join, sep } = require('path');

xdescribe('lib / library / database ', function() {

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

    describe('constructor', function() {
        it('returns a database instance', function() {
            const db = new Database(tmp);
            expect(db).to.have.property('close');
            expect(db).to.have.property('connect');
        });
    });

    describe('connect', function() {
        it('creates a connection to the database', function(done) {
            const db = new Database(tmp);
            const conn1 = db.getConnection();
            expect(conn1).to.be.null;
            db.connect().then(function() {
                const conn2 = db.getConnection();
                expect(conn2).to.not.be.null;
                expect(conn2).to.exist;
                done();
            })
            .catch(fail);
        });
    });

    describe('getConnection', function() {
        it('returns null if a connection has not yet been established', function() {
            const db = new Database(tmp);
            const c = db.getConnection();
            expect(c).to.not.exist;
        });
        it('gets the database connection object', function(done) {
            const db = new Database(tmp);
            db.connect().then(function() {
                const c = db.getConnection();
                expect(c).to.exist;
                expect(c).to.have.property('close');
                expect(c).to.have.property('models');
                done();
            });
        });
    });

    describe('getDocuments', function() {
        it('returns the list of file paths, hashes in the current index', function(done) {
            const db = new Database(tmp);
            db.connect()
                .then(function() {
                    return db.getDocuments();
                })
                .then(function(docs) {
                    expect(Array.isArray(docs)).to.be.true;
                    done();
                })
                .catch(fail);
            });
    });

    describe('getDocumentIdentifiers', function() {
        it('returns a promise', function(done) {
            const db = new Database(tmp);
            const promise = db.connect().then(() => db.getDocumentIdentifiers());
            expect(promise).to.have.property('then');
            done();
        });
        it('returns a list with document path, hash for each entry', function(done) {
            const db = new Database(tmp);
            db.connect().then(function() {
                return db.getDocumentIdentifiers();
            })
            .then(function(files) {
                expect(Array.isArray(files)).to.be.true;
                done();
            })
            .catch(fail);
        });
    });

    describe('getProjectPath', function() {
        it('gets the database file path', function() {
            const db = new Database(tmp);
            const p = db.getProjectPath();
            expect(p).to.equal(tmp);
        });
    });

    describe('hasDocumentPaths', function() {
        it('returns a promise', function(done) {
            const db = new Database(tmp);
            const promise = db.connect().then(() => db.getDocumentIdentifiers());
            expect(promise).to.have.property('then');
            done();
        });
        it('returns an array of true, false values', function(done) {
            const db = new Database(tmp);
            db.connect().then(() => db.getDocumentIdentifiers()).then(function(matches) {
                expect(Array.isArray(matches)).to.be.true;
                for (let i = 0; i < matches.length; i++) {
                    const m = matches[i];
                    expect(typeof m).to.equal("boolean");
                }
                done();
            })
            .catch(fail);
        });
    });

    describe('purge', function() {
        beforeEach(function(done) {
            fsutils.copy(state1, tmp, function (err) {
                if (err) console.error(err);
                done();
            });
        });
        it('returns a promise', function(done) {
            const db = new Database(tmp);
            const promise = db.connect().then(() => db.purge());
            expect(promise).to.have.property('then');
            done();
        });
        it('clears all contents from the database', function(done) {
            const db = new Database(tmp);
            db.connect().then(() => db.purge()).then(function() {
                    // TODO confirm that all tables have been dropped
                    done();
                })
                .catch(fail);
        }, 10000);
    });

});
