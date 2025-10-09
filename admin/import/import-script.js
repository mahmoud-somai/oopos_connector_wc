jQuery(document).ready(function ($) {
    $('#oopos-import-form').on('submit', function (e) {
        e.preventDefault();

        // Convert radio values to booleans before sending
        const skipNewProducts = $('input[name="skip_new_products"]:checked').val() === 'yes';
        const existingProducts = $('input[name="existing_products"]:checked').val() === 'update';
        const emptyValues = $('input[name="empty_values"]:checked').val() === 'update';

        const data = {
            action: 'oopos_save_import_settings',
            _wpnonce: $('input[name="_wpnonce"]').val(),
            oopos_skip_new_product: skipNewProducts,
            oopos_existing_products: existingProducts,
            oopos_empty_values: emptyValues
        };

        // Send AJAX request
        $.post(ajaxurl, data, function (response) {
            if (response.success) {
                $('#import-result').html(
                    `<div style="color:green;font-weight:600;">${response.data.message}</div>`
                );
            } else {
                $('#import-result').html(
                    `<div style="color:red;font-weight:600;">${response.data.message || 'Error saving settings.'}</div>`
                );
            }
        }).fail(function (xhr) {
            console.error('AJAX Error:', xhr);
            $('#import-result').html(
                `<div style="color:red;font-weight:600;">AJAX request failed. Check console.</div>`
            );
        });
    });
});
