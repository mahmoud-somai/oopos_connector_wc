<?php
if (!defined('ABSPATH')) exit;

// Get saved options, default to false
$skip_new_product = get_option('oopos_skip_new_product', false);
$existing_products = get_option('oopos_existing_products', false);
$empty_values = get_option('oopos_empty_values', false);
?>

<form id="oopos-import-form">
    <?php wp_nonce_field('oopos_import_nonce', '_wpnonce'); ?>

    <div class="form-section">
        <label>Skip import of new products:</label>
        <label><input type="radio" name="skip_new_products" value="yes" <?php checked($skip_new_product, true); ?>> Yes</label>
        <label><input type="radio" name="skip_new_products" value="no" <?php checked($skip_new_product, false); ?>> No</label>
    </div>

    <div class="form-section">
        <label>Product imported already:</label>
        <label><input type="radio" name="existing_products" value="update" <?php checked($existing_products, true); ?>> Update</label>
        <label><input type="radio" name="existing_products" value="skip" <?php checked($existing_products, false); ?>> Skip</label>
    </div>

    <div class="form-section">
        <label>Product contains empty values:</label>
        <label><input type="radio" name="empty_values" value="update" <?php checked($empty_values, true); ?>> Update</label>
        <label><input type="radio" name="empty_values" value="skip" <?php checked($empty_values, false); ?>> Skip</label>
    </div>

    <button type="submit">Save Settings</button>
</form>
<div id="import-result"></div>
