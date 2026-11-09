'use strict';
/** Load individual functions straight out of AppScripts.html for Node tests. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'AppScripts.html'), 'utf8');

function extractFunction(name) {
  const start = html.indexOf('function ' + name + '(');
  if (start === -1) throw new Error('fungsi tidak ditemukan di AppScripts.html: ' + name);
  const open = html.indexOf('{', html.indexOf(')', start));
  let depth = 0;
  for (let i = open; i < html.length; i++) {
    if (html[i] === '{') depth++;
    else if (html[i] === '}' && --depth === 0) return html.slice(start, i + 1);
  }
  throw new Error('kurung tidak seimbang: ' + name);
}

/** Returns a vm context containing the named functions plus any globals given. */
function loadClientFunctions(names, globals = {}) {
  const context = Object.assign({}, globals);
  vm.createContext(context);
  vm.runInContext(names.map(extractFunction).join('\n'), context);
  return context;
}

module.exports = { extractFunction, loadClientFunctions };
