---
title: 'GORMへ入門'
date: '2024-10-13'
tags: ['Golang', 'GORM', 'ORM', 'beginners']
---

### はじめに

- WebアプリケーションにおいてSQLを扱う際にORM(Object Relational Mapping)を利用することがある。ORMを利用するこで、直接SQLを各必要がなくなり、データベースの操作をオブジェクトとして扱うことができるようになる。これにより、複雑なクエリを手作業で各手間が省け、開発がスムーズになる。Golangにおいても、ORMはいくつかあるが、その中でも人気のあるGORMを利用して、データベースの操作を行う方法を学習する。

### ORMを利用するメリット

- メリットを下記にまとめた

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

- データベース接続方法

  ```go
  // MySQL接続情報
  dbMap := map[string]string{
    "user":     "testuser",
    "password": "test_password",
    "host":     "localhost",
    "port":     "3306",
    "dbname":   "test",
  }
  dsn := fmt.Sprintf(
    "%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
    dbMap["user"], dbMap["password"], dbMap["host"], dbMap["port"], dbMap["dbname"],
  )

  // GORMを使ってデータベースに接続
  db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
  if err != nil {
    log.Fatalf("データベースに接続できませんでした: %v", err)
  }
  ```

- モデルの宣言

  - GORMは、Goの構造体をデータベーステーブルにマッピングすることで、データベースの操作を簡素化する。
  - 例えば下記のように作成されたテーブルがある
    ```sql
    CREATE TABLE `Users` (
      `id` int NOT NULL AUTO_INCREMENT,
      `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
      `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
      `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
      `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ```

  * これに対しては、下記のような構造体を定義することで、GORMを使ってデータベースの操作を行うことができる。
    ```go
    type Users struct {
      ID        uint      `gorm:"primaryKey;autoIncrement"`
      Name      string    `gorm:"size:255;not null"`
      Email     string    `gorm:"size:255;not null"`
      Password  string    `gorm:"size:255;not null"`
      CreatedAt time.Time
      UpdatedAt time.Time
    }
    ```

- 規約

  - [GORM 規約](https://gorm.io/ja_JP/docs/conventions.html) によると、GORMはいくつかの規約を持っており、それを遵守した方がよさそうだ。

  1. GORMはデフォルトでテーブルの主キーとして`ID`という名前のフィールドを使用する。(他の名前を使用する場合は、`gorm:"primaryKey"`を指定する)
  2. GORMは構造体名をテーブル名としてsnake_casesのように複数名にする。構造体名が`User`の場合、テーブル名は`users`になる。テーブル名を指定したい場合は下記のようにすることで変更可能
     ```go
     // TableName overrides the table name used by User to `profiles`
     func (User) TableName() string {
       return "profiles"
     }
     ```
  3. データベースのカラム名はフィールド名のsnake_caseを使用する。
     ```go
     type User struct {
       ID        uint      // column name is `id`
       Name      string    // column name is `name`
       Birthday  time.Time // column name is `birthday`
       CreatedAt time.Time // column name is `created_at`
     }
     ```
  4. CreatedAtフィールドを持つモデルの場合、フィールドの値がゼロ値であれば、レコード作成時に現在時刻が設定される。
  5. UpdatedAtフィールドを持つモデルの場合、フィールドの値がゼロ値であれば、レコードの更新時または作成時
     に現在時刻が設定される。

- レコードの取得

  - レコードの取得にはメソッドチェーンを使用することで、複数の条件を指定することができる。

  ```go
  // 全ユーザーを取得
  var users []models.Users
  result := db.Find(&users)

  // ユーザーを1件取得(order by Primary Key ASC)
  var user models.Users
  result := db.First(&user)

  // ユーザーを1件取得(order by Primary Key DESC)
  var user models.Users
  result := db.Last(&user)

  // ID指定でユーザーを1件取得
  var user models.Users
  result := db.First(&user, 3)

  // IDを範囲指定してユーザーを取得
  var users []models.Users
  result := db.Find(&users, []int{1, 3})

  // Where句を使ってユーザーを取得
  // `=`, `<>`, `>`, `<`, `>=`, `<=`, `LIKE`, `IN`, `BETWEEN`, `AND`, `OR` などが使える
  var users []models.Users
  result := db.Where("name <> ?", "太郎").Find(&users)

  // Not句を使ってユーザーを取得
  var users []models.Users
  result := db.Not("name = ?", "サンプル太郎2").Find(&users)

  // Order句を使ってユーザーを取得
  var users []models.Users
  result := db.Order("name ASC").Find(&users)

  // Limit, Offset句を使ってユーザーを取得
  var users []models.Users
  result := db.Limit(2).Offset(1).Find(&users)

  // resultの値を取得
  result.RowsAffected // カウント数を取得
  result.Error        // エラーを取得
  ```

- レコードの作成

  ```go
  // レコードの作成
  user := models.Users{
    Name:     "サンプル太郎4",
    Email:    "taro4@example.com",
    Password: "password4",
  }
  result := db.Create(&user)
  ```

- レコードの更新

  ```go
  // レコードの更新
  var user models.Users
  result := db.Model(&user).Where("id = ?", 4).Update("Email", "taro4@example.com")
  ```

- レコードの削除
  ```go
  // レコードの削除
  var user models.Users
  result := db.Delete(&user, 4)
  ```

### オブジェクトのライフサイクル

- 作成／取得／更新／削除 処理の前後に呼び出される`Hooks`関数がある
- 指定のメソッドをモデルに対して定義すると、作成・更新・取得・削除時にそのメソッドが自動的に呼び出され、 定義したメソッドが返した場合、GORMは以降の操作を中止し、トランザクションをロールバックする。

- **作成処理時のHooks関数** の流れ

  1. トランザクションの開始
  2. `BeforeSave`フックの呼び出し
     - データを保存する前に実行されるフック。データの検証や前処理を行うのに適している。
  3. `BeforeCreate`フックの呼び出し
     - 新規レコードを作成する前に実行されるフック。デフォルト値の設定や関連するデータの準備を行うことができる。
  4. 保存前の関連データの保存
     - データベースにレコードを挿入する前に、関連するデータ（アソシエーション）を保存する。これにより、関連するテーブルのデータが先に保存され、整合性が保たれる。
  5. データベースへの挿入
  6. 保存後の関連データの保存
  7. `AfterCreate`フックの呼び出し
     - レコードの作成後に実行されるフック。作成後のデータに対して追加の処理を行うことができる。
  8. `AfterSave`フックの呼び出し
     - データを保存した後に実行されるフック。保存後のデータに対して追加の処理を行うことができる。
  9. トランザクションのコミットまたはロールバック

  ```go
  // BeforeSave
  func (u *Users) BeforeSave(tx *gorm.DB) (err error) {
    // INSERTやUPDATEの前に行う処理を記述
    return nil
  }

  // BeforeCreate
  func (u *Users) BeforeCreate(tx *gorm.DB) (err error) {
    // パスワードが空かどうかをチェック
    if len(u.Password) == 0 {
      return errors.New("パスワードが必要です")
    }
    // パスワードのハッシュ化
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
    if err != nil {
      return err
    }
    u.Password = string(hashedPassword)
    return nil
  }

  // AfterCreate
  func (u *Users) AfterCreate(tx *gorm.DB) (err error) {
    // ユーザーにメールを送信する処理
    err = sendWelcomeEmail(u.Email)
    if err != nil {
      return err
    }
    return nil
  }

  // AfterSave
  func (u *Users) AfterSave(tx *gorm.DB) (err error) {
    // 例) ログに保存結果を反映する処理
    return nil
  }
  ```

- **更新処理時のHooks関数** の流れ

  - Insert処理と同様に、更新処理時にもHooks関数が呼び出される。

  1. トランザクションの開始
  2. `BeforeSave`フックの呼び出し
  3. `BeforeUpdate`フックの呼び出し
  4. 保存前の関連データの保存
  5. データベースの更新
  6. 保存後の関連データの保存
  7. `AfterUpdate`フックの呼び出し
  8. `AfterSave`フックの呼び出し
  9. トランザクションのコミットまたはロールバック

  ```go
  // BeforeUpdate
  func (u *Users) BeforeUpdate(tx *gorm.DB) (err error) {
    // 更新前の特別な処理（例: 特定の条件がある場合のみ更新を許可）
    if u.Email == "" {
      return errors.New("メールアドレスが空です")
    }
    return nil
  }

  // AfterUpdate
  func (u *Users) AfterUpdate(tx *gorm.DB) (err error) {
    // 更新後の処理（例: KVSを利用している場合はキャッシュのクリア、メール通知など）
    return nil
  }
  ```

- **削除処理時のHooks関数** の流れ

  - 削除処理時にもHooks関数が呼び出される。

  1. トランザクションの開始
  2. `BeforeDelete`フックの呼び出し
  3. データベースの削除
  4. `AfterDelete`フックの呼び出し
  5. トランザクションのコミットまたはロールバック

  ```go
  // BeforeDelete
  func (u *Users) BeforeDelete(tx *gorm.DB) (err error) {
    // 削除前の処理（例: 削除不可な条件があればエラーを返す）
    if u.ID == 5 {
      return errors.New("このユーザーは削除できません")
    }
    return nil
  }

  // AfterDelete
  func (u *Users) AfterDelete(tx *gorm.DB) (err error) {
    // 削除後の処理（例: KVSを利用している場合はキャッシュのクリアを行う）
    clearCacheForUser(u.ID)
    return nil
  }
  ```

- **オブジェクト取得時のHooks関数** の流れ

  - レコードを取得する際にもHooks関数が呼び出される。

  1. トランザクションの開始
  2. `AfterFind`フックの呼び出し
  3. トランザクションのコミットまたはロールバック

  ```go
  // AfterFind
  func (u *Users) AfterFind(tx *gorm.DB) (err error) {
    // レコード取得後の処理（例: レコードの内容をログに出力する）
    log.Printf("ユーザー名: %s", u.Name)
    return nil
  }
  ```

### トランザクション

- GORMは、データの一貫性を確保するために書き込み操作(作成/更新/削除) をトランザクション内で実行する。必要でなければ、初期化時に無効可能。

  ```go
  // トランザクション開始
  db.Transaction(func(tx *gorm.DB) error {
    // ユーザーの作成
    user := models.Users{
      Name:     "サンプル太郎10",
      Email:    "taro10@example.com",
      Password: "password10",
    }
    if err := tx.Create(&user).Error; err != nil {
      // エラー発生時はロールバック
      return err
    }
    // nilが返却されるとトランザクション内の全処理がコミットされる
    return nil
  })
  ```

### まとめ

- 今回はGORMを用いた簡単なCRUD処理の確認と、規約、フックス、トランザクションの流れを確認しました。
- 基本的にメソッドチェーンで操作を付加していくので、非常に直感的で使いやすいです。
- Hooks関数では、そのモデル毎にライフサイクルを定義することができるので、こちらも使いやすい。
- GORMはリファレンスより多機能であることがわかったが、必要ない機能や他で処理したほうがよいところなどあると思うので、使い分けが重要だと感じました。

### 参考

- [GORMガイド](https://gorm.io/ja_JP/docs/)
- [https://qiita.com/gold-kou/items/45a95d61d253184b0f33](https://qiita.com/gold-kou/items/45a95d61d253184b0f33)
