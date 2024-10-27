---
title: 'OpenAPIへ入門'
date: '2024-10-01'
tags: ['入門', 'OpenAPI']
---

### はじめに

- これまでにAPI設計は経験があったのですが、OpenAPIについては知識がなかったため、学習しました。

### OpenAPIとは

- [OpenAPI仕様](https://swagger.io/docs/specification/v3_0/about/)
- OpenAPIは、REST APIを記述するためのフォーマットであり、APIのエンドポイント、操作、パラメータ、認証方法などを定義できる。仕様はYAMLまたはJSONで記述可能で、人間にも機械にも読みやすい形式。
- Swaggerは、OpenAPI Specificationを活用したオープンソースツール群で、APIの設計、構築、ドキュメント化、消費をサポートする。主要なツールには、Swagger Editor（API定義の作成）、Swagger UI（インタラクティブなドキュメント生成）、Swagger Codegen（サーバースタブやクライアントライブラリの生成）などがある。
- OpenAPIを使うことで、APIの構造を自己記述でき、API開発の効率を高めることが可能。設計からクライアントライブラリの生成、インタラクティブなドキュメント作成、自動テストの作成などに役立つ。

### 学習方法について

- サンプルでBBSを作成することを目標として、それに必要なAPIを設計し、OpenAPI仕様で記述することで、OpenAPIの基本を学びました。
- vscodeの拡張機能であるOpenAPI(Swagger) Editorを使って、OpenAPI仕様をプレビューしながら学習しました。

### BBSに必要なAPI

- 投稿一覧取得API
  - Method: GET
  - Path: /api/list
  - Description: 投稿一覧を取得する
  - GETパラメータ: page: ページ番号, per_page: 1ページあたりの表示数
- 投稿の詳細取得API
  - Method: GET
  - Path: /api/detail/{id}
  - Description: 投稿の詳細を取得する
- 投稿の作成API
  - Method: POST
  - Path: /api/create
  - Description: 投稿を作成する
  - POSTパラメータ: title, content
- 投稿の削除API
  - Method: DELETE
  - Path: /api/delete/{id}
  - Description: 投稿を削除する
- 投稿の更新API
  - Method: PUT
  - Path: /api/update/{id}
  - Description: 投稿を更新する
  - POSTパラメータ: title, content

### APIのエラーレスポンス

- エラーレスポンスは、以下の形式で返すこととする。
  - code: エラーコード
  - message: エラーメッセージ
  - detail: エラーの詳細

### OpenAPIの設計

- 上記のAPIをOpenAPI仕様で設計しました。

```yaml
openapi: 3.0.0
info:
  title: BBS API
  version: 1.0.0
  description: BBSに関連するAPIの仕様

servers:
  - url: http://localhost:8080/v1/api
    description: ローカル開発環境
  - url: https://api.example.com/v1/api
    description: ステージング環境

components:
  schemas:
    ErrorResponse:
      type: object
      properties:
        code:
          type: integer
          example: 400
        message:
          type: string
          example: 'Invalid request parameters'
        detail:
          type: string
          example: "The 'id' parameter must be a positive integer."
    NotFoundResponse:
      type: object
      properties:
        code:
          type: integer
          example: 404
        message:
          type: string
          example: 'Resource not found'
        detail:
          type: string
          example: 'The post with ID 123 was not found.'

paths:
  /list:
    get:
      summary: 投稿一覧を取得する
      description: 投稿の一覧を取得するためのAPI
      tags:
        - posts
      parameters:
        - in: query
          name: page
          schema:
            type: integer
          required: true
          description: ページ番号
        - in: query
          name: per_page
          schema:
            type: integer
          required: true
          description: 1ページあたりの表示数
      responses:
        '200':
          description: 成功時のレスポンス
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                    title:
                      type: string
                    content:
                      type: string
        '400':
          description: 不正なリクエスト
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /detail/{id}:
    get:
      summary: 投稿の詳細を取得する
      description: 指定された投稿の詳細を取得する
      tags:
        - posts
      parameters:
        - in: path
          name: id
          schema:
            type: integer
          required: true
          description: 投稿のID
      responses:
        '200':
          description: 成功時のレスポンス
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                  title:
                    type: string
                  content:
                    type: string
        '404':
          description: 投稿が見つからなかった場合
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NotFoundResponse'

  /create:
    post:
      summary: 投稿を作成する
      description: 新しい投稿を作成する
      tags:
        - posts
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - title
                - content
              properties:
                title:
                  type: string
                content:
                  type: string
      responses:
        '201':
          description: 投稿が正常に作成された場合
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                  title:
                    type: string
                  content:
                    type: string
        '400':
          description: 入力データが不正な場合
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /delete/{id}:
    delete:
      summary: 投稿を削除する
      description: 指定された投稿を削除する
      tags:
        - posts
      parameters:
        - in: path
          name: id
          schema:
            type: integer
          required: true
          description: 削除する投稿のID
      responses:
        '200':
          description: 投稿が正常に削除された場合
        '404':
          description: 投稿が見つからなかった場合
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NotFoundResponse'

  /update/{id}:
    put:
      summary: 投稿を更新する
      description: 指定された投稿を更新する
      tags:
        - posts
      parameters:
        - in: path
          name: id
          schema:
            type: integer
          required: true
          description: 更新する投稿のID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - title
                - content
              properties:
                title:
                  type: string
                content:
                  type: string
      responses:
        '200':
          description: 投稿が正常に更新された場合
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                  title:
                    type: string
                  content:
                    type: string
        '400':
          description: 入力データが不正な場合
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: 投稿が見つからなかった場合
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NotFoundResponse'
```

### OpenAPIを利用してみて

- OpenAPI仕様でAPIを設計することで、APIドキュメントも生成できるため、開発者間での共有が楽になる。
- OpenAPI内のServer Objectを利用することで、開発環境やステージング環境など、複数の環境に対応したAPIドキュメントを作成でき、そこでのAPIの挙動を確認できる。
- OpenAPI内のComponents -> Schemaで、エラーレスポンスのスキーマを定義することで、エラーレスポンスの形式を統一し、効率的にAPIを設計できる。
- OpenAPI内のtagsで、APIをカテゴリ分けすることで、APIの機能や目的を明確にし、APIドキュメントの見やすさを向上させることができる。

### まとめ

- OpenAPI仕様をサンプルのBBSで設計することで学ぶことができました。
