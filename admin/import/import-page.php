<?php
// Security check
if (!defined('ABSPATH')) exit;

// Preload boolean values from DB
$skip_new_product = get_option('oopos_skip_new_product', false); // boolean
$existing_products = get_option('oopos_existing_products', false); // boolean
$empty_values = get_option('oopos_empty_values', false); // boolean
?>

<div class="wrap import-wrapper">
    <h1 class="import-title">Start Importing Products from OOPOS</h1>

    <div class="oopos-import-card">
        <form id="oopos-import-form" method="post">
            <?php wp_nonce_field('oopos_import_nonce', '_wpnonce'); ?>

            <!-- Skip Import of New Products -->
            <div class="form-section">
                <label class="section-label">Skip import of new products:</label>
                <div class="options-row">
                    <label><input type="radio" name="skip_new_products" value="yes" <?php checked($skip_new_product, true); ?>> Yes</label>
                    <label><input type="radio" name="skip_new_products" value="no" <?php checked($skip_new_product, false); ?>> No</label>
                </div>
            </div>

            <!-- Product Imported Already -->
            <div class="form-section">
                <label class="section-label">Product imported already:</label>
                <div class="options-row">
                    <label><input type="radio" name="existing_products" value="skip" <?php checked($existing_products, false); ?>> Skip</label>
                    <label><input type="radio" name="existing_products" value="update" <?php checked($existing_products, true); ?>> Update them</label>
                </div>
            </div>

            <!-- Product Contain Empty Values -->
            <div class="form-section">
                <label class="section-label">Product contains empty values:</label>
                <div class="options-row">
                    <label><input type="radio" name="empty_values" value="skip" <?php checked($empty_values, false); ?>> Skip</label>
                    <label><input type="radio" name="empty_values" value="update" <?php checked($empty_values, true); ?>> Update them</label>
                </div>
            </div>

            <div class="submit-section">
                <button type="submit" class="button button-primary">Save Settings</button>
            </div>
        </form>

        <div id="import-result"></div>
    </div>
</div>
