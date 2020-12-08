#!/usr/bin/env node
const {constants, info, init, purge, search, update} = require('./lib');
const { homedir } = require('os');
const { join, normalize } = require('path');
const pkg = require('./package.json');
const yargs = require('yargs');

const noop = () => {};

yargs
    .scriptName(pkg.name)
    .version(constants.PACKAGE_VERSION)
    .usage('$0 <cmd> [args]')
    .command('info [name]', 'Display file information', noop, info)
    .command('init', 'Initialize library', noop, init)
    .command('purge', 'Purge index', noop, purge)
    .command('search <query>', 'Search for publications', noop, search)
    .command('update', 'Update the index', noop, update)
    .option('path', {
        coerce: function (p) {
            const i = p.indexOf('~');
            p = i > -1 ? join(homedir(), p.substring(i + 1)) : p;
            return normalize(p);
        },
        default: process.cwd(),
        describe: 'path to library directory',
        type: 'string',
    })
    .epilogue('Documentation is available online at https://elmarquez.github.io/library')
    .help()
    .argv;
