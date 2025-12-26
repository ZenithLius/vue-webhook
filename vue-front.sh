#!/bin/bash

WORK_PATH='/usr/project/vue-front'
cd $WORK_PATH
echo "先清除老代码"
git reset --hard origin/main
git clean -f
echo "拉取新代码"
git pull origin main
echo "安装依赖"
npm install
echo "编译"
npm run build
echo "开始执行构件"
sudo docker build -t vue-front:1.0 .
echo "停止旧容器并删除旧容器"
sudo docker stop vue-front-container 2>/dev/null || true
sudo docker rm vue-front-container 2>/dev/null || true
echo "清理可能占用8080端口的容器"
sudo docker ps -q --filter "publish=8080" | xargs -r sudo docker stop
sudo docker ps -aq --filter "publish=8080" | xargs -r sudo docker rm
echo "启动新容器"
sudo docker container run -p 8080:80 --name vue-front-container -d vue-front:1.0
