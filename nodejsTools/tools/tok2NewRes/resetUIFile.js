/**
 * Created by huangducai on 16/10/25.
 */

var scanPath = process.argv[2];
if (!scanPath) {
    throw new Error('路径不存在');
    return;
}
//renamePlistName.js
//equip_frame01.png
// scanPath = './res/ccsRes';
console.log('----当前修改的位置是:' + scanPath);
//这个路径 指向的是json的路径 即 cocosstudio的描述文件的位置不能是其他位置

/**
 * 此文件 不做plist 的修改
 */
var ToolsHelper = require('../ToolsHelper.js');

var _ = require('underscore');
var fs = require('fs');
var util = require('util');
var xml2js = require('xml2js');
var Plist = require('plist');
var async = require('async');
var Path = require('path');

var allImagePath = {};
var bucunzai = {};
function readJsonAndReset(jsonObj) {
    // console.log('读取路径:' + jsonObj.path);
    var json = JSON.parse(fs.readFileSync(jsonObj.path));

    var usedResList = [];
    resetJson(json, usedResList, jsonObj);
    //此路径要算相对路径
    if (json['Content'] && json['Content']['Content']) {
        usedResList = _.uniq(usedResList);
        json['Content']['Content']['UsedResources'] = usedResList;
    }
    return json;
}

//json 中 全部是全路径

function resetJson(json, usedResList, jsonObj) {
    // jsonPath =
    for (var key in json) {
        var obj = json[key];
        if (obj && _.isObject(obj)) {
            var filePath = obj['Path'];//一定是 .png .jpg .pkm .pvr.ccz .json .plist
            if (filePath) {
                var fileName = getNotHaveHuzhui(filePath);
                // var fileName = filePath.split('/');
                // fileName = fileName[fileName.length - 1];
                /**
                 * 是否有该文件
                 */
                var dataInImage = allImagePath[fileName];
                if (dataInImage) {
                    if (_.isObject(dataInImage)) {
                        //肯定是图片
                        // "plist": "res/ccsRes/hetu/hetu_12.plist",
                        // "path": "common_bar06.png"
                        obj['Path'] = dataInImage.path;
                        obj['Type'] = 'PlistSubImage';
                        obj['Plist'] = dataInImage.plist;
                        var zuizhonglujing = obj['Plist'];
                        //todo  android  或者 ios  存入图片 和 plist
                        usedResList.push(zuizhonglujing);
                        /**
                         * res/ccsRes
                         */
                        var bigPvr = Path.join(jsonObj.pathOnly, zuizhonglujing.replace('.plist', '.pvr.ccz'));
                        var bigPkm = Path.join(jsonObj.pathOnly, zuizhonglujing.replace('.plist', '.pkm'));
                        var bigPng = Path.join(jsonObj.pathOnly, zuizhonglujing.replace('.plist', '.png'));

                        // console.log('---- bigPvr' + bigPvr);
                        var count = 0;
                        if (fs.existsSync(bigPvr)) {
                            // console.log('检测路径:' + bigPvr);
                            usedResList.push(zuizhonglujing.replace('.plist', '.pvr.ccz'));
                            count++;
                        }

                        if (fs.existsSync(bigPkm)) {
                            // console.log('检测路径:' + bigPkm);
                            usedResList.push(zuizhonglujing.replace('.plist', '.pkm'));
                            count++;
                        }

                        if (fs.existsSync(bigPng)) {
                            // console.log('检测路径:' + bigPng);
                            usedResList.push(zuizhonglujing.replace('.plist', '.png'));
                            count++;
                        }

                        if (count == 0) {
                            console.log('图片不存在:' + bigPvr);
                        }

                        if (count > 1) {
                            console.log('同时存在了pkm 或者 png  或者 pvr:bigPvr:' + bigPvr);
                            console.log('同时存在了pkm 或者 png  或者 pvr:bigPkm:' + bigPkm);
                            console.log('同时存在了pkm 或者 png  或者 pvr:bigPng:' + bigPng);
                        }
                    } else {
                        //单文件  png jpg json
                        obj['Path'] = dataInImage;//t除前面的 res/
                        obj['Type'] = 'Normal';
                        obj['Plist'] = '';
                        usedResList.push(obj['Path']);
                    }
                } else {
                    console.log('该文件不存在:' + filePath);
                    bucunzai[fileName] = bucunzai[fileName] || {};
                    bucunzai[fileName][jsonObj.path] = jsonObj.path;
                }
            }
            resetJson(json[key], usedResList, jsonObj);
        }
    }
}


function getNotHaveHuzhui(str) {
    var strList = str.split('/');
    strList = strList[strList.length - 1];

    return strList.split('.')[0];
}


function test() {
    async.series({
        //
        // renamePlistName: function (callBack) {
        //     // renamePlistName.js
        //     console.log('----- 修改文件夹中 plist 的路径');
        //     ToolsHelper.excCommond('node ./tools/tok2NewRes/renamePlistName.js', true, callBack);
        //
        // },

        readAllFile: function (callBack) {
            console.log('----- 开始重置config');

            var allFile = ToolsHelper.getFileList(scanPath, ['ccsRes/']);
            _.forEach(allFile, function (pathObj) {
                // var list = ['.png', '.jpg', 'JPG', '.pkm', '.pvr.ccz'];
                var showPath = pathObj.path.split(scanPath)[1].substr(8);
                // console.log('----- scanPath:' + scanPath);

                allImagePath[getNotHaveHuzhui(pathObj.name)] = showPath;//只取相对路径
                //png 是 res 下得路径
                // console.log('----- ddddd:' + showPath);
            });

            var plistPist = ToolsHelper.getFileList(scanPath, '.plist');
            /**
             * obj 的 一定是png
             */
            _.forEach(plistPist, function (plistPathObj) {
                var plistList = ToolsHelper.readPlistFile(plistPathObj.path);
                _.forEach(plistList, function (tupianMingzi) {
                    allImagePath[getNotHaveHuzhui(tupianMingzi)] = {
                        path: tupianMingzi,
                        plist: plistPathObj.path.split(scanPath)[1].substr(8)
                        //plist 是在 ccsRes 下得路径
                    }
                });
            });

            ToolsHelper.writeFile('./toolsOut', '所有的图片.json', JSON.stringify(allImagePath, null, 4), callBack);
        },
        /**
         * 读出图片 塞到json中去
         * @param callBack
         */
        resetJson: function (callBack) {
            var allJson = ToolsHelper.getFileList(scanPath, '.json');
            async.eachSeries(allJson, function (jsonObj, callBack1) {
                var json = readJsonAndReset(jsonObj);
                // console.log('-------- 准备写入文件: -------' + jsonObj.pathOnly + '/' + jsonObj.name);
                ToolsHelper.writeFile(jsonObj.pathOnly + '/', jsonObj.name, JSON.stringify(json, null, 4), callBack1)
            }, function () {
                console.log('-------- 写入文件完成 -------');
                ToolsHelper.writeFile('./toolsOut', '文件缺失.json', JSON.stringify(bucunzai, null, 4), callBack)
            })
        },

        ditu: function (callBack2) {
            var allTmx = ToolsHelper.getFileList(scanPath, '.tmx');
            _.forEach(allTmx, function (itemObj) {
                var index = itemObj.path.lastIndexOf('/');
                var tmxPath = itemObj.path.substr(0, index);
                var tmxImages = ToolsHelper.getFileList(tmxPath, ['.png', 'pkm', '.pvr.ccz']);

                var ImageNameList = {};
                _.forEach(tmxImages, function (item) {
                    ImageNameList[item.name.split('.')[0]] = item.name;
                });

                var str = fs.readFileSync(itemObj.path, 'utf-8');
                _.forEach(ImageNameList, function (value, key) {
                    str = str.replace(key + '.png', value);
                    str = str.replace(key + '.pkm', value);
                    str = str.replace(key + '.pvr.ccz', value);
                });
                fs.writeFileSync(itemObj.path, str);
            })
            callBack2 && callBack2();
        }
    }, function () {
        console.log('resetUIfile end');
    })
}
test();