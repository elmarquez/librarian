const pkg = require('../package.json');

const CONFIG_FOLDER = '.doc';
const DEFAULT_FILE_TYPES = ['adoc','bib','gif','jpeg','jpg','json','md','pdf','png','svg','tif','tiff','txt'];
const DEFAULT_IGNORE_PATHS = [CONFIG_FOLDER];
const DEFAULT_CONFIG_FILE = {
    __version: 1,
    types: DEFAULT_FILE_TYPES
};
const DEFAULT_TREE_INDEX = {
    __version: 1,
    entries: []
};

module.exports = {
    CONFIG_FILE: 'library.json',
    CONFIG_FOLDER,
    DATABASE_FILENAME: 'library.sqlite',
    DEFAULT_CONFIG_FILE,
    DEFAULT_IGNORE_PATHS,
    DEFAULT_TREE_INDEX,
    FILE_TREE_INDEX: 'filetree.json',
    FILE_TYPES: DEFAULT_FILE_TYPES,
    PACKAGE_DESCRIPTION: pkg.description,
    PACKAGE_NAME: pkg.name,
    PACKAGE_VERSION: pkg.version,
    PROJECT_METADATA: 'project.json'
};
