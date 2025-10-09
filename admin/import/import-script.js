document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('oopos-import-form');
    const resultDiv = document.getElementById('import-result');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Always read values or set default
        const skipRadio = document.querySelector('input[name="skip_new_products"]:checked');
        const skipNewProducts = skipRadio ? skipRadio.value === 'yes' : false;

        const existingRadio = document.querySelector('input[name="existing_products"]:checked');
        const existingProducts = existingRadio ? existingRadio.value === 'update' : false;

        const emptyRadio = document.querySelector('input[name="empty_values"]:checked');
        const emptyValues = emptyRadio ? emptyRadio.value === 'update' : false;

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
        .then(res => res.json())
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
