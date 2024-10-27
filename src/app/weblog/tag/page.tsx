import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import matter from 'gray-matter';
import Breadcrumb from '../../../components/breadcrumb';

export default function WeblogPage() {
  const tags = getTagsData();
  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Weblog', href: '/weblog' },
    { name: 'Tags' },
  ];
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-10">
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="text-4xl text-center font-bold mb-4 dark:text-gray-700">
          Tags
        </h1>
        <div className="text-center text-gray-600 mb-6">
          Categorize Weblogs by Tags
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from(tags).map((tag) => (
            <div key={tag}>
              <div className="">
                <h2 className="bg-white text-center text-gray-800 text-sm border border-purple-800 font-mono font-bold me-2 px-2.5 py-2 rounded-full dark:text-gray-800 hover:bg-purple-800 hover:text-white cursor-pointer">
                  <Link href={`/weblog/tag/${tag}`}>#{tag}</Link>
                </h2>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function getTagsData(): Set<string> {
  // posts以下のmdファイルをすべて取得
  const postsDirectory = path.join(process.cwd(), 'posts');
  const filenames = fs.readdirSync(postsDirectory);
  // 各mdファイルのtagsを取得
  const tags = new Set<string>();
  filenames.forEach((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);
    if (!data.tags) {
      return;
    }
    data.tags.forEach((tag: string) => tags.add(tag));
  });
  return tags;
}
