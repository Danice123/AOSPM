const level = require('level');

module.exports = {
    photoDB: level('aospm-photo'),
    faceDB: level('aospm-face')
};