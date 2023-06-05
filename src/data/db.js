const knex = require('knex');
const knexfile = require('../../knexfile.js')

const env = process.env.NODE_ENV || 'development';
const configs = knexfile[env];
const database = knex(configs);

exports.Database = database;
