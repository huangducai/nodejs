/**
 * Created by huangducai on 16/5/9.
 */

/**
 * 服务器架设
 */
var http = require("http");
var fs = require("fs");
var path = require("path");
var url = require("url");

var server = http.createServer(function (req, res) {
    var pathname = url.parse(req.url).pathname;
    console.log("pathname ==" + pathname);
    console.log("req.url ==" + req.url);

    console.log(pathname);
    var filepath = path.join("./src", "app.html");
    console.log(filepath);
    var stream = fs.createReadStream(filepath, {flags: "r", encoding: null});
    stream.on("error", function () {
        res.writeHead(404);
        res.end();
    });
    stream.pipe(res);
});
server.on("error", function (error) {
    console.log(error);
});
server.listen(8088, function () {
    console.log('server listen on 8088');
});