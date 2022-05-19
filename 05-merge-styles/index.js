const { readdir } = require('fs/promises');
const { ReadStream, WriteStream, unlink } = require('fs');
const { join, extname } = require('path');
const { stderr: error } = require('process');

const filesPath = join(__dirname, 'styles');
const bundlePath = join(__dirname, 'project-dist', 'bundle.css');

(async () => {
  try {
    unlink(bundlePath, () => {});
    for (const file of await readdir(filesPath, { withFileTypes: true })) {
      if (file.isFile() && extname(file.name) === '.css') {
        const rs = await ReadStream(join(filesPath, file.name), 'utf8');
        const wr = await WriteStream(bundlePath, { flags: 'a' });

        rs.pipe(wr);
      }
    }
  } catch (err) {
    error.write(err);
  }
})();
