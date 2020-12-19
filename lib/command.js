const config = require('./library/config');
const constants = require('./constants');
const lib = require('./index');
const log = require('log-symbols');
const { join } = require('path');
const utils = require('./utils');

/**
 * Get file information.
 * @param {object} argv - Command arguments
 */
function info(argv) {
    console.info('info', argv);
}

/**
 * Initialize the document index.
 * @param {object} argv - Command arguments
 */
function init(argv) {
    const cfg = join(argv.path, constants.CONFIG_FOLDER);
    return utils
        .ensureFolder(argv.path)
        .then(() => utils.ensureFolder(cfg))
        .then(function() {
            return Promise.all([
                utils.stringify(constants.DEFAULT_CONFIG_FILE),
                utils.stringify(constants.DEFAULT_TREE_INDEX)
            ]);
        })
        .then(function (data) {
            const config = join(cfg, constants.CONFIG_FILE);
            const tree = join(cfg, constants.FILE_TREE_INDEX);
            return Promise.all([
                utils.ensureFile(config, data[0]),
                utils.ensureFile(tree, data[1])
            ])
        })
        .then(() => console.info(log.success, 'Initialized library directory', argv.path));
}

/**
 * Purge library index.
 * @param {object} argv - Command arguments
 * @returns {Promise}
 */
function purge(argv) {
    // TODO remove folder then remake it
    const db = join(argv.path, constants.CONFIG_FOLDER, constants.DATABASE_FILENAME);
    return utils
        .pathExists(db)
        .then((e) => e ? utils.removeFile(db) : Promise.resolve())
        .then(() => console.info(log.success, 'Purged library index'));
}

/**
 * Search for files.
 * @param {object} argv - Command arguments
 * @returns {Promise}
 */
function search(argv) {
    throw new Error('not implemented');
}

/**
 * Update the document index.
 * @param {object} argv - Command arguments
 */
function update(argv) {
    return config
        .load(argv.path)
        .then((cfg) => lib.getLibraryRoot(argv.path).then((root) => [cfg, root]))
        .then((arr) => lib.getFileTreeState(arr[1]).then((state) => [...arr, state]))
        .then((arr) => lib.getFileTreeChanges(argv.path, arr[2]))
        .then(function (arr) {
            console.info(arr);
        });
}

module.exports = {
    constants,
    info,
    init,
    purge,
    search,
    update
};
