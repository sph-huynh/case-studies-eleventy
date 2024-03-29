const rssPlugin = require('@11ty/eleventy-plugin-rss');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const fs = require("fs");

// Import filters
const dateFilter = require('./src/filters/date-filter.js');
const markdownFilter = require('./src/filters/markdown-filter.js');
const w3DateFilter = require('./src/filters/w3-date-filter.js');

// Import data files
const site = require('./src/_data/site.json');

module.exports = function(config) {
  // Filters
  config.addFilter('dateFilter', dateFilter);
  config.addFilter('markdownFilter', markdownFilter);
  config.addFilter('w3DateFilter', w3DateFilter);

  // Layout aliases
  config.addLayoutAlias('designSystem', 'layouts/designSystem.njk');
  config.addLayoutAlias('customPage', 'layouts/customPage.njk');
  config.addLayoutAlias('services', 'layouts/services.njk');
  config.addLayoutAlias('casestudies', 'layouts/casestudies.njk');
  config.addLayoutAlias('skills', 'layouts/skills.njk');
  config.addLayoutAlias('mediaList', 'layouts/mediaList.njk');
  config.addLayoutAlias('more', 'layouts/more.njk');
  config.addLayoutAlias('homepage', 'layouts/homepage.njk');

  // Passthrough copy
  config.addPassthroughCopy('src/fonts');
  config.addPassthroughCopy('src/_includes');
  config.addPassthroughCopy('src/images');
  config.addPassthroughCopy('src/uploads');
  config.addPassthroughCopy('src/js');
  config.addPassthroughCopy('src/admin/config.yml');
  config.addPassthroughCopy('src/admin/previews.js');
  config.addPassthroughCopy('node_modules/nunjucks/browser/nunjucks-slim.js');

  const now = new Date();

  // Custom collections - Case Studies Posts
  const livePosts = post => post.date <= now && !post.data.draft;
  config.addCollection('posts', collection => {
    return [
      ...collection.getFilteredByGlob('./src/posts/*.md').filter(livePosts)
    ].reverse();
  });

  config.addCollection('postFeed', collection => {
    return [...collection.getFilteredByGlob('./src/posts/*.md').filter(livePosts)]
      .reverse()
      .slice(0, site.maxPostsPerPage);
  });

  // Custom collections - Media List
  const mediaPosts = post => post.date <= now && !post.data.draft;
  config.addCollection('media', collection => {
    return [
      ...collection.getFilteredByGlob('./src/media/*.md').filter(mediaPosts)
    ].reverse();
  });

  config.addCollection('mediaFeed', collection => {
    return [...collection.getFilteredByGlob('./src/media/*.md').filter(mediaPosts)]
      .reverse()
      .slice(0, site.maxPostsPerPage);
  });

  // Custom collections - Testimonial List
  const testimonialPosts = post => post.date <= now && !post.data.draft;
  config.addCollection('testimonial', collection => {
    return [
      ...collection.getFilteredByGlob('./src/testimonials/*.md').filter(testimonialPosts)
    ].reverse();
  });

  config.addCollection('testimonialFeed', collection => {
    return [...collection.getFilteredByGlob('./src/testimonials/*.md').filter(testimonialPosts)]
      .reverse()
      .slice(0, site.maxPostsPerPage);
  });

  // Custom collections - deliverables List
  const deliverablePosts = post => post.date <= now && !post.data.draft;
  config.addCollection('deliverable', collection => {
    return [
      ...collection.getFilteredByGlob('./src/deliverables/*.md').filter(deliverablePosts)
    ].reverse();
  });

  config.addCollection('deliverableFeed', collection => {
    return [...collection.getFilteredByGlob('./src/deliverables/*.md').filter(deliverablePosts)]
      .reverse()
      .slice(0, site.maxPostsPerPage);
  });

  // Plugins
  config.addPlugin(rssPlugin);
  config.addPlugin(syntaxHighlight);

  // 404 
  config.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, browserSync) {
        const content_404 = fs.readFileSync('dist/404.html');

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.write(content_404);
          res.end();
        });
      }
    }
  });

  return {
    dir: {
      input: 'src',
      output: 'dist'
    },
    passthroughFileCopy: true
  };
};
