const findUp = require('find-up');
const fs = require('fs');
const fsutils = require('nodejs-fs-utils');
const log = require('log-symbols');
const path = require('path');
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
 * Ensure that a file exists.
 * @param {string} p - Path
 * @return {Promise}
 */
function ensureFile(p) {
    return pathExists(p).then(function(exists) {
        if (exists) {
            return p;
        } else {
            return writeFile(p, '').then(function() {
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
            fs.mkdir(p, { recursive: true}, function(err) {
                return p;
            });
        }
    });
}

/**
 * Get file stats.
 * @param {string} fp - File path
 * @returns {Promise}
 */
function getFileStats(fp) {
    return new Promise(function(resolve, reject) {
        fs.stat(fp, async function(err, stats) {
            if (err) reject(err);
            resolve(stats);
        });
    });
}

/**
 * Traverse the directory's parent folders to find the library's root folder.
 * Rejects if the root directory can not be found.
 * @param {string} p - Library subdirectory path
 * @returns {Promise|string}
 */
function getLibraryRoot(p) {
    const match = async (d) => {
        const found = await findUp.exists(path.join(d, '.doc'));
        return found && d;
    }
    return findUp(match, {cwd: p, type: 'directory'}).then(function(p) {
        return p ? p : Promise.reject('Library root directory not found');
    });
}

/**
 * Determine if a path contains a subdirectory with the specified name.
 * @param {string} p - Directory
 * @param {string} name - Subdirectories
 * @return {Promise}
 */
function hasSubdirectory(p, name) {
    const dir = path.join(p, name);
    return pathExists(dir);
}

/**
 * A function that does nothing.
 */
function noop() {}

/**
 * Determine if the path exists, is both readable and writeable by the current
 * user.
 * @param {string} p - Path
 * @returns {Promise}
 */
function pathExists(p) {
    return new Promise(function(resolve) {
        const attr = fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK;
        fs.access(p, attr, (err) => resolve(err === null));
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
function removeFile(p) {
    return new Promise(function(resolve, reject) {
       fs.unlink(p, function(err) {
          if (err) {
              reject(err);
          } else {
              resolve();
          }
       });
    });
}

/**
 * Walk file system path
 * @param {string} src
 */
function walk(src) {
    return new Promise(function(resolve, reject) {
        let files = [];
        fsutils.walk(src, { skipErrors: true }, function (err, p, stats, next, cache) {
            if (!stats.isDirectory) {
                files.push(p);
            }
            next();
        }, function (cache) {
            resolve(files);
        });
    });
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
    getFileStats,
    getLibraryRoot,
    noop,
    pathExists,
    readFile,
    removeFile,
    walk,
    writeFile
};
