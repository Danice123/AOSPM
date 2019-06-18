const uuid = require('uuid/v4');
const { getFaceData } = require('./photoUtils');

const rekog = new (require('aws-sdk/clients/rekognition'))({
    region: 'us-east-2'
});

const router = require('express').Router();
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
    var faceId = req.body.faceId;

    await addFaceToCollection(person.id, photo, faceId);

    photo.faces[faceId].personId = person.id;
    await db.photoDB.put(photo.id, JSON.stringify(photo));

    if (person.faces == undefined) person.faces = [];
    person.faces.push({ photoId: photo.id, faceId: faceId });
    await db.personDB.put(person.id, JSON.stringify(person));

    res.sendStatus(200);
}));

router.post('/clean', handle(async (req, res) => {
    db.personDB.createReadStream()
    .on('data', async (data) => {
        var person = JSON.parse(data.value);
        rekog.deleteCollection({ CollectionId: person.id }, (err, data) => {
            if (err) console.log(err);
        });

        if (person.faces != undefined) {
            for(var i = 0; i < person.faces.length; i++) {
                var photo = JSON.parse(await db.photoDB.get(person.faces[i].photoId));
                photo.faces[person.faces[i].faceId].personId = undefined;
                await db.photoDB.put(photo.id, JSON.stringify(photo));
            }
        }
        await db.personDB.del(person.id);
    })
    .on('error', (err) => {
        throw err;
    })
    .on('end', () => {
        res.sendStatus(200);
    });
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
    var base64Data = new Buffer.from(data, 'binary');
    return new Promise((resolve, reject) => {
        rekog.indexFaces({
            CollectionId: personId,
            ExternalImageId: `${photo.id}-Face-${faceId}`,
            Image: { Bytes: base64Data },
            MaxFaces: 1,
            QualityFilter: 'NONE'
        }, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}