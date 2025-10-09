document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('oopos-import-form');
    const resultDiv = document.getElementById('import-result');

    if (!form) return;

    const step1 = form.querySelector('[data-step="1"]');
    const step2 = form.querySelector('[data-step="2"]');

    // Create overlay dynamically
    const overlay = document.createElement('div');
    overlay.id = 'oopos-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.7)';
    overlay.style.display = 'none';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';
    overlay.innerHTML = `
        <div id="oopos-overlay-content" style="
            background: #fff;
            padding: 30px;
            border-radius: 10px;
            width: 400px;
            text-align: center;
            font-family: sans-serif;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        ">
            <h2 style="margin-bottom:20px;">Importing Products</h2>
            <div id="workflow-steps" style="text-align:left; font-size:15px;">
                <div id="step1-status">1️⃣ Starting importing products process...</div>
                <div id="step2-status" style="opacity:0.5;">2️⃣ Fetching products...</div>
                <div id="step3-status" style="opacity:0.5;">3️⃣ Products fetched successfully.</div>
                <div id="step4-status" style="opacity:0.5;">4️⃣ File created successfully.</div>
            </div>
            <button id="close-overlay-btn" class="button button-secondary" style="margin-top:20px; display:none;">Close</button>
        </div>
    `;
    document.body.appendChild(overlay);

    const closeBtn = document.getElementById('close-overlay-btn');

    // Next button (hidden initially)
    let nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.textContent = 'Next';
    nextBtn.className = 'button button-primary';
    nextBtn.style.display = 'none';
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

    // Step 1 → Step 2
    nextBtn.addEventListener('click', function() {
        step1.style.display = 'none';
        step2.style.display = 'block';
    });

    // Back button
    backBtn.addEventListener('click', function() {
        step2.style.display = 'none';
        step1.style.display = 'block';
    });

    // Step 2: Start Import button
  startImportBtn.addEventListener('click', function() {
        overlay.style.display = 'flex';
        closeBtn.style.display = 'none';

        // Reset all steps to ⏳
        [step1Status, step2Status, step3Status, step4Status].forEach(el => {
            el.textContent = el.textContent.replace('✅', '⏳').replace('❌', '⏳');
            el.style.color = '';
        });

        // Step 1
        step1Status.textContent = '✅ Starting import process...';
        step1Status.style.color = 'green';

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
            step2Status.style.color = 'green';

            if (res.success) {
                // Step 3
                step3Status.textContent = '✅ Products fetched successfully.';
                step3Status.style.color = 'green';

                // Step 4 (file creation)
                setTimeout(() => {
                    step4Status.textContent = '✅ File created successfully.';
                    step4Status.style.color = 'green';
                    closeBtn.style.display = 'inline-block'; // show close button
                }, 1000);

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



    // Close overlay
    closeBtn.addEventListener('click', function() {
        overlay.style.display = 'none';
    });
});
