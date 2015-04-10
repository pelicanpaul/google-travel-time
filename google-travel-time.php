<?php
/*
Plugin Name: Google Travel Time
Plugin URI: http://www.paullyons.info/
Description: Using the Google Directions API to get transit info and times.
Version: 1.0
Author: Manoj.K.Gangavarapu & Paul Lyons
Author URI: TBD
License: GPL2
*/

function load_scripts() {
	wp_register_script('googlejs', '/wp-content/plugins/google-travel-time/js/googlemaps.js', false);
}

add_action('wp_enqueue_scripts','load_scripts');

function get_travel_time($atts,$content=null){
	$my_times = shortcode_atts(array(
		'start' => '333 Market St, San Francisco, CA',
		'end' => 'San Francisco International Airport, San Francisco, CA',
		'taxifare' => '$50.00',
		'transitnote' => '',
		'showtransit' => 'true',
		'showdriving' => 'true',
		'offset' => 7,
	), $atts);

	wp_enqueue_script('googlejs');
	wp_localize_script('googlejs','sc_atts',$my_times);
	$endshort = esc_attr( $my_times['endshort'] );

	?>
	<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true"></script>

	<?php
	return '<div id="transit_info_panel"></div><div id="driving_info_panel"></div>';
}
add_shortcode('gtt_get_travel', 'get_travel_time');
?>