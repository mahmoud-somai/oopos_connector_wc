jQuery(document).ready(function($) {
    $('#oopos-import-form').on('submit', function(e) {
        e.preventDefault();

        const fileInput = $('#import-file')[0];
        if (!fileInput.files.length) {
            alert('Please select a file to import.');
            return;
        }

        const formData = new FormData();
        formData.append('action', 'oopos_handle_import');
        formData.append('import_file', fileInput.files[0]);
        formData.append('_wpnonce', wt_iew_ajax.nonce);

        $.ajax({
            url: wt_iew_ajax.ajax_url,
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                if (response.success) {
                    $('#import-result').html('<p style="color:green;">' + response.data.message + '</p>');
                } else {
                    $('#import-result').html('<p style="color:red;">' + response.data.message + '</p>');
                }
            },
            error: function() {
                alert('AJAX error. Please check console.');
            }
        });
    });
});
