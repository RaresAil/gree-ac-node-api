/* eslint-disable security/detect-non-literal-fs-filename */
const path = require('path');
const fs = require('fs');

const package = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'package.json')).toString('utf8')
);

delete package.devDependencies;
delete package.repository;
delete package.author;
delete package.license;
delete package.private;
package.scripts = {
  start: 'node index.js'
};
package.main = 'index.js';

fs.writeFileSync(
  path.join(process.cwd(), 'dist', 'package.json'),
  JSON.stringify(package, null, 2)
);
