import newPersonModal from './newPersonModal';

var modal = $('<div>', { 'class': 'modal fade', id: 'faceView', tabindex: '-1', role: 'dialog'}).append(
	$('<div>', { 'class': 'modal-dialog modal-dialog-centered', role: 'document' }).append(
		$('<div>', { 'class': 'modal-content' }).append(
			$('<div>', { 'class': 'modal-header' }).append(
				$('<h5>', { 'class': 'modal-title' })
			).append(
				$('<button>', { type: 'button', 'class': 'close', 'data-dismiss': 'modal', 'aria-label': 'close' }).append(
					$('<span>', { 'aria-hidden': 'true', html: '&times' })
				)
			)
		).append(
			$('<div>', { 'class': 'modal-body' }).append(
				$('<div>', { 'class': 'mx-auto', style: 'width: 200px'}).append(
					$('<canvas>', { 'class': 'w-100' })
				)
			),
			$('<div>', { 'class': 'modal-footer' })
		)
	)
);

function createModal() {
	$('body').append(modal);
}

export default {
	openModal: function(photoId, face) {
		if (!$('#faceView').length) {
			createModal()
		}

		var buttonArea = modal.find('.modal-footer');
		buttonArea.empty();

		if (face.personId == undefined) {
			modal.find('.modal-title').text('Unknown Face');

			buttonArea.append(
				$('<button>', {'class': 'btn btn-primary', text: 'Add new person' }).click(function() {
					newPersonModal.openModal(async function(name) {
						var personId = await createNewPerson(name);
						await addFaceToPerson(personId, photoId, face.id);
					});
				}),
				$('<button>', {'class': 'btn btn-primary', text: 'Match' }).click(function() {
					matchFace(photoId, face.id);
				})
			);
		} else {
			getPersonData(face.personId).then(function(person) {
				modal.find('.modal-title').text(person.name);
			});
		}

		var canvas = modal.find('canvas');
		var ctx = canvas[0].getContext('2d');
		var img = new Image();
		img.onload = function() {
			canvas[0].width = img.width;
			canvas[0].height = img.height;
			ctx.drawImage(img, 0, 0);
		}
		img.src = `/api/photo/${photoId}/face/${face.id}`;

		modal.modal('show');
	}
}

async function getPersonData(personId) {
	return new Promise(function(resolve, reject) {
		$.ajax({
			url: `/api/person/${personId}`,
			type: 'GET',
			success: resolve,
			error: reject
		});
	});
}

async function createNewPerson(name) {
	return new Promise(function(resolve, reject) {
		$.ajax({
			url: `/api/person/create`,
			type: 'POST',
			contentType: 'application/json',
			dataType: 'text',
			data: JSON.stringify({ name: name }),
			success: resolve,
			error: reject
		});
	});
}

async function addFaceToPerson(personId, photoId, faceId) {
	return new Promise(function(resolve, reject) {
		$.ajax({
			url: `/api/person/${personId}/addFace`,
			type: 'POST',
			contentType: "application/json",
			data: JSON.stringify({ 
				photoId: photoId,
				faceId: faceId
			}),
			success: resolve,
			error: reject
		});
	});
}

async function matchFace(photoId, faceId) {
	return new Promise(function(resolve, reject) {
		$.ajax({
			url: `/api/photo/${photoId}/face/${faceId}/match`,
			type: 'POST',
			success: resolve,
			error: reject
		});
	});
}