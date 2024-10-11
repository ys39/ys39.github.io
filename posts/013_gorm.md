---
title: 'GORM 入門'
date: '2024-10-11'
---

### はじめに

- WebアプリケーションにおいてSQLを扱う際にORM(Object Relational Mapping)を利用することがある。ORMを利用するこで、直接SQLを各必要がなくなり、データベースの操作をオブジェクトとして扱うことができるようになる。これにより、複雑なクエリを手作業で各手間が省け、開発がスムーズになる。Golangにおいても、ORMはいくつかあるが、その中でも人気のあるGORMを利用して、データベースの操作を行う方法を学習する。

### ORMを利用するメリット

1. **開発速度の向上**: SQLクエリを手書きする必要が減り、オブジェクトとしてデータを扱うため開発がスムーズに進む。
2. **データベースの抽象化**: データベースのテーブルやレコードをオブジェクトとして操作できるので、SQLの知識がなくてもデータ操作が簡単。
3. **データベースの変更に柔軟**: ORMを使うと、異なるデータベース（MySQL、PostgreSQLなど）間の切り替えが容易で、コードの大幅な変更を避けられる。
4. **SQLインジェクションのリスク軽減**: SQLクエリが自動生成され、バインディングパラメータを使用するため、手動のSQLに比べてセキュリティが向上。
5. **コードの可読性と保守性の向上**: データ操作がオブジェクト指向的に行えるため、コードが直感的かつ読みやすくなり、他の開発者も理解しやすい。
6. **自動マイグレーション機能**: ORMはデータベーススキーマの変更を自動的に適用できるマイグレーション機能を提供し、保守が容易。
7. **キャッシュとパフォーマンス向上**: ORMにはキャッシュ機能があり、データベースへのアクセス頻度を減らし、全体的なパフォーマンスを向上させる。
8. **一貫性のあるエラーハンドリング**: ORMはデータベース関連のエラー処理を一貫した形で提供し、アプリケーション全体で統一されたエラーハンドリングが可能。

### GORMとは

- Go言語のORMライブラリ

### MySQL環境の準備

- Dockerfile

  ```Dockefile
  FROM mysql:8.4.0

  # 環境変数の設定
  ENV MYSQL_ROOT_PASSWORD=root_password
  ENV MYSQL_DATABASE=test
  ENV MYSQL_USER=testuser
  ENV MYSQL_PASSWORD=test_password

  # カスタム設定ファイルをコピー
  COPY ./my.cnf /etc/mysql/conf.d/my.cnf
  ```

* my.cnf

  ```cnf
  [mysqld]
  # 基本設定
  user = mysql
  port = 3306
  bind-address = 0.0.0.0  # 外部からの接続を許可する場合
  datadir = /var/lib/mysql

  # 文字コード設定
  character-set-server = utf8mb4
  collation-server = utf8mb4_unicode_ci

  [mysql]
  default-character-set = utf8mb4
  ```

* 上記ファイルを配置して、以下のコマンドを実行することでMySQL環境を構築できる。

  ```bash
  docker build -t mysql-8.4.0 .
  docker run -d -p 3306:3306 --name mysql-server mysql-8.4.0

  # MySQLに接続
  docker exec -it mysql-server /bin/bash

  # migration.sqlを実行
  docker exec -i mysql-server mysql -u testuser -ptest_password test < ./db/migration.sql
  ```

### GORMのインストール

- GORMをインストールするために、以下のコマンドを実行
  ```bash
  go get -u gorm.io/gorm
  go get -u gorm.io/driver/mysql
  ```

### GORMの基本的な使い方

### まとめ

### 参考

- [GORMガイド](https://gorm.io/ja_JP/docs/)
