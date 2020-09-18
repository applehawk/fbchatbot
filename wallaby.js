'use strict';

const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/.dev.env` });

module.exports = function() {
  process.env.NODE_ENV = 'development';
  return {
    testFramework: 'ava',
    files: [
      '*.env',
      '/**/*.js',
      { pattern: '*.env', instrument: false },
      // { pattern: 'bot.js', instrument: true },
      { pattern: '/tests/**/*.spec.js', ignore: true },
    ],
    tests: [
      '/tests/**/*.spec.js',
    ],
    env: {
      type: 'node',
    },
    workers: {
      initial: 1,
      regular: 1,
    },
  };
};
