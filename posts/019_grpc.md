---
title: 'gRPCへ入門'
date: '2024-10-21'
tags: ['gRPC','beginners']
---

### はじめに

- 今までREST APIやGraphQLといったサーバとクライアントの通信手段を使ってきたが、別にGoogleが開発したgRPCというものもあり、そちらも近年利用されるようになってきている。個人的に、gRPCについては利用経験がなく、どのような通信手段で、スキーマ？のようなものが必要なのか？など不明点が多いため、今回はgRPCについて調べ、Webバックエンドで利用されるGo言語での組み込みと合わせて学習していく。

### そもそもRPCとは

- Remote Procedure Callの略
- 「クライアント−サーバー」型の通信プロトコルであり、サーバー上で実装されている関数（Procedure、プロシージャ）をクライアントからの呼び出しに応じて実行する技術
- クライアントからのリクエスト送信方法や、データフォーマットは時代に応じて変化しており、さまざまな実装が存在する。XMLを利用する「XML-RPC」や、JSONを利用する「JSON-RPC」といったものが多く使われている。
- RPCの特徴としてクライアントとサーバにスタブ(Stub)が存在する。RPCにおけるスタブは、クライアントとサーバーの間で通信を抽象化し、ユーザーがリモートのプロシージャをあたかもローカルで実行するかのように見せる重要な役割を果たす。下記に示す通り、クライアント側とサーバー側にはそれぞれ異なる役割を持つスタブが存在する。

  1. クライアントスタブの役割

     1. 関数呼び出しのラッピング.. クライアントがリモートプロシージャを呼び出すとき、クライアントスタブはローカルの関数呼び出しのように動作するため、クライアントはリモート呼び出しの詳細を意識せずに済む。
     2. リクエストのシリアライズ.. クライアントスタブは、呼び出された関数の名前や引数などのデータをシリアライズする。
     3. RPCランタイムへのリクエスト送信.. シリアライズされたデータをRPCランタイムに送信し、リモートサーバーへの通信を開始する。
     4. レスポンス受信後のデシリアライズ.. サーバーから返ってきたレスポンスを受け取ると、それをデシリアライズして、クライアントに対して結果を返す。

  2. サーバースタブの役割

     1. リクエストの受け取りとデシリアライズ.. クライアントスタブから送信されたシリアライズされたリクエストを受信し、デシリアライズして元の関数名や引数などに変換する。
     2. 関数呼び出しのラッピング.. デシリアライズされたデータに基づき、サーバー側で実際のプロシージャを呼び出し、対応する処理を実行する。
     3. 結果のシリアライズ.. プロシージャの実行結果（戻り値など）をシリアライズして、クライアントに返せる形式に変換する。
     4. レスポンスの送信.. シリアライズされたレスポンスをRPCランタイムに渡し、クライアントに送信する

- 下図にRPCを利用した通信の流れを示す
  ![RPC](../posts/rpc_overview.jpg)

### gRPCとは

- **Googleが開発したHTTP/2を利用したRPCフレームワーク**
- 異なるサービス間で効率的かつ高速にデータをやり取りするための仕組みを提供する
- XML-RPCやJSON-RPCは、HTTP/HTTPSやテキストベースのXMLやJSONを利用するため導入が容易である一方、データ転送効率が悪く、バイナリデータの扱いが難しいという問題があった。また、HTTP/HTTPSの使用により長期間の断続的なデータのやり取りやオーバーヘッドによる効率低下も発生していた。これらの課題を解決するために考案されたのがgRPC。

### gRPCの特徴

- **プロトコルバッファ（Protocol Buffers）** というデータのシリアライズフォーマットを使用して、データのやり取りを行う（効率的で軽量なバイナリ形式で通信でき、XMLやJSONよりも高速）。Protobufを使うことで、gRPCは言語に依存しないインターフェース定義（IDL: Interface Definition Language）をサポートし、複数のプログラミング言語での利用が容易になる。
- 多言語対応: 複数のプログラミング言語（Go、Python、Javaなど）に対応しているため、異なる言語で書かれたサービス間でも通信が可能
- 双方向ストリーミング: クライアントとサーバーがリアルタイムで双方向にデータをやり取りするストリーミング通信が可能
- HTTP/2をベースにしており、効率的で高速な通信をサポートする
- インターフェースやメッセージ構造をProtobufのIDL（.protoファイル）で定義しており、このファイルに基づいて、クライアントやサーバーのスタブコードが自動的に生成されるため、手作業でスタブを作成する必要がない。これにより、APIの一貫性が保たれ、開発の効率が向上する効果がある。

### gRPCの仕組み

- RPCのフレームワークなので、RPCの通信と同様に、クライアントとサーバーが通信を行う。
- 流れは下記の通り

  1. インターフェースの定義
     - まず、**.protoファイル** でサービスのインターフェースを定義する。これには、リクエストやレスポンスの形式、使用するRPCメソッド（例えば、Add(a, b)のようなリモート関数）が含まれる。この定義をもとに、クライアントとサーバー間で使う「スタブ（Stub）」を自動生成する。
  2. スタブの自動生成

     - .protoファイルから、クライアントとサーバーの両方で使うスタブが自動的に生成される。

  3. クライアントの関数呼び出し

     - クライアント側では、生成されたスタブを使ってリモートのサーバー上の関数をローカルの関数のように呼び出す。たとえば、client.Add(2, 3)のように呼び出すと、スタブがバックエンドでgRPCランタイムを介してリクエストを作成する。

  4. リクエストの送信（シリアライズ）

     - クライアントスタブは、リクエストデータ（引数やメソッド名）をProtobuf形式でシリアライズし、効率的なバイナリ形式に変換し、その後、HTTP/2を使ってネットワークを介してサーバーに送信する。

  5. サーバーでの処理

     - サーバー側では、受け取ったリクエストをデシリアライズして、実際に定義された関数（メソッド）を実行する。たとえば、サーバーはAdd(2, 3)を実行して結果（5）を生成する。

  6. レスポンスの送信（シリアライズ）

     - サーバーは処理結果をProtobuf形式にシリアライズし、クライアントにレスポンスとして返す（このレスポンスもHTTP/2を介して送信される）。

  7. クライアントでのレスポンス受信
     - クライアント側はレスポンスを受信すると、デシリアライズして結果を取得する。これにより、クライアントはサーバーで実行された計算結果をローカルで実行したかのように利用できる。

### Quick Start

- [gRPC Quick Start](https://grpc.io/docs/languages/go/quickstart/)を参考に進める。

1. Protocol Buffer Compilerのインストール

   ```bash
   sudo apt install -y protobuf-compiler
   protoc --version  # Ensure compiler version is 3+
   ```

2. 必要なパッケージをインストール
   ```bash
   go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
   go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
   export PATH="$PATH:$(go env GOPATH)/bin"
   ```
3. コードを取得

   ```bash
   git clone -b v1.67.0 --depth 1 https://github.com/grpc/grpc-go
   cd grpc-go/examples/helloworld
   ```

4. サーバーのプログラムを実行

   ```bash
   go run greeter_server/main.go
   ```

5. 別のターミナルでクライアントを実行

   ```bash
   go run greeter_client/main.go
   ```

6. 4を実行すると、クライアント側に`2024/10/21 12:01:06 Greeting: Hello world`と表示されることを確認。また、サーバー側には`2024/10/21 12:01:06 Received: world`が表示されることも確認。

7. .protoにサービスを追加

   ```protobuf
   // Sends another greeting
   rpc SayHelloAgain (HelloRequest) returns (HelloReply) {}
   ```

8. .protoファイルをコンパイル

   ```bash
   protoc --go_out=. --go_opt=paths=source_relative \
   --go-grpc_out=. --go-grpc_opt=paths=source_relative \
   helloworld/helloworld.proto
   ```

   - これにより、`helloworld/helloworld.pb.go`と`helloworld/helloworld_grpc.pb.go`が再生成され、クライアントは新しいメソッドを呼び出すためのスタブを持つようになる。

9. サーバー側のプログラムに新しいメソッドを追加

   ```go
   func (s *server) SayHelloAgain(ctx context.Context, in *pb.HelloRequest) (*pb.HelloReply, error) {
       return &pb.HelloReply{Message: "Hello again " + in.GetName()}, nil
   }
   ```

10. クライアント側のプログラムに新しい処理を追加

    ```go
    r, err = c.SayHelloAgain(ctx, &pb.HelloRequest{Name: *name})
    if err != nil {
            log.Fatalf("could not greet: %v", err)
    }
    log.Printf("Greeting: %s", r.GetMessage())
    ```

11. 再度実行

    ```bash
    go run greeter_server/main.go
    go run greeter_client/main.go --name=Alice
    ```

12. クライアント側に下記が表示されることを確認
    ```bash
    2024/10/21 14:10:44 Greeting: Hello Alice
    2024/10/21 14:10:44 Greeting: Hello again Alice
    ```

### サーバー側プログラムの解説

- greeter_server/main.go

  ```go
  // Package main implements a server for Greeter service.
  package main

  import (
      "context"
      "flag"
      "fmt"
      "log"
      "net"

      "google.golang.org/grpc"
      pb "google.golang.org/grpc/examples/helloworld/helloworld"
  )

  var (
      port = flag.Int("port", 50051, "The server port")
  )

  // server is used to implement helloworld.GreeterServer.
  type server struct {
      pb.UnimplementedGreeterServer
  }

  // SayHello implements helloworld.GreeterServer
  func (s *server) SayHello(_ context.Context, in *pb.HelloRequest) (*pb.HelloReply, error) {
      log.Printf("Received: %v", in.GetName())
      return &pb.HelloReply{Message: "Hello " + in.GetName()}, nil
  }

  func (s *server) SayHelloAgain(ctx context.Context, in *pb.HelloRequest) (*pb.HelloReply, error) {
      return &pb.HelloReply{Message: "Hello again " + in.GetName()}, nil
  }

  func main() {
      flag.Parse()
      lis, err := net.Listen("tcp", fmt.Sprintf(":%d", *port))
      if err != nil {
          log.Fatalf("failed to listen: %v", err)
      }
      s := grpc.NewServer()
      pb.RegisterGreeterServer(s, &server{})
      log.Printf("server listening at %v", lis.Addr())
      if err := s.Serve(lis); err != nil {
          log.Fatalf("failed to serve: %v", err)
      }
  }
  ```

* 各コードを解説する

  ```go
  type server struct {
      pb.UnimplementedGreeterServer
  }
  ```

  - server構造体は、gRPCのGreeterサービスのサーバー側の実装。
  - このように、UnimplementedGreeterServerを埋め込むことにより、server構造体はGreeterServerインターフェースを満たすことになる。

  ```go
  func (s *server) SayHello(_ context.Context, in *pb.HelloRequest) (*pb.HelloReply, error) {
      log.Printf("Received: %v", in.GetName())
      return &pb.HelloReply{Message: "Hello " + in.GetName()}, nil
  }
  ```

  - 引数`in`には、クライアントから送信されたHelloRequestメッセージ（リクエストデータ）が入る。このリクエストには、クライアントが送信する名前（in.GetName()）が含まれている。
  - メソッドは、HelloReplyメッセージを返します。このメッセージには、「Hello 名前」という挨拶文が含まれています。

  ```go
  func main() {
      flag.Parse()  // コマンドライン引数の解析
      lis, err := net.Listen("tcp", fmt.Sprintf(":%d", *port))  // TCPで指定ポートでリスン
      if err != nil {
          log.Fatalf("failed to listen: %v", err)
      }

      s := grpc.NewServer()  // gRPCサーバーの作成
      pb.RegisterGreeterServer(s, &server{})  // Greeterサービスの登録
      log.Printf("server listening at %v", lis.Addr())  // サーバーのアドレスをログに出力

      if err := s.Serve(lis); err != nil {  // サーバーの起動
          log.Fatalf("failed to serve: %v", err)
      }
  }
  ```

  - `grpc.NewServer()`で新しいgRPCサーバーを作成。
  - `pb.RegisterGreeterServer()`で、このサーバーに対してGreeterサービスを登録。これにより、クライアントからのリクエストに応答できるようになる。

### クライアント側プログラムの解説

- greeter_client/main.go

  ```go
  // Package main implements a client for Greeter service.
  package main

  import (
      "context"
      "flag"
      "log"
      "time"

      "google.golang.org/grpc"
      "google.golang.org/grpc/credentials/insecure"
      pb "google.golang.org/grpc/examples/helloworld/helloworld"
  )

  const (
      defaultName = "world"
  )

  var (
      addr = flag.String("addr", "localhost:50051", "the address to connect to")
      name = flag.String("name", defaultName, "Name to greet")
  )

  func main() {
      flag.Parse()
      // Set up a connection to the server.
      conn, err := grpc.NewClient(*addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
      if err != nil {
          log.Fatalf("did not connect: %v", err)
      }
      defer conn.Close()
      c := pb.NewGreeterClient(conn)

      // Contact the server and print out its response.
      ctx, cancel := context.WithTimeout(context.Background(), time.Second)
      defer cancel()

      r, err := c.SayHello(ctx, &pb.HelloRequest{Name: *name})
      if err != nil {
          log.Fatalf("could not greet: %v", err)
      }
      log.Printf("Greeting: %s", r.GetMessage())

      r, err = c.SayHelloAgain(ctx, &pb.HelloRequest{Name: *name})
      if err != nil {
          log.Fatalf("could not greet: %v", err)
      }
      log.Printf("Greeting: %s", r.GetMessage())

  }
  ```

- 各コードを解説する

  ```go
  func main() {
      flag.Parse()
      // Set up a connection to the server.
      conn, err := grpc.Dial(*addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
      if err != nil {
          log.Fatalf("did not connect: %v", err)
      }
      defer conn.Close()
      c := pb.NewGreeterClient(conn)
  ```

  - `grpc.Dial()`でサーバーに接続を確立。ここでは、セキュアではない開発用の接続（insecure.NewCredentials()）を使用。
  - `defer conn.Close()` .. 関数が終了する際に接続を閉じることを指定。
  - `pb.NewGreeterClient(conn)` .. サーバーにリクエストを送るためのクライアント（Greeterサービスのクライアントスタブ）を生成する。

  ```go
      // Contact the server and print out its response.
      ctx, cancel := context.WithTimeout(context.Background(), time.Second)
      defer cancel()

      r, err := c.SayHello(ctx, &pb.HelloRequest{Name: *name})
      if err != nil {
          log.Fatalf("could not greet: %v", err)
      }
      log.Printf("Greeting: %s", r.GetMessage())
  }
  ```

  - `context.WithTimeout()` .. タイムアウト付きのコンテキストを生成。ここでは、リクエストが1秒以内に完了するように設定されており、リクエストが1秒を超えるとキャンセルされる。
  - `defer cancel()` .. メイン処理が終了する際にコンテキストをキャンセルする。
  - `c.SayHello(ctx, &pb.HelloRequest{Name: *name})` .. サーバーのSayHelloメソッドを呼び出し、HelloRequestメッセージに名前を含めて送信する。
  - `log.Printf("Greeting: %s", r.GetMessage())` .. サーバーから返ってきたHelloReplyメッセージの内容をログに出力する。

### Protobufファイルの解説

- helloworld.proto

  ```protobuf
  syntax = "proto3";

  option go_package = "google.golang.org/grpc/examples/helloworld/helloworld";
  option java_multiple_files = true;
  option java_package = "io.grpc.examples.helloworld";
  option java_outer_classname = "HelloWorldProto";

  package helloworld;

  // The greeting service definition.
  service Greeter {
    // Sends a greeting
    rpc SayHello (HelloRequest) returns (HelloReply) {}
    // Sends another greeting
    rpc SayHelloAgain (HelloRequest) returns (HelloReply) {}
  }

  // The request message containing the user's name.
  message HelloRequest {
    string name = 1;
  }

  // The response message containing the greetings
  message HelloReply {
    string message = 1;
  }
  ```

* 各コードを解説する

  ```protobuf
  `syntax = "proto3";`
  ```

  - proto3のシンタックスを用いることを明記

  ```protobuf
  option go_package = "google.golang.org/grpc/examples/helloworld/helloworld";
  option java_multiple_files = true;
  option java_package = "io.grpc.examples.helloworld";
  option java_outer_classname = "HelloWorldProto";
  ```

  - go_package: Go言語用の生成コードが格納されるパッケージ名を指定。

  ```protobuf
  service Greeter {
      rpc SayHello (HelloRequest) returns (HelloReply) {}
      rpc SayHelloAgain (HelloRequest) returns (HelloReply) {}
  }
  ```

  - `service Greeter`で**gRPCサービス**を定義しており、Greeterというサービス名を持っている。クライアントはこのサービスを呼び出して、リモートプロシージャを実行できる。
  - `rpc SayHello (HelloRequest) returns (HelloReply) {}`で、**rpc**キーワードを使って、SayHelloというリモートプロシージャを定義している。このプロシージャは、HelloRequestというメッセージを受け取り、HelloReplyというメッセージを返す。

  ```protobuf
  message HelloRequest {
      string name = 1;
  }
  ```

  - `message HelloRequest`で、HelloRequestというメッセージ（リクエスト）を定義している。これが、**クライアントからサーバーへリクエストを送る際のデータ形式**となる。
  - `string name = 1;` .. このメッセージには1つのフィールド「name」が含まれており、文字列型。1はフィールドの識別子で、メッセージの構造を識別するために使われる。クライアントはこの「name」に名前を設定して送信する。

  ```protobuf
  message HelloReply {
      string message = 1;
  }
  ```

  - `message HelloReply`で、HelloReplyというメッセージ（レスポンス）を定義している。これが、サーバーからクライアントに返信するデータ形式となる。
  - `string message = 1;` .. このメッセージには1つのフィールド「message」が含まれており、文字列型。サーバーはこの「message」にレスポンスの挨拶文を設定してクライアントに送る。

### .protoファイルについて

- Protocol Buffersではやり取りするデータを「メッセージ」と呼び、次のような形式でその型（構造）を定義する。

```protobuf
message ＜定義するメッセージ型の名前＞ {
    ＜型＞ ＜フィールド名1＞ = ＜そのフィールドに紐づけるフィールド番号＞;
    ＜型＞ ＜フィールド名2＞ = ＜そのフィールドに紐づけるフィールド番号＞;
    ：
}
```

- 例）

  - 下記のように、HelloRequestというメッセージ型を定義している。
  - 一見すると、1を代入しているようにみえるが、このIDはメッセージをシリアル化する際にフィールドを識別するために利用されるもの。
  - データをバイナリ形式にシリアライズする際に、フィールド名ではなく、この番号を使ってデータを識別する。番号を使うことで、データのサイズを小さく抑えることができ、効率的なデータ転送が可能になる。

  ```protobuf
  message HelloRequest {
      string name = 1;
  }
  ```

### 所感/まとめ

- 今回は、gRPCの基本的な使い方について学習した。
- gRPCだからといって特別なことはあまりなく、その仕組みはRPCのフレームワークであり、意外と単純な構造を持っている。
- grpc.ioより複数のプログラミング言語に組み込む案内がされているため、ソースがはっきりしており、安全に実装ができそう。
- 開発者が関与するのは、クライアントとサーバーのプログラムの作成と、.protoファイルの定義のみで、gRPCの仕組みにより、クライアントとサーバー間の通信が自動的に行われる。GraphQLではスキーマからコードを生成していたように、gRPCでは.protoファイルからコードを生成することで、クライアントとサーバー間の通信を行うことができる。

### 参考

- [gRPC Reference](https://grpc.io/)
- [https://qiita.com/il-m-yamagishi/items/8709de06be33e7051fd2](https://qiita.com/il-m-yamagishi/items/8709de06be33e7051fd2)
- [RPCとRESTの違いはなんですか？](https://aws.amazon.com/jp/compare/the-difference-between-rpc-and-rest/)
- [https://knowledge.sakura.ad.jp/24059/](https://knowledge.sakura.ad.jp/24059/)
