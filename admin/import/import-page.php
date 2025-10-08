<?php
// Security check
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
    <h2>Import Products or Data</h2>
    <p>Use this page to import data from your OOPOS system into WooCommerce.</p>

    <form id="oopos-import-form" method="post" enctype="multipart/form-data">
        <table class="form-table">
            <tr>
                <th><label for="import-file">Select File</label></th>
                <td><input type="file" name="import-file" id="import-file" accept=".csv,.json"></td>
            </tr>
        </table>

        <p class="submit">
            <button type="submit" class="button button-primary">Start Import</button>
        </p>
    </form>

    <div id="import-result"></div>
</div>
