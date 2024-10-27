---
title: 'RustをWasmで動かす'
date: '2024-10-22'
tags: ['Rust','Wasm']
---

### はじめに

- Rustは、システムプログラミング言語として知られているが、WebAssembly（Wasm）との親和性が高い言語でもある。今回は、RustをWasmで動かす方法についてまとめる。

### WebAssembly（Wasm）とは

- 他の言語をコンパイルするターゲットとなるバイナリフォーマット
- Wasmにコンパイルすれば、ブラウザで実行できるようになる
- 実行速度はJavaScriptよりも高速であり、画像処理などの計算負荷の高い部分をWasmで実行することで、全体パフォーマンスを向上させることができる。

### Rustのインストール

- インストールする環境 : WSL2 Ubuntu 22.04.4 LTS
- [Install Rust](https://www.rust-lang.org/tools/install) に従ってインストール

1. Install Rust

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

   # 1) Proceed with standard installation (default - just press enter)
   # 2) Customize installation
   # 3) Cancel installation
   >1

   # info: profile set to 'default'
   # info: default host triple is x86_64-unknown-linux-gnu
   # info: syncing channel updates for 'stable-x86_64-unknown-linux-gnu'
   # info: latest update on 2024-10-17, rust version 1.82.0 (f6e511eec 2024-10-15)
   # info: downloading component 'cargo'
   # info: downloading component 'clippy'
   # info: downloading component 'rust-docs'
   # info: downloading component 'rust-std'
   # info: downloading component 'rustc'
   # info: downloading component 'rustfmt'
   # info: installing component 'cargo'
   # info: installing component 'clippy'
   # info: installing component 'rust-docs'
   # info: installing component 'rust-std'
   # info: installing component 'rustc'
   # info: installing component 'rustfmt'
   # info: default toolchain set to 'stable-x86_64-unknown-linux-gnu'
   # stable-x86_64-unknown-linux-gnu installed - rustc 1.82.0 (f6e511eec 2024-10-15)
   ```

2. パスの確認

   - `~/.bashrc`に`. "$HOME/.cargo/env"`が追加されているので、パスが通るようになる

3. インストール確認

   ```bash
   rustc --version
   # rustc 1.82.0 (f6e511eec 2024-10-15)

   cargo --version
   # cargo 1.82.0 (8f40fc59f 2024-08-21)

   rustup --version
   # rustup 1.27.1 (54dd3d00f 2024-04-24)
   # info: This is the version for the rustup toolchain manager, not the rustc compiler.
   # info: The currently active `rustc` version is `rustc 1.82.0 (f6e511eec 2024-10-15)`
   ```

### Rustツールの確認

- Rustツールの確認

  - `rustc` .. Rustのコンパイラで、ソースコードを実行可能なバイナリに変換する役割。
  - `cargo` .. プロジェクトの作成や管理、依存関係の解決、ビルド・実行・テストを行うツール。
  - `rustup` .. Rustのツールチェイン（コンパイラや関連ツール）のインストールやバージョン管理を行う。

- `rustc`

  ```bash
  rustc main.rs # main.rsをコンパイル
  rustc main.rs -o プログラム名 # プログラム名を指定してコンパイル
  rustc --help # ヘルプ
  ```

- `cargo`

  ```bash
  # プロジェクトの作成
  cargo new プロジェクト名 # プロジェクトを作成
  cargo new プロジェクト名 --lib # ライブラリプロジェクトを作成

  # ビルド
  cargo build # デバッグビルド
  cargo build --release # releaseビルド

  # 実行
  cargo run # デバッグビルドで実行
  cargo run --release # releaseビルドで実行

  # その他
  cargo test # テスト
  cargo doc # ドキュメント生成
  cargo update # 依存関係のアップデート
  cargo clean # ビルド結果のクリーンアップ
  cargo check # コンパイルのチェック
  cargo publish # Crates.ioにパッケージを公開

  # インストール
  cargo install クレート名 # バイナリクレートをインストール
  ```

- `rustup`

  ```bash
  # update
  rustup update # ツールチェインのアップデート
  rustup self update # rustup自体のアップデート

  # toolchain
  rustup default stable # デフォルトのツールチェインを指定
  rustup toolchain list # インストール済みのツールチェインを確認
  rustup show # デフォルトツールチェインやインストール済みコンポーネントを確認

  # component
  rustup component add rustfmt # コンポーネントの追加
  rustup component list --installed
  ```

### RustをWasmで動かす

1. wasm-packのインストール

   - wasm-packは、RustコードをWebAssemblyにコンパイルし、JavaScriptと連携するためのバインディングを生成するツール

   ```bash
   cargo install wasm-pack
   # $HOME/.cargo/bin/ にインストールされる
   ```

2. プロジェクトの作成

   ```bash
   cargo new --lib rust-wasm-practice
   ```

3. `src/lib.rs`にサンプルコードを記述

   ```rust
   use wasm_bindgen::prelude::*;

   #[wasm_bindgen] // 直後のアイテム（関数や構造体など）をJavaScriptに公開するために使用する。
   extern { // JavaScriptで定義された関数を宣言
       pub fn alert(s: &str); // JavaScriptのalert関数をRust側で使用できるように宣言
   }

   #[wasm_bindgen]
   pub fn greet(name: &str) {
       alert(&format!("Hello, {}!", name));
   }
   ```

4. `Cargo.toml`に設定

   ```toml
   [package]
   name = "rust-wasm-practice"
   version = "0.1.0"
   description = "A sample project with wasm-pack"
   edition = "2021"

   [lib]
   crate-type = ["cdylib", "rlib"]

   [dependencies]
   wasm-bindgen = "0.2"
   ```

5. パッケージのビルド

   ```bash
   wasm-pack build --target web
   ```

   - ビルドを行い、`pkg`ディレクトリを作成し、生成されたファイルを配置する。
   - ここには`package.json`ファイルを生成するため、npmパッケージとして扱うことができる。
   - `--target web`を指定することで、ターゲットをウェブブラウザ向けに設定し、適切なモジュール形式（ES6モジュール）でJavaScriptコードを生成する。

6. `index.html`の準備

   ```html
   <!doctype html>
   <html lang="en-US">
     <head>
       <meta charset="utf-8" />
       <title>hello-wasm example</title>
     </head>
     <body>
       <script type="module">
         import init, { greet } from './pkg/rust_wasm_practice.js';
         init().then(() => {
           greet('WebAssembly');
         });
       </script>
     </body>
   </html>
   ```

7. httpサーバの起動

   ```bash
   docker run --rm -p 8000:8000 \
   -v "$(pwd)":/usr/src/app \
   -w /usr/src/app python:3 python -m http.server 8000
   ```

   - `http://localhost:8000`にアクセスすると、`Hello, WebAssembly!`と表示されることを確認

### RustをWasmで動かす(npm)

- 上記の方法でも動作させることができるが、npmを利用すれば、より簡単にデバッグやビルドを行うことができる。
- [rust-webpack](https://github.com/rustwasm/rust-webpack-template)のテンプレートで最初試したが、途中でコンパイルエラーが発生し、一筋縄でお試しできなかったため、一旦放置。（このプロジェクト自体の更新が5年前なので、あまり利用しないほうが良いかもしれない）

* [https://zenn.dev/yurioka/articles/3649c5190e33bc](https://zenn.dev/yurioka/articles/3649c5190e33bc) こちらの記事で`vite`と`wasm-pack`を使ってWasmを動かす方法を試したところ、問題なく動作した

1. プロジェクトの作成

   ```bash
   mkdir rust-wasm-canvas && cd rust-wasm-canvas
   npm init
   npm add -D vite wasm-pack
   cargo new --lib src/wasm
   vim package.json
   ```

   ```json
   {
     "name": "rust-wasm-canvas",
     "version": "1.0.0",
     "main": "index.js",
     "scripts": {
       "dev": "wasm-pack build ./src/wasm --target web && vite",
       "build": "wasm-pack build ./src/wasm --target web && vite build",
       "build-wasm": "wasm-pack build ./src/wasm --target web",
       "preview": "vite preview"
     },
     "author": "",
     "license": "ISC",
     "description": "",
     "devDependencies": {
       "vite": "^5.4.9",
       "wasm-pack": "^0.13.0"
     }
   }
   ```

2. Cargo.tomlの設定

   ```bash
   vim ./src/wasm/Cargo.toml
   ```

   ```toml
   [package]
   name = "wasm"
   version = "0.1.0"
   edition = "2021"

   [lib]
   crate-type = ["cdylib", "rlib"]

   [dependencies]
   wasm-bindgen = "0.2.92"
   ```

3. lib.rsの準備

   ```bash
   vim ./src/wasm/src/lib.rs
   ```

   ```rust
   use wasm_bindgen::prelude::*;
   #[wasm_bindgen]
   extern "C" {
       fn alert(s: &str);
   }
   #[wasm_bindgen]
   pub fn greet(name: &str) {
       alert(&format!("Hello {}!", name));
   }
   ```

4. index.html, main.jsの準備

   ```bash
   vim index.html
   ```

   ```html
   <html>
     <head>
       <script type="module" src="./src/main.js"></script>
     </head>
     <body></body>
   </html>
   ```

   ```bash
   vim ./src/main.js
   ```

   ```javascript
   import init, { greet } from './wasm/pkg';
   init().then(() => greet('Wasm'));
   ```

5. ビルドして実行

   ```bash
   npm run build-wasm
   npm run dev # ローカルサーバーを起動
   ```

   - `http://localhost:5173/`にアクセスすると、`Hello Wasm!`と表示されることを確認

### まとめ

- 今回は、RustをWasmで動かす方法について学んだ。
- npmを利用せずに動作させる方法もあるが、これだとデバッグが面倒になるため極力npmを利用することが望ましいと考える。
- 現状、Rust x Wasmに関する資料はそんなに多くない印象だが、Wasmでできることが広がると、ブラウザ上でできることが増える、パフォーマンスがあがる可能性があるので、今後も学習は続けていきたい。
- 後々調べると、`cargo-component`というツールもあるようなので、そちらも調べてみたい。

### 参考

- [webassembly.org](https://webassembly.org/getting-started/developers-guide/)
- [Rust WebAssembly](https://www.rust-lang.org/ja/what/wasm)
- [wasm-pack docs](https://rustwasm.github.io/wasm-pack/book/)
- RustとWebAssemblyによるゲーム開発(O'Reilly Japan)
- [https://zenn.dev/yurioka/articles/3649c5190e33bc](https://zenn.dev/yurioka/articles/3649c5190e33bc)
