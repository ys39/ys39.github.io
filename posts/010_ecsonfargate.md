---
title: 'ECS on Fargateでデプロイ'
date: '2024-10-09'
---

### はじめに

- 今まではVMやEC2上にMWをインストールし、ソースコードをデプロイすることでアプリケーションを動かすことがメインであった。しかし、このケースだと開発環境やSTG環境との環境差分が発生しやすく、また、スケールアウトも難しい。そこで、コンテナを使ってアプリケーションを動かすことが増えてきた。コンテナを使うことのメリットの一つとして、ホストOSの違いを抽象化し、同じコンテナが異なるホストでも同じように動作するということがある。また、EKS, ECSというコントロールプレーンのサービスを使うことで、コンテナのスケールアウトやデプロイがより簡単になる。
- 今回は、その恩恵を理解するために、ECS on Fargateでのアプリケーションデプロイを試す。

### ECSとは

- フルマネージドのコンテナオーケストレーションサービスであり、コンテナ化されたアプリケーションをより効率的にデプロイ、管理、スケールするのに役立つ。
- マネージド型なので、ユーザーはインフラの詳細を気にせず、コンテナアプリケーションの管理に集中できる。
- EC2 or Fargateを使用してコンテナを実行できる。

### Fargateとは

- サーバーレスなコンテナ実行エンジン。
- コンテナの実行に必要なインフラ=EC2をユーザーが管理する必要がなくなる。
- コンテナイメージ、リソース要件（CPU、メモリ）を指定するだけで、Fargateがそれに応じたインフラを自動で準備し、スケーリングを行う。

### ECS on Fargateとは

- ECSでのコンテナオーケストレーションをFargate上で実行する方式。
- ECSのフルマネージドの機能とFargateのサーバーレスコンテナ実行の利点を組み合わせて、インフラの管理負担を軽減しつつ、スケーラブルなコンテナアプリケーションを実行可能。

### ECS on Fargateの主要要素

- クラスター, サービス, タスク定義, タスクの4つの要素が大事。
- ECSとは別にECR等でコンテナイメージを管理する必要がある。
  ![ECSonFargate](../posts/ECSonFargate.png)

1. **クラスター（Cluster）**

   - クラスターは、ECSでコンテナを実行するための論理的なグループ。
   - コンテナ化されたアプリケーションを実行するインフラリソース（Fargateタスク）が含まれる。
   - 一つのクラスターに複数のサービスやタスクをデプロイ可能。

2. **サービス（Service）**

   - サービスは、ECSで特定のタスクを定常的に実行するための設定。
   - 指定した数のタスクが常に実行されていることを保証する（自動的にタスクをスケーリングや再起動する機能を持つ）。
   - サービスディスカバリーやロードバランサーと連携して、高可用性を実現。
   - 分散タスク実行をサポート。

3. **タスク定義（Task Definition）**

   - タスク定義は、コンテナの実行に必要な設定情報を含むJSON形式の設定ファイル。
   - コンテナイメージ、リソース（CPU、メモリ）、ネットワーク設定、ボリュームなどを定義。
   - 1つ以上のコンテナが含まれるタスクのブループリント（設計図）として機能。
   - ECSでコンテナを実行する際には、タスク定義に基づいてタスクが作成される。

4. **タスク（Task）**

   - タスクは、タスク定義に基づいて実行されるコンテナのインスタンス。
   - 一つのタスクは、タスク定義で指定された1つ以上のコンテナを含む。
   - Fargate上で実行できる。

5. **ECR**
   - ECRは、ECS用のDockerコンテナイメージを保存、管理、デプロイするためのAWSのコンテナレジストリサービス。
   - コンテナイメージの保存場所として、ECSが簡単にアクセスできる。

### ECS on Fargateを試す

- [ECS CloudFormation](https://github.com/aws-cloudformation/aws-cloudformation-templates/tree/main/ECS) を使って、ECS on Fargateを試す。
- 実現するのは下図のような構成。
  ![private-task-public-loadbalancer](../posts/private-task-public-loadbalancer.svg)
  1. 下記をCloudFormationでデプロイする
     - `FargateLaunchType/clusters/private-vpc.yaml`
     - `FargateLaunchType/services/private-subnet-public-service.yaml`
  2. Internet-facingで作成されたALBのAレコードへアクセスし、Nginxのデフォルトページが表示されることを確認する。
  3. アクセス経路詳細
     - Aレコードへのアクセスする(ALBにはHTTP:80がリスナーポートとして設定されている)
     - このリスナーはECSのサービスへトラフィックを転送する
     - サービスにはタスクが関連付けられており、タスクはFargateで実行される
     - タスクにはNginxコンテナが含まれており、ALBからのリクエストを受け取り、Nginxのデフォルトページを返す

### 新規コンテナへのデプロイ(手動)

1. AWSマネジメントコンソールにログインし、ECSのコンソールを開き、新規リポジトリを作成する。
2. 認証トークンを取得し、Dockerクライアントをレジストリに認証。 AWS CLIを使用する。
   ```bash
   aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin AWSアカウントID.dkr.ecr.ap-northeast-1.amazonaws.com
   ```
3. 新規Dockerfile作成

   ```bash
   vim Dockerfile
   ```

   ```Dockerfile
   FROM httpd:2.4

   RUN echo "ecs-test" > /usr/local/apache2/htdocs/index.html
   ```

4. Dockerイメージをビルド

   ```bash
   docker build -t リポジトリ名 .
   ```

5. このリポジトリにイメージをプッシュできるように、イメージにタグを付ける

   ```bash
   docker tag リポジトリ名:latest AWSアカウントID.dkr.ecr.ap-northeast-1.amazonaws.com/リポジトリ名:latest
   ```

6. 新しく作成した AWS リポジトリにこのイメージをプッシュ

   ```bash
   docker push AWSアカウントID.dkr.ecr.ap-northeast-1.amazonaws.com/リポジトリ名:latest
   ```

7. タスク定義より新しいリビジョンを選択し、新しいイメージを指定する。

8. サービスのデプロイより、新規リビジョンを選択し、更新することでデプロイを完了する

### まとめ

- 今回はECS on Fargateの要素を調査して、CloudFormationを使ってECS on Fargateを試すことができた。
- また手動だが、新規イメージを作成して、ECRとECSを連携することで、ECSのデプロイを行うことができた。
- 今後はGithub ActionsやCircleCI, AWS CodePipelineなどを使ってCI/CDパイプラインを構築し、自動デプロイを行っていきたい。

### 参考

- [https://zenn.dev/umatoma/articles/5862ee6cc1e7c4](https://zenn.dev/umatoma/articles/5862ee6cc1e7c4)
- [ECS CloudFormation](https://github.com/aws-cloudformation/aws-cloudformation-templates/tree/main/ECS)
- [https://dev.classmethod.jp/articles/building-ecs-fargate-using-cloudformation/](https://dev.classmethod.jp/articles/building-ecs-fargate-using-cloudformation/)
