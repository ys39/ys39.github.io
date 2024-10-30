---
title: 'Taskfileへ入門'
date: '2024-10-30'
tags: ['Golang', 'Taskfile', 'beginners', 'dotfiles']
---

### はじめに
* Golangのプロジェクトや、ツール系のスクリプトを管理するためにMakefileを使うことが多いが、Taskfileというツールもあるらしく、そちらも試してみる。

### Taskfileとは
* Makeよりも使いやすいことを目的としているタスクランナー/ビルドツール。
* LinuxやmacOSだけでなく、Windowsでも使える。
* `Taskfile.yml`というファイルにシンプルなYAMLスキーマを使ってビルドタスクを記述するだけ。

### Quick Start
1. Install
    ```bash
    sudo npm install -g @go-task/cli
    ```
2. `Taskfile.yml`を作成
    ```yaml
    version: '3'

    tasks:
    hello:
        cmds:
        - echo 'Hello World from Task!'
        silent: true
    ```
3. タスクの実行
    ```bash
    task hello
    # Hello World from Task!
    ```
4. ヘルプ
    ```bash
    task --help
    
    Usage: task [flags...] [task...]

    Runs the specified task(s). Falls back to the "default" task if no task name
    was specified, or lists all tasks if an unknown task name was specified.

    Example: 'task hello' with the following 'Taskfile.yml' file will generate an
    'output.txt' file with the content "hello".

    '''
    version: '3'
    tasks:
      hello:
        cmds:
          - echo "I am going to write a file named 'output.txt' now."
          - echo "hello" > output.txt
        generates:
          - output.txt
    '''

    Options:
    -c, --color                       Colored output. Enabled by default. Set flag to false or use NO_COLOR=1 to disable. (default true)
        --completion string           Generates shell completion script.
    -C, --concurrency int             Limit number tasks to run concurrently.
    -d, --dir string                  Sets directory of execution.
    -n, --dry                         Compiles and prints tasks in the order that they would be run, without executing them.
    -x, --exit-code                   Pass-through the exit code of the task command.
        --experiments                 Lists all the available experiments and whether or not they are enabled.
    -f, --force                       Forces execution even when the task is up-to-date.
    -g, --global                      Runs global Taskfile, from $HOME/{T,t}askfile.{yml,yaml}.
    -h, --help                        Shows Task usage.
    -i, --init                        Creates a new Taskfile.yml in the current folder.
        --insecure                    Forces Task to download Taskfiles over insecure connections.
    -I, --interval duration           Interval to watch for changes.
    -j, --json                        Formats task list as JSON.
    -l, --list                        Lists tasks with description of current Taskfile.
    -a, --list-all                    Lists tasks with or without a description.
        --no-status                   Ignore status when listing tasks as JSON
    -o, --output string               Sets output style: [interleaved|group|prefixed].
        --output-group-begin string   Message template to print before a task's grouped output.
        --output-group-end string     Message template to print after a task's grouped output.
        --output-group-error-only     Swallow output from successful tasks.
    -p, --parallel                    Executes tasks provided on command line in parallel.
    -s, --silent                      Disables echoing.
        --sort string                 Changes the order of the tasks when listed. [default|alphanumeric|none].
        --status                      Exits with non-zero exit code if any of the given tasks is not up-to-date.
        --summary                     Show summary about a task.
    -t, --taskfile string             Choose which Taskfile to run. Defaults to "Taskfile.yml".
    -v, --verbose                     Enables verbose mode.
        --version                     Show Task version.
    -w, --watch                       Enables watch of the given task.
    -y, --yes                         Assume "yes" as answer to all prompts.
    ```

### dotfilesでの利用
https://github.com/ys39/dotfiles ではMakefileを用いていたが、Taskfileに変更してみる（現状は、`setup.sh`をMakefileで実行している）また、シンボリックリンクは一般的には`ln -s`を使うが、調べると`stow`というツールがあるらしいので、そちらも試してみる。

* ディレクトリ構成
    * `stow`を利用するため、用途ごとにディレクトリを分ける。
    * `stow --dotfiles`を使うことで、`dot-`から始まるファイルを`.`から始まるファイルへのシンボリックリンクを作成できる。
    ```bash
    .
    ├── .gitignore
    ├── README.md
    ├── Taskfile.yml
    ├── bash
    │   ├── dot-bash_profile
    │   └── dot-bashrc
    ├── editor
    │   ├── dot-editorconfig
    │   └── dot-vimrc
    ├── git
    │   ├── dot-commit_template
    │   ├── dot-gitconfig
    │   ├── dot-gitconfig.local
    │   └── dot-gitignore_global
    ├── homebrew
    │   └── dot-Brewfile
    ├── scripts
    │   └── setup_gitconfig_local.sh
    ├── shell
    │   └── dot-aliases
    ├── wsl
    │   └── dot-wslconfig
    └── zsh
        └── dot-zshrc
    ```

* `Taskfile.yml`の内容
    * `create`, `link`, `unlink`, `setup`の4つのタスクを作成。
    ```yaml
    version: '3'

    vars:
      DOTFILES_DIR: "{{.TASKFILE_DIR}}"
      SCRIPTS_DIR: "{{.DOTFILES_DIR}}/scripts"
      HOME_DIR: "{{.HOME}}"

    tasks:
      create:
        desc: "Create dot-gitconfig.local if not present"
        cmds:
          - sh "{{.SCRIPTS_DIR}}/setup_gitconfig_local.sh"

      link:
        desc: "Create symlinks for dotfiles"
        cmds:
          - stow --dotfiles -v -d "{{.DOTFILES_DIR}}" -t "{{.HOME_DIR}}" shell
          - stow --dotfiles -v -d "{{.DOTFILES_DIR}}" -t "{{.HOME_DIR}}" bash
          - stow --dotfiles -v -d "{{.DOTFILES_DIR}}" -t "{{.HOME_DIR}}" zsh
          - stow --dotfiles -v -d "{{.DOTFILES_DIR}}" -t "{{.HOME_DIR}}" editor
          - stow --dotfiles -v -d "{{.DOTFILES_DIR}}" -t "{{.HOME_DIR}}" git
          - stow --dotfiles -v -d "{{.DOTFILES_DIR}}" -t "{{.HOME_DIR}}" homebrew
          - stow --dotfiles -v -d "{{.DOTFILES_DIR}}" -t "{{.HOME_DIR}}" wsl

      unlink:
        desc: "Remove symlinks for dotfiles"
        cmds:
          - stow --dotfiles -v -d "{{.DOTFILES_DIR}}" -t "{{.HOME_DIR}}" -D shell
          - stow --dotfiles -v -d "{{.DOTFILES_DIR}}" -t "{{.HOME_DIR}}" -D bash
          - stow --dotfiles -v -d "{{.DOTFILES_DIR}}" -t "{{.HOME_DIR}}" -D zsh
          - stow --dotfiles -v -d "{{.DOTFILES_DIR}}" -t "{{.HOME_DIR}}" -D editor
          - stow --dotfiles -v -d "{{.DOTFILES_DIR}}" -t "{{.HOME_DIR}}" -D git
          - stow --dotfiles -v -d "{{.DOTFILES_DIR}}" -t "{{.HOME_DIR}}" -D homebrew
          - stow --dotfiles -v -d "{{.DOTFILES_DIR}}" -t "{{.HOME_DIR}}" -D wsl

      setup:
        desc: "Run both create and link tasks"
        cmds:
          - task: create
          - task: link
    ```

* セットアップのDry Run
    ```bash
    # Dry-run
    task -n setup

    # task: [create] sh "$HOME/dotfiles_taskver/scripts/setup_gitconfig_local.sh"
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" shell
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" bash
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" zsh
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" editor
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" git
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" homebrew
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" wsl
    ```

* セットアップの実行
    ```bash
    # セットアップ
    task setup

    # task: [create] sh "$HOME/dotfiles_taskver/scripts/setup_gitconfig_local.sh"
    # dot-gitconfig.local already exists, skipping...
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" shell
    # LINK: .aliases => dotfiles_taskver/shell/dot-aliases
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" bash
    # LINK: .bash_profile => dotfiles_taskver/bash/dot-bash_profile
    # LINK: .bashrc => dotfiles_taskver/bash/dot-bashrc
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" zsh
    # LINK: .zshrc => dotfiles_taskver/zsh/dot-zshrc
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" editor
    # LINK: .editorconfig => dotfiles_taskver/editor/dot-editorconfig
    # LINK: .vimrc => dotfiles_taskver/editor/dot-vimrc
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" git
    # LINK: .gitignore_global => dotfiles_taskver/git/dot-gitignore_global
    # LINK: .commit_template => dotfiles_taskver/git/dot-commit_template
    # LINK: .gitconfig.local => dotfiles_taskver/git/dot-gitconfig.local
    # LINK: .gitconfig => dotfiles_taskver/git/dot-gitconfig
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" homebrew
    # LINK: .Brewfile => dotfiles_taskver/homebrew/dot-Brewfile
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" wsl
    # LINK: .wslconfig => dotfiles_taskver/wsl/dot-wslconfig
    ```

* シンボリックリンクの削除
    ```bash
    # シンボリックリンクの削除
    task unlink

    # task: [unlink] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" -D shell
    # UNLINK: .aliases
    # BUG in find_stowed_path? Absolute/relative mismatch between Stow dir dotfiles_taskver and path ~~ at /usr/share/perl5/Stow.pm line 966, <DATA> line 22.
    # BUG in find_stowed_path? Absolute/relative mismatch between Stow dir dotfiles_taskver and path ~~ at /usr/share/perl5/Stow.pm line 966, <DATA> line 22.
    # task: [unlink] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" -D bash
    # UNLINK: .bash_profile
    # UNLINK: .bashrc
    # BUG in find_stowed_path? Absolute/relative mismatch between Stow dir dotfiles_taskver and path ~~ at /usr/share/perl5/Stow.pm line 966, <DATA> line 22.
    # BUG in find_stowed_path? Absolute/relative mismatch between Stow dir dotfiles_taskver and path ~~ at /usr/share/perl5/Stow.pm line 966, <DATA> line 22.
    # task: [unlink] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" -D zsh
    # UNLINK: .zshrc
    # BUG in find_stowed_path? Absolute/relative mismatch between Stow dir dotfiles_taskver and path ~~ at /usr/share/perl5/Stow.pm line 966, <DATA> line 22.
    # BUG in find_stowed_path? Absolute/relative mismatch between Stow dir dotfiles_taskver and path ~~ at /usr/share/perl5/Stow.pm line 966, <DATA> line 22.
    # task: [unlink] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" -D editor
    # UNLINK: .editorconfig
    # UNLINK: .vimrc
    # BUG in find_stowed_path? Absolute/relative mismatch between Stow dir dotfiles_taskver and path ~~ at /usr/share/perl5/Stow.pm line 966, <DATA> line 22.
    # BUG in find_stowed_path? Absolute/relative mismatch between Stow dir dotfiles_taskver and path ~~ at /usr/share/perl5/Stow.pm line 966, <DATA> line 22.
    # task: [unlink] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" -D git
    # UNLINK: .gitignore_global
    # UNLINK: .commit_template
    # UNLINK: .gitconfig.local
    # UNLINK: .gitconfig
    # BUG in find_stowed_path? Absolute/relative mismatch between Stow dir dotfiles_taskver and path ~~ at /usr/share/perl5/Stow.pm line 966, <DATA> line 22.
    # BUG in find_stowed_path? Absolute/relative mismatch between Stow dir dotfiles_taskver and path ~~ at /usr/share/perl5/Stow.pm line 966, <DATA> line 22.
    # task: [unlink] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" -D homebrew
    # UNLINK: .Brewfile
    # BUG in find_stowed_path? Absolute/relative mismatch between Stow dir dotfiles_taskver and path ~~ at /usr/share/perl5/Stow.pm line 966, <DATA> line 22.
    # BUG in find_stowed_path? Absolute/relative mismatch between Stow dir dotfiles_taskver and path ~~ at /usr/share/perl5/Stow.pm line 966, <DATA> line 22.
    # task: [unlink] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" -D wsl
    # UNLINK: .wslconfig
    # BUG in find_stowed_path? Absolute/relative mismatch between Stow dir dotfiles_taskver and path ~~ at /usr/share/perl5/Stow.pm line 966, <DATA> line 22.
    # BUG in find_stowed_path? Absolute/relative mismatch between Stow dir dotfiles_taskver and path ~~ at /usr/share/perl5/Stow.pm line 966, <DATA> line 22.
    ```

* タスクの冪等性
    * 二回目以降の`task setup`の実行ではシンボリックリンクの作成がスルーされる。
    ```bash
    task setup

    # task: [create] sh "$HOME/dotfiles_taskver/scripts/setup_gitconfig_local.sh"
    # dot-gitconfig.local already exists, skipping...
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" shell
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" bash
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" zsh
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" editor
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" git
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" homebrew
    # task: [link] stow --dotfiles -v -d "$HOME/dotfiles_taskver" -t "$HOME" wsl
    ```

* 所感
    * `silent: true`でコマンドの出力を抑制できるが、dry-runの場合に実行コマンドが確認できなくなるため、記載しない。
    * `task unlink`を実行すると、他シンボリックリンクがある場合に、`BUG in find_stowed_path? Absolute/relative mismatch between Stow dir dotfiles_taskver and path ~~ at /usr/share/perl5/Stow.pm line 966, <DATA> line 22.`というエラーが発生するが、`stow`の不具合かと思われる（現状バージョンは2.3.1）。https://github.com/aspiers/stow/issues/65 にて同様のエラーが報告されている。

### まとめ
* Taskfileの方がReferenceは読みやすい。
* Makefileとは異なり、Taskfileはyml形式で記述するため、シンプルで可読性が高い。(https://taskfile.dev/styleguide/ にスタイルガイドあり)
* `PHONY`の記載が必要ないため、Makefileよりも簡潔に記述できる。
* Makefileではコマンドベースだったが、Taskfileではキーで処理できるものが増えている。（`prompt`など）
* `defer`キーワードでタスクの後処理を記述できるため、Golangを使っている人には馴染みやすいかもしれない。

### 参考
* [Taskfile](https://taskfile.dev/)
* [GNU Stow](https://www.gnu.org/software/stow/manual/stow.html#Introduction)
