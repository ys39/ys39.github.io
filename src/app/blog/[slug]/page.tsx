import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { PostData } from '../../types/post';
import Breadcrumb from '../../../components/breadcrumb';

interface PostPageProps {
  params: {
    slug: string;
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const postData = await getPostData(params.slug);
  const postDataTitle = postData.title;
  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: postDataTitle },
  ];
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-10">
        <Breadcrumb items={breadcrumbItems} />
        <article className="prose prose-lg">
          <h2>{postDataTitle}</h2>
          <div
            dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }}
          />
        </article>
      </main>
    </div>
  );
}

async function getPostData(slug: string): Promise<PostData> {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const filePath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf8');

  const { data, content } = matter(fileContents);

  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    title: data.title,
    date: data.date,
    contentHtml,
  };
}

export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const filenames = fs.readdirSync(postsDirectory);

  return filenames.map((filename) => ({
    slug: filename.replace('.md', ''),
  }));
}
