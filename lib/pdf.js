const pdf = require('pdf-extraction');
const utils = require('./utils');

/**
 * Get metadata.
 * @param {string} p - File path
 * @returns {Promise|object}
 */
function getMetadata(p) {}

/**
 * Get text content.
 * @param {string} p - File path
 * @returns {Promise|array}
 */
function getText(p) {
    return utils
        .readFile(p)
        .then((data) => pdf(data))
        .then(function (data) {
            // number of pages
            console.log(data.numpages);
            // number of rendered pages
            console.log(data.numrender);
            // PDF info
            console.log(data.info);
            // PDF metadata
            console.log(data.metadata);
            // PDF.js version
            // check https://mozilla.github.io/pdf.js/getting_started/
            console.log(data.version);
            // PDF text
            console.log(data.text);
        });
}

module.exports = {
    getMetadata,
    getText
};
