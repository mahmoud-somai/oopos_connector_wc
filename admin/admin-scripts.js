document.addEventListener('DOMContentLoaded', function () {

    // ===== Step Elements =====
    const stepEls = Array.from(document.querySelectorAll('.step'));
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const step4 = document.getElementById('step4');

    // ===== Step 1 Elements =====
    const domainInput = document.getElementById('domain');
    const enseigneInput = document.getElementById('enseigne');
    const apiKeyInput = document.getElementById('api_key');

    const domainError = document.getElementById('domain-error');
    const enseigneError = document.getElementById('enseigne-error');
    const apiKeyError = document.getElementById('apikey-error');

    const btnTestConnection = document.getElementById('test-connection');
    const btnToStep2 = document.getElementById('to-step2');
    const connectionStatus = document.getElementById('connection-status');

    // ===== Step 2 Elements =====
    const shopsContainer = document.getElementById('shops-container');
    const btnToStep3 = document.getElementById('to-step3');
    const btnBackStep2 = document.getElementById('back-step2');

    // ===== Step 3 Elements =====
    const inputSize = document.getElementById('size');
    const inputColor = document.getElementById('color');

    const btnBackStep3 = document.getElementById('back-step3');
    const btnToStep4 = document.getElementById('to-step4');

    const btnBackStep4 = document.getElementById('back-step4');

    // ===== Step 4 Extras =====
    const addExtraBtn = document.getElementById('add-extra-attribute');
    const extrasContainer = document.getElementById('extra-attributes-container');

    // ===== State =====
    let selected_shops = [];

    // ===== Helpers =====
    function showStep(el) {
        stepEls.forEach(s => { if (!s) return; s.style.display = (s === el) ? 'block' : 'none'; });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateSelectedShops() {
        selected_shops = [];
        if (!shopsContainer) return;
        shopsContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            selected_shops.push(cb.value);
        });
    }

    function escapeHtml(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>"'`=\/]/g, function (s) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '/': '&#x2F;',
                '`': '&#x60;',
                '=': '&#x3D;'
            })[s];
        });
    }

    // ===== Step 1: Test Connection =====
    if (btnTestConnection) {
        btnTestConnection.addEventListener('click', function () {
            if (domainError) domainError.textContent = '';
            if (enseigneError) enseigneError.textContent = '';
            if (apiKeyError) apiKeyError.textContent = '';
            if (connectionStatus) { connectionStatus.textContent = ''; connectionStatus.style.color = ''; }
            if (btnToStep2) btnToStep2.disabled = true;

            const domainVal = domainInput?.value.trim() || '';
            const enseigneVal = enseigneInput?.value.trim() || '';
            const apiKeyVal = apiKeyInput?.value.trim() || '';

            let valid = true;
            if (!domainVal) { if (domainError) domainError.textContent = 'Invalid domain'; valid = false; }
            if (!enseigneVal) { if (enseigneError) enseigneError.textContent = 'Invalid enseigne'; valid = false; }
            if (!apiKeyVal) { if (apiKeyError) apiKeyError.textContent = 'Invalid API Key'; valid = false; }
            else if (apiKeyVal.length !== 32) { if (apiKeyError) apiKeyError.textContent = 'API Key must be 32 characters'; valid = false; }

            if (!valid) return;

            // AJAX: Test connection
            jQuery.post(wt_iew_ajax.ajax_url, {
                action: 'wt_iew_test_connection',
                domain: domainVal,
                enseigne: enseigneVal,
                api_key: apiKeyVal,
                _wpnonce: wt_iew_ajax.nonce
            }, function (response) {
                if (response && response.success && response.data && response.data.status) {
                    if (connectionStatus) { connectionStatus.style.color = 'green'; connectionStatus.textContent = response.data.msg || 'Connection OK'; }
                    if (btnToStep2) btnToStep2.disabled = false;
                } else {
                    if (connectionStatus) { connectionStatus.style.color = 'red'; connectionStatus.textContent = (response && response.data && response.data.msg) ? response.data.msg : 'Connection failed'; }
                    if (btnToStep2) btnToStep2.disabled = true;
                }
            }).fail(function (err) {
                if (connectionStatus) { connectionStatus.style.color = 'red'; connectionStatus.textContent = 'Connection error'; }
                console.error('AJAX error on test connection', err);
            });
        });
    }

    // ===== Step 1 → Step 2 =====
    if (btnToStep2) {
        btnToStep2.addEventListener('click', function () {
            showStep(step2);

            const domainVal = domainInput?.value.trim() || '';
            const enseigneVal = enseigneInput?.value.trim() || '';
            const apiKeyVal = apiKeyInput?.value.trim() || '';

            // Save step 1 data via AJAX
            jQuery.post(wt_iew_ajax.ajax_url, {
                action: 'wt_iew_save_step1',
                domain: domainVal,
                enseigne: enseigneVal,
                api_key: apiKeyVal,
                _wpnonce: wt_iew_ajax.nonce
            }, function (resp) { console.debug('Step1 saved:', resp); });
        });
    }

    // ===== Step 2 → Step 3 =====
    if (btnToStep3) {
        btnToStep3.addEventListener('click', function () {
            updateSelectedShops();
            showStep(step3);

            // Save selected shops
            jQuery.post(wt_iew_ajax.ajax_url, {
                action: 'save_selected_shops_option',
                selected_shops: selected_shops,
                _wpnonce: wt_iew_ajax.nonce
            }, function (resp) { console.debug('Selected shops saved:', resp); });
        });
    }

    if (btnBackStep2) btnBackStep2.addEventListener('click', function () { showStep(step2); });

    


// Step 3 → Step 4
if (btnToStep4) {
    btnToStep4.addEventListener('click', function () {
        const sizeLabel = inputSize?.value.trim() || '';
        const colorLabel = inputColor?.value.trim() || '';

        if (!sizeLabel && !colorLabel) {
            alert('Please enter at least one attribute');
            return;
        }

        jQuery.post(wt_iew_ajax.ajax_url, {
            action: 'oopos_save_attributes',
            sizeLabel: sizeLabel,
            colorLabel: colorLabel,
            _wpnonce: wt_iew_ajax.nonce
        }, function (response) {
            if (response.success) {
                console.log(response.data.message || 'Attributes saved');
                showStep(step4);
            } else {
                alert(response.data?.message || 'Error saving attributes');
            }
        }).fail(function (err) {
            console.error('AJAX error saving attributes:', err);
            alert('AJAX error, check console');
        });
    });
}


    if (btnBackStep3) btnBackStep3.addEventListener('click', function () { showStep(step3); });
    if (btnBackStep4) btnBackStep4.addEventListener('click', function () { showStep(step3); });

    // ===== Shops change handler =====
    if (shopsContainer) {
        shopsContainer.addEventListener('change', function (e) {
            if (e.target && e.target.matches('input[type="checkbox"]')) updateSelectedShops();
        });
    }

    // ===== Extras attributes (Step 4) =====
    function createExtraRow(value = '') {
        const row = document.createElement('div');
        row.className = 'extra-attribute-row';
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '10px';
        row.style.marginBottom = '8px';

        const label = document.createElement('label');
        label.textContent = 'Extra attribute:';
        label.style.marginRight = '6px';

        const input = document.createElement('input');
        input.type = 'text';
        input.name = 'oopos_settings_extra_attributes[]';
        input.value = value;
        input.placeholder = 'Extra attribute';
        input.style.flex = '1';

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'button button-secondary remove-attribute';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', function () { row.remove(); });

        row.appendChild(label);
        row.appendChild(input);
        row.appendChild(removeBtn);

        return row;
    }

    if (addExtraBtn && extrasContainer) {
        addExtraBtn.addEventListener('click', function () {
            const row = createExtraRow('');
            extrasContainer.appendChild(row);
            row.querySelector('input[name="oopos_settings_extra_attributes[]"]')?.focus();
        });
    }

    showStep(step1 || stepEls[0] || null);

});
