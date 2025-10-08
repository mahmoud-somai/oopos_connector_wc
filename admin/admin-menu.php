<?php
// ==========================
// Admin Menu & Pages
// ==========================
add_action('admin_menu', 'oopos_connector_menu');
function oopos_connector_menu() {
    // Main menu item
        add_menu_page(
            'OOPOS Connector',
            'OOPOS Connector',
            'manage_options',
            'oopos-connector',
            'oopos_connector_settings_page', // <--- use this
        );

    // Submenu: Settings (same slug as parent)
    add_submenu_page(
        'oopos-connector',
        'Settings',
        'Settings',
        'manage_options',
        'oopos-connector',
        'oopos_connector_settings_page'
    );

    // Submenu: Import (new slug)
    add_submenu_page(
        'oopos-connector',
        'Import',
        'Import',
        'manage_options',
        'oopos-connector-import',
        'oopos_connector_import_page'
    );
}

// Settings page callback
function oopos_connector_settings_page() {
    require_once plugin_dir_path(__FILE__) . 'admin-menu.php';
    oopos_connector_settings_content(); 
}


// Import page callback
function oopos_connector_import_page() {
    echo '<div class="wrap">';
    echo '<h1>OOPOS Connector - Import</h1>';
    include plugin_dir_path(__FILE__) . './import/import-page.php'; // import page in import folder
    echo '</div>';
}

// ==========================
// Admin Scripts
// ==========================
add_action('admin_enqueue_scripts', 'oopos_connector_enqueue_scripts');
function oopos_connector_enqueue_scripts($hook) {

    // Only load scripts for plugin pages
    if (strpos($hook, 'oopos-connector') === false) return;

    // Settings page
    if ($hook === 'toplevel_page_oopos-connector') {
        wp_enqueue_script(
            'oopos-admin-js',
            plugin_dir_url(__FILE__) . './admin-scripts.js',
            array('jquery'),
            '1.0',
            true
        );
    }

    // Import page
    if ($hook === 'oopos-connector_page_oopos-connector-import') {
        wp_enqueue_script(
            'oopos-import-js',
            plugin_dir_url(__FILE__) . './import/import-script.js',
            array('jquery'),
            '1.0',
            true
        );
    }
}

// ==========================
// AJAX Endpoints
// ==========================
add_action('wp_ajax_wt_iew_test_connection', 'wt_iew_test_connection');
add_action('wp_ajax_oopos_get_shops', 'oopos_get_shops');
add_action('wp_ajax_wt_iew_save_step1', 'wt_iew_save_step1');
add_action('wp_ajax_save_selected_shops_option', 'save_selected_shops_option_callback');
add_action('wp_ajax_oopos_save_attributes', 'oopos_save_attributes');
add_action('wp_ajax_oopos_save_extra_attributes', 'oopos_save_extra_attributes');

// ==========================
// AJAX Functions
// ==========================
function wt_iew_test_connection() {
    check_ajax_referer('wt_iew_nonce');

    $domain   = sanitize_text_field($_POST['domain'] ?? '');
    $enseigne = sanitize_text_field($_POST['enseigne'] ?? '');
    $api_key  = sanitize_text_field($_POST['api_key'] ?? '');

    try {
        $domain = rtrim($domain, "/") . '/';
        $api_path = $domain . 'api/v2/query.do?enseigne=' . $enseigne . '&api-key=' . $api_key;
        $shop_query = "SELECT Magasin FROM magasins;";

        $response = wp_remote_post($api_path, [
            'method' => 'PUT',
            'headers' => ['Accept' => 'application/json'],
            'body' => $shop_query,
            'timeout' => 15,
        ]);

        if (is_wp_error($response)) {
            wp_send_json_error(['status' => false, 'msg' => 'Connection error: ' . $response->get_error_message()]);
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);

        if (isset($data['error_message'])) {
            $msg = (strpos($data['error_message'], 'Unknown database') !== false)
                ? 'Failed to connect to ' . $enseigne
                : $data['error_message'];
            wp_send_json_error(['status' => false, 'msg' => $msg]);
        }

        update_option('oopos_connector_data', ['domain'=>$domain,'enseigne'=>$enseigne,'api_key'=>$api_key]);

        if (!empty($data)) update_option('oopos_shops', $data);

        wp_send_json_success(['status'=>true,'msg'=>'Connection successful! Credentials and shops saved.','shops'=>$data]);

    } catch (Exception $e) {
        wp_send_json_error(['status'=>false,'msg'=>'Failed to connect: ' . $e->getMessage()]);
    }
}

function oopos_get_shops() {
    check_ajax_referer('wt_iew_nonce');
    $shops_data = get_option('oopos_shops', []);
    $shops = [];
    if (!empty($shops_data) && isset($shops_data['data']) && is_array($shops_data['data'])) {
        foreach ($shops_data['data'] as $shop) {
            if (isset($shop['Magasin'])) $shops[] = $shop['Magasin'];
        }
    }
    if ($shops) wp_send_json_success($shops);
    else wp_send_json_error('No shops found');
}

function wt_iew_save_step1() {
    check_ajax_referer('wt_iew_nonce');
    $domain = sanitize_text_field($_POST['domain'] ?? '');
    $enseigne = sanitize_text_field($_POST['enseigne'] ?? '');
    $api_key = sanitize_text_field($_POST['api_key'] ?? '');
    update_option('oopos_connector_data', ['domain'=>$domain,'enseigne'=>$enseigne,'api_key'=>$api_key]);
    wp_send_json_success('Step 1 saved successfully');
}

function save_selected_shops_option_callback() {
    check_ajax_referer('wt_iew_nonce', '_wpnonce');
    if (isset($_POST['selected_shops']) && is_array($_POST['selected_shops'])) {
        update_option('oopos-shops-selected', $_POST['selected_shops']);
        wp_send_json_success('Selected shops saved!');
    } else wp_send_json_error('No shops received.');
}

function oopos_save_attributes() {
    check_ajax_referer('wt_iew_nonce', '_wpnonce');

    $sizeLabel  = sanitize_text_field($_POST['sizeLabel'] ?? '');
    $colorLabel = sanitize_text_field($_POST['colorLabel'] ?? '');

    update_option('oopos_settings_basic_attribute', ['size'=>$sizeLabel,'color'=>$colorLabel]);

    if (function_exists('wc_create_attribute')) {
        global $wpdb;
        $attribute_taxonomies = wc_get_attribute_taxonomies();
        $existing_slugs = array_column($attribute_taxonomies, 'attribute_name');

        $save_attribute = function($label) use ($existing_slugs, $wpdb) {
            $slug = sanitize_title($label);
            if (in_array($slug, $existing_slugs)) {
                $wpdb->update($wpdb->prefix.'woocommerce_attribute_taxonomies',['attribute_label'=>$label],['attribute_name'=>$slug]);
                if (function_exists('delete_transient')) delete_transient('wc_attribute_taxonomies');
                return "Updated: {$label}";
            } else {
                $result = wc_create_attribute(['name'=>$label,'slug'=>$slug,'type'=>'select','order_by'=>'menu_order','has_archives'=>false]);
                if (is_wp_error($result)) return "Error creating {$label}: ".$result->get_error_message();
                delete_transient('wc_attribute_taxonomies');
                return "Created: {$label}";
            }
        };

        $messages = [];
        if ($sizeLabel) $messages[] = $save_attribute($sizeLabel);
        if ($colorLabel) $messages[] = $save_attribute($colorLabel);
    }

    wp_send_json_success(['message'=>implode(' | ',$messages)]);
}

function oopos_save_extra_attributes() {
    check_ajax_referer('wt_iew_nonce', '_wpnonce');
    if (!isset($_POST['extra_attributes']) || !is_array($_POST['extra_attributes']))
        wp_send_json_error(['message'=>'No attributes provided']);

    $extra_attributes = array_map('sanitize_text_field', $_POST['extra_attributes']);
    update_option('oopos_settings_extra_attribute', $extra_attributes);

    if (function_exists('wc_create_attribute')) {
        $existing_attributes = wc_get_attribute_taxonomies();
        $existing_slugs = array_column($existing_attributes,'attribute_name');
        global $wpdb;
        foreach($extra_attributes as $attr){
            $slug = sanitize_title($attr);
            if(!in_array($slug,$existing_slugs)){
                wc_create_attribute(['name'=>$attr,'slug'=>$slug,'type'=>'select','order_by'=>'menu_order','has_archives'=>false]);
            } else {
                $wpdb->update($wpdb->prefix.'woocommerce_attribute_taxonomies',['attribute_label'=>$attr],['attribute_name'=>$slug]);
                wc_clear_attribute_cache();
            }
        }
    }

    wp_send_json_success(['message'=>'Extra attributes saved successfully']);
}

// Register plugin settings
add_action('admin_init', 'oopos_connector_register_settings');
function oopos_connector_register_settings() {
    register_setting('oopos_connector_settings','oopos_connector_data');
}
