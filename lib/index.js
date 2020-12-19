const config = require('./library/config');
const constants = require('./constants');
const lib = require('./library');
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
    console.info(log.info, 'Initializing library', argv.path);
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
        .then(() => console.info(log.success, 'Done'))
        .catch((err) => console.error(log.error, err));
}

/**
 * Purge library index.
 * @param {object} argv - Command arguments
 * @returns {Promise}
 */
function purge(argv) {
    console.info(log.info, 'Purging library index');
    // TODO confirm before proceeding
    return lib
        .getLibraryRoot(argv.path)
        .then(function(root) {
            const cfg = join(root, constants.CONFIG_FOLDER, constants.CONFIG_FILE);
            const db = join(root, constants.CONFIG_FOLDER, constants.DATABASE_FILENAME);
            const fileTree = join(root, constants.CONFIG_FOLDER, constants.FILE_TREE_INDEX);
            return Promise.all([
                utils.removeFile(cfg, false),
                utils.removeFile(db, false),
                utils.removeFile(fileTree, false)
            ])
            .then(() => console.info(log.success, 'Done'))
        })
        .catch((err) => console.error(log.error, err));
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
    console.info(log.info, 'Updating library index', argv.path);
    return lib
        .getLibraryRoot(argv.path)
        .then((root) => config.load(root).then((cfg) => [root, cfg]))
        .then((arr) => lib.getFileTreeState(arr[0]).then((state) => [...arr, state]))
        .then((arr) => lib.getFileTreeChanges(arr[0], arr[2]).then((changes) => [...arr, changes]))
        .then((arr) => lib.applyChanges(arr[0], arr[3]))
        .then(() => console.info(log.success, 'Done'))
        .catch((err) => console.error(log.error, err));
}

module.exports = {
    constants,
    info,
    init,
    purge,
    search,
    update
};
