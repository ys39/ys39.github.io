---
title: 'MoonBit 入門'
date: '2024-11-13'
tags: ['MoonBit', 'beginners']
isOpen: 
---

### はじめに
* 以前に、RustでWasmのComponent Modelを作成してみたが、Wasmへコンパイルすることが可能な言語は他にもある。その中でもMoonBitというプログラミング言語は、[公式](https://docs.moonbitlang.com/)より`MoonBit is an end-to-end programming language toolchain for cloud and edge computing using WebAssembly. `と記載してあり、Wasmに特化した言語であるだろう？とみられる。
* 今回は、そのMoonBitについて調査してみる。

### MoonBit とは
* WebAssemblyのために特別に設計されたプログラミング言語
* JavaScriptとNativeを含む複数のバックエンドを提供
* 関数型とオブジェクト指向を含む複数のプログラミングパラダイムをサポート
* シンプルで実用的な型システムとデータ指向の言語設計

### Quick Start
1. MoonBitのインストール
    ```bash
    curl -fsSL https://cli.moonbitlang.com/install/unix.sh | bash
    echo 'export PATH="$HOME/.moon/bin:$PATH"' >> ~/.bashrc
    source ~/.bashrc
    ```
2. MoonBitのヘルプ
    ```bash
    moon help

    The build system and package manager for MoonBit.

    Usage: moon [OPTIONS] <COMMAND>

    Commands:
    new                    Create a new MoonBit module
    build                  Build the current package
    check                  Check the current package, but don't build object files
    run                    Run a main package
    test                   Test the current package
    clean                  Remove the target directory
    fmt                    Format source code
    doc                    Generate documentation
    info                   Generate public interface (`.mbti`) files for all packages in the module
    add                    Add a dependency
    remove                 Remove a dependency
    install                Install dependencies
    tree                   Display the dependency tree
    login                  Log in to your account
    register               Register an account at mooncakes.io
    publish                Publish the current module
    package                Package the current module
    update                 Update the package registry index
    coverage               Code coverage utilities
    generate-build-matrix  Generate build matrix for benchmarking (legacy feature)
    upgrade                Upgrade toolchains
    shell-completion       Generate shell completion for bash/elvish/fish/pwsh/zsh to stdout
    version                Print version information and exit
    help                   Print this message or the help of the given subcommand(s)

    Options:
    -h, --help  Print help

    Common Options:
    -C, --directory <SOURCE_DIR>   The source code directory. Defaults to the current directory
        --target-dir <TARGET_DIR>  The target directory. Defaults to `source_dir/target`
    -q, --quiet                    Suppress output
    -v, --verbose                  Increase verbosity
        --trace                    Trace the execution of the program
        --dry-run                  Do not actually run the command
        --build-graph              Generate build graph
    ```

3. MoonBitの新規プロジェクト作成
    ```bash
    moon new
    # Enter the path to create the project (. for current directory): moon-practice
    # Select the create mode: exec
    # Enter your username: _ys39
    # Enter your project name: hello
    # Enter your license: Apache-2.0
    # hint: Using 'master' as the name for the initial branch. This default branch name
    # hint: is subject to change. To configure the initial branch name to use in all
    # hint: of your new repositories, which will suppress this warning, call:
    # hint: 
    # hint:   git config --global init.defaultBranch <name>
    # hint: 
    # hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
    # hint: 'development'. The just-created branch can be renamed via this command:
    # hint: 
    # hint:   git branch -m <name>
    # Initialized empty Git repository in ~/wasm/moon-practice/.git/
    # Created moon-practice
    ```

4. ディレクトリ構成確認

    ```bash
    tree
    # .
    # ├── LICENSE
    # ├── README.md
    # ├── moon.mod.json
    # └── src
    #     ├── lib
    #     │   ├── hello.mbt
    #     │   ├── hello_test.mbt
    #     │   └── moon.pkg.json
    #     └── main
    #         ├── main.mbt
    #         └── moon.pkg.json
    ```

    * `moon.mod.json` .. moon.mod.jsonは、ディレクトリをMoonBitモジュールとして識別するために使用。モジュール名やバージョンなど、モジュールのメタデータが含まれる。sourceはモジュールのソースディレクトリを指定され、デフォルト値は src。
    * `lib`,`main`ディレクトリ .. 各パッケージには、MoonBitのソースコードファイルである.mbtファイルを複数含めることができる。
    * `moon.pkg.json` .. パッケージ記述子。メインパッケージかどうか、インポートするパッケージなど、パッケージのプロパティを定義する。
        * `main/moon.pkg.json `
        * `is_main: true`は、パッケージがビルドシステムによってwasmファイルにリンクされる必要があることを宣言
        ```bash
        {
            "is-main": true, 
            "import": [
                "_ys39/hello/lib"
            ]
        }
        ```
        * `lib/moon.pkg.json`
        * このファイルの目的は、ビルド・システムにこのフォルダがパッケージであることを知らせるだけ
        ```bash
        {}
        ```
5. 実行
    ```bash
    moon run ./src/main
    # Hello, world!
    ```

6. テスト
    ```bash
    moon test -v
    # test _ys39/hello/lib/hello_test.mbt::hello ok
    # Total tests: 1, passed: 1, failed: 0.
    ```

### `moon`コマンド
[Command-Line Help for moon](https://moonbitlang.github.io/moon/commands.html)にまとめられている。代表的なのだと下記がある。
* `moon build` .. パッケージをビルドする
* `moon fmt` .. ソースコードのフォーマットが実行される
* `moon add <PACKAGE PATH>` .. 依存関係を追加する
* `moon install` .. 依存関係をインストールする
* `moon version` .. バージョン情報を表示する

### パッケージ
* [mooncakes](https://mooncakes.io/) に外部のパッケージが公開されている。
* このページでまとめきれるほどにパッケージ量は少ない。しかも`hello`のような練習パッケージもあるため、気軽に組み合わせて作るのはまだまだ先になる。
* 適当な外部パッケージを使ってみる
    1. [gmlewis/base64](https://mooncakes.io/docs/#/gmlewis/base64/)を利用
    ```bash
    moon add gmlewis/base64
    # .mooncakesに下記が追加される
    # ├── .mooncakes
    #        └── gmlewis
    #            └── base64
    #                ├── LICENSE
    #                ├── README.md
    #                ├── base64-decode.mbt
    #                ├── base64-decode_test.mbt
    #                ├── base64-encode.mbt
    #                ├── base64-encode_test.mbt
    #                ├── bytes-2-str.mbt
    #                ├── decoder
    #                │   ├── LICENSE
    #                │   ├── README.md
    #                │   ├── lib.mbt
    #                │   ├── lib_test.mbt
    #                │   └── moon.pkg.json
    #                ├── encoder
    #                │   ├── LICENSE
    #                │   ├── README.md
    #                │   ├── lib.mbt
    #                │   ├── lib_test.mbt
    #                │   └── moon.pkg.json
    #                ├── moon.mod.json
    #                ├── moon.pkg.json
    #                ├── str-2-bytes.mbt
    #                └── update.sh
    ```
    ```bash
    cat moon.mod.json 
    # moon.and.jsonに依存関係が追加されていることを確認
    #{
    #    "name": "_ys39/hello",
    #    "version": "0.1.0",
    #    "deps": {
    #        "gmlewis/base64": "0.9.0"
    #    },
    #    "readme": "README.md",
    #    "repository": "",
    #    "license": "Apache-2.0",
    #    "keywords": [],
    #    "description": "",
    #    "source": "src"
    #}
    ```
    2. `lib`の`moon.pkg.json`に追加
    ```bash
    {
        "import": [
            "gmlewis/base64/encoder",
            "gmlewis/base64/decoder"
        ]
    }
    ```
    3. `lib`の`hello.mbt`に追加
    ```rust
    pub fn enc() -> Iter[Byte] {
        @encoder.utf8("Hello World!".iter())
    }

    pub fn dec() -> String {
        let a : Iter[Byte] = [
            b'\x48', b'\x65', b'\x6C', b'\x6C', b'\x6F', b'\x20', b'\x57', b'\x6F', b'\x72',
            b'\x6C', b'\x64', b'\x21',
        ].iter()
        let mut str = ""
        for c in @decoder.utf8(a) {
            str += c.to_string()
        }
        str
    }
    ```
    4. `main`の`main.mbt`を修正
    ```rust
    fn main {
        println(@lib.enc())
        println(@lib.dec())
    }
    ```
    5. 実行
    ```bash
    moon run ./src/main/
    # [b'\x48', b'\x65', b'\x6C', b'\x6C', b'\x6F', b'\x20', b'\x57', b'\x6F', b'\x72', b'\x6C', b'\x64', b'\x21']
    # Hello World!
    ```

### まとめ
* 今回は、MoonBitの基本的な使い方を確認してみた。
* 文法は公式をさっとみただけだが、Rustに似ているように感じ。（完全に同じではなく、Structに対するderiveの書き方など異なる部分はある）ただ、Rustを知っていると、MoonBitの文法を理解しやすいかもしれない。
* mooncakesとしてまとまっているmoonbitの外部パッケージはまだ少ないため、これを主として開発するには時期尚早。しかも、しっかりとした使い方？のようなものも未整備のため、これから感が強い。

### 参考
* https://docs.moonbitlang.com/
* https://mooncakes.io/
