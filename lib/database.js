const constants = require('./constants');
const Promise = require('bluebird');
const { join } = require('path');
const { DataTypes, Sequelize } = require("sequelize");

/**
 * Database wrapper.
 */
class Database {

    conn = null;    // database connection
    dbPath = null;  // database path
    debug = false;  // debug mode

    /**
     * Constructor
     * @param {string} project - Project path
     * @param {boolean} debug - Debug mode
     */
    constructor(project, debug = false) {
        this.dbPath = join(project, constants.CONFIG_FOLDER, constants.DATABASE_FILENAME);
        this.debug = debug;
    }

    addTag(fp, t) {}

    /**
     * Close the database connection.
     * @returns {Promise}
     */
    close() {
        return this.conn.close();
    }

    /**
     * Open a connection to the database.
     * @returns {Promise}
     */
    connect() {
        this.conn = new Sequelize({
            dialect: 'sqlite',
            logging: this.debug ? console.log : null,
            retry: { max: 10 },
            storage: this.dbPath,
        });
        defineModels(this.conn);
        return this.sync();
    }

    /**
     * Create or update document record.
     * @param {string} key - File path
     * @param {object} data - Metadata
     * @returns {Promise}
     */
    createOrUpdate(key, data) {
        const where = { path: key };
        return this
            .getModel('Document')
            .then((m) => m.findOrCreate({ where, defaults: data }));
    }

    /**
     * Get the database connection.
     * @returns {null}
     */
    getConnection() {
        return this.conn;
    }

    /**
     * Get document record.
     * @param {object} query - Document query
     * @returns {promise}
     */
    getDocument(query) {
        return this.conn.models.Document.findOne({ where: { ...query } });
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
        return this.conn.models.Document.findAll({ attributes: ['path', 'hash'] });
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
     * Get model by name.
     * @param {string} name - Model name
     * @returns {object} model
     */
    getModel(name) {
        const model = this.conn.models[name];
        return Promise.resolve(model);
    }

    /**
     * Get all tags.
     * @returns {promise|array}
     */
    getTags() {
        throw new Error('not implemented');
    }

    /**
     * Remove document.
     * @param {string} key - File path
     * @returns {Promise}
     */
    remove(key) {
        const where = { path: key };
        return this.getModel('Document').then((m) => m.destroy({ where }));
    }

    /**
     * Synchronize the database.
     * @returns {Promise}
     */
    sync() {
        return this.conn.sync();
    }
}

/**
 * Define models.
 * @param {object} conn - Database connection
 */
function defineModels(conn) {
    return [defineDocumentModel, defineTagModel, defineTextModel].forEach(fn => fn(conn));
}

function defineDocumentModel(conn) {
    conn.define('Document',
        {
            path: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.STRING,
                unique: true
            },
            filename: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            extension: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            hash: {
                allowNull: true,
                type: DataTypes.STRING,
                unique: false
            },
            size: {
                type: DataTypes.INTEGER
            },
            lastModified: {
                type: DataTypes.DATE
            },
            text: {
                allowNull: true,
                defaultValue: '',
                type: DataTypes.TEXT
            }
        }
    );
}

function defineTagModel(conn) {
    conn.define('Tag',
        {
            tag: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.STRING,
                unique: true
            },
            path: {
                type: DataTypes.STRING,
                allowNull: false
            },
        }
    );
}

function defineTextModel(conn) {
    conn.define('Text',
        {
            path: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.STRING,
                unique: true
            },
            value: {
                allowNull: false,
                type: DataTypes.TEXT
            },
        }
    );
}

module.exports = Database;
