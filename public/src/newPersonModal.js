var modal = $('<div>', { 'class': 'modal fade', id: 'newPersonModal', tabindex: '-1', role: 'dialog'}).append(
	$('<div>', { 'class': 'modal-dialog modal-dialog-centered', role: 'document' }).append(
		$('<div>', { 'class': 'modal-content' }).append(
			$('<div>', { 'class': 'modal-header' }).append(
				$('<h5>', { 'class': 'modal-title', text: 'New Person'})
			).append(
				$('<button>', { type: 'button', 'class': 'close', 'data-dismiss': 'modal', 'aria-label': 'close' }).append(
					$('<span>', { 'aria-hidden': 'true', html: '&times' })
				)
			)
		).append(
			$('<div>', { 'class': 'modal-body' }).append(
				$('<div>', { 'class': 'input-group' }).append(
					$('<div>', { 'class': 'input-group-prepend' }).append(
						$('<span>', { 'class': 'input-group-text', text: 'Name'})
					),
					$('<input>', { 'class': 'form-control', type: 'text', id: 'name' })
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
	openModal: function(callback) {
		if (!$('#newPersonModal').length) {
			createModal()
		}

		var nameInput = modal.find('#name');
		var buttonArea = modal.find('.modal-footer');
		buttonArea.empty();
		buttonArea.append(
			$('<button>', {'class': 'btn btn-primary', text: 'Create new person' }).click(function() {
				modal.modal('hide');
				callback(nameInput.val());
			})
		);

		modal.modal('show');
	}
}