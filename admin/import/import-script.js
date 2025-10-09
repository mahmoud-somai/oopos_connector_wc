document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('oopos-import-form');
    const resultDiv = document.getElementById('import-result');

    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault(); // prevent page reload

        const skipNewProducts = document.querySelector('input[name="skip_new_products"]:checked').value === 'yes';
        const existingProducts = document.querySelector('input[name="existing_products"]:checked').value === 'update';
        const emptyValues = document.querySelector('input[name="empty_values"]:checked').value === 'update';
        const nonce = document.querySelector('input[name="_wpnonce"]').value;

        const data = new URLSearchParams();
        data.append('action', 'oopos_save_import_settings');
        data.append('_wpnonce', nonce);
        data.append('oopos_skip_new_product', skipNewProducts);
        data.append('oopos_existing_products', existingProducts);
        data.append('oopos_empty_values', emptyValues);

        fetch(ooposImportAjax.ajax_url, {
            method: 'POST',
            body: data
        })
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                resultDiv.innerHTML = `<div style="color:green;font-weight:600;margin-top:10px;">${res.data.message}</div>`;
            } else {
                resultDiv.innerHTML = `<div style="color:red;font-weight:600;margin-top:10px;">${res.data.message || 'Error saving settings.'}</div>`;
            }
        })
        .catch(err => {
            console.error('AJAX Error:', err);
            resultDiv.innerHTML = `<div style="color:red;font-weight:600;margin-top:10px;">AJAX request failed.</div>`;
        });
    });
});
