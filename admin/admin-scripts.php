<?php
add_action('admin_enqueue_scripts', 'oopos_connector_admin_assets');
function oopos_connector_admin_assets($hook) {
    if ($hook != 'toplevel_page_oopos-connector') return;

    // CSS
    wp_enqueue_style('oopos-connector-admin-style', plugin_dir_url(__FILE__) . 'admin-style.css');

    // JS
    wp_enqueue_script('oopos-connector-admin-js', plugin_dir_url(__FILE__) . 'admin-scripts.js', array('jquery'), false, true);

    wp_enqueue_script(
            'oopos-import-script',
            plugin_dir_url(__FILE__) . './import/import-script.js', // correct path from admin-menu.php
            array('jquery'), // no dependency for vanilla JS
            '1.0',
            true // footer
        );

            wp_enqueue_style(
            'oopos-import-style',
            plugin_dir_url(__FILE__) . './import/import-style.css',
            array(),
            '1.0'
        );
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
