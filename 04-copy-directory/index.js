const { readdir, mkdir, copyFile, rm } = require('fs/promises');
const { join } = require('path');
const { stderr: error } = require('process');

const filesPath = join(__dirname, 'files');
const filesCopyPath = join(__dirname, 'files-copy');

(async () => {
  try {
    await rm(filesCopyPath, { recursive: true, force: true });
    await mkdir(filesCopyPath, { recursive: true });
    await copy(filesPath, filesCopyPath);
  } catch (err) {
    error.write(err);
  }
})();

async function copy(source, dest) {
  const files = await readdir(source, { withFileTypes: true });
  await mkdir(dest, { recursive: true });

  files.forEach(async (file) => {
    const sourcePath = join(source, file.name);
    const destPath = join(dest, file.name);

    if (file.isDirectory()) {
      await copy(sourcePath, destPath);
    } else {
      await copyFile(sourcePath, destPath);
    }
  });
}
