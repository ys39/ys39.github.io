---
title: 'OpenTelemetryを試す'
date: '2025-04-02'
tags: ['OpenTelemetry']
isOpen: false
---
### はじめに

- 

### OpenTelemetryを試してみる
* 既存のコードに対して、テレメトリデータ(トレース、メトリクス、ログ)を収集できるようにすることを計装(Instrumentation)と呼称される
- サンプルとしてGinを利用したWeb APIサーバを用意し、そこに計装を行う
- 計装を行うために利用するライブラリは[open-telemetry GitHub](https://github.com/open-telemetry/opentelemetry-go-contrib/tree/main/instrumentation/github.com/gin-gonic/gin/otelgin)で公開されており、これを利用して実装を行う

### まとめ

### 参考
