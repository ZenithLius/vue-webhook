let http = require('http');
let server = http.createServer(function (req, res) {
    if (req.method == 'POST' && req.url == '/webhook') {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
            message: 'success'
        }))
    }
})
server.listen(4000, () => {
    console.log('WEBHOOK is running on port 4000')
})