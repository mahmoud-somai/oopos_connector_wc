document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('oopos-import-form');
    const resultDiv = document.getElementById('import-result');

    if (!form) return;

    const step1 = form.querySelector('[data-step="1"]');
    const step2 = form.querySelector('[data-step="2"]');
    const backBtn = document.getElementById('back-btn');
    const startImportBtn = document.getElementById('start-import-btn');

    // Overlay elements
    const overlay = document.getElementById('oopos-overlay');
    const closeBtn = document.getElementById('close-overlay-btn');
    const step1Status = document.getElementById('step1');
    const step2Status = document.getElementById('step2');
    const step3Status = document.getElementById('step3');
    const step4Status = document.getElementById('step4');

    // Create "Next" button
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.textContent = 'Next';
    nextBtn.className = 'button button-primary';
    nextBtn.style.display = 'none';
    step1.querySelector('.submit-section').appendChild(nextBtn);

    /* --------------------
       STEP 1: Save Settings
    -------------------- */
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const skipNewProducts = (document.querySelector('input[name="skip_new_products"]:checked')?.value === 'yes') || false;
        const existingProducts = (document.querySelector('input[name="existing_products"]:checked')?.value === 'update') || false;
        const emptyValues = (document.querySelector('input[name="empty_values"]:checked')?.value === 'update') || false;
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
                setTimeout(() => { resultDiv.innerHTML = ''; }, 3000);
                nextBtn.style.display = 'inline-block';
            } else {
                resultDiv.innerHTML = `<div style="color:red;font-weight:600;margin-top:10px;">${res.data.message || 'Error saving settings.'}</div>`;
            }
        })
        .catch(err => {
            console.error('AJAX Error:', err);
            resultDiv.innerHTML = `<div style="color:red;font-weight:600;margin-top:10px;">AJAX request failed.</div>`;
        });
    });

    /* --------------------
       STEP 2: Navigation
    -------------------- */
    nextBtn.addEventListener('click', function() {
        step1.style.display = 'none';
        step2.style.display = 'block';
    });

    backBtn.addEventListener('click', function() {
        step2.style.display = 'none';
        step1.style.display = 'block';
    });

    /* --------------------
       STEP 3: Start Import
    -------------------- */
startImportBtn.addEventListener('click', function() {
    overlay.style.display = 'flex';
    closeBtn.style.display = 'none';

    // Reset steps UI
    [step1Status, step2Status, step3Status].forEach(el => {
        el.textContent = el.textContent.replace('✅', '⏳').replace('❌', '⏳');
        el.style.color = '';
    });

    // Step 1
    step1Status.textContent = '✅ Starting import process...';

    const data = new URLSearchParams();
    data.append('action', 'oopos_start_import_products');

    fetch(ooposImportAjax.ajax_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data.toString()
    })
    .then(res => res.json())
    .then(res => {
        // Step 2
        step2Status.textContent = '✅ Fetching products...';

        if (res.success) {
            // Step 3 (final)
            setTimeout(() => {
                step3Status.textContent = '✅ File created successfully.';
                step3Status.style.color = 'green';
                closeBtn.style.display = 'inline-block';
            }, 800);

            resultDiv.innerHTML = `
                <div style="color:green;font-weight:600;margin-top:10px;">
                    ${res.data.message} <br>
                    File saved at: <a href="${res.data.file}" target="_blank">res.json</a>
                </div>`;
        } else {
            step3Status.textContent = `❌ ${res.data.message || 'Error importing products.'}`;
            step3Status.style.color = 'red';
            closeBtn.style.display = 'inline-block';
        }
    })
    .catch(err => {
        console.error('AJAX Error:', err);
        step3Status.textContent = '❌ AJAX request failed.';
        step3Status.style.color = 'red';
        closeBtn.style.display = 'inline-block';
    });
});

    /* --------------------
       CLOSE OVERLAY
    -------------------- */
    closeBtn.addEventListener('click', function() {
        overlay.style.display = 'none';
    });
});
