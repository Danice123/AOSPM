const uuid = require('uuid/v4');
const mime = require('mime-types');
const globals = require('../const');
const { readImage, getFaceData } = require('./photoUtils');

const rekog = new (require('aws-sdk/clients/rekognition'))({
    region: 'us-east-2'
});

const router = require('express').Router();
const handle = require("./asyncWrapper.js");
router.use(require('express-fileupload')({
	useTempFiles: true,
	tempFileDir: './tmp'
}));

const db = require('./db');

router.put('/upload', handle(async (req, res) => {
	if (req.files == undefined || req.files.photo == undefined) {
		res.sendStatus(400);
		return;
	}

	var upload = req.files.photo;
	var photo = {
		id: uuid(),
		mimetype: upload.mimetype,
		md5: upload.md5
	};
	await db.photoDB.put(photo.id, JSON.stringify(photo));
	await upload.mv(`${globals.library}/${photo.id}.${mime.extension(photo.mimetype)}`);

	var data = await readImage(photo);
	var base64Data = new Buffer.from(data, 'binary');
	rekog.detectFaces({
		Image: { Bytes: base64Data },
		Attributes: ['ALL']
	}, (err, data) => {
		if (err) { throw err; }
		photo.faces = data.FaceDetails;
		photo.faces.forEach((face, index) => {
			face.id = index;
		});
		db.photoDB.put(photo.id, JSON.stringify(photo))
	});

	res.send(photo.id);
}));

router.get('/:photoId', handle(async (req, res) => {
	var photo = JSON.parse(await db.photoDB.get(req.params.photoId));
	res.download(`${globals.library}/${photo.id}.${mime.extension(photo.mimetype)}`);
}));

router.get('/:photoId/info', handle(async (req, res) => {
	var photo = JSON.parse(await db.photoDB.get(req.params.photoId));
	res.send(photo);
}));

router.get('/:photoId/face/:faceId', handle(async (req, res) => {
	var photo = JSON.parse(await db.photoDB.get(req.params.photoId));
	var { data, info } = await getFaceData(photo, req.params.faceId)
	res.set('Content-Type', info.format);
	res.send(data);
}));

router.post('/:photoId/face/:faceId/match', handle(async (req, res) => {
	var photo = JSON.parse(await db.photoDB.get(req.params.photoId));

	var { data, info } = await getFaceData(photo, req.params.faceId)
	var base64Data = new Buffer.from(data, 'binary');

	return new Promise((resolve, reject) => {
		var matchProcess = [];
		db.personDB.createReadStream()
		.on('data', (data) => {
			matchProcess.push(matchAgainstPerson(data.key, base64Data));
		})
		.on('error', (err) => {
			reject(err);
		})
		.on('end', async () => {
			var matches = await Promise.all(matchProcess);
			res.json(matches);
			resolve();
		});
	});
}));

module.exports = router;

async function matchAgainstPerson(personId, faceData) {
    return new Promise((resolve, reject) => {
        rekog.searchFacesByImage({
            CollectionId: personId,
            Image: { Bytes: faceData },
			MaxFaces: 1,
			FaceMatchThreshold: 0
        }, (err, data) => {
			if (err) reject(err);
			if (data.FaceMatches.length == 0) {
				resolve({
					personId: personId,
					confidence: 0
				});
			} else {
				resolve({
					personId: personId,
					confidence: data.FaceMatches[0].Similarity,
					sourcePhoto: data.FaceMatches[0].Face.ExternalImageId.split('-Face-')[0],
					sourceFaceId: data.FaceMatches[0].Face.ExternalImageId.split('-Face-')[1]
				});
			}
        });
    });
}