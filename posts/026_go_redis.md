---
title: 'GoでRedisを扱う'
date: '2024-10-29'
tags: ['Golang', 'Redis', 'NoSQL']
---

### はじめに
* Redisの基本的な使い方とGo言語からの接続、利用方法について学ぶ。

### Redisとは
* データを key-value ペアとして格納するオープンソースのインメモリデータベース
* メモリ上にデータを保持するが、スナップショットやAOF（Append Only File）によってデータをディスクに保存することも可能。
* データ構造として、strings に加えて、lists、sets、sorted sets、hashes、bit arrays、hyperloglogs をサポートしている。
* レプリケーションやシャーディングをサポートしており、高い可用性とスケーラビリティが実現できる。
* 複数のコマンドを一つのトランザクションとして実行することができる

### Redisを使う環境の構築
1. docker-compose.ymlでRedisを起動する
    ```yaml
    version: "3.8"

    services:
    redis:
        image: redis:latest
        container_name: redis_container
        ports:
        - "6379:6379"
        volumes:
        - ./redis_data:/data
        restart: always

    volumes:
    redis_data:
    ```

2. docker起動
    ```bash
    docker-compose up -d
    ```

3. Redisに接続
    * dockerコンテナのRedisに接続できることを確認した
    ```bash
    sudo apt install redis-tools

    redis-cli
    # 127.0.0.1:6379> ping
    # PONG
    ```

### GoでRedisを扱う(基本操作)
* [go-redis](https://github.com/redis/go-redis) と [rueidis](https://github.com/redis/rueidis) の2つがRedis公式のGo言語用ライブラリとして用意されており、比較的ドキュメントが充実しているgo-redisの方を使ってみる。

1. go-redisのインストール
    ```bash
    mkdir go-redis-practice && cd go-redis-practice
    go mod init go-redis-practice
    go get github.com/redis/go-redis/v9
    ```
2. サンプルコード
    * 下記では、localhost:6379で開かれているRedisに接続し、key-valueの簡単な操作(Stringsに対するSet, Get, Del)を行っている。
    * `Set`や`Del`などの変更操作は、`Err()`メソッドでエラーを取得できる。
    * `Get`などの取得操作は、`Result()`メソッドで結果を取得できる。
    ```go
    package main

    import (
        "context"
        "fmt"

        "github.com/redis/go-redis/v9"
    )

    func main() {

        // 空のコンテキストを作成
        var ctx = context.Background()

        // Redis オプション
        redisOption := redis.Options{
            Addr:     "localhost:6379",
            Password: "", // no password set
            DB:       0,  // use default DB
        }

        // Redisクライアントを作成
        rdb := redis.NewClient(&redisOption)

        // 関数終了時に自動的に接続を閉じる
        defer rdb.Close()

        // Set : key => value
        err := rdb.Set(ctx, "key", "value", 0).Err()
        if err != nil {
            panic(err)
        }

        // Get : key
        val, err := rdb.Get(ctx, "key").Result()
        if err != nil {
            panic(err)
        }
        fmt.Println("key", val)

        // Get : 存在しないkeyを取得
        val2, err := rdb.Get(ctx, "key2").Result()
        if err == redis.Nil {
            fmt.Println("key2 does not exist")
        } else if err != nil {
            panic(err)
        } else {
            fmt.Println("key2", val2)
        }

        // DEL : key
        err = rdb.Del(ctx, "key").Err()
        if err != nil {
            panic(err)
        }
        fmt.Println("key is deleted")
    }
    ```

### GoでRedisを扱う(応用的)
* **セッション管理**
    * セッション情報管理するために、RedisのHash型を利用する。
    * 1つのセッションに対して複数のフィールドを持つことで、セッション情報を管理している。
    * `HSet`でセッション情報をセットし、`HGet`でセッション情報を取得する。`HGetAll`でセッション情報を全て取得する。
    ```go
    // cookieの取得
    var cookie string = "user123"
    var session string = "session:" + cookie

    // Sessionの情報をセット
    rdb.HSet(ctx, session, "username", "Taro")
    rdb.HSet(ctx, session, "last_login_date", "2024-10-29 12:00:00")

    // Sessionの情報を1つずつ取得
    username, err := rdb.HGet(ctx, session, "username").Result()
    if err != nil {
        fmt.Println("Could not get username:", err)
    } else {
        fmt.Println("username:", username)
    }
    lastLogin, err := rdb.HGet(ctx, session, "last_login_date").Result()
    if err != nil {
        fmt.Println("Could not get last login:", err)
    } else {
        fmt.Println("last_login_date:", lastLogin)
    }

    // Sessionの情報を全て取得
    sessionData, err := rdb.HGetAll(ctx, session).Result()
    if err != nil {
        fmt.Println("Could not get session data:", err)
    } else {
        for field, value := range sessionData {
            fmt.Printf("%s: %s\n", field, value)
        }
    }
    ```

* **スコアボード**
    * Redisの`sorted sets`はスコアに基づいて、データをソートするデータ構造で、ランキングやスコアボードを管理するのに適している。
    * `ZAdd`でスコアボードにプレイヤーとスコアを追加, 更新
    * `ZRevRangeWithScores`でスコアの高い順にプレイヤーを取得
    * `ZRevRank`で特定プレイヤーのランクを取得
    * `ZScore`で特定プレイヤーのスコアを取得
    ```go
    // プレイヤーとそのスコアを追加
    scoreboard_key := "leaderboard"
    rdb.ZAdd(ctx, scoreboard_key, redis.Z{Score: 100, Member: "player1"})
    rdb.ZAdd(ctx, scoreboard_key, redis.Z{Score: 200, Member: "player2"})
    rdb.ZAdd(ctx, scoreboard_key, redis.Z{Score: 150, Member: "player3"})
    rdb.ZAdd(ctx, scoreboard_key, redis.Z{Score: 300, Member: "player4"})
    rdb.ZAdd(ctx, scoreboard_key, redis.Z{Score: 50, Member: "player5"})

    // リーダーボードからトッププレイヤーを取得
    // 1位から3位まで
    leaders, err := rdb.ZRevRangeWithScores(ctx, scoreboard_key, 0, 2).Result()
    if err != nil {
        fmt.Println("Could not retrieve leaderboard:", err)
    } else {
        fmt.Println("Top players:")
        for _, leader := range leaders {
            fmt.Printf("Player: %s, Score: %.0f\n", leader.Member, leader.Score)
        }
    }

    // player3のランクを取得
    rank, err := rdb.ZRevRank(ctx, scoreboard_key, "player3").Result()
    if err != nil {
        fmt.Println("Could not get rank:", err)
    } else {
        fmt.Printf("Rank of player3: %d\n", rank+1) // 0インデックスなので+1
    }

    // player3のスコアを取得
    score, err := rdb.ZScore(ctx, scoreboard_key, "player3").Result()
    if err != nil {
        fmt.Println("Could not get score for player3:", err)
    } else {
        fmt.Printf("Score of player3: %.0f\n", score)
    }

    // player3のスコアを更新
    var new_score float64 = 500
    rdb.ZAdd(ctx, scoreboard_key, redis.Z{Score: new_score, Member: "player3"})
    updatedScore, err := rdb.ZScore(ctx, scoreboard_key, "player3").Result()
    if err != nil {
        fmt.Println("Could not get score for player3:", err)
    } else {
        fmt.Printf("Score of player3: %.0f\n", updatedScore)
    }
    ```

* **Queue**
    * Redisの`lists`はFIFOキューを実装するのに適している。
    * `Rpush`でリストの末尾に要素を追加して、`Lpop`でリストの先頭から要素を取り出す。
    ```go
    // キューにタスクを追加
    // 右から追加
    q := "task_queue"
    rdb.RPush(ctx, q, "task1")
    rdb.RPush(ctx, q, "task2")
    rdb.RPush(ctx, q, "task3")

    // [task1, task2, task3] ← 入ってくる
    fmt.Println("Tasks added to the queue.")

    // キューからタスクを取り出す
    // 左から取り出す
    // 取り出す ← [task1, task2, task3]
    for {
        task, err := rdb.LPop(ctx, q).Result()
        if err == redis.Nil {
            fmt.Println("No more tasks in the queue.")
            break
        } else if err != nil {
            fmt.Println("Error retrieving task:", err)
            break
        } else {
            fmt.Printf("Processing task: %s\n", task)
        }
    }
    ```

* **INCR/DECR**
    * Redisの`INCR`と`DECR`は、数値をインクリメント、デクリメントするのに適している。
    * `INCR`と`DECR`は、キーが存在しない場合には、キーを作成してからインクリメント、デクリメントを行う。
    ```go
    // ページビューをカウント
    pv_key := "page_views"
    err := rdb.Del(ctx, pv_key).Err() // 初期化
    if err != nil {
        panic(err)
    }
    rdb.Incr(ctx, pv_key) // Setされていない場合は0で作成され、その後インクリメントされる
    pv, err := rdb.Get(ctx, pv_key).Int()
    if err != nil {
        fmt.Println("Could not retrieve page views:", err)
    } else {
        fmt.Printf("Page views: %d\n", pv)
    }

    // いいね数を指定した数値でインクリメント
    likes_key := "likes"
    err = rdb.Del(ctx, likes_key).Err() // 初期化
    if err != nil {
        panic(err)
    }
    rdb.IncrBy(ctx, likes_key, 10) // 10でインクリメント
    likes, err := rdb.Get(ctx, likes_key).Int()
    if err != nil {
        fmt.Println("Could not retrieve likes:", err)
    } else {
        fmt.Printf("Likes: %d\n", likes)
    }

    // 在庫数を管理
    stock_key := "stock"
    err = rdb.Del(ctx, stock_key).Err() // 初期化
    if err != nil {
        panic(err)
    }
    err = rdb.Set(ctx, stock_key, 10, 0).Err()
    if err != nil {
        panic(err)
    }
    // 在庫数をデクリメント
    rdb.Decr(ctx, stock_key)
    // 在庫数を確認
    stock, err := rdb.Get(ctx, stock_key).Int()
    if err != nil {
        fmt.Println("Could not retrieve stock:", err)
    } else {
        fmt.Printf("Stock: %d\n", stock)
    }
    ```

### まとめ
* 今回はRedisを`go-redis`を通じて扱う方法について学んだ。やはりMemcachedと異なり、様々な型を扱えるところが魅力的である。
* `Set`, `Get`, `Del`, `HSet`, `HGet`, `HGetAll`, `ZAdd`, `ZRevRangeWithScores`, `ZRevRank`, `ZScore`, `RPush`, `LPop`, `INCR`, `DECR`などの基本的な操作を学んだ。Redis上、他の操作(Pub/SubやHyperLogLogなど)も多く提供されているので、必要に応じてドキュメントを参照することが重要。

### 参考
* [Redis OSS と Memcached の比較](https://aws.amazon.com/jp/elasticache/redis-vs-memcached/)
