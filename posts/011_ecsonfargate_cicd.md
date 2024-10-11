---
title: 'ECS on FargateでCICD'
date: '2024-10-11'
---

### はじめに

- [ECS on Fargateで手動デプロイ](./010_ecsonfargate) では、ECS on Fargateの環境をCloudFormationで構築し、手動でデプロイを試した。実際のサービスを想定した際に、ここのパイプライン(CICD)は人為的ミスを発生させない/属人化させないことが重要であり、自動化が求められる。自動化の際にはCICDのツールとしてCircleCI, GitHub Actions, Jenkinsなどがあるが、今回は本ブログのビルドとしても利用しているGitHub Actionsを利用してCICDを構築する。

### GitHub Actionsとは

- GitHubが提供する汎用的なワークフローエンジン
- yaml形式でワークフローを定義し、.github/workflows/ 以下に配置することで、リポジトリ内でCI/CDを実行できる

### GitHub ActionsでのECS on Fargateデプロイの流れ

- 途中でGithub ActionsからAWSへの操作が発生するため、連携のためのキーが必要となる。アクセスキーを発行した場合にセキュリティ上の問題が発生する可能性が高まるため、OIDC(OpenID Connect)を利用してIAMロールを取得することで操作を行う。

1. 事前にAWSでOIDCの作成とIAMロールの作成

   - IAM -> アクセス管理 -> IDプロバイダ->プロバイダを追加

     - プロバイダのタイプ: OpenID Connect
     - プロバイダのURL：`https://token.actions.githubusercontent.com`
     - 対象者：`sts.amazonaws.com`

   - IAM -> ポリシー -> ポリシーの作成

     - 下記の設定でポリシーを作成
     - ECRとECS, の操作を許可
     - iam:PassRoleは、ECSのアクションを実行する際にGitHub Actions用に作成したIAMではなく、ECSタスクに設定した既存のタスク実行ロールもしくはタスクロールが必要なため設定しています。

       ```json
       {
         "Version": "2012-10-17",
         "Statement": [
           {
             "Effect": "Allow",
             "Action": [
               "ecr:GetDownloadUrlForLayer",
               "ecr:BatchGetImage",
               "ecr:BatchCheckLayerAvailability",
               "ecr:GetAuthorizationToken",
               "ecr:InitiateLayerUpload",
               "ecr:UploadLayerPart",
               "ecr:CompleteLayerUpload",
               "ecr:PutImage"
             ],
             "Resource": "*"
           },
           {
             "Effect": "Allow",
             "Action": [
               "ecs:RegisterTaskDefinition",
               "ecs:UpdateServicePrimaryTaskSet",
               "ecs:UpdateService",
               "ecs:DescribeServices",
               "ecs:DescribeTaskDefinition",
               "ecs:DescribeTasks",
               "ecs:ListTasks",
               "ecs:StopTask",
               "ecs:RunTask"
             ],
             "Resource": "*"
           },
           {
             "Effect": "Allow",
             "Action": "iam:PassRole",
             "Resource": "arn:aws:iam::119924557828:role/originalEcsTaskExecutionRole"
           }
         ]
       }
       ```

   - IAM -> ロール -> ロールの作成

     - 下記の設定でロールを作成し、上記ポリシーをアタッチ

     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Principal": {
             "Federated": "arn:aws:iam::AWSアカウントID:oidc-provider/token.actions.githubusercontent.com"
           },
           "Action": "sts:AssumeRoleWithWebIdentity",
           "Condition": {
             "StringLike": {
               "token.actions.githubusercontent.com:sub": "repo:<OWNER>/<REPO>:*",
               "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
             }
           }
         }
       ]
     }
     ```

   - 作成されたロールのARNをGithubのSecretsに登録

2. 事前にECS on Fargateの環境を構築

   - fargateのvpc周りを構築

   ```bash
   aws cloudformation create-stack \
     --stack-name dev-app-vpc \
     --template-body file://cfn/private-vpc.yaml \
     --capabilities CAPABILITY_NAMED_IAM
   ```

   - fargateを構築

   ```bash
   aws cloudformation create-stack \
     --stack-name dev-app \
     --template-body file://cfn/private-subnet-public-service.yaml \
     --parameters ParameterKey=StackName,ParameterValue=dev-app-vpc
   ```

   - ECRを構築

   ```bash
   aws cloudformation create-stack \
     --stack-name dev-app-ecr \
     --template-body file://cfn/ecr.yaml \
     --parameters ParameterKey=RepositoryName,ParameterValue=dev-app-ecr
   ```

   - stackの確認

   ```bash
   # スタックの一覧を表示(ステータスがCREATE_COMPLETEのもの)
   aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE

   # スタックの一覧を表示(ステータスがCREATE_IN_PROGRESSのもの)
   aws cloudformation list-stacks --stack-status-filter CREATE_IN_PROGRESS
   ```

3. ALBへアクセスして、NginxのWelcomeページが表示されることを確認

4. GitHub上に[新規リポジトリ](https://github.com/ys39/fargate-app-sample)を作成
5. GitHub上のActionsタブより、ワークフローを作成

   - `Deploy to Amazon ECS` でConfigureを選択
   - 右上の`Commit Changes..`を選択し、Commit Changesを行う

6. ローカルのディレクトリにgit cloneでリポジトリを取得

7. .github/workflows/aws.ymlを編集

   - id-token: write はGitHubのOIDC プロバイダから発行されるトークンを利用するために必要
   - credentialsにて、AWSのIAMロールを取得するための情報を設定

   ```diff
   env:
   -  AWS_REGION: MY_AWS_REGION                   # set this to your preferred AWS region, e.g. us-west-1
   -  ECR_REPOSITORY: MY_ECR_REPOSITORY           # set this to your Amazon ECR repository name
   -  ECS_SERVICE: MY_ECS_SERVICE                 # set this to your Amazon ECS service name
   -  ECS_CLUSTER: MY_ECS_CLUSTER                 # set this to your Amazon ECS cluster name
   -  ECS_TASK_DEFINITION: MY_ECS_TASK_DEFINITION # set this to the path to your Amazon ECS task definition
   -                                               # file, e.g. .aws/task-definition.json
   -  CONTAINER_NAME: MY_CONTAINER_NAME           # set this to the name of the container in the
   -                                               # containerDefinitions section of your task definition
   +  AWS_REGION: ap-northeast-1
   +  ECR_REPOSITORY: ecs-test-ecr
   +  ECS_SERVICE: app-service
   +  ECS_CLUSTER: app-cluster
   +  ECS_TASK_DEFINITION: task-definition.json
   +  CONTAINER_NAME: app-container
   ```

   ```diff
   permissions:
   +  id-token: write
     contents: read

   jobs:
   @@ -56,9 +29,10 @@ jobs:
       - name: Configure AWS credentials
         uses: aws-actions/configure-aws-credentials@v1
         with:
   -        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
   -        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
   +        role-to-assume: ${{ secrets.AWS_IAM_ROLE_TO_ASSUME }}
   +        role-session-name: GitHubActions-${{ github.run_id }}
           aws-region: ${{ env.AWS_REGION }}
   +        role-duration-seconds: 3600
   ```

8. ディレクトリ構成は下記の通り

   ```bash
   .
   ├── Dockerfile
   ├── README.md
   ├── cfn
   │   ├── ecr.yaml
   │   ├── private-subnet-public-service.yaml
   │   └── private-vpc.yaml
   └── task-definition.json
   ```

9. GithubへPush

   - Github Actionsが実行され、下記が実施される。

   1. Amazon ECRへのログイン
   2. Dockerイメージのビルド、タグ付け、Amazon ECRへのプッシュ
   3. Amazon ECSタスク定義に新しいイメージIDを埋め込む
   4. Amazon ECSタスク定義のデプロイ

   ```bash
   git add -A
   git commit -m "add github actions"
   git push origin main
   ```

10. ALBへアクセスして、httpdの「github actions CICD test」ページが表示されることを確認

11. 環境削除

    ```bash
    aws cloudformation delete-stack --stack-name dev-app-ecr
    aws cloudformation delete-stack --stack-name dev-app
    aws cloudformation delete-stack --stack-name dev-app-vpc
    ```

    - タスク定義は手動で削除する

### GitHub ActionsでのECS on Fargateデプロイ図

- 今回の流れを図に整理した。
  ![ECS on Fargate CICD](../posts/ECSonFargate-githubActionsDeploy.jpg)

### まとめ

- 今回はGitHub Actionsを利用してECS on Fargateへのデプロイを行いました。
- Github Actionsを行うのに、必要な環境をCloudFormationで構築したが、その簡単さにIaCの重要性を感じました。
- Github Actionsを利用するために必要な設定は、結構シンプルであったが、IAMロールの設定で必要なポリシーが多く、セキュリティに気をつける必要があると感じました。
- Github Actions以外にも、CircleCI, Jenkinsなどのツールもあるので、そちらも試していきたいと思います。

### 参考

- [https://dev.classmethod.jp/articles/githubactions-ecs-fargate-cicd-beginner/](https://dev.classmethod.jp/articles/githubactions-ecs-fargate-cicd-beginner/)
- [https://dev.classmethod.jp/articles/github-actions-ecs-ecr-minimum-iam-policy/](https://dev.classmethod.jp/articles/github-actions-ecs-ecr-minimum-iam-policy/)
- GitHub CI/CD実践ガイド 技術評論社
