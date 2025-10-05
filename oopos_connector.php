<?php
/*
Plugin Name: OOPOS Connector
Description: Multi-step connector form in admin page.
Version: 1.2
Author: Your Name
*/

if (is_admin()) {
    require_once plugin_dir_path(__FILE__) . 'admin/admin-menu.php';
    require_once plugin_dir_path(__FILE__) . 'admin/admin-page.php';
    require_once plugin_dir_path(__FILE__) . 'admin/admin-scripts.php';
}
