document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('oopos-import-form');
    if (!form) return;

    const step1 = form.querySelector('[data-step="1"]');
    const step2 = form.querySelector('[data-step="2"]');
    const backBtn = document.getElementById('back-btn');
    const startImportBtn = document.getElementById('start-import-btn');
    const resultDiv = document.getElementById('import-result');

    const overlay = document.getElementById('oopos-overlay');
    const closeBtn = document.getElementById('close-overlay-btn');
    const step1Status = document.getElementById('step1');
    const step2Status = document.getElementById('step2');
    const step3Status = document.getElementById('step3');

    // ✅ Step 1 → Save Settings
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const skipNewProducts = (document.querySelector('input[name="skip_new_products"]:checked')?.value === 'yes');
        const existingProducts = (document.querySelector('input[name="existing_products"]:checked')?.value === 'update');
        const emptyValues = (document.querySelector('input[name="empty_values"]:checked')?.value === 'update');
        const nonce = document.querySelector('input[name="_wpnonce"]').value;

        const data = new URLSearchParams();
        data.append('action', 'oopos_save_import_settings');
        data.append('_wpnonce', nonce);
        data.append('oopos_skip_new_product', skipNewProducts);
        data.append('oopos_existing_products', existingProducts);
        data.append('oopos_empty_values', emptyValues);

        fetch(ooposImportAjax.ajax_url, { method: 'POST', body: data })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    resultDiv.innerHTML = `<div style="color:green;">${res.data.message}</div>`;
                    setTimeout(() => resultDiv.innerHTML = '', 2000);
                    step1.style.display = 'none';
                    step2.style.display = 'block';
                } else {
                    resultDiv.innerHTML = `<div style="color:red;">${res.data.message || 'Error saving settings.'}</div>`;
                }
            })
            .catch(() => resultDiv.innerHTML = `<div style="color:red;">AJAX request failed.</div>`);
    });

    // Back button
    backBtn.addEventListener('click', () => {
        step2.style.display = 'none';
        step1.style.display = 'block';
    });

    // ✅ Step 2 → Start Import
    startImportBtn.addEventListener('click', function() {
        overlay.style.display = 'flex';
        closeBtn.style.display = 'none';

        // Reset overlay steps
        [step1Status, step2Status, step3Status].forEach(s => {
            s.textContent = s.textContent.replace('✅', '⏳').replace('❌', '⏳');
            s.style.color = '';
        });

        // Step 1 done immediately
        step1Status.textContent = '✅ Starting import process...';
        step1Status.style.color = 'green';

        // Step 2 → fetching
        step2Status.textContent = '⏳ Fetching products...';
        step2Status.style.color = 'blue';

        const data = new URLSearchParams();
        data.append('action', 'oopos_start_import_products');

        fetch(ooposImportAjax.ajax_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: data.toString()
        })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                // Step 2 done
                step2Status.textContent = '✅ Products fetched successfully.';
                step2Status.style.color = 'green';

                // Step 3 → file creation
                step3Status.textContent = '⏳ Creating file...';
                step3Status.style.color = 'blue';

                setTimeout(() => {
                    step3Status.textContent = '✅ File created successfully.';
                    step3Status.style.color = 'green';
                    closeBtn.style.display = 'inline-block';
                }, 1000);

                resultDiv.innerHTML = `
                    <div style="color:green;">
                        ${res.data.message} <br>
                        File saved at: <a href="${res.data.file}" target="_blank">res.json</a>
                    </div>`;
            } else {
                step2Status.textContent = '❌ Error fetching products.';
                step2Status.style.color = 'red';
                closeBtn.style.display = 'inline-block';
            }
        })
        .catch(err => {
            console.error(err);
            step2Status.textContent = '❌ AJAX request failed.';
            step2Status.style.color = 'red';
            closeBtn.style.display = 'inline-block';
        });
    });

    // Close overlay
    closeBtn.addEventListener('click', function() {
        overlay.style.display = 'none';
    });
});
