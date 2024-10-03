---
title: 'NestJSでBFFを構築'
date: '2024-10-03'
---

### はじめに

- フロントエンドとバックエンドを分離して開発した場合に、その間をつなぐAPIが必要となるが、複数のバックエンドが登場した場合に、クライアントが異なるエントリーポイントを持つことになり、管理が煩雑になります。
- このような問題を解決するために、BFF（Backend For Frontend）が存在しており、クライアントはBFFという単一のエントリーポイントを持つことで、複数のバックエンドを利用することができ、管理が簡単になります。
- 個人的にBFFを構築したことがなかったので、NestJSでBFFを構築し、流れなどを学習したいと思います。

### BFFとは

- BFF（Backend For Frontend）は、フロントエンドとバックエンドの間に位置するサーバーサイドのアプリケーションのことで、フロントエンドが必要とするデータを集約して提供するAPI。

### BFFのメリット

- フロントエンド固有の最適化が可能
  - 各フロントエンド（Web、モバイルなど）のニーズに最適化されたAPIを提供できる。
- バックエンドの差異の吸収
  - バックエンドのAPIの差異を吸収し、フロントエンドに統一的なAPIを提供できる。
- フロントエンドとバックエンドの分離
  - フロントエンド、バックエンドのお互いがBFFとの通信を意識すればいいので、それぞれの開発が独立して進められる。

### BFFを実現するには

- BFFを実現するためには、以下のような技術が利用される。
  - Node.js(NestJSやExpressなどのFW)
    - TypeScriptで記述できるため、フロントエンド,バックエンドの開発者が共通の言語で開発できる。
    - BFFはAPIの中継役として複数のバックエンドサービスとやり取りするため、非同期処理が多く発生する。Node.jsのシングルスレッドかつ非ブロッキングな特性はリクエストの並列処理に適している。
    - FWを利用することでREST APIやGraphQL APIを簡単に実装できる。
    - Node.jsはWebSocketをサポートしているため、リアルタイム通信を実現できる。
  - Amazon API Gateway
  - AWS AppSunc
    - [AWS Backends for Frontends パターン](https://aws.amazon.com/jp/blogs/news/backends-for-frontends-pattern/)

* 今回はTypeScriptの学習も兼ねて、以前より気になっていたNestJSを利用してBFFを構築していきます。

### NestJSとは

- 効率的でスケーラブルなNode.jsサーバーサイドアプリケーションを構築するためのフレームワーク
- 基本的な構成要素は下記の通り

  - Controllers
    - コントローラーは、送られてくるリクエストを処理し、クライアントにレスポンスを返す役割を担っている。
  - Providers
    - サービス、リポジトリ、ファクトリー、ヘルパーなど、多くの基本クラスがプロバイダーとして扱われます。プロバイダーは依存関係として注入でき、オブジェクト間の関係をNestランタイムシステムに委任できる。
    - Serviceファイルを作成して、処理・ロジックを記述する。
  - Modules
    - モジュールは、アプリケーションの構造を整理するための基本単位。
    - モジュールはそのモジュールに含まれるControllerやServiceをまとめる。

- データの流れは下記の通り
  ```
  main.ts
  └── app module(root)
      ├── DB
      └── modules
          └── controllers
              └── providers(service)
  ```

### NestJSでBFFを構築

- 大きな効果はないが、BFFを構築する意味で、`フロントエンド - (REST API) - BFF(NestJS) - (REST API) - バックエンド(Gin)`のような流れでデータを行き来できるようにしました。

1. NestJSのプロジェクトを作成

   ```bash
   npm i -g @nestjs/cli
   nest new nest-bff
   ```

2. サンプルを動作

   ```bash
   cd nest-bff
   npm run start:dev

   ※ http://localhost:3000 にアクセスし、Hello World!が表示されればOK
   ```

3. ディレクトリ構成

- [Github](https://github.com/ys39/nest-bff)にソースはアップロード済。
- バックエンドのAPIを呼び出すための最低限の構成を作成しています。
  ```bash
  src
  ├── app.module.ts
  ├── main.ts
  └── modules
      └── posts
          ├── posts.controller.ts
          ├── posts.module.ts
          ├── posts.service.ts
          └── test
              └── posts.controller.spec.ts
  ```

4. Service層について

- コントローラーから呼び出されるService層を作成している。
- Service層では、Ginで作成したAPI(`localhost:8080/v1/api/`)にリクエストを送信し、レスポンスを返す処理を記述しており、返されたデータをコントローラーに返す。

  ```typescript
  import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
  import { HttpService } from '@nestjs/axios';
  import { AxiosResponse } from 'axios';
  import { Observable } from 'rxjs';
  import { map, catchError } from 'rxjs/operators';

  @Injectable()
  export class PostsService {
    private readonly baseUrl = 'http://localhost:8080/v1/api';

    constructor(private readonly httpService: HttpService) {}

    // 投稿一覧取得API
    findAll(page: number, perPage: number): Observable<AxiosResponse<any>> {
      const url = `${this.baseUrl}/list?page=${page}&per_page=${perPage}`;
      return this.httpService.get(url).pipe(
        map((response) => response.data),
        catchError((error) => {
          throw new HttpException(error.response.data, HttpStatus.BAD_REQUEST);
        })
      );
    }
  }
  ```

5. テスト

- `posts.controller.spec.ts`に単体テストを記述しています。
- ここではモックを使ったテストを行っており、バックエンドのAPIを呼び出す統合テストではありません。

6. 確認方法

- Postmanを利用して`http://localhost:3000/posts`にGETリクエストを送信すると、バックエンドのAPI(`localhost:8080/v1/api/list`)にリクエストが送信され、レスポンスが返ってくることを確認しました。
- 他のエンドポイントも同様に確認済です。

### まとめ

- NestJSを利用してBFFを構築してみました。
- 今回はREST APIを利用していますが、GraphQL APIを利用することもでき、そうすることでより柔軟なAPIを提供できるようになるので、今後はそちらを試したいと思います。

### 参考

- [https://baapuro.com/NestJS/one/](https://baapuro.com/NestJS/one/)
- [https://zenn.dev/azunasu/articles/28f797ce2405e7](https://zenn.dev/azunasu/articles/28f797ce2405e7)
