const uuid = require('uuid/v4');
const mime = require('mime-types');

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
	var photoId = uuid();
	var photoFileName = photoId + '.' + mime.extension(upload.mimetype);
	
	
	upload.mv('./library/' + photoFileName).then(() => {
		res.send('File API');
	}).catch((e) => {
		console.error(e);
		res.sendStatus(500);
	});
});

module.exports = router;