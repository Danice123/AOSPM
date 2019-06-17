const level = require('level');

module.exports = {
    photoDB: level('aospm-photo'),
    personDB: level('aospm-person')
};