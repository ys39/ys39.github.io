---
title: 'OpenTelemetryを試す'
date: '2025-04-07'
tags: ['observability', 'OpenTelemetry']
isOpen: false
---
### はじめに
- [OpenTelemetryへ入門](./032_o11y)でOpenTelemetryの概要を学んだので、実際にOpenTelemetryを試してみる
- 取得できるテレメトリデータの内、トレースデータはJaegerを利用して可視化する

### OpenTelemetryを試してみる
* 既存のコードに対して、テレメトリデータ(トレース、メトリクス、ログ)を収集できるようにすることを計装(Instrumentation)と呼称される
- サンプルとしてGinを利用したWeb APIサーバを用意し、そこに計装を行う
- 計装を行うために利用するライブラリは[open-telemetry GitHub](https://github.com/open-telemetry/opentelemetry-go-contrib/tree/main/instrumentation/github.com/gin-gonic/gin/otelgin)で公開されており、これを利用して実装を行う
- 計装により出力されるトレース情報は、Jaegerを利用して可視化する

### Jaegerとは
- 分散トレーシングのためのオープンソースツール


### OpenTelemetryのサンプルを実行
- 下記のコードを`main.go`として保存し、実行して、標準出力のトレース情報を確認する

```go
package main

import (
	"context"
	"html/template"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	stdout "go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	"go.opentelemetry.io/otel/propagation"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	oteltrace "go.opentelemetry.io/otel/trace"
)

// グローバルなトレーサーインスタンスを定義
// このトレーサーを使用して、アプリケーション全体でスパンを作成します
var tracer = otel.Tracer("gin-server")

func main() {
	// OpenTelemetryのトレーサープロバイダーを初期化
	tp, err := initTracer()
	if err != nil {
		log.Fatal(err)
	}
	// アプリケーション終了時にトレーサープロバイダーを適切にシャットダウン
	defer func() {
		if err := tp.Shutdown(context.Background()); err != nil {
			log.Printf("Error shutting down tracer provider: %v", err)
		}
	}()

	// Ginフレームワークの初期化
	r := gin.Default()
	// OpenTelemetry用のミドルウェアを追加
	// このミドルウェアは各HTTPリクエストのトレースを自動的に開始・終了します
	r.Use(otelgin.Middleware("my-server"))

	// HTMLテンプレートの設定
	tmplName := "user"
	tmplStr := "user {{ .name }} (id {{ .id }})\n"
	tmpl := template.Must(template.New(tmplName).Parse(tmplStr))
	r.SetHTMLTemplate(tmpl)

	// ユーザー情報取得エンドポイントの設定
	r.GET("/users/:id", func(c *gin.Context) {
		id := c.Param("id")
		// getUser関数内でトレースが追加されます
		name := getUser(c, id)
		// otelgin.HTMLは通常のc.HTMLと同様ですが、OpenTelemetryの属性を追加します
		otelgin.HTML(c, http.StatusOK, tmplName, gin.H{
			"name": name,
			"id":   id,
		})
	})

	// サーバーを8080ポートで起動
	_ = r.Run(":8080")
}

// initTracerはOpenTelemetryのトレーサープロバイダーを初期化する関数
func initTracer() (*sdktrace.TracerProvider, error) {
	// 標準出力へトレース情報をエクスポートするエクスポーターを作成
	// 実運用では、Jaeger、Zipkinなどの分散トレースシステムへ送信するエクスポーターを使用します
	exporter, err := stdout.New(stdout.WithPrettyPrint())
	if err != nil {
		return nil, err
	}

	// トレーサープロバイダーを作成
	tp := sdktrace.NewTracerProvider(
		// すべてのリクエストをサンプリング（運用環境では適切なサンプリング設定が必要）
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		// バッチ処理でエクスポーターにトレースを送信
		sdktrace.WithBatcher(exporter),
	)

	// グローバルなトレーサープロバイダーとして設定
	otel.SetTracerProvider(tp)
	// トレースコンテキストの伝播を設定（分散トレーシングで重要）
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))
	return tp, nil
}

// getUserはユーザーIDからユーザー名を取得する関数
func getUser(c *gin.Context, id string) string {
	// GinのコンテキストからHTTPリクエストのコンテキストを取得し、新しいスパンを開始
	// この関数内の処理が個別のトレースとして記録されます
	_, span := tracer.Start(c.Request.Context(), "getUser", oteltrace.WithAttributes(attribute.String("id", id)))
	// 関数終了時にスパンを終了
	defer span.End()

	// 簡易的なユーザーID判定
	if id == "123" {
		return "otelgin tester"
	}
	return "unknown"
}
```

### まとめ

### 参考
- https://www.jaegertracing.io/
