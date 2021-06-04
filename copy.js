let fs = require('fs');
let file = fs.readFileSync('./dist/doc/Container.js', 'utf-8');
let pattern = fs.readFileSync('./src/doc/pattern.ejs', 'utf-8');
file = file.replace('`%PATTERN%`', `JSON.parse(${JSON.stringify(pattern)})`);
fs.writeFileSync('./dist/doc/Container.js', file);
