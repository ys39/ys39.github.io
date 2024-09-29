// src/app/blog/page.tsx

import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import matter from 'gray-matter';
import { PostData } from '../types/post';

export default function BlogPage() {
  const posts = getPostsData();

  return (
    <div>
      <h1>ブログ一覧</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`}>
              {post.title} ({post.date})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function getPostsData(): PostData[] {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const filenames = fs.readdirSync(postsDirectory);

  const posts = filenames.map((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');

    const { data } = matter(fileContents);

    return {
      slug: filename.replace('.md', ''),
      title: data.title,
      date: data.date,
    };
  });

  return posts;
}
