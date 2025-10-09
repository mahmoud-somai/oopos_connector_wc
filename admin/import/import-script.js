// admin/import/import-script.js
jQuery(document).ready(function ($) {
    const $form = $('#oopos-import-form');
    const $result = $('#import-result');

    if (!$form.length) return; // nothing to do

    $form.on('submit', function (e) {
        e.preventDefault();

        // Clear previous result
        $result.html('');

        // read radio values
        const skipNewProducts = $('input[name="skip_new_products"]:checked').val() === 'yes';
        const existingProducts = $('input[name="existing_products"]:checked').val() === 'update';
        const emptyValues = $('input[name="empty_values"]:checked').val() === 'update';

        // Build payload.
        // Send both the original form-names and also prefixed boolean keys (for server versions that expect them).
        const data = {
            action: 'oopos_save_import_settings',
            _wpnonce: (typeof ooposImportAjax !== 'undefined' ? ooposImportAjax.nonce : $('input[name="_wpnonce"]').val()),
            skip_new_products: skipNewProducts ? 'yes' : 'no',
            existing_products: existingProducts ? 'update' : 'skip',
            empty_values: emptyValues ? 'update' : 'skip',
            // also send boolean-typed keys in case server checks those
            oopos_skip_new_product: skipNewProducts,
            oopos_existing_products: existingProducts,
            oopos_empty_values: emptyValues
        };

        // Use localized ajax url if available
        const ajaxUrl = (typeof ooposImportAjax !== 'undefined' && ooposImportAjax.ajax_url) ? ooposImportAjax.ajax_url : ajaxurl;

        // disable button to avoid double clicks
        const $btn = $form.find('button[type="submit"]');
        $btn.prop('disabled', true);

        $.post(ajaxUrl, data)
            .done(function (response) {
                if (response && response.success) {
                    $result.html('<div class="notice success" style="color:green;font-weight:600;">' + (response.data.message || 'Import settings saved') + '</div>');
                } else {
                    const msg = (response && response.data && response.data.message) ? response.data.message : 'Error saving settings.';
                    $result.html('<div class="notice error" style="color:red;font-weight:600;">' + msg + '</div>');
                }
            })
            .fail(function (xhr, status, err) {
                console.error('AJAX Error:', status, err, xhr && xhr.responseText);
                $result.html('<div class="notice error" style="color:red;font-weight:600;">AJAX request failed — check browser console</div>');
            })
            .always(function () {
                $btn.prop('disabled', false);
            });
    });
});
