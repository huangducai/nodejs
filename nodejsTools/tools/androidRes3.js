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

var xiaotuResPath = '../svn/client_res_test';

var copyPath = '../svn/client_tp_res/android/client_res_png';
var writePath = '../svn/client_tp_res/android';
var svnPngDir = '../svn/client_tp_res/android/client_res_png';

ToolsHelper.createDirByPath(writePath);
ToolsHelper.createDirByPath(Path.join(writePath, 'res_zuihou'));
ToolsHelper.createDirByPath(Path.join(writePath, 'yasuoqian'));
ToolsHelper.createDirByPath(Path.join(writePath, 'yasuohou'));

var copyConfig = require('./tok2NewRes/copyConfig.js');
/**
 * 后期可能有些资源不合图的
 * @type {Array}
 */
var buhetuFileList = [
    'slide_btn01.png',
    'client_jianzhuzhezhao01.png',
    'client_jianzhuzhezhao02.png',
    'client_clipping_iconbg.png',
    'bar_06.png',
    'Effect_Common_BaoHuZhao.png',
    'client_jianzhuzhezhao01.png',
    'reportServer/',
    'KingdomMap',
    'Effect_Particle',
    'Icon/',
    'images/',
    'client_foot.png'
];
var needHetuDirList = [];
var iosNeddYaSuoObj = {};
var hetuhouDir = '../svn/client_tp_res/android/hetuhou';

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
/**
 * 需要压缩的文件夹 文件夹下 必须是图片不支持深层次的压缩 后面必须跟 /
 * @type {string[]}
 */
var needHetuList = [
    'Building_Common/',
    'Building_Tribe/',
    'Building_Union/',
    //'CityMap_Common/',
    'CityMap_Tribe/',
    'CityMap_Union/',
    'BackGround/',
    'Button/',
    'ClientRes/',
    'monsterImg/',
    'Role_Common/',
    'Role_Tribe/',
    'Role_Union/',
    'Icon/'
    // 'CommonFrame/',
    // 'CommonImage/'
];

function TestLiuWeiGuaWaZi() {

    async.series({

        //第一步 合图 怎么合图 用之前的工具
        getIosNeedHetuRes: function (callBack) {
            if (argvStr.indexOf('7') == -1) {
                callBack();
                return;
            }
            console.log('----- 获取资源');
            var obj = {};
            var iosYasuogeshi = ['.png','.jpg'];//, '.jpg', '.JPG'

            _.forEach(needHetuList, function (str) {

                //todo path
                var list = ToolsHelper.getFileList(xiaotuResPath, [str]);

                list = _.filter(list, function (item) {
                    var flag = false;
                    // console.log(JSON.stringify(item, null, 4));
                    _.forEach(iosYasuogeshi, function (item1) {

                        if (item.name.indexOf(item1) != -1) {
                            flag = true;
                        }
                    });

                    if (flag) {
                        //todo 看哈 是不是排除资源
                        _.forEach(buhetuFileList, function (item1) {
                            if (item.path.indexOf(item1) != -1) {
                                flag = false;
                            }
                        });
                    }
                    return flag;
                });
                obj[str.substr(0, str.length - 1)] = list;
            });

            _.forEach(obj, function (value, key) {
                //这里面 全部是需要压缩的资源
                iosNeddYaSuoObj[key] = _.filter(value, function (itemObj) {
                    var flag = true;
                    _.forEach(copyConfig.iosFliterResList, function (item) {
                        if (itemObj.path.indexOf(item) != -1) {
                            flag = false;
                        }
                    });
                    return flag;
                })
            });
            callBack();
        },
        /**
         * 拷贝需要压缩的副本
         * @param callBack
         */
        copyNeedYasuoToDir: function (callBack) {
            if (argvStr.indexOf('8') == -1) {
                callBack();
                return;
            }
            console.log('----- 拷贝需要压缩的副本到:' + writePath);

            _.forEach(iosNeddYaSuoObj, function (listItem, key) {
                var dir = Path.join(writePath, 'hetuqian', key);
                console.log('当前拷贝副本-------->:' + dir);
                //保存副本的路径
                needHetuDirList.push(dir + '||' + key);

                ToolsHelper.createDirByPath(dir);
                var beforeFile = ToolsHelper.getFileList(dir);

                var copylist = [];
                _.forEach(listItem, function (itebObj) {
                    ToolsHelper.copyFileSync(itebObj.path, Path.join(dir, itebObj.name));
                    copylist.push(itebObj);
                });

                var needRemoveFile = _.filter(beforeFile, function (itemObj) {
                    var flag = true;
                    _.forEach(copylist, function (copyObj) {
                        if (copyObj.name == itemObj.name) {
                            flag = false;
                        }
                    });
                    return flag;
                });

                _.forEach(needRemoveFile, function (item) {
                    console.log('移除在原项目中已经不存在的资源:' + item.path);
                    fs.unlinkSync(item.path);
                })
            });
            callBack();
        },
        /**
         * 开始合图
         * @param callBack
         */
        kaishihetu: function (callBack) {
            if (argvStr.indexOf('9') == -1) {
                callBack();
                return;
            }
            console.log('----- 开始合图');
            ToolsHelper.createDirByPath(hetuhouDir);
            async.eachSeries(needHetuDirList, function (str, cb) {
                var hetuqianPath = str.split('||')[0];
                var name = str.split('||')[1];
                /**
                 * 这里决定是否显示合图的日志
                 */
                getConfigAndYaSuo(hetuqianPath, Path.join(hetuhouDir, name), cb, true);
            }, function () {
                console.log('----- 合图完成');
                callBack();
            })
        },
        /**
         *  生成svn 的 png 的res目录
         */
        zhengliziyuan: function (callBack) {
            if (argvStr.indexOf('10') == -1) {
                callBack();
                return;
            }
            console.log('-----------------');
            var hetuhuoyasuoDir = hetuhouDir;
            var allPlistFile = ToolsHelper.getFileList(hetuhuoyasuoDir, '.plist');
            var allImage = [];
            _.forEach(allPlistFile, function (item) {
                allImage = allImage.concat(readPlistFile(item.path));
            });

            /**
             * 小图 在拷贝的时候 就不要了
             */
            ToolsHelper.createDirByPath(svnPngDir);
            ToolsHelper.remvoeDirSync(svnPngDir);
            ToolsHelper.createDirByPath(svnPngDir);
            //移除原来的资源 重新拷贝新资源
            ToolsHelper.copyDir(xiaotuResPath, svnPngDir);//哪些资源不拷贝 //, allImage

            //todo 删除已经合图的资源 ---begin
            var endFileList = ToolsHelper.getFileList(svnPngDir);
            var count = 0;
            _.forEach(allImage, function (imageName) {
                var isremove = _.find(endFileList, function (item) {
                    return item.name.indexOf(imageName) != -1;
                });
                if (isremove) {
                    // console.log('移除文件:' + isremove.path);
                    fs.existsSync(isremove.path) && fs.unlinkSync(isremove.path);
                    count++;
                }
            });
            console.log('移除已经合图的文件个数:' + count);
            //todo 删除已经合图的资源 --- end
            /**
             * 拷贝合图资源 到 对应的目录
             */
            //合图下得文件夹
            var hetuHouDirList = ToolsHelper.getAllDirList(hetuhuoyasuoDir);
            //获取所有的文件夹目录
            var dirList = ToolsHelper.getAllDirList(svnPngDir);
            _.forEach(hetuHouDirList, function (hetuHouDirObj) {
                _.forEach(dirList, function (dirObj) {
                    if (dirObj.name == hetuHouDirObj.name) {//todo copy
                        ToolsHelper.copyDir(hetuHouDirObj.path, dirObj.path);
                    }
                })
            });

            console.log('重置png目录的路径:' + svnPngDir);
            //todo 1 重置plist 指向
            //todo 2 重置ui文件中得路径
            var command = [
                util.format('node  ./tools/tok2NewRes/resetUIFile.js  %s', svnPngDir),
                util.format('node ./tools/tok2NewRes/renamePlistName.js  %s', svnPngDir)
            ];

            ToolsHelper.excCommond(command, true, callBack);
        },

        // ddd:function (cb) {
        //   console.log('------挖不出更');
        // },


        //todo 合图完毕

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
            // console.log(JSON.stringify(filterList, null, 4));
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
            console.log('开始执行第四步 将 压缩完成的资源 还原到 res目录');
            if (argvStr.indexOf('4') == -1) {
                callBack();
                return;
            }
            var pkmFiles = ToolsHelper.getFileList(Path.join(writePath, 'yasuohou'), ['.pkm']);
            // console.log(' name = ' + JSON.stringify(pkmFiles, null, 4));
            //找出所有的pkm
            //跟上面的肯定是一样的
            var allNeedCopyList = ToolsHelper.getFileList(copyPath, needCopyList);//需要拷贝的
            var filterList = ToolsHelper.getFileList(copyPath, notCopyList);//排除的
            allNeedCopyList = _.difference(allNeedCopyList, filterList);//先排除所有的拷贝
            var plistFiles = ToolsHelper.getFileList(copyPath, [".plist"]);//需要拷贝的
            // console.log(' name = ' + JSON.stringify(allNeedCopyList, null, 4));
            _.forEach(allNeedCopyList, function (yuanlaiObj) {
                var name = yuanlaiObj.name;
                name = name.split('.')[0];//纯名字

                var isHave = _.find(pkmFiles, function (pkmObj) {
                    var pkmName = pkmObj.name;
                    pkmName = pkmName.split('.')[0];
                    return pkmName == name;
                });

                var otherPath = yuanlaiObj.pathOnly.split(copyPath)[1];
                // console.log(' isHave = ' + isHave);
                //pkm 中找到图片
                if (isHave) {
                    // console.log('otherPath = ' + otherPath);
                    //原来是 png  现在是 pkm
                    var endPaht = Path.join(writePath, 'res_zuihou', otherPath, isHave.name);
                    var plistName = Path.join(writePath, 'res_zuihou', otherPath, name + ".plist");
                    // console.log('endPaht = ' + endPaht);
                    // console.log(JSON.stringify(plistFiles, null, 4));


                    var plistIsHave = _.find(plistFiles, function (pkmObj) {
                        var plistName = pkmObj.name;
                        plistName = plistName.split('.')[0];
                        return plistName == name;
                    });

                    if(plistIsHave){
                        var result = fs.readFileSync(plistName, 'utf-8');

                        if(result){
                            // console.log(JSON.stringify(result, null, 4));

                            var data = Plist.parse(result);
                            // var jsonFile = data['frames'];
                            var plistOutputDirectory= Path.join(writePath, 'res_zuihou', otherPath);
                            if(data.metadata){
                                data.metadata.textureFileName = data.metadata.textureFileName.replace(".png", ".pkm");
                                data.metadata.realTextureFileName = data.metadata.realTextureFileName.replace(".png", ".pkm");
                                // console.log(JSON.stringify(data, null, 4));
                                var xml = Plist.build(data);
                                fs.writeFileSync(Path.join(plistOutputDirectory, name + ".plist"), xml, 'utf-8');
                            }
                        }
                    }
                 
                   ToolsHelper.copyFileSync(isHave.path, endPaht);
                    // 顺带拷贝 _alpha.pkm
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


/**
 *
 * @param hetuqianDir
 * @param hetuhouDir1
 * @param hetuzhongjianwenjianjia
 * @param callBack1
 */
function getConfigAndYaSuo(hetuqianDir, hetuhouDir1, callBack1, isShowLog) {
    var dirName = hetuhouDir1.split('/');
    dirName = dirName[dirName.length - 1];
    yasuoDirToDir(hetuqianDir, hetuhouDir1, dirName + '{n}', callBack1, isShowLog);
}





/**
 * 合图压缩
 * @param from
 * @param to
 * @param mingzi
 * @param callBack
 * @param isShowLog
 */
function yasuoDirToDir(from, to, mingzi, callBack, isShowLog) {
    console.log('from :' + from + '  -------> ' + to);
    var command = 'TexturePacker ' +
        from + ' ' +
        ' --smart-update ' +
        ' --format cocos2d ' +
        ' --opt RGBA8888 ' +
        ' --allow-free-size ' +
        ' --trim-mode Trim ' +
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
        isShowLog && console.log(data);
    });

    child.stderr.on('data', function (data) {
        isShowLog && console.log(data);
    });

    child.on('exit', function (code) {
        // console.log('------------' + code);
        callBack && callBack();
    });
}

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