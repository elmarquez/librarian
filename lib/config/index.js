/**
 * Parse console command.
 * @param {object} yargs - Console argument parser
 */
function command (yargs) {}

/**
 * Get setting.
 * @param {object} args - Command arguments
 */
function get (args) {}

/**
 * Get previous file tree.
 * @returns {Promise|object}
 */
function getFileTree(argv) {
    const tree = {
        lastModified: new Date(),
        items: []
    };
    return new Promise.resolve(tree);
}

/**
 * List settings.
 * @param {object} args - Command arguments
 */
function list (args) {}

/**
 * Remove setting.
 * @param {object} args - Command arguments
 */
function remove (args) {}

/**
 * Set value.
 * @param {object} args - Command arguments
 */
function set (args) {}

module.exports = {};
