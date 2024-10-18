---
title: 'Golang 整理 1'
date: '2024-10-18'
---

### はじめに

- 書籍「初めてのGo言語」、「詳解Go言語Webアプリケーション開発」や、A Tour of Go、WebフレームワークであるGinやEchoを利用してGolangを学習してきた。その中で自身の中でまとめきれていない部分を整理していく。

### goコマンド

- IDEとしてVSCodeを利用しており、拡張機能を入れているため、実際にコマンドを打つことは少ないが、基本的なコマンドを整理する。

* `go run` .. Goのプログラムを実行する
  ```bash
  go run main.go
  # go runでバイナリファイルがビルドされ、そのファイルを実行
  ```
* `go build` .. Goのプログラムをビルドしてバイナリファイルを生成する
  ```bash
  go build main.go
  # バイナリファイルが生成される
  ```
* `go mod` .. Goのモジュール管理ツール

  ```bash
  go mod init モジュール名
  # モジュールを初期化する

  # 公開する場合は、「github.com/モジュール名」のように指定する
  # 公開しない場合は、モジュール名のみ指定する
  ```

  ```bash
  go mod tidy
  # ソースファイルを解析して、必要なモジュールを自動的に追加、削除する
  ```

* `go install` .. パッケージをビルドして、バイナリファイルを`$GOPATH/bin`にインストールする
  ```bash
  go install モジュール名@バージョン
  ```
* `go get` .. パッケージをダウンロードし、go.modファイルに追加する

  ```bash
  go get github.com/モジュール名@バージョン

  # パッケージの最新のバグ修正や改善を取り込みたい場合や、依存関係全体を更新したい場合は、以下のコマンドを実行する
  go get -u github.com/モジュール名@バージョン
  ```

* `go fmt` .. ソースコードのフォーマットを整える(Golangには標準のフォーマットがある)
  ```bash
  go fmt main.go
  ```
* `go vet` .. ソースコードの静的解析を行う
  ```bash
  go vet main.go
  ```
* `go test` .. テストを実行する
  - テストファイル名は、`*_test.go`とする
  ```bash
  # 全てのテストを実行する
  go test -v ./...
  ```

### Makefile

- 誰が、どこで、いつ実行しても繰り返し自動的にビルドが行えるようにするために`make`コマンドを採用していることが多く、そのために`Makefile`が利用されるらしい。
- `Makefile`の例

  ```Makefile
  ### デフォルトのターゲットを指定
  .DEFAULT_GOAL := build

  fmt:
    go fmt

  lint:
    $(GOPATH)/bin/staticcheck

  test:
    go test -v ./...

  build:
    go mod tidy
    go build

  run:
    go run main.go

  ### 同じ名前のディレクトリが存在した場合に、make がディレクトリをターゲットとして認識しないようにする
  .PHONY: fmt lint test build run
  ```

- `Makefile`のコマンド

  ```bash
  make fmt
  make lint
  make test
  make build
  make run
  ```

### defer

- 関数が終了するタイミングで実行される処理を指定するためのキーワード。
- deferを指定することで、後で実行される関数や処理を予約することができる。
- deferの例

  - os.Open()でファイルを開いた後、deferでファイルを閉じる処理を予約する
  - deferは関数が終了した際に実行されるため、log.Fatal()でパニック終了した際には実行されない。したがって、deferを呼ぶ際には、returnで関数を終了する必要がある。
  - `defer file.Close()`はos.Open()のエラーチェックした後に実行（os.Openがエラーを返した場合、fileはnilになり、file.Close()を呼ぼうとするとnilポインタ参照エラーが発生する可能性があるため）

  ```go
  package main

  import (
    "io"
    "log"
    "os"
  )

  func main() {
    // ファイルを開く
    file, err := os.Open("example.txt")
    if err != nil {
      log.Fatal(err)
    }

    defer file.Close() // main関数が終了するときにファイルを閉じる

    // ファイルの内容を読み込んで標準出力に出力する
    data := make([]byte, 2048)
    for {
      count, err := file.Read(data)
      os.Stdout.Write(data[:count])
      if err != nil {
        if err != io.EOF {
          log.Println(err)
          return
        }
        break
      }
    }
    // ここで関数が終了すると、deferが実行されてfile.Close()が呼ばれる
  }
  ```

### 構造体

- 複数の異なるデータ型の値をまとめて扱うためのデータ構造
- 一般的な構造体の例

  ```go
  package main

  import "fmt"

  type Person struct {
    name string
    age  int
    mail string
  }

  func main() {
    person := Person{
      name: "Taro",
      age:  20,
      mail: "test@example.com",
    }
    fmt.Println(person.name)
    fmt.Println(person.age)
    fmt.Println(person.mail)
  }
  ```

- 上記とは異なり、無名構造体というのもある

  - 無名構造体は、`struct()`という形で定義して、その場でインスタンス化して使用する。
  - 外部データを構造体に変換する（unmarshaling）、構造体を外部データ(JSON)に変換する（marshaling）際に利用される。

  ```go
  package main

  import (
    "encoding/json"
    "fmt"
  )

  func main() {
    /* Marshalの例(Struct -> JSON)
    **********************************************************/
    person := struct {
      Name string
      Age  int
      Mail string
    }{
      Name: "Taro",
      Age:  20,
      Mail: "test@example.com",
    }
    personJson, _ := json.Marshal(person)
    fmt.Println(string(personJson))

    /* Unmarshalの例(JSON -> Struct)
    **********************************************************/
    jsonStr := `{
      "name":"Hanako",
      "age":25,
      "mail":"hoge@example.com"
    }`
    person2 := struct {
      Name string
      Age  int
      Mail string
    }{}
    err := json.Unmarshal([]byte(jsonStr), &person2)
    if err != nil {
      fmt.Println(err)
      return
    }
    fmt.Println(person2)
    fmt.Println(person2.Name)
    fmt.Println(person2.Age)
    fmt.Println(person2.Mail)
  }
  ```

### 並行性

- **ゴルーチン(goroutine)**

  - Golangの並行性のバックボーンとなる機能
  - 呼び出し時に関数名の前に`go`を付けることで、新しいGoroutineを作成し、その中で関数を実行する
  - main()関数が開始すると、一つのGoroutineが自動で生成され、それはメインゴルーチンと呼ばれる。メインゴルーチンが終了すると、他のGoroutineも終了するため、`sync.WaitGroup`や`チャネル`を利用して、Goroutineが終了するのを待つ必要がある。
  - 例)

    1. `sayHello`関数をGoroutineで実行
    2. メイン関数も続行する
    3. Goroutineが終了するのを待つために少し待機

    ```go
    package main

    import (
      "fmt"
      "time"
    )

    func sayHello() {
      fmt.Println("Hello, Goroutine!")
    }

    func main() {
      go sayHello()

      fmt.Println("This is the main function.")

      time.Sleep(1 * time.Second)
    }
    ```

- **チャネル(channel)**

  - goroutine間でデータをやり取りするために、チャネルが利用される。チャネルは、Goroutine間でデータを受け渡すための通信手段であり、チャネルを介してデータを送受信することができる。
  - チャネルの作成は、`make(chan 型)`で行い、チャネルの送受信は`<-`演算子を利用する。

- **WaitGroup**

  - 複数のGoroutineが終了するのを待つための機能
  - `sync.WaitGroup`を利用することで、Goroutineが終了するのを待つことができる。
  - チャネルとWaitGroupを使った例)

    1.  `sendData1`関数と`sendData2`関数をGoroutineで実行
    2.  2つのGoroutineが終了するのを待つ
    3.  チャネルをクローズ
    4.  チャネルからデータを受信

    ```go
    package main

    import (
    	"fmt"
    	"sync"
    )

    func sendData1(ch chan int, wg *sync.WaitGroup) {
    	ch <- 1 // チャネルにデータを送信
    	wg.Done() // カウンタをデクリメント
    }
    func sendData2(ch chan int, wg *sync.WaitGroup) {
    	ch <- 2 // チャネルにデータを送信
    	wg.Done() // カウンタをデクリメント
    }

    func main() {
    	ch := make(chan int, 2) // int型のチャネルを作成

    	// WaitGroupを作成
    	var wg sync.WaitGroup

    	// 2つのGoroutineを起動するために、2つのカウントを追加
    	wg.Add(2)

    	// 2つのGoroutineを起動
    	go sendData1(ch, &wg)
    	go sendData2(ch, &wg)

    	// カウンタが0になるまで待機
    	wg.Wait()

    	// チャネルをクローズ
    	// クローズしないとdeadlockが発生するので注意する
    	close(ch)

    	// チャネルからデータを受信
    	for v := range ch {
    		fmt.Println(v)
    	}
    }
    ```

- 並行処理の利用場面
  - 時間のかかる処理の非同期実行 .. 例）複数のWebリクエストを並行して処理する場合
  - 並列処理によるパフォーマンス向上 .. 例）計算処理やデータの分割処理を並列化する場合
  - 非同期なI/O操作 .. 例）ファイルの読み書きやネットワーク通信などの複数の入出力操作を行う場合
  - リアルタイム処理 .. 例）リアルタイムでのイベント処理やメッセージングシステムなど

### Context

- HTTPサーバの開発においてcontextパッケージの利用は必須。なぜならば、エンドポイントの実装の内部では、クライアントからの通信の切断やタイムアウトはすべてcontext.Context型の値からしか知ることができないため。
- Ginでは、`gin.Context`を利用しており、Echoでは`echo.Context`を利用していることから、Webアプリケーション(HTTPサーバとしてルーティングを行う役割をもつもの）としてcontextパッケージの重要性がわかる。

* Contextのインターフェース(Go Version 1.23.2)
  ```go
  type Context interface {
  	Deadline() (deadline time.Time, ok bool)
  	Done() <-chan struct{}
  	Err() error
  	Value(key any) any
  }
  ```
  - `Deadline() (deadline time.Time, ok bool)`
    - コンテキストが有効な期間（デッドライン）を取得する
  - `Done() <-chan struct{}`
    - 処理がキャンセルされたときやタイムアウトしたときに通知を受け取るためのチャネルを返す
  - `Err() error`
    - コンテキストが終了した理由を取得する(キャンセルされた場合はcontext.Canceled、タイムアウトした場合はcontext.DeadlineExceededが返される)
  - `Value(key any) any`
    - コンテキストに格納されている値を取得するためのメソッド。keyに対応する値を返す。

### 参考

- オライリー・ジャパン「初めてのGo言語」
- [https://zenn.dev/farstep/articles/f712e05bd6ff9d](https://zenn.dev/farstep/articles/f712e05bd6ff9d)
- [https://zenn.dev/hsaki/books/golang-context](https://zenn.dev/hsaki/books/golang-context)
- [https://pkg.go.dev/context](https://pkg.go.dev/context)
