#!/usr/bin/env node
const lib = require('./lib');
const { noop } = require('./lib/utils');
const { homedir } = require('os');
const { join, resolve } = require('path');
const pkg = require('./package.json');
const yargs = require('yargs');

yargs
    .scriptName(pkg.name)
    .version(lib.constants.PACKAGE_VERSION)
    .usage('$0 <cmd> [args]')
    .command('info [name]', 'Display file information', noop, lib.info)
    .command('init', 'Initialize folder as library', noop, lib.init)
    .command('reset', 'Reset index', noop, lib.reset)
    .command('search <query>', 'Search for publications', noop, lib.search)
    .command('update', 'Update the index', noop, lib.update)
    .option('path', {
        coerce: function (p) {
            const i = p.indexOf('~');
            p = i > -1 ? join(homedir(), p.substring(i + 1)) : p;
            return resolve(p);
        },
        default: process.cwd(),
        describe: 'path to project directory',
        type: 'string',
    })
    .epilogue('Documentation is available online at https://elmarquez.github.io/librarian')
    .help()
    .argv;
