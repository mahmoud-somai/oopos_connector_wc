document.addEventListener('DOMContentLoaded', function () {
    // Steps
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');

    // Step1 inputs
    const domainInput = document.getElementById('domain');
    const enseigneInput = document.getElementById('enseigne');
    const apiKeyInput = document.getElementById('api_key');
    const domainError = document.getElementById('domain-error');
    const enseigneError = document.getElementById('enseigne-error');
    const apiKeyError = document.getElementById('apikey-error');
    const connectionStatus = document.getElementById('connection-status');

    const nextButton = document.getElementById('to-step2');

    // Shops data
    let allShops = [];            // All available shops
    let selected_shops = [];      // [main, extra1, extra2...]

    // Extra shops container
    let extraContainer = document.getElementById('extra-shops-container');
    if (!extraContainer) {
        extraContainer = document.createElement('div');
        extraContainer.id = 'extra-shops-container';
        step2.insertBefore(extraContainer, step2.querySelector('#back-step1') || null);
    }

    // Add button
    let addBtn = document.getElementById('add-extra-shop');
    if (!addBtn) {
        addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.id = 'add-extra-shop';
        addBtn.textContent = '+ Add another shop';
        addBtn.style.display = 'none';
        extraContainer.parentNode.insertBefore(addBtn, extraContainer.nextSibling);
    }

    const mainSelect = document.querySelector('select[name="oopos_connector_data[main_shop]"]');
    if (!mainSelect) {
        console.error('Main shop select not found');
        return;
    }

    let extraCount = 0;

    // Helper: build select options
    function buildOptionsFor(selectEl, optionsArray) {
        if (!selectEl) return;
        selectEl.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '-- Choose --';
        selectEl.appendChild(placeholder);

        optionsArray.forEach(optValue => {
            const opt = document.createElement('option');
            opt.value = optValue;
            opt.textContent = optValue;
            selectEl.appendChild(opt);
        });
    }

    // Get currently selected extra shops
    function getSelectedExtras() {
        return Array.from(extraContainer.querySelectorAll('select.extra-shop-select'))
            .map(s => s.value)
            .filter(v => v);
    }

    // Update selected_shops array
    function updateSelectedShops() {
        const main = mainSelect.value || '';
        const extras = getSelectedExtras();
        selected_shops = [];
        if (main) selected_shops.push(main);
        selected_shops.push(...extras);
        console.log('Selected shops:', selected_shops);
    }

    // Refresh extra selects to remove already selected shops
    function refreshAllExtraSelects() {
        const main = mainSelect.value || '';
        const extras = getSelectedExtras();
        const extraSelects = Array.from(extraContainer.querySelectorAll('select.extra-shop-select'));

        extraSelects.forEach(sel => {
            const currentValue = sel.value;
            const otherSelected = extras.filter(v => v !== currentValue);
            const allowed = allShops.filter(s => s && s !== main && !otherSelected.includes(s));
            buildOptionsFor(sel, allowed);

            if (currentValue && allowed.includes(currentValue)) {
                sel.value = currentValue;
            } else {
                sel.value = '';
            }
        });
    }

    // Add a new extra shop select
    function addExtraSelect() {
        if (!mainSelect.value) {
            alert('Please select a main shop first.');
            return;
        }

        const used = new Set([mainSelect.value, ...getSelectedExtras()]);
        const avail = allShops.filter(s => s && !used.has(s));
        if (avail.length === 0) {
            alert('No more shops available to add.');
            return;
        }

        extraCount++;
        const wrapper = document.createElement('div');
        wrapper.className = 'extra-shop-row';
        wrapper.dataset.index = extraCount;

        const label = document.createElement('label');
        label.textContent = `Extra Shop ${extraCount}:`;
        wrapper.appendChild(label);
        wrapper.appendChild(document.createElement('br'));

        const sel = document.createElement('select');
        sel.name = `oopos_connector_data[extra_shop_${extraCount}]`;
        sel.className = 'extra-shop-select';
        buildOptionsFor(sel, avail);
        wrapper.appendChild(sel);
        wrapper.appendChild(document.createElement('br'));

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'Remove';
        removeBtn.style.marginBottom = '8px';
        removeBtn.addEventListener('click', () => {
            wrapper.remove();
            refreshAllExtraSelects();
            updateSelectedShops();
        });
        wrapper.appendChild(removeBtn);

        sel.addEventListener('change', () => {
            refreshAllExtraSelects();
            updateSelectedShops();
        });

        extraContainer.appendChild(wrapper);
        updateSelectedShops();
        refreshAllExtraSelects();
    }

    // Show add button when main shop selected
    mainSelect.addEventListener('change', () => {
        addBtn.style.display = mainSelect.value ? 'inline-block' : 'none';
        refreshAllExtraSelects();
        updateSelectedShops();
    });

    // Add button click
    addBtn.addEventListener('click', addExtraSelect);

    // Load shops from existing options or AJAX
    function loadShopsIfNeeded(callback) {
        const existingOptions = Array.from(mainSelect.options).map(opt => opt.value).filter(v => v);
        if (existingOptions.length > 0) {
            allShops = existingOptions.slice();
            if (callback) callback();
            return;
        }

        // AJAX fetch example (requires wp_localize_script)
        jQuery.post(wt_iew_ajax.ajax_url, {
            action: 'oopos_get_shops',
            _wpnonce: wt_iew_ajax.nonce
        }, function (response) {
            if (response && response.success && Array.isArray(response.data)) {
                allShops = response.data.slice();
                buildOptionsFor(mainSelect, allShops);
                if (callback) callback();
            }
        });
    }

    // Step navigation
    const toStep2Btn = document.getElementById('to-step2');
    if (toStep2Btn) {
        toStep2Btn.addEventListener('click', () => {
            if (step1) step1.style.display = 'none';
            if (step2) step2.style.display = 'block';

            loadShopsIfNeeded(() => {
                extraContainer.innerHTML = '';
                extraCount = 0;
                addBtn.style.display = mainSelect.value ? 'inline-block' : 'none';
                refreshAllExtraSelects();
                updateSelectedShops();
            });
        });
    }

    const backStep1 = document.getElementById('back-step1');
    if (backStep1) backStep1.addEventListener('click', () => {
        step2.style.display = 'none';
        step1.style.display = 'block';
    });

    const toStep3 = document.getElementById('to-step3');
    if (toStep3) toStep3.addEventListener('click', () => {
        step2.style.display = 'none';
        step3.style.display = 'block';
    });

    const backStep2 = document.getElementById('back-step2');
    if (backStep2) backStep2.addEventListener('click', () => {
        step3.style.display = 'none';
        step2.style.display = 'block';
    });

    // Initial state
    addBtn.style.display = mainSelect.value ? 'inline-block' : 'none';
    allShops = Array.from(mainSelect.options).map(o => o.value).filter(v => v);
    refreshAllExtraSelects();
});
