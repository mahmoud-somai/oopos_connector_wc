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
               
<!-- Step 2 -->
<div class="step" id="step2" style="display:none;">
    <h3>Select your shops</h3>

    <?php if (!empty($shops)) : ?>
        <?php
        // Loop over the number of shops
        for ($i = 0; $i < count($shops); $i++) :
            $label = ($i === 0) ? "Main Shop" : "Shop " . ($i + 1);
            $select_name = "shop" . ($i + 1);
        ?>
            <label><?php echo esc_html($label); ?>:</label><br>
            <select name="oopos_connector_data[<?php echo esc_attr($select_name); ?>]">
                <?php foreach ($shops as $shop_name): ?>
                    <option value="<?php echo esc_attr($shop_name); ?>" 
                        <?php selected($data[$select_name] ?? '', $shop_name); ?>>
                        <?php echo esc_html($shop_name); ?>
                    </option>
                <?php endforeach; ?>
            </select><br><br>
        <?php endfor; ?>

    <?php else : ?>
        <p style="color:red;">⚠️ No shops found. Please test the connection first.</p>
    <?php endif; ?>

    <button type="button" id="back-step1">Previous</button>
    <button type="button" id="to-step3">Next</button>
</div>

                <!-- Step 3 -->
                <div class="step" id="step3">
                    <h3>Choose your attributes</h3>
                    <label>Size:</label><br>
                    <input type="text" name="oopos_connector_data[size]" value="<?php echo esc_attr($data['size'] ?? ''); ?>"><br>

                    <label>Color:</label><br>
                    <input type="text" name="oopos_connector_data[color]" value="<?php echo esc_attr($data['color'] ?? ''); ?>"><br>

                    <button type="button" id="back-step2">Previous</button>
                    <?php submit_button('Save Settings'); ?>
                </div>

            </form>
        </div>
    </div>
    <?php
}
