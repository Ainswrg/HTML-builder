const {
  readdir,
  mkdir,
  rm,
  readFile,
  writeFile,
  copyFile,
} = require('fs/promises');
const { ReadStream, WriteStream } = require('fs');
const { join, parse } = require('path');
const { stderr: error } = require('process');

const components = join(__dirname, 'components');
const styles = join(__dirname, 'styles');
const projectDist = join(__dirname, 'project-dist');
const template = join(__dirname, 'template.html');
const assets = join(__dirname, 'assets');

const indexFile = join(projectDist, 'index.html');
const styleFile = join(projectDist, 'style.css');
const assetsFolder = join(projectDist, 'assets');

try {
  (async () => {
    await rm(projectDist, { recursive: true, force: true }, () => {});
    await mkdir(projectDist, { recursive: true }, () => {});
    const rsTemplate = ReadStream(template, 'utf8');
    const wrIndex = WriteStream(indexFile);
    await rsTemplate.pipe(wrIndex);

    const componentsFolder = await readdir(components, { withFileTypes: true });
    const htmlComponents = await componentsFolder.filter(
      (file) => file.isFile() && parse(file.name).ext === '.html'
    );

    const styleFolder = await readdir(styles, { withFileTypes: true });
    const cssFiles = await styleFolder.filter(
      (file) => file.isFile() && parse(file.name).ext === '.css'
    );
    const sortedCss = await stylesSort(cssFiles);

    await copy(assets, assetsFolder);

    let data = await readFile(indexFile, 'utf8');

    htmlComponents.forEach(async (file) => {
      const name = parse(file.name).name;
      const reg = new RegExp(`{{${name}}}`);
      const rs = ReadStream(join(components, file.name), 'utf8');

      await rs.on('data', async (chunk) => {
        data = data.toString().replace(reg, chunk);
      });
      rs.on('end', async () => {
        writeFile(indexFile, data);
      });
    });

    const wr = await WriteStream(styleFile, { flags: 'a' });
    sortedCss.forEach(async (file) => {
      await readFile(join(styles, file), 'utf8').then(async (e) => {
        await wr.write(e + '\n');
      });
    });
  })();
} catch (err) {
  error.write(err);
}

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

async function stylesSort(arr, result = []) {
  await arr.map((file) => compare(file.name, result));
  const res = [...result];
  await arr.forEach((file) => {
    res.push(file.name);
  });
  return Array.from(new Set(res));
}

function compare(current, arr) {
  if (current === 'footer.css') {
    arr[2] = current;
  } else if (current === 'header.css') {
    arr[0] = current;
  } else if (current === 'main.css') {
    arr[1] = current;
  }
}
