const authenticationResolver = require('./authentication');

const rootResolver = {
  ...authenticationResolver,
};

module.exports = rootResolver;
