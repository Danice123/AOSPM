import faceModal from './faceModal';

var modal = $('<div>', { 'class': 'modal fade', id: 'imageView', tabindex: '-1', role: 'dialog'}).append(
	$('<div>', { 'class': 'modal-dialog modal-xl modal-dialog-centered', role: 'document' }).append(
		$('<div>', { 'class': 'modal-content' }).append(
			$('<div>', { 'class': 'modal-header' }).append(
				$('<h5>', { 'class': 'modal-title', text: 'Image View' })
			).append(
				$('<button>', { type: 'button', 'class': 'close', 'data-dismiss': 'modal', 'aria-label': 'close' }).append(
					$('<span>', { 'aria-hidden': 'true', html: '&times' })
				)
			)
		).append(
			$('<div>', { 'class': 'modal-body' })
		)
	)
);

function createModal() {
	$('body').append(modal);
}

export default {
	openModal: function(photoId) {
		if (!$('#imageView').length) {
			createModal()
		}

		modal.find('.modal-body').empty();
		var canvas = $('<canvas>', { 'class': 'w-100' });
		modal.find('.modal-body').append(canvas);
		var ctx = canvas[0].getContext('2d');

		var img = new Image();
		img.onload = function() {
			canvas[0].width = img.width;
			canvas[0].height = img.height;
			ctx.drawImage(img, 0, 0);

			getPhotoMetadata(photoId).then(function(metadata) {
				ctx.strokeStyle = 'red';
				$.each(metadata.faces, function(i, face) {
					face.BoundingBox.x = face.BoundingBox.Left * img.width;
					face.BoundingBox.y = face.BoundingBox.Top * img.height;
					face.BoundingBox.width = face.BoundingBox.Width * img.width;
					face.BoundingBox.height = face.BoundingBox.Height * img.height;

					ctx.strokeRect(face.BoundingBox.x, face.BoundingBox.y, face.BoundingBox.width, face.BoundingBox.height);
				});

				canvas.click((e) => {
					$.each(metadata.faces, function(i, face) {
						var mPos = getMousePos(canvas[0], e);

						if (mPos.x > face.BoundingBox.x &&
							mPos.x < face.BoundingBox.x + face.BoundingBox.width &&
							mPos.y > face.BoundingBox.y &&
							mPos.y < face.BoundingBox.y + face.BoundingBox.height) {
							faceModal.openModal(photoId, face);
						}
					});
				});
			});
		}
		img.src = `/api/photo/${photoId}`;

		modal.modal('show');
	}
}

async function getPhotoMetadata(photoId) {
	return new Promise(function(resolve, reject) {
		$.ajax({
			url: `/api/photo/${photoId}/info`,
			type: 'GET',
			success: resolve,
			error: reject
		});
	});
}

function  getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
      scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
      scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

  return {
    x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
  }
}