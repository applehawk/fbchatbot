module.exports = (wallaby) => {
  return {
    testFramework: 'ava',
    files: ['/**/*.js', '!/tests/**/*.spec.js'],
    tests: ['/tests/**/*.spec.js'],
    env: {
      type: 'node',
      runner: 'node',
    },
    workers: {
      initial: 2,
      regular: 2,
    },
  };
};
