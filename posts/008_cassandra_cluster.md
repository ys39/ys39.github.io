---
title: 'Cassandra Cluster'
date: '2024-10-07'
tags: ['Cassandra', 'DB', 'NoSQL']
---

### はじめに

- [Cassandra入門](./007_cassandra)にて基本的なCassandraの概要を掴みつつ、CQLでの操作を学んだ。今回はクラスタを複数台構築し、データの分散保存と冗長化を確認する。

### Cassadraクラスタの前提知識

- **スニッチ** .. Cassandraのクラスタにおいて、ノード間のネットワークトポロジーを把握し、データのレプリケーションや通信の最適化を行うためのメカニズム。Cassandraクラスタは分散型システムであり、複数のノードが協力して動作するが、ノード間の通信は効率的に行われる必要がある。スニッチは、そのネットワークのトポロジー（ノード間の物理的および論理的な配置）を理解し、レプリカの配置を決定したり、最適な通信経路を選択する。

  - GossipingPropertyFileSnitchが推奨されている。
  - 最も一般的に使われるスニッチ。ノードごとのトポロジー情報をcassandra-rackdc.propertiesファイルで管理する。Gossipプロトコルを使用して、ノード同士がトポロジー情報を交換。これにより、動的なクラスタの変更（ノードの追加や削除）にも柔軟に対応できる。

- **シードノード** .. Cassandraクラスタ内で新しいノードがクラスタに参加する際や、クラスタが再起動する際に、クラスタの情報（他のノードのリストや状態）を提供する役割を果たす特別なノード。Cassandraでは、シードノードがクラスタの他のノードと通信するためのエントリーポイントとして機能し、Gossipプロトコルを通じてクラスタの全体像を他のノードに知らせる。

- **トークンリング** .. データをクラスタ内のノード間で効率的に分散するための概念。ノードに複数のトークンを持たせることで、リング全体にデータをより細かく分散し、ノード間で負荷を均等に分散する。

- **論理データセンター** .. Cassandraクラスタ内でノードをグループ化するための単位

- **論理ラック** .. 論理データセンター内でノードをグループ化するための単位

### Cassandraクラスタの構築

- クラスタ数は1、論理データセンターは2つ、ノード数は3で構築する。

  ```
  DC1
    - node1(rack1)
    - node2(rack2)
    - node3(rack3)
  DC2
    - node1(rack1)
    - node2(rack2)
    - node3(rack3)
  ```

- docker-compose.ymlを作成し、cassandraのコンテナを6つ起動することでIaCを意識する。

1. docker-compose.ymlの作成

   - 1つのノードに対するメモリ不足によるエラーが発生したため、MAX_HEAP_SIZEとHEAP_NEWSIZEを512M, 100Mに設定
   - また、WSL2/Desktop for Windowsを使用しており、WSLに割り振るメモリを16GBに設定している。

   ```yaml
   version: '3'
   services:
     cassandra-dc1-node1:
       image: cassandra:latest
       container_name: cassandra-dc1-node1
       environment:
         - CASSANDRA_CLUSTER_NAME=my_cassandra_cluster
         - CASSANDRA_DC=dc1
         - CASSANDRA_RACK=rack1
         - CASSANDRA_NUM_TOKENS=256
         - CASSANDRA_SEEDS=cassandra-dc1-node1,cassandra-dc2-node1
         - CASSANDRA_LISTEN_ADDRESS=cassandra-dc1-node1
         - CASSANDRA_BROADCAST_ADDRESS=cassandra-dc1-node1
         - CASSANDRA_ENDPOINT_SNITCH=GossipingPropertyFileSnitch
         - MAX_HEAP_SIZE=512M
         - HEAP_NEWSIZE=100M
       networks:
         - cassandra_network
       volumes:
         - cassandra-data-dc1-node1:/var/lib/cassandra
       ports:
         - '9042:9042'

     cassandra-dc1-node2:
       image: cassandra:latest
       container_name: cassandra-dc1-node2
       environment:
         - CASSANDRA_CLUSTER_NAME=my_cassandra_cluster
         - CASSANDRA_DC=dc1
         - CASSANDRA_RACK=rack2
         - CASSANDRA_NUM_TOKENS=256
         - CASSANDRA_SEEDS=cassandra-dc1-node1,cassandra-dc2-node1
         - CASSANDRA_LISTEN_ADDRESS=cassandra-dc1-node2
         - CASSANDRA_BROADCAST_ADDRESS=cassandra-dc1-node2
         - CASSANDRA_ENDPOINT_SNITCH=GossipingPropertyFileSnitch
         - MAX_HEAP_SIZE=512M
         - HEAP_NEWSIZE=100M
       networks:
         - cassandra_network
       volumes:
         - cassandra-data-dc1-node2:/var/lib/cassandra

     cassandra-dc1-node3:
       image: cassandra:latest
       container_name: cassandra-dc1-node3
       environment:
         - CASSANDRA_CLUSTER_NAME=my_cassandra_cluster
         - CASSANDRA_DC=dc1
         - CASSANDRA_RACK=rack3
         - CASSANDRA_NUM_TOKENS=256
         - CASSANDRA_SEEDS=cassandra-dc1-node1,cassandra-dc2-node1
         - CASSANDRA_LISTEN_ADDRESS=cassandra-dc1-node3
         - CASSANDRA_BROADCAST_ADDRESS=cassandra-dc1-node3
         - CASSANDRA_ENDPOINT_SNITCH=GossipingPropertyFileSnitch
         - MAX_HEAP_SIZE=512M
         - HEAP_NEWSIZE=100M
       networks:
         - cassandra_network
       volumes:
         - cassandra-data-dc1-node3:/var/lib/cassandra

     cassandra-dc2-node1:
       image: cassandra:latest
       container_name: cassandra-dc2-node1
       environment:
         - CASSANDRA_CLUSTER_NAME=my_cassandra_cluster
         - CASSANDRA_DC=dc2
         - CASSANDRA_RACK=rack1
         - CASSANDRA_NUM_TOKENS=256
         - CASSANDRA_SEEDS=cassandra-dc1-node1,cassandra-dc2-node1
         - CASSANDRA_LISTEN_ADDRESS=cassandra-dc2-node1
         - CASSANDRA_BROADCAST_ADDRESS=cassandra-dc2-node1
         - CASSANDRA_ENDPOINT_SNITCH=GossipingPropertyFileSnitch
         - MAX_HEAP_SIZE=512M
         - HEAP_NEWSIZE=100M
       networks:
         - cassandra_network
       volumes:
         - cassandra-data-dc2-node1:/var/lib/cassandra

     cassandra-dc2-node2:
       image: cassandra:latest
       container_name: cassandra-dc2-node2
       environment:
         - CASSANDRA_CLUSTER_NAME=my_cassandra_cluster
         - CASSANDRA_DC=dc2
         - CASSANDRA_RACK=rack2
         - CASSANDRA_NUM_TOKENS=256
         - CASSANDRA_SEEDS=cassandra-dc1-node1,cassandra-dc2-node1
         - CASSANDRA_LISTEN_ADDRESS=cassandra-dc2-node2
         - CASSANDRA_BROADCAST_ADDRESS=cassandra-dc2-node2
         - CASSANDRA_ENDPOINT_SNITCH=GossipingPropertyFileSnitch
         - MAX_HEAP_SIZE=512M
         - HEAP_NEWSIZE=100M
       networks:
         - cassandra_network
       volumes:
         - cassandra-data-dc2-node2:/var/lib/cassandra

     cassandra-dc2-node3:
       image: cassandra:latest
       container_name: cassandra-dc2-node3
       environment:
         - CASSANDRA_CLUSTER_NAME=my_cassandra_cluster
         - CASSANDRA_DC=dc2
         - CASSANDRA_RACK=rack3
         - CASSANDRA_NUM_TOKENS=256
         - CASSANDRA_SEEDS=cassandra-dc1-node1,cassandra-dc2-node1
         - CASSANDRA_LISTEN_ADDRESS=cassandra-dc2-node3
         - CASSANDRA_BROADCAST_ADDRESS=cassandra-dc2-node3
         - CASSANDRA_ENDPOINT_SNITCH=GossipingPropertyFileSnitch
         - MAX_HEAP_SIZE=512M
         - HEAP_NEWSIZE=100M
       networks:
         - cassandra_network
       volumes:
         - cassandra-data-dc2-node3:/var/lib/cassandra

     cqlsh:
       image: nuvo/docker-cqlsh:latest
       container_name: cqlsh
       networks:
         - cassandra_network
       entrypoint:
         ['cqlsh', 'cassandra-dc1-node1', '9042', '--cqlversion=3.4.7']
       depends_on:
         - cassandra-dc1-node1
         - cassandra-dc1-node2
         - cassandra-dc1-node3
         - cassandra-dc2-node1
         - cassandra-dc2-node2
         - cassandra-dc2-node3
       stdin_open: true
       tty: true

   networks:
     cassandra_network:
       driver: bridge

   volumes:
     cassandra-data-dc1-node1:
     cassandra-data-dc1-node2:
     cassandra-data-dc1-node3:
     cassandra-data-dc2-node1:
     cassandra-data-dc2-node2:
     cassandra-data-dc2-node3:
   ```

2. docker-compose起動

   ```bash
   docker-compose up -d
   ```

3. docker-composeで起動したコンテナのIPアドレスを確認する

   ```bash
   docker network inspect cassandra-cluster_cassandra_network
   [
       {
           "Name": "cassandra-cluster_cassandra_network",
           "Id": "c404e3e245c35e65051cc8560de07ed92e5cf45fa9ca1025dcc22c315590b699",
           "Created": "2024-10-07T05:44:46.746318283Z",
           "Scope": "local",
           "Driver": "bridge",
           "EnableIPv6": false,
           "IPAM": {
               "Driver": "default",
               "Options": null,
               "Config": [
                   {
                       "Subnet": "172.21.0.0/16",
                       "Gateway": "172.21.0.1"
                   }
               ]
           },
           "Internal": false,
           "Attachable": false,
           "Ingress": false,
           "ConfigFrom": {
               "Network": ""
           },
           "ConfigOnly": false,
           "Containers": {
               "1fc552c9f1887398a01e30ccc4a01c5b8d53fb89238785516f06477402678737": {
                   "Name": "cassandra-dc2-node1",
                   "EndpointID": "84335e9129dce97ba413816db9b9a416df02f332ac2345068310fa89813ada94",
                   "MacAddress": "02:42:ac:15:00:05",
                   "IPv4Address": "172.21.0.5/16",
                   "IPv6Address": ""
               },
               "32707314dfd11d575a54b8c737f1512c60553fddd030de3db3d9dca1a2c820c1": {
                   "Name": "cassandra-dc1-node3",
                   "EndpointID": "6f5290269817066e21ae85f091f492ad96bb765dd9c38002c7ad092893773bf5",
                   "MacAddress": "02:42:ac:15:00:04",
                   "IPv4Address": "172.21.0.4/16",
                   "IPv6Address": ""
               },
               "37d04f066973816f8258a64214a27c73b282c4c3e0086d07fb38d7b088aa342f": {
                   "Name": "cassandra-dc2-node3",
                   "EndpointID": "9a99817d692330a6299f7f7687c4eacdac9621bb037902f4c34abe02ea4e3f12",
                   "MacAddress": "02:42:ac:15:00:06",
                   "IPv4Address": "172.21.0.6/16",
                   "IPv6Address": ""
               },
               "5c2c4c5ae43436dd2fa8795816209f878d2fece77895b45e36601fe501b2eea7": {
                   "Name": "cassandra-dc1-node2",
                   "EndpointID": "1cae7cb81378b08c127ba29801761777fc0dce5e24769e995c0bdfbf1c906679",
                   "MacAddress": "02:42:ac:15:00:02",
                   "IPv4Address": "172.21.0.2/16",
                   "IPv6Address": ""
               },
               "9a67fcfbb0d290860bfd7881107ea65f995f089dee6672271dd4208590db7e42": {
                   "Name": "cassandra-dc2-node2",
                   "EndpointID": "8882d8cf6663f462d24ebce0d658fd5feccae31e90be69aa0bf466018b2221fb",
                   "MacAddress": "02:42:ac:15:00:03",
                   "IPv4Address": "172.21.0.3/16",
                   "IPv6Address": ""
               },
               "c0d5406f42bbcede551e0a032ee275487592be1d8630ea9785de7aad96d6ae2f": {
                   "Name": "cassandra-dc1-node1",
                   "EndpointID": "bb9be0fe4f7dc6dbd54b4e121e734c08bf5fe70a7f065fe06beb784124324755",
                   "MacAddress": "02:42:ac:15:00:07",
                   "IPv4Address": "172.21.0.7/16",
                   "IPv6Address": ""
               }
           },
           "Options": {},
           "Labels": {
               "com.docker.compose.network": "cassandra_network",
               "com.docker.compose.project": "cassandra-cluster",
               "com.docker.compose.version": "2.17.3"
           }
       }
   ]
   ```

4. cqlshに接続

   - cassandraのnodeに接続せずに、cqlshコンテナを起動し、cqlshに接続する。

   ```
   docker-compose run cqlsh
   ```

5. keyspaceの作成

   - 論理データセンターとして、dc1、dc2を作成して、それぞれ3つのノードにデータがレプリケートされる。

   ```cql
   CREATE KEYSPACE store WITH REPLICATION = {'class': 'NetworkTopologyStrategy', 'dc1': 3, 'dc2': 3};
   ```

6. テーブルの作成とデータの挿入

   ```cql
   CREATE TABLE store.cart (
       user_id UUID,               -- ユーザーID
       product_id UUID,            -- 商品ID
       product_name text,          -- 商品名
       price decimal,              -- 価格
       quantity int,               -- 数量
       added_at timestamp,         -- カートに追加された日時
       PRIMARY KEY (user_id, product_id)  -- パーティションキー: user_id, クラスタリングキー: product_id
   );

   -- ユーザー1がSmartphoneをカートに追加
   INSERT INTO store.cart (user_id, product_id, product_name, price, quantity, added_at)
   VALUES (uuid(), uuid(), 'Smartphone', 699.99, 1, toTimestamp(now()));

   -- ユーザー1がLaptopをカートに追加
   INSERT INTO store.cart (user_id, product_id, product_name, price, quantity, added_at)
   VALUES (uuid(), uuid(), 'Laptop', 999.99, 1, toTimestamp(now()));

   -- ユーザー2がHeadphonesをカートに追加
   INSERT INTO store.cart (user_id, product_id, product_name, price, quantity, added_at)
   VALUES (uuid(), uuid(), 'Headphones', 199.99, 2, toTimestamp(now()));
   ```

7. nodetoolによる確認

   - nodetoolはCassandraクラスタの管理ツールで、クラスタやノードのステータス、負荷分散、データの配置などを確認できる
   - 下記結果より、各DCの各ノードが正常に稼働していることが確認できる。

   ```bash
   # cassandra-dc1-node1に接続
   docker exec -it cassandra-dc1-node1 bash

   # nodetool status
   root@c0d5406f42bb:/# nodetool status
   Datacenter: dc1
   ===============
   Status=Up/Down
   |/ State=Normal/Leaving/Joining/Moving
   --  Address     Load        Tokens  Owns (effective)  Host ID                               Rack
   UN  172.21.0.4  682.97 KiB  256     100.0%            c025e663-1629-4fb3-b3b4-675fc71ad856  rack3
   UN  172.21.0.7  629 KiB     256     100.0%            1b2aafbf-8db7-495f-b356-bf197b70810f  rack1
   UN  172.21.0.2  772.07 KiB  256     100.0%            891c3c75-0ba9-40f1-bc42-0f089d8ed7fb  rack2

   Datacenter: dc2
   ===============
   Status=Up/Down
   |/ State=Normal/Leaving/Joining/Moving
   --  Address     Load        Tokens  Owns (effective)  Host ID                               Rack
   UN  172.21.0.5  783.76 KiB  256     100.0%            fd5c3032-b995-45bd-bbe7-a2b01376ea2c  rack1
   UN  172.21.0.3  803.01 KiB  256     100.0%            ec64789a-21ce-448f-a2ea-082e7b630d68  rack2
   UN  172.21.0.6  681.32 KiB  256     100.0%            4d5f499a-ddb8-4822-9a28-17cab66d462f  rack3

   # getendpointsコマンドでどのノードに配置されているのか確認
   # 全てのノードにレプリケーションされていることが確認できる
   root@c0d5406f42bb:/# nodetool getendpoints store cart 6a70d4b7-9338-4603-9aa7-71cefcfdc13b
   172.21.0.3
   172.21.0.4
   172.21.0.5
   172.21.0.7
   172.21.0.6
   172.21.0.2
   ```

8. ノードの停止して起動確認

   - cassandra-dc1-node3を停止させる
   - Status,StateがDNになっていることが確認できる

   ```bash
   root@c0d5406f42bb:/# nodetool status
   Datacenter: dc1
   ===============
   Status=Up/Down
   |/ State=Normal/Leaving/Joining/Moving
   --  Address     Load        Tokens  Owns (effective)  Host ID                               Rack
   DN  172.21.0.4  296.69 KiB  256     100.0%            c025e663-1629-4fb3-b3b4-675fc71ad856  rack3
   UN  172.21.0.7  259.09 KiB  256     100.0%            1b2aafbf-8db7-495f-b356-bf197b70810f  rack1
   UN  172.21.0.2  772.07 KiB  256     100.0%            891c3c75-0ba9-40f1-bc42-0f089d8ed7fb  rack2

   Datacenter: dc2
   ===============
   Status=Up/Down
   |/ State=Normal/Leaving/Joining/Moving
   --  Address     Load        Tokens  Owns (effective)  Host ID                               Rack
   UN  172.21.0.5  783.76 KiB  256     100.0%            fd5c3032-b995-45bd-bbe7-a2b01376ea2c  rack1
   UN  172.21.0.3  803.01 KiB  256     100.0%            ec64789a-21ce-448f-a2ea-082e7b630d68  rack2
   UN  172.21.0.6  681.32 KiB  256     100.0%            4d5f499a-ddb8-4822-9a28-17cab66d462f  rack3
   ```

   - cassandra-dc1-node3を起動させる
   - Status,StateがUNになっていることが確認できる

   ```bash
   root@c0d5406f42bb:/# nodetool status
   Datacenter: dc1
   ===============
   Status=Up/Down
   |/ State=Normal/Leaving/Joining/Moving
   --  Address     Load        Tokens  Owns (effective)  Host ID                               Rack
   UN  172.21.0.4  462.9 KiB   256     100.0%            c025e663-1629-4fb3-b3b4-675fc71ad856  rack3
   UN  172.21.0.7  259.09 KiB  256     100.0%            1b2aafbf-8db7-495f-b356-bf197b70810f  rack1
   UN  172.21.0.2  772.07 KiB  256     100.0%            891c3c75-0ba9-40f1-bc42-0f089d8ed7fb  rack2

   Datacenter: dc2
   ===============
   Status=Up/Down
   |/ State=Normal/Leaving/Joining/Moving
   --  Address     Load        Tokens  Owns (effective)  Host ID                               Rack
   UN  172.21.0.5  783.76 KiB  256     100.0%            fd5c3032-b995-45bd-bbe7-a2b01376ea2c  rack1
   UN  172.21.0.3  803.01 KiB  256     100.0%            ec64789a-21ce-448f-a2ea-082e7b630d68  rack2
   UN  172.21.0.6  681.32 KiB  256     100.0%            4d5f499a-ddb8-4822-9a28-17cab66d462f  rack3
   ```

9. Cassandraクラスタの停止と削除

   ```bash
   docker-compose down
   ```

### まとめ

- Cassandraクラスタを構築し、データの分散保存と冗長化を確認しました。
- Cassandraクラスタは、スニッチ、シードノード、トークンリング、論理データセンター、論理ラックなどの概念を理解して、事前に設計することが重要と考えます。

### 参考

- [https://tech-lab.sios.jp/archives/26915](https://tech-lab.sios.jp/archives/26915)
- [https://hub.docker.com/\_/cassandra](https://hub.docker.com/_/cassandra)
