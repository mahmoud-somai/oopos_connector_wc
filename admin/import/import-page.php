<?php
// Security check
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
    <h1>Start Importing Products from OOPOS</h1>

    <div class="oopos-card" style="
        background: #fff;
        padding: 25px;
        border-radius: 12px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        max-width: 650px;
        margin-top: 20px;
    ">
        <form id="oopos-import-form" method="post" enctype="multipart/form-data">
            
            <!-- Skip Import of New Products -->
            <div class="form-section" style="margin-bottom: 20px;">
                <label style="font-weight: 600;">Skip import of new products:</label><br>
                <label><input type="radio" name="skip_new_products" value="yes"> Yes</label><br>
                <label><input type="radio" name="skip_new_products" value="no" checked> No</label>
            </div>

            <!-- Product Imported Already -->
            <div class="form-section" style="margin-bottom: 20px;">
                <label style="font-weight: 600;">Product imported already:</label><br>
                <label><input type="radio" name="existing_products" value="skip" checked> Skip</label><br>
                <label><input type="radio" name="existing_products" value="update"> Update them</label>
            </div>

            <!-- Product Contain Empty Values -->
            <div class="form-section" style="margin-bottom: 20px;">
                <label style="font-weight: 600;">Product contains empty values:</label><br>
                <label><input type="radio" name="empty_values" value="skip" checked> Skip</label><br>
                <label><input type="radio" name="empty_values" value="update"> Update them</label>
            </div>

            <p class="submit" style="margin-top: 25px;">
                <button type="submit" class="button button-primary" style="padding: 8px 20px;">Start Import</button>
            </p>
        </form>

        <div id="import-result" style="margin-top: 20px;"></div>
    </div>
</div>
