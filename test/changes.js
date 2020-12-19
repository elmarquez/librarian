const FSTree = require('fs-tree-diff');
const walkSync = require('walk-sync');

let entries = walkSync.entries('./fixtures/state1');
let current = new FSTree({ entries });

entries = walkSync.entries('./fixtures/state2');
let next = new FSTree({ entries });

const patch1 = current.calculatePatch(next);
console.log('patch', patch1);

