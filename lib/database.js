const constants = require('./constants');
const { basename, extname, join } = require('path');
const Promise = require('bluebird');
const { Sequelize, Op, Model, DataTypes } = require("sequelize");
const utils = require('./utils');

/**
 * Database wrapper.
 */
class Database {

    conn = null;            // database connection
    dbPath = null;          // database path
    libraryPath = null;     // project path

    /**
     * Constructor
     * @param {string} project - Project path
     */
    constructor(project) {
        this.dbPath = join(project, constants.CONFIG_FOLDER, constants.DATABASE_FILENAME);
        this.libraryPath = project;
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
        const self = this;
        self.conn = new Sequelize({
            dialect: 'sqlite',
            dialectOptions: {},
            logging: null,
            pool: { max: 5, min: 0, idle: 10000 },
            retry: { max: 10 },
            storage: self.dbPath,
            transactionType: 'IMMEDIATE'
        });
        defineModels(self.conn);
        return self.conn.sync();
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
            .then((m) => m.findOrCreate({ where, data }));
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
     * @param {string} pp - Project path
     * @param {string} fp - File path
     * @returns {Promise}
     */
    remove(pp, fp) {

    }
}

/**
 * Define models.
 * @param {object} conn - Database connection
 */
function defineModels(conn) {
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
            }
        },
        { tableName: 'Documents' }
    );
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
        },
        { tableName: 'Tags' }
    );
    conn.define('Text',
        {
            path: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.STRING,
                unique: true
            },
            value: {
                type: DataTypes.STRING,
                allowNull: false
            },
        },
        { tableName: 'Text' }
    );
}

module.exports = Database;
