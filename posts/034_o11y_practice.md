---
title: 'OpenTelemetryでの計装を試す'
date: '2025-04-13'
tags: ['observability', 'OpenTelemetry', 'Gin', 'Golang', 'Jaeger']
isOpen: true
---
### はじめに
- [OpenTelemetryへ入門](./032_o11y)でOpenTelemetryの概要を学んだ
- [トレース(Jaeger) 入門](./033_o11y_jaeger)でテレメトリデータとして出力するトレースの可視化の方法を学んだ
- 次は実際に自身でコードを記載し、そこに計装を行い、テレメトリデータを収集してみる。そこでどのような情報をアタッチすればよいか、どのような情報が出力されるのかを確認する

### OpenTelemetryでの計装
* 既存のコードに対して、テレメトリデータ(トレース、メトリクス、ログ)を収集できるようにすることを計装(Instrumentation)と呼称される
- サンプルとしてGinを利用したWeb APIサーバを用意し、そこに計装を行う
- 計装を行うために利用するライブラリは[open-telemetry GitHub](https://github.com/open-telemetry/opentelemetry-go-contrib/tree/main/instrumentation/github.com/gin-gonic/gin/otelgin)で公開されており、これを参考にして実装を行う
- 計装により出力されるトレース情報は、Jaegerを利用して可視化する

### 作成したもの
- 実際に作成したものは[Github](https://github.com/ys39/gin-otel)に公開しています
- OpenTelemetryの計装を行ったWeb APIサーバと、JaegerのDockerコンテナを起動し、`localhost:8080/users/1`にアクセスすることで、計装されたトレース情報を確認できる
- Web APIサーバでは、`/users/:id`のエンドポイントに対して、ユーザ情報を取得するREST APIを実装しており、内部ではusersテーブルとuser_detailsテーブルから情報を取得して、json形式で返却する
- 計装箇所は、ハンドラー、リポジトリ、レンダラーの3箇所に分けて実装。DB操作のトレース情報を取得する際にサービス層かリポジトリ層かで悩んだが、リポジトリ層で計装を行っており、理由は下記の通り
    1. 責務の分離
        - Service層はビジネスロジックをまとめる責務を持ち、DB操作の詳細には本来依存しない（抽象化されたリポジトリインターフェースを呼ぶだけ）
        - DB操作の実装詳細を知っているのはリポジトリ層なので、その層でクエリのトレースを取得するのが自然

    2. 細かいクエリの可視化
        - 「どのSQLを実行したか」「どんな引数を与えたか」などは、リポジトリ層が一番近い情報源
        - リポジトリ層でトレースを記録することで、クエリごとのスパンを細かく管理しやすくなる

    3. 拡張の容易さ
        - 仮に別のDBや外部APIなどに置き換えた場合も、リポジトリ層を差し替えるだけでOK
        - その際のトレーシングも、リポジトリ層に埋め込まれていれば置き換えが容易

### 実際のトレース情報
下記が実際出力されるトレース情報である。1つのトレースに対して、複数のスパンが存在し、そのスパン毎にスパンに関する情報を付与し出力されていることがわかる
![Jaegerのトレース情報](../posts/gin-otel2.png)

### アタッチできる情報
上記の図でわかる通り、JaegerではTags(OpenTelemetryではAttributes)と呼ばれる情報と、Process(OpenTelemetryではResource)と呼ばれる情報をアタッチすることができる

#### Attributes
- 主に Span に付与するキーと値（Key-Value）のペア
- たとえば「http.method=GET」「user.id=12345」のように、アプリケーションやリクエストに関するメタデータを表現できる
- Jaeger で言うところの「タグ（Tags）」に相当し、観測データを詳細に分析したり検索したりするときに役立つ情報となる

#### Resource
- 収集されるすべての観測データ（Span やメトリクスなど）がどのような環境やサービスから生成されたかを示すための情報
- たとえば「service.name=my-service」「host.name=host123」「deployment.environment=production」のようなキー・バリューを格納
- Jaeger では「Process（プロセス情報）」として、サービスやホスト名を指定するイメージに近く、OpenTelemetry ではこの「Resource」を使って “どのサービス (or ホスト、コンテナ、クラウド環境など) が Span を生成したのか” を共通的に示す

### 今回の計装のポイント
- 基本的にAttributesもResourceもセマンティック規約（[Semconv v1.24.0](https://pkg.go.dev/go.opentelemetry.io/otel@v1.35.0/semconv/v1.24.0)）に従って実装している。
- 一方でセマンティック規約には無いが、サービス的に出力したほうがいい情報は`attribute.String`のようにカスタム属性として出力している

#### Resourceの設定

```go
resource := resource.NewWithAttributes(
    semconv.SchemaURL,
    semconv.ServiceNameKey.String(cfg.OtelServiceName),
    semconv.ServiceVersionKey.String(cfg.OtelServiceVersion),
    semconv.ServiceInstanceIDKey.String(hostname),
    semconv.DeploymentEnvironmentKey.String(cfg.OtelDeploymentEnv),
    semconv.TelemetrySDKNameKey.String(cfg.OtelSDKName),
    semconv.TelemetrySDKLanguageKey.String(cfg.OtelSDKLanguage),
    semconv.TelemetrySDKVersionKey.String(cfg.OtelSDKVersion),
)
```
- **semconv.SchemaURL**
    - これらの属性がどの “スキーマ” に従ったものかを示す。OpenTelemetry のセマンティック規約（Semantic Conventions）に準拠している、というメタ情報として利用される
    - 今回は `https://opentelemetry.io/schemas/1.24.0` を指定している

- **ServiceName** / **ServiceVersion** / **ServiceInstanceID**
    - ServiceNameKey: そのサービス（アプリケーション）の論理名（例: "payment-service"）
    - ServiceVersionKey: そのサービスのバージョン（例: "1.2.3"）
    - ServiceInstanceIDKey: 個別のインスタンスを示すユニークID（例: ホスト名やコンテナ ID など）. これらはトレースやメトリクスを見たときに、どのサービスのどのインスタンスがデータを出力したかを識別するのに重要

- **DeploymentEnvironmentKey**
    - デプロイ環境を表す属性です（例: "production" / "staging" / "development" など）

- **TelemetrySDKName** / **TelemetrySDKLanguage** / **TelemetrySDKVersion**
    - Telemetry（OpenTelemetry）SDK 自体の情報を埋め込む。後々トレースを解析するときに、「どういうSDKから送られたトレースなのか」「言語は何か」などを判別する手がかりになる


#### Attributes(ハンドラー)の設定
```go
// OpenTelemetry のスパンを開始
ctx, span := instrumentation.TracerAPI.Start(c.Request.Context(), "GetUser", oteltrace.WithSpanKind(oteltrace.SpanKindServer))
defer span.End()

// スキーム情報を正確に取得
scheme := c.Request.Header.Get("X-Forwarded-Proto")
if scheme == "" {
    if c.Request.TLS != nil {
        scheme = "https"
    } else {
        scheme = "http"
    }
}

// HTTPリクエスト関連の属性を設定
span.SetAttributes(
    semconv.HTTPMethodKey.String(c.Request.Method),
    semconv.URLFullKey.String(scheme+"://"+c.Request.Host+c.Request.URL.Path),
    semconv.URLPathKey.String(c.Request.URL.Path),
    semconv.HTTPUserAgentKey.String(c.Request.UserAgent()),
    semconv.HTTPRequestContentLengthKey.Int64(c.Request.ContentLength),
    semconv.URLSchemeKey.String(scheme),
)

// パスパラメータから ID を取得
id, err := strconv.Atoi(c.Param("id"))
if err != nil {
    instrumentation.RecordError(span, err)
    JSON(c, ctx, http.StatusBadRequest, gin.H{"error": "invalid user id"})
    return
}

// スパンにユーザー ID をセット
span.SetAttributes(
    attribute.String("user.id", strconv.Itoa(id)),
    semconv.HTTPRouteKey.String("/users/:id"),
)
```
- **HTTPMethodKey** 
    - HTTP のメソッド（GET / POST など）をスパン属性として記録

- **URLFullKey**
    - リクエストされた URL 全体を設定

- **URLPathKey**
    - URL のパス部分のみを設定

- **HTTPUserAgentKey**
    - User-Agent（クライアント情報）を設定

- **HTTPRequestContentLengthKey**
    - リクエストボディのサイズを属性として入れる
    - 大量データを送信していないかなどの分析に役立つ

- **URLSchemeKey**
    - プロトコルスキーマ（http / https など）を設定

- **user.id**
    - ユーザー ID をカスタム属性として追跡可能にする

- **HTTPRouteKey**
    - 実際のリクエストパスではなく、ルーティング定義のパターンを記録
    - OpenTelemetry の HTTP セマンティック規約上、 "http.route" を設定しておくとリクエスト集計の観点で役立つ

#### Attributes(リポジトリ)の設定
```go
_, span := instrumentation.TracerDB.Start(ctx, "MockDB.GetUser", trace.WithSpanKind(trace.SpanKindClient))
span.SetAttributes(
    semconv.DBSystemKey.String(m.cfg.DBMockSystem),
    semconv.DBStatementKey.String("SELECT * FROM users WHERE id=?"),
    semconv.DBOperationKey.String("SELECT"),
    semconv.DBNameKey.String(m.cfg.DBName),
    semconv.DBSQLTableKey.String("users"),
    attribute.String("db.users.id", strconv.Itoa(id)),
)
defer span.End()
```
- **DBSystemKey**
    - DBの種類を示す属性（例: "mysql" / "postgresql" など）

- **DBStatementKey**
    - 実行した SQL ステートメントを記録する属性

- **DBOperationKey**
    - 実行した DB 操作の種類（例: "SELECT" / "INSERT" など）

- **DBNameKey**
    - データベース名を示す属性

- **DBSQLTableKey**
    - SQL ステートメントで操作したテーブル名を示す属性

- **db.users.id**
    - ユーザー ID を示すカスタム属性    

#### Attributes(renderer)の設定
```go
_, span := instrumentation.TracerRenderer.Start(ctx, "gin.renderer.json", oteltrace.WithSpanKind(oteltrace.SpanKindInternal))
span.SetAttributes(
    semconv.HTTPResponseStatusCodeKey.Int(code),
    attribute.String("response.type", "json"),
    attribute.String("response.content_type", "application/json"),
)
defer span.End()
```
- **HTTPResponseStatusCodeKey**
    - HTTP レスポンスのステータスコードを示す属性
- **response.type**
    - レスポンスのタイプを示すカスタム属性（例: "json" / "html" など）
- **response.content_type**
    - レスポンスの Content-Type を示すカスタム属性（例: "application/json" / "text/html" など）

### まとめ
- 今回は OpenTelemetry を使った計装手法と、Gin を用いた Web API サーバでどのように情報（属性やリソースなど）を付与すべきかについて学習した
- OpenTelemetry の計装は、アプリケーションのパフォーマンスやエラーを可視化するうえで非常に重要。Attributes や Resource を適切に設定することで、より詳細なトレース情報が得られ、問題の発見や原因追及が容易になることがわかった
- また、セマンティック規約（Semantic Conventions）に従うことで、ツール間やサービス間でのデータ集計・分析がしやすくなり、チームや言語の壁を越えた可観測性の向上につながることを体感できた
- 今後は、メトリクスやログの計装や統合を行ったり、jaeger以外の可視化ツールを試してみたり、より実践的な計装手法を学んでいきたい

### 参考
- https://www.jaegertracing.io/
- https://github.com/open-telemetry/opentelemetry-go
- https://pkg.go.dev/go.opentelemetry.io/otel/semconv
