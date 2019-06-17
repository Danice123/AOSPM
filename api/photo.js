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

module.exports = router;