---
title: 'Weblogへタグ機能を追加'
date: '2024-10-27'
tags: ['Portfolio', 'Weblog']
---

### はじめに

- 一般的に閲覧するブログにはタグ機能というものがあり、タグによりブログが分類されている。ブログ数が増えてくると、後々見直すためにもタグ機能はあった方が良いと考え、本Weblogにもタグ機能を追加することにした。

### 変更ファイル
* 変更前
    ```bash
    /weblog # ブログ一覧
    /weblog/[slug] # ブログページ
    /tech-bookmarks # 気になっている技術
    ```
↓
* 変更後
    ```bash
    /weblog # ブログ一覧 # 変更なし
    /weblog/[slug] # ブログページ # →タグのリンクを上部に追加。
    /weblog/tag # タグ一覧 # 新規追加
    /weblog/tag/[tag] # タグ別ブログ一覧 # 新規追加
    /tech-bookmarks # 気になっている技術 # 変更なし
    ```

### 各mdファイルにタグを追加
* 各mdファイルの上部にタグを記載する。
    ```bash
    ---
    title: 'Weblogへタグ機能を追加'
    date: '2024-10-27'
    tags: ['Portfolio', 'Weblog']
    ---
    ```

### `/weblog/[slug]`の変更
* 公開日の下にタグのリンクを追加
    ```tsx
    {postData.tags && postData.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
            {postData.tags.map((tag, index) => (
                <Link
                    key={index}
                    href={`/weblog/tag/${tag}`}
                >
                    <span
                        key={index}
                        className="text-gray-800 text-sm border border-purple-800 font-mono font-bold me-2 px-2.5 py-2 rounded-full dark:bg-purple-900 dark:text-purple-300 hover:bg-purple-800 hover:text-white cursor-pointer"
                    >
                        #{tag}
                    </span>
                </Link>
            ))}
        </div>
    )}
    ```
* mdファイルからデータを取得する際に`tags`も取得するように変更
    ```tsx
    tags: data.tags ?? [],
    ```

### `/weblog/tag`の変更
* タグ一覧ページを作成するために、タグ一覧を取得する関数を作成
    ```tsx
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
    ```

### `/weblog/tag/[tag]`の変更
* タグ一覧を取得する動作と、タグとWeblogの紐づき情報を取得する必要があったため、下記のように`fetchPostData`を定義して、それを`generateStaticParams()`と`PostPage`で呼び出している。
    ```tsx
    async function fetchPostData(): Promise<{ tagRelatedList: TagRelatedData; tags: string[] }> {
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
                });
            }
        });
        return { tagRelatedList, tags: Array.from(tags) };
    }
    ```

### まとめ

### 参考
- [https://penguinchord.com/blog/web-programming/nextjs-tagged-posts-howto](https://penguinchord.com/blog/web-programming/nextjs-tagged-posts-howto)
