---
title: 'oapi-codegen'
date: '2024-10-24'
tags: ['Golang','OpenAPI']
---

### はじめに
* 以前にOpenAPIを元にGinでAPIサーバを作成した([003_gin](./003_gin))
* そのときは、OpenAPIのyamlファイルを元に手動でコードを書いていたが、oapi-codegenを使って自動生成する方法を試してみる。
* 自動生成するツールにopenapi-generatorもあるが、javaのインストールが必要で面倒なので、oapi-codegenを使う。

### Quick Start
* OpenAPIのyamlファイルは[002_openapi](./002_openapi)で作成したものを使用する。
1. oapi-codegenのインストール
    ```bash
    # for the binary install
    go install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest
    ```

2. configを読み込み、Gin用のコードを生成
    ```bash
    mkdir go-oapi-codegen && cd go-oapi-codegen
    mkdir api doc
    vim ./doc/config.yaml
    ```
    ```yaml
    package: api
    generate:
    gin-server: true
    models: true
    embedded-spec: true
    output: ./api/interface.go # 出力先
    ```
    ```bash
    oapi-codegen -config ./doc/config.yaml ./doc/openapi.yaml
    # ./api/interface.go に生成されていることを確認
    ```

3. 不足モジュールをインストール
    * oapi-codegenでGinが必要になるため。
    ```bash
    go mod tidy
    tree
    # .
    # ├── config.yaml
    # ├── api
    # │   └── interface.go
    # ├── go.mod
    # ├── go.sum
    # └── openapi.yaml
    ```
4. interfaceを実装
    * 生成されたコードには、interfaceが定義されているので、それを実装する。
    ```bash
    vim ./api/impl.go
    ```
    ```go
    package api

    import (
        "net/http"

        "github.com/gin-gonic/gin"
    )

    type Server struct{}

    func NewServer() Server {
        return Server{}
    }

    func (Server) GetDetailId(ctx *gin.Context, id int) {
        // PostsからIDが一致する投稿を取得
        for _, post := range Posts {
            if post.ID == id {
                ctx.JSON(http.StatusOK, post)
                return
            }
        }

        // IDが一致する投稿が見つからなかった場合
        ctx.JSON(http.StatusNotFound, gin.H{
            "message": "Not Found",
        })
    }

    func (Server) GetList(ctx *gin.Context, params GetListParams) {
        // Postsを返す
        ctx.JSON(http.StatusOK, Posts)
    }

    func (Server) PostCreate(ctx *gin.Context) {
        // リクエストボディを取得
        var req PostCreateJSONRequestBody
        if err := ctx.ShouldBindJSON(&req); err != nil {
            ctx.JSON(http.StatusBadRequest, gin.H{
                "error": "Invalid request",
            })
            return
        }

        // 新しい投稿を作成
        var newPost Post
        newPost.ID = len(Posts) + 1
        newPost.Title = req.Title
        newPost.Content = req.Content
        Posts = append(Posts, newPost)

        ctx.JSON(200, newPost)
    }

    func (Server) DeleteDeleteId(ctx *gin.Context, id int) {
        // IDが一致する投稿を削除
        for i, post := range Posts {
            if post.ID == id {
                Posts = append(Posts[:i], Posts[i+1:]...)
                ctx.JSON(200, gin.H{
                    "message": "Post deleted",
                })
                return
            }
        }

        // IDが一致する投稿が見つからなかった場合
        ctx.JSON(http.StatusNotFound, gin.H{
            "message": "Not Found",
        })
    }

    func (Server) PutUpdateId(ctx *gin.Context, id int) {
        // リクエストボディを取得
        var req PutUpdateIdJSONRequestBody
        if err := ctx.ShouldBindJSON(&req); err != nil {
            ctx.JSON(http.StatusBadRequest, gin.H{
                "error": "Invalid request",
            })
            return
        }

        // IDが一致する投稿を更新
        for i, post := range Posts {
            if post.ID == id {
                Posts[i].Title = req.Title
                Posts[i].Content = req.Content
                ctx.JSON(200, Posts[i])
                return
            }
        }

        // IDが一致する投稿が見つからなかった場合
        ctx.JSON(http.StatusNotFound, gin.H{
            "message": "Not Found",
        })
    }
    ```

5. エントリーポイントを作成
    ```go
    vim main.go
    ```
    ```go
    package main

    import (
        "go-oapi-codegen/api"

        "github.com/gin-gonic/gin"
    )

    func main() {
        server := api.NewServer()

        r := gin.Default()

        // GinServerOptions で BaseURL を設定
        options := api.GinServerOptions{
            BaseURL: "/api/v1",
        }

        // 生成されたハンドラを Gin に登録 (BaseURL オプションを使用)
        api.RegisterHandlersWithOptions(r, server, options)

        r.Run(":8080")
    }
    ```
6. サーバを起動
    ```bash
    go run main.go
    ```
    * http://localhost:8080/api/v1/list などのエンドポイントにアクセスして動作確認

* 最終的なディレクトリ構成
    * [GitHub リポジトリ](https://github.com/ys39/oapi-codegen-practice) 今回のコードはここにまとめた。
    ```bash
    tree
    # .
    # ├── Makefile # スクリプト
    # ├── api
    # │   ├── impl.go # interfaceの実装
    # │   ├── interface.go # oapi-codegenで生成されたコード
    # │   └── mockdb.go # モックデータ
    # ├── bin
    # │   └── server # サーバのバイナリ(ビルド結果)
    # ├── doc
    # │   ├── config.yaml # oapi-codegenの設定ファイル
    # │   └── openapi.yaml # OpenAPIのyamlファイル
    # ├── go.mod
    # ├── go.sum
    # └── main.go # エントリーポイント
    ```

### まとめ
* 今回はoapi-codegenを使ってOpenAPIからGinのAPIサーバを自動生成してみた。
* 生成されたコードは、実装する部分が分離されているため、実装部分だけを書くことでAPIサーバを作成できるので保守性が高く、利用しやすかった。
* 利用する際には、`RegisterHandlers`や`RegisterHandlersWithOptions`にinterfaceを実装したStructを渡せばいいので、impl.goをRealDB, MockDBで切り替えることも容易にできる。

### 参考
- [oapi-codegen](https://github.com/oapi-codegen/oapi-codegen?tab=readme-ov-file)
