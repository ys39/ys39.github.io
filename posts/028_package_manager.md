---
title: 'Package Manager 比較'
date: '2024-10-31'
tags: ['npm', 'yarn', 'pnpm']
---

### はじめに
* OSの設定やアプリケーションの環境構築などにPackage Managerを利用することがある。OSの場合だと、macOS -> homebrew, Debian -> apt/snapが有名である。また、アプリケーションの場合だと、JavaScript -> npm, Rust -> Cargo, PHP -> Composerなどがあり、依存関係の解消やアップデートを日々行う上で、非常に重要なツールである。
* JavaScript, TypeScriptを扱う上で、npmは馴染み深く、個人的によく利用していたが、JavaScriptのPackage Managerとして、yarn, pnpmなどもあり、そちらは正直に言ってあまり利用したことがなく、その差異がわかっていない。そこで、今回はその差異を調査して、簡単にまとめてみる。

### JavaScript の Package Manager
`npm`, `yarn`, `pnpm`がある。

1. `npm`
    * Node.jsの標準のPackage Manager
    * プロジェクトの依存関係のインストール、更新、ダウンロードを管理する。 依存関係とは、Node.js アプリケーションを動作させるために必要な、ライブラリやパッケージなどのこと。
    * `package.json` に記述された依存関係をインストールする。
    * インストールされたパッケージは、`node_modules` ディレクトリに保存される。

2. `yarn`
    * npmの代替として開発されたパッケージマネージャ
    * v1をclassicと呼び、v2をberryと呼ぶ。
    * Facebookでは何年もnpmクライアントをうまく使ってきたが、コードベースのサイズとエンジニアの数が増えるにつれ、一貫性、セキュリティ、パフォーマンスの問題に直面した。 問題が発生するたびに解決しようとした後、依存関係をより確実に管理するための新しいソリューションの構築に着手した。 その成果物が`Yarn`と呼ばれるもので、**高速で信頼性が高く、安全な代替npmクライアント**である。
    * 調べる感じ、`npm`よりも高速に動作するため、大規模なプロジェクトで効果を発揮する。

3. `pnpm`
    * `npm`の代替として開発されたパッケージマネージャ
    * `npm`を使う場合、ある依存関係を使うプロジェクトが100個あれば、その依存関係のコピーが100個ディスクに保存されることになるが、`pnpm`を使うと、依存関係はコンテンツアドレス可能なストアに保存されるので、容量の節約ができる。
    ![pnpm1](../posts/pnpm1.svg)
    * インストールのプロセスがパッケージ毎に行われるため、高速に動作する。
    ![pnpm2](../posts/pnpm2.svg)

### まとめ
* 大体、JavaScriptのPackage Managerの違いについて、その誕生の背景や特徴について学ぶことができた。また、利用するうえでは、基本的に`npm`で問題はないが、大規模プロジェクトやスピードやメモリを意識しないといけない場合などに、`yarn`や`pnpm`を利用することで、効果を発揮することができる。ただし、それは確実に保証するものでもなく、`npm`も日に日に改善されているため、その辺りも考慮して利用することが重要である。
* JavaScriptのPackage Managerについては洗い出すことができたので、次は、JavaScriptのランタイムについて、`Node.js`意外に`Deno`や`Bun`といったものがあるので、そちらも調査してみる。

### 参考
* https://zenn.dev/bizlink/articles/14a65815472bcd
* [An introduction to the npm package manager](https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager)
* [Yarn Reference](https://classic.yarnpkg.com/en/)
* [Yarn: A new package manager for JavaScript](https://engineering.fb.com/2016/10/11/web/yarn-a-new-package-manager-for-javascript/)
* https://zenn.dev/nakasyou/articles/you_dont_need_node
