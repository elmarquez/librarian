const constants = require('../constants');
const path = require('path');
const utils = require('../utils');

/**
 * Parse console command.
 * @param {object} yargs - Console argument parser
 */
function command (yargs) {
    throw new Error('not implemented');
}

/**
 * Get absolute path to configuration file.
 * @param {string} p - Path to library root
 * @returns {Promise}
 */
function getConfigFilePath(p) {
    const f = path.join(p, constants.CONFIG_FOLDER, constants.CONFIG_FILE);
    return Promise.resolve(f);
}

/**
 * Load configuration.
 * @param {string} p - Command arguments
 */
function load (p) {
    return Promise.all([
        getConfigFilePath(p),
        utils.stringify(constants.DEFAULT_CONFIG_FILE)
    ])
    .then((f) => utils.ensureFile(f[0], f[1]))
    .then((f) => utils.readFile(f))
    .then((j) => utils.parseJSON(j));
}

/**
 * Migrate data to next version structure.
 * @param {object} data - Configuration data
 * @returns {object} updated data structure
 */
function migrate(data) {
    return data;
}

/**
 * Save configuration.
 * @param {string} p - Path to library root
 * @param {object} data - Configuration data
 * @returns {Promise}
 */
function save (p, data) {
    const f = getConfigFilePath(p);
    return utils.stringify(data).then((s) => utils.writeFile(f, s));
}

module.exports = {
    command,
    getConfigFilePath,
    load,
    migrate,
    save
};
