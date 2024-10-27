import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import matter from 'gray-matter';
import { TagRelatedData } from '../../../types/post';
import Breadcrumb from '../../../../components/breadcrumb';

interface TagPageProps {
  params: {
    tag: string;
  };
}

export default async function PostPage({ params }: TagPageProps) {
  const { tagRelatedList } = await fetchPostData();
  const tag = decodeURIComponent(params.tag); // デコードを1箇所でまとめる
  const posts = tagRelatedList[tag] || []; // 安全にデータを取得

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Weblog', href: '/weblog' },
    { name: 'Tags', href: '/weblog/tag' },
    { name: '#' + tag },
  ];
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-10">
        <Breadcrumb items={breadcrumbItems} />
        <div className="mb-8 text-center">
          <span className="text-gray-800 text-xl border border-purple-800 font-mono font-bold me-2 px-4 py-2 rounded-full dark:text-gray-800 hover:bg-purple-800 hover:text-white cursor-pointer">
            #{tag}
          </span>
        </div>
        <hr className="h-px my-6 bg-gray-300 border-0 dark:bg-gray-700" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  <Link href={`/weblog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="text-sm text-gray-600 mb-4">{post.date}</p>
                <div className="mt-4">
                  <Link
                    href={`/weblog/${post.slug}`}
                    className="text-blue-700 hover:text-blue-700 font-medium float-end pb-2"
                  >
                    &gt;&gt; Read More
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

async function fetchPostData(): Promise<{
  tagRelatedList: TagRelatedData;
  tags: string[];
}> {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const filenames = fs.readdirSync(postsDirectory);

  const tagRelatedList: TagRelatedData = {};
  const tags = new Set<string>();

  filenames.forEach((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);
    if (data.tags) {
      data.tags.forEach((tag: string) => {
        tags.add(tag);
        if (!tagRelatedList[tag]) {
          tagRelatedList[tag] = [];
        }
        tagRelatedList[tag].push({
          slug: filename.replace('.md', ''),
          title: data.title,
          date: data.date,
        });
        // dateの降順で並び替え
        tagRelatedList[tag].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });
    }
  });
  return { tagRelatedList, tags: Array.from(tags) };
}

export async function generateStaticParams() {
  const { tags } = await fetchPostData();
  return tags.map((tag) => ({
    tag: encodeURIComponent(tag),
  }));
}
