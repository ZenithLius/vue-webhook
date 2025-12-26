#!/bin/bash

WORK_PATH='/usr/project/vue-back'
cd $WORK_PATH
echo "先清除老代码"
git reset --hard origin/main
git clean -f
echo "拉取新代码"
git pull origin main
echo "开始执行构件"
sudo docker build -t vue-back:1.0 .
echo "停止旧容器并删除旧容器"
sudo docker stop vue-back-container 2>/dev/null || true
sudo docker rm vue-back-container 2>/dev/null || true
echo "清理可能占用3000端口的容器"
sudo docker ps -q --filter "publish=3000" | xargs -r sudo docker stop
sudo docker ps -aq --filter "publish=3000" | xargs -r sudo docker rm
echo "启动新容器"
sudo docker container run -p 3000:3000 --name vue-back-container -d vue-back:1.0
