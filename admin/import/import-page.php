<?php
// Security check
if (!defined('ABSPATH')) {
    exit;
}

// Enqueue the CSS file for this page
wp_enqueue_style(
    'oopos-import-style',
    plugin_dir_url(__FILE__) . 'import-style.css',
    array(),
    '1.0'
);
?>

<div class="wrap import-wrapper">
    <h1 class="import-title">Start Importing Products from OOPOS</h1>

    <div class="oopos-import-card">
<form id="oopos-import-form" method="post">
    <input type="hidden" name="action" value="oopos_save_import_settings">
    <?php wp_nonce_field('oopos_import_nonce', '_wpnonce'); ?>

    <!-- Skip Import of New Products -->
    <div class="form-section">
        <label class="section-label">Skip import of new products:</label>
        <div class="options-row">
            <label><input type="radio" name="skip_new_products" value="yes"> Yes</label>
            <label><input type="radio" name="skip_new_products" value="no" checked> No</label>
        </div>
    </div>

    <!-- Product Imported Already -->
    <div class="form-section">
        <label class="section-label">Product imported already:</label>
        <div class="options-row">
            <label><input type="radio" name="existing_products" value="skip" checked> Skip</label>
            <label><input type="radio" name="existing_products" value="update"> Update them</label>
        </div>
    </div>

    <!-- Product Contain Empty Values -->
    <div class="form-section">
        <label class="section-label">Product contains empty values:</label>
        <div class="options-row">
            <label><input type="radio" name="empty_values" value="skip" checked> Skip</label>
            <label><input type="radio" name="empty_values" value="update"> Update them</label>
        </div>
    </div>

    <div class="submit-section">
        <button type="submit" class="button button-primary">Save Settings</button>
    </div>
</form>

<div id="import-result"></div>


        <div id="import-result"></div>
    </div>
</div>
