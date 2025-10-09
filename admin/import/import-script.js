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
jQuery(document).ready(function ($) {
    const overlay = $('#oopos-overlay');
    const closeBtn = $('#close-overlay-btn');

    $('#start-import-btn').on('click', function () {
        overlay.fadeIn(300); // show overlay
        $('#step1').text('✅ Starting import process...');
        
        // simulate steps or replace with AJAX
        setTimeout(() => $('#step2').text('✅ Fetching products...'), 1000);
        setTimeout(() => $('#step3').text('✅ Products fetched successfully!'), 2000);
        setTimeout(() => {
            $('#step4').text('✅ File created successfully!');
            closeBtn.show();
        }, 3000);
    });

    closeBtn.on('click', function () {
        overlay.fadeOut(300);
    });
});


    // Close overlay
    closeBtn.addEventListener('click', function() {
        overlay.style.display = 'none';
    });
});
