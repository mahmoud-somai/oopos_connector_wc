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
    $api_url = 'https://api.oopos.fr/api/v2/import-produits.do?enseigne=DEMO_MABOUTIQUE&api-key=124d24ff60d642035a4aff3da5a89de4';

      $sql_query = "SELECT * FROM produits;";

    // ✅ Headers attendus par OOPOS
    $headers = [
        'Accept' => 'application/json',
        'Content-Type' => 'text/plain',
    ];

    // ✅ Faire une requête PUT (WordPress ne le fait pas par défaut avec wp_remote_post)
    $response = wp_remote_request($api_url, [
        'method'  => 'PUT',
        'timeout' => 60,
        'headers' => $headers,
        'body'    => $sql_query,
        'sslverify' => false, // équivalent de Unirest::verifyPeer(false)
    ]);

    // ✅ Vérifier erreurs réseau
    if (is_wp_error($response)) {
        wp_send_json_error(['message' => 'Failed to reach API: ' . $response->get_error_message()]);
    }

    // ✅ Décoder le corps de la réponse
    $body = wp_remote_retrieve_body($response);
    $json = json_decode($body, true);

    // ✅ Vérifier le format
    if (!$json || !isset($json['result']) || $json['result'] !== 'ok') {
        wp_send_json_error([
            'message' => 'Invalid API response.',
            'raw' => $body
        ]);
    }

    $data = $json['data'];

    // ✅ Sauvegarder le fichier dans /uploads
    $upload_dir = wp_upload_dir();
    $file_path = $upload_dir['basedir'] . '/res.json';
    $file_url = $upload_dir['baseurl'] . '/res.json';

    $json_data = wp_json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

    if (file_put_contents($file_path, $json_data) === false) {
        wp_send_json_error(['message' => 'Failed to write JSON file.']);
    }

    wp_send_json_success([
        'message' => 'Products fetched and saved successfully!',
        'file' => $file_url
    ]);
}