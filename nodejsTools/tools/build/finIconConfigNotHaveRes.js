/**
 * Created by huangducai on 16/5/18.
 * 此文件是检验icon表中的 哪些文件不存在于我们的resource.js 中
 */
var fs = require('fs');
var _ = require('underscore');

var res = require('../../js/constant/resources.js');
res = res.hashFile;
var notHaveRes = {};

function writeFile(path, fileName, content) {
    var allPath = path + fileName;
    if (fs.existsSync(path)) {
        fs.writeFile(allPath, content, function (err) {
            if (err) {
                console.log("fail " + err);
            }
        });
    } else {
        fs.mkdirSync(path);
        writeFile(path, fileName, content);
    }
}

function readAllFiles() {
    fs.readFile('./res/config/icon.json', 'utf-8', function (err, fileStr) {
        var data = JSON.parse(fileStr);
        var json = JSON.parse(unescape(data['codeData']));
        _.forEach(json, function (obj, indexKey) {
            //"1": {
            //    "CID": 1,
            //        "TYPE": 5,
            //        "ICON_FRAME_NAME": "",
            //        "ICON_MAIN_NAME": "playerHead001",
            //        "ICON_CORNER_NAME": "",
            //        "ICON_CORNER_NAME1": "",
            //        "ICON_MIDDLE_NAME": "",
            //        "ICON_MIDDLE": ""
            //},
            _.forEach(obj, function (value, key) {
                // console.log('key ==' + key + 'value ==' + value);
                if (key && key.indexOf('ICON') == 0 && value && key != 'ICON_MIDDLE') {
                    if (!res[value.toUpperCase()]) {
                        notHaveRes[indexKey] = notHaveRes[indexKey] || {};
                        notHaveRes[indexKey][key] = value;
                    }
                }
            })
        });
        console.log('检查 icon 表中的数据是否存在 输出到 icon配置表中的不存在的资源.json 中');
        writeFile("./toolsOut/", 'icon配置表中的不存在的资源.json', JSON.stringify(notHaveRes, null, 4));
    });
}
readAllFiles();

