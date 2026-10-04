/* global hexo */
'use strict';

// Post URLs use `permalink: :year/:month/:day/:title/`. Hexo fills in the
// year/month/day using the timezone of the Node process, not the `timezone`
// setting in _config.yml. Building on a machine (or CI runner) in another
// timezone could then move a post to a different day and break its old URL.
// For example, under UTC the 2022-06-08 22:41 post would end up at /2022/06/09/.
// Hexo loads everything in scripts/ before reading posts, so setting TZ here
// makes every build use the configured timezone (America/Denver).
if (hexo.config.timezone) {
  process.env.TZ = hexo.config.timezone;
}
