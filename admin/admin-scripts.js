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
        });

        // Load shops via AJAX
        jQuery.post(wt_iew_ajax.ajax_url, {
            action: 'oopos_get_shops',
            _wpnonce: wt_iew_ajax.nonce
        }, function(response) {
            if (response.success && Array.isArray(response.data)) {
                allShops = response.data;

                const container = document.getElementById('shops-container');
                const addBtn = document.getElementById('add-shop');

                // ===== Functions =====
                function updateSelectedShops() {
                    selected_shops = Array.from(container.querySelectorAll('.shop-select'))
                        .map(select => select.value)
                        .filter(v => v);
                    console.log('Selected shops:', selected_shops);
                }

                function addShopRow(selected = '') {
                    const div = document.createElement('div');
                    div.classList.add('shop-row');
                    div.innerHTML = `
                        <label>Extra Shop:</label>
                        <select name="oopos_connector_data[shop_selected][]" class="shop-select">
                            <option value="">-- Choose shop --</option>
                            ${allShops.map(shop => `<option value="${shop}" ${shop === selected ? 'selected' : ''}>${shop}</option>`).join('')}
                        </select>
                        <button type="button" class="remove-shop">Remove</button>
                    `;
                    container.appendChild(div);

                    // Event listeners for this row
                    div.querySelector('.remove-shop').addEventListener('click', () => {
                        div.remove();
                        updateSelectedShops();
                    });
                    div.querySelector('.shop-select').addEventListener('change', updateSelectedShops);

                    updateSelectedShops();
                }

                // ===== Initialize existing shops (checkboxes from PHP) =====
                container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                    checkbox.addEventListener('change', updateSelectedShops);
                });

                // ===== Add button =====
                addBtn.addEventListener('click', e => {
                    e.preventDefault();
                    addShopRow();
                });

                // Initialize selected_shops at load
                updateSelectedShops();
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
