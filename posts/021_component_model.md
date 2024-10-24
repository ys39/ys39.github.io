---
title: 'Component Model'
date: '2024-10-23'
---

### はじめに

- [020_rust_wasm](./020_rust_wasm) でRustをWasmで動かす方法を学習している中で、cargo-componentの存在を知った。どうやら、WasmのComponent Modelというものがあり、それに従ってWasmコンポーネントを構築するためのcargoサブコマンドのよう。全く知らない領域なので少し調べてみる。

### 事前知識

Component Modelについて調べる前に、Wasmの事前知識について整理しておく。

- **Wasmモジュール** .. コンポーネントモデル以前の仕様では、ビルドされた結果出力されるWasmファイルのこと。Why Component Model? でも記載がある通り、このWasmモジュールであった問題を解決するために、Component Modelが提案された。

- **WASI(WebAssembly System Interface)** .. Wasmをウェブブラウザ以外の環境で実行するため、ホストのファイルやネットワークなどの資源に安全にアクセスさせるための仕様。現在はWASI Preview 2が開発中のフェーズで下記の特徴がある。

  - Component Modelの導入（モジュール間の相互運用性を高めるなど）
  - インタフェースを記述するIDLであるWITの導入

### Component Model

[The WebAssembly Component Model](https://component-model.bytecodealliance.org/introduction.html) にて整理されているほど重要な概念。

- Component Modelとは?
  - Wasmモジュール間の相互運用性を高め、複雑なデータ型や機能を安全かつ効率的にやり取りできるようにするための新しい仕様や仕組み。
- Why Component Model?
  - 従来のWasmモジュール（Coreモジュール）は、整数や浮動小数点数といった基本的な型しか直接やり取りできず、文字列や構造体、リストなどの複雑なデータ型を扱う場合、ポインタやオフセットを使って手動で管理する必要があった。これにより、異なるプログラミング言語間でのデータ交換が困難で、メモリ管理やデータ表現の違いによる問題が生じていた。これを解決するために、Component Modelが提案された。
- Component Modelの特徴

  - **WIT（WebAssembly Interface Types）** の導入 .. データ型やインターフェースを定義するための言語であるWITを使用し、モジュール間で複雑なデータ型を安全に交換できるようになった。WIT (Wasm Interface Type)言語は、コンポーネントモデルのインターフェースとワールドを定義するために使用され、コンポーネント間のコントラクトのみを定義する。
  - **Canonical ABI（Application Binary Interface）** の導入 .. 異なる言語や環境間でデータを正しく解釈・変換するための標準的な方法を提供する。
  - モジュールの再利用性と拡張性の向上 .. 異なる言語で書かれたモジュール同士が、相互に依存関係を持ちながらも独立して動作できるようになる。
  - セキュリティとサンドボックス化の強化 .. メモリの直接的な共有を避け、明確なインターフェースを通じてのみ通信することで安全性を高める。

### Component Model周辺のキーワード

- **Components**
  - 論理的には、WITを介してインタフェースと依存関係を表現するモジュールのためのコンテナ。
  - 概念的には、共有メモリの代わりにインタフェースを介してのみ相互作用するコードの自己記述単位。
  - 物理的には、コンポーネントは特別にフォーマットされたWebAssemblyファイル。内部的には、コンポーネントは複数の伝統的なWasmモジュールと、それらのインポートおよびエクスポートを介して構成されるサブコンポーネントを含むことができます。
- **WIT**

  - **WIT Interfaces** .. 簡単にいうと、型と関数を記述する。(一般的なメソッドなどの集合体と同じはず)

    ```wit
    interface canvas {
        type canvas-id = u64;

        record point {
            x: u32,
            y: u32,
        }

        draw-line: func(canvas: canvas-id, from: point, to: point);
    }
    ```

  - **WIT Worlds** .. importとexportのセットを記述し、中括弧で囲み、worldキーワードで導入する。 大まかには、ワールドはコンポーネントの約束?を記述する。 importとexportにはインターフェースや関数などを含めることができる。

    - export .. コンポーネントによって提供され、コンポーネントを利用する側が何を呼び出すかを定義する。
    - import .. コンポーネントが呼び出すことができるもの。

    ```wit
    interface printer {
        print: func(text: string);
    }

    interface error-reporter {
        report-error: func(error-message: string);
    }

    world multi-function-device {
        // The component implements the `printer` interface
        export printer;

        // The component implements the `scan` function
        export scan: func() -> list<u8>;

        // The component needs to be supplied with an `error-reporter`
        import error-reporter;
    }
    ```

  - **WIT Packages** .. インターフェースとワールドの関連セットを含む1つ以上のWITファイルのセット。パッケージは、ワールドとインターフェースが互いに参照するための方法を提供し、コンポーネントのエコシステムが共通の定義を共有できるようにする。

### cargo-componentでWasmコンポーネントを作成

- `cargo-component`はコンポーネントモデルに従ってWebAssembly Componentsを構築するためのcargoサブコマンド。
- とりあえず、cargo componentを利用してWasmコンポーネントを作成してみる。ここでは、単一のWasmモジュールとして実行するものではなく、ライブラリとして他のコンポーネントから利用されるコンポーネントを作成する。

1. cargo-componentのインストール

   ```bash
   cargo install cargo-component --locked
   cargo component -V
   # cargo-component-component 0.18.0
   ```

2. コンポーネントの作成

   ```bash
   cargo component new --lib cargo-component-practice
   cd cargo-component-practice
   tree
   # .
   # ├── Cargo.lock
   # ├── Cargo.toml
   # ├── src
   # │   └── lib.rs
   # └── wit
   #     └── world.wit
   ```

3. WITの修正

   ```bash
   vim wit/world.wit
   ```

   ```wit
   package component:cargo-component-practice;

   interface greetable {
       greet: func(name: string) -> string;
   }

   world greetable-provider {
       export greetable;
   }
   ```

4. lib.rsの修正

   ```bash
   vim src/lib.rs
   ```

   ```rust
   #[allow(warnings)]
   mod bindings;

   use crate::bindings::exports::component::cargo_component_practice::greetable::Guest;

   struct Component;

   impl Guest for Component {
       fn greet(name: String) -> String {
           format!("Hello, {}!", name)
       }
   }

   bindings::export!(Component with_types_in bindings);
   ```

5. コンポーネントをビルド

   ```bash
   cargo component build --target wasm32-unknown-unknown
   # Generating bindings for cargo-component-practice (src/bindings.rs)
   # Compiling wit-bindgen-rt v0.34.0
   # Compiling bitflags v2.6.0
   # Compiling cargo-component-practice v0.1.0 (/home/senri/wasm/cargo-component-practice)
   # Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.37s
   # Creating component target/wasm32-unknown-unknown/debug/cargo_component_practice.wasm
   ```

6. コンポーネントを実行（実行に失敗します）

   ```bash
   cargo component run
   # Generating bindings for cargo-component-practice (src/bindings.rs)
   # Compiling cargo-component-practice v0.1.0 (/home/senri/wasm/cargo-component-practice)
   # Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.17s
   # Creating component target/wasm32-wasip1/debug/cargo_component_practice.wasm
   # Running `target/wasm32-wasip1/debug/cargo_component_practice.wasm`
   # Error: failed to run main module `/home/senri/wasm/cargo-component-practice/target/wasm32-wasip1/debug/cargo_component_practice.wasm`

   # Caused by:
   # no exported instance named `wasi:cli/run@0.2.1`
   ```

   - ライブラリのWasmコンポーネントを単体で実行できないので想定通り。

7. 他コンポーネントから利用する準備

   1. cargoで新規プロジェクトを作成

        ```bash
        cargo new greet-user
        cd greet-user
        tree
        # .
        # ├── Cargo.toml
        # └── src
        # └── main.rs
        ```

   2. `Cargo.toml`の設定

        ```toml
        [package]
        name = "greet-user"
        version = "0.1.0"
        edition = "2021"

        [dependencies]
        anyhow = "1.0.91"
        clap = { version = "4.5.20", features = ["derive"] }
        wasmtime = "26.0.0"
        ```

   3. `src/main.rs`の記述

      - 実行時に`wasm`ファイルを読み込み、`greet`関数を呼び出す。

        ```rust
        use anyhow::Result;
        use clap::Parser;
        use wasmtime::component::{Component, Linker, TypedFunc};
        use wasmtime::{Engine, Store};

        #[derive(Parser, Debug)]
        struct Args {
            wasm_file: String,
        }

        fn start(args: Args) -> Result<()> {
            let engine = Engine::default();
            let component = Component::from_file(&engine, &args.wasm_file)?;

            let linker = Linker::new(&engine);
            let mut store = Store::new(&engine, ());
            let instance = linker.instantiate(&mut store, &component)?;

            let greetable_index = instance
                .get_export(
                    &mut store,
                    None,
                    "component:cargo-component-practice/greetable",
                )
                .unwrap();

            let greet_index = instance
                .get_export(&mut store, Some(&greetable_index), "greet")
                .unwrap();

            let greet: TypedFunc<(String,), (String,)> =
                instance.get_typed_func(&mut store, greet_index).unwrap();

            let argument = "Hoge!".to_string();
            let (return_value,) = greet.call(&mut store, (argument,))?;
            greet.post_return(&mut store)?;
            println!("{return_value}");

            Ok(())
        }

        fn main() {
            let args = Args::parse();

            if let Err(e) = start(args) {
                eprintln!("Error: {}", e);
            }
        }
        ```

      * `wasmtime`というランタイムを利用して、Wasmを実行している。
      * [wasmtime in Rust](https://docs.wasmtime.dev/lang-rust.html) がコードの参考になる。
      * クレート内部の関数については[wasmtime 26.0.0](https://docs.rs/wasmtime/26.0.0/wasmtime/all.html) が参考になる。

        ```rust
        // wasmtimeのエンジンを作成
        let engine = Engine::default();
        // file が指すディスク上の wasm ファイルから新しい WebAssembly コンポーネントをコンパイルする
        let component = Component::from_file(&engine, &args.wasm_file)?;
        // 指定されたEngine用の新しいリンカーを作成する。
        let linker = Linker::new(&engine);
        // 指定されたEngineと提供されたデータに関連付けられる新しいStoreを作成する。
        let mut store = Store::new(&engine, ());
        // 指定されたストアに指定されたコンポーネントをインスタンス化する。
        let instance = linker.instantiate(&mut store, &component)?;
        ```

      * instanceの実装については[Struct Instance](https://docs.rs/wasmtime/26.0.0/wasmtime/component/struct.Instance.html)が参考になる。

        ```rust
        // 指定されたインスタンス内で指定された名前("component:cargo-component-practice/greetable")を検索する。
        let greetable_index = instance
            .get_export(
                &mut store,
                None,
                "component:cargo-component-practice/greetable",
            )
            .unwrap();

        // 第二引数で指定したComponentExportIndexインスタンス(greetable_index)から指定された名前("greet")を検索する。
        let greet_index = instance
            .get_export(&mut store, Some(&greetable_index), "greet")
            .unwrap();

        // エクスポートされたgreet関数をラップしたオブジェクトを作成する
        let greet: TypedFunc<(String,), (String,)> =
            instance.get_typed_func(&mut store, greet_index).unwrap();
        ```
      * greet関数を呼び出す 
        ```rust
        let argument = "Hoge!".to_string();
        // Sturct TypedFunc -> callメソッドを呼び出して実行
        let (return_value,) = greet.call(&mut store, (argument,))?;
        // Func::call が正常に完了した後に呼び出される必須のメソッド。 エンベッダが戻り値の処理を終えた後、この関数を呼び出す必要がある。
        greet.post_return(&mut store)?;
        println!("{return_value}");
        ```

8. メインプロジェクトを実行

   ```bash
   cargo run ../cargo-component-practice/target/wasm32-unknown-unknown/debug/cargo_component_practice.wasm
   # Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.25s
   # Running `target/debug/greet-user ../cargo-component-practice/target/wasm32-unknown-unknown/debug/cargo_component_practice.wasm`
   # Hello, Hoge!!
   ```

   - しっかりとWasmのライブラリコンポーネントから関数を呼び出すことができたことを確認。

### Rust × Wasm ツール

今回はメインコンポーネントから`wasmtime`を、ライブラリコンポーネントで`wit-bindgen-rt`を使用したが、他にも様々なツールが存在する。

- `wasmtime` .. WebAssemblyとそのコンポーネントを実行するためのランタイム
- `wit-bindgen` .. WebAssembly Interface Types（WIT）からコードを自動生成するためのツール
- `wasm-tools` .. WebAssemblyバイナリの操作や解析を行うためのコマンドラインツールのコレクション
- `wasm-pack` .. Rustで書かれたコードをWebAssemblyにコンパイルし、npmパッケージとして公開するためのツール
- `wasm-bindgen` .. RustとJavaScript間の相互運用を容易にするためのツールとライブラリ。Rustで書かれた関数やデータ構造をWebAssemblyを介してJavaScriptから利用できるようにし、逆にJavaScriptの機能をRustから呼び出すことも可能

### 後で読む

- [Wasm Core 仕様](https://webassembly.github.io/spec/core/)
- [Component Modelのデザイン](https://github.com/WebAssembly/component-model/tree/main/design/high-level)
  - Component Modelの目標やユースケースなどが記載されている
- [WebAssembly RoadMap](https://bytecodealliance.org/articles/webassembly-the-updated-roadmap-for-developers)
  - 記事は2023/7/24のもので、1年以上前のものだが参考になる。

### 参考

- [cargo component](https://github.com/bytecodealliance/cargo-component)
- [WebAssembly Component Model](https://component-model.bytecodealliance.org/)
- [WASI](https://github.com/WebAssembly/WASI)
- Rustで学ぶWebAssembly（技術評論社）
