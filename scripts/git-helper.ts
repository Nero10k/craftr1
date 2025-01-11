#!/usr/bin/env node
import { execSync } from 'child_process';
import readline from 'readline';
import { createSpinner } from 'nanospinner';
import chalk from 'chalk';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
};

const runCommand = (command: string, loadingText: string): void => {
  const spinner = createSpinner(loadingText).start();
  try {
    execSync(command, { stdio: 'pipe' });
    spinner.success({ text: chalk.green('Done!') });
  } catch (error: any) {
    spinner.error({ text: chalk.red(`Error: ${error.message}`) });
    process.exit(1);
  }
};

const main = async () => {
  console.log(chalk.blue('\n🚀 CRAFTR Git Helper\n'));
  
  console.log(chalk.yellow('Select an action:'));
  console.log('1. Save changes (add & commit)');
  console.log('2. Push changes to GitHub');
  console.log('3. Pull latest changes');
  console.log('4. Check status');
  console.log('5. Exit\n');

  const choice = await question('Enter your choice (1-5): ');

  switch (choice) {
    case '1': {
      const message = await question('\nEnter a description of your changes: ');
      runCommand('git add .', 'Adding all changes...');
      runCommand(`git commit -m "${message}"`, 'Saving changes...');
      break;
    }
    case '2': {
      const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
      runCommand(`git push origin ${branch}`, 'Pushing to GitHub...');
      break;
    }
    case '3': {
      const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
      runCommand(`git pull origin ${branch}`, 'Getting latest changes...');
      break;
    }
    case '4': {
      console.log(chalk.cyan('\nCurrent status:\n'));
      console.log(execSync('git status').toString());
      break;
    }
    case '5': {
      console.log(chalk.blue('\nGoodbye! 👋\n'));
      process.exit(0);
    }
    default: {
      console.log(chalk.red('\nInvalid choice. Please try again.\n'));
    }
  }

  rl.close();
};

main(); 