#!/usr/bin/env node
const {command, constants, info, init, purge, search, update} = require('./lib');
const { homedir } = require('os');
const { join, normalize } = require('path');
const pkg = require('./package.json');
const yargs = require('yargs');

const noop = () => {};

yargs
    .scriptName(pkg.name)
    .version(constants.PACKAGE_VERSION)
    .usage('$0 <cmd> [args]')
    .command('info [name]', 'Display file information', noop, command.info)
    .command('init', 'Initialize folder as library', noop, command.init)
    .command('purge', 'Purge index', noop, command.purge)
    .command('search <query>', 'Search for publications', noop, command.search)
    .command('update', 'Update the index', noop, command.update)
    .option('path', {
        coerce: function (p) {
            const i = p.indexOf('~');
            p = i > -1 ? join(homedir(), p.substring(i + 1)) : p;
            return normalize(p);
        },
        default: process.cwd(),
        describe: 'path to project directory',
        type: 'string',
    })
    .epilogue('Documentation is available online at https://elmarquez.github.io/librarian')
    .help()
    .argv;
