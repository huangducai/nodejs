/**
 * Created by huangducai on 16/10/19.
 */

var heTuwenjianMingzi = 'hetu_{n}';//必须要由 _{n} 不能包含数字

var hetuhouhuizming = '_hetuhezhuiming';//名字会保证唯一

var ConfigName = 'CurrConfigName.json';

var iosHeTuqianDir = '../svn/client_tp_res/ios/daihetu';
var iosHeTuHouDir = '../svn/client_tp_res/ios/hetuhou';

var androidHeTuqianDir = '../svn/client_tp_res/android/daihetu';
var androidHeTuHouDir = '../svn/client_tp_res/android/hetuhou';

var iosHetuZhongjianDir = '../svn/client_tp_res/ios/daihetu_Config';


var androidHetuZhongjianDir = '../svn/client_tp_res/android/daihetu_Config';


var Path = require('path');
var fs = require('fs');
var async = require('async');
var _ = require('underscore');
var Plist = require('plist');
var child_process = require('child_process');
var ToolsHelper = require('../ToolsHelper.js');

//合图配置文件
ToolsHelper.createDirByPath(iosHetuZhongjianDir);
ToolsHelper.createDirByPath(androidHetuZhongjianDir);

// 合图后的文件夹
ToolsHelper.createDirByPath(iosHeTuHouDir);
ToolsHelper.createDirByPath(androidHeTuHouDir);

// var iosConfigPath = Path.join(iosHetuZhongjianDir, ConfigName);
// var androidConfigPath = Path.join(androidHetuZhongjianDir, ConfigName);


function readPlistFile(PlistPath) {

    var allFile = [];
    var result = fs.readFileSync(PlistPath, 'utf-8');
    var data = Plist.parse(result);
    var jsonFile = data['frames'];
    if (jsonFile) {
        for (var k in jsonFile) {
            allFile.push(k)
        }
    }
    return allFile;
}

/**
 * 合图压缩
 * @param from
 * @param to
 * @param mingzi
 * @param callBack
 */
function yasuoDirToDir(from, to, mingzi, callBack) {
    //iosHeTuqianDir
    // console.log('------- 执行压缩命令 ------');
    console.log('from :' + from + '  -------> ' + to);
    var command = 'TexturePacker ' +
        from + ' ' +
        ' --smart-update ' +
        ' --format cocos2d ' +
        ' --opt RGBA8888 ' +
        ' --allow-free-size ' +
        ' --trim-mode None ' +
        ' --force-squared ' +
        ' --max-size 2048 ' +
        ' --width 2048 ' +
        ' --height 2048 ' +
        ' --size-constraints POT ' +
        ' --trim ' +
        ' --enable-rotation ' +
        ' --dither-fs-alpha ' +
        ' --padding 0 ' +
        ' --multipack ' +
        ' --data ' +
        Path.join(to, mingzi + '.plist') + ' ' +
        ' --sheet ' +
        Path.join(to, mingzi + '.png');

    var child = child_process.exec(command);
    child.stdout.on('data', function (data) {
        console.log(data);
    });

    child.stderr.on('data', function (data) {
        console.log(data);
    });

    child.on('exit', function (code) {
        // console.log('------------' + code);
        callBack && callBack();
    });
}


function getConfigAndYaSuo(hetuqianDir, hetuhouDir, hetuwenjianmingzibiaoshi, hetuzhongjianwenjianjia, callBack1) {
    var plistPath = {};
    var xiaotuqu = Path.join(hetuzhongjianwenjianjia, 'xiaotuqu');
    var datuqu = Path.join(hetuzhongjianwenjianjia, 'datuqu');
    var tempPath = Path.join(hetuzhongjianwenjianjia, 'temp');
    var tempYasuohou = Path.join(hetuzhongjianwenjianjia, 'tempYasuohou');

    ToolsHelper.createDirByPath(tempPath);
    ToolsHelper.remvoeDirSync(tempPath);
    ToolsHelper.createDirByPath(tempPath);

    ToolsHelper.createDirByPath(tempYasuohou);
    ToolsHelper.remvoeDirSync(tempYasuohou);
    ToolsHelper.createDirByPath(tempYasuohou);

    ToolsHelper.createDirByPath(xiaotuqu);
    ToolsHelper.createDirByPath(datuqu);

    //1 todo 读取已经生成的合图分类文件夹
    var allPlistFile = ToolsHelper.getFileList(datuqu, '.plist');

    //2 todo 获取 当前的最新的文件
    var currFile = ToolsHelper.getFileList(hetuqianDir);

    //读取所有的plist 中的图片 看看现在还有没得 有就拷贝到单独的文件夹 没得的 移除

    var maxIndex = 0;

    async.eachSeries(allPlistFile, function (plistPathObj, callBackPlist) {
        var fileIndex = plistPathObj.name.replace(/[^0-9]/ig, "");
        fileIndex = parseInt(fileIndex);
        maxIndex = Math.max(maxIndex, fileIndex);

        plistPath[fileIndex] = readPlistFile(plistPathObj.path);
        callBackPlist();
    }, function () {
        //todo 已经生成了 plist 中的所有文件 把这些文件 拷贝到 xiaotuqu 下
        plistPath[maxIndex] = [];//置空 最后一张图 重新压缩

        // console.log('----- plistPath = ' + JSON.stringify(plistPath, null, 4));
        // notHaveList 需要包含最后一个文件夹的内容
        var notHaveList = _.filter(currFile, function (item) {
            var flag = true;
            _.forEach(plistPath, function (list, key) {
                if (list.indexOf(item.name) != -1) {
                    flag = false;
                }
            });
            return flag
        });
        //将 最后一个文件夹的内容 和 新增的内容 放到临时文件夹中
        _.forEach(notHaveList, function (itemObj) {
            ToolsHelper.copyFileSync(itemObj.path, Path.join(tempPath, itemObj.name));
        });

        //对 tempPath 进行压缩
        yasuoDirToDir(tempPath, tempYasuohou, hetuwenjianmingzibiaoshi, function () {
            console.log('----- 对 临时文件夹进行压缩 ');
            var plistFile = ToolsHelper.getFileList(tempYasuohou, '.plist');
            var maxIndex1 = maxIndex;
            async.eachSeries(plistFile, function (obj, callBackTempYasuohou) {
                var fileIndex = obj.name.replace(/[^0-9]/ig, "");
                var index = parseInt(fileIndex) + parseInt(maxIndex1);
                console.log('----- index == ' + index);
                plistPath[index] = readPlistFile(obj.path);
                maxIndex = Math.max(maxIndex, index);
                callBackTempYasuohou();
            }, function () {
                //
                // for (var k123 in plistPath) {
                //     console.log('----- plistPath k== ' + k123);
                // }

                //获取完了 现在开始 拷贝资源到 xiaotuqu
                //移除 已经不存在的文件 和 更新文件
                _.forEach(plistPath, function (valueList, index) {
                    var curPath = Path.join(xiaotuqu, 'hetu_' + index);
                    ToolsHelper.createDirByPath(curPath);

                    var hasList = [];
                    _.forEach(valueList, function (strPngName) {
                        // console.log('objPath=======' + JSON.stringify(strPngName, null, 4));
                        var endFilePath = Path.join(curPath, strPngName);
                        var data = _.findWhere(currFile, {name: strPngName});
                        if (data) {
                            //拷贝文件
                            ToolsHelper.copyFileSync(data.path, endFilePath);
                            //该plist 中应该存在的文件
                            hasList.push(data.name);
                        } else {
                            console.log('datadata 不存在 ')
                        }
                    });

                    //移除多余的文件
                    var currFile1 = ToolsHelper.getFileList(curPath, '.png');
                    _.forEach(currFile1, function (item) {
                        if (_.indexOf(hasList, item.name) == -1) {
                            console.log('移除文件 :' + item.path);
                            fs.unlinkSync(item.path);
                        }
                    })

                });

                //开始合图
                var files = fs.readdirSync(xiaotuqu);
                var allDirList = [];

                files.forEach(walk);
                function walk(file) {
                    var fullPath = xiaotuqu + '/' + file;
                    var states = fs.statSync(fullPath);
                    if (states.isDirectory()) {
                        allDirList.push(fullPath); //只有一级目录
                    }
                }

                async.eachSeries(allDirList, function (pathStr, cb) {
                    // console.log(' 开始压缩 =====' + pathStr);
                    var name = pathStr.split('/');
                    name = name[name.length - 1];
                    // console.log('----- 对 小图文件夹进行压缩 ');

                    yasuoDirToDir(pathStr, datuqu, name, cb);
                }, function () {
                    console.log(' 合图完成 =====');

                    var file1 = ToolsHelper.getFileList(datuqu, '.png');
                    var file2 = ToolsHelper.getFileList(datuqu, '.plist');
                    var file3 = file1.concat(file2);

                    //保证资源
                    ToolsHelper.createDirByPath(hetuhouDir);
                    ToolsHelper.remvoeDirSync(hetuhouDir);
                    ToolsHelper.createDirByPath(hetuhouDir);

                    _.forEach(file3, function (obj) {
                        ToolsHelper.copyFileSync(obj.path, Path.join(hetuhouDir, obj.name));
                    });

                    console.log('拷贝资源到 :' + hetuhouDir + ' 完成');
                    console.log('没有 移除多余资源');
                    //todo 移除多余的资源

                    callBack1 && callBack1();
                })
            })
        });
    });
}

function test() {
    async.series({
        iosHeTu: function (callBack) {
            //此步骤 必须要压好图
            if (argvFlag == 1) {
                getConfigAndYaSuo(iosHeTuqianDir, iosHeTuHouDir, heTuwenjianMingzi, iosHetuZhongjianDir, callBack);
            } else {
                callBack();
            }
        },

        androidHeTu: function (callBack) {
            if (argvFlag == 0) {
                getConfigAndYaSuo(androidHeTuqianDir, androidHeTuHouDir, heTuwenjianMingzi, androidHetuZhongjianDir, callBack);
            } else {
                callBack();
            }
        }

    }, function () {
        console.log('合图完成。。。');
    })
}
var argvFlag = process.argv[2];

test();


// 0 android
// 1 ios


