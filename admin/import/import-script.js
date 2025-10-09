document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('oopos-import-form');
    const resultDiv = document.getElementById('import-result');

    if (!form) return;

    const step1 = form.querySelector('[data-step="1"]');
    const step2 = form.querySelector('[data-step="2"]');
    

    // Create Next button but keep it hidden initially
    let nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.textContent = 'Next';
    nextBtn.className = 'button button-primary';
    nextBtn.style.display = 'none'; // hidden at start
    step1.querySelector('.submit-section').appendChild(nextBtn);

    const backBtn = document.getElementById('back-btn');
    const startImportBtn = document.getElementById('start-import-btn');

    // Step 1: Save settings
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

        console.log('Sending AJAX data:', {skipNewProducts, existingProducts, emptyValues, nonce});

        fetch(ooposImportAjax.ajax_url, {
            method: 'POST',
            body: data
        })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                resultDiv.innerHTML = `<div style="color:green;font-weight:600;margin-top:10px;">${res.data.message}</div>`;
                setTimeout(() => { resultDiv.innerHTML = ''; }, 3000);

                // Show Next button after saving
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

    // Step 1: Next button click → show Step 2
    nextBtn.addEventListener('click', function() {
        step1.style.display = 'none';
        step2.style.display = 'block';
    });

    // Step 2: Back button
    backBtn.addEventListener('click', function() {
        step2.style.display = 'none';
        step1.style.display = 'block';
    });

    // Step 2: Start Import button
startImportBtn.addEventListener('click', function() {
    const resultDiv = document.getElementById('import-result');

    resultDiv.innerHTML = `<div style="color:blue;font-weight:600;margin-top:10px;">Importing products...</div>`;

    // Use FormData or URLSearchParams
    const data = new URLSearchParams();
    data.append('action', 'oopos_start_import_products');

    fetch(ooposImportAjax.ajax_url, {
        method: 'POST', // change GET → POST
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded', // required for URLSearchParams
        },
        body: data.toString()
    })
    .then(res => res.json())
    .then(res => {
        if (res.success) {
            resultDiv.innerHTML = `<div style="color:green;font-weight:600;margin-top:10px;">
                ${res.data.message} <br> 
                File saved at: <a href="${res.data.file}" target="_blank">res.json</a>
            </div>`;
        } else {
            resultDiv.innerHTML = `<div style="color:red;font-weight:600;margin-top:10px;">
                ${res.data.message || 'Error importing products.'}
            </div>`;
        }
    })
    .catch(err => {
        console.error('AJAX Error:', err);
        resultDiv.innerHTML = `<div style="color:red;font-weight:600;margin-top:10px;">
            AJAX request failed.
        </div>`;
    });
});

});
