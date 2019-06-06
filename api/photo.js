const uuid = require('uuid/v4');
const mime = require('mime-types');
const globals = require('../const');

const router = require('express').Router();
router.use(require('express-fileupload')({
	useTempFiles: true,
	tempFileDir: './tmp'
}));

const db = require('./db');

router.put('/upload', (req, res) => {
	if (req.files == undefined || req.files.photo == undefined) {
		res.sendStatus(400);
		return;
	}
	var upload = req.files.photo;
	var photo = {};
	photo.id = uuid();
	photo.mimetype = upload.mimetype;
	photo.md5 = upload.md5;

	db.put(photo.id, JSON.stringify(photo))
	.then(() => {
		upload.mv(`${globals.library}/${photo.id}.${mime.extension(photo.mimetype)}`)
		.then(() => {
			res.send(photo.id);
		}).catch((e) => {
			console.error(e);
			res.sendStatus(500);
		});
	})
	.catch((e) => {
		console.error(e);
		res.sendStatus(500);
	});
});

router.get('/:photoId', (req, res) => {
	db.get(req.params.photoId)
	.then((json) => {
		var photo = JSON.parse(json);
		res.download(`${globals.library}/${photo.id}.${mime.extension(photo.mimetype)}`);
	})
	.catch((e) => {
		console.error(e);
		res.sendStatus(500);
	});
})

module.exports = router;