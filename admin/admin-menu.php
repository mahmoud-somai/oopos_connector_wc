<?php
// Add admin menu
add_action('admin_menu', 'oopos_connector_menu');
function oopos_connector_menu() {
    // Main menu item
    add_menu_page(
        'OOPOS Connector',          // Page title
        'OOPOS Connector',          // Menu title
        'manage_options',           // Capability
        'oopos-connector',          // Menu slug
        'oopos_connector_settings_page', // Callback
        'dashicons-admin-generic',
        6
    );

    // Submenu: Settings
    add_submenu_page(
        'oopos-connector',               // Parent slug
        'Settings',                      // Page title
        'Settings',                      // Menu title
        'manage_options',                // Capability
        'oopos-connector',               // Menu slug (same as parent)
        'oopos_connector_settings_page'  // Callback function
    );

    // Submenu: Import
    add_submenu_page(
        'oopos-connector',               // Parent slug
        'Import',                        // Page title
        'Import',                        // Menu title
        'manage_options',                // Capability
        'oopos-connector-import',        // Slug for import page
        'oopos_connector_import_page'    // Callback function
    );
}   

function oopos_connector_import_page() {
 
    include plugin_dir_path(__FILE__) . './import/import-page.php';

}


add_action('wp_ajax_wt_iew_test_connection', 'wt_iew_test_connection');

function wt_iew_test_connection() {
    check_ajax_referer('wt_iew_nonce');

    $domain   = sanitize_text_field($_POST['domain'] ?? '');
    $enseigne = sanitize_text_field($_POST['enseigne'] ?? '');
    $api_key  = sanitize_text_field($_POST['api_key'] ?? '');

    try {
        $domain = rtrim($domain, "/") . '/';
        $api_path = $domain . 'api/v2/query.do?enseigne=' . $enseigne . '&api-key=' . $api_key;
        $shop_query = "SELECT Magasin FROM magasins;";

        // Use WordPress HTTP API
        $response = wp_remote_post($api_path, array(
            'method'  => 'PUT',
            'headers' => array('Accept' => 'application/json'),
            'body'    => $shop_query,
            'timeout' => 15,
        ));

        if (is_wp_error($response)) {
            wp_send_json_error(array(
                'status' => false,
                'msg' => 'Connection error: ' . $response->get_error_message(),
            ));
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);

        // Handle API error response
        if (isset($data['error_message'])) {
            $msg = (strpos($data['error_message'], 'Unknown database') !== false)
                ? 'Failed to connect to ' . $enseigne
                : $data['error_message'];

            wp_send_json_error(array('status' => false, 'msg' => $msg));
        }

        // ✅ If success: save credentials
        $settings = array(
            'domain'   => $domain,
            'enseigne' => $enseigne,
            'api_key'  => $api_key
        );
        update_option('oopos_connector_data', $settings);

        // ✅ Save the shop response
        if (!empty($data)) {
            update_option('oopos_shops', $data);
        }

        wp_send_json_success(array(
            'status' => true,
            'msg'    => 'Connection successful! Credentials and shops saved.',
            'shops'  => $data
        ));

    } catch (Exception $e) {
        wp_send_json_error(array(
            'status' => false,
            'msg' => 'Failed to connect: ' . $e->getMessage(),
        ));
    }
}

// ✅ AJAX endpoint to fetch saved shops
add_action('wp_ajax_oopos_get_shops', 'oopos_get_shops');
function oopos_get_shops() {
    check_ajax_referer('wt_iew_nonce');

    $shops_data = get_option('oopos_shops', array());
    $shops = array();

    if (!empty($shops_data) && isset($shops_data['data']) && is_array($shops_data['data'])) {
        foreach ($shops_data['data'] as $shop) {
            if (isset($shop['Magasin'])) {
                $shops[] = $shop['Magasin'];
            }
        }
    }

    if (!empty($shops)) {
        wp_send_json_success($shops);
    } else {
        wp_send_json_error('No shops found');
    }
}




// Save Step 1 via AJAX
add_action('wp_ajax_wt_iew_save_step1', 'wt_iew_save_step1');
function wt_iew_save_step1() {
    check_ajax_referer('wt_iew_nonce');

    $domain = sanitize_text_field($_POST['domain'] ?? '');
    $enseigne = sanitize_text_field($_POST['enseigne'] ?? '');
    $api_key = sanitize_text_field($_POST['api_key'] ?? '');

    $data = array(
        'domain'   => $domain,
        'enseigne' => $enseigne,
        'api_key'  => $api_key
    );

    // Save to database
    update_option('oopos_connector_data', $data);

    wp_send_json_success('Step 1 saved successfully');
}


// Register settings
add_action('admin_init', 'oopos_connector_register_settings');
function oopos_connector_register_settings() {
    register_setting('oopos_connector_settings', 'oopos_connector_data');
}


add_action('wp_ajax_save_selected_shops_option', 'save_selected_shops_option_callback');
function save_selected_shops_option_callback() {
    check_ajax_referer('wt_iew_nonce', '_wpnonce');

    if (isset($_POST['selected_shops']) && is_array($_POST['selected_shops'])) {
        // Save the array as an option
        update_option('oopos-shops-selected', $_POST['selected_shops']);
        wp_send_json_success('Selected shops saved!');
    } else {
        wp_send_json_error('No shops received.');
    }
}

// Save Step 3 attributes
add_action('wp_ajax_oopos_save_attributes', 'oopos_save_attributes');
function oopos_save_attributes() {
    check_ajax_referer('wt_iew_nonce', '_wpnonce');

    $sizeLabel  = sanitize_text_field($_POST['sizeLabel'] ?? '');
    $colorLabel = sanitize_text_field($_POST['colorLabel'] ?? '');

    // 1️⃣ Save in options (always "size" and "color" keys)
    update_option('oopos_settings_basic_attribute', [
        'size'  => $sizeLabel,
        'color' => $colorLabel,
    ]);

    // 2️⃣ Create/update WooCommerce attributes
    if (function_exists('wc_create_attribute')) {
        global $wpdb;

        $attribute_taxonomies = wc_get_attribute_taxonomies();
        $existing_slugs = array_column($attribute_taxonomies, 'attribute_name');

        // Helper function to safely create/update
        $save_attribute = function($label) use ($existing_slugs, $wpdb) {
            $slug = sanitize_title($label);
            if (in_array($slug, $existing_slugs)) {
                // Attribute already exists -> update label if needed
                $wpdb->update(
                    $wpdb->prefix . 'woocommerce_attribute_taxonomies',
                    ['attribute_label' => $label],
                    ['attribute_name' => $slug]
                );
                if (function_exists('delete_transient')) {
                    delete_transient('wc_attribute_taxonomies');
                }
                return "Updated existing attribute: {$label}";
            } else {
                // Create new one
                $result = wc_create_attribute([
                    'name' => $label,
                    'slug' => $slug,
                    'type' => 'select',
                    'order_by' => 'menu_order',
                    'has_archives' => false
                ]);

                if (is_wp_error($result)) {
                    return "Error creating attribute {$label}: " . $result->get_error_message();
                }

              delete_transient('wc_attribute_taxonomies');
                return "Created new attribute: {$label}";
            }
        };

        $messages = [];
        if ($sizeLabel)  $messages[] = $save_attribute($sizeLabel);
        if ($colorLabel) $messages[] = $save_attribute($colorLabel);
    }

    wp_send_json_success(['message' => implode(' | ', $messages)]);
}


add_action('wp_ajax_oopos_save_extra_attributes', 'oopos_save_extra_attributes');
function oopos_save_extra_attributes() {
    check_ajax_referer('wt_iew_nonce', '_wpnonce');

    if (!isset($_POST['extra_attributes']) || !is_array($_POST['extra_attributes'])) {
        wp_send_json_error(['message' => 'No attributes provided']);
    }

    $extra_attributes = array_map('sanitize_text_field', $_POST['extra_attributes']);

    // Save in options
    update_option('oopos_settings_extra_attribute', $extra_attributes);

    // Save as WooCommerce attributes
    if (function_exists('wc_create_attribute')) {
        $existing_attributes = wc_get_attribute_taxonomies();
        $existing_slugs = array_column($existing_attributes, 'attribute_name');

        global $wpdb;

        foreach ($extra_attributes as $attr) {
            $slug = sanitize_title($attr); // slug same as user input
            if (!in_array($slug, $existing_slugs)) {
                wc_create_attribute([
                    'name' => $attr,
                    'slug' => $slug,
                    'type' => 'select',
                    'order_by' => 'menu_order',
                    'has_archives' => false,
                ]);
            } else {
                // update label if it exists but name changed (optional)
                $wpdb->update(
                    $wpdb->prefix . 'woocommerce_attribute_taxonomies',
                    ['attribute_label' => $attr],
                    ['attribute_name' => $slug]
                );
                wc_clear_attribute_cache();
            }
        }
    }

    wp_send_json_success(['message' => 'Extra attributes saved successfully']);


    // ==========================
// AJAX: Save Import Settings
// ==========================
add_action('wp_ajax_oopos_save_import_settings', 'oopos_save_import_settings');
function oopos_save_import_settings() {
    check_ajax_referer('oopos_import_nonce', '_wpnonce');

    $skip_new_products = sanitize_text_field($_POST['skip_new_products'] ?? 'no');
    $skip_new_products_bool = ($skip_new_products === 'yes') ? true : false;

    update_option('oopos_skip_new_product', $skip_new_products_bool);

    wp_send_json_success(['message' => 'Import settings saved successfully!']);
}
}





