---
title: 'DuckDB🦆入門'
date: '2025-05-05'
tags: ['DuckDB', 'OLAP', 'DB']
isOpen: true
---
### はじめに

* 組み込みのOLAPとしてDuckDBが流行っているので触ってみる
* RDBMS(OLTP)のデータとログ(JSON,CSV,Parquet)を読み込んで良い感じに分析ができれば嬉しい

### DuckDBとは

* 分析処理に特化したインメモリ型の列指向データベース
* 単一のライブラリとして組み込み可能で、外部依存関係がない軽量設計
* データソースとして、MySQLやPostgreSQLなどのRDBMS、CSV、Parquet、JSONなどをサポート
* 名前の由来は[ここ](https://duckdb.org/faq)に記載の通りらしい。一言でまとめると🦆=万能でレジリエンスな生物故
> Ducks are amazing animals. They can fly, walk and swim. They can also live off pretty much everything. They are quite resilient to environmental challenges. A duck's song will bring people back from the dead and inspires database research. They are thus the perfect mascot for a versatile and resilient data management system. Also the logo designs itself.


### DuckDBの基本的な使い方
* WSL2でDuckDBを利用するための手順を書き残す

#### インストール方法
* [DuckDB Installation](https://duckdb.org/docs/installation/?version=stable&environment=cli&platform=linux&download_method=direct&architecture=x86_64)を参考にして、インストールを行う
```bash
curl https://install.duckdb.org | sh
```
* これだけ。依存関係がないので、非常に簡単にインストールできる。（DuckDBをビルドする際にはC++11コンパイルが必要）

#### 起動確認
```bash
$ duckdb
v1.2.2 7c039464e4
Enter ".help" for usage hints.
Connected to a transient in-memory database.
Use ".open FILENAME" to reopen on a persistent database.
D 
```

#### コマンド確認
```bash
D .help
.bail on|off             Stop after hitting an error.  Default OFF
.binary on|off           Turn binary output on or off.  Default OFF
.cd DIRECTORY            Change the working directory to DIRECTORY
.changes on|off          Show number of rows changed by SQL
.check GLOB              Fail if output since .testcase does not match
.columns                 Column-wise rendering of query results
.constant ?COLOR?        Sets the syntax highlighting color used for constant values
.constantcode ?CODE?     Sets the syntax highlighting terminal code used for constant values
.databases               List names and files of attached databases
.decimal_sep SEP         Sets the decimal separator used when rendering numbers. Only for duckbox mode.
.dump ?TABLE?            Render database content as SQL
.echo on|off             Turn command echo on or off
.excel                   Display the output of next command in spreadsheet
.edit                    Opens an external text editor to edit a query.
.exit ?CODE?             Exit this program with return-code CODE
.explain ?on|off|auto?   Change the EXPLAIN formatting mode.  Default: auto
.fullschema ?--indent?   Show schema and the content of sqlite_stat tables
.headers on|off          Turn display of headers on or off
.help ?-all? ?PATTERN?   Show help text for PATTERN
.highlight [on|off]      Toggle syntax highlighting in the shell on/off
.highlight_colors [element] [color]  ([bold])? Configure highlighting colors
.highlight_errors [on|off] Toggle highlighting of errors in the shell on/off
.highlight_results [on|off] Toggle highlighting of results in the shell on/off
.import FILE TABLE       Import data from FILE into TABLE
.indexes ?TABLE?         Show names of indexes
.keyword ?COLOR?         Sets the syntax highlighting color used for keywords
.keywordcode ?CODE?      Sets the syntax highlighting terminal code used for keywords
.large_number_rendering all|footer|off Toggle readable rendering of large numbers (duckbox only)
.log FILE|off            Turn logging on or off.  FILE can be stderr/stdout
.maxrows COUNT           Sets the maximum number of rows for display (default: 40). Only for duckbox mode.
.maxwidth COUNT          Sets the maximum width in characters. 0 defaults to terminal width. Only for duckbox mode.
.mode MODE ?TABLE?       Set output mode
.nullvalue STRING        Use STRING in place of NULL values
.once ?OPTIONS? ?FILE?   Output for the next SQL command only to FILE
.open ?OPTIONS? ?FILE?   Close existing database and reopen FILE
.output ?FILE?           Send output to FILE or stdout if FILE is omitted
.print STRING...         Print literal STRING
.prompt MAIN CONTINUE    Replace the standard prompts
.quit                    Exit this program
.read FILE               Read input from FILE
.rows                    Row-wise rendering of query results (default)
.safe_mode               Enable safe-mode
.schema ?PATTERN?        Show the CREATE statements matching PATTERN
.separator COL ?ROW?     Change the column and row separators
.shell CMD ARGS...       Run CMD ARGS... in a system shell
.show                    Show the current values for various settings
.system CMD ARGS...      Run CMD ARGS... in a system shell
.tables ?TABLE?          List names of tables matching LIKE pattern TABLE
.testcase NAME           Begin redirecting output to 'testcase-out.txt'
.thousand_sep SEP        Sets the thousand separator used when rendering numbers. Only for duckbox mode.
.timer on|off            Turn SQL timer on or off
.width NUM1 NUM2 ...     Set minimum column widths for columnar output
```

### ローカルのJSONファイルの読み込む
* JSONファイルを直接読み込み、分析することが可能
```sql
$ duckdb
D select * from './sample1.json';
┌───────┬──────┬────────────────────────────┬──────┬─────────────────┬───────┬────────────┬─────────────────────┬─────────┬──────────┬──────────┬─────────────┬─────────┬─────────┐
│ title │ url  │            text            │ dead │       by        │ score │    time    │      timestamp      │  type   │    id    │  parent  │ descendants │ ranking │ deleted │
│ json  │ json │          varchar           │ json │     varchar     │ json  │   int64    │      timestamp      │ varchar │  int64   │  int64   │    json     │  json   │  json   │
├───────┼──────┼────────────────────────────┼──────┼─────────────────┼───────┼────────────┼─────────────────────┼─────────┼──────────┼──────────┼─────────────┼─────────┼─────────┤
│ NULL  │ NULL │ &gt; In a word, gardenin…  │ NULL │ yrgulation      │ NULL  │ 1661193469 │ 2022-08-22 18:37:49 │ comment │ 32555398 │ 32554083 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ I actually don&#x27;t kn…  │ NULL │ paulmd          │ NULL  │ 1661193466 │ 2022-08-22 18:37:46 │ comment │ 32555396 │ 32554175 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ 59% of Americans are cor…  │ NULL │ taylodl         │ NULL  │ 1661193469 │ 2022-08-22 18:37:49 │ comment │ 32555397 │ 32551475 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Wrong or not, the point …  │ NULL │ 0x457           │ NULL  │ 1661193453 │ 2022-08-22 18:37:33 │ comment │ 32555394 │ 32526577 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Some problems with that:…  │ NULL │ nopehnnope      │ NULL  │ 1661193457 │ 2022-08-22 18:37:37 │ comment │ 32555395 │ 32555289 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ I dunno. I can imagine a…  │ NULL │ jahewson        │ NULL  │ 1661193447 │ 2022-08-22 18:37:27 │ comment │ 32555392 │ 32555208 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ It took billions of year…  │ NULL │ idlehand        │ NULL  │ 1660592208 │ 2022-08-15 19:36:48 │ comment │ 32474279 │ 32473121 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ So we know there is raci…  │ NULL │ NeverFade       │ NULL  │ 1665327441 │ 2022-10-09 14:57:21 │ comment │ 33141778 │ 33141730 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Tegmark and Musk are bot…  │ NULL │ Comevius        │ NULL  │ 1665327441 │ 2022-10-09 14:57:21 │ comment │ 33141779 │ 33141378 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ <a href="https:&#x2F;&#x…  │ NULL │ dragontamer     │ NULL  │ 1650913215 │ 2022-04-25 19:00:15 │ comment │ 31159189 │ 31158230 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ you&#x27;ll get older an…  │ NULL │ pasquinelli     │ NULL  │ 1665327421 │ 2022-10-09 14:57:01 │ comment │ 33141774 │ 33141563 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ heh, right now I have ha…  │ NULL │ kop316          │ NULL  │ 1665327436 │ 2022-10-09 14:57:16 │ comment │ 33141776 │ 33140798 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ This assumes that the hu…  │ NULL │ cdiamand        │ NULL  │ 1665327437 │ 2022-10-09 14:57:17 │ comment │ 33141777 │ 33140527 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ From Glassdoor for relat…  │ NULL │ O__________O    │ NULL  │ 1665327406 │ 2022-10-09 14:56:46 │ comment │ 33141770 │ 33139827 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ This is a US lawsuit, fi…  │ NULL │ rchaud          │ NULL  │ 1665327409 │ 2022-10-09 14:56:49 │ comment │ 33141771 │ 33141389 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ It&#x27;s like people co…  │ NULL │ y42             │ NULL  │ 1665327414 │ 2022-10-09 14:56:54 │ comment │ 33141772 │ 33139315 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ A decade of forgetting t…  │ NULL │ jaimex2         │ NULL  │ 1658296413 │ 2022-07-20 05:53:33 │ comment │ 32161945 │ 32161426 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ No, you shouldn&#x27;t b…  │ NULL │ vmception       │ NULL  │ 1650913195 │ 2022-04-25 18:59:55 │ comment │ 31159183 │ 31157730 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ &gt; like everyone else<…  │ NULL │ melvinmelih     │ NULL  │ 1649090340 │ 2022-04-04 16:39:00 │ comment │ 30908688 │ 30907193 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Pushed to Github, please…  │ NULL │ CoolCold        │ NULL  │ 1654432287 │ 2022-06-05 12:31:27 │ comment │ 31630394 │ 31630229 │ NULL        │ NULL    │ NULL    │
│  ·    │  ·   │             ·              │  ·   │    ·            │  ·    │      ·     │          ·          │    ·    │     ·    │     ·    │  ·          │  ·      │  ·      │
│  ·    │  ·   │             ·              │  ·   │    ·            │  ·    │      ·     │          ·          │    ·    │     ·    │     ·    │  ·          │  ·      │  ·      │
│  ·    │  ·   │             ·              │  ·   │    ·            │  ·    │      ·     │          ·          │    ·    │     ·    │     ·    │  ·          │  ·      │  ·      │
│ NULL  │ NULL │ When everything went vir…  │ NULL │ munificent      │ NULL  │ 1651167687 │ 2022-04-28 17:41:27 │ comment │ 31195609 │ 31194535 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ &gt; The authors show ho…  │ NULL │ RcouF1uZ4gsC    │ NULL  │ 1644340008 │ 2022-02-08 17:06:48 │ comment │ 30261032 │ 30259170 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ I can see the appeal, bu…  │ NULL │ stinkytaco      │ NULL  │ 1644340000 │ 2022-02-08 17:06:40 │ comment │ 30261030 │ 30260614 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Fully agree. A diagram i…  │ NULL │ davidy123       │ NULL  │ 1654356207 │ 2022-06-04 15:23:27 │ comment │ 31621377 │ 31620520 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Lol at the first comment…  │ NULL │ alasdair_       │ NULL  │ 1668233048 │ 2022-11-12 06:04:08 │ comment │ 33570437 │ 33570257 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ An average L7 at Amazon …  │ NULL │ renewiltord     │ NULL  │ 1651167676 │ 2022-04-28 17:41:16 │ comment │ 31195608 │ 31192306 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ No, in this case the sho…  │ NULL │ gamblor956      │ NULL  │ 1651167663 │ 2022-04-28 17:41:03 │ comment │ 31195606 │ 31195371 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Is it possible to at lea…  │ NULL │ eimrine         │ NULL  │ 1661699635 │ 2022-08-28 15:13:55 │ comment │ 32629019 │ 32628783 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Going through the effort…  │ NULL │ dymk            │ NULL  │ 1661699609 │ 2022-08-28 15:13:29 │ comment │ 32629018 │ 32628870 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ That is a nice thought, …  │ NULL │ TrainedMonkey   │ NULL  │ 1651167663 │ 2022-04-28 17:41:03 │ comment │ 31195604 │ 31195447 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Sunlight is one of the m…  │ NULL │ g_log           │ NULL  │ 1647435074 │ 2022-03-16 12:51:14 │ comment │ 30698117 │ 30689043 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Simple enough to trust e…  │ NULL │ kache_          │ NULL  │ 1662743138 │ 2022-09-09 17:05:38 │ comment │ 32781940 │ 32780388 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Thanks!                    │ NULL │ carapace        │ NULL  │ 1662743141 │ 2022-09-09 17:05:41 │ comment │ 32781941 │ 32774989 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ P-Lisp ran on an Apple I…  │ NULL │ lisper          │ NULL  │ 1662743142 │ 2022-09-09 17:05:42 │ comment │ 32781942 │ 32781295 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ It’s simple. Mobile user…  │ NULL │ throwaway_4ever │ NULL  │ 1662743146 │ 2022-09-09 17:05:46 │ comment │ 32781944 │ 32781354 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ So dont do it at all? Be…  │ NULL │ rgbrenner       │ NULL  │ 1662743147 │ 2022-09-09 17:05:47 │ comment │ 32781945 │ 32781779 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ It&#x27;s not their job …  │ NULL │ sofixa          │ NULL  │ 1662743153 │ 2022-09-09 17:05:53 │ comment │ 32781946 │ 32781317 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ I&#x27;m not going to de…  │ NULL │ nradov          │ NULL  │ 1662743158 │ 2022-09-09 17:05:58 │ comment │ 32781947 │ 32781699 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ I use the &quot;hide&quo…  │ NULL │ dpkirchner      │ NULL  │ 1662743175 │ 2022-09-09 17:06:15 │ comment │ 32781949 │ 32781906 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Local inprocess database…  │ NULL │ cromd           │ NULL  │ 1652811280 │ 2022-05-17 18:14:40 │ comment │ 31414449 │ 31413617 │ NULL        │ NULL    │ NULL    │
├───────┴──────┴────────────────────────────┴──────┴─────────────────┴───────┴────────────┴─────────────────────┴─────────┴──────────┴──────────┴─────────────┴─────────┴─────────┤
│ 1000 rows (40 shown)                                                                                                                                                 14 columns │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

* 下記のようにSQLの条件を指定して、特定のレコードを取得することも可能
```sql
-- Where句を使って、特定の条件に合致するレコードを取得
D select * from './sample1.json' where id = 32555398;
┌───────┬──────┬──────────────────────────────────────────────────────────┬──────┬────────────┬───────┬────────────┬─────────────────────┬─────────┬──────────┬──────────┬─────────────┬─────────┬─────────┐
│ title │ url  │                           text                           │ dead │     by     │ score │    time    │      timestamp      │  type   │    id    │  parent  │ descendants │ ranking │ deleted │
│ json  │ json │                         varchar                          │ json │  varchar   │ json  │   int64    │      timestamp      │ varchar │  int64   │  int64   │    json     │  json   │  json   │
├───────┼──────┼──────────────────────────────────────────────────────────┼──────┼────────────┼───────┼────────────┼─────────────────────┼─────────┼──────────┼──────────┼─────────────┼─────────┼─────────┤
│ NULL  │ NULL │ &gt; In a word, gardening. It&#x27;s very fulfilling.<…  │ NULL │ yrgulation │ NULL  │ 1661193469 │ 2022-08-22 18:37:49 │ comment │ 32555398 │ 32554083 │ NULL        │ NULL    │ NULL    │
└───────┴──────┴──────────────────────────────────────────────────────────┴──────┴────────────┴───────┴────────────┴─────────────────────┴─────────┴──────────┴──────────┴─────────────┴─────────┴─────────┘

-- order by句を使って、特定の条件に合致するレコードを取得
D select * from './sample1.json' order by id desc limit 10;
┌───────┬──────┬───────────────────────────────────────────────────────┬──────┬───────────────┬───────┬────────────┬─────────────────────┬─────────┬──────────┬──────────┬─────────────┬─────────┬─────────┐
│ title │ url  │                         text                          │ dead │      by       │ score │    time    │      timestamp      │  type   │    id    │  parent  │ descendants │ ranking │ deleted │
│ json  │ json │                        varchar                        │ json │    varchar    │ json  │   int64    │      timestamp      │ varchar │  int64   │  int64   │    json     │  json   │  json   │
├───────┼──────┼───────────────────────────────────────────────────────┼──────┼───────────────┼───────┼────────────┼─────────────────────┼─────────┼──────────┼──────────┼─────────────┼─────────┼─────────┤
│ NULL  │ NULL │ Does Facebook&#x2F;Meta still use Phabricator inter…  │ NULL │ paradite      │ NULL  │ 1668585474 │ 2022-11-16 07:57:54 │ comment │ 33620238 │ 33614526 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ You’re missing the key piece: we can still spend th…  │ NULL │ systemvoltage │ NULL  │ 1668585449 │ 2022-11-16 07:57:29 │ comment │ 33620234 │ 33620088 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Care to provide any actual examples?                  │ NULL │ freejazz      │ NULL  │ 1668537268 │ 2022-11-15 18:34:28 │ comment │ 33613087 │ 33611059 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Knowing her, it&#x27;s &quot;Put your fucking phone…  │ NULL │ Workaccount2  │ NULL  │ 1668537260 │ 2022-11-15 18:34:20 │ comment │ 33613086 │ 33611285 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ This is a great point - crypto will have utility.<p…  │ NULL │ glofish       │ NULL  │ 1668443485 │ 2022-11-14 16:31:25 │ comment │ 33596558 │ 33596278 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ It&#x27;s also easier to cut costs from a premium-p…  │ NULL │ jedc          │ NULL  │ 1668443476 │ 2022-11-14 16:31:16 │ comment │ 33596554 │ 33596300 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Lol at the first comment from over a year ago: “ Ma…  │ NULL │ alasdair_     │ NULL  │ 1668233048 │ 2022-11-12 06:04:08 │ comment │ 33570437 │ 33570257 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Huh, I&#x27;ve only heard about luxury beliefs in t…  │ NULL │ hooverd       │ NULL  │ 1668096065 │ 2022-11-10 16:01:05 │ comment │ 33548379 │ 33547954 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ &gt; the number of screens is small and there are f…  │ NULL │ strix_varius  │ NULL  │ 1668096059 │ 2022-11-10 16:00:59 │ comment │ 33548377 │ 33547911 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Curious: In &quot;Clean records from titanic data w…  │ NULL │ danwee        │ NULL  │ 1668096056 │ 2022-11-10 16:00:56 │ comment │ 33548375 │ 33543946 │ NULL        │ NULL    │ NULL    │
├───────┴──────┴───────────────────────────────────────────────────────┴──────┴───────────────┴───────┴────────────┴─────────────────────┴─────────┴──────────┴──────────┴─────────────┴─────────┴─────────┤
│ 10 rows                                                                                                                                                                                       14 columns │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### S3上の単一のJSONファイルの読み込む
* localstack上にS3を起動し、そこにJSONファイルをアップロードしてDuckDBから直接読み込んでみる
```sql
duckdb

-- S3/HTTP にアクセスする拡張を導入
D INSTALL httpfs;
D LOAD   httpfs;

-- Secrets マネージャを使用して、S3の認証情報を設定
-- PERSISTENTを指定しない場合は一時的なシークレット情報になる
D CREATE OR REPLACE PERSISTENT SECRET localstack_s3 (
    TYPE      s3,
    ENDPOINT  'localhost:4566',
    USE_SSL   false,
    URL_STYLE 'path',
    REGION    'ap-northeast-1',
    KEY_ID    'xxx',
    SECRET    'xxx',
    SCOPE     's3://sample-bucket'
);

-- S3のシークレット情報を確認
D FROM duckdb_secrets();
┌───────────────┬─────────┬──────────┬────────────┬─────────┬──────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│     name      │  type   │ provider │ persistent │ storage │        scope         │                                                     secret_string                                                     │
│    varchar    │ varchar │ varchar  │  boolean   │ varchar │      varchar[]       │                                                        varchar                                                        │
├───────────────┼─────────┼──────────┼────────────┼─────────┼──────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ localstack_s3 │ s3      │ config   │ false      │ memory  │ [s3://, s3n://, s3…  │ name=localstack_s3;type=s3;provider=config;serializable=true;scope=s3://,s3n://,s3a://;endpoint=http://localhost:45…  │
└───────────────┴─────────┴──────────┴────────────┴─────────┴──────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

-- S3のJSONファイルを読み込む
D SELECT * FROM read_json_auto('s3://sample-bucket/export.json');
┌───────┬──────┬─────────────────────────────────────────────────────┬──────┬─────────────────┬───────┬────────────┬─────────────────────┬─────────┬──────────┬──────────┬─────────────┬─────────┬─────────┐
│ title │ url  │                        text                         │ dead │       by        │ score │    time    │      timestamp      │  type   │    id    │  parent  │ descendants │ ranking │ deleted │
│ json  │ json │                       varchar                       │ json │     varchar     │ json  │   int64    │      timestamp      │ varchar │  int64   │  int64   │    json     │  json   │  json   │
├───────┼──────┼─────────────────────────────────────────────────────┼──────┼─────────────────┼───────┼────────────┼─────────────────────┼─────────┼──────────┼──────────┼─────────────┼─────────┼─────────┤
│ NULL  │ NULL │ &gt; In a word, gardening. It&#x27;s very fulfill…  │ NULL │ yrgulation      │ NULL  │ 1661193469 │ 2022-08-22 18:37:49 │ comment │ 32555398 │ 32554083 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ I actually don&#x27;t know what you mean by that,…  │ NULL │ paulmd          │ NULL  │ 1661193466 │ 2022-08-22 18:37:46 │ comment │ 32555396 │ 32554175 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ 59% of Americans are correct, but damn! Have they…  │ NULL │ taylodl         │ NULL  │ 1661193469 │ 2022-08-22 18:37:49 │ comment │ 32555397 │ 32551475 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Wrong or not, the point is that many websites tha…  │ NULL │ 0x457           │ NULL  │ 1661193453 │ 2022-08-22 18:37:33 │ comment │ 32555394 │ 32526577 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Some problems with that:<p>* The US had a single …  │ NULL │ nopehnnope      │ NULL  │ 1661193457 │ 2022-08-22 18:37:37 │ comment │ 32555395 │ 32555289 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ I dunno. I can imagine any of those points being …  │ NULL │ jahewson        │ NULL  │ 1661193447 │ 2022-08-22 18:37:27 │ comment │ 32555392 │ 32555208 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ It took billions of years to get to that point, t…  │ NULL │ idlehand        │ NULL  │ 1660592208 │ 2022-08-15 19:36:48 │ comment │ 32474279 │ 32473121 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ So we know there is racial discrimination against…  │ NULL │ NeverFade       │ NULL  │ 1665327441 │ 2022-10-09 14:57:21 │ comment │ 33141778 │ 33141730 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Tegmark and Musk are both dumb people posing as i…  │ NULL │ Comevius        │ NULL  │ 1665327441 │ 2022-10-09 14:57:21 │ comment │ 33141779 │ 33141378 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ <a href="https:&#x2F;&#x2F;twitter.com&#x2F;elonm…  │ NULL │ dragontamer     │ NULL  │ 1650913215 │ 2022-04-25 19:00:15 │ comment │ 31159189 │ 31158230 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ you&#x27;ll get older and things will happen to y…  │ NULL │ pasquinelli     │ NULL  │ 1665327421 │ 2022-10-09 14:57:01 │ comment │ 33141774 │ 33141563 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ heh, right now I have had an issue where in Strip…  │ NULL │ kop316          │ NULL  │ 1665327436 │ 2022-10-09 14:57:16 │ comment │ 33141776 │ 33140798 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ This assumes that the human mind can continue to …  │ NULL │ cdiamand        │ NULL  │ 1665327437 │ 2022-10-09 14:57:17 │ comment │ 33141777 │ 33140527 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ From Glassdoor for related employer:<p><a href="h…  │ NULL │ O__________O    │ NULL  │ 1665327406 │ 2022-10-09 14:56:46 │ comment │ 33141770 │ 33139827 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ This is a US lawsuit, filed by a non-Indian Infos…  │ NULL │ rchaud          │ NULL  │ 1665327409 │ 2022-10-09 14:56:49 │ comment │ 33141771 │ 33141389 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ It&#x27;s like people conplaining about SAP. SAP …  │ NULL │ y42             │ NULL  │ 1665327414 │ 2022-10-09 14:56:54 │ comment │ 33141772 │ 33139315 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ A decade of forgetting to append - &#x27;for me&#…  │ NULL │ jaimex2         │ NULL  │ 1658296413 │ 2022-07-20 05:53:33 │ comment │ 32161945 │ 32161426 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ No, you shouldn&#x27;t be angry you should be obj…  │ NULL │ vmception       │ NULL  │ 1650913195 │ 2022-04-25 18:59:55 │ comment │ 31159183 │ 31157730 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ &gt; like everyone else<p>We&#x27;re talking abou…  │ NULL │ melvinmelih     │ NULL  │ 1649090340 │ 2022-04-04 16:39:00 │ comment │ 30908688 │ 30907193 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Pushed to Github, please take a look - <a href="h…  │ NULL │ CoolCold        │ NULL  │ 1654432287 │ 2022-06-05 12:31:27 │ comment │ 31630394 │ 31630229 │ NULL        │ NULL    │ NULL    │
│  ·    │  ·   │                          ·                          │  ·   │    ·            │  ·    │      ·     │          ·          │    ·    │     ·    │     ·    │  ·          │  ·      │  ·      │
│  ·    │  ·   │                          ·                          │  ·   │    ·            │  ·    │      ·     │          ·          │    ·    │     ·    │     ·    │  ·          │  ·      │  ·      │
│  ·    │  ·   │                          ·                          │  ·   │    ·            │  ·    │      ·     │          ·          │    ·    │     ·    │     ·    │  ·          │  ·      │  ·      │
│ NULL  │ NULL │ When everything went virtual during the pandemic,…  │ NULL │ munificent      │ NULL  │ 1651167687 │ 2022-04-28 17:41:27 │ comment │ 31195609 │ 31194535 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ &gt; The authors show how a circle can be squared…  │ NULL │ RcouF1uZ4gsC    │ NULL  │ 1644340008 │ 2022-02-08 17:06:48 │ comment │ 30261032 │ 30259170 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ I can see the appeal, but I don&#x27;t think that…  │ NULL │ stinkytaco      │ NULL  │ 1644340000 │ 2022-02-08 17:06:40 │ comment │ 30261030 │ 30260614 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Fully agree. A diagram is ok to describe a flow, …  │ NULL │ davidy123       │ NULL  │ 1654356207 │ 2022-06-04 15:23:27 │ comment │ 31621377 │ 31620520 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Lol at the first comment from over a year ago: “ …  │ NULL │ alasdair_       │ NULL  │ 1668233048 │ 2022-11-12 06:04:08 │ comment │ 33570437 │ 33570257 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ An average L7 at Amazon will see that &quot;limit…  │ NULL │ renewiltord     │ NULL  │ 1651167676 │ 2022-04-28 17:41:16 │ comment │ 31195608 │ 31192306 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ No, in this case the shop is in California, where…  │ NULL │ gamblor956      │ NULL  │ 1651167663 │ 2022-04-28 17:41:03 │ comment │ 31195606 │ 31195371 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Is it possible to at least register new account w…  │ NULL │ eimrine         │ NULL  │ 1661699635 │ 2022-08-28 15:13:55 │ comment │ 32629019 │ 32628783 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Going through the effort of hacking the firmware …  │ NULL │ dymk            │ NULL  │ 1661699609 │ 2022-08-28 15:13:29 │ comment │ 32629018 │ 32628870 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ That is a nice thought, however twitter locked do…  │ NULL │ TrainedMonkey   │ NULL  │ 1651167663 │ 2022-04-28 17:41:03 │ comment │ 31195604 │ 31195447 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Sunlight is one of the most powerful zeitgebers a…  │ NULL │ g_log           │ NULL  │ 1647435074 │ 2022-03-16 12:51:14 │ comment │ 30698117 │ 30689043 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Simple enough to trust employees to be conscienti…  │ NULL │ kache_          │ NULL  │ 1662743138 │ 2022-09-09 17:05:38 │ comment │ 32781940 │ 32780388 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Thanks!                                             │ NULL │ carapace        │ NULL  │ 1662743141 │ 2022-09-09 17:05:41 │ comment │ 32781941 │ 32774989 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ P-Lisp ran on an Apple II: <a href="https:&#x2F;&…  │ NULL │ lisper          │ NULL  │ 1662743142 │ 2022-09-09 17:05:42 │ comment │ 32781942 │ 32781295 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ It’s simple. Mobile users are genpop while PC gam…  │ NULL │ throwaway_4ever │ NULL  │ 1662743146 │ 2022-09-09 17:05:46 │ comment │ 32781944 │ 32781354 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ So dont do it at all? Because the republicans are…  │ NULL │ rgbrenner       │ NULL  │ 1662743147 │ 2022-09-09 17:05:47 │ comment │ 32781945 │ 32781779 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ It&#x27;s not their job to build, it&#x27;s their…  │ NULL │ sofixa          │ NULL  │ 1662743153 │ 2022-09-09 17:05:53 │ comment │ 32781946 │ 32781317 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ I&#x27;m not going to defend deceptive dealership…  │ NULL │ nradov          │ NULL  │ 1662743158 │ 2022-09-09 17:05:58 │ comment │ 32781947 │ 32781699 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ I use the &quot;hide&quot; button to tailor my HN…  │ NULL │ dpkirchner      │ NULL  │ 1662743175 │ 2022-09-09 17:06:15 │ comment │ 32781949 │ 32781906 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Local inprocess databases might be a bigger thing…  │ NULL │ cromd           │ NULL  │ 1652811280 │ 2022-05-17 18:14:40 │ comment │ 31414449 │ 31413617 │ NULL        │ NULL    │ NULL    │
├───────┴──────┴─────────────────────────────────────────────────────┴──────┴─────────────────┴───────┴────────────┴─────────────────────┴─────────┴──────────┴──────────┴─────────────┴─────────┴─────────┤
│ 1000 rows (40 shown)                                                                                                                                                                          14 columns │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### S3上の複数のJSONファイルの読み込む
* ログをS3上に吐き出す想定なら、複数のJSONを跨いで分析する必要性がある
* `s3://sample-bucket/log/2025-05-05_export1.json` ~ `export3.json`を用意して読み込む
```sql
-- 複数のJSONファイルを読み込むためにワイルドカードを利用して複数のファイルを指定できる
D SELECT * FROM read_json_auto('s3://sample-bucket/log/2025-05-05*');
┌───────┬──────┬──────────────────────────────────────────────────────┬──────┬────────────────┬───────┬────────────┬─────────────────────┬─────────┬──────────┬──────────┬─────────────┬─────────┬─────────┐
│ title │ url  │                         text                         │ dead │       by       │ score │    time    │      timestamp      │  type   │    id    │  parent  │ descendants │ ranking │ deleted │
│ json  │ json │                       varchar                        │ json │    varchar     │ json  │   int64    │      timestamp      │ varchar │  int64   │  int64   │    json     │  json   │  json   │
├───────┼──────┼──────────────────────────────────────────────────────┼──────┼────────────────┼───────┼────────────┼─────────────────────┼─────────┼──────────┼──────────┼─────────────┼─────────┼─────────┤
│ NULL  │ NULL │ Me too with same tools.                              │ NULL │ aleksiy123     │ NULL  │ 1652811247 │ 2022-05-17 18:14:07 │ comment │ 31414441 │ 31413624 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ You do that on the phone? I&#x27;d never.<p>And no…  │ NULL │ brnaftr361     │ NULL  │ 1652811240 │ 2022-05-17 18:14:00 │ comment │ 31414440 │ 31413910 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ &gt;You know, if you&#x27;d actually attempted thi…  │ NULL │ catern         │ NULL  │ 1652811252 │ 2022-05-17 18:14:12 │ comment │ 31414443 │ 31399227 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ &gt; It comes down to you, are you using that as f…  │ NULL │ colpabar       │ NULL  │ 1652811251 │ 2022-05-17 18:14:11 │ comment │ 31414442 │ 31413572 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Let&#x27;s say you&#x27;re trying to train an mode…  │ NULL │ eklitzke       │ NULL  │ 1652811260 │ 2022-05-17 18:14:20 │ comment │ 31414445 │ 31410190 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ This article focuses on returns of VC investment. …  │ NULL │ mattwest       │ NULL  │ 1652811252 │ 2022-05-17 18:14:12 │ comment │ 31414444 │ 31380555 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ I believe most explosives detonate in the air anym…  │ NULL │ oneoff786      │ NULL  │ 1652811275 │ 2022-05-17 18:14:35 │ comment │ 31414447 │ 31412983 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ I can&#x27;t speak for Amazon, but in finance, emp…  │ NULL │ kolbe          │ NULL  │ 1652811265 │ 2022-05-17 18:14:25 │ comment │ 31414446 │ 31412141 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ It’s a weird experience, a bit uncanny valley like…  │ NULL │ panda88888     │ NULL  │ 1651167647 │ 2022-04-28 17:40:47 │ comment │ 31195600 │ 31183064 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ On the bright side: if this was Google, I wouldn&#…  │ NULL │ Aulig          │ NULL  │ 1658869307 │ 2022-07-26 21:01:47 │ comment │ 32243953 │ 32242987 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Yeah, because satisfying shareholders is more impo…  │ NULL │ BizarroLand    │ NULL  │ 1645835838 │ 2022-02-26 00:37:18 │ comment │ 30474204 │ 30473406 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Where do you find those videos? On Twitter?          │ NULL │ 2-718-281-828  │ NULL  │ 1645835851 │ 2022-02-26 00:37:31 │ comment │ 30474205 │ 30474001 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ I think it&#x27;s unrealistic for any engineer to …  │ NULL │ whakim         │ NULL  │ 1645835865 │ 2022-02-26 00:37:45 │ comment │ 30474206 │ 30473550 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ &gt; Of course a PhD is not the best decision if y…  │ NULL │ timr           │ NULL  │ 1651765004 │ 2022-05-05 15:36:44 │ comment │ 31274702 │ 31274501 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ The ability to escape online was really nice. Ther…  │ NULL │ ceedan         │ NULL  │ 1651765005 │ 2022-05-05 15:36:45 │ comment │ 31274703 │ 31274495 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Does anyone else get that deep, dark, disturbing f…  │ NULL │ alkaloid       │ NULL  │ 1651764991 │ 2022-05-05 15:36:31 │ comment │ 31274700 │ 31271451 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ I found that using different programming languages…  │ NULL │ simonblack     │ NULL  │ 1645835885 │ 2022-02-26 00:38:05 │ comment │ 30474207 │ 30467374 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ I use them sometimes for component or sequence dia…  │ NULL │ emerged        │ NULL  │ 1651765018 │ 2022-05-05 15:36:58 │ comment │ 31274706 │ 31273941 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ I&#x27;m not from the US and I&#x27;ve never lived…  │ NULL │ pier25         │ NULL  │ 1651765020 │ 2022-05-05 15:37:00 │ comment │ 31274707 │ 31272061 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ If anybody wants an opposing view to this, read Ay…  │ NULL │ javert         │ NULL  │ 1651765012 │ 2022-05-05 15:36:52 │ comment │ 31274704 │ 31274148 │ NULL        │ NULL    │ NULL    │
│  ·    │  ·   │                          ·                           │  ·   │   ·            │  ·    │      ·     │          ·          │    ·    │     ·    │     ·    │  ·          │  ·      │  ·      │
│  ·    │  ·   │                          ·                           │  ·   │   ·            │  ·    │      ·     │          ·          │    ·    │     ·    │     ·    │  ·          │  ·      │  ·      │
│  ·    │  ·   │                          ·                           │  ·   │   ·            │  ·    │      ·     │          ·          │    ·    │     ·    │     ·    │  ·          │  ·      │  ·      │
│ NULL  │ NULL │ Thank your good graces the state doesn’t freeze yo…  │ NULL │ randomhodler84 │ NULL  │ 1646685598 │ 2022-03-07 20:39:58 │ comment │ 30593050 │ 30592977 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Every financial institution that processes your ba…  │ NULL │ politician     │ NULL  │ 1646685623 │ 2022-03-07 20:40:23 │ comment │ 30593053 │ 30592969 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ BBB has not been relevant for at least a couple de…  │ NULL │ lotsofpulp     │ NULL  │ 1646685611 │ 2022-03-07 20:40:11 │ comment │ 30593052 │ 30592653 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ My personal website has been online since 1994 and…  │ NULL │ jjav           │ NULL  │ 1662282063 │ 2022-09-04 09:01:03 │ comment │ 32711215 │ 32701685 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Was a Keep fan until I got a few thousand notes in…  │ NULL │ scioto         │ NULL  │ 1662282051 │ 2022-09-04 09:00:51 │ comment │ 32711214 │ 32710053 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ A lot of forums seem to have gone the same way whe…  │ NULL │ dazc           │ NULL  │ 1662282094 │ 2022-09-04 09:01:34 │ comment │ 32711217 │ 32710807 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Unicode is primarily concerned with standardizing …  │ NULL │ funcDropShadow │ NULL  │ 1662282033 │ 2022-09-04 09:00:33 │ comment │ 32711211 │ 32710895 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ &gt; If you don&#x27;t believe individuals have a …  │ NULL │ throwawaylinux │ NULL  │ 1662282032 │ 2022-09-04 09:00:32 │ comment │ 32711210 │ 32711127 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ I wish Firefox would natively let us silently take…  │ NULL │ sprucevoid     │ NULL  │ 1646902787 │ 2022-03-10 08:59:47 │ comment │ 30624765 │ 30623911 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Ruby Together merged with Ruby Central.\nSee here:…  │ NULL │ hit8run        │ NULL  │ 1646902816 │ 2022-03-10 09:00:16 │ comment │ 30624766 │ 30622186 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Thanks, that link seems interesting and relevant!<…  │ NULL │ ensiferum      │ NULL  │ 1646902817 │ 2022-03-10 09:00:17 │ comment │ 30624767 │ 30624650 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ While losing weight, I would not replace it, but s…  │ NULL │ scscsc         │ NULL  │ 1646902709 │ 2022-03-10 08:58:29 │ comment │ 30624761 │ 30624722 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ I agree with your point about the dangers of right…  │ NULL │ jesseduffield  │ NULL  │ 1646902720 │ 2022-03-10 08:58:40 │ comment │ 30624762 │ 30624584 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ I will absolute do what I can to grow employees. B…  │ NULL │ hvidgaard      │ NULL  │ 1646902721 │ 2022-03-10 08:58:41 │ comment │ 30624763 │ 30620939 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Can you just shutdown your nodes or can they force…  │ NULL │ bauruine       │ NULL  │ 1646902821 │ 2022-03-10 09:00:21 │ comment │ 30624769 │ 30624352 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Isreal has a well established history of not honor…  │ NULL │ mobiclick      │ NULL  │ 1662282049 │ 2022-09-04 09:00:49 │ comment │ 32711213 │ 32707268 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ It may be that the vastness of time is the real fi…  │ NULL │ demygale       │ NULL  │ 1651897905 │ 2022-05-07 04:31:45 │ comment │ 31292154 │ 31290196 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ In the US, a restraining order issued by a court i…  │ NULL │ the_why_of_y   │ NULL  │ 1662282035 │ 2022-09-04 09:00:35 │ comment │ 32711212 │ 32710730 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ &quot;iTs nOt aT aLl oNeRoUs&quot; said the DPO. l…  │ NULL │ DisjointedHunt │ NULL  │ 1656137068 │ 2022-06-25 06:04:28 │ comment │ 31872948 │ 31868395 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ &gt; and turn it blue with all the love of diversi…  │ NULL │ cbozeman       │ NULL  │ 1656137083 │ 2022-06-25 06:04:43 │ comment │ 31872949 │ 31872345 │ NULL        │ NULL    │ NULL    │
├───────┴──────┴──────────────────────────────────────────────────────┴──────┴────────────────┴───────┴────────────┴─────────────────────┴─────────┴──────────┴──────────┴─────────────┴─────────┴─────────┤
│ 3000 rows (40 shown)                                                                                                                                                                          14 columns │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

-- Where句の条件を利用することも可能
D SELECT * FROM read_json_auto('s3://sample-bucket/log/2025-05-05*') where timestamp between '2022-06-25 00:00:00' and '2022-06-26 00:00:00' order by timestamp ASC;
┌───────┬──────┬──────────────────────────────────────────────────────┬──────┬────────────────┬───────┬────────────┬─────────────────────┬─────────┬──────────┬──────────┬─────────────┬─────────┬─────────┐
│ title │ url  │                         text                         │ dead │       by       │ score │    time    │      timestamp      │  type   │    id    │  parent  │ descendants │ ranking │ deleted │
│ json  │ json │                       varchar                        │ json │    varchar     │ json  │   int64    │      timestamp      │ varchar │  int64   │  int64   │    json     │  json   │  json   │
├───────┼──────┼──────────────────────────────────────────────────────┼──────┼────────────────┼───────┼────────────┼─────────────────────┼─────────┼──────────┼──────────┼─────────────┼─────────┼─────────┤
│ NULL  │ NULL │ &quot;iTs nOt aT aLl oNeRoUs&quot; said the DPO. l…  │ NULL │ DisjointedHunt │ NULL  │ 1656137068 │ 2022-06-25 06:04:28 │ comment │ 31872948 │ 31868395 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ &gt; and turn it blue with all the love of diversi…  │ NULL │ cbozeman       │ NULL  │ 1656137083 │ 2022-06-25 06:04:43 │ comment │ 31872949 │ 31872345 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ If your library does not allow logging to network …  │ NULL │ jcelerier      │ NULL  │ 1656148877 │ 2022-06-25 09:21:17 │ comment │ 31873731 │ 31873462 │ NULL        │ NULL    │ NULL    │
│ NULL  │ NULL │ Internet is Beautiful                                │ NULL │ whoibrar       │ NULL  │ 1656148968 │ 2022-06-25 09:22:48 │ comment │ 31873737 │ 31868013 │ NULL        │ NULL    │ NULL    │
└───────┴──────┴──────────────────────────────────────────────────────┴──────┴────────────────┴───────┴────────────┴─────────────────────┴─────────┴──────────┴──────────┴─────────────┴─────────┴─────────┘
```

### MySQL上のデータを読み込む
1. 事前にdocker上にMySQLを起動して、[Example Database](https://dev.mysql.com/doc/index-other.html)をインポートしておく
2. DuckDBの設定
```sql
duckdb

-- MySQLの拡張を導入
D INSTALL mysql;
D LOAD mysql;

-- MySQLのデータベースへアタッチ
D ATTACH 'host=127.0.0.1 user=app_user port=3306 password=xxx database=sakila' AS mysql_db (TYPE mysql, READ_ONLY);
D SHOW DATABASES;

-- MySQLのデータベースを選択
D USE mysql_db;
```
3. SQLの実行
```sql
-- MySQLのテーブルを確認
D show tables;
┌────────────────────────────┐
│            name            │
│          varchar           │
├────────────────────────────┤
│ actor                      │
│ actor_info                 │
│ address                    │
│ category                   │
│ city                       │
│ country                    │
│ customer                   │
│ customer_list              │
│ film                       │
│ film_actor                 │
│ film_category              │
│ film_list                  │
│ film_text                  │
│ inventory                  │
│ language                   │
│ nicer_but_slower_film_list │
│ payment                    │
│ rental                     │
│ sales_by_film_category     │
│ sales_by_store             │
│ staff                      │
│ staff_list                 │
│ store                      │
├────────────────────────────┤
│          23 rows           │
└────────────────────────────┘

-- 適当なテーブルを選択して、SQLを実行
D SELECT * FROM film inner join film_actor on film.film_id = film_actor.film_id limit 10;
┌─────────┬──────────────────┬──────────────────────┬──────────────┬─────────────┬──────────────────────┬───┬──────────────────────┬──────────────────────┬──────────┬─────────┬──────────────────────┐
│ film_id │      title       │     description      │ release_year │ language_id │ original_language_id │ … │   special_features   │     last_update      │ actor_id │ film_id │     last_update      │
│ uint16  │     varchar      │       varchar        │    int32     │    uint8    │        uint8         │   │       varchar        │ timestamp with tim…  │  uint16  │ uint16  │ timestamp with tim…  │
├─────────┼──────────────────┼──────────────────────┼──────────────┼─────────────┼──────────────────────┼───┼──────────────────────┼──────────────────────┼──────────┼─────────┼──────────────────────┤
│       1 │ ACADEMY DINOSAUR │ A Epic Drama of a …  │         2006 │           1 │                 NULL │ … │ Deleted Scenes,Beh…  │ 2006-02-15 14:03:4…  │      198 │       1 │ 2006-02-15 14:05:0…  │
│       2 │ ACE GOLDFINGER   │ A Astounding Epist…  │         2006 │           1 │                 NULL │ … │ Trailers,Deleted S…  │ 2006-02-15 14:03:4…  │      160 │       2 │ 2006-02-15 14:05:0…  │
│       3 │ ADAPTATION HOLES │ A Astounding Refle…  │         2006 │           1 │                 NULL │ … │ Trailers,Deleted S…  │ 2006-02-15 14:03:4…  │      123 │       3 │ 2006-02-15 14:05:0…  │
│       4 │ AFFAIR PREJUDICE │ A Fanciful Documen…  │         2006 │           1 │                 NULL │ … │ Commentaries,Behin…  │ 2006-02-15 14:03:4…  │      162 │       4 │ 2006-02-15 14:05:0…  │
│       5 │ AFRICAN EGG      │ A Fast-Paced Docum…  │         2006 │           1 │                 NULL │ … │ Deleted Scenes       │ 2006-02-15 14:03:4…  │      200 │       5 │ 2006-02-15 14:05:0…  │
│       6 │ AGENT TRUMAN     │ A Intrepid Panoram…  │         2006 │           1 │                 NULL │ … │ Deleted Scenes       │ 2006-02-15 14:03:4…  │      197 │       6 │ 2006-02-15 14:05:0…  │
│       7 │ AIRPLANE SIERRA  │ A Touching Saga of…  │         2006 │           1 │                 NULL │ … │ Trailers,Deleted S…  │ 2006-02-15 14:03:4…  │      185 │       7 │ 2006-02-15 14:05:0…  │
│       8 │ AIRPORT POLLOCK  │ A Epic Tale of a M…  │         2006 │           1 │                 NULL │ … │ Trailers             │ 2006-02-15 14:03:4…  │      138 │       8 │ 2006-02-15 14:05:0…  │
│       9 │ ALABAMA DEVIL    │ A Thoughtful Panor…  │         2006 │           1 │                 NULL │ … │ Trailers,Deleted S…  │ 2006-02-15 14:03:4…  │      194 │       9 │ 2006-02-15 14:05:0…  │
│      10 │ ALADDIN CALENDAR │ A Action-Packed Ta…  │         2006 │           1 │                 NULL │ … │ Trailers,Deleted S…  │ 2006-02-15 14:03:4…  │      188 │      10 │ 2006-02-15 14:05:0…  │
├─────────┴──────────────────┴──────────────────────┴──────────────┴─────────────┴──────────────────────┴───┴──────────────────────┴──────────────────────┴──────────┴─────────┴──────────────────────┤
│ 10 rows                                                                                                                                                                       16 columns (11 shown) │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### MySQL上のデータとJSONのデータを結合する
* MySQL上のactorテーブルとS3上のJSON(actor_info)を結合してみる
```sql
duckdb

-- MySQLのactorテーブルを確認
D select * from actor limit 10;
┌──────────┬────────────┬──────────────┬──────────────────────────┐
│ actor_id │ first_name │  last_name   │       last_update        │
│  uint16  │  varchar   │   varchar    │ timestamp with time zone │
├──────────┼────────────┼──────────────┼──────────────────────────┤
│        1 │ PENELOPE   │ GUINESS      │ 2006-02-15 13:34:33+09   │
│        2 │ NICK       │ WAHLBERG     │ 2006-02-15 13:34:33+09   │
│        3 │ ED         │ CHASE        │ 2006-02-15 13:34:33+09   │
│        4 │ JENNIFER   │ DAVIS        │ 2006-02-15 13:34:33+09   │
│        5 │ JOHNNY     │ LOLLOBRIGIDA │ 2006-02-15 13:34:33+09   │
│        6 │ BETTE      │ NICHOLSON    │ 2006-02-15 13:34:33+09   │
│        7 │ GRACE      │ MOSTEL       │ 2006-02-15 13:34:33+09   │
│        8 │ MATTHEW    │ JOHANSSON    │ 2006-02-15 13:34:33+09   │
│        9 │ JOE        │ SWANK        │ 2006-02-15 13:34:33+09   │
│       10 │ CHRISTIAN  │ GABLE        │ 2006-02-15 13:34:33+09   │
├──────────┴────────────┴──────────────┴──────────────────────────┤
│ 10 rows                                               4 columns │
└─────────────────────────────────────────────────────────────────┘

-- S3上のJSONを確認
D  SELECT * FROM read_json_auto('s3://sample-bucket/actor_info.json') limit 10;
┌──────────┬────────────┬──────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ actor_id │ first_name │  last_name   │                                                                                               film_info                                                                                               │
│  int64   │  varchar   │   varchar    │                                                                                                varchar                                                                                                │
├──────────┼────────────┼──────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│        1 │ PENELOPE   │ GUINESS      │ Animation: ANACONDA CONFESSIONS; Children: LANGUAGE COWBOY; Classics: COLOR PHILADELPHIA, WESTWARD SEABISCUIT; Comedy: VERTIGO NORTHWEST; Documentary: ACADEMY DINOSAUR; Family: KING EVOLUTION, SP…  │
│        2 │ NICK       │ WAHLBERG     │ Action: BULL SHAWSHANK; Animation: FIGHT JAWBREAKER; Children: JERSEY SASSY; Classics: DRACULA CRYSTAL, GILBERT PELICAN; Comedy: MALLRATS UNITED, RUSHMORE MERMAID; Documentary: ADAPTATION HOLES; …  │
│        3 │ ED         │ CHASE        │ Action: CADDYSHACK JEDI, FORREST SONS; Classics: FROST HEAD, JEEPERS WEDDING; Documentary: ARMY FLINTSTONES, FRENCH HOLIDAY, HALLOWEEN NUTS, HUNTER ALTER, WEDDING APOLLO, YOUNG LANGUAGE; Drama: L…  │
│        4 │ JENNIFER   │ DAVIS        │ Action: BAREFOOT MANCHURIAN; Animation: ANACONDA CONFESSIONS, GHOSTBUSTERS ELF; Comedy: SUBMARINE BED; Documentary: BED HIGHBALL, NATIONAL STORY, RAIDERS ANTITRUST; Drama: BLADE POLISH, GREEDY RO…  │
│        5 │ JOHNNY     │ LOLLOBRIGIDA │ Action: AMADEUS HOLY, GRAIL FRANKENSTEIN, RINGS HEARTBREAKERS; Animation: SUNRISE LEAGUE; Children: HALL CASSIDY; Comedy: DADDY PITTSBURGH; Documentary: BONNIE HOLOCAUST, METAL ARMAGEDDON, PACIFI…  │
│        6 │ BETTE      │ NICHOLSON    │ Action: ANTITRUST TOMATOES; Animation: BIKINI BORROWERS, CROSSROADS CASUALTIES, POTLUCK MIXED, TITANIC BOONDOCK; Children: LANGUAGE COWBOY; Classics: BEAST HUNCHBACK; Documentary: COAST RAINBOW; …  │
│        7 │ GRACE      │ MOSTEL       │ Action: BERETS AGENT, EXCITEMENT EVE; Animation: SLEEPLESS MONSOON, TRACY CIDER; Children: WARLOCK WEREWOLF; Classics: MALKOVICH PET, OCTOBER SUBMARINE; Drama: CONFESSIONS MAGUIRE, DECEIVER BETRA…  │
│        8 │ MATTHEW    │ JOHANSSON    │ Action: CAMPUS REMEMBER, DANCES NONE; Animation: SUGAR WONKA; Classics: LIGHTS DEER, MALKOVICH PET, TOMORROW HUSTLER; Drama: CONQUERER NUTS, HANGING DEEP, SCORPION APOLLO; Family: INDIAN LOVE; Fo…  │
│        9 │ JOE        │ SWANK        │ Action: PRIMARY GLASS, WATERFRONT DELIVERANCE; Animation: LAWLESS VISION, SUNRISE LEAGUE; Children: CROOKED FROGMEN, SWEETHEARTS SUSPECTS, TIES HUNGER; Classics: SNATCHERS MONTEZUMA; Documentary:…  │
│       10 │ CHRISTIAN  │ GABLE        │ Action: LORD ARIZONA, WATERFRONT DELIVERANCE; Animation: PUNK DIVORCE; Children: CROOKED FROGMEN; Classics: JEEPERS WEDDING, PREJUDICE OLEANDER; Comedy: LIFE TWISTED; Documentary: ACADEMY DINOSAU…  │
├──────────┴────────────┴──────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 10 rows                                                                                                                                                                                                                            4 columns │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

-- S3上のJSONとMySQLのactorテーブルを結合して取得
D SELECT * FROM actor
  inner join read_json_auto('s3://sample-bucket/actor_info.json') as actor_info on actor_info.actor_id = actor.actor_id
  limit 10;
┌──────────┬────────────┬──────────────┬──────────────────────┬──────────┬────────────┬──────────────┬─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ actor_id │ first_name │  last_name   │     last_update      │ actor_id │ first_name │  last_name   │                                                                film_info                                                                │
│  uint16  │  varchar   │   varchar    │ timestamp with tim…  │  int64   │  varchar   │   varchar    │                                                                 varchar                                                                 │
├──────────┼────────────┼──────────────┼──────────────────────┼──────────┼────────────┼──────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│        1 │ PENELOPE   │ GUINESS      │ 2006-02-15 13:34:3…  │        1 │ PENELOPE   │ GUINESS      │ Animation: ANACONDA CONFESSIONS; Children: LANGUAGE COWBOY; Classics: COLOR PHILADELPHIA, WESTWARD SEABISCUIT; Comedy: VERTIGO NORTHW…  │
│        2 │ NICK       │ WAHLBERG     │ 2006-02-15 13:34:3…  │        2 │ NICK       │ WAHLBERG     │ Action: BULL SHAWSHANK; Animation: FIGHT JAWBREAKER; Children: JERSEY SASSY; Classics: DRACULA CRYSTAL, GILBERT PELICAN; Comedy: MALL…  │
│        3 │ ED         │ CHASE        │ 2006-02-15 13:34:3…  │        3 │ ED         │ CHASE        │ Action: CADDYSHACK JEDI, FORREST SONS; Classics: FROST HEAD, JEEPERS WEDDING; Documentary: ARMY FLINTSTONES, FRENCH HOLIDAY, HALLOWEE…  │
│        4 │ JENNIFER   │ DAVIS        │ 2006-02-15 13:34:3…  │        4 │ JENNIFER   │ DAVIS        │ Action: BAREFOOT MANCHURIAN; Animation: ANACONDA CONFESSIONS, GHOSTBUSTERS ELF; Comedy: SUBMARINE BED; Documentary: BED HIGHBALL, NAT…  │
│        5 │ JOHNNY     │ LOLLOBRIGIDA │ 2006-02-15 13:34:3…  │        5 │ JOHNNY     │ LOLLOBRIGIDA │ Action: AMADEUS HOLY, GRAIL FRANKENSTEIN, RINGS HEARTBREAKERS; Animation: SUNRISE LEAGUE; Children: HALL CASSIDY; Comedy: DADDY PITTS…  │
│        6 │ BETTE      │ NICHOLSON    │ 2006-02-15 13:34:3…  │        6 │ BETTE      │ NICHOLSON    │ Action: ANTITRUST TOMATOES; Animation: BIKINI BORROWERS, CROSSROADS CASUALTIES, POTLUCK MIXED, TITANIC BOONDOCK; Children: LANGUAGE C…  │
│        7 │ GRACE      │ MOSTEL       │ 2006-02-15 13:34:3…  │        7 │ GRACE      │ MOSTEL       │ Action: BERETS AGENT, EXCITEMENT EVE; Animation: SLEEPLESS MONSOON, TRACY CIDER; Children: WARLOCK WEREWOLF; Classics: MALKOVICH PET,…  │
│        8 │ MATTHEW    │ JOHANSSON    │ 2006-02-15 13:34:3…  │        8 │ MATTHEW    │ JOHANSSON    │ Action: CAMPUS REMEMBER, DANCES NONE; Animation: SUGAR WONKA; Classics: LIGHTS DEER, MALKOVICH PET, TOMORROW HUSTLER; Drama: CONQUERE…  │
│        9 │ JOE        │ SWANK        │ 2006-02-15 13:34:3…  │        9 │ JOE        │ SWANK        │ Action: PRIMARY GLASS, WATERFRONT DELIVERANCE; Animation: LAWLESS VISION, SUNRISE LEAGUE; Children: CROOKED FROGMEN, SWEETHEARTS SUSP…  │
│       10 │ CHRISTIAN  │ GABLE        │ 2006-02-15 13:34:3…  │       10 │ CHRISTIAN  │ GABLE        │ Action: LORD ARIZONA, WATERFRONT DELIVERANCE; Animation: PUNK DIVORCE; Children: CROOKED FROGMEN; Classics: JEEPERS WEDDING, PREJUDIC…  │
├──────────┴────────────┴──────────────┴──────────────────────┴──────────┴────────────┴──────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 10 rows                                                                                                                                                                                                                            8 columns │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
* 上記のように、直感的にMySQLのデータとS3上のJSONを結合して取得することができた

### DuckDBの使いどころ
* 手元での分析系は非常に軽量である故に、ExcelやSpreadsheetの代わりに利用することができる
    - アドホック分析 .. 手元にあるCSVやJSONを読み込み、集計したい際に便利
    - BIツールのバックエンド .. BIツールのバックエンドとして利用することで、データを集計して可視化することができる
    - Edge/オフライン分析 .. DuckDBは軽量でWASM版もあるため、多用なデバイスで分析することができる
* 今回は実施していないが、パイプライン用途でも利用することができる
    - ETL .. DuckDBはSQLを利用してデータを変換することができるため、ETL用途でも利用することができる
    - アプリへの組み込み .. PythonやNode.jsなどのアプリケーションに組み込むことで、データ変換処理を実行することができる

### DuckDB Wasm
* DuckDBにはWasm版があるため、CLIやアプリ上で動作させる以外に、ブラウザ上で動作させることもできる
* DuckDBエンジンの組み込み方法は[DuckDB Wasm](https://duckdb.org/docs/stable/clients/wasm/overview.html)を参照
* 試しに下記イメージのような、ブラウザからJSONをアップロードして読み込んでSQLで取得するようなページを作成してみた
![DuckDB Wasm Sample](../posts/duckdb_wasm1.png)
* 上記のように、ブラウザ上で様々なデータをアップロード/ダウンロードして分析・可視化を行うことができる
* CSVならExcel, JSONならjqコマンドのように限定された分析手法に依存せず、CSV, JSON, ParquetなどのデータをSQLで分析することができるため強力である

### まとめ
* 今回は、DuckDBをCLIにインストールして、ローカルのJSON, S3上のJSON, MySQL上のデータを読み込み、単独及び結合して分析できることを確認した
* DuckDBはポータブル性が高く、手元でのアドホック分析やBIツールのバックエンドとして利用することができるため、ユースケースは多用な印象を受けた
* データのETLとして、アプリケーションに組み込むこともできるため、データパイプラインの一部として利用することもできる

### 参考
- [DuckDB公式ドキュメント](https://duckdb.org/)
- [S3 API Support](https://duckdb.org/docs/stable/extensions/httpfs/s3api.html)
