let http = require('http');
let fs = require('fs');
let path = require('path');

let server = http.createServer(function (req, res) {
    if (req.method == 'POST' && req.url == '/webhook') {
        let body = '';

        // 接收数据
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            console.log('\n========== Webhook 接收到请求 ==========');
            console.log('时间:', new Date().toLocaleString('zh-CN'));
            console.log('请求头:', JSON.stringify(req.headers, null, 2));

            try {
                let payload = JSON.parse(body);
                console.log('\n--- GitHub Payload ---');
                console.log('仓库:', payload.repository?.full_name);
                console.log('推送者:', payload.pusher?.name);
                console.log('分支:', payload.ref);
                console.log('提交数量:', payload.commits?.length);

                if (payload.commits && payload.commits.length > 0) {
                    console.log('\n--- 最新提交信息 ---');
                    let latestCommit = payload.commits[payload.commits.length - 1];
                    console.log('提交ID:', latestCommit.id);
                    console.log('提交信息:', latestCommit.message);
                    console.log('作者:', latestCommit.author.name);
                }

                // 保存完整的payload到文件
                let logFile = path.join(__dirname, 'webhook-log.json');
                let logData = {
                    timestamp: new Date().toISOString(),
                    headers: req.headers,
                    payload: payload
                };
                fs.writeFileSync(logFile, JSON.stringify(logData, null, 2));
                console.log('\n✅ Payload已保存到:', logFile);

            } catch (e) {
                console.error('解析payload失败:', e.message);
                console.log('原始body:', body);
            }

            console.log('========================================\n');

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, message: 'Webhook received successfully' }));
        });
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