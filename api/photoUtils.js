const fs = require('fs');
const globals = require('../const');
const mime = require('mime-types');
const sharp = require('sharp');

module.exports.readImage = async function(photo) {
	return new Promise((resolve, reject) => {
		fs.readFile(`${globals.library}/${photo.id}.${mime.extension(photo.mimetype)}`, async (err, data) => {
			if (err) reject(err);
			resolve(data);
		});
	});
}

module.exports.getFaceData = async function(photo, faceId) {
	var image = sharp(await readImage(photo));
	var face = photo.faces[faceId];
	
	var meta = await image.metadata();
	return await image.extract({
		left: parseInt(face.BoundingBox.Left * meta.width),
		top: parseInt(face.BoundingBox.Top * meta.height),
		width: parseInt(face.BoundingBox.Width * meta.width),
		height: parseInt(face.BoundingBox.Height * meta.height)
	})
	.toBuffer({ resolveWithObject: true });
}