const router = require('express').Router();
const db = require('./db');

router.get('/', (req, res) => {
    var photos = [];

    db.createReadStream()
    .on('data', (data) => {
        photos.push(JSON.parse(data.value));
    })
    .on('end', () => {
        res.send(photos);
    });
});

module.exports = router;