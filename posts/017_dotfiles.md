---
title: 'dotfiles'
date: '2024-10-19'
---

### はじめに

- ユーザーのホームディレクトリに保存される設定や構成ファイルのことを指し、名前が「.」で始まるため「ドットファイル」と呼ばれ、Unix系のオペレーティングシステムでよく使われる。
- dotfilesを一度整理しておくと、新しい環境に移行する際にもスムーズに設定を引き継ぐことができる。ただし、常に使うためには、定期的に更新する必要がある。

### dotfilesとして管理するファイル

- [Github Repository](https://github.com/ys39/dotfiles) こちらに今後更新していく。
- いつも使っている設定ファイルや公開されているdotfilesを参考に、自分のdotfilesを作成する。
- 必要そうなファイルをリストアップ

  ```bash
  ### for All

  #### for Editor
  .editorconfig # エディタ全般の設定ファイル
  .vimrc # Vimの設定ファイル
  #### for Git
  .gitconfig # Gitの設定ファイル
  .commit_template # Gitのコミットテンプレート
  .gitignore_global # Gitのグローバルなignoreファイル
  #### for Shell
  .bashrc # Bashの設定ファイル
  .zshrc # Zshの設定ファイル

  ### for Windows
  .wslconfig # WSLの設定ファイル

  ### for Mac
  .Brewfile # Homebrewのパッケージリスト
  ```

### 管理方法

- Brewfile

  - Macの場合、Homebrewを使ってパッケージインストールする場合が多いが、一つ一つのパッケージをインストールするのは面倒なので、Brewfileを使って一括でインストールすることができる。
  - `brew` .. Homebrew に正式に登録されたライブラリをインストールする
  - `tap` .. Homebrew に正式に登録されていないライブラリをインストールする
  - `cask` .. GUIアプリケーションをインストールする
  - `mas` .. Mac App Store からアプリケーションをインストールする

- Makefile
  - Makefileに管理手順を記述するケースも見かける。

### これから

- プライベートではWSL2を、仕事ではMacを使っているため、両方の環境に対応したdotfilesを作成する。
- 管理方法の選択肢を検討する。
- 必要なdotfilesをリストアップし、整理する。(公開されているdotfilesが多いので、それを参考にしていく)

### 参考

- [https://note.com/dev_onecareer/n/ncc5d43c83d17](https://note.com/dev_onecareer/n/ncc5d43c83d17)
- [https://kakakakakku.hatenablog.com/entry/2020/09/17/124653](https://kakakakakku.hatenablog.com/entry/2020/09/17/124653)
