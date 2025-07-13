<script setup lang="ts">
import { Feed } from 'feed';
import { siteConfig, getBaseUrl } from '~/site.config';

import { useSlug } from '~/composables/useSlug';

const queryPublishedBlogs = () => {
  const query = queryCollection('blogs');
  if (!import.meta.dev) {
    query.where('published', '=', true);
  }
  return query.select('title', 'description', 'date').order('date', 'DESC').all();
};

const posts = await queryPublishedBlogs();

const feed = new Feed({
  title: siteConfig.title,
  description: siteConfig.description,
  id: getBaseUrl(),
  link: getBaseUrl(),
  language: 'en',
  image: `${getBaseUrl()}/favicon/favicon-32x32.png`,
  favicon: `${getBaseUrl()}/favicon/favicon.ico`,
  copyright: `All rights reserved ${new Date().getFullYear()}, ${siteConfig.author.name}`,
  author: {
    name: siteConfig.author.name,
    email: siteConfig.author.email,
    link: getBaseUrl(),
  },
});

const { generateSlug } = useSlug();

posts.forEach((post) => {
  const slug = generateSlug(post.title || "")
  const url = `${getBaseUrl()}/blogs/${slug}`;
  feed.addItem({
    title: post.title || '',
    id: url,
    link: url,
    description: post.description,
    content: post.description,
    date: new Date(post.date),
  });
});

const feedContent = feed.rss2();

if (import.meta.server) {
  const { res } = useRequestEvent()?.node || {};
  if (res) {
    res.setHeader('content-type', 'text/xml');
    res.end(feedContent);
  }
}
</script>
