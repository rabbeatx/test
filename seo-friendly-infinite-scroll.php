<?php
/*
Plugin Name: SEO Friendly Infinite Scroll
Plugin URI: https://webdevnet.org/
Description: Infinite scroll on article page, URL change when user scrolling, store visitors data.
Author: Krastin Popchovski
Author URI: https://webdevnet.org/
Text Domain: seo-friendly-infinite-scroll
Version: 1.0
*/


class SEOFriendlyInfiniteScroll
{
    public $identifier = 'seo_friendly_infinite_scroll';

    public function __construct()
    {
        add_action('template_redirect', array($this, 'start'));
        add_action('wp_ajax_load_article', array($this, 'loadNextArticle'));
        add_action('wp_ajax_nopriv_load_article', array($this, 'loadNextArticle'));
        add_action('admin_init', array($this, 'adminInit'));
        add_action('admin_menu', array($this, 'adminMenu'));
        add_action('init', array($this, 'loadTextDomain'));
        add_action('wp_head', array($this, 'addGACode'), -1000);
        add_filter(sprintf('plugin_action_links_%s', plugin_basename(__FILE__)), array($this, 'settingsLink'));
    }

    public function start()
    {
        global $post;

        // Load script only on single post pages
        if (!is_single()) {
            return;
        }

        // Enqueue JS and CSS
        wp_enqueue_script(
            $this->identifier,
            plugin_dir_url(__FILE__) . 'js/' . $this->identifier . '.js',
            array('jquery'),
            '1.0',
            true
        );


        $curr_post_id = $post->ID;
        $args = array('post_status' => 'publish', 'posts_per_page' => -1);
        $all_posts = New WP_Query($args);
        $all_posts_arr = array();
        $all_posts_urls_arr = array();


        if ($all_posts->have_posts()) : while ($all_posts->have_posts()) : $all_posts->the_post();

            $all_posts_arr[] = $post->ID;
            $all_posts_urls_arr[] = get_permalink($post);

        endwhile; endif;


        wp_localize_script(
            $this->identifier,
            $this->identifier,
            array(
                'current_post_id' => $curr_post_id,
                'all_posts_arr' => $all_posts_arr,
                'all_posts_urls_arr' => $all_posts_urls_arr,
                'ga_id' => get_option($this->prefix('google_analytics_id')),
                'load_more_str' => __('Load more news', $this->identifier),
                'loading_str' => __('Loading...', $this->identifier),
                'error_str' => __('An error occured. Could not load more posts.', $this->identifier),
                'no_more_str' => __('No more news to load', $this->identifier),
                'content_css_selector' => get_option($this->prefix('content_css_selector'), '#main'),
                'pagination_css_selector' => get_option($this->prefix('pagination_css_selector'), '.page-navigation')
            )
        );




    }

    public function loadNextArticle(){
        global $post, $wp_query;
        $nextID = $_POST['id'];
        $alt_post_query = new WP_query(array('p' => $nextID, 'post_type' => 'post'));
        $wp_query = $alt_post_query;
        $post = $wp_query->post;
        setup_postdata($post);
        get_template_part( 'template-parts/post/content', get_post_format() );
        wp_reset_postdata();
        exit;
    }

    public function addGACode(){
        echo "\n";
        echo "<!-- Global site tag (gtag.js) - Google Analytics -->\n";
        echo "<script async src=\"https://www.googletagmanager.com/gtag/js?id=". get_option($this->prefix('google_analytics_id')) ."\"></script>\n";
        echo "<script>\n";
        echo "window.dataLayer = window.dataLayer || [];\n";
        echo "function gtag(){dataLayer.push(arguments);}\n";
        echo "gtag('js', new Date());\n";
        echo "gtag('config', '". get_option($this->prefix('google_analytics_id')) ."');\n";
        echo "</script>\n\n";
    }



    public function loadTextDomain()
    {
        load_plugin_textdomain($this->identifier, false, dirname(plugin_basename(__FILE__)) . '/lang/');

        // Small hack to make the string visible in PoEdit (I18n)
        __('Load the next page of posts with AJAX.', $this->identifier);
    }

    /**
     * Prefixes a string with an unique identifier
     *
     * @var string $str
     * @return string
     */
    private function prefix($string)
    {
        return $this->identifier . '_' . $string;
    }

    public function adminInit()
    {
        $this->registerSettings();
    }

    public function registerSettings()
    {
        register_setting($this->prefix('settings'), $this->prefix('content_css_selector'));
        register_setting($this->prefix('settings'), $this->prefix('pagination_css_selector'));
        register_setting($this->prefix('settings'), $this->prefix('google_analytics_id'));
    }

    public function adminMenu()
    {
        add_options_page('SEO Friendly Infinite Scroll', 'Infinite Scroll', 'manage_options', $this->identifier, array($this, 'settingsPage'));
    }

    public function settingsPage()
    {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', $this->identifier));
        }

        include dirname(__FILE__) . '/templates/settings.php';
    }

    public function settingsLink($links)
    {
        $link = sprintf('<a href="options-general.php?page=%s">%s</a>', $this->identifier, __('Settings', $this->identifier));
        array_unshift($links, $link);
        return $links;
    }

}

new SEOFriendlyInfiniteScroll();