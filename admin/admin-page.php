<?php
function oopos_connector_page() {
        $data = get_option('oopos_connector_data', array());
    $shops_data = get_option('oopos_shops', array());

    // Décoder les données des shops (car c’est une option sérialisée)
    $shops = array();
    if (!empty($shops_data) && isset($shops_data['data']) && is_array($shops_data['data'])) {
        foreach ($shops_data['data'] as $shop) {
            if (isset($shop['Magasin'])) {
                $shops[] = $shop['Magasin'];
            }
        }
    }
    $data = get_option('oopos_connector_data', array());
    ?>
    <div class="wrap">
        <h1>WELCOME TO OOPOS CONNECTOR BY IDVEY</h1>

        <div class="oopos-card">
            <h2>Connector Settings</h2>
            <form method="post" action="options.php" id="multi-step-form">
                <?php settings_fields('oopos_connector_settings'); ?>

                
				<!-- Step 1 -->
				<div class="step" id="step1">
					<label for="domain">Domain:</label><br>
					<input type="text" id="domain" name="oopos_connector_data[domain]" 
						   placeholder="https://test.oopos.fr" 
						   value="<?php echo esc_attr($data['domain'] ?? ''); ?>"><br>
					<span class="error-message" id="domain-error"></span>

					<label for="enseigne">Enseigne:</label><br>
					<input type="text" id="enseigne" name="oopos_connector_data[enseigne]" 
						   placeholder="utilisateur oopos" 
						   value="<?php echo esc_attr($data['enseigne'] ?? ''); ?>"><br>
					<span class="error-message" id="enseigne-error"></span>

					<label for="api_key">API Key:</label><br>
					<input type="text" id="api_key" name="oopos_connector_data[api_key]" 
						   placeholder="API KEY (a3f5c...74000)" 
						   value="<?php echo esc_attr($data['api_key'] ?? ''); ?>"><br>
					<span class="error-message" id="apikey-error"></span>
				   <button type="button" id="test-connection">Test Connection</button>
					<button type="button" id="to-step2" disabled>Next</button>
					<span id="connection-status" style="margin-left: 15px;"></span>
				</div>






<!-- Step 2 -->
<div class="step" id="step2" style="display:none;">
    <h3>Select your shops</h3>

    <?php if (!empty($shops)) : ?>
        <div id="shops-container" style="display:flex; flex-direction: column; gap:8px;">
            <?php foreach ($shops as $index => $shop_name): ?>
                <label class="shop-checkbox">
                    <input type="checkbox" 
                           name="oopos_connector_data[shop_selected][]" 
                           value="<?php echo esc_attr($shop_name); ?>"
                           <?php 
                                if (!empty($data['shop_selected']) && in_array($shop_name, $data['shop_selected'])) {
                                    echo 'checked';
                                }
                           ?>
                           <?php echo $index === 0 ? 'data-main="true"' : ''; ?>
                    >
                    <?php echo esc_html($shop_name); ?>
                    <?php if ($index === 0) echo ' (Main)'; ?>
                </label>
            <?php endforeach; ?>
        </div>
    <?php else : ?>
        <p style="color:red;"> No shops found. Please test the connection first.</p>
    <?php endif; ?>

    <button type="button" id="back-step1">Previous</button>
    <button type="button" id="to-step3">Next</button>
</div>



   <!-- Step 3 -->
<div class="step" id="step3">
    <h3>Choose your attributes</h3>

    <?php 
    // Get image from parent plugin directory (one level up from /admin/)
    $image_url = plugins_url('../attribute_picture.png', __FILE__); 

    // Get saved data from the options table
    $saved_attributes = get_option('oopos_settings_basic_attribute', []);
    ?>

    <div class="attribute-image-container">
        <img src="<?php echo esc_url($image_url); ?>" 
             alt="Attributes Illustration" 
             class="attribute-image" />
    </div>

    <form method="post" action="">
        <?php wp_nonce_field('save_oopos_attributes', 'oopos_attributes_nonce'); ?>

        <label for="size">Size:</label><br>
        <input type="text" id="size" name="oopos_settings_basic_attribute[size]" 
               value="<?php echo esc_attr($saved_attributes['size'] ?? ''); ?>"><br><br>

        <label for="color">Color:</label><br>
        <input type="text" id="color" name="oopos_settings_basic_attribute[color]" 
               value="<?php echo esc_attr($saved_attributes['color'] ?? ''); ?>"><br><br>

        <button type="button" id="back-step2">Previous</button>
        <?php submit_button('Save Settings'); ?>
    </form>
</div>

<!-- Step 4 -->
<div class="step" id="step4" style="display:none;">
    <h3>Add Additional Attributes</h3>

    <?php 
    $extra_attributes = get_option('oopos_settings_extra_attributes', []);
    ?>

    <form method="post" action="">
        <?php wp_nonce_field('save_oopos_extra_attributes', 'oopos_extra_attributes_nonce'); ?>

        <div id="extra-attributes-container">
            <?php if (!empty($extra_attributes)) : ?>
                <?php foreach ($extra_attributes as $index => $attr) : ?>
                    <div class="extra-attribute-row">
                        <label>Extra attribute:</label>
                        <input type="text" name="oopos_settings_extra_attributes[]" 
                               value="<?php echo esc_attr($attr); ?>" />
                        <button type="button" class="remove-attribute">Remove</button>
                    </div>
                <?php endforeach; ?>
            <?php else : ?>
                <div class="extra-attribute-row">
                    <label>Extra attribute:</label>
                    <input type="text" name="oopos_settings_extra_attributes[]" value="" />
                    <button type="button" class="remove-attribute">Remove</button>
                </div>
            <?php endif; ?>
        </div>

        <button type="button" id="add-extra-attribute">Add Another Attribute</button><br><br>

        <button type="button" id="back-step3">Previous</button>
        <?php submit_button('Save Extra Attributes'); ?>
    </form>
</div>

            </form>
        </div>
    </div>
    <?php
}
