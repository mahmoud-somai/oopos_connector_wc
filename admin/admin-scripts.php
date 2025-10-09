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

    update_option('oopos_skip_new_product', $skip_new);
    update_option('oopos_existing_products', $existing_update);
    update_option('oopos_empty_values', $empty_update);

    wp_send_json_success(['message' => 'Import settings saved successfully!']);
}

