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

    $domain = sanitize_text_field($_POST['domain'] ?? '');
    $enseigne = sanitize_text_field($_POST['enseigne'] ?? '');
    $api_key = sanitize_text_field($_POST['api_key'] ?? '');

    try {
        $headers = array('Accept' => 'application/json');
        $domain = rtrim($domain, "/") . '/';
        $api_path = $domain . 'api/v2/query.do?enseigne=' . $enseigne . '&api-key=' . $api_key;
        $shop_query = "SELECT Magasin FROM magasins;";

        // Use Unirest to send request
        Unirest\Request::verifyPeer(false);
        $response = Unirest\Request::put($api_path, $headers, $shop_query);
        $data = json_decode(json_encode($response->body), true);

        if (isset($data['error_message'])) {
            $msg = (strpos($data['error_message'], 'Unknown database') !== false)
                ? 'Failed to connect to ' . $enseigne
                : $data['error_message'];

            wp_send_json_success(array('status' => false, 'msg' => $msg));
        }
    } catch (Exception $e) {
        wp_send_json_success(array('status' => false, 'msg' => 'Failed to connect to ' . $domain));
    }

    wp_send_json_success(array('status' => true, 'msg' => 'Connection successful!'));
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
    update_option('wt_iew_advanced_settings', $data);

    wp_send_json_success('Step 1 saved successfully');
}


// Register settings
add_action('admin_init', 'oopos_connector_register_settings');
function oopos_connector_register_settings() {
    register_setting('oopos_connector_settings', 'oopos_connector_data');
}
