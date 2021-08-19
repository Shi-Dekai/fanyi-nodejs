import {Command} from 'commander';
import {translate} from './main';

const program = new Command();

program
  .version('0.0.1')
  .name('fy')
  .usage('<English>')
  .arguments('<English>')
  .action(function (english) {
    translate(english)
  });


program.parse(process.argv);
