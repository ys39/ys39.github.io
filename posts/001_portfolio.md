---
title: "ポートフォリオを作成"
date: "2024-09-30"
---

### はじめに

* これまでに自身のスキルマップページがまとまっていなかったため、自身のポートフォリオページを作成しました。これからはこのページを更新していく予定です。
* また、ブログページも設けたため、今後は技術的なことや日々の出来事を記録していきます。

### ポートフォリオページについて

* ポートフォリオページはGithub PagesとGithub Actionsを使って作成しています。
* Next.jsを使って静的サイトを作成し、Github ActionsでビルドしてGithub Pagesで公開しています。

### ブログページについて
* ブログページはmdファイルをHTMLに変換して表示しています。

### 構築手順
1. Githubリポジトリ `ys39.github.io` を作成
2. Githubページ上でGithub Actionsの設定
    1. Settings -> Pages -> Source にGithub Actionsを選択
    2. Settings -> Pages -> Custom domain に独自ドメイン(itsme.senriy.dev)を設定
3. ローカルでNext.jsのプロジェクトを作成
    ```bash
    npx create-next-app@latest my-portfolio
    ```
4. 必要なパッケージを追加
    ```bash
    npm install @svgr/webpack remark remark-html gray-matter @tailwindcss/typography
    ```
    * `@svgr/webpack` : SVGファイルをReactコンポーネントに変換
    * `remark`, `remark-html` : MarkdownをHTMLに変換
    * `gray-matter` : Markdownのフロントマターをパース
    * `@tailwindcss/typography` : Tailwind CSSでテキストスタイルを適用
5. Github Actionsの設定
    * `.github/workflows/nextjs.yml` を作成
    ```yml
    # Sample workflow for building and deploying a Next.js site to GitHub Pages
    #
    # To get started with Next.js see: https://nextjs.org/docs/getting-started
    #
    name: Deploy Next.js site to Pages

    on:
      # Runs on pushes targeting the default branch
      push:
        branches: ['main']

      # Allows you to run this workflow manually from the Actions tab
      workflow_dispatch:

    # Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
    permissions:
      contents: read
      pages: write
      id-token: write

    # Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
    # However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
    concurrency:
      group: 'pages'
      cancel-in-progress: false

    jobs:
      # Build job
      build:
        runs-on: ubuntu-latest
        steps:
          - name: Checkout
            uses: actions/checkout@v4
          - name: Detect package manager
            id: detect-package-manager
            run: |
              if [ -f "${{ github.workspace }}/yarn.lock" ]; then
                echo "manager=yarn" >> $GITHUB_OUTPUT
                echo "command=install" >> $GITHUB_OUTPUT
                echo "runner=yarn" >> $GITHUB_OUTPUT
                exit 0
              elif [ -f "${{ github.workspace }}/package.json" ]; then
                echo "manager=npm" >> $GITHUB_OUTPUT
                echo "command=ci" >> $GITHUB_OUTPUT
                echo "runner=npx --no-install" >> $GITHUB_OUTPUT
                exit 0
              else
                echo "Unable to determine package manager"
                exit 1
              fi
          - name: Setup Node
            uses: actions/setup-node@v4
            with:
              node-version: '20'
              cache: ${{ steps.detect-package-manager.outputs.manager }}
          - name: Setup Pages
            uses: actions/configure-pages@v5
            with:
              # Automatically inject basePath in your Next.js configuration file and disable
              # server side image optimization (https://nextjs.org/docs/api-reference/next/image#unoptimized).
              #
              # You may remove this line if you want to manage the configuration yourself.
              static_site_generator: next
              generator_config_file: next.config.mjs
          - name: Restore cache
            uses: actions/cache@v4
            with:
              path: |
                .next/cache
              # Generate a new cache whenever packages or source files change.
              key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json', '**/yarn.lock') }}-${{ hashFiles('**.[jt]s', '**.[jt]sx') }}
              # If source files changed but packages didn't, rebuild from a prior cache.
              restore-keys: |
                ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json', '**/yarn.lock') }}-
          - name: Install dependencies
            run: ${{ steps.detect-package-manager.outputs.manager }} ${{ steps.detect-package-manager.outputs.command }}
          - name: Build with Next.js
            run: ${{ steps.detect-package-manager.outputs.runner }} next build
          - name: Upload artifact
            uses: actions/upload-pages-artifact@v3
            with:
              path: ./out

      # Deployment job
      deploy:
        environment:
          name: github-pages
          url: ${{ steps.deployment.outputs.page_url }}
        runs-on: ubuntu-latest
        needs: build
        steps:
          - name: Deploy to GitHub Pages
            id: deployment
            uses: actions/deploy-pages@v4
    ```
6. Githubのリポジトリ設定
7. ポートフォリオページとブログページを作成
    * ソースコードはGithubを参照
8. 最終的なディレクトリ構成
    ```
    ├── README.md
    ├── next-env.d.ts
    ├── next.config.mjs
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.mjs
    ├── posts
    │   └── 001_portfolio.md // ブログ記事
    ├── prettier.config.mjs
    ├── src  // ソースコード
    │   ├── app
    │   │   ├── blog
    │   │   │   ├── [slug]
    │   │   │   │   └── page.tsx // ブログ記事のページ
    │   │   │   └── page.tsx // ブログ一覧ページ
    │   │   ├── favicon.ico
    │   │   ├── fonts
    │   │   │   ├── GeistMonoVF.woff
    │   │   │   └── GeistVF.woff
    │   │   ├── github-mark.svg // Githubアイコン
    │   │   ├── globals.css // グローバルCSS
    │   │   ├── layout.tsx // レイアウト
    │   │   ├── logo-only.svg // Zennロゴ
    │   │   ├── me.webp // プロフィール画像
    │   │   ├── page.tsx // ポートフォリオページ
    │   │   └── types
    │   │       └── post.ts // ブログ記事の型
    │   └── components // コンポーネント
    │       └── breadcrumb.tsx // パンくずリスト
    ├── tailwind.config.ts
    ├── node_modules
    └── tsconfig.json
    ```
9. デプロイ
    ```bash
    git add -A
    git commit -m "Commit message"
    git push origin main
    ```
    * Github Actionsでビルドが成功するとGithub Pagesに公開される
    * https://itsme.senriy.dev にアクセスするとポートフォリオページが表示される

### まとめ
* Next.jsを使ってポートフォリオページを作成しました。Github Pagesで公開し、Github Actionsで自動ビルドするように設定しました。
* 画像の投稿がまだできていないので、今後は画像の投稿機能を追加していきたいと思います。
