<?php
// Add admin menu
add_action('admin_menu', 'oopos_connector_menu');
function oopos_connector_menu() {
    add_menu_page(
        'OOPOS Connector',       // Page title
        'OOPOS Connector',       // Menu title
        'manage_options',        // Capability
        'oopos-connector',       // Menu slug
        'oopos_connector_page',  // Callback (from admin-page.php)
        'dashicons-admin-generic',
        6
    );
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

// ✅ Save Size and Color attributes (Step 3)
add_action('admin_init', 'oopos_save_basic_attributes');
function oopos_save_basic_attributes() {
    if (
        isset($_POST['oopos_settings_basic_attribute']) &&
        isset($_POST['oopos_attributes_nonce']) &&
        wp_verify_nonce($_POST['oopos_attributes_nonce'], 'save_oopos_attributes')
    ) {
        $attributes = [
            'size'  => sanitize_text_field($_POST['oopos_settings_basic_attribute']['size']),
            'color' => sanitize_text_field($_POST['oopos_settings_basic_attribute']['color']),
        ];

        update_option('oopos_settings_basic_attribute', $attributes);
    }
}


// ✅ AJAX : Save Extra Attributes and Create them in WooCommerce
add_action('wp_ajax_save_extra_attributes', 'oopos_save_extra_attributes');
function oopos_save_extra_attributes() {
    check_ajax_referer('wt_iew_nonce', '_wpnonce');

    if (!isset($_POST['extra_attributes']) || !is_array($_POST['extra_attributes'])) {
        wp_send_json_error('No attributes received.');
    }

    $attributes = array_map('sanitize_text_field', $_POST['extra_attributes']);

    // Save in WP option
    update_option('oopos_settings_extra_attributes', $attributes);

    global $wpdb;
    $table = $wpdb->prefix . 'woocommerce_attribute_taxonomies';

    foreach ($attributes as $attr_name) {
        $slug = wc_sanitize_taxonomy_name($attr_name);

        // Check if already exists
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT attribute_id FROM $table WHERE attribute_name = %s",
            $slug
        ));

        if (!$exists) {
            // Insert attribute into WooCommerce table
            $wpdb->insert($table, array(
                'attribute_name'    => $slug,
                'attribute_label'   => $attr_name,
                'attribute_type'    => 'select',
                'attribute_orderby' => 'menu_order',
                'attribute_public'  => 1,
            ));
        }

        // Register the taxonomy (important for immediate recognition)
        $taxonomy = 'pa_' . $slug;
        if (!taxonomy_exists($taxonomy)) {
            register_taxonomy(
                $taxonomy,
                array('product'),
                array(
                    'label' => ucfirst($attr_name),
                    'public' => true,
                    'show_ui' => true,
                    'hierarchical' => false,
                )
            );
        }
    }

    // Refresh WooCommerce attributes cache
    delete_transient('wc_attribute_taxonomies');
    wc_clear_cached_transients();

    wp_send_json_success('Attributes saved and created successfully!');
}
