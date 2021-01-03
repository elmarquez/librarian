const constants = require('./constants');
const Promise = require('bluebird');
const datastore = require('nedb-promise');
const { join } = require('path');

/**
 * Database wrapper.
 */
class Database {

    db = null;      // database
    debug = false;  // debug mode
    path = null;  // database path

    /**
     * Constructor
     * @param {string} project - Project path
     * @param {boolean} debug - Debug mode
     */
    constructor(project, debug = false) {
        const self = this;
        self.path = join(project, constants.CONFIG_FOLDER, constants.DATABASE_FILENAME);
        self.debug = debug;
        self.db = datastore({
            autoload: true,
            filename: this.path,
        });
    }

    close() {}

    connect() {}

    /**
     * Create or update document.
     * @param {string} path - File path
     * @param {object} doc - Document
     * @returns {Promise}
     */
    createOrUpdate(path, doc) {
        const where = { path };
        const opts = { upsert: true };
        return this.db.update(where, doc, opts);
    }

    /**
     * Get document record.
     * @param {string} path - File path
     * @returns {promise}
     */
    getDocument(path) {
        return this.db.findOne({ path });
    }

    /**
     * Get document record.
     * @param {object} query - Document query
     * @returns {promise}
     */
    getDocumentExists(query) {
        return this.getDocument(query).then(function(doc) {
            return !!doc;
        });
    }

    /**
     * Get the list of all identifying file paths and hashes.
     * @returns {promise|array} list of document paths
     */
    getDocumentIdentifiers() {
        return this.db.findAll({ attributes: ['path', 'hash'] });
    }

    /**
     * Get all documents.
     * @param {object} query - Document query
     * @returns {promise|array}
     */
    getDocuments(query) {
        return this.conn.models.Document.findAll({ where: { ...query } });
    }

    /**
     * Remove document.
     * @param {string} key - File path
     * @returns {Promise}
     */
    remove(key) {
        const where = { path: key };
        return this.db.remove({ where });
    }

    /**
     * Search for documents
     * @param {Array} query - Search terms
     * @returns {Promise}
     */
    search(query) {
        const match = `(${query.join('|')})`;
        return this.db.find({ text: new RegExp(match) });
    }
}

module.exports = Database;
