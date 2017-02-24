/**
 * Created by huangducai on 16/8/22.
 */
/**
 * Created by huangducai on 16/2/2.
 */
var fs = require('fs');
var Path = require('path'),
    Sep = Path.sep;
var _ = require('underscore');
var async = require('async');


// var Crypoto = require('../../js/crypoto.js');

function getTextureConfigs(rootPath, subPath, extname) {
    var textureFiles = [];
    subPath = subPath || '';
    var files = fs.readdirSync(Path.join(rootPath, subPath));
    files.forEach(function (file) {

        var stat = fs.statSync(Path.join(rootPath, subPath, file));
        if (stat.isDirectory()) {
            var temp = getTextureConfigs(rootPath, Path.join(subPath, file), extname);
            textureFiles = textureFiles.concat(temp);
        } else if (extname) {
            if (Path.extname(file) === extname) {
                textureFiles.push(Path.join(rootPath, subPath, file));
            }
        } else {
            textureFiles.push(Path.join(rootPath, subPath, file));
        }
    }, this);
    return textureFiles;
}

function readJsonFile(PlistPath, callBack) {
    //console.log('readJsonFile:', PlistPath);
    fs.readFile(PlistPath, 'utf-8', function (err, result) {
        var obj1 = JSON.parse(result);
        if (!obj1['codeData']) {
            //读取字符串
            var obj = {};
            obj['codeData'] = Crypoto.Encryption(result);//escape(result);
            var fileName = PlistPath.split(Sep);
            fileName = fileName[fileName.length - 1];
            var path = PlistPath.split(fileName)[0];
            console.log('输出路径:' + path + "文件名称:" + fileName);
            writeFile(path, fileName, JSON.stringify(obj, null, 4), callBack);
        } else {
            if (callBack) {
                callBack();
            }
        }
    });
}

function writeFile(path, fileName, content, cb) {
    var allPath = Path.join(path, fileName);
    if (fs.existsSync(path)) {
        fs.writeFile(allPath, content, function (err) {
            if (err) {
                console.log("fail " + err);
            } else {
                //console.log("写入文件ok");
            }
            cb();
        });
    } else {
        console.log('path' + allPath);
        fs.mkdirSync(path);
        writeFile(path, fileName, content, cb);
    }
}

function getResUIAndResetResourcesJS() {
    return;
    console.log('正在混淆json....... ');

    var allJson = getTextureConfigs('./res/config', null, '.json');
    async.eachSeries(allJson, function (path, callBack) {
        // console.log('读取文件 ： ' + path);
        readJsonFile(path, callBack);
    }, function () {
        console.log('混淆json完成....... ： ');
    })
}
getResUIAndResetResourcesJS();