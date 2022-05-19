const { createWriteStream, unlink } = require('fs');
const { join } = require('path');
const { createInterface } = require('readline');
const { stdin: input, stdout: output } = require('process');

const filePath = join(__dirname, 'text.txt');
const rl = createInterface({ input, output });

let op1, op2, answer;

unlink(filePath, () => {});


const writeHandler = (input) => {
  const ws = createWriteStream(filePath, { flags: 'a' });
  ws.write(input);
  ws.end();
};

const random = () => {
  op1 = Math.floor(Math.random() * 100 + 1);
  op2 = Math.floor(Math.random() * 100 + 1);
  answer = op1 + op2;
};
random();

const newQuestion = () => {
  random();
  rl.setPrompt(`Correct\nWhat is ${op1} + ${op2}?\n`);
  rl.prompt();
};

rl.question(`What is ${op1} + ${op2}?\n`, (userInput) => {
  if (Number(userInput.trim()) === answer) {
    newQuestion();
    writeHandler(userInput + '\n');
  } else if (userInput.trim() === 'exit') {
    rl.close();
  } else {
    rl.setPrompt('Incorrect\n');
    rl.prompt();
    writeHandler(userInput + '\n');
  }

  rl.on('line', (userInput) => {
    if (Number(userInput.trim()) === answer) {
      newQuestion();
      writeHandler(userInput + '\n');
    } else if (userInput.trim() === 'exit') {
      rl.close();
    } else {
      rl.setPrompt('Incorrect \n');
      rl.prompt();
      writeHandler(userInput + '\n');
    }
  });
});

rl.on('close', () => {
  rl.close();
  output.write('Goodbye!');
});
