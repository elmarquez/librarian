const constants = require('./constants');
const Db = require('./database');
const files = require('./filetree');
const findUp = require('find-up');
const FSTree = require('fs-tree-diff');
const hasha = require('hasha');
const log = require('log-symbols');
const path = require('path');
const Promise = require('bluebird');
const utils = require('./utils');
const walkSync = require('walk-sync');

const CHANGES = {
    CREATE: 'create',
    REMOVE: 'unlink'
};

/**
 * Apply change.
 * @param {object} db - Database connection
 * @returns {function}
 */
function applyChanges(db) {
    return function(change) {
        const [ type, key, meta ] = change;
        console.info(log.info, 'updating', key);
        if (type === 'create') {
            const data = {
                extension: path.extname(key).slice(1),
                filename: path.basename(key),
                hash: 0,
                lastModified: meta.mtime,
                path: key,
                size: meta.size || 0
            };
            return db.createOrUpdate(key, data).then(() => true).catch(() => false);
        } else {
            return Promise.resolve();
        }
    }
}

/**
 * Apply changes to library index.
 * @param {string} p - Path to library root
 * @returns {Promise}
 */
function applyFileTreeChanges(p) {
    const db = new Db(p);
    return db
        .connect()
        .then((arr) => getCurrentFileTreeState(p))
        .then((curr) => getPreviousFileTreeState(p).then((prev) => [prev, curr]))
        .then(([prev, curr]) => getFileTreeChanges(prev, curr).then((changes) => [curr, changes]))
        .then(([curr, changes]) => Promise.mapSeries(changes, applyChanges(db)).then(() => curr))
        .then((curr) => saveFileTree(p, curr));
}

/**
 * Get current file tree state.
 * @param {string} p - Path to library root
 * @returns {Promise|array}
 */
async function getCurrentFileTreeState(p) {
    // TODO filter results
    return await walkSync.entries(p, { ignore: [constants.CONFIG_FOLDER] });
}

/**
 * Get file tree changes.
 * @param {array} previous - Previous file tree state
 * @param {array} current - Current file tree state
 * @returns {Promise|array} list of file tree changes
 */
function getFileTreeChanges(previous, current) {
    const previousState = new FSTree({ entries: previous });
    const currentState = new FSTree({ entries: current });
    const changes = previousState.calculatePatch(currentState);
    return Promise.resolve(changes);
}

/**
 * Get the path to the file tree state snapshot file.
 * @param {string} p - Path to library root
 * @return {string}
 */
function getFileTreeSnapshotPath(p) {
    return path.join(p, constants.CONFIG_FOLDER, constants.FILE_TREE_INDEX);
}

/**
 * Get the previous file tree state.
 * @param {string} p - Path to library root
 * @return {Promise|array} list of file entries
 */
function getPreviousFileTreeState(p) {
    // TODO ensure the file exists
    const f = getFileTreeSnapshotPath(p);
    return utils
        .pathExists(f, true)
        .then(() => utils.readTextFile(f))
        .then((data) => utils.parseJSON(data))
        .then(function(state) {
            state.entries = state.entries.map(function(p) {
                return {
                    ...p,
                    basePath: p,
                    isDirectory: () => p.isDirectory
                };
            });
            return state;
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
    const opts = {cwd: p, type: 'directory'};
    return findUp(match, opts).then((p) => p ? p : Promise.reject('Library root directory not found'));
}

/**
 * Save file tree state.
 * @param {string} p - Path to library root
 * @param {array} currentEntries - Current file tree state
 * @return {Promise}
 */
function saveFileTree(p, currentEntries) {
    const entries = currentEntries.map(function(e) {
        return {
            isDirectory: e.isDirectory(),
            mode: e.mode,
            mtime: e.mtime,
            relativePath: e.relativePath,
            size: e.size,
        };
    });
    const data = { ...constants.DEFAULT_TREE_INDEX, entries };
    const f = getFileTreeSnapshotPath(p);
    return utils.stringify(data).then((s) => utils.writeFile(f, s));
}

module.exports = {
    applyFileTreeChanges,
    getCurrentFileTreeState,
    getFileTreeChanges,
    getLibraryRoot,
    getPreviousFileTreeState,
    saveFileTree
};
