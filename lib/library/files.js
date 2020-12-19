const fs = require('fs');
const { join } = require('path');
const Promise = require('bluebird');
const tinyglob = require('tiny-glob');
const utils = require('../utils');
const { Statement } = require('sqlite3');

/**
 * Determine if a file does not exist.
 * @param {string} p - File path
 * @returns {Promise|boolean}
 */
async function doesNotExist(p) {
    return await exists(p).then((e) => !e);
}

/**
 * Determine if a file exists and is readable at the given path.
 * @param {string} p - File path
 * @returns {Promise|boolean}
 */
function exists(p) {
    return new Promise(function (resolve) {
        fs.access(p, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK, function (err) {
            resolve(!err);
        });
    });
}

/**
 * Get the list of added files.
 * @param {string} cwd - Project path
 * @returns {Promise} list of file paths
 */
function getAddedFiles(db, cwd) {
    const self = this;
    return db.getDocumentIdentifiers().then(function(docs) {
        const paths = docs.reduce(function(s, d) {
            s.add(d.path);
            return s;
        }, new Set());
        return self.getFiles(cwd).filter((f) => !paths.has(f.path));
    });
}

/**
 * Get the list of deleted files.
 * @param {string} cwd - Project path
 * @returns {Promise} list of file paths
 */
async function getDeletedFiles(db, cwd) {
    return db.getDocumentIdentifiers().then(function(files) {
        const filter = (f) => exists(join(cwd, f.path)).then((e) => !e);
        return utils.asyncFilter(files, filter);
    });
}

/**
 * Get the list of files in the project path.
 * @param {string} cwd - Project path
 * @param {array} types - File type extensions
 * @returns {Promise} list of file paths
 */
function getFiles(cwd, types) {
    types = types || ['*'];
    const options = { absolute: false, cwd, filesOnly: true };
    const extensions = types.join(',');
    return tinyglob(`**/*.{${extensions}}`, options);
}

/**
 * Get list of files that have moved and where they have been moved to.
 * @param {string} cwd - Project path
 */
function getMovedFiles() {}

/**
 * Get the list of updated files.
 * @param {object} db - Database
 * @param {string} cwd - Project path
 * @param {array} types - File type extensions
 * @returns {Promise} list of file paths
 */
function getUpdatedFiles(db, cwd) {
    return getFiles(cwd).then(function(files) {
        const promises = files.map((f) => hasChanged(db, cwd, f));
        return Promise.all(promises).then(function(changes) {
            return files.filter((f, i) => changes[i]);
        });
    });
}

/**
 * Determine if the file has been changed.
 * @param {*} db - Database
 * @param {*} cwd - Project path
 * @param {*} f - File path
 */
function hasChanged(db, cwd, f) {
    return db.getDocument({ path: f }).then(function(doc) {
        if (!doc) return false;
        return new Promise(function(resolve, reject) {
            fs.stat(join(cwd, f), function (err, stat) {
                if (err) resolve(false);
                const changed = doc.lastModified !== stat.mtime.toISOString();
                resolve(doc.lastModified !== stat.mtime.toISOString());
            });
        });
    });
}

module.exports = {
    exists,
    getAddedFiles,
    getDeletedFiles,
    getFiles,
    getUpdatedFiles,
    hasChanged
};
