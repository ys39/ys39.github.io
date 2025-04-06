---
title: 'トレース(Jaeger) 入門'
date: '2025-04-06'
tags: ['Jaeger', 'OpenTelemetry', 'observability']
isOpen: true
---
### はじめに
- [OpenTelemetryへ入門](./032_o11y)でOpenTelemetryの概要を学んだ
- 次は一歩踏み込んでテレメトリーデータのトレースについて、その収集や可視化がどのように行われているかを調査する
- 今回はOpenTelemetryをコードの計装で活用するので、親和性を考えてオープンソースツールであるJaegerを利用する

### Jaegerとは
- マイクロサービスをはじめとした分散システムのトレース情報を収集・可視化・分析するためのオープンソースツール
- CNCF(Cloud Native Computing Foundation)傘下のプロジェクトで、OpenTracingやOpenTelemetryとの親和性が高い

### トレースはどのように機能するか
トレースがどのように機能するのかについては、[メトリクス、ログ、トレース、イベントとは？違いを解説](https://newrelic.com/jp/blog/how-to-relic/metrics-events-logs-and-traces)に分かりやすい説明があったので、そちらを以下に転載する

> トレースは「スパン」と呼ばれる特別なイベントを形成します。スパンは、単一トランザクションのマイクロサービスエコシステムを通じて因果連鎖を追跡するのに役立ちます。これを実現するために各サービスは相互に「トレースコンテキスト」と呼ばれる相関識別子を渡します。このトレースコンテキストはスパンに属性を追加するために使用されます。したがって、クレジットカードトランザクションのスパンで構成される分散トレースの例は次のようになります。
![trace1](../posts/trace1.jpg)

上記の表を見れば、トレースがスパンと呼ばれる単一トランザクションの連鎖から形成されることが明らかであり、大体どのように機能しているのかがわかると思う

### トレースとスパンの定義
トレースとスパンの定義については以下の通り
* **トレース**
    * 概要: 1つのリクエスト（もしくは1つの処理の流れ）を表すエンドツーエンドの処理履歴。
    * 構成要素: 複数のSpansから構成され、それらのスパンが階層や時間の流れに従って関連づけられる。

* **スパン**
    * 概要: Traceを構成する最小の単位。各スパンは処理（Operation）の名前、開始時刻、終了時刻などの情報を持つ。
    * 相互関係: 一つの親スパンが子スパンを生成する形で階層構造を形成する（ChildOf関係）。または、単純な後続（FollowsFrom）関係を持つ場合もある。

[Jaeger Terminology](https://www.jaegertracing.io/docs/2.4/terminology/)より、トレースとスパンの図は以下のイメージ
![jaeger-terminology](../posts/jaeger1.png)

### JaegerのQuick Start
[JaegerのQuick Start](https://www.jaegertracing.io/docs/2.4/getting-started/)を参考に、JaegerをDockerで立ち上げてみる
```bash
docker run --rm --name jaeger \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 5778:5778 \
  -p 9411:9411 \
  jaegertracing/jaeger:2.4.0
```
上記のコマンドを実行すると、以下のようにJaegerのWeb UIが`http://localhost:16686`で立ち上がる
![jaeger-web-ui](../posts/jaeger2.png)
JaegerのWeb UIではトレース情報に対してサービス毎、オペレーション毎にフィルタリングが可能で、トレースの詳細情報を確認することができる。
ちなみにここで利用しているポートについては、[Jaegerのポート一覧](https://www.jaegertracing.io/docs/2.4/apis/)にまとめられており、以下のような役割を持っている
| ポート番号 | プロトコル | 説明 |
| --- | --- | --- |
| 5778 | HTTP |リモートサンプリングのエンドポイント(/sampling) |
| 4317 | gRPC | OpenTelemetry Protocol (OTLP)の受信ポート |
| 4318 | HTTP | OpenTelemetry Protocol (OTLP)の受信ポート |
| 9411 | HTTP | Zipkinの受信ポート |
| 16686 | HTTP | Jaeger UIのポート |

### HotR.O.D. Demo
実際にトレースを確認することができるデモも用意してあるので、そちらも確認する   
HotR.O.D. (Rides on Demand) は、複数のマイクロサービスで構成されたライドシェアリングのデモアプリケーションで、OpenTelemetryと分散トレーシングの使用例を示している。このデモを利用することで実際にトレース情報がどのように収集され、Jaegerで可視化されるかを確認することができる
1. HotRODを起動
    ```bash
    git clone https://github.com/jaegertracing/jaeger.git jaeger
    cd jaeger/examples/hotrod
    docker compose -f docker-compose.yml up
    # press Ctrl-C to exit
    ```
2. HotRODのWeb UI `http://localhost:8080`にアクセス
    
    ![hotrod-web-ui](../posts/hotrod1.png)
    → 4人の顧客がいて、4つのボタンのうちの1つをクリックすることで、車を呼び出し、顧客の場所に到着させるというもの。

3. 1つをクリックすると下記ログがコンソールに表示される
    ```bash
    hotrod-hotrod-1  | 2025-04-06T05:53:30.852Z     INFO    frontend/server.go:96   HTTP request received   {"service": "frontend", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "b85759c9507d9a70", "method": "GET", "url": "/dispatch?customer=731&nonse=0.7153937126932488"}
    hotrod-hotrod-1  | 2025-04-06T05:53:30.852Z     INFO    customer/client.go:36   Getting customer        {"service": "frontend", "component": "customer_client", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "b85759c9507d9a70", "customer_id": 731}
    hotrod-hotrod-1  | 2025-04-06T05:53:30.852Z     INFO    customer/server.go:63   HTTP request received   {"service": "customer", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "784b011534da7c6d", "method": "GET", "url": "/customer?customer=731"}
    hotrod-hotrod-1  | 2025-04-06T05:53:30.852Z     INFO    customer/database.go:65 Loading customer        {"service": "customer", "component": "mysql", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "784b011534da7c6d", "customer_id": 731}
    hotrod-hotrod-1  | 2025-04-06T05:53:30.852Z     INFO    tracing/mutex.go:57     Acquired lock; 0 transactions waiting behind    {"service": "customer", "component": "mysql", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "b39a8df32d334881", "waiters": "[]"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.149Z     INFO    frontend/best_eta.go:67 Found customer  {"service": "frontend", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "b85759c9507d9a70", "customer": {"ID":"731","Name":"Japanese_Desserts","Location":"728,326"}}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.149Z     INFO    driver/client.go:45     Finding nearest drivers {"service": "frontend", "component": "driver_client", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "b85759c9507d9a70", "location": "728,326"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.149Z     INFO    driver/server.go:62     Searching for nearby drivers    {"service": "driver", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "09c5afc9bd19b69b", "location": "728,326"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.170Z     INFO    driver/redis.go:55      Found drivers   {"service": "driver", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "789050bdf4dfadc5", "drivers": ["T787410C", "T734831C", "T715287C", "T771683C", "T707782C", "T781852C", "T736159C", "T770776C", "T745977C", "T735313C"]}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.202Z     ERROR   driver/redis.go:70      redis timeout   {"service": "driver", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "ab9e7cd6de1080cc", "driver_id": "T787410C", "error": "redis timeout"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.202Z     ERROR   driver/server.go:74     Retrying GetDriver after error  {"service": "driver", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "09c5afc9bd19b69b", "retry_no": 1, "error": "redis timeout"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.216Z     INFO    driver/redis.go:74      Got driver's ID {"service": "driver", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "25f63d9ee1ce21a8", "driverID": "T787410C"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.227Z     INFO    driver/redis.go:74      Got driver's ID {"service": "driver", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "4ecbcc83f0cfb470", "driverID": "T734831C"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.238Z     INFO    driver/redis.go:74      Got driver's ID {"service": "driver", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "86943482cecb42e8", "driverID": "T715287C"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.252Z     INFO    driver/redis.go:74      Got driver's ID {"service": "driver", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "d78f411f319b73f2", "driverID": "T771683C"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.285Z     ERROR   driver/redis.go:70      redis timeout   {"service": "driver", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "00eb62197dfd3e87", "driver_id": "T707782C", "error": "redis timeout"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.285Z     ERROR   driver/server.go:74     Retrying GetDriver after error  {"service": "driver", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "09c5afc9bd19b69b", "retry_no": 1, "error": "redis timeout"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.292Z     INFO    driver/redis.go:74      Got driver's ID {"service": "driver", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "4e5f47be610b4261", "driverID": "T707782C"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.303Z     INFO    driver/redis.go:74      Got driver's ID {"service": "driver", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "07192afba5d6471f", "driverID": "T781852C"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.313Z     INFO    driver/redis.go:74      Got driver's ID {"service": "driver", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "7ce32f4e5dba789a", "driverID": "T736159C"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.322Z     INFO    driver/redis.go:74      Got driver's ID {"service": "driver", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "e7917325ad068d9f", "driverID": "T770776C"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.354Z     ERROR   driver/redis.go:70      redis timeout   {"service": "driver", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "7fcf87f7e02e7d78", "driver_id": "T745977C", "error": "redis timeout"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.354Z     ERROR   driver/server.go:74     Retrying GetDriver after error  {"service": "driver", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "09c5afc9bd19b69b", "retry_no": 1, "error": "redis timeout"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.364Z     INFO    driver/redis.go:74      Got driver's ID {"service": "driver", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "ecc86a8b486d1e43", "driverID": "T745977C"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.377Z     INFO    driver/redis.go:74      Got driver's ID {"service": "driver", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "843ed7608d0d5567", "driverID": "T735313C"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.377Z     INFO    driver/server.go:85     Search successful       {"service": "driver", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "09c5afc9bd19b69b", "driver_count": 10, "locations": "[{\"driverID\":\"T787410C\",\"location\":\"816,244\"},{\"driverID\":\"T734831C\",\"location\":\"250,186\"},{\"driverID\":\"T715287C\",\"location\":\"153,167\"},{\"driverID\":\"T771683C\",\"location\":\"928,431\"},{\"driverID\":\"T707782C\",\"location\":\"814,878\"},{\"driverID\":\"T781852C\",\"location\":\"578,161\"},{\"driverID\":\"T736159C\",\"location\":\"569,914\"},{\"driverID\":\"T770776C\",\"location\":\"764,442\"},{\"driverID\":\"T745977C\",\"location\":\"524,862\"},{\"driverID\":\"T735313C\",\"location\":\"992,261\"}]"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.378Z     INFO    frontend/best_eta.go:84 Found drivers   {"service": "frontend", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "b85759c9507d9a70", "drivers": [{"DriverID":"T787410C","Location":"816,244"},{"DriverID":"T734831C","Location":"250,186"},{"DriverID":"T715287C","Location":"153,167"},{"DriverID":"T771683C","Location":"928,431"},{"DriverID":"T707782C","Location":"814,878"},{"DriverID":"T781852C","Location":"578,161"},{"DriverID":"T736159C","Location":"569,914"},{"DriverID":"T770776C","Location":"764,442"},{"DriverID":"T745977C","Location":"524,862"},{"DriverID":"T735313C","Location":"992,261"}]}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.378Z     INFO    route/client.go:36      Finding route   {"service": "frontend", "component": "route_client", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "b85759c9507d9a70", "pickup": "153,167", "dropoff": "728,326"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.378Z     INFO    route/client.go:36      Finding route   {"service": "frontend", "component": "route_client", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "b85759c9507d9a70", "pickup": "816,244", "dropoff": "728,326"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.378Z     INFO    route/client.go:36      Finding route   {"service": "frontend", "component": "route_client", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "b85759c9507d9a70", "pickup": "250,186", "dropoff": "728,326"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.378Z     INFO    route/server.go:67      HTTP request received   {"service": "route", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "46551d35be28ab7c", "method": "GET", "url": "/route?dropoff=728%2C326&pickup=153%2C167"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.378Z     INFO    route/server.go:67      HTTP request received   {"service": "route", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "61b4d71bdf9e1c7a", "method": "GET", "url": "/route?dropoff=728%2C326&pickup=816%2C244"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.378Z     INFO    route/server.go:67      HTTP request received   {"service": "route", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "5338b15d586d71fa", "method": "GET", "url": "/route?dropoff=728%2C326&pickup=250%2C186"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.417Z     INFO    route/client.go:36      Finding route   {"service": "frontend", "component": "route_client", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "b85759c9507d9a70", "pickup": "928,431", "dropoff": "728,326"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.418Z     INFO    route/server.go:67      HTTP request received   {"service": "route", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "228fb73d0a6ff1bf", "method": "GET", "url": "/route?dropoff=728%2C326&pickup=928%2C431"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.429Z     INFO    route/client.go:36      Finding route   {"service": "frontend", "component": "route_client", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "b85759c9507d9a70", "pickup": "814,878", "dropoff": "728,326"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.429Z     INFO    route/server.go:67      HTTP request received   {"service": "route", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "2f26097f42ca52fc", "method": "GET", "url": "/route?dropoff=728%2C326&pickup=814%2C878"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.432Z     INFO    route/client.go:36      Finding route   {"service": "frontend", "component": "route_client", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "b85759c9507d9a70", "pickup": "578,161", "dropoff": "728,326"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.433Z     INFO    route/server.go:67      HTTP request received   {"service": "route", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "c9669dc22265269d", "method": "GET", "url": "/route?dropoff=728%2C326&pickup=578%2C161"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.471Z     INFO    route/client.go:36      Finding route   {"service": "frontend", "component": "route_client", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "b85759c9507d9a70", "pickup": "569,914", "dropoff": "728,326"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.471Z     INFO    route/server.go:67      HTTP request received   {"service": "route", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "e407e2a510ff2a54", "method": "GET", "url": "/route?dropoff=728%2C326&pickup=569%2C914"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.474Z     INFO    route/client.go:36      Finding route   {"service": "frontend", "component": "route_client", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "b85759c9507d9a70", "pickup": "764,442", "dropoff": "728,326"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.475Z     INFO    route/client.go:36      Finding route   {"service": "frontend", "component": "route_client", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "b85759c9507d9a70", "pickup": "524,862", "dropoff": "728,326"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.475Z     INFO    route/server.go:67      HTTP request received   {"service": "route", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "498c91c95092bd38", "method": "GET", "url": "/route?dropoff=728%2C326&pickup=764%2C442"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.475Z     INFO    route/server.go:67      HTTP request received   {"service": "route", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "8746b00314ea0dcb", "method": "GET", "url": "/route?dropoff=728%2C326&pickup=524%2C862"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.520Z     INFO    route/client.go:36      Finding route   {"service": "frontend", "component": "route_client", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "b85759c9507d9a70", "pickup": "992,261", "dropoff": "728,326"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.520Z     INFO    route/server.go:67      HTTP request received   {"service": "route", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "1e2b5e3b87947f19", "method": "GET", "url": "/route?dropoff=728%2C326&pickup=992%2C261"}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.559Z     INFO    frontend/best_eta.go:87 Found routes    {"service": "frontend", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "b85759c9507d9a70", "routes": [{},{},{},{},{},{},{},{},{},{}]}
    hotrod-hotrod-1  | 2025-04-06T05:53:31.559Z     INFO    frontend/best_eta.go:103        Dispatch successful     {"service": "frontend", "trace_id": "2b756e4308b105a59994a7faecc123c3", "span_id": "b85759c9507d9a70", "driver": "T787410C", "eta": "2m0s"}
    ```
4. ログから流れを見る

* 下記の流れで、顧客情報取得 → ドライバー検索 → 経路計算 → ディスパッチ成功という一連の処理が行われていることがわかる

    1. **フロントエンド受信**
        * frontend/server.go:96 が GET /dispatch?customer=731... のリクエストを受け取る。
        * 処理の入口として、トレースIDやスパンIDが割り当てられる。

    2. **顧客情報の取得**
        * customer/client.go:36 で「customerID=731」の顧客情報を取りに行く。
        * customer/server.go:63 も同じくログを出力、MySQLに問い合わせ (customer/database.go:65)。
        * ロックを取得 (tracing/mutex.go:57) し、顧客情報が読み込まれる。

    3. **顧客情報取得完了**
        * frontend/best_eta.go:67 に「顧客 (731) の情報を取得した」とログが出る。

    4. **ドライバー検索**
        * driver/client.go:45 が利用可能なドライバーを探すため driver サービスを呼び出す。
        * driver/server.go:62 で「位置情報(728,326)付近のドライバーを検索している」というログが出る。
        * driver/redis.go:55 で10名のドライバーIDを発見 (Found drivers)。

    5. **ドライバーごとの詳細取得とリトライ**
        * 検索したドライバーの詳細を redis から取ろうとするが、いくつか「redis timeout」が発生 (driver/redis.go:70)。
        * そのたびに driver/server.go:74 で「再試行する」とログが出て、リトライ後は成功 (Got driver's ID)。

    6. **ドライバー情報取得完了**
        * driver/server.go:85 で最終的に10名すべての位置情報が取得できたことをログ出力 (Search successful)。

    7. **ルート(経路)検索**
        * フロントエンドは、各ドライバーの位置から顧客の場所 (728,326) までのルートを route サービスに問い合わせる (route/client.go:36)。
        * route/server.go:67 で各ルート取得のリクエストが受信されたことを確認。

    8. **ルート取得完了**
        * ルートの結果が返り、frontend/best_eta.go:87 で複数のルート情報が一覧でログ出力される。

    9. **ディスパッチ成功**
        * 最終的にドライバー T787410C が選ばれ、ETA(到着予測時間) は “2m0s” とのログ (Dispatch successful) でリクエストが完了。

5. トレースを確認

    下記のようなトレース一覧が表示される
    ![jaeger-trace](../posts/jaeger3.png)

    トレースをクリックすると、スパンの詳細情報が表示される
    ![jaeger-trace2](../posts/jaeger4.png)

    生のログからでもその流れを確認することができるが、トレース情報を可視化することで情報を整理することができ、より理解しやすくなる。

### まとめ
* 今回は、Jaegerを利用した分散トレーシングの基本概念と、トレース情報を可視化する方法について学んだ
* 実際にJaegerのWeb UIを触ってみたところ、トレースやスパン、Operation名を適切に命名しておくことで、Webアプリケーション全体の流れを明確に把握できる強力なツールだと感じた。ただし、詳細な情報がすべて出力されるわけではないため、ログやメトリクスとの併用が望ましい
* トレースの目的は、システム全体の健全性を把握し、問題の根本原因を特定すること(オブザーバビリティのObjectives)にある。今後はコードを実装しつつ、どのような情報を計装すべきか具体的に検証していきたい

### 参考
- https://www.jaegertracing.io/
- https://qiita.com/tamura__246/items/7e22fcc17a09b1c129a2
- https://newrelic.com/jp/blog/how-to-relic/metrics-events-logs-and-traces
- https://aws.amazon.com/jp/what-is/jaeger/
