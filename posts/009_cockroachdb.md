---
title: 'CockroachDB 入門'
date: '2024-10-08'
---

### はじめに

- Webアプリケーションの開発において、データを永続的に保持するためにデータベースは欠かせない存在である。従来のRDBMSであるMySQLやPostgreSQLは、シングルリージョンや開発環境での利用には適しているが、マルチリージョン対応や水平スケーリングには課題がある。これらの制約を克服するために、CassandraやDynamoDBなどのNoSQLが利用されることがある。しかし、NoSQLはCAP定理により、Consistencyを完全に保証できない場合がある。この問題を解決するために、NewSQLと呼ばれる新しいタイプのデータベースが登場した。NewSQLは、従来のRDBMSのACID特性と、NoSQLのスケーラビリティを組み合わせたもので、高い一貫性とスケーラビリティを同時に実現する。今回は、NewSQLデータベースの一つであるCockroachDBを試していきたいと思う。

### DBの比較

- 代表的なデータベースの種類として、RDBMS、NoSQL、NewSQLがあり、それぞれの特徴を簡単に比較する。

| 特性                     | **RDBMS**                                  | **NoSQL**                                          | **NewSQL**                                     |
| ------------------------ | ------------------------------------------ | -------------------------------------------------- | ---------------------------------------------- |
| **データモデル**         | リレーショナル（テーブル、行、列）         | キーバリュー、ドキュメント、列指向、グラフなど     | リレーショナル                                 |
| **スケーラビリティ**     | 垂直スケーリング（スケールアップ）         | 水平スケーリング（スケールアウト）に優れる         | 水平スケーリング（スケールアウト）に対応       |
| **一貫性モデル**         | 強い一貫性（ACIDトランザクション）         | 最終的な一貫性（BASE）、一部は強い一貫性を提供     | 強い一貫性（ACIDトランザクション）             |
| **クエリ言語**           | SQL                                        | 独自のクエリ言語やAPI                              | SQL                                            |
| **スキーマの柔軟性**     | 固定スキーマ                               | スキーマレス、柔軟なスキーマ                       | 固定スキーマ（オンライン変更が容易）           |
| **マルチリージョン対応** | 困難                                       | 容易                                               | 容易                                           |
| **主な用途**             | トランザクション処理、業務アプリケーション | ビッグデータ、リアルタイム分析、柔軟なデータモデル | 高スケーラビリティが必要なトランザクション処理 |
| **代表的な製品**         | MySQL、PostgreSQL                          | Cassandra、MongoDB、DynamoDB                       | TiDB、CockroachDB、Google Spanner、YugabyteDB  |

- また、[Netflixのデータベースの記事](https://www.cockroachlabs.com/blog/netflix-at-cockroachdb/)によると下図のような比較もされている。AWS Auroraはマルチリージョンでの高可用性と低レイテンシーの読み取りを提供できるが、マルチリージョンの書き込みには対応していないことが示されている。

![2019: Why CockroachDB?](../posts/why-netflix-chose-cockroachdb.jpg)

- [A different breed of database](https://www.cockroachlabs.com/compare/) でも代表的な製品との比較がされている。

### CockroachDBとは

- トランザクショナルで一貫性の強いキー・バリュー・ストアに構築された分散SQLデータベース。 CockroachDBは、水平方向に拡張可能で、ディスク、マシン、ラック、さらにはデータセンターの障害にさえ、最小限のレイテンシで、手動による介入なしに耐えることができる。 CockroachDBは、GoogleのSpannerとF1の技術にインスパイアされている

### Quick Start

- [Deploy a Local Cluster in Docker (Insecure)](https://www.cockroachlabs.com/docs/v24.2/start-a-local-cluster-in-docker-windows#before-you-begin) を参考に進めます。
- DockerでCockroachDB(roach1, roach2, roach3の3つのノード)を起動する

1. CockroachDBのDockerイメージを取得する

   ```bash
   docker pull cockroachdb/cockroach:v24.2.3
   ```

2. CockroachDB用のネットワークを作成

   ```bash
   docker network create -d bridge roachnet
   ```

3. CockroachDB用のvolumeを作成

   ```bash
   docker volume create roach1
   docker volume create roach2
   docker volume create roach3
   ```

4. CockroachDBを起動する

   - ポート設定は下記の通り
     | ノード名 | ホストのSQLポート | コンテナのSQLポート | ホストのHTTPポート | コンテナのHTTPポート | ノード間通信ポート(advertise) | ノード間通信ポート(listen) | SQLクライアント接続ポート |
     | ---------- | ----------------- | ------------------- | ------------------ | -------------------- | ----------------------------- | -------------------------- | ------------------------- |
     | **roach1** | 26257 | 26257 | 8080 | 8080 | roach1:26357 | roach1:26357 | roach1:26257 |
     | **roach2** | 26258 | 26258 | 8081 | 8081 | roach2:26357 | roach2:26357 | roach2:26258 |
     | **roach3** | 26259 | 26259 | 8082 | 8082 | roach3:26357 | roach3:26357 | roach3:26259 |

   - 起動コマンドは下記の通り

   ```bash
   docker run -d \
     --name=roach1 \
     --hostname=roach1 \
     --net=roachnet \
     -p 26257:26257 \
     -p 8080:8080 \
     -v "roach1:/cockroach/cockroach-data" \
     cockroachdb/cockroach:v24.2.3 start \
       --advertise-addr=roach1:26357 \
       --http-addr=roach1:8080 \
       --listen-addr=roach1:26357 \
       --sql-addr=roach1:26257 \
       --insecure \
       --join=roach1:26357,roach2:26357,roach3:26357

   docker run -d \
     --name=roach2 \
     --hostname=roach2 \
     --net=roachnet \
     -p 26258:26258 \
     -p 8081:8081 \
     -v "roach2:/cockroach/cockroach-data" \
     cockroachdb/cockroach:v24.2.3 start \
       --advertise-addr=roach2:26357 \
       --http-addr=roach2:8081 \
       --listen-addr=roach2:26357 \
       --sql-addr=roach2:26258 \
       --insecure \
       --join=roach1:26357,roach2:26357,roach3:26357

   docker run -d \
     --name=roach3 \
     --hostname=roach3 \
     --net=roachnet \
     -p 26259:26259 \
     -p 8082:8082 \
     -v "roach3:/cockroach/cockroach-data" \
     cockroachdb/cockroach:v24.2.3 start \
       --advertise-addr=roach3:26357 \
       --http-addr=roach3:8082 \
       --listen-addr=roach3:26357 \
       --sql-addr=roach3:26259 \
       --insecure \
       --join=roach1:26357,roach2:26357,roach3:26357
   ```

   - 起動コンテナの確認

   ```bash
   docker container ls

   CONTAINER ID   IMAGE                           COMMAND                  CREATED          STATUS          PORTS                                                                   NAMES
   41475c7b4bf3   cockroachdb/cockroach:v24.2.3   "/cockroach/cockroac…"   5 seconds ago    Up 4 seconds    8080/tcp, 0.0.0.0:8082->8082/tcp, 26257/tcp, 0.0.0.0:26259->26259/tcp   roach3
   b2c0ebe9733e   cockroachdb/cockroach:v24.2.3   "/cockroach/cockroac…"   21 seconds ago   Up 20 seconds   8080/tcp, 0.0.0.0:8081->8081/tcp, 26257/tcp, 0.0.0.0:26258->26258/tcp   roach2
   c0c9762a9e35   cockroachdb/cockroach:v24.2.3   "/cockroach/cockroac…"   7 minutes ago    Up 7 minutes    0.0.0.0:8080->8080/tcp, 0.0.0.0:26257->26257/tcp                        roach1
   ```

5. クラスターの初期化

   ```bash
   docker exec -it roach1 ./cockroach --host=roach1:26357 init --insecure

   # 下記が表示されれば初期化成功
   Cluster successfully initialized
   ```

6. ログの確認

   ```bash
   docker exec -it roach1 grep 'node starting' /cockroach/cockroach-data/logs/cockroach.log -A 11

   # 下記のようなログが表示される
   I241008 05:19:48.720861 81 1@cli/start.go:1289 ⋮ [T1,Vsystem,n1] 1021 +CockroachDB node starting at 2024-10-08 05:19:48.720743261 +0000 UTC m=+1193.538296861 (took 1193.3s)
   I241008 05:19:48.720861 81 1@cli/start.go:1289 ⋮ [T1,Vsystem,n1] 1021 +build:               CCL v24.2.3 @ 2024/09/23 22:30:53 (go1.22.5 X:nocoverageredesign)
   I241008 05:19:48.720861 81 1@cli/start.go:1289 ⋮ [T1,Vsystem,n1] 1021 +webui:               ‹http://roach1:8080›
   I241008 05:19:48.720861 81 1@cli/start.go:1289 ⋮ [T1,Vsystem,n1] 1021 +sql:                 ‹postgresql://root@roach1:26257/defaultdb?sslmode=disable›
   I241008 05:19:48.720861 81 1@cli/start.go:1289 ⋮ [T1,Vsystem,n1] 1021 +sql (JDBC):          ‹jdbc:postgresql://roach1:26257/defaultdb?sslmode=disable&user=root›
   I241008 05:19:48.720861 81 1@cli/start.go:1289 ⋮ [T1,Vsystem,n1] 1021 +RPC client flags:    ‹/cockroach/cockroach <client cmd> --host=roach1:26357 --insecure›
   I241008 05:19:48.720861 81 1@cli/start.go:1289 ⋮ [T1,Vsystem,n1] 1021 +logs:                ‹/cockroach/cockroach-data/logs›
   I241008 05:19:48.720861 81 1@cli/start.go:1289 ⋮ [T1,Vsystem,n1] 1021 +temp dir:            ‹/cockroach/cockroach-data/cockroach-temp2863509064›
   I241008 05:19:48.720861 81 1@cli/start.go:1289 ⋮ [T1,Vsystem,n1] 1021 +external I/O path:   ‹/cockroach/cockroach-data/extern›
   I241008 05:19:48.720861 81 1@cli/start.go:1289 ⋮ [T1,Vsystem,n1] 1021 +store[0]:            ‹path=/cockroach/cockroach-data›
   I241008 05:19:48.720861 81 1@cli/start.go:1289 ⋮ [T1,Vsystem,n1] 1021 +storage engine:      pebble
   I241008 05:19:48.720861 81 1@cli/start.go:1289 ⋮ [T1,Vsystem,n1] 1021 +clusterID:           ‹d93e1e76-4d13-484c-a829-a4b8e7baa184›
   ```

7. cockroachコマンドでクラスタへ接続

   - roach1コンテナより、roach2:26258に接続

   ```bash
   docker exec -it roach1 ./cockroach sql --host=roach2:26258 --insecure
   ```

8. SQLクエリの実行

   - [Learn CoclroachDB SQL](https://www.cockroachlabs.com/docs/v24.2/learn-cockroachdb-sql) が参考となる

   - データベースの作成

     ```sql
     CREATE DATABASE bank;

     root@roach2:26258/defaultdb> show DATABASES;
       database_name | owner | primary_region | secondary_region | regions | survival_goal
     ----------------+-------+----------------+------------------+---------+----------------
       bank          | root  | NULL           | NULL             | {}      | NULL
       defaultdb     | root  | NULL           | NULL             | {}      | NULL
       postgres      | root  | NULL           | NULL             | {}      | NULL
       system        | node  | NULL           | NULL             | {}      | NULL
     (4 rows)

     Time: 6ms total (execution 6ms / network 0ms)
     ```

   - テーブルの作成

     ```sql
     USE bank;
     CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);

     root@roach2:26258/bank> show tables;
       schema_name | table_name | type  | owner | estimated_row_count | locality
     --------------+------------+-------+-------+---------------------+-----------
       public      | accounts   | table | root  |                   0 | NULL
     (1 row)

     Time: 28ms total (execution 27ms / network 0ms)
     ```

   - データの挿入と確認

     ```sql
     INSERT INTO bank.accounts VALUES (1, 1000.50);

     root@roach2:26258/bank> select * from accounts;
       id | balance
     -----+----------
       1 | 1000.50
     (1 row)

     Time: 2ms total (execution 2ms / network 0ms)
     ```

9. roach2からクラスタの状態を確認

   - roach2コンテナに接続して、クラスタの状態を確認する
   - 先と同様の結果を取得できることを確認

   ```bash
   docker exec -it roach2 ./cockroach --host=roach2:26258 sql --insecure

   root@roach2:26258/defaultdb> SELECT * FROM bank.accounts;
     id | balance
   -----+----------
     1 | 1000.50
   (1 row)
   ```

10. サンプルワークロードの実行

    - データセットのロード

    ```bash
    docker exec -it roach1 ./cockroach workload init movr 'postgresql://root@roach1:26257?sslmode=disable'
    ```

    - ワークロードの開始(5分間)

    ```bash
    docker exec -it roach1 ./cockroach workload run movr --duration=5m 'postgresql://root@roach1:26257?sslmode=disable'
    ```

11. DBコンソールへアクセスする

- 下記のように各ノードのサマリーやMetrics、データベースのスキーマ等が確認できる

  ![Cockroach_screenshot1](../posts/Cockroachdb_screenshot1.png)
  ![Cockroach_screenshot2](../posts/Cockroachdb_screenshot2.png)
  ![Cockroach_screenshot3](../posts/Cockroachdb_screenshot3.png)

12. クラスタの停止

    ```bash
    docker stop roach1 roach2 roach3
    docker rm roach1 roach2 roach3
    docker volume rm roach1 roach2 roach3
    docker network rm roachnet
    ```

13. (option) docker-composeで上記を実行する
    - [Github Repository](https://github.com/ys39/cockroachdb-practice) を参照

### まとめ

- 今回はdockerでCockroachDBのクラスタを構築し、SQLクエリを実行するまでを実行してみました。
- CockroachDBのクラスタは基本的にはcockroachコマンドを使って操作することができ、クラスタの結果はDBコンソールで確認することができる。
- NewSQLのCockroachDBは、有名どころだとNetflixやBoseなどが採用しているが、国内での採用はまだ少ないように感じる。TiDBは結構ある。

### 参考

- [Cockroach Labs](https://www.cockroachlabs.com/)
