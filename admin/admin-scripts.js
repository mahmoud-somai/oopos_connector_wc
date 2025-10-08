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

   

    // ===== Step 4 Extras =====
    const extrasContainer = document.getElementById('extra-attributes-container');
    const addExtraBtn = document.getElementById('add-extra-attribute');
    const saveExtraBtn = document.getElementById('save-extra-attributes');
    const skipExtraBtn = document.getElementById('skip-extra-attributes');
    const backStep4Btn = document.getElementById('back-step4');

    const step5 = document.getElementById('step5');
    const btnBackStep5 = document.getElementById('back-step5');

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

        const existingSize = oopos_wc_attributes?.size || '';
        const existingColor = oopos_wc_attributes?.color || '';

        // If both match WC existing attributes, just navigate
        if (sizeLabel === existingSize && colorLabel === existingColor) {
            showStep(step4);
            return;
        }

        // If inputs empty, alert
        if (!sizeLabel && !colorLabel) {
            alert('Please enter at least one attribute');
            return;
        }

        // Save/update WC attributes via AJAX
        jQuery.post(wt_iew_ajax.ajax_url, {
            action: 'oopos_save_attributes',
            sizeLabel: sizeLabel,
            colorLabel: colorLabel,
            _wpnonce: wt_iew_ajax.nonce
        }, function (response) {
            if (response.success) {
                console.log(response.data.message || 'Attributes saved/updated');
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



    if (btnBackStep3) btnBackStep3.addEventListener('click', function () { showStep(step2); });
    

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

    const label = document.createElement('label');
    label.textContent = 'Extra attribute:';

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
    removeBtn.addEventListener('click', function () {
        row.remove();
    });

    row.appendChild(label);
    row.appendChild(input);
    row.appendChild(removeBtn);

    return row;
}

// Add first row
if (extrasContainer) extrasContainer.appendChild(createExtraRow(''));

// Add more rows
if (addExtraBtn) {
    addExtraBtn.addEventListener('click', function () {
        const newRow = createExtraRow('');
        extrasContainer.appendChild(newRow);
        newRow.querySelector('input')?.focus();
    });
}

// Save extra attributes
if (saveExtraBtn) {
    saveExtraBtn.addEventListener('click', function () {
        const extraValues = Array.from(document.querySelectorAll('input[name="oopos_settings_extra_attributes[]"]'))
            .map(input => input.value.trim())
            .filter(val => val !== '');

        if (!extraValues.length) {
            alert('Please enter at least one extra attribute or click Skip.');
            return;
        }

        jQuery.post(wt_iew_ajax.ajax_url, {
            action: 'oopos_save_extra_attributes',
            extra_attributes: extraValues,
            _wpnonce: wt_iew_ajax.nonce
        }, function (response) {
            if (response.success) {
                alert('Extra attributes saved successfully!');
                // optionally navigate to next step
            } else {
                alert(response.data?.message || 'Error saving extra attributes.');
            }
        }).fail(function (err) {
            console.error('AJAX error saving extra attributes:', err);
            alert('AJAX error, check console.');
        });
    });
}


// Back button
if (backStep4Btn) {
    backStep4Btn.addEventListener('click', function () {
        showStep(step3); // assuming step3 exists
    });
}
    function showStep(stepEl) {
        stepEls.forEach(el => el.style.display = 'none');
        stepEl.style.display = 'block';
    }
 function showStep(stepToShow) {
        // Hide all steps
        document.querySelectorAll('.step').forEach(step => {
            step.style.display = 'none';
        });
        // Show selected step
        if (stepToShow) {
            stepToShow.style.display = 'block';
        }
    }






    // 👉 Skip button from Step 4 → Step 5
    if (skipExtraBtn) {
        skipExtraBtn.addEventListener('click', function() {
            showStep(step5);
        });
    }

    // 👉 Back button from Step 5 → Step 4
    if (btnBackStep5) {
        btnBackStep5.addEventListener('click', function() {
            showStep(step4);
        });
    }
    // Initialize to step 1
    showStep(step1);


});
