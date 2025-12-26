#!/bin/bash

echo "========== Docker 容器状态检查 =========="

echo -e "\n1. 检查所有运行中的容器："
sudo docker ps

echo -e "\n2. 检查 vue-front 容器详细信息："
sudo docker inspect vue-front-container | grep -A 10 "Ports"

echo -e "\n3. 检查容器日志："
sudo docker logs vue-front-container --tail 50

echo -e "\n4. 检查端口监听情况："
sudo netstat -tulpn | grep -E ':(80|8080|3000|4000)'

echo -e "\n5. 测试容器内部访问："
curl -I http://localhost:8080

echo -e "\n6. 检查防火墙状态："
sudo ufw status

echo -e "\n7. 检查 iptables 规则："
sudo iptables -L -n | grep -E '8080|80'

echo -e "\n=========================================="
