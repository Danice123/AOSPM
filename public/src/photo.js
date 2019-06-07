require('popper.js');
require('bootstrap');
import '../node_modules/font-awesome/css/font-awesome.css';
import '../node_modules/bootstrap/dist/css/bootstrap.css';

import imageModal from './imageModal';

async function getPhotoList() {
	return new Promise(function(resolve, reject) {
		$.ajax({
			url: '/api/query',
			type: 'GET',
			success: resolve,
			error: reject
		});
	});
}

async function uploadPhoto(photo) {
	var data = new FormData();
	data.append('photo', photo);
	return new Promise(function(resolve, reject) {
		$.ajax({
			url: '/api/photo/upload',
			type: 'PUT',
			data: data,
			processData: false,
			contentType: false,
			success: resolve,
			error: reject
		});
	});
}

function buildPhotoCard(photoId) {
	return $('<div>', { 'class': 'col-md-4 col-lg-3 col-xl-2' }).append(
		$('<div>', { 'class': 'card' }).append(
			$('<img>', { 'class': 'card-img', src: `/api/photo/${photoId}` }),
			$('<div>', { 'class': 'card-img-overlay' }).append(
				$('<h5>', { 'class': 'card-title text-white', text: 'Card Title' })
			)
		).click(function() {
			imageModal.openModal(photoId);
		})
	);
}

$(document).ready(function() {

	$('html').on('dragover', function(event) {
		$('#upload-text').removeClass('invisible');
		event.preventDefault();  
		event.stopPropagation();
	});

	$('html').on('dragleave', function(event) {
		$('#upload-text').addClass('invisible');
		event.preventDefault();  
		event.stopPropagation();
	});

	$('html').on('drop', function(event) {
		$('#upload-text').addClass('invisible');
		event.preventDefault();  
		event.stopPropagation();

		$.each(event.originalEvent.dataTransfer.items, function(i, item) {
			if (item.kind === 'file') {
				uploadPhoto(item.getAsFile());
			}
		})
	});

	getPhotoList().then(function(list) {
		$.each(list, function(i, photo) {
			$('#photo-deck').append(buildPhotoCard(photo.id));
		})
	});
});