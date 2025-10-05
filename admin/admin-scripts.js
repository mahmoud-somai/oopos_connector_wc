document.addEventListener('DOMContentLoaded', function() {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');

    const domainInput = document.getElementById('domain');
    const enseigneInput = document.getElementById('enseigne');
    const apiKeyInput = document.getElementById('api_key');

    const domainError = document.getElementById('domain-error');
    const enseigneError = document.getElementById('enseigne-error');
    const apiKeyError = document.getElementById('apikey-error');

    const nextButton = document.getElementById('to-step2');
    const connectionStatus = document.getElementById('connection-status');

    // ===== Test Connection button handler =====
    document.getElementById('test-connection').addEventListener('click', () => {
        // Reset errors and connection status
        domainError.textContent = '';
        enseigneError.textContent = '';
        apiKeyError.textContent = '';
        connectionStatus.textContent = '';
        nextButton.disabled = true;

        const domainVal = domainInput.value.trim();
        const enseigneVal = enseigneInput.value.trim();
        const apiKeyVal = apiKeyInput.value.trim();

        let valid = true;

        if (!domainVal) {
            domainError.textContent = 'Invalid domain';
            valid = false;
        }
        if (!enseigneVal) {
            enseigneError.textContent = 'Invalid enseigne';
            valid = false;
        }
        if (!apiKeyVal) {
            apiKeyError.textContent = 'Invalid API Key';
            valid = false;
        } else if (apiKeyVal.length !== 32) {
            apiKeyError.textContent = 'API Key must be 32 characters';
            valid = false;
        }

        if (!valid) return;

        // AJAX call to test connection
        jQuery.post(wt_iew_ajax.ajax_url, {
            action: 'wt_iew_test_connection',
            domain: domainVal,
            enseigne: enseigneVal,
            api_key: apiKeyVal,
            _wpnonce: wt_iew_ajax.nonce
        }, function(response) {
            if (response.success && response.data.status) {
                connectionStatus.style.color = 'green';
                connectionStatus.textContent = response.data.msg;
                nextButton.disabled = false; // Enable Next
            } else {
                connectionStatus.style.color = 'red';
                connectionStatus.textContent = response.data.msg || 'Connection failed';
                nextButton.disabled = true; // Keep Next disabled
            }
        });
    });

    // ===== Go to Step 2 =====
    nextButton.addEventListener('click', () => {
        step1.style.display = 'none';
        step2.style.display = 'block';

        // Save credentials (Step 1)
        const data = {
            action: 'wt_iew_save_step1',
            domain: domainInput.value.trim(),
            enseigne: enseigneInput.value.trim(),
            api_key: apiKeyInput.value.trim(),
            _wpnonce: wt_iew_ajax.nonce
        };
        jQuery.post(wt_iew_ajax.ajax_url, data, function(response) {
            console.log("Step1 Saved", response);
        });

        // 🟢 Load shops dynamically from database
        jQuery.post(wt_iew_ajax.ajax_url, {
            action: 'oopos_get_shops',
            _wpnonce: wt_iew_ajax.nonce
        }, function(response) {
            const selects = ['#main_shop', '#shop2', '#shop3'];

            if (response.success && Array.isArray(response.data)) {
                selects.forEach(sel => {
                    const select = document.querySelector(sel);
                    select.innerHTML = '<option value="">-- Select Shop --</option>';
                    response.data.forEach(shop => {
                        const option = document.createElement('option');
                        option.value = shop;
                        option.textContent = shop;
                        select.appendChild(option);
                    });
                    select.disabled = false;
                });
            } else {
                selects.forEach(sel => {
                    const select = document.querySelector(sel);
                    select.innerHTML = '<option value="">No shops found</option>';
                    select.disabled = true;
                });
            }
        });
    });

    // ===== Back / Next Navigation =====
    document.getElementById('back-step1').addEventListener('click', () => {
        step2.style.display = 'none';
        step1.style.display = 'block';
    });

    document.getElementById('to-step3').addEventListener('click', () => {
        step2.style.display = 'none';
        step3.style.display = 'block';
    });

    document.getElementById('back-step2').addEventListener('click', () => {
        step3.style.display = 'none';
        step2.style.display = 'block';
    });
});
