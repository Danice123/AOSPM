const level = require('level');
var db = level('aospm-db')
module.exports = db;