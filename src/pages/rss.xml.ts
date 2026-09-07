import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: any) {
  // Newest first. getCollection() returns filesystem order, which is not
  // chronological -- feed readers rely on this ordering, so sort explicitly
  // (matching blog/index.astro and RecentWriting.astro).
  const blog = (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  return rss({
    title: 'Mayank Raj Jaiswal | Enterprise Security Insights',
    description: 'Deep technical articles and research on Enterprise Security, Identity & Access Management (IAM), and Artificial Intelligence for Cybersecurity.',
    site: context.site,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
