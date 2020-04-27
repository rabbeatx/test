(function($){

    var current_post_id = parseInt(seo_friendly_infinite_scroll.current_post_id),
        all_posts = seo_friendly_infinite_scroll.all_posts_arr,
        all_posts_urls = seo_friendly_infinite_scroll.all_posts_urls_arr,
        $content = $(seo_friendly_infinite_scroll.content_css_selector), // The content Element posts are inserted to
        $pagination = $(seo_friendly_infinite_scroll.pagination_css_selector); // The wordpress default pagination

    console.log(current_post_id);
    console.log(all_posts);
    console.log(all_posts_urls);

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
            if (isElementInViewport2(el)) {
                // update the URL hash
                var viewableArticleID = parseInt($(el).attr('id').replace("post-", ""));
                console.log(viewableArticleID);
                var currentViewableIdx = all_posts.indexOf(viewableArticleID);
                console.log(currentViewableIdx);
                if (window.history.pushState) {
                    //var urlHash = $(el).find('.posted-on').children().attr('href');
                    var urlHash = all_posts_urls[currentViewableIdx];
                    window.history.pushState(null, null, urlHash);
                }
            }
        });

    });

    function loadArticle(nextID) {
        //console.log('load article:' + nextID );
        // Are there more posts to load?
        if(nextID < all_posts.length) {

            // Show that we're working.
            //$(this).text(seo_friendly_infinite_scroll.loading_str);

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

    function isElementInViewport (el) {
        //special bonus for those using jQuery
        if (typeof jQuery === "function" && el instanceof jQuery) {
            el = el[0];
        }
        var rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
        );
    }

    function isElementInViewport2(el) {
        var top = el.offsetTop;
        var left = el.offsetLeft;
        var width = el.offsetWidth;
        var height = el.offsetHeight;

        while(el.offsetParent) {
            el = el.offsetParent;
            top += el.offsetTop;
            left += el.offsetLeft;
        }

        return (
            top < (window.pageYOffset + window.innerHeight) &&
            left < (window.pageXOffset + window.innerWidth) &&
            (top + height) > window.pageYOffset &&
            (left + width) > window.pageXOffset
        );
    }


})(jQuery);