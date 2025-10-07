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

    const step4 = document.getElementById('step4');
    const toStep4Btn = document.getElementById('to-step4');
    const backStep3Btn = document.getElementById('back-step3');
    const addExtraBtn = document.getElementById('add-extra-attribute');
    const extraAttributesContainer = document.getElementById('extra-attributes-container');

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

    // ===== Update Selected Shops =====
    function updateSelectedShops() {
        const container = document.getElementById('shops-container');
        selected_shops = [];

        container.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            selected_shops.push(cb.value);
        });

        console.log('Selected shops:', selected_shops);
    }

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

        const container = document.getElementById('shops-container');

        // Initialize event listeners for all checkboxes
        container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', updateSelectedShops);
        });

        // Initialize selected shops at load
        updateSelectedShops();
    });

    // ===== Navigation Buttons =====
    document.getElementById('back-step1').addEventListener('click', () => {
        step2.style.display = 'none';
        step1.style.display = 'block';
    });
   document.getElementById('to-step3').addEventListener('click', () => {
        step2.style.display = 'none';
        step3.style.display = 'block';

        // Send selected shops to server via AJAX
        jQuery.post(wt_iew_ajax.ajax_url, {
            action: 'save_selected_shops_option',
            selected_shops: selected_shops,
            _wpnonce: wt_iew_ajax.nonce
        }, function(response) {
            console.log('Save selected shops response:', response);
        });
    });


    document.getElementById('back-step2').addEventListener('click', () => {
        step3.style.display = 'none';
        step2.style.display = 'block';
    });

    if (backStep3Btn) {
        backStep3Btn.addEventListener('click', () => {
            step4.style.display = 'none';
            step3.style.display = 'block';
        });
    }

    // ===== Add Extra Attribute Field =====
    if (addExtraBtn) {
        addExtraBtn.addEventListener('click', () => {
            const div = document.createElement('div');
            div.classList.add('extra-attribute-row');
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.gap = '10px';
            div.style.marginBottom = '8px';

            const input = document.createElement('input');
            input.type = 'text';
            input.name = 'oopos_settings_extra_attributes[]';
            input.placeholder = 'Extra attribute';
            input.style.flex = '1';

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.textContent = 'Remove';
            removeBtn.classList.add('button', 'button-secondary');

            removeBtn.addEventListener('click', () => {
                div.remove();
            });

            div.appendChild(input);
            div.appendChild(removeBtn);
            extraAttributesContainer.appendChild(div);
        });
    }
});
