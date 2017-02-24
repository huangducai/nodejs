/**
 * Created by huangducai on 16/2/2.
 */
var fs = require('fs');
var Path = require('path'),
    Sep = Path.sep;
var async = require('async');

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
    fs.readFile(PlistPath, 'utf-8', function (err, result) {
        result = JSON.parse(result);
        if (result['Version']) {
            result['Version'] = '2.3.3.0';
            var fileName = PlistPath.split(Sep);
            result = JSON.stringify(result, null, 4);
            fileName = fileName[fileName.length - 1];
            var path = PlistPath.split(fileName)[0];

            writeFile(path, fileName, result, callBack);
        } else {
            callBack();
        }
    });
}

function writeFile(path, fileName, content, cb) {
    var allPath = Path.join(path, fileName);
    if (fs.existsSync(path)) {
        fs.writeFile(allPath, content, function (err) {
            if (err) {
                console.log("fail " + err);
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
    var allJson = getTextureConfigs('./res/ccsRes', null, '.json');///ui
    async.eachSeries(allJson, function (path, callBack) {
        readJsonFile(path, callBack);
    }, function () {
        console.log('全部完成 ： ');
    })
}
getResUIAndResetResourcesJS();