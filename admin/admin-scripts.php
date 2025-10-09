<?php
add_action('admin_enqueue_scripts', 'oopos_connector_admin_assets');
function oopos_connector_admin_assets($hook) {
    if ($hook != 'toplevel_page_oopos-connector') return;

    // CSS
    wp_enqueue_style('oopos-connector-admin-style', plugin_dir_url(__FILE__) . 'admin-style.css');

    // JS
    wp_enqueue_script('oopos-connector-admin-js', plugin_dir_url(__FILE__) . 'admin-scripts.js', array('jquery'), false, true);


        // Get existing WC attributes
    $wc_attributes = array();
    if (function_exists('wc_get_attribute_taxonomies')) {
        $taxonomies = wc_get_attribute_taxonomies();
        foreach ($taxonomies as $tax) {
            if (in_array($tax->attribute_name, ['size', 'color'])) {
                $wc_attributes[$tax->attribute_name] = $tax->attribute_label;
            }
        }
    }
        // Get existing WC attributes
    $wc_attributes = array();
    if (function_exists('wc_get_attribute_taxonomies')) {
        $taxonomies = wc_get_attribute_taxonomies();
        foreach ($taxonomies as $tax) {
            if (in_array($tax->attribute_name, ['size', 'color'])) {
                $wc_attributes[$tax->attribute_name] = $tax->attribute_label;
            }
        }
    }

        wp_localize_script('oopos-connector-admin-js', 'oopos_wc_attributes', $wc_attributes);
    // Localize script for AJAX
    wp_localize_script('oopos-connector-admin-js', 'wt_iew_ajax', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce'    => wp_create_nonce('wt_iew_nonce')
    ));

    
}

// Enqueue scripts and styles for the import page
add_action('admin_enqueue_scripts', 'oopos_enqueue_admin_scripts');
function oopos_enqueue_admin_scripts($hook) {
    $screen = get_current_screen();
    if ($screen->id !== 'oopos-connector_page_oopos-connector-import') return;
    
        // CSS
        wp_enqueue_style(
            'oopos-import-style',
            plugin_dir_url(__FILE__) . './import/import-style.css',
            array(),
            '1.0'
        );

        // JS
        wp_enqueue_script(
            'oopos-import-script',
            plugin_dir_url(__FILE__) . './import/import-script.js', // correct path from admin-menu.php
            array('jquery'), 
            '1.0',
            true // footer
        );

        // pass AJAX URL and nonce
        wp_localize_script('oopos-import-script', 'ooposImportAjax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce'    => wp_create_nonce('oopos_import_nonce')
        ));
    }



    
    // AJAX handler
add_action('wp_ajax_oopos_save_import_settings', 'oopos_save_import_settings');
function oopos_save_import_settings() {
    check_ajax_referer('oopos_import_nonce', '_wpnonce');

    $skip_new = filter_var($_POST['oopos_skip_new_product'] ?? false, FILTER_VALIDATE_BOOLEAN);
    $existing_update = filter_var($_POST['oopos_existing_products'] ?? false, FILTER_VALIDATE_BOOLEAN);
    $empty_update = filter_var($_POST['oopos_empty_values'] ?? false, FILTER_VALIDATE_BOOLEAN);

    update_option('oopos_skip_new_product', $skip_new ? 1 : 0);
    update_option('oopos_existing_products', $existing_update ? 1 : 0);
    update_option('oopos_empty_values', $empty_update ? 1 : 0);


    wp_send_json_success(['message' => 'Import settings saved successfully!']);
}




// Handle AJAX: Start Import Products
add_action('wp_ajax_oopos_start_import_products', 'oopos_start_import_products_external_sql');

function oopos_start_import_products_external_sql() {
   $connector_data = get_option('oopos_connector_data');
   $connector_selected_data=get_option('oopos-shops-selected')

    if (
        !is_array($connector_data) ||
        empty($connector_data['domain']) ||
        empty($connector_data['enseigne']) ||
        empty($connector_data['api_key'])
    ) {
        wp_send_json_error(['message' => 'Connector data is missing or invalid.']);
    }

    //  Clean up potential extra quotes or slashes
    $domain   = rtrim(trim($connector_data['domain'], "'\"/"), '/') . '/';
    $enseigne = trim($connector_data['enseigne'], "'\"");
    $api_key  = trim($connector_data['api_key'], "'\"");

    $shops = maybe_unserialize($connector_selected_data); // returns array like ['AZUR CITY','DEPOT']
    $escaped_shops = array_map('esc_sql', $shops);
    $in_list = "'" . implode("','", $escaped_shops) . "'";

    if (empty($shops) || !is_array($shops)) {
        wp_send_json_error(['message' => 'No shops selected.']);
    }


    // ✅ Build the dynamic API URL
    $api_url = $domain . 'api/v2/query.do?enseigne=' . urlencode($enseigne) . '&api-key=' . urlencode($api_key);
    $sql_query = trim("SELECT * 
    FROM produits p 
    JOIN stocks s ON p.Produit = s.Produit 
    WHERE s.Magasin IN ($in_list) 
    AND ecommerce=1;");

    // ✅ Prepare request arguments
    $args = [
        'method'  => 'PUT',
        'headers' => [
            'Accept'        => 'application/json',
            'Content-Type'  => 'text/plain; charset=UTF-8',
        ],
        'body'      => $sql_query,
        'timeout'   => 60,
        'sslverify' => false, // only if you have SSL issues
    ];

    // ✅ Send request
    $response = wp_remote_request($api_url, $args);

    // ✅ Handle HTTP or network errors
    if (is_wp_error($response)) {
        wp_send_json_error(['message' => 'HTTP error: ' . $response->get_error_message()]);
    }

    // ✅ Retrieve and decode response
    $body = wp_remote_retrieve_body($response);
    $decoded = json_decode($body, true);

    // ✅ Log request + response for debugging
    $upload_dir = wp_upload_dir();
    $debug_path = $upload_dir['basedir'] . '/oopos_debug.txt';
    file_put_contents(
        $debug_path,
        "Sent SQL:\n" . $sql_query . "\n\nResponse:\n" . $body
    );

    // ✅ Check response validity
    if (!$decoded || !isset($decoded['result']) || $decoded['result'] !== 'ok') {
        wp_send_json_error([
            'message' => 'Invalid API response',
            'raw' => $body,
            'debug_file' => $debug_path,
        ]);
    }

    // ✅ Extract and save data
    $data = $decoded['data'];
    $file_path = $upload_dir['basedir'] . '/res.json';
    $file_url = $upload_dir['baseurl'] . '/res.json';

    file_put_contents($file_path, wp_json_encode($data, JSON_PRETTY_PRINT));

    // ✅ Return success response
    wp_send_json_success([
        'message' => 'Products fetched successfully!',
        'file' => $file_url,
        'debug_file' => $debug_path,
    ]);
}