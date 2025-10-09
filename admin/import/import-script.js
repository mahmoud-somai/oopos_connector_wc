document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('oopos-import-form');

    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        formData.append('action', 'oopos_save_import_settings');
        formData.append('_wpnonce', ooposImportAjax.nonce);

        fetch(ooposImportAjax.ajax_url, {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                const resultDiv = document.getElementById('import-result');
                if (data.success) {
                    resultDiv.innerHTML =
                        '<div class="notice notice-success"><p>' +
                        data.data.message +
                        '</p></div>';
                } else {
                    resultDiv.innerHTML =
                        '<div class="notice notice-error"><p>Failed to save settings.</p></div>';
                }
            })
            .catch((error) => {
                console.error('AJAX Error:', error);
                document.getElementById('import-result').innerHTML =
                    '<div class="notice notice-error"><p>Unexpected error occurred.</p></div>';
            });
    });
});
