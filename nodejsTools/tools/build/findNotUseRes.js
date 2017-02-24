var allJpg = {};
/**
 * Created by huangducai on 16/3/4.
 */
var resourcesContent = require('../../js/constant/resources.js');//所有的资源，包括 json，plist

var fs = require('fs');
var Path = require('path');
var _ = require('underscore');
var Plist = require('plist');
var async = require('async');
var useImages = {};
var jsonUseImg = {};//使用到了的图片
var jsonUsePlist = {};//使用到了的plist
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
/**
 * 读取所有的json
 * @param path
 * @param callBack
 */
function readJson(json, path) {
    for (var k in  json) {
        var obj = json[k];
        if (obj && _.isObject(obj)) {
            if (obj['Path']) {
                var imgPath = obj['Path'];
                //console.log('imgPath ===' + imgPath);
                var flag = 0;
                if (imgPath == 'WIDGETASSETSPANEL.JSON') {
                    console.log('111111111111111');
                }
                if (imgPath && (imgPath.indexOf('.json') != -1 || imgPath.indexOf('.JSON') != -1)) {
                    imgPath = imgPath.split('/');
                    imgPath = imgPath[imgPath.length - 1];
                    imgPath = imgPath.replace(/[.]/g, '_');
                    imgPath = imgPath.toUpperCase();
                    flag = 0;
                    useImages[imgPath] = path + ':' + obj['Plist'] + '/' + obj['Path'];//所有使用的资源
                }

                if (imgPath.indexOf('.jpg') != -1) {
                    console.log('存在jpg 文件 = ' + path + ':' + obj['Plist'] + '/' + obj['Path']);
                    allJpg[path] = obj['Plist'] + '/' + obj['Path'];
                }

                if (imgPath && imgPath.indexOf('.png') != -1 || imgPath.indexOf('.jpg') != -1) {
                    imgPath = imgPath.split('/');
                    imgPath = imgPath[imgPath.length - 1];
                    //imgPath.replace(/[.]/g, '_');
                    imgPath = imgPath.split('.png')[0];
                    imgPath = imgPath.split('.jpg')[0];
                    imgPath = imgPath.toUpperCase();
                    flag = 1;
                    useImages[imgPath] = imgPath;//所有使用的资源
                    useImages[imgPath] = path + ':' + obj['Plist'] + '/' + obj['Path'];//所有使用的资源
                }

                if (flag && !jsonUseImg[imgPath]) {
                    jsonUseImg[imgPath] = obj['Path'];
                } else {

                }

                var plist = obj['Plist'];
                if (plist && plist.length > 0) {//UIImages0.plist
                    plist = plist.split('/');
                    plist = plist[plist.length - 1];
                    plist.replace(/[.]/g, '_');
                    plist = plist.toUpperCase();
                    jsonUsePlist[plist] = obj['Plist'];
                }
            }
            readJson(json[k], path);
        }
    }
}

function getModifyPathFromJson(path, callBack) {
    fs.readFile(path, 'utf-8', function (err, jsonString) {
        jsonString = JSON.parse(jsonString);
        readJson(jsonString, path);
        callBack();
    });
}

function findNotUseRes() {
    //console.log(JSON.stringify(resourcesContent, null ,4));
    var allJsons = getTextureConfigs('./res', null, '.json');
    var notUse = {};

    var exlucs = [
        '.mp3',
        '/icon',
        '/monster',
        '/soldierStaticImg',
        '/skeleton',
        '.plist',
        '.json',
        'shader/',
        '.manifest',
        '.tmx',
        '.fnt',
        'wgdt.png'
    ];
    async.eachSeries(allJsons, function (path, callBack) {
        getModifyPathFromJson(path, callBack);
    }, function () {
        //jsonUsePlist
        //console.log("排除路径中包含：" + JSON.stringify(exlucs, null, 4) + " 的结果，还没使用到的资源有：");
        _.forEach(resourcesContent['hashFile'], function (value, key) {
            if (!jsonUseImg[key]) {
                //notUse[key] = value;

                var str = value;
                if (_.isObject(value)) {
                    str = value.plist + '/' + value.path;
                }

                var flag = false;
                _.forEach(exlucs, function (exluc) {
                    if (str.indexOf(exluc) != -1) {
                        flag = true;
                    }
                });

                if (!flag) {
                    notUse[key] = value;
                }
            }

        });

        _.forEach(jsonUsePlist, function (value, key) {
            var value = key.split('.')[0];
            if (notUse[value]) {
                delete notUse[value]
            }
        });

        // json中使用到没有的资源
        var count = 0;
        _.forEach(resourcesContent.hashFile, function (value, key) {
            if (useImages[key]) {
                count++;
                delete useImages[key];
            }
        });
        console.log('count ==== ' + count);

        function writeFile(fileName, data) {
            fs.writeFile(fileName, data, 'utf-8', complete);
            function complete() {
                console.log("文件生成成功 \n path = " + fileName);
            }
        }

        var obj = {};
        obj['输出的json中_用到了不存在的资源文件如下'] = useImages;
        obj['中没有用到的图片资源 排除规则是不包含以下字段'] = exlucs;
        obj['json 中没有用到的图片资源'] = notUse;
        obj['所有的jpg文件'] = allJpg;

        writeFile('./toolsOut/输出json中用到了不存在的资源.json', JSON.stringify(obj, null, 4));
    })
}
findNotUseRes();

