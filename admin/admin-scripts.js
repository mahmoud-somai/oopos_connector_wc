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

    // ===== Variables =====
    let allShops = [];
    let selected_shops = [];

    // ===== Test Connection =====
    document.getElementById('test-connection').addEventListener('click', () => {
        domainError.textContent = '';
        enseigneError.textContent = '';
        apiKeyError.textContent = '';
        connectionStatus.textContent = '';
        nextButton.disabled = true;

        const domainVal = domainInput.value.trim();
        const enseigneVal = enseigneInput.value.trim();
        const apiKeyVal = apiKeyInput.value.trim();

        let valid = true;
        if (!domainVal) { domainError.textContent = 'Invalid domain'; valid = false; }
        if (!enseigneVal) { enseigneError.textContent = 'Invalid enseigne'; valid = false; }
        if (!apiKeyVal) { apiKeyError.textContent = 'Invalid API Key'; valid = false; }
        else if (apiKeyVal.length !== 32) { apiKeyError.textContent = 'API Key must be 32 characters'; valid = false; }

        if (!valid) return;

        console.log("Testing connection with:", { domainVal, enseigneVal, apiKeyVal });

        // AJAX test
        jQuery.post(wt_iew_ajax.ajax_url, {
            action: 'wt_iew_test_connection',
            domain: domainVal,
            enseigne: enseigneVal,
            api_key: apiKeyVal,
            _wpnonce: wt_iew_ajax.nonce
        }, function(response) {
            console.log("Connection response:", response);
            if (response.success && response.data.status) {
                connectionStatus.style.color = 'green';
                connectionStatus.textContent = response.data.msg;
                nextButton.disabled = false;
            } else {
                connectionStatus.style.color = 'red';
                connectionStatus.textContent = response.data.msg || 'Connection failed';
                nextButton.disabled = true;
            }
        });
    });

    // ===== Go to Step 2 =====
    nextButton.addEventListener('click', () => {
        step1.style.display = 'none';
        step2.style.display = 'block';

        // Save step1 data
        jQuery.post(wt_iew_ajax.ajax_url, {
            action: 'wt_iew_save_step1',
            domain: domainInput.value.trim(),
            enseigne: enseigneInput.value.trim(),
            api_key: apiKeyInput.value.trim(),
            _wpnonce: wt_iew_ajax.nonce
        }, function(response) {
            console.log("Step1 Saved:", response);
        });

        // Load shops
        jQuery.post(wt_iew_ajax.ajax_url, {
            action: 'oopos_get_shops',
            _wpnonce: wt_iew_ajax.nonce
        }, function(response) {
            console.log("Shops loaded:", response);

            if (response.success && Array.isArray(response.data)) {
                allShops = response.data;

                const shopSelect = document.getElementById('shop_selected');
                if (!shopSelect) return;

                // Build shop multi-select
                shopSelect.innerHTML = '';
                allShops.forEach(shop => {
                    const option = document.createElement('option');
                    option.value = shop;
                    option.textContent = shop;
                    shopSelect.appendChild(option);
                });

                // Restore previously selected shops if any
                if (window.savedShopSelected && Array.isArray(window.savedShopSelected)) {
                    Array.from(shopSelect.options).forEach(o => {
                        if (window.savedShopSelected.includes(o.value)) o.selected = true;
                    });
                }

                // Event: update selected_shops
                shopSelect.addEventListener('change', function() {
                    selected_shops = Array.from(this.selectedOptions).map(o => o.value);
                    console.log('Selected shops:', selected_shops);
                });

                // Initialize selected_shops
                selected_shops = Array.from(shopSelect.selectedOptions).map(o => o.value);
                console.log('Initial selected shops:', selected_shops);

            } else {
                console.error("Failed to load shops:", response);
            }
        });
    });

    // ===== Navigation Buttons =====
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
