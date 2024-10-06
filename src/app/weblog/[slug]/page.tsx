import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import rehypeStringify from 'rehype-stringify'; // rehypeからHTMLに変換
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
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
    { name: 'Weblog', href: '/weblog' },
    { name: postDataTitle },
  ];
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-10">
        <Breadcrumb items={breadcrumbItems} />
        <article className="prose prose-lg max-w-none">
          <h2 className="text-center mb-2">{postDataTitle}</h2>
          <p className="text-center text-gray-600">公開日：{postData.date}</p>
          <hr className="h-px my-8 bg-gray-300 border-0 dark:bg-gray-700" />
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
  const processedContent = await remark() // remark で Markdown を解析して AST(mdast) を生成
    .use(remarkRehype) // AST(mdast) を HTML の AST(hast) に変換
    .use(rehypeHighlight) // AST(hast)に対して Syntax Highlight を適用
    .use(rehypeStringify) // AST(hast) を HTML に変換
    .process(content);
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
