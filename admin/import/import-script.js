document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('oopos-import-form');
    const result = document.getElementById('import-result');

    form.addEventListener('submit', function(e) {
        e.preventDefault(); // stop normal navigation

        // get boolean values
        const skipNew = form.querySelector('input[name="skip_new_products"]:checked').value === 'yes';
        const existingUpdate = form.querySelector('input[name="existing_products"]:checked').value === 'update';
        const emptyUpdate = form.querySelector('input[name="empty_values"]:checked').value === 'update';
        const nonce = form.querySelector('input[name="_wpnonce"]').value;

        const data = new FormData();
        data.append('action', 'oopos_save_import_settings');
        data.append('_wpnonce', nonce);
        data.append('oopos_skip_new_product', skipNew);
        data.append('oopos_existing_products', existingUpdate);
        data.append('oopos_empty_values', emptyUpdate);

        fetch(ooposImportAjax.ajax_url, {
            method: 'POST',
            credentials: 'same-origin',
            body: data
        })
        .then(response => response.json())
        .then(res => {
            if(res.success) {
                result.innerHTML = `<div style="color:green;font-weight:600;margin-top:10px;">${res.data.message}</div>`;
            } else {
                result.innerHTML = `<div style="color:red;font-weight:600;margin-top:10px;">${res.data.message || 'Error saving settings.'}</div>`;
            }
        })
        .catch(err => {
            console.error(err);
            result.innerHTML = `<div style="color:red;font-weight:600;margin-top:10px;">AJAX request failed</div>`;
        });
    });
});
