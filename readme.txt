=== FlickrTips ===
Contributors: chrissam42
Tags: flickr, image, images, photo, photos, ajax, link, links
Requires at least: 1.5
Tested up to: 2.6
Stable tag: 1.5

Displays popup photo thumbnails on mouseover of links to images and Flickr photo pages.

== Description ==

FlickrTips is a simple AJAX enhancement to hyperlinks within a Wordpress blog.
When the user mouses over a link to an image or a Flickr photo page or photoset,
a small floating panel will appear near the mouse cursor with a thumbnail of the image.
A grid of thumbnails is shown for photosets and tag links.
The panel disappears when the mouse leaves the link.

This behaviour is disabled for links that contain images, since it would probably be redundant.

Verified browser support: (others may work too; untested)

* Windows IE 6+
* Firefox 1+
* Safari 2+ (v2 Flickr links only)
* Opera 8+
* OmniWeb 5+ (v5.1 Flickr links only)

== Installation ==

1. unpack and upload `flickrtips` directory into the `/wp-content/plugins/` directory.
1. Activate the plugin through the 'Plugins' menu in WordPress

That's all there is to it!  No modifications to most WordPress templates are needed.

== Frequently Asked Questions ==

= How can I tell if it's working? =

If FlickrTips is working, links to Flickr photo pages will be underlined in a
characteristic "pink dotted underline" to suggest the Flickrness of the links.
Regular image links will get a more subdued blue dotted underline.  When you 
place your mouse cursor over one of these links, a thumbnail of the image should
appear next to the mouse cursor.

= My photo links don't show the dotted-underline. =

FlickrTips depends on the "wp_head" and "wp_footer" actions which are called by most
WordPress themes.  Make sure that those two actions are being called in your theme's 
header.php and footer.php.

= I see the dotted underlines, but nothing happens when I mouse over the links. =

It's probably a browser-related Javascript issue.  Please email chrissam42@gmail.com
and let me know what browser and operating system you're using.

= What about Collections? =

Collections aren't yet implemented in the Flickr API.  Should be soon!

== Screenshots ==

1. Individual photo link
2. Photoset link

