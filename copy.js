const fs = require('fs');
fs.mkdirSync('./dist/doc', { recursive: true });
fs.copyFileSync('./src/doc/index.ejs', './dist/doc/index.ejs');
