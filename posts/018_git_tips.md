---
title: 'git tips'
date: '2024-10-20'
---

### はじめに

- Gitを使っているときに便利なコマンドや設定をまとめておく。
- 最終的にはdotfilesなどにまとめておけば良いかもしれない。

### git commit時のeditor

- vimへ変更する
  ```bash
  git config --global core.editor vim
  ```

### alias

- git config でコマンドのエイリアスを設定できる
- `git config --global alias.<alias-name> "<command>"` で設定する
- 下記は`.gitconfig`でのalias例

  ```bash
  [alias]
      b = branch
      co = checkout
      ci = commit
      cm = commit -m
      st = status
      lo = log --oneline
      ad = add -A
      al = config --get-regexp ^alias\\.
  ```

### commit template

- .commit_template というファイルを作成し、コミットメッセージのテンプレートを記述することができる。

  ```bash
  # ==== Commit Messages ====

  # ==================== Format ====================
  # :emoji: Subject
  #
  # Commit body...
  # ==================== Emojis ====================
  # 🎉  :tada: 初めてのコミット（Initial Commit）
  # 🔖  :bookmark: バージョンタグ（Version Tag）
  # ✨  :sparkles: 新機能（New Feature）
  # 🐛  :bug: バグ修正（Bagfix）
  # ♻️  :recycle: リファクタリング(Refactoring)
  # 📚  :books: ドキュメント（Documentation）
  # 🎨  :art: デザインUI/UX(Accessibility)
  # 🐎  :horse: パフォーマンス（Performance）
  # 🔧  :wrench: ツール（Tooling）
  # 🚨  :rotating_light: テスト（Tests）
  # 💩  :hankey: 非推奨追加（Deprecation）
  # 🗑️  :wastebasket: 削除（Removal）
  # 🚧  :construction: WIP(Work In Progress)
  ```

* 設定方法
  ```bash
  git config --global commit.template ~/.commit_template
  ```
* 以降は`git commit`を実行すると、上記のテンプレートが表示される。

### OpenCommit

- コミットメッセージを生成するツール
- 事前にOpenAIのAPIキーを取得して、事前のクレジットを購入しておく
- 以下のコマンドで設定を行う

  ```bash
  npm install -g opencommit
  oco config set OCO_API_KEY=<your_api_key>
  cat ~/.opencommit # APIキーが設定されていることを確認
  ```

- その他の設定

  ```bash
  oco config set OCO_LANGUAGE=ja # 日本語に設定
  oco config set OCO_DESCRIPTION=false # コミットメッセージを詳細にする
  oco config set OCO_EMOJI=true # 絵文字を追加
  ```

- 以下のコマンドでコミットメッセージが生成される

  ```bash
  git add -A
  oco
  ```

### Husky

- GitのHooksを設定できる
- 下記のコマンドでインストールする
  ```bash
  npm install --save-dev husky
  ```

### 参考

- [2.7 Git の基本 - Git エイリアス](https://git-scm.com/book/ja/v2/Git-%E3%81%AE%E5%9F%BA%E6%9C%AC-Git-%E3%82%A8%E3%82%A4%E3%83%AA%E3%82%A2%E3%82%B9)
- [opencommit](https://github.com/di-sukharev/opencommit)
- [Zenn OpenCommitでAIにコミットメッセージを書かせる](https://zenn.dev/hayato94087/articles/8193b7f7fd6f76)
- [Husky](https://typicode.github.io/husky/)
