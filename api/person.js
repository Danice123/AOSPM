const uuid = require('uuid/v4');
const { getFaceData } = require('./photoUtils');

const rekog = new (require('aws-sdk/clients/rekognition'))({
    region: 'us-east-2'
});

const router = require('express').Router();
router.use(require('express').json());
const handle = require("./asyncWrapper.js");
const db = require('./db');

router.post('/create', handle(async (req, res) => {
    var person = {
        id: uuid(),
        name: req.body.name
    };
    person.arn = await createCollection(person.id);
    await db.personDB.put(person.id, JSON.stringify(person));
    res.send(person.id);
}));

router.get('/:personId', handle(async (req, res) => {
    var person = JSON.parse(await db.personDB.get(req.params.personId));
    res.send(person);
}));

router.post('/:personId/addFace', handle(async (req, res) => {
    var person = JSON.parse(await db.personDB.get(req.params.personId));
    var photo = JSON.parse(await db.photoDB.get(req.body.photoId));

    await addFaceToCollection(person.id, photo, req.body.faceId);
    res.sendStatus(200);
}));

module.exports = router;

async function createCollection(personId) {
    return new Promise((resolve, reject) => {
        rekog.createCollection({ CollectionId: personId }, (err, data) => {
            if (err) reject(err);
            resolve(data.CollectionArn);
        });
    });
}

async function addFaceToCollection(personId, photo, faceId) {
    var { data, info } = await getFaceData(photo, faceId);

    return new Promise((resolve, reject) => {
        rekog.indexFaces({
            CollectionId: personId,
            ExternalImageId: `${photo.id}-Face-${faceId}`,
            Image: { Bytes: data },
            MaxFaces: 1,
            QualityFilter: 'NONE'
        }, (err, data) => {
            reject(err);
            resolve(data);
        });
    });
}