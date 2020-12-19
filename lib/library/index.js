const constants = require('../constants');
const findUp = require('find-up');
const FSTree = require('fs-tree-diff');
const path = require('path');
const utils = require('../utils');
const walkSync = require('walk-sync');

/**
 * Apply changes to library index.
 * @param {string} p - Path to library root
 * @param {array} changes - Change list
 * @returns {Promise}
 */
function applyChanges(p, changes) {
    console.info('apply changes', p, changes);
    return Promise.resolve();
}

/**
 * Get file tree changes.
 * @param {string} p - Path to library root
 * @param {object} state - Last file tree state
 * @returns {Promise|array} list of file tree changes
 */
function getFileTreeChanges(p, state) {
    // convert record into Entry
    const previousEntries = state.entries.map(function(p) {
        return {
            ...p,
            basePath: p,
            isDirectory: () => p.isDirectory
        };
    });
    const previousState = new FSTree({ entries: previousEntries });
    // get current file system state
    const currentEntries = walkSync.entries(p, { ignore: [constants.CONFIG_FOLDER] });
    // save current file tree state
    const currentState = currentEntries.map(function(e) {
        return {
            isDirectory: e.isDirectory(),
            mode: e.mode,
            mtime: e.mtime,
            relativePath: e.relativePath,
            size: e.size,
        };
    });
    return saveFileTree(p, currentState)
        .then(function() {
            const nextState = new FSTree({ entries: currentEntries });
            return previousState.calculatePatch(nextState);
        });
}

/**
 * Get the path to the file tree state snapshot file.
 * @param {string} p - Path to library root
 * @return {string}
 */
function getFileTreePath(p) {
    return path.join(p, constants.CONFIG_FOLDER, constants.FILE_TREE_INDEX);
}

/**
 * Get file tree snapshot.
 * @param {string} p - Path to library root
 * @return {Promise|array}
 */
function getFileTreeState(p) {
    // TODO ensure the file exists
    const f = getFileTreePath(p);
    return utils
        .pathExists(f, true)
        .then(() => utils.readFile(f))
        .then((data) => utils.parseJSON(data));
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
    const opts = {cwd: p, type: 'directory'};
    return findUp(match, opts).then((p) => p ? p : Promise.reject('Library root directory not found'));
}

/**
 * Save file tree metadata.
 * @param {string} p - Path to library root
 * @param {array} entries - File tree state
 * @return {Promise}
 */
function saveFileTree(p, entries) {
    const data = {
        ...constants.DEFAULT_TREE_INDEX,
        entries: entries
    };
    const f = getFileTreePath(p);
    return utils.stringify(data).then((s) => utils.writeFile(f, s));
}

module.exports = {
    applyChanges,
    getFileTreeChanges,
    getFileTreeState,
    getLibraryRoot
};
