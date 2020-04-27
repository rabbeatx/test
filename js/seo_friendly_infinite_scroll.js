(function($){

    var current_post_id = parseInt(seo_friendly_infinite_scroll.current_post_id),
        all_posts = seo_friendly_infinite_scroll.all_posts_arr,
        all_posts_urls = seo_friendly_infinite_scroll.all_posts_urls_arr,
        ga_id = seo_friendly_infinite_scroll.ga_id,
        $content = $(seo_friendly_infinite_scroll.content_css_selector), // The content Element posts are inserted to
        $pagination = $(seo_friendly_infinite_scroll.pagination_css_selector); // The wordpress default pagination

    var currID = all_posts.indexOf(current_post_id);
    var nextID = currID + 1;

    if(nextID < all_posts.length) {
        // Remove the traditional navigation.
        $pagination.remove();
    }

    $(window).scroll(function() {
        if ($(window).scrollTop() == $(document).height() - $(window).height()) {
            if (nextID > all_posts.length) {
                return false;
            } else {
                loadArticle(nextID);
            }
            nextID++;
        }


        $("article").each(function (idx, el) {
            if (isElementInViewport(el)) {
                // update the URL hash
                var viewableArticleID = parseInt($(el).attr('id').replace("post-", ""));
                console.log(viewableArticleID);
                var currentViewableIdx = all_posts.indexOf(viewableArticleID);
                console.log(currentViewableIdx);
                if (window.history.pushState) {
                    var urlHash = all_posts_urls[currentViewableIdx];
                    var urlPath = new URL(urlHash);
                    window.history.pushState(null, null, urlHash);
                    gtag('config', ga_id, {'page_path': urlPath.pathname});
                }
            }
        });

    });

    function loadArticle(nextID) {

        // Are there more posts to load?
        if(nextID < all_posts.length) {

            // Load more posts
            $.ajax({
                type: 'POST',
                url: "/wp-admin/admin-ajax.php",
                data: "action=load_article&id=" + all_posts[nextID],
            }).done(function (data) {

                $content.append(data);

            }).fail(function () {

                $content.append(seo_friendly_infinite_scroll.error_str);

            });

        }

        return false;
    }

    function isElementInViewport(el){

        return (
            $(el).offset().top < window.pageYOffset + $(window).height()/2 &&
            $(el).offset().top + $(el).height() > window.pageYOffset + $(window).height()/2
        )

    }

})(jQuery);