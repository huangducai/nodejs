/**
 * Created by huangducai on 16/2/2.
 */
/**
 * 重构res的文件和路径
 * @type {exports|module.exports}
 */
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var Plist = require('plist');

var sep = path.sep;

var async = require('async');
var resourcesContent = require('../../js/constant/resources.js');
function getTextureConfigs(rootPath, subPath, extname) {
    var textureFiles = [];
    subPath = subPath || '';
    var files = fs.readdirSync(path.join(rootPath, subPath));
    files.forEach(function (file) {

        var stat = fs.statSync(path.join(rootPath, subPath, file));
        if (stat.isDirectory()) {
            var temp = getTextureConfigs(rootPath, path.join(subPath, file), extname);
            textureFiles = textureFiles.concat(temp);
        } else if (extname) {
            if (path.extname(file) === extname) {
                textureFiles.push(path.join(rootPath, subPath, file));
            }
        } else {
            textureFiles.push(path.join(rootPath, subPath, file));
        }
    }, this);

    return textureFiles;
}
var chongfu = [];
function readPlistFile(PlistPath, callBack) {
    var fileName = PlistPath.split('res' + sep);
    fileName = fileName[fileName.length - 1];// zhangsan/abc.plist
    fileName = 'res' + sep + fileName;
    var fileName1 = fileName.replace(/[\\]/g, "/");

    fs.readFile(PlistPath, 'utf-8', function (err, result) {
        if (err) {
            console.log("error");
        } else {
            var data = Plist.parse(result);
            var jsonFile = data['frames'];
            if (jsonFile) {
                for (var k in jsonFile) {
                    var key = k;
                    k = k.split(sep);
                    k = k[k.length - 1].split('.')[0];// 图片名字 abc.png -- abc
                    //PlistPaths[fileName + "$" + k] = key;
                    k = k.toUpperCase();
                    //PlistPaths[k] = {plist: fileName, path: key};
                    var data123 = resourcesContent["hashFile"][k];
                    if (data123) {
                        var path1 = data123.plist + '/' + data123.path;
                        if (_.isString(data123)) {
                            path1 = data123;
                        }
                        var key1 = key.replace(/[\\]/g, "/");
                        var arr = fileName1.split('/');
                        if (!(arr[arr.length - 1].split('.')[0] == key.split('.')[0])) {

                            chongfu.push({1: path1, 2: fileName1 + '/' + key1});
                            //console.log(
                            //    'plist中文件重名：:\n1:' + path1 + '\n2:' +
                            //    fileName1 + '/' + key1
                            //);
                        }
                    }
                    resourcesContent["hashFile"][k] = {
                        plist: fileName1,
                        path: key
                    };
                }
            }
        }
        if (callBack) {
            callBack();
        }
    });
}

function writeFile(path, fileName, content, cb) {
    var allPath = path + fileName;
    if (fs.existsSync(path)) {
        fs.writeFile(allPath, content, function (err) {
            if (err) {
                console.log("fail " + err);
            }
            if (cb) {
                cb();
            }
        });
    } else {
        fs.mkdirSync(path);
        writeFile(path, fileName, content, cb);
    }
}

function getResUIAndResetResourcesJS() {
    // var uiPlist = getTextureConfigs('./res/ui', null, '.plist');
    // //var iconPlist = getTextureConfigs('./res/icon', null, '.plist');
    // var monsterPlist = getTextureConfigs('./res/monster', null, '.plist');
    // var soldierStaticImgPlist = getTextureConfigs('./res/soldierStaticImg', null, '.plist');
    // //var allPlist = uiPlist.concat(iconPlist).concat(monsterPlist).concat(soldierStaticImgPlist);
    // //var allPlist = uiPlist.concat(monsterPlist, soldierStaticImgPlist);
    var allPlist = getTextureConfigs('./res', null, '.plist');

    async.eachSeries(allPlist, function (path, callBack) {
        readPlistFile(path, callBack);
    }, function () {
        var str = '\n // 该文件是res下所有文件 + 包含了 plist中小图的拆分 \n\n\n' +
            'var res1 = ' + JSON.stringify(resourcesContent, null, 4) + ';\nmodule.exports = res1;';

        fs.writeFile('./js/constant/resources.js', str, function (err) {//./../
            if (err) {
                console.log("fail " + err);
            }
        });
        var data = {};
        data['plist文件中-重复的文件'] = chongfu;
        writeFile("./toolsOut/", 'plist文件中-重复的文件.json', JSON.stringify(data, null, 4));
    })
}

getResUIAndResetResourcesJS();