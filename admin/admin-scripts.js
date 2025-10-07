document.addEventListener('DOMContentLoaded', function () {


    // Steps
    const stepEls = Array.from(document.querySelectorAll('.step'));
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const step4 = document.getElementById('step4');

    // Step1 elements
    const domainInput = document.getElementById('domain');
    const enseigneInput = document.getElementById('enseigne');
    const apiKeyInput = document.getElementById('api_key');

    const domainError = document.getElementById('domain-error');
    const enseigneError = document.getElementById('enseigne-error');
    const apiKeyError = document.getElementById('apikey-error');

    const btnTestConnection = document.getElementById('test-connection');
    const btnToStep2 = document.getElementById('to-step2');
    const connectionStatus = document.getElementById('connection-status');

    // Step2 -> shops
    const shopsContainer = document.getElementById('shops-container');

    // Step3 -> attributes
    const btnToStep3 = document.getElementById('to-step3');
    const btnBackStep2 = document.getElementById('back-step2');

    // Step3 -> Step4
    const btnBackStep3 = document.getElementById('back-step3');
    const btnToStep4 = document.getElementById('to-step4');

    // Step4 -> extras
    const addExtraBtn = document.getElementById('add-extra-attribute');
    const extrasContainer = document.getElementById('extra-attributes-container');

    // State
    let selected_shops = [];

    // Helper: show a specific step (hide others)
    function showStep(el) {
        stepEls.forEach(s => {
            if (!s) return;
            s.style.display = (s === el) ? 'block' : 'none';
        });
        // scroll to top for user clarity
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Helper: collect selected shops (safe if shopsContainer missing)
    function updateSelectedShops() {
        selected_shops = [];
        if (!shopsContainer) {
            console.debug('No shops container found.');
            return;
        }
        shopsContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            selected_shops.push(cb.value);
        });
        console.debug('Selected shops:', selected_shops);
    }

    // ===== Test Connection =====
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

            // Ajax test connection
            $.post(wt_iew_ajax.ajax_url, {
                action: 'wt_iew_test_connection',
                domain: domainVal,
                enseigne: enseigneVal,
                api_key: apiKeyVal,
                _wpnonce: wt_iew_ajax.nonce
            }, function (response) {
                try {
                    if (response && response.success && response.data && response.data.status) {
                        if (connectionStatus) { connectionStatus.style.color = 'green'; connectionStatus.textContent = response.data.msg || 'Connection OK'; }
                        if (btnToStep2) btnToStep2.disabled = false;
                    } else {
                        if (connectionStatus) { connectionStatus.style.color = 'red'; connectionStatus.textContent = (response && response.data && response.data.msg) ? response.data.msg : 'Connection failed'; }
                        if (btnToStep2) btnToStep2.disabled = true;
                    }
                } catch (e) {
                    console.error('Test connection response handling error', e);
                }
            }).fail(function (err) {
                console.error('AJAX error on test connection', err);
                if (connectionStatus) { connectionStatus.style.color = 'red'; connectionStatus.textContent = 'Connection error'; }
            });
        });
    }

    // ===== Step 1 -> Step 2 (save step1 via AJAX) =====
    if (btnToStep2) {
        btnToStep2.addEventListener('click', function () {
            showStep(step2);

            const domainVal = domainInput?.value.trim() || '';
            const enseigneVal = enseigneInput?.value.trim() || '';
            const apiKeyVal = apiKeyInput?.value.trim() || '';

            $.post(wt_iew_ajax.ajax_url, {
                action: 'wt_iew_save_step1',
                domain: domainVal,
                enseigne: enseigneVal,
                api_key: apiKeyVal,
                _wpnonce: wt_iew_ajax.nonce
            }, function (resp) {
                console.debug('Step1 saved:', resp);
                // Optionally refresh shops list via ajax endpoint oopos_get_shops
                // fetch shops from server and repopulate shopsContainer if needed
                if (shopsContainer) {
                    // attempt to refresh shops visually (non-blocking)
                    $.post(wt_iew_ajax.ajax_url, {
                        action: 'oopos_get_shops',
                        _wpnonce: wt_iew_ajax.nonce
                    }, function (r) {
                        if (r && r.success && Array.isArray(r.data)) {
                            // rebuild checkboxes
                            let html = '';
                            r.data.forEach((shop, idx) => {
                                const checked = (document.querySelector(`input[name="oopos_connector_data[shop_selected][]"][value="${shop}"]`)?.checked) ? ' checked' : '';
                                const mainAttr = (idx === 0) ? ' data-main="true"' : '';
                                html += `<label class="shop-checkbox"><input type="checkbox" name="oopos_connector_data[shop_selected][]" value="${escapeHtml(shop)}"${checked}${mainAttr}> ${escapeHtml(shop)}${idx===0 ? ' (Main)' : ''}</label>`;
                            });
                            shopsContainer.innerHTML = html;
                        }
                        // attach change handler by delegation below, and set selected_shops
                        updateSelectedShops();
                    }).fail(function () {
                        updateSelectedShops();
                    });
                }
            });
        });
    }

    // ===== step nav btns =====
    const backStep1 = document.getElementById('back-step1');
    if (backStep1) {
        backStep1.addEventListener('click', function () { showStep(step1); });
    }

    if (btnToStep3) {
        btnToStep3.addEventListener('click', function () {
            // update selected shops then save option via AJAX
            updateSelectedShops();
            showStep(step3);

            $.post(wt_iew_ajax.ajax_url, {
                action: 'save_selected_shops_option',
                selected_shops: selected_shops,
                _wpnonce: wt_iew_ajax.nonce
            }, function (resp) {
                console.debug('Save selected shops response:', resp);
            }).fail(function (err) {
                console.error('Failed saving selected shops', err);
            });
        });
    }

    if (btnBackStep2) {
        btnBackStep2.addEventListener('click', function () { showStep(step2); });
    }

    // ===== Step 3 -> Step 4 (save basic attrs via AJAX then show step4) =====
if (btnToStep4) {
    btnToStep4.addEventListener('click', function () {
        showStep(step4);
    });
}

if (btnBackStep3) {
    btnBackStep3.addEventListener('click', function () {
        showStep(step2);
    });
}

    // ===== Shops checkbox change delegation (works if container dynamically replaced) =====
    if (shopsContainer) {
        shopsContainer.addEventListener('change', function (e) {
            if (e.target && e.target.matches('input[type="checkbox"]')) {
                updateSelectedShops();
            }
        });
    }

    // ===== Extras: add/remove attribute inputs =====
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
        removeBtn.addEventListener('click', function () {
            row.remove();
        });

        row.appendChild(label);
        row.appendChild(input);
        row.appendChild(removeBtn);

        return row;
    }

    // initialize existing remove buttons (in case HTML already had them)
    function initExistingRemoves() {
        // delegate if no container
        if (!extrasContainer) return;
        extrasContainer.querySelectorAll('.remove-attribute').forEach(btn => {
            btn.addEventListener('click', function (e) {
                const parent = e.target.closest('.extra-attribute-row');
                if (parent) parent.remove();
            });
        });
    }

    if (addExtraBtn && extrasContainer) {
        addExtraBtn.addEventListener('click', function () {
            const row = createExtraRow('');
            extrasContainer.appendChild(row);
            // focus newly created input
            row.querySelector('input[name="oopos_settings_extra_attributes[]"]')?.focus();
        });
    }

    initExistingRemoves();

    // ===== Utility: simple escape for building HTML strings (used above optionally) =====
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

    // show initial step (ensure step1 visible)
    showStep(step1 || stepEls[0] || null);

    // debug: log missing elements only once
    (function debugMissing() {
        const missing = [];
        if (!domainInput) missing.push('#domain');
        if (!enseigneInput) missing.push('#enseigne');
        if (!apiKeyInput) missing.push('#api_key');
        if (!btnTestConnection) missing.push('#test-connection');
        if (!btnToStep2) missing.push('#to-step2');
        if (!btnToStep3) missing.push('#to-step3');
        if (!btnToStep4) missing.push('#to-step4');
        if (missing.length) console.debug('OOPOS admin: missing elements (OK if not on this page):', missing);
    })();
});
