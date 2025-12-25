#!/bin/bash

WORK_PATH='/usr/project/vue-back'
cd $WORK_PATH

# 自动检测默认分支(main 或 master)
DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
if [ -z "$DEFAULT_BRANCH" ]; then
    # 如果无法自动检测,尝试更新远程引用
    git remote set-head origin -a
    DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@')
fi

echo "使用分支: $DEFAULT_BRANCH"

echo "先清除老代码"
git reset --hard origin/$DEFAULT_BRANCH
git clean -f

echo "拉取新代码"
git pull origin $DEFAULT_BRANCH

echo "开始执行构件"
docker build -t vue-back .

echo "停止旧容器并删除旧容器"
docker stop vue-back-container 2>/dev/null || true
docker rm vue-back-container 2>/dev/null || true

echo "启动新容器"
docker container run -p 3000:3000 --name vue-back-container -d vue-back
