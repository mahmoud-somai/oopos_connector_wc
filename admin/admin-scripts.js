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
    let selected_shops = [];
    let allShops = [];

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

                const mainShopSelect = document.querySelector('select[name="oopos_connector_data[main_shop]"]');
                const extraShopsSelect = document.querySelector('select[name="oopos_connector_data[extra_shops][]"]');

                // Build main shop select
                mainShopSelect.innerHTML = '<option value="">-- Choose main shop --</option>';
                allShops.forEach(shop => {
                    const option = document.createElement('option');
                    option.value = shop;
                    option.textContent = shop;
                    mainShopSelect.appendChild(option);
                });

                // Build extra shops select
                extraShopsSelect.innerHTML = '';
                allShops.forEach(shop => {
                    const option = document.createElement('option');
                    option.value = shop;
                    option.textContent = shop;
                    extraShopsSelect.appendChild(option);
                });

                // ===== Functions =====
                function updateExtraShopOptions() {
                    const mainValue = mainShopSelect.value;
                    extraShopsSelect.innerHTML = '';

                    allShops.forEach(shop => {
                        if (shop !== mainValue) {
                            const opt = document.createElement('option');
                            opt.value = shop;
                            opt.textContent = shop;
                            extraShopsSelect.appendChild(opt);
                        }
                    });

                    console.log("Extra shop options updated (excluded main):", mainValue);
                }

                function updateSelectedShops() {
                    const mainValue = mainShopSelect.value;
                    const extras = Array.from(extraShopsSelect.selectedOptions).map(o => o.value);

                    selected_shops = [];
                    if (mainValue) selected_shops.push(mainValue);
                    selected_shops.push(...extras);

                    console.log("Selected shops array:", selected_shops);
                }

                // ===== Event listeners =====
                mainShopSelect.addEventListener('change', function() {
                    console.log("Main shop changed:", this.value);
                    updateExtraShopOptions();
                    updateSelectedShops();
                });

                extraShopsSelect.addEventListener('change', function() {
                    console.log("Extra shops changed:", Array.from(this.selectedOptions).map(o => o.value));
                    updateSelectedShops();
                });

                // Initialize default state
                updateExtraShopOptions();
                updateSelectedShops();
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
