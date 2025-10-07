<?php
add_action('admin_enqueue_scripts', 'oopos_connector_admin_assets');
function oopos_connector_admin_assets($hook) {
    if ($hook != 'toplevel_page_oopos-connector') return;

    // CSS
    wp_enqueue_style('oopos-connector-admin-style', plugin_dir_url(__FILE__) . 'admin-style.css');

    // JS
    wp_enqueue_script('oopos-connector-admin-js', plugin_dir_url(__FILE__) . 'admin-scripts.js', array('jquery'), false, true);

    // Localize script for AJAX
    // wp_localize_script('oopos-connector-admin-js', 'wt_iew_ajax', array(
    //     'ajax_url' => admin_url('admin-ajax.php'),
    //     'nonce'    => wp_create_nonce('wt_iew_nonce')
    // ));

        wp_localize_script('oopos-admin-js', 'oopos_ajax', [
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce'    => wp_create_nonce('oopos_connector_nonce')
    ]);
}
