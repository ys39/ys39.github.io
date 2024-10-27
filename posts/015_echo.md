---
title: 'Echoへ入門'
date: '2024-10-17'
tags: ['Golang', 'Echo', '入門', 'Architecture']
---

### はじめに

- 以前にGo言語のWebフレームワークであるGin ([GIn入門](./003_gin))を学んだ。Go言語のWebフレームワークは他にもあり、今回はEchoを学ぶ。

### Echoとは

- Golangでスケーラブルで高性能なウェブアプリケーションを構築するための強力で多用途なウェブフレームワーク。 シンプルさ、柔軟性、パフォーマンスの原則に従い、開発者に堅牢なウェブアプリケーションを構築するための効率的なツールキットを提供する。

### Quick Start

1. install

   ```bash
   mkdir echo-practice && cd echo-practice
   go mod init echo-practice
   go get github.com/labstack/echo/v4
   ```

2. Hello Worldを出力

   ```go
   package main

   import (
     "net/http"

     "github.com/labstack/echo/v4"
   )

   func main() {
     e := echo.New()
     e.GET("/", func(c echo.Context) error {
       return c.String(http.StatusOK, "Hello, World!")
     })
     e.Logger.Fatal(e.Start(":1323"))
   }
   ```

3. 実行

   ```bash
   go run main.go
   ```

4. ブラウザで`http://localhost:1323`にアクセスして`Hello, World!`が表示されることを確認する。

### BBSを元にしたAPIの作成

- [Github Repository](https://github.com/ys39/echo-practice) に今回のコードはまとめています。
- [BBSプロジェクト](./002_openapi) で作成したAPIをEchoを用いて作成しました。
- [Gin BBS API](./003_gin) ではGinを用いて同様のAPIを作成しています。
- Ginで作成したときと同様に、MVCモデルで作成。ただし、View層は不要なので削除し、DBとのやりとりを記述するためにRepository層を追加。
  - Model層 .. models/内に記載。データ構造体や型を定義。
  - Repository層 .. repositories/内に記載。モックDBやDBとのやり取りを行う。
  - Controller層 .. controllers/内に記載。リクエストを受け取り、リポジトリを使用して適切な処理を行う。
  - View層 .. 不要なので削除。
- ディレクトリ構成は以下の通り。
  ```bash
  .
  ├── README.md
  ├── controllers
  │   ├── post_controller.go
  │   └── post_controller_test.go
  ├── errors
  │   └── error_handler.go
  ├── go.mod
  ├── go.sum
  ├── main.go
  ├── models
  │   ├── post_interface.go
  │   └── post_type.go
  ├── repositories
  │   ├── db
  │   │   └── post_db_repository.go
  │   └── mock
  │       ├── post_mockdb_data.go
  │       └── post_mockdb_repository.go
  └── routers
      └── router.go
  ```

### 各ファイルの説明

- `post_controller.go`
  - リクエストを受け取り、リポジトリを利用してDBからデータを取得して、レスポンスを返す。
- `post_controller_test.go`
  - コントローラのテストコードを記述。
- `error_handler.go`
  - カスタムエラーハンドリングを行う。
  - エラーが発生した場合に、エラーの内容をログに出力して、エラーメッセージを返す。
- `post_interface.go`
  - Postのインターフェースを定義。
- `post_type.go`
  - Postのデータ構造体を定義。
- `post_db_repository.go`, `post_mockdb_repository.go`
  - モックDBやDBからデータを取得するためのリポジトリを定義。
- `post_mockdb_data.go`
  - モックDBのデータを定義。
- `router.go`
  - リポジトリインスタンスを生成し、コントローラを初期化する。
  - ルーティングを設定する。

### DIの実装

- 今回はコントローラから直接DBの操作を行うのではなく、リポジトリを介してDBの操作を行うようにする。コントローラが抽象に依存することにより、MySQLやPostgreSQLなどの異なるDBを使用する場合にも、リポジトリを変更するだけでコントローラを変更することなくDBの操作を行うことができる。今回はMockDBを使用している。
- 図で表すと下記のようになる。
  ![echo_architecture](../posts/echo_architecture.png)

### カスタムエラーハンドリング

- Echoではカスタムエラーハンドリングを設定することができる。

  ```go
  func CustomHTTPErrorHandler(err error, c echo.Context) {
    var code int
    var message string

    // errが*echo.HTTPError型かどうかをチェック
    if he, ok := err.(*echo.HTTPError); ok {
      code = he.Code
      if m, ok := he.Message.(string); ok {
        message = m
      } else {
        message = http.StatusText(he.Code)
      }
    } else {
      code = http.StatusInternalServerError
      message = "Internal Server Error"
    }

    // クライアントに返す前にエラーログを記録する
    c.Logger().Errorf("Error: %v, Status code: %d, Request: %s %s", err, code, c.Request().Method, c.Request().URL)

    // レスポンスがクライアントに送信されていない場合のみ、エラーレスポンスを送信
    if !c.Response().Committed {
      c.JSON(code, map[string]interface{}{
        "error":       message,
        "description": http.StatusText(code),
      })
    }
  }
  ```

- 途中でLoggerを使用してキャッチしたエラーをログに出力しており、意図しないAPIが下記のようにログに出力される。

  ```bash
  {"time":"2024-10-17T09:12:07.580648466+09:00","level":"ERROR","prefix":"echo","file":"error_handler.go","line":"27","message":"Error: code=404, message=The post with ID 20 was not found., Status code: 404, Request: GET /v1/api/detail/20"}
  ```

### ミドルウェアの使用

- main.goでは下記のようにミドルウェアを使用している。

  ```go
  e.Use(middleware.RequestID()) // リクエストごとの一意のIDを生成
  e.Use(middleware.Logger())    // ロギング
  e.Use(middleware.Recover())   // パニック時のリカバリ
  e.Use(middleware.Gzip())      // Gzip圧縮
  ```

- `middleware.RequestID()` .. リクエストごとに一意のIDを生成する。
- `middleware.Logger()` .. リクエストのログを出力する。
  ```bash
  {"time":"2024-10-17T09:12:07.580712876+09:00","id":"JtKwEToEIAKOZwhrPsxENLQrbmdxPoDo","remote_ip":"::1","host":"localhost:1323","method":"GET","uri":"/v1/api/detail/20","user_agent":"PostmanRuntime/7.42.0","status":404,"error":"code=404, message=The post with ID 20 was not found.","latency":254746,"latency_human":"254.746µs","bytes_in":52,"bytes_out":73}
  ```
  - `"id":"JtKwEToEIAKOZwhrPsxENLQrbmdxPoDo"`のようにRequestIDが出力されることで、各リクエストに一意のIDを付与し、リクエストのトラッキングを容易にすることができる
  - Loggerを設定することで、リクエストのログを出力することができる。
- `middleware.Recover()` .. パニックが発生した際、サーバーをクラッシュさせずにエラーレスポンスを返すためのミドルウェアで、これにより、予期しないエラーによるサーバー停止を防ぐことができる。
- `middleware.Gzip()` .. レスポンスをGzipで圧縮する。
  - 例えば、`localhost:1323/v1/api/list`にリクエストした際に、このミドルウェアを使用していない場合は下記Headerが確認できる。
    ![echo_no_gzip](../posts/echo_no_gzip.png)
  - 一方、`localhost:1323/v1/api/list`にリクエストした際に、このミドルウェアを使用している場合は下記Headerが確認でき、`Content-Encoding: gzip`が追加され、`Content-Length`が短縮されていることが確認できる。
    ![echo_gzip](../posts/echo_gzip.png)

### 実行と確認方法

```bash
go run main.go
```

- GET `http://localhost:1323/v1/api/list` .. 一覧取得
- GET `http://localhost:1323/v1/api/detail/1` .. ID=1の詳細取得
- POST `http://localhost:1323/v1/api/create` .. データの作成
  ```bash
  {
      "title": "create title 11",
      "content": "create content 11"
  }
  ```
- PUT `http://localhost:1323/v1/api/update/1` .. ID=1のデータを更新
  ```bash
  {
      "title": "update title1",
      "content": "update content1"
  }
  ```
- DELETE `http://localhost:1323/v1/api/delete/1` .. ID=1のデータを削除

### テスト

- `/controllers/post_controller_test.go`にテストコードを記述。
- テスト実行

  ```bash
  cd echo-practice

  go test -v ./...
  ?       echo-practice   [no test files]
  ?       echo-practice/errors    [no test files]
  ?       echo-practice/models    [no test files]
  ?       echo-practice/repositories/db   [no test files]
  ?       echo-practice/routers   [no test files]
  ?       echo-practice/repositories/mock [no test files]
  === RUN   TestSuccessGetPostDetail
  --- PASS: TestSuccessGetPostDetail (0.00s)
  === RUN   TestSuccessGetPosts
  --- PASS: TestSuccessGetPosts (0.00s)
  === RUN   TestSuccessCreatePost
  --- PASS: TestSuccessCreatePost (0.00s)
  === RUN   TestSuccessUpdatePost
  --- PASS: TestSuccessUpdatePost (0.00s)
  === RUN   TestSuccessDeletePost
  --- PASS: TestSuccessDeletePost (0.00s)
  PASS
  ok      echo-practice/controllers       0.002s
  ```

### まとめ

- 今回はEchoを用いてREST APIを作成しました。
- 利用してみての感想としてドキュメントがシンプルでわかりやすかったです。特にミドルウェアやカスタムエラーハンドリング、ロギングの設定が簡単にできるのが良いと感じました。
- また、今回はEchoを利用しつつ、データベースへのアクセスパターンをRepositoryパターンで実装し、DIを導入することで、コントローラとリポジトリの依存関係を疎結合にすることができたので良い経験となりました。

### 参考

- [echo Docs](https://echo.labstack.com/docs)
- [echo CRUD Cookbook](https://echo.labstack.com/docs/cookbook/crud)
