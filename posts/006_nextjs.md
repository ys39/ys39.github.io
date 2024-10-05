---
title: 'Next.jsの整理'
date: '2024-10-05'
---

### はじめに

- Next.jsは本ブログ(Github Pages)で利用しているが、機能や設定などについて知らないことが多いため、まとめておく。
- App Routerのまとめ？になるかもしれない。

### 事前に決められたディレクトリ

- トップレベルに配置されるディレクトリ

  - `app`ディレクトリ
    - Next.js 13で導入された新しいルーティングと構成のためのディレクトリ
  - `src`ディレクトリ
    - appディレクトリやpagesディレクトリをプロジェクトのルートに置く代わりに、srcディレクトリの下にアプリケーションコードを置くこともできる
  - `public`ディレクトリ
    - 静的ファイルを配置するディレクトリ
    - 画像やフォントなどの静的ファイルを配置する
    - このディレクトリ内のファイルはベースURLから直接アクセス可能(例: /logo.svg)

- Dynamic Routes

  - `[folder]`ディレクトリ
    - URLのこの部分が動的なパラメータとして扱われる。例えば、[id]は/posts/1や/posts/abcなど、さまざまな値にマッチする

- Private Folder

  - `_folder`ディレクトリ
  - フォルダ名の先頭にアンダースコアを付けると、そのフォルダと子孫の全てのセグメントがルーティングから除外される

- Route Groups

  - `(site)`ディレクトリ
    - フォルダ名を括弧で囲むことで、ルーティングには影響を与えずにルートをグループ化できる。Route GroupにLayoutファイルも含めることができる

- Parallel Routes
  - `@folder`ディレクトリ
    - Slotと呼ばれるものを使用して作成する。
    - 同じURLパスで複数の異なるUIセグメントを並行してレンダリングすることができる

### 事前に決められたファイル

- トップレベルに配置されるファイル

  - `next.config.mjs`
    - Next.jsの設定ファイル
  - `package.json`
    - プロジェクトの依存関係とスクリプトを定義するファイル。npmやyarnを使用してパッケージ管理やビルド、テストを行う際に使用。
  - `instrumentation.ts`
    - OpenTelemetryを用いた計測やトレースの設定を行うファイル。アプリケーションのパフォーマンスモニタリングに利用。
  - `middleware.ts`
    - Next.jsのミドルウェア機能を実装するファイル。リクエスト処理の前にカスタムロジックを挿入するために使用。
  - `.env`
    - 環境変数を定義するファイルで、デフォルトの環境設定を行う。アプリケーション内で共通して使用する変数をここに記述。
  - `.env.local`
    - ローカル開発環境専用の環境変数を定義
  - `.env.production`
    - 本番環境で使用する環境変数を定義
  - `.env.development`
    - 開発環境で使用する環境変数を定義
  - `.eslintrc.json`
    - ESLintの設定ファイルで、コード品質やスタイルのルールを定義。チーム内でのコードの一貫性を保つために使用。
  - `.gitignore`
    - Gitで追跡しないファイルやフォルダを指定するファイル。ビルド成果物や機密情報をバージョン管理から除外する。
  - `next-env.d.ts`
    - Next.jsが自動生成するTypeScriptの型定義ファイル。TypeScriptプロジェクトで必要な型情報を提供する。
  - `tsconfig.json`
    - TypeScriptのコンパイラオプションを設定するファイル。TypeScriptの動作やビルド設定をカスタマイズする。
  - `tailwind.config.ts`
    - Tailwind CSSの設定ファイル。テーマカラーやフォントサイズなどのスタイル設定を行う。
  - `postcss.config.mjs`
    - PostCSSは、CSSを変換・最適化するためのツールであり、Tailwind CSSを利用する場合にプラグインとして拡張するための設定ファイル。

- `app/`以下に配置されるファイル

  - `page.tsx`
    - Pageファイル
    - 特定のSegmentに対応するPageファイルを配置することで、特定の画面を提供することができる
    - 例: app/hoge/page.tsx -> /hoge にアクセスした際に表示される画面
  - `layout.tsx`
    - 複数の画面間で共有されるUIを実装するためのファイル
  - `loading.tsx`
    - ページの読み込み中に表示されるローディング画面を実装するためのファイル
  - `not-found.tsx`
    - 404エラー画面を実装するためのファイル
  - `error.tsx`
    - 特定のルート内でエラーが発生した場合に表示されるエラーハンドリングUIを定義するファイル
  - `global-error.tsx`
    - アプリ全体でキャッチされないエラーを処理するためのグローバルなエラーハンドリングUIを定義するファイル
  - `route.ts`
    - ルーティングの設定を行うファイル。app/api/example/route.jsのように配置し、RESTfulなAPIエンドポイントを作成することができる
  - `template.tsx`
    - 動的なデータやパラメータに応じて再レンダリングされるレイアウトを定義するファイル。layoutと似ているが、templateは各レンダリングで新しいインスタンスが作成される
  - `default.tsx`
    - パラレルルート（並列ルーティング）のフォールバックページを定義するファイル

### Components

- Form

  ```tsx
  import Form from 'next/form';

  export default function Page() {
    return (
      <Form action="/search">
        {/* On submission, the input value will be appended to 
            the URL, e.g. /search?query=abc */}
        <input name="query" />
        <button type="submit">Submit</button>
      </Form>
    );
  }
  ```

- Image

  ```tsx
  import Image from 'next/image';

  export default function Page() {
    return (
      <Image
        src="/profile.png"
        width={500}
        height={500}
        alt="Picture of the author"
      />
    );
  }
  ```

- Link

  ```tsx
  import Link from 'next/link';

  export default function Page() {
    return <Link href="/dashboard">Dashboard</Link>;
  }
  ```

- Script

  ```tsx
  import Script from 'next/script';

  export default function Dashboard() {
    return (
      <>
        <Script src="https://example.com/script.js" />
      </>
    );
  }
  ```

### 参考

- [Project Structure](https://nextjs.org/docs/getting-started/project-structure)
