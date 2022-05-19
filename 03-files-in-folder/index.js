const { stat, readdir } = require('fs/promises');
const { join, extname, basename } = require('path');
const { stdout: output } = require('process');

const filePath = join(__dirname, 'secret-folder');

(async () => {
  try {
    for (const item of await readdir(filePath, { withFileTypes: true })) {
      if (item.isFile()) {
        const fileSize = await statFn(item.name);
        const result = resultFn(item.name, fileSize);
        output.write(result + '\n');
      }
    }
  } catch (err) {
    output.write(err + '\n');
  }
})();

function statFn(fileName) {
  return stat(`${filePath}/${fileName}`);
}
function resultFn(name, sizeFile) {
  const extension = extname(name);
  const fileName = basename(name, extension);

  const result = `${fileName} - ${extension.slice(1)} - ${(
    sizeFile.size / 1024
  ).toFixed(3)}kb`;
  return result;
}
