<?php
// Security check
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap" style="text-align:center;">
    <h1 style="margin-bottom: 30px;">Start Importing Products from OOPOS</h1>

    <div class="oopos-card" style="
        background: #fff;
        display: inline-block;
        text-align: left;
        padding: 30px 40px;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        max-width: 600px;
        width: 100%;
    ">
        <form id="oopos-import-form" method="post" enctype="multipart/form-data">

            <!-- Skip Import of New Products -->
            <div class="form-section" style="margin-bottom: 25px;">
                <label style="font-weight: 600; display:block; margin-bottom:8px;">Skip import of new products:</label>
                <div style="display: flex; gap: 20px; align-items: center;">
                    <label><input type="radio" name="skip_new_products" value="yes"> Yes</label>
                    <label><input type="radio" name="skip_new_products" value="no" checked> No</label>
                </div>
            </div>

            <!-- Product Imported Already -->
            <div class="form-section" style="margin-bottom: 25px;">
                <label style="font-weight: 600; display:block; margin-bottom:8px;">Product imported already:</label>
                <div style="display: flex; gap: 20px; align-items: center;">
                    <label><input type="radio" name="existing_products" value="skip" checked> Skip</label>
                    <label><input type="radio" name="existing_products" value="update"> Update them</label>
                </div>
            </div>

            <!-- Product Contain Empty Values -->
            <div class="form-section" style="margin-bottom: 25px;">
                <label style="font-weight: 600; display:block; margin-bottom:8px;">Product contains empty values:</label>
                <div style="display: flex; gap: 20px; align-items: center;">
                    <label><input type="radio" name="empty_values" value="skip" checked> Skip</label>
                    <label><input type="radio" name="empty_values" value="update"> Update them</label>
                </div>
            </div>

            <div style="text-align:center; margin-top:30px;">
                <button type="submit" class="button button-primary" style="padding: 8px 25px; font-size: 15px;">
                    Start Import
                </button>
            </div>
        </form>

        <div id="import-result" style="margin-top: 20px;"></div>
    </div>
</div>
