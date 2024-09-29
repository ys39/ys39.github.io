import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import matter from 'gray-matter';
import { PostData } from '../types/post';
import Breadcrumb from '../../components/breadcrumb';

export default function BlogPage() {
  const posts = getPostsData();
  const breadcrumbItems = [{ name: 'Home', href: '/' }, { name: 'Blog' }];
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-10">
        <Breadcrumb items={breadcrumbItems} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2 text-gray-800">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="text-sm text-gray-600 mb-4">{post.date}</p>
                <p className="text-gray-700">
                  {/* ここに投稿の抜粋を追加することもできます */}
                </p>
                <div className="mt-4">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-blue-500 hover:text-blue-700 font-medium float-end pb-2"
                  >
                    Read More &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
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
