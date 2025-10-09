document.addEventListener('DOMContentLoaded', function() {

    const form = document.getElementById('oopos-import-form');
    const resultDiv = document.getElementById('import-result');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const skipNew = document.querySelector('input[name="skip_new_products"]:checked').value === 'yes';
        const existingUpdate = document.querySelector('input[name="existing_products"]:checked').value === 'update';
        const emptyUpdate = document.querySelector('input[name="empty_values"]:checked').value === 'update';
        const nonce = document.querySelector('input[name="_wpnonce"]').value;

        const data = new FormData();
        data.append('action', 'oopos_save_import_settings');
        data.append('_wpnonce', nonce);
        data.append('oopos_skip_new_product', skipNew);
        data.append('oopos_existing_products', existingUpdate);
        data.append('oopos_empty_values', emptyUpdate);

        fetch(ooposImportAjax.ajax_url, {
            method: 'POST',
            body: data,
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(resp => {
            if (resp.success) {
                resultDiv.innerHTML = `<div style="color:green;font-weight:600;margin-top:10px;">${resp.data.message}</div>`;
            } else {
                resultDiv.innerHTML = `<div style="color:red;font-weight:600;margin-top:10px;">${resp.data.message || 'Error saving settings.'}</div>`;
            }
        })
        .catch(err => {
            console.error('AJAX error', err);
            resultDiv.innerHTML = `<div style="color:red;font-weight:600;margin-top:10px;">AJAX request failed. Check console.</div>`;
        });
    });

});
