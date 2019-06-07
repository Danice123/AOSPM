const mime = require('mime-types');
const globals = require('../const');
const fs = require('fs');

const rekog = new (require('aws-sdk/clients/rekognition'))({
    region: 'us-east-2'
});

const router = require('express').Router();
const db = require('./db');

module.exports = router;