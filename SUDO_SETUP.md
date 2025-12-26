# 配置 Sudo 免密码执行 Docker 命令

部署脚本现在使用 `sudo` 来执行 Docker 命令。为了让 webhook 自动化部署正常工作，需要配置免密码 sudo。

## 在 Ubuntu 服务器上执行以下命令

```bash
# 1. 编辑 sudoers 文件
sudo visudo

# 2. 在文件末尾添加以下行（将 ubuntu 替换为实际运行 webhook 的用户名）
ubuntu ALL=(ALL) NOPASSWD: /usr/bin/docker

# 3. 保存并退出（Ctrl+X, 然后 Y, 然后 Enter）

# 4. 测试是否生效
sudo docker ps  # 应该不需要输入密码
```

## 验证配置

```bash
# 测试 sudo docker 命令
sudo docker ps

# 如果不需要密码，说明配置成功
```

## 重启 webhook 服务

```bash
pm2 restart webhook
```

## 安全说明

这个配置只允许 ubuntu 用户免密码执行 `docker` 命令，不会影响其他 sudo 命令的安全性。
