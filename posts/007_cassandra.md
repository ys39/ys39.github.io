---
title: 'Cassandra 入門'
date: '2024-10-07'
---

### はじめに

- 今まで業務で、NoSQLとしてMemcachedとRedisを多用してきた。身近なキャッシュサーバというところで使用は簡単であり、その効果もメモリを介するために高速である。世間的にはAWS Elasticacheとして利用されるケースもあるが、AWSの場合、サービスのニーズにもよるがAWS DynamoDBを採用するアーキも多い。一方で、NoSQLでは以前よりCassandraというものも利用されている。AWSでもAWS Keyspacesとして提供されている。
- 今回はこのCassandraについて調査し、基本的な使い方を学ぶ。
- Cassandraはクラスタを組むことでその真意を発揮すると考えるが、まずは単体での確認を行う。

### Cassandraとは

- NoSQLデータベースの一種でKVS構造をもつ分散型のデータベース。
- CassandraはもともとFacebook社において、大容量のデータを格納するために開発され、 2008年にソースコードが公開され、2009年にはApacheのプロジェクトとなった。

### Quick Start

- [https://cassandra.apache.org/\_/quickstart.html](https://cassandra.apache.org/_/quickstart.html) を参考に進める。

1. Dockerイメージを取得

   ```bash
   docker pull cassandra:latest # Cassandraデータベース用
   docker pull nuvo/docker-cqlsh:latest # Cassandra接続用
   ```

2. Cassandraデータベースのコンテナを起動

   ```bash
   docker network create cassandra
   docker run --rm -d --name cassandra --hostname cassandra --network cassandra cassandra
   ```

3. CQL(=Cassandra Query Language)を作成

   ```cql
   -- Create a keyspace
   CREATE KEYSPACE IF NOT EXISTS store WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : '1' };

   -- Create a table
   CREATE TABLE IF NOT EXISTS store.shopping_cart (
      userid text PRIMARY KEY,
      item_count int,
      last_update_timestamp timestamp
   );

   -- Insert some data
   INSERT INTO store.shopping_cart (userid, item_count, last_update_timestamp)
   VALUES ('9876', 2, toTimeStamp(now()));

   INSERT INTO store.shopping_cart (userid, item_count, last_update_timestamp)
   VALUES ('1234', 5, toTimeStamp(now()));
   ```

4. CQLのロード

   - cqlversionは3.4.7を指定
   - cassandraコンテナの起動に数分かかるので、その間に下記を実行するとコネクションエラーとなるので注意

   ```bash
   docker run --rm --network cassandra -v "$(pwd)/data.cql:/scripts/data.cql" -e CQLSH_HOST=cassandra -e CQLSH_PORT=9042 -e CQLVERSION=3.4.7 nuvo/docker-cqlsh
   ```

5. インタラクティブにCQLを実行するためにコンテナへ接続

   - cqlversionは3.4.7を指定

   ```bash
   docker run --rm -it --network cassandra nuvo/docker-cqlsh cqlsh cassandra 9042 --cqlversion='3.4.7'

   Connected to Test Cluster at cassandra:9042.
   [cqlsh 5.0.1 | Cassandra 5.0.1 | CQL spec 3.4.7 | Native protocol v5]
   Use HELP for help.
   cqlsh>
   ```

6. データの取得

   ```cql
   cqlsh> SELECT * FROM store.shopping_cart;

   userid | item_count | last_update_timestamp
   --------+------------+---------------------------------
     1234 |          5 | 2024-10-06 12:34:47.492000+0000
     9876 |          2 | 2024-10-06 12:34:47.489000+0000

   (2 rows)
   ```

7. データの作成

   ```cql
   cqlsh> INSERT INTO store.shopping_cart (userid, item_count) VALUES ('4567', 20);
   cqlsh> SELECT * FROM store.shopping_cart;

   userid | item_count | last_update_timestamp
   --------+------------+---------------------------------
     4567 |         20 |                            null
     1234 |          5 | 2024-10-06 12:34:47.492000+0000
     9876 |          2 | 2024-10-06 12:34:47.489000+0000

   (3 rows)
   cqlsh>
   ```

8. コンテナ/ネットワーク/イメージの削除

   ```bash
   docker kill cassandra
   docker network rm cassandra
   docker rmi cassandra:latest nuvo/docker-cqlsh:latest
   ```

### 雑多に使ってみる

- keyspaceの作成

  - レプリケーション・マップは、指定されたデータ・センターに格納するデータのコピー数を指定する。この設定は、整合性、可用性、要求速度に影響する。
  - シンプル・トポロジーの構文：`'class' : 'SimpleStrategy', 'replication_factor' : N` → クラスター全体に同じレプリケーション係数を割り当てる。評価目的と単一データ・センターのテストおよび開発環境でのみ使用するとのこと。
  - ネットワーク・トポロジーの構文：`'class' : 'NetworkTopologyStrategy', 'dc1_name' : N [, ...]` → コンマ区切りリスト内の各データ・センターにレプリケーション係数を割り当てる。実稼働環境とマルチ・データ・センターのテストおよび開発環境で使用するとのこと。

  ```cql
  CREATE KEYSPACE IF NOT EXISTS store WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : '1' };
  ```

- keyspaceの削除

  ```cql
  DROP KEYSPACE store;
  ```

- keyspacesの確認

  ```cql
  cqlsh> desc keyspaces;

  system_virtual_schema  system_auth   system              system_traces
  system_schema          system_views  system_distributed  store
  ```

- keyspaceのセット

  ```cql
  cqlsh> use store;
  cqlsh:store>
  ```

- tableの確認

  ```cql
  cqlsh:store> desc tables;

  shopping_cart
  ```

- tableの作成

  ```cql
  CREATE TABLE IF NOT EXISTS store.stock (
    item_id uuid PRIMARY KEY,
    item_name text,
    item_count int,
    last_update_timestamp timestamp
  );
  ```

- 特定テーブルの確認

  ```cql
  cqlsh:store> desc stock;

  CREATE TABLE store.stock (
      item_id uuid PRIMARY KEY,
      item_count int,
      item_name text,
      last_update_timestamp timestamp
  ) WITH bloom_filter_fp_chance = 0.01
      AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
      AND comment = ''
      AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
      AND compression = {'chunk_length_in_kb': '16', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
      AND crc_check_chance = 1.0
      AND default_time_to_live = 0
      AND gc_grace_seconds = 864000
      AND max_index_interval = 2048
      AND memtable_flush_period_in_ms = 0
      AND min_index_interval = 128
      AND speculative_retry = '99p';
  ```

- データSELECT

  ```cql
  cqlsh:store> select * from stock;

  item_id | item_count | item_name | last_update_timestamp
  ---------+------------+-----------+-----------------------

  (0 rows)
  ```

- データINSERT

  ```cql
  INSERT INTO store.stock (item_id, item_name, item_count, last_update_timestamp)
  VALUES (uuid(), 'item1', 10, toTimeStamp(now()));

  INSERT INTO store.stock (item_id, item_name, item_count, last_update_timestamp)
  VALUES (uuid(), 'item2', 20, toTimeStamp(now()));

  INSERT INTO store.stock (item_id, item_name, item_count, last_update_timestamp)
  VALUES (uuid(), 'item3', 30, toTimeStamp(now()));

  cqlsh:store> select * from stock;

  item_id                              | item_count | item_name | last_update_timestamp
  --------------------------------------+------------+-----------+---------------------------------
  3b49331f-a411-4c8a-a690-7f8c0b1ec160 |         10 |     item1 | 2024-10-07 00:13:28.192000+0000
  a05dc7b4-059a-415c-aaa7-db84f8c0b80b |         30 |     item3 | 2024-10-07 00:13:28.977000+0000
  324be32a-160f-496f-a30e-daa81d1e52c1 |         20 |     item2 | 2024-10-07 00:13:28.196000+0000
  ```

- データUPDATE

  - `UPDATE`はupsert操作となる。指定した行が存在しない場合は新規行を挿入し、存在する場合は行を更新する。

  ```cql
  cqlsh:store> UPDATE store.stock SET item_count = 15 WHERE item_id = 3b49331f-a411-4c8a-a690-7f8c0b1ec160;
  cqlsh:store> select * from stock;

  item_id                              | item_count | item_name | last_update_timestamp
  --------------------------------------+------------+-----------+---------------------------------
  3b49331f-a411-4c8a-a690-7f8c0b1ec160 |         15 |     item1 | 2024-10-07 00:13:28.192000+0000
  a05dc7b4-059a-415c-aaa7-db84f8c0b80b |         30 |     item3 | 2024-10-07 00:13:28.977000+0000
  324be32a-160f-496f-a30e-daa81d1e52c1 |         20 |     item2 | 2024-10-07 00:13:28.196000+0000

  -- item_idが存在しない場合は新規行を挿入
  cqlsh:store> UPDATE store.stock SET item_count = 100 WHERE item_id = uuid();
  cqlsh:store> select * from stock;

  item_id                              | item_count | item_name | last_update_timestamp
  --------------------------------------+------------+-----------+---------------------------------
  3b49331f-a411-4c8a-a690-7f8c0b1ec160 |         15 |     item1 | 2024-10-07 00:13:28.192000+0000
  89214769-515b-4323-a8fd-21750103fd7a |        100 |      null |                            null
  a05dc7b4-059a-415c-aaa7-db84f8c0b80b |         30 |     item3 | 2024-10-07 00:13:28.977000+0000
  324be32a-160f-496f-a30e-daa81d1e52c1 |         20 |     item2 | 2024-10-07 00:13:28.196000+0000
  ```

- データDELETE

  - DELETEの使用はパフォーマンスに影響を及ぼす可能性があるとのこと。
  - これはDELETE操作によって、データがディスクから即座に削除されるのではなく、トゥームストーンのマークが付き、猶予期間が経過すると削除されるため。トゥームストーンのマークがついているデータはRead時にアクセスされるらしく、データが大量に存在する場合には性能低下が起こるとのこと。
  - トゥームストーンのマークがついているデータはコンパクション時に削除される。

  ```cql
  cqlsh:store> DELETE FROM stock where item_id = 89214769-515b-4323-a8fd-21750103fd7a;
  cqlsh:store> select * from stock;

  item_id                              | item_count | item_name | last_update_timestamp
  --------------------------------------+------------+-----------+---------------------------------
  3b49331f-a411-4c8a-a690-7f8c0b1ec160 |         15 |     item1 | 2024-10-07 00:13:28.192000+0000
  a05dc7b4-059a-415c-aaa7-db84f8c0b80b |         30 |     item3 | 2024-10-07 00:13:28.977000+0000
  324be32a-160f-496f-a30e-daa81d1e52c1 |         20 |     item2 | 2024-10-07 00:13:28.196000+0000

  (3 rows)
  ```

- カラムの追加

  ```cql
  cqlsh:store> ALTER TABLE store.stock ADD item_price int;
  cqlsh:store> select * from stock;

  item_id                              | item_count | item_name | item_price | last_update_timestamp
  --------------------------------------+------------+-----------+------------+---------------------------------
  3b49331f-a411-4c8a-a690-7f8c0b1ec160 |         15 |     item1 |       null | 2024-10-07 00:13:28.192000+0000
  a05dc7b4-059a-415c-aaa7-db84f8c0b80b |         30 |     item3 |       null | 2024-10-07 00:13:28.977000+0000
  324be32a-160f-496f-a30e-daa81d1e52c1 |         20 |     item2 |       null | 2024-10-07 00:13:28.196000+0000

  (3 rows)
  ```

- カラム名の変更

  - 通常のカラム名の変更はできない。
  - 変更できるのは、プライマリ・キーのクラスター化カラムの名前のみ。
  - クラスター化カラムとはパーティション内のデータの順序を決定する。

  ```cql
  cqlsh:store> ALTER TABLE store.stock RENAME item_price TO item_purchase_price;
  InvalidRequest: Error from server: code=2200 [Invalid query] message="Cannot rename non PRIMARY KEY column item_price"
  ```

- カラム名の変更(クラスター化カラム)

  - クラスター化カラムを含むテーブルを作成する。
  - descで確認した際に`WITH CLUSTERING ORDER BY (col_1 ASC, col_2 ASC, col_3 ASC, col_4 ASC)`となっていることからテーブル内の順序を決定していることがわかる。
  - この場合、`col_1`、`col_2`、`col_3`、`col_4`を変更することができる。

  ```cql
  CREATE TABLE numbers (
    key int,
    col_1 int,
    col_2 int,
    col_3 int,
    col_4 int,
    PRIMARY KEY ((key), col_1, col_2, col_3, col_4));

  INSERT INTO numbers (key, col_1, col_2, col_3, col_4) VALUES (100, 1, 1, 1, 1);
  INSERT INTO numbers (key, col_1, col_2, col_3, col_4) VALUES (100, 1, 1, 1, 2);
  INSERT INTO numbers (key, col_1, col_2, col_3, col_4) VALUES (100, 1, 1, 1, 3);
  INSERT INTO numbers (key, col_1, col_2, col_3, col_4) VALUES (100, 1, 1, 2, 1);
  INSERT INTO numbers (key, col_1, col_2, col_3, col_4) VALUES (100, 1, 1, 2, 2);
  INSERT INTO numbers (key, col_1, col_2, col_3, col_4) VALUES (100, 1, 1, 2, 3);
  INSERT INTO numbers (key, col_1, col_2, col_3, col_4) VALUES (100, 1, 2, 2, 1);
  INSERT INTO numbers (key, col_1, col_2, col_3, col_4) VALUES (100, 1, 2, 2, 2);
  INSERT INTO numbers (key, col_1, col_2, col_3, col_4) VALUES (100, 1, 2, 2, 3);
  INSERT INTO numbers (key, col_1, col_2, col_3, col_4) VALUES (100, 2, 1, 1, 1);
  INSERT INTO numbers (key, col_1, col_2, col_3, col_4) VALUES (100, 2, 1, 1, 2);
  INSERT INTO numbers (key, col_1, col_2, col_3, col_4) VALUES (100, 2, 1, 1, 3);
  INSERT INTO numbers (key, col_1, col_2, col_3, col_4) VALUES (100, 2, 1, 2, 1);
  INSERT INTO numbers (key, col_1, col_2, col_3, col_4) VALUES (100, 2, 1, 2, 2);
  INSERT INTO numbers (key, col_1, col_2, col_3, col_4) VALUES (100, 2, 1, 2, 3);
  INSERT INTO numbers (key, col_1, col_2, col_3, col_4) VALUES (100, 2, 2, 2, 1);
  INSERT INTO numbers (key, col_1, col_2, col_3, col_4) VALUES (100, 2, 2, 2, 2);
  INSERT INTO numbers (key, col_1, col_2, col_3, col_4) VALUES (100, 2, 2, 2, 3);

  cqlsh:store> select * from numbers;

  key | col_1 | col_2 | col_3 | col_4
  -----+-------+-------+-------+-------
  100 |     1 |     1 |     1 |     1
  100 |     1 |     1 |     1 |     2
  100 |     1 |     1 |     1 |     3
  100 |     1 |     1 |     2 |     1
  100 |     1 |     1 |     2 |     2
  100 |     1 |     1 |     2 |     3
  100 |     1 |     2 |     2 |     1
  100 |     1 |     2 |     2 |     2
  100 |     1 |     2 |     2 |     3
  100 |     2 |     1 |     1 |     1
  100 |     2 |     1 |     1 |     2
  100 |     2 |     1 |     1 |     3
  100 |     2 |     1 |     2 |     1
  100 |     2 |     1 |     2 |     2
  100 |     2 |     1 |     2 |     3
  100 |     2 |     2 |     2 |     1
  100 |     2 |     2 |     2 |     2
  100 |     2 |     2 |     2 |     3

  (18 rows)
  cqlsh:store> desc numbers;

  CREATE TABLE store.numbers (
      key int,
      col_1 int,
      col_2 int,
      col_3 int,
      col_4 int,
      PRIMARY KEY (key, col_1, col_2, col_3, col_4)
  ) WITH CLUSTERING ORDER BY (col_1 ASC, col_2 ASC, col_3 ASC, col_4 ASC)
      AND bloom_filter_fp_chance = 0.01
      AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
      AND comment = ''
      AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
      AND compression = {'chunk_length_in_kb': '16', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
      AND crc_check_chance = 1.0
      AND default_time_to_live = 0
      AND gc_grace_seconds = 864000
      AND max_index_interval = 2048
      AND memtable_flush_period_in_ms = 0
      AND min_index_interval = 128
      AND speculative_retry = '99p';

  -- col_1をcol_1_renamedに変更
  ALTER TABLE store.numbers RENAME col_1 TO col_1_renamed;

  cqlsh:store> desc numbers;

  CREATE TABLE store.numbers (
      key int,
      col_1_renamed int,
      col_2 int,
      col_3 int,
      col_4 int,
      PRIMARY KEY (key, col_1_renamed, col_2, col_3, col_4)
  ) WITH CLUSTERING ORDER BY (col_1_renamed ASC, col_2 ASC, col_3 ASC, col_4 ASC)
      AND bloom_filter_fp_chance = 0.01
      AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
      AND comment = ''
      AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
      AND compression = {'chunk_length_in_kb': '16', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
      AND crc_check_chance = 1.0
      AND default_time_to_live = 0
      AND gc_grace_seconds = 864000
      AND max_index_interval = 2048
      AND memtable_flush_period_in_ms = 0
      AND min_index_interval = 128
      AND speculative_retry = '99p';
  ```

### Cassandraの特徴

- CAP定理における選択

  - Consistency（整合性）：分散されたノード間でデータの不整合が発生せず、常に最新のデータが取得できること。
  - Availability（可用性）：一部のノードに障害が発生しても、システム全体の機能が損なわれず、データにアクセスできること。
  - Partition-tolerance（分断耐性）：ネットワークの一部で通信障害が発生しても、システムが正しく動作を続ける能力。
  - Cassandraは、CAP定理において「可用性（A）」と「分断耐性（P）」を重視している。整合性（C）は、Consistency Levelの調整により、ユーザーがトレードオフを選択可能（強い整合性が必要な場合、QUORUMやALLを使用して保証できる）。

- Wide-column store（ワイドカラムストア）を採用

  - Cassandraは、1つのキー（パーティションキー）に対して複数のカラムを持つ「Wide-column store」モデルを使用しており、効率的に大規模なデータを処理する。
  - 各レコードは、1つのパーティションキーを持ち、それに対応する複数のカラムを柔軟に保存できる。

- スケーラビリティと高可用性の実現

  - Cassandraはリニアスケーラビリティを持ち、ノードを追加するだけで処理能力を横方向にスケールアウトできる。特にペタバイト級の大量データの処理や管理に適している。
  - データはパーティションキーに基づいてクラスタ内のノードに自動的に分散され、障害耐性を持ちながら効率的にデータを格納する。

- パーティションキーとデータ分散

  - データはパーティションキーに基づいてハッシュ化され、Cassandraクラスタ内の各ノードに均等に分散される。このハッシュ分散法により、システム全体で可用性（A）と分断耐性（P）を維持する。

- レプリケーションによる耐障害性

  - Cassandraは、データをクラスタ内の複数のノードにレプリケートし、耐障害性を強化している。レプリケーション戦略（SimpleStrategyやNetworkTopologyStrategy）を使用して、複数のデータセンターにデータを複製し、障害が発生した際でもデータが失われないようにする。

- チューナブル・コンシステンシー（Tunable Consistency）

  - Cassandraは、クエリごとに整合性レベルを設定できるチューナブル・コンシステンシーを提供しており、システムの整合性と可用性のバランスを状況に応じて選択可能。例えば、強い整合性を要求するクエリにはQUORUMやALL、高速な可用性を重視する場合はONEやANYを使用できる。

- マスターレス構造による耐障害性

  - Cassandraはマスターレス構造を採用しており、全ノードが対等であるため、1つのノードが故障してもシステム全体に影響を与えない。これにより、単一障害点が存在せず、非常に高い可用性を実現する。

- データモデルの柔軟性

  - Cassandraはスキーマフレキシブルなデータモデルを提供しており、行ごとに異なるカラムを持つことが可能。データ構造の変更（カラムの追加や削除）が容易で、運用時に柔軟に対応できる。

- 書き込み性能の最適化

  - Cassandraは、書き込み性能が非常に高く、特にライトヘビーなワークロードに適している。データの書き込みはログ構造に基づいたストレージメカニズムを使用しており、ディスクへの書き込みが効率化されている。

- 地理的に分散したデプロイをサポート
  - 複数のデータセンターにまたがるクラスタを構築でき、異なる地理的場所にあるデータセンター間でレプリケーションを行うことで、地理的な冗長性と低レイテンシーを実現。

### Cassandraのユースケース

- E-commerceと在庫管理
- パーソナライゼーションやレコメンデーションのエンジン
- IoT (Internet of things) とエッジコンピューティング
- 不正検知と認証

### 所感

- SQLと似た感じで記述できるので扱いやすい。
- カラムの変更は制限がある、PrimaryKeyのみWhere句に利用できる あたりが、KVSのNoSQLらしさを感じる。
- database -> keyspace という用語が使われている。(table -> tableとして扱われるが、以前はcolumn familyと呼ばれていた)

### まとめ

- 今回はCassandraの基本的な使い方をCQLを通じて学びました。
- 単体だけではわからない部分も多いため、自身でもクラスタを組んで、その挙動を確認してみたいと思います。

### 参考

- Cassandraの概要を掴む

  - [Yahoo! JAPAN Tech Blog](https://techblog.yahoo.co.jp/entry/20200129803067/)
  - [Cassandra 公式](https://cassandra.apache.org/_/cassandra-basics.html)
  - [OpenStandia OSS紹介](https://openstandia.jp/oss_info/cassandra/)
  - ["DATASTAX ユースケース"](https://www.datastax.com/jp/blog/exploring-common-apache-cassandra-use-cases)

- CQLの基本を学ぶ
  - ["https://naoty.dev/posts/449"](https://naoty.dev/posts/449)
  - ["DATASTAX Documentation"](https://docs.datastax.com/ja/dse/5.1/cql/index.html)
  - ["https://zenn.dev/andoobomber/articles/2403b10c9d3712802707"](https://zenn.dev/andoobomber/articles/2403b10c9d3712802707)
