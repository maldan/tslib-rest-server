let fs = require('fs');
let file = fs.readFileSync('./dist/doc/Container.js', 'utf-8');
let pattern = fs.readFileSync('./src/doc/pattern.ejs', 'utf-8');
file = file.replace(
  '`%PATTERN%`',
  `Buffer.from("${Buffer.from(pattern, 'utf-8').toString('base64')}", "base64").toString('utf-8')`,
);
fs.writeFileSync('./dist/doc/Container.js', file);
