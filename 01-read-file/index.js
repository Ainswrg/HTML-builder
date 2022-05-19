const { ReadStream } = require('fs');
const { join } = require('path');
const { stdout } = require('process');

const filePath = join(__dirname, 'text.txt');
const rs = new ReadStream(filePath, 'utf8');

rs.on('data', (chunk) => {
  stdout.write(chunk.trim());
});