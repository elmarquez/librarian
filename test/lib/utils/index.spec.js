const os = require('os');
const path = require('path');
const utils = require('../../../lib/utils');

describe('lib / utils', function () {

    xdescribe('copyDir', function () {
        it('should copy a file to the destination folder', function (done) {
            expect(1).toEqual(0);
            done();
        });
        it('should recursively copy a folder to the destination folder', function (done) {
            expect(1).toEqual(0);
            done();
        });
    });

    describe('ensureFile', function () {
        it('works', function (done) {
            fail('not implemented');
        });
    });

    describe('ensureFolder', function () {
        it('works', function (done) {
            fail('not implemented');
        });
    });

    describe('getFileTreeChanges', function () {
        it('fails', function () {
            fail();
        });
    });

    describe('getFileTreeState', function () {
        it('loads the project filetree.json file into memory', function (done) {
            fail();
        });
    });

    describe('getProjectRoot', function () {
        it('rejects if the project root cannot be found', function (done) {
            const tmp = os.tmpdir();
            utils
                .getLibraryRoot(tmp)
                .then(() => fail())
                .catch(() => done());
        });
        it('returns the path to the project root directory when the project root is the current directory', function (done) {
            const root = path.join(process.cwd(), 'test', 'fixtures', 'project1');
            const project1 = path.join(root, '.doc');
            utils
                .getLibraryRoot(project1)
                .then(function (p) {
                    expect(p).toEqual(root);
                    done();
                })
                .catch((err) => fail(err));
        });
        it('returns the parent directory', function (done) {
            const root = path.join(process.cwd(), 'test', 'fixtures', 'project2');
            const project2 = path.join(root, 'dir1', 'dir2', 'dir3');
            utils
                .getLibraryRoot(project2)
                .then(function (p) {
                    expect(p).toEqual(root);
                    done();
                })
                .catch((err) => fail(err));
        });
    });

});
