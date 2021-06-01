#! /usr/bin/env node
const command = process.argv[2];

const webpack = require('webpack');
const config = require('../webpack.config');

const args = process.argv.slice(3);
const params = {};

for (const arg of args) {
  const [key, value] = arg.slice(2).split('=');
  params[key] = value;
}

const environment = command === 'start' ? 'development' : 'production';
const { input } = params;

const compiler = webpack(config.map((env) => env(null, { environment, input })));

if (command === 'build') {
  console.log(` 🚀️ Building your application in ${params.mode} mode...`)
  compiler.run(() => {
    if (params.mode === 'ssg' || params.mode === 'spa' || params.mode === 'ssr') {
      require(`../builders/${params.mode}`)(params.output);
    }
  });
} else {
  console.log(` 🚀️ Starting your application in ${environment} mode...`)
  console.log();
  compiler.watch({ aggregateTimeout: 300 }, (error, status) => {
    console.log(" ⚙️  Compiling changes...");
    if(status.hasErrors()) {
      const [file, loader, ...trace]  = status.toJson('errors-only', {colors: true}).children[0].errors[0].split('\n');
      console.log(` 💥️ There is an error preventing compilation in \x1b[31m${file}\x1b[0m`);
      for(const line of trace) {
        console.log('\x1b[31m%s\x1b[0m', '    ' + line.trim());
      }
    }
  });
}