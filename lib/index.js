const config = require('./config');
const constants = require('./constants');
const fs = require('fs');
const files = require('./library/files');
const log = require('log-symbols');
const {join } = require('path');
const utils = require('./utils');

const DEFAULT_FILE_TYPES = ['gif','jpeg','jpg','pdf','png','tif','tiff'];

/**
 * Get file information.
 * @param {object} argv - Command arguments
 */
function info(args) {
    console.info('info', args);
}

/**
 * Initialize the document index.
 * @param {object} argv - Command arguments
 */
function init(argv) {
    return utils
        .ensureFolder(argv.path)
        .then(utils.ensureFolder(join(argv.path, constants.DEFAULT_CONFIG_FOLDER)))
        .then(() => console.info(log.success, 'Initialized library directory', argv.path));
}

/**
 * Purge library index.
 * @param {object} argv - Command arguments
 * @returns {Promise}
 */
function purge(argv) {
    const db = join(argv.path, constants.DEFAULT_CONFIG_FOLDER, constants.DEFAULT_DATABASE_FILENAME);
    return utils
        .pathExists(db)
        .then((e) => e ? utils.removeFile(db) : Promise.resolve())
        .then(() => console.info(log.success, 'Purged library index'));
}

/**
 * Update the document index.
 * @param {object} args - Command arguments
 */
function update(args) {
    const self = this;
    // load configuration
    // get previous file tree, or walk tree to create new file tree and then persist it
    // find diff
    const p = args.path;
    return files
        .getFiles(p, constants.DEFAULT_FILE_TYPES)
        .then(function (docs) {
            const promises = docs.map(function(f) {
                console.info('f', f);
                let doc = {
                    name: f.name,
                    ext: 'txt',
                    path: f,
                    createdDate: new Date(),
                    modifiedDate: new Date(),
                    size: 1,
                    tags: [],
                    text: []
                };
                idx.addDoc(doc);
            });
            return Promise.all(promises).then(() => docs.length);
        })
        .then(function(count) {
            const data = JSON.stringify(idx);
            return utils.writeFile(data);
        })
        .then(function() {
            return {
                added: -1,
                count,
                moved: -1,
                removed: -1,
                updated: -1
            };
        });
}

module.exports = {
    constants,
    info,
    init,
    purge,
    update
};
