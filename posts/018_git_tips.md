---
title: 'git tips'
date: '2024-10-20'
---

### はじめに

- Gitを使っているときに便利なコマンドや設定をまとめておく。

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

### 参考

- [2.7 Git の基本 - Git エイリアス](https://git-scm.com/book/ja/v2/Git-%E3%81%AE%E5%9F%BA%E6%9C%AC-Git-%E3%82%A8%E3%82%A4%E3%83%AA%E3%82%A2%E3%82%B9)
