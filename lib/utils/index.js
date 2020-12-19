const fs = require('fs');
const fsutils = require('nodejs-fs-utils');
const log = require('log-symbols');
const Promise = require('bluebird');

/**
 * Filter an array asynchronously.
 * @param {Array} arr - Input array
 * @param {Function} predicate - Asynchronous filter function
 */
function asyncFilter (arr, predicate) {
    const promises = arr.map(predicate);
    return Promise.all(promises).then((results) => arr.filter((_v, index) => results[index]));
}

/**
 * Copy file or folders.
 * @param {string} src - Source path
 * @param {string} dest - Destination path
 * @returns {Promise}
 */
function copyDir(src, dest) {
    return new Promise(function(resolve, reject) {
        fsutils.copySync(src, dest, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Create file system folder.
 * @param {string} p - Path
 * @returns {Promise}
 */
function createFolder(p) {
    return new Promise(function(resolve, reject) {
        fs.mkdir(p, { recursive: true}, function(err) {
            if (err) {
                return reject(err);
            }
            return resolve(p);
        });
    });
}

/**
 * Ensure that a file exists.
 * @param {string} p - Path
 * @return {Promise}
 */
function ensureFile(p, data) {
    return pathExists(p).then(function(exists) {
        if (exists) {
            return p;
        } else {
            console.info(log.info, 'Creating file', p);
            return writeFile(p, data).then(function() {
                return p;
            });
        }
    });
}

/**
 * Ensure that a folder exists.
 * @param {string} p - Path
 * @return {Promise}
 */
function ensureFolder(p) {
    return pathExists(p).then(function(exists) {
        if (exists) {
            return p;
        } else {
            console.info(log.info, 'Creating folder', p);
            return createFolder(p);
        }
    });
}

/**
 * A function that does nothing.
 */
function noop() {}

/**
 * Parse JSON object.
 * @param {string} data - Data
 * @returns {Promise|any}
 */
function parseJSON(data) {
    try {
        return JSON.parse(data);
    } catch (err) {
        return Promise.reject(err);
    }
}

/**
 * Determine if the path exists, is both readable and writeable by the current
 * user.
 * @param {string} p - Path
 * @returns {Promise}
 */
function pathExists(p, rejectOnError=false) {
    return new Promise(function(resolve, reject) {
        const attr = fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK;
        fs.access(p, attr, function(err) {
            if (err !== null && rejectOnError) {
                reject(`File does not exist ${p}`);
            } else if (err !== null) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

/**
 * Read text file.
 * @param {string} p - Path
 * @returns {Promise}
 */
function readFile(p) {
    return new Promise(function(resolve, reject) {
        fs.readFile(p, 'utf8', function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

/**
 * Remove file.
 * @param {string} p - File path
 * @returns {Promise}
 */
function removeFile(p, rejectOnError=true) {
    return new Promise(function(resolve, reject) {
       fs.unlink(p, function(err) {
          if (err && rejectOnError) {
              reject(err);
          } else {
              resolve();
          }
       });
    });
}

/**
 * Remove folder and contents.
 * @param {string} p - Folder path
 * @returns {Promise}
 */
function removeFolder(p) {
    return new Promise(function(resolve, reject) {
        fsUtils.rmdirs("test/folder", function (err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

/**
 * Transform object to JSON string.
 * @param {object} data - Data
 * @returns {Promise|*}
 */
function stringify(data) {
    try {
        const json = JSON.stringify(data, null, 4);
        return Promise.resolve(json);
    } catch (err) {
        return Promise.reject(err);
    }
}

/**
 * Write text file.
 * @param {string} p - Path
 * @param {string} data - Data
 * @returns {Promise}
 */
function writeFile(p, data) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(p, data, 'utf8', function(err) {
           if (err) reject(err);
           resolve();
        });
    });
}

module.exports = {
    asyncFilter,
    copyDir,
    ensureFile,
    ensureFolder,
    noop,
    parseJSON,
    pathExists,
    readFile,
    removeFile,
    removeFolder,
    stringify,
    writeFile
};
