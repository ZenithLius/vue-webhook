let http = require('http');
let fs = require('fs');
let path = require('path');
let crypto = require('crypto');
let { spawn } = require('child_process');

let secret = '123456';

function sign(body) {
    return 'sha1=' + crypto.createHmac('sha1', secret).update(body).digest('hex');
}

// 执行部署脚本
function executeDeployScript(scriptPath, repoName) {
    console.log(`\n🚀 开始部署: ${repoName}`);
    console.log(`📝 执行脚本: ${scriptPath}`);
    console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN')}\n`);

    // 使用 spawn 执行 bash 脚本
    const child = spawn('bash', [scriptPath], {
        cwd: path.dirname(scriptPath),
        stdio: 'pipe'
    });

    // 输出标准输出
    child.stdout.on('data', (data) => {
        console.log(`[${repoName}] ${data.toString().trim()}`);
    });

    // 输出错误信息
    child.stderr.on('data', (data) => {
        console.error(`[${repoName}] ERROR: ${data.toString().trim()}`);
    });

    // 进程结束
    child.on('close', (code) => {
        if (code === 0) {
            console.log(`\n✅ ${repoName} 部署成功！\n`);
        } else {
            console.error(`\n❌ ${repoName} 部署失败，退出码: ${code}\n`);
        }
    });

    // 错误处理
    child.on('error', (err) => {
        console.error(`\n❌ ${repoName} 执行脚本失败:`, err.message, '\n');
    });
}

let server = http.createServer(function (req, res) {
    if (req.method == 'POST' && req.url == '/webhook') {
        let body = '';

        let buffers = []
        req.on('data', function (buffer) {
            buffers.push(buffer)
        })

        req.on('end', function () {
            let bodyBuffer = Buffer.concat(buffers);
            let event = req.headers['x-github-event'];
            let signature = req.headers['x-hub-signature'];

            // 验证签名
            if (signature !== sign(bodyBuffer)) {
                console.log('❌ 签名验证失败');
                res.statusCode = 403;
                res.end('NOT ALLOWED');
                return;
            }

            // 解析 payload
            try {
                let payload = JSON.parse(bodyBuffer.toString());
                let repoName = payload.repository?.name; // 获取仓库名称
                let fullName = payload.repository?.full_name;
                let pusher = payload.pusher?.name;
                let ref = payload.ref;

                console.log('\n========== Webhook 接收到推送 ==========');
                console.log('📦 仓库:', fullName);
                console.log('👤 推送者:', pusher);
                console.log('🌿 分支:', ref);
                console.log('⏰ 时间:', new Date().toLocaleString('zh-CN'));
                console.log('========================================\n');

                // 根据仓库名称执行对应的脚本
                if (repoName === 'vue-front') {
                    let scriptPath = path.join(__dirname, 'vue-front.sh');
                    executeDeployScript(scriptPath, 'vue-front');
                } else if (repoName === 'vue-back') {
                    let scriptPath = path.join(__dirname, 'vue-back.sh');
                    executeDeployScript(scriptPath, 'vue-back');
                } else {
                    console.log(`⚠️  未知仓库: ${repoName}，跳过部署`);
                }

                // 立即响应 GitHub
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    ok: true,
                    message: 'Webhook received successfully',
                    repository: repoName
                }));

            } catch (e) {
                console.error('❌ 解析 payload 失败:', e.message);
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
        })

        // req.on('data', chunk => {
        //     body += chunk.toString();
        // });

        // req.on('end', () => {
        //     console.log('\n========== Webhook 接收到请求 ==========');
        //     console.log('时间:', new Date().toLocaleString('zh-CN'));
        //     console.log('请求头:', JSON.stringify(req.headers, null, 2));

        //     try {
        //         let payload = JSON.parse(body);
        //         console.log('\n--- GitHub Payload ---');
        //         console.log('仓库:', payload.repository?.full_name);
        //         console.log('推送者:', payload.pusher?.name);
        //         console.log('分支:', payload.ref);
        //         console.log('提交数量:', payload.commits?.length);

        //         if (payload.commits && payload.commits.length > 0) {
        //             console.log('\n--- 最新提交信息 ---');
        //             let latestCommit = payload.commits[payload.commits.length - 1];
        //             console.log('提交ID:', latestCommit.id);
        //             console.log('提交信息:', latestCommit.message);
        //             console.log('作者:', latestCommit.author.name);
        //         }

        //         // 保存完整的payload到文件
        //         let logFile = path.join(__dirname, 'webhook-log.json');
        //         let logData = {
        //             timestamp: new Date().toISOString(),
        //             headers: req.headers,
        //             payload: payload
        //         };
        //         fs.writeFileSync(logFile, JSON.stringify(logData, null, 2));
        //         console.log('\n✅ Payload已保存到:', logFile);

        //     } catch (e) {
        //         console.error('解析payload失败:', e.message);
        //         console.log('原始body:', body);
        //     }

        //     console.log('========================================\n');

        //     res.setHeader('Content-Type', 'application/json');
        //     res.end(JSON.stringify({ ok: true, message: 'Webhook received successfully' }));
        // });
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

server.listen(4000, () => {
    console.log('🚀 WEBHOOK服务器已启动');
    console.log('📍 监听地址: http://localhost:4000/webhook');
    console.log('⏰ 启动时间:', new Date().toLocaleString('zh-CN'));
    console.log('等待GitHub推送事件...\n');
})