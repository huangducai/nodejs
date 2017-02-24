/**
 * Created by logan on 16/10/20.
 */
var ToolsHelper = require('./ToolsHelper.js');

var _ = require('underscore');
var fs = require('fs');
var util = require('util');
var xml2js = require('xml2js');
var Plist = require('plist');
var async = require('async');
var Path = require('path');
var child_process = require('child_process');

var copyPath = '../svn/client_res_test';
var writePath = '../svn/client_tp_res/android';

ToolsHelper.createDirByPath(writePath);
ToolsHelper.createDirByPath(Path.join(writePath, 'res_zuihou'));
ToolsHelper.createDirByPath(Path.join(writePath, 'yasuoqian'));
ToolsHelper.createDirByPath(Path.join(writePath, 'yasuohou'));

var copyConfig = require('./tok2NewRes/copyConfig.js');

var needCopyList = ['.png'];
var notCopyList = copyConfig.androidFliterResList;
var resetJson = function (jsonKeyObj, allPkmFiles) {
    for (var key in jsonKeyObj) {
        // console.log('----key :' + key);
        var obj = jsonKeyObj[key];
        if (obj && _.isObject(obj)) {
            if (obj['Path']) {
                //只处理图片
                // console.log('-----hhhhhhhhhhhhhhhh:' + obj['Path']);
                var filePath = obj['Path'];
                var fileName = filePath.split('/');
                fileName = fileName[fileName.length - 1];
                fileName = fileName.split('.')[0];
                var pkmPath = _.find(allPkmFiles, function (itemPkmObj) {
                    return itemPkmObj.name.split('.pkm')[0] == fileName;
                });
                if (pkmPath) {
                    // console.log('.pkm11111111111111');
                    obj['Path'] = obj['Path'].replace('.png', '.pkm')
                } else {
                    // console.log('此文件是排除文件:' + filePath);
                }
            }
            resetJson(jsonKeyObj[key], allPkmFiles);
            // console.log('00000000000000000000000000000000000000000000');
        }
    }
};

function TestLiuWeiGuaWaZi() {

    async.series({
        /**
         * 整理需要压缩的资源到单一文件夹
         * @param callBack
         */
        copyNeedRes: function (callBack) {
            if (argvStr.indexOf('1') == -1) {
                callBack();
                return;
            }
            console.log('---整理需要压缩的资源到单一文件夹 -----');

            var beforeList = ToolsHelper.getFileList(Path.join(writePath, 'yasuoqian'));

            var allNeedCopyList = ToolsHelper.getFileList(copyPath, needCopyList);
            var filterList = ToolsHelper.getFileList(copyPath, notCopyList);
            allNeedCopyList = _.difference(allNeedCopyList, filterList);//先排除所有的拷贝

            var endList = [];
            _.forEach(allNeedCopyList, function (itemObj) {
                ToolsHelper.copyFileSync(itemObj.path, Path.join(writePath, 'yasuoqian', itemObj.name));
                endList.push(itemObj);
            });

            var needRemoveList = _.filter(beforeList, function (item1) {
                return !_.find(endList, function (item2) {
                    return item2.path == item1.path;
                })
            });

            _.forEach(needRemoveList, function (item) {
                console.log('移除不存在的文件:' + item.path);
                fs.unlinkSync(item.path);
            });

            callBack();
        },
        /**
         * 拷贝需要的资源 除了第一步完成的之外 都要拷贝
         * @param callBack
         */
        copyResToNeed: function (callBack) {
            if (argvStr.indexOf('2') == -1) {
                callBack();
                return;
            }
            console.log('---拷贝需要的资源 除了第一步完成的之外 都要拷贝-----');

            var allFileList = ToolsHelper.getFileList(copyPath);

            var allNeedCopyList = ToolsHelper.getFileList(copyPath, needCopyList);//需要拷贝的
            var filterList = ToolsHelper.getFileList(copyPath, notCopyList);//排除的

            //先排除所有的拷贝
            allNeedCopyList = _.filter(allNeedCopyList, function (item1) {
                return !_.find(filterList, function (item2) {
                    return item2.path == item1.path;
                })
            });

            var neddCopy123 = _.filter(allFileList, function (item1) {
                return !_.find(allNeedCopyList, function (item2) {
                    return item2.path == item1.path;
                })
            });

            _.forEach(neddCopy123, function (itemObj) {
                var lastPath = itemObj.pathOnly.split(copyPath)[1];
                ToolsHelper.copyFileSync(itemObj.path, Path.join(writePath, 'res_zuihou', lastPath, itemObj.name));
            });

            callBack();
        },
        /**
         * 压缩资源 png  到 pkm  不支持jpg 只指出png
         */
        yasuoziyuan: function (callBack) {
            if (argvStr.indexOf('3') == -1) {
                callBack();
                return;
            }
            console.log("--------------------------------压缩资源 png  到 pkm  不支持jpg 只指出png--------------------------------");
            //只拷贝
            var dirList = ToolsHelper.getFileList(Path.join(writePath, 'yasuoqian'), [".png"]);
            console.log('长度:' + dirList.length);
            var commTemplate = "etcpack '%s' '%s'  -c  etc1  -as";
            var array = [];
            _.forEach(dirList, function (value, key, list) {
                array.push(util.format(commTemplate, value.path, Path.join(writePath, 'yasuohou')));
            });
            console.log('array长度:' + array.length);
            // console.log('------ :' + JSON.stringify(array[0], null, 4));
            // ToolsHelper.writeFile('./resOut', 'test.json', JSON.stringify(array, null, 4));
            // return;
            // array = _.first(array, 10);
            var count = 0;
            var last = 0;
            async.eachSeries(array, function (itemStr, cb) {
                child_process.exec(itemStr, {
                    maxBuffer: 5000 * 1024
                }, function (error, stdout, stderr) {
                    // console.log(' stdout: ' + stdout);
                    if (error) {
                        throw new Error('error:' + error);
                        return;
                    }
                    count++;
                    var curr = Math.ceil(count / array.length * 100);
                    if (curr != last) {
                        last = curr;
                        console.log('当前进度:' + (last - 1) + '%');
                    }

                    cb();
                });
            }, function () {
                console.log('-------- 生成pkm完毕');
                callBack();
            })
        },
        /**
         * 将 压缩完成的资源 还原到 res目录
         * @param callBack
         */
        huanyuanPkm: function (callBack) {
            if (argvStr.indexOf('4') == -1) {
                callBack();
                return;
            }
            var pkmFiles = ToolsHelper.getFileList(Path.join(writePath, 'yasuohou'), ['.pkm']);
            //找出所有的pkm
            //跟上面的肯定是一样的
            var allNeedCopyList = ToolsHelper.getFileList(copyPath, needCopyList);//需要拷贝的
            var filterList = ToolsHelper.getFileList(copyPath, notCopyList);//排除的
            allNeedCopyList = _.difference(allNeedCopyList, filterList);//先排除所有的拷贝

            _.forEach(allNeedCopyList, function (yuanlaiObj) {
                var name = yuanlaiObj.name;
                name = name.split('.')[0];//纯名字
                // console.log(' name = ' + name);
                var isHave = _.find(pkmFiles, function (pkmObj) {
                    var pkmName = pkmObj.name;
                    pkmName = pkmName.split('.')[0];
                    return pkmName == name;
                });

                var otherPath = yuanlaiObj.pathOnly.split(copyPath)[1];
                //pkm 中找到图片
                if (isHave) {
                    // console.log('otherPath = ' + otherPath);
                    //原来是 png  现在是 pkm
                    var endPaht = Path.join(writePath, 'res_zuihou', otherPath, isHave.name);
                    ToolsHelper.copyFileSync(isHave.path, endPaht);
                    //顺带拷贝 _alpha.pkm
                    ToolsHelper.copyFileSync(isHave.path.replace('.pkm', '_alpha.pkm'), endPaht.replace('.pkm', "_alpha.pkm"));
                } else {
                    // if (yuanlaiObj.name.indexOf('.png') != -1) {
                        console.log('--------- 没找到对应的压缩文件:' + yuanlaiObj.path + ' 即将拷贝源文件');
                    // }
                    ToolsHelper.copyFileSync(yuanlaiObj.path, Path.join(writePath, 'res_zuihou', otherPath, yuanlaiObj.name));
                }
            });
            callBack();
        },
        /**
         * 重置config的路径
         * @param callBack
         */
        resetConfig: function (callBack) {
            if (argvStr.indexOf('5') == -1) {
                callBack();
                return;
            }
            console.log('------即将开始重置json:');
            var allJson = ToolsHelper.getFileList(Path.join(writePath, 'res_zuihou'), '.json');
            var allPkmFiles = ToolsHelper.getFileList(Path.join(writePath, 'yasuohou'), '.pkm');//res_zuihou
            console.log('pkm 长度 = ' + allPkmFiles.length);

            _.forEach(allJson, function (jsonPathObj) {
                // console.log('Path = ' + jsonPathObj.path);
                var jsonObj = JSON.parse(fs.readFileSync(jsonPathObj.path, 'utf8'));
                // console.log('-=----- ' + jsonPathObj.path);
                resetJson(jsonObj, allPkmFiles);

                if (jsonObj['Content'] && jsonObj['Content']['Content']) {
                    var list = jsonObj['Content']['Content']['UsedResources'];
                    var list1 = [];
                    _.forEach(list, function (pathStr) {
                        var pathStr1 = pathStr;
                        pathStr = pathStr.split('/');
                        pathStr = pathStr[pathStr.length - 1];
                        pathStr = pathStr.split('.')[0];//图片名字
                        var pkmPath = _.find(allPkmFiles, function (item) {
                            return item.name.split('.')[0] == pathStr;
                        });
                        if (pkmPath) {
                            pathStr1 = pathStr1.replace('.png', '.pkm');
                        }
                        list1.push(pathStr1);
                    });
                    jsonObj['Content']['Content']['UsedResources'] = list1;
                }
                // console.log('。写入文件:' + jsonPathObj.path);
                fs.writeFileSync(jsonPathObj.path, JSON.stringify(jsonObj, null, 4));
            });

            callBack();
        },


        copyToCurrProject: function (callBack) {
            if (argvStr.indexOf('6') == -1) {
                callBack();
                return;
            }
            console.log('拷贝到工程');
            ToolsHelper.remvoeDirSync('./res');

            ToolsHelper.copyDir(Path.join(writePath, 'res_zuihou'), './res');
            callBack();
        }

    }, function () {
        console.log("this is longPing guawazi's task --- for android Pkm ");
    });
}

var argvStr = process.argv[2];
if (!argvStr) {
    var data = {
        1: '整理需要压缩的资源到单一文件夹',
        2: '拷贝需要的资源 除了第一步完成的之外 都要拷贝',
        3: '压缩资源 png  到 pkm  不支持png',
        4: '将 压缩完成的资源 还原到 res目录',
        5: '重置 json',
        6: '拷贝到工程'
    };

    console.log(JSON.stringify(data, null, 4));
    throw new Error('必须给参数 包含 1,2,3,4,5,6 任意数字 任意给哪几个 就执行哪几个 无关顺序');//选择执行
    return;
}


TestLiuWeiGuaWaZi();









