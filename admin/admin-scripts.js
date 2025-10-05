document.addEventListener('DOMContentLoaded', function () {
    // Elements (step panels)
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');

    // Step1 inputs & UI
    const domainInput = document.getElementById('domain');
    const enseigneInput = document.getElementById('enseigne');
    const apiKeyInput = document.getElementById('api_key');
    const domainError = document.getElementById('domain-error');
    const enseigneError = document.getElementById('enseigne-error');
    const apiKeyError = document.getElementById('apikey-error');
    const connectionStatus = document.getElementById('connection-status');

    const nextButton = document.getElementById('to-step2');

    // Data
    let allShops = [];            // full list of shops (strings)
    let selected_shops = [];      // [ main, extra1, extra2, ... ]

    // Ensure container/button exist (create if missing)
    let extraContainer = document.getElementById('extra-shops-container');
    if (!extraContainer) {
        extraContainer = document.createElement('div');
        extraContainer.id = 'extra-shops-container';
        // try to insert after the main shop select (if exists) else append to step2
        const step2Node = document.getElementById('step2') || null;
        if (step2Node) step2Node.insertBefore(extraContainer, step2Node.querySelector('#back-step1') || null);
        else document.body.appendChild(extraContainer);
    }

    let addBtn = document.getElementById('add-extra-shop');
    if (!addBtn) {
        addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.id = 'add-extra-shop';
        addBtn.textContent = 'Add another shop';
        addBtn.style.display = 'none'; // hidden by default, shown when main selected
        // insert after container
        extraContainer.parentNode.insertBefore(addBtn, extraContainer.nextSibling);
    }

    // Find main shop select (should exist in your PHP)
    const mainSelect = document.querySelector('select[name="oopos_connector_data[main_shop]"]');
    if (!mainSelect) {
        console.error('Main shop select not found: expected select[name="oopos_connector_data[main_shop]"]');
        return;
    }

    // Helper: build options for a select from an array of shop names
    function buildOptionsFor(selectEl, optionsArray, includePlaceholder = true) {
        selectEl.innerHTML = '';
        if (includePlaceholder) {
            const ph = document.createElement('option');
            ph.value = '';
            ph.textContent = '-- Choose --';
            selectEl.appendChild(ph);
        }
        optionsArray.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            selectEl.appendChild(opt);
        });
    }

    // Helper: return array of currently selected extra shops (non-empty values)
    function getSelectedExtras() {
        return Array.from(extraContainer.querySelectorAll('select.extra-shop-select'))
            .map(s => s.value)
            .filter(v => v && v.length);
    }

    // Recalculate selected_shops and log it
    function updateSelectedShopsAndLog() {
        const main = mainSelect.value || '';
        const extras = getSelectedExtras();
        selected_shops = [];
        if (main) selected_shops.push(main);
        selected_shops.push(...extras);
        console.log('selected_shops:', selected_shops);
    }

    

    // Update all extra selects options to exclude main and other selected extras
    function refreshAllExtraSelects() {
        const main = mainSelect.value || '';
        const extras = getSelectedExtras(); // current selected extras
        const extraSelects = Array.from(extraContainer.querySelectorAll('select.extra-shop-select'));

        extraSelects.forEach((sel) => {
            const currentValue = sel.value;
            // compute options allowed for this specific select:
            // allowed = allShops minus main minus (extras selected in other selects)
            const otherSelected = extras.filter(v => v !== currentValue); // values used by others
            const allowed = allShops.filter(s => s && s !== main && !otherSelected.includes(s));
            buildOptionsFor(sel, allowed, true);

            // re-set the previous value if still present
            if (currentValue && allowed.includes(currentValue)) {
                sel.value = currentValue;
            } else {
                // keep empty - if previous value lost (e.g. main changed), clear it
                sel.value = '';
            }
        });
    }

    // Add a new extra shop select (button handler)
    let extraCount = 0;
    function addExtraSelect() {
        const main = mainSelect.value;
        if (!main) {
            alert('Please select a main shop first.');
            return;
        }

        // available shops = allShops - main - selected extras
        const used = new Set([ main, ...getSelectedExtras() ]);
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
        // build allowed options for this new select
        buildOptionsFor(sel, avail, true);
        wrapper.appendChild(sel);
        wrapper.appendChild(document.createElement('br'));

        // remove button
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'Remove';
        removeBtn.style.marginBottom = '8px';
        wrapper.appendChild(removeBtn);

        extraContainer.appendChild(wrapper);

        // event: when select value changes, refresh others and log
        sel.addEventListener('change', function () {
            console.log('Extra select changed:', this.value);
            refreshAllExtraSelects();
            updateSelectedShopsAndLog();
        });

        // event: remove row
        removeBtn.addEventListener('click', function () {
            wrapper.remove();
            refreshAllExtraSelects();
            updateSelectedShopsAndLog();
            // show add button if previously disabled
            if (addBtn.style.display === 'none' && mainSelect.value) addBtn.style.display = 'inline-block';
        });

        // after adding, update selected_shops
        updateSelectedShopsAndLog();

        // If no more available after adding, optionally disable add button
        const newAvail = allShops.filter(s => s && s !== main && !getSelectedExtras().includes(s));
        if (newAvail.length === 0) {
            addBtn.disabled = true;
        } else {
            addBtn.disabled = false;
        }

        console.log('Added extra select, avail now:', newAvail);
    }

    // Main select change: show/hide add button and refresh extras
mainSelect.addEventListener('change', function () {
    const v = this.value;
    console.log('Main shop selected:', v);

    if (v) {
        addBtn.style.display = 'inline-block'; // show the button
        addBtn.disabled = false;
    } else {
        addBtn.style.display = 'none';
    }

    refreshAllExtraSelects();
    updateSelectedShopsAndLog();
});


    // Add button click
    addBtn.addEventListener('click', function () {
        console.log('Add another shop clicked');
        addExtraSelect();
    });

    // When you go to Step 2 we must populate shops (AJAX or from existing options)
    // If you already populate mainSelect server-side, read from it; otherwise request via AJAX.
    function loadShopsIfNeeded(callback) {
        // If mainSelect already has shop options (besides placeholder), read them
        const existingOptions = Array.from(mainSelect.options).map(opt => opt.value).filter(v => v && v.length);
        if (existingOptions.length > 0) {
            allShops = existingOptions.slice();
            console.log('Loaded shops from DOM:', allShops);
            if (typeof callback === 'function') callback();
            return;
        }

        // else call AJAX to fetch shops
        console.log('Fetching shops via AJAX...');
        jQuery.post(wt_iew_ajax.ajax_url, {
            action: 'oopos_get_shops',
            _wpnonce: wt_iew_ajax.nonce
        }, function (response) {
            console.log('oopos_get_shops response:', response);
            if (response && response.success && Array.isArray(response.data)) {
                allShops = response.data.slice();
                // populate mainSelect
                buildOptionsFor(mainSelect, allShops, true);
                console.log('Loaded shops from AJAX:', allShops);
                if (typeof callback === 'function') callback();
            } else {
                console.error('Failed to load shops from AJAX', response);
            }
        });
    }

    // Hook: when user clicks Next to go to Step2 we will load shops if needed
    const toStep2Btn = document.getElementById('to-step2');
    if (toStep2Btn) {
        toStep2Btn.addEventListener('click', function () {
            // show step2 (your existing logic may already do this)
            if (step1) step1.style.display = 'none';
            if (step2) step2.style.display = 'block';

            // load shops then initialize UI state
            loadShopsIfNeeded(function () {
                // After shops are loaded we must:
                // - hide add button initially (it appears when main selected)
                addBtn.style.display = mainSelect.value ? 'inline-block' : 'none';
                // - make sure extra container empties
                // don't remove existing extras if you prefer to keep them; here we clear
                extraContainer.innerHTML = '';
                // reset counters/state
                extraCount = 0;
                updateSelectedShopsAndLog();
                refreshAllExtraSelects();
            });
        });
    }

    // Back/Next navigation (keep your existing handlers too)
    const backStep1 = document.getElementById('back-step1');
    if (backStep1) backStep1.addEventListener('click', () => {
        if (step2) step2.style.display = 'none';
        if (step1) step1.style.display = 'block';
    });

    const toStep3 = document.getElementById('to-step3');
    if (toStep3) toStep3.addEventListener('click', () => {
        if (step2) step2.style.display = 'none';
        if (step3) step3.style.display = 'block';
    });

    const backStep2 = document.getElementById('back-step2');
    if (backStep2) backStep2.addEventListener('click', () => {
        if (step3) step3.style.display = 'none';
        if (step2) step2.style.display = 'block';
    });

    // Initial: hide add button until main chosen
    addBtn.style.display = mainSelect.value ? 'inline-block' : 'none';
    // if shop options already exist, load them into allShops
    const initialOpts = Array.from(mainSelect.options).map(o => o.value).filter(v => v && v.length);
    if (initialOpts.length) {
        allShops = initialOpts;
        refreshAllExtraSelects();
    }
});
