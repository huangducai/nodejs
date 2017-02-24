/**
 * Created by huangducai on 16/10/24.
 */
var ToolsHelper = require('../ToolsHelper.js');

/**
 * 这个参数是为了本地测试用的 是否更新存放 pvr.ccz 的目录
 * @type {boolean}
 */
var isUpdatePvrDir = false;

var Canshu = [
    ' --padding 2 ',
    ' --extrude 1 ',
    ' --extrude 2 '// 这个是城墙测试 他会多裁剪两个像素 来拼接周围的黑线 跟 padding 参数是对应的
];


var _ = require('underscore');
var fs = require('fs');
var util = require('util');
var xml2js = require('xml2js');
var Plist = require('plist');
var async = require('async');
var Path = require('path');
var child_process = require('child_process');
var copyConfig = require('./copyConfig.js');


var iosNeddYaSuoObj = {};
var needHetuDirList = [];

var copyPath = '../svn/client_res_test';
var writePath = '../svn/client_tp_res/ios';
var hetuhouDir = '../svn/client_tp_res/ios/hetuhou';
var svnPngDir = '../svn/client_tp_res/ios/client_res_png';
var svnPngDanTu = '../svn/client_tp_res/ios/allPng_yasuoqian';
var allPng_shoudongYasuohou = '../svn/client_tp_res/ios/allPng_shoudongYasuohou';
var shoudongYasuo = '../svn/client_tp_res/ios/allPng_shoudongYasuo';
var yasuoMulu = '../svn/resouter/yasuoqian';
var resoutDir = '../svn/resouter';
var svnPvrDanTu = '../svn/client_tp_res/ios/allPvr_yasuohou';

var pvrDir = '../svn/resouter/res_pvr';
var currResDir = './res';

ToolsHelper.createDirByPath(writePath);
ToolsHelper.createDirByPath(allPng_shoudongYasuohou);
ToolsHelper.createDirByPath(hetuhouDir);
ToolsHelper.createDirByPath(svnPvrDanTu);

/**
 * 合图压缩
 * @param from
 * @param to
 * @param mingzi
 * @param callBack
 * @param isShowLog
 */
function yasuoDirToDir(from, to, mingzi, callBack, isShowLog, isCityRes) {
    isCityRes = isCityRes || 0;
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
        ' %s ' +
        ' --multipack ' +
        ' --data ' +
        Path.join(to, mingzi + '.plist') + ' ' +
        ' --sheet ' +
        Path.join(to, mingzi + '.png');

    command = util.format(command, Canshu[isCityRes]);

    console.log('--- command:' + command);

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

/**
 *
 * @param hetuqianDir
 * @param hetuhouDir1
 * @param hetuzhongjianwenjianjia
 * @param callBack1
 */
function getConfigAndYaSuo(hetuqianDir, hetuhouDir1, callBack1, isShowLog, isCityRes) {

    var file = ToolsHelper.getFileList(hetuqianDir);
    if (!file.length) {
        console.log('一个文件都没得:' + hetuqianDir);
        callBack1 && callBack1();
        return
    }

    var dirName = hetuhouDir1.split('/');
    dirName = dirName[dirName.length - 1];
    yasuoDirToDir(hetuqianDir, hetuhouDir1, dirName + '{n}', callBack1, isShowLog, isCityRes);
}

//之前做的命令

/**
 * 压缩并生成png 目录  node tools/tok2NewRes/IosHetuTools.js 123

 */

/**
 * 需要压缩的文件夹 文件夹下 必须是图片不支持深层次的压缩 后面必须跟 /
 * @type {string[]}
 */
var needHetuList = [
    'Building_Common/',
    // 'Building_Tribe/',
    // 'Building_Union/',
    "tree_building_tribe/",
    "wall_tribe_lv_1/",
    "wall_tribe_lv_2/",
    "wall_tribe_lv_3/",
    "wall_tribe_lv_4/",
    "wall_tribe_lv_5/",
    "wall_tribe_lv_6/",
    "wall_tribe_lv_7/",
    "wall_tribe_lv_8/",
    "wall_tribe_lv_9/",

    "tree_building_Union/",
    "wall_union_lv_1/",
    "wall_union_lv_2/",
    "wall_union_lv_3/",
    "wall_union_lv_4/",
    "wall_union_lv_5/",
    "wall_union_lv_6/",
    "wall_union_lv_7/",
    "wall_union_lv_8/",
    "wall_union_lv_9/",

    'CityMap_Common/',
    // 'CityMap_Tribe/',
    // 'CityMap_Union/',
    'BackGround/',
    'Button/',
    'ClientRes/',
    'Role_Common/',
    'Role_Tribe/',
    'Role_Union/',
    'Icon/',
    'CommonImage/',
];
/**
 * 后期可能有些资源不合图的
 * @type {Array}
 */

var Images = require('images');

var allFile = ToolsHelper.getFileList('../svn/client_res_test/ccsRes', ['.png', '.jpg']);//, ['.plist', '.png', '.jpg', '.json']
var list = [];
_.forEach(allFile, function (item) {

    if (item.name == 'daditubeijing.png') {
        console.log('-------' + JSON.stringify(Images(item.path).size(), null, 4));
    }

    var size = Images(item.path).size();
    if (size.width > 2040 || size.height > 2040) {
        list.push(item.name);
    }
});

console.log('图片大于2040的:' + JSON.stringify(list, null, 4));


var buhetuFileList = [
    'common_bar12.png',
    'bar_06.png',
    'reportServer/',
    'login_005.png',
    'yun_0',
    'client_jianzhuzhezhao01.png',
    'client_jianzhuzhezhao02.png',
    'ALPHA_PIX_4.png',
    'client_choose01.png',
    'client_foot.png',
    'client_tile_1.png',
    'client_clipping_iconbg.png',
    //这些图片是不合图的 但是会压缩
    // "wgdt.png",
    // "wujian.png",
    "daditubeijing.png",
];

//不拷贝的压缩资源名称
var hetuHoubuyasuoList = [
    'reportServer/',
    'images/',
    'Effect_Particle/',
    'Effect_Normal/',
    'Defult/',
    // 'KingdomMap/',
    'CommonFrame/',
    //合图 但是不压缩的文件夹
    // 'BackGround/',
    // 'ClientRes/',
    // 'CommonImage/',
    // 'main_frame01_loding02',
    // 'main_frame01_loding01',
    // 'zh_cn_logo',
    //单图写在下面 //正式资源
    //单图写在下面
    'yun_0',
    'client_jianzhuzhezhao01.png',
    'client_jianzhuzhezhao02.png',
    'ALPHA_PIX_4.png',
    'client_choose01.png',
    'client_foot.png',
    'client_tile_1.png',
    "client_clipping_iconbg.png.png",
    "bar_06.png",
    "client_choose01.png",
    "client_foot.png",
    "client_jianzhuzhezhao01.png",
    "client_jianzhuzhezhao02.png",
    "client_tile_1.png"

];

function hetu() {

    async.series({
        //第一步 合图 怎么合图 用之前的工具
        getIosNeedHetuRes: function (callBack) {
            console.log('----- 获取资源');
            var obj = {};
            var iosYasuogeshi = ['.png', '.jpg', '.JPG'];

            _.forEach(needHetuList, function (str) {
                //todo path
                var list = ToolsHelper.getFileList(copyPath, [str]);
                list = _.filter(list, function (item) {
                    var flag = false;
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
                    _.forEach(buhetuFileList, function (item) {
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
            if (argvStr.indexOf('1') == -1) {
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
            if (argvStr.indexOf('2') == -1) {
                callBack();
                return;
            }
            console.log('----- 开始合图');

            async.eachSeries(needHetuDirList, function (str, cb) {
                var hetuqianPath = str.split('||')[0];
                var name = str.split('||')[1];

                var flag = 0;
                console.log('-----hetuqianPath :' + hetuqianPath);
                //) 地图参数是这个
                if (name == 'CityMap_Union' ||
                    name == 'CityMap_Tribe'
                ) {
                    flag = 1;
                }
                //城墙参数是这个

                if (name.indexOf('wall_tribe_lv_') == 0 || name.indexOf('wall_union_lv_') == 0) {
                    flag = 2;
                }

                /**
                 * 这里决定是否显示合图的日志
                 */
                getConfigAndYaSuo(hetuqianPath, Path.join(hetuhouDir, name), cb, true, flag);
            }, function () {
                console.log('----- 合图完成');
                callBack();
            })
        },
        /**
         *  生成svn 的 png 的res目录
         */
        zhengliziyuan: function (callBack) {
            if (argvStr.indexOf('3') == -1) {
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
            ToolsHelper.copyDir(copyPath, svnPngDir);//哪些资源不拷贝 //, allImage
            // return;

            setTimeout(function () {
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
            }, 1000);
        },
        /**
         * 拷贝 png资源 到当前目录 并执行 配置修改  重新扫描文件 pb 更新等等
         */
        copyPngToCurrDir: function (callBack) {
            if (argvStr.indexOf('4') == -1) {
                callBack();
                return;
            }

            ToolsHelper.remvoeDirSync(currResDir);
            ToolsHelper.createDirByPath(currResDir);
            ToolsHelper.copyDir(svnPngDir, currResDir);

            //执行pb jiami
            var command = [
                'grunt pb',//更新 pvr 目录
                'grunt shell:jiami',//配置转换
                'grunt shell:reBuildRes'//重新扫描文件
            ];

            ToolsHelper.excCommond(command, true, callBack);
        },

        //todo 以下 是pvr 解决方案
        /**
         * copy拷贝的是 png 单图 只有图片 拷贝 所有资源全部提取出来 用来压缩
         */
        copyTosvn: function (callBack) {
            if (argvStr.indexOf('5') == -1) {
                callBack();
                return;
            }

            var fileList = ToolsHelper.getFileList(Path.join(svnPngDir, 'ccsRes'), ['.png', '.jpg', 'JPG']);
            fileList = _.filter(fileList, function (item) {
                var flag = true;
                //不合图的 也不要压缩
                _.forEach(hetuHoubuyasuoList.concat(buhetuFileList), function (str) {
                    if (item.path.indexOf(str) != -1) {
                        flag = false;
                    }
                });
                return flag;
            });

            _.forEach(fileList, function (item) {
                ToolsHelper.copyFileSync(item.path, Path.join(svnPngDanTu, item.name))
            });
            console.log('总资源长度:' + fileList.length);
            callBack();
        },

        /**
         * 拷贝pvr资源 到 当前项目的 res 下
         * @param callBack
         */
        copyPToCurrDir: function (callBack) {
            if (argvStr.indexOf('6') == -1) {
                callBack();
                return;
            }

            //todo 拷贝压缩后的资源 到 压缩后的目录 begin
            var file = ToolsHelper.getFileList(allPng_shoudongYasuohou);
            _.forEach(file, function (item) {
                ToolsHelper.copyFileSync(item.path, Path.join(svnPvrDanTu, item.name), true);
            });
            //todo 拷贝压缩后的资源 到 压缩后的目录 end

            async.series({
                //todo 更新需求的目录vr
                svnUpPvrDir: function (callBack1) {
                    if (isUpdatePvrDir) {
                        var command = [
                            util.format('svn up %s', svnPvrDanTu)
                        ];
                        ToolsHelper.excCommond(command, true, callBack1);
                    } else {
                        callBack1();
                    }
                },
                /**
                 * 拷贝到png目录到当前的目录 然后 替换已经压缩的pvr 资源
                 * @param callBack1
                 */
                copyPToCurr: function (callBack1) {
                    ToolsHelper.remvoeDirSync(currResDir);
                    ToolsHelper.createDirByPath(currResDir);
                    ToolsHelper.copyDir(svnPngDir, currResDir);//把 png 文件夹 拷贝过来
                    //todo 1,先拷贝 png 的 资源 到 当前项目中来 并拷贝 pvr 替换存在的资源 踢出 不拷贝的资源
                    //修改其中的图片
                    var uiDir = Path.join(currResDir, 'ccsRes');
                    var uiFileList = ToolsHelper.getFileList(uiDir, ['.png', '.jpg', 'JPG']);

                    _.forEach(uiFileList, function (currDirObj) {
                        var fileName = currDirObj.name;
                        fileName = fileName.split('.')[0];
                        var pvrPath = Path.join(svnPvrDanTu, fileName + '.pvr.ccz');

                        //jpg 压缩 也放在这个目录
                        if (!fs.existsSync(pvrPath)) {
                            pvrPath = Path.join(svnPvrDanTu, fileName + '.jpg');
                            if (!fs.existsSync(pvrPath)) {
                                pvrPath = Path.join(svnPvrDanTu, fileName + '.png');
                            }
                        }

                        var flag = true;
                        //这里是合图后不压缩的资源
                        _.forEach(hetuHoubuyasuoList, function (str) {
                            if (currDirObj.path.indexOf(str) != -1) {
                                flag = false;
                            }
                        });
                        if (flag && fs.existsSync(pvrPath)) {
                            fs.unlinkSync(currDirObj.path);//如果存在 那么就删除当前目录的
                            var name = '.pvr.ccz';
                            if (pvrPath.indexOf('.jpg') != -1) {
                                name = '.jpg';
                            }
                            if (pvrPath.indexOf('.png') != -1) {
                                name = '.png';
                            }
                            ToolsHelper.copyFileSync(pvrPath, Path.join(currDirObj.pathOnly, fileName + name));

                            //如果有plist  那么连plist 一起拷贝
                            var plistPaht = Path.join(svnPvrDanTu, fileName + '.plist');
                            if (fs.existsSync(plistPaht)) {
                                ToolsHelper.copyFileSync(plistPaht, Path.join(currDirObj.pathOnly, fileName + '.plist'));
                            }
                        }
                    });
                    callBack1();
                },
                /**
                 * 重置 项目中得 plist 文件
                 * @param callBack1
                 */
                resetPlsit: function (callBack1) {
                    console.log('重置plist 中的文件指向: 更新pb 运行混淆json 重新扫描路径' + currResDir);

                    var command = [
                        util.format(
                            'node ./tools/tok2NewRes/renamePlistName.js  %s',
                            currResDir),
                        util.format(
                            'node  ./tools/tok2NewRes/resetUIFile.js  %s',
                            currResDir
                        ),
                        'grunt pb',//更新 pvr 目录
                        'grunt shell:jiami',//配置转换
                        'grunt shell:reBuildRes'//重新扫描文件
                    ];

                    ToolsHelper.excCommond(command, true, callBack1);
                },
            }, function () {
                console.log('全部执行完毕=========');
                callBack();
            });

        },
        /**
         * 压缩后的资源拷贝
         * @param callBack
         */
        'copyPvrCCzToSvn': function (callBack) {
            if (argvStr.indexOf('7') == -1) {
                callBack();
                return;
            }

            var fun = function () {
                var beforeFiles = ToolsHelper.getFileList(svnPngDanTu, ['.png', '.jpg']);
                var fileNames = [];
                _.forEach(beforeFiles, function (item) {
                    fileNames.push(item.name.split('.')[0]);
                });
                //取纯文件名称

                ToolsHelper.remvoeDirSync(svnPvrDanTu);
                ToolsHelper.createDirByPath(svnPngDanTu);

                var nowPvr = ToolsHelper.getFileList(pvrDir);
                _.forEach(nowPvr, function (item) {
                    var name = item.name.split('.')[0];
                    if (fileNames.indexOf(name) != -1) {
                        ToolsHelper.copyFileSync(item.path, Path.join(svnPvrDanTu, item.name));
                    }
                })
            };

            //todo 更新目录
            if (isUpdatePvrDir) {
                ToolsHelper.excCommond([util.format('svn up %s', svnPvrDanTu)].join('&&'), true, fun)
            } else {
                fun();
            }
        },

        /**
         * 拷贝需要压缩的资源 到 压缩目录
         */
        copyResToYasuo: function (cb) {
            if (argvStr.indexOf('8') == -1) {
                cb();
                return;
            }

            ToolsHelper.createDirByPath(yasuoMulu);
            ToolsHelper.remvoeDirSync(yasuoMulu);
            ToolsHelper.createDirByPath(yasuoMulu);
            ToolsHelper.copyDir(svnPngDanTu, yasuoMulu);

            ToolsHelper.excCommond([
                util.format('cd %s', resoutDir),
                ' open ./nwjs-v0.12.3-osx-x64/nwjs.app'
            ], true, cb);
        },

        getShoudonYasuopng: function (callBack1) {
            if (argvStr.indexOf('9') == -1) {
                callBack1();
                return;
            }
            //todo
            var Images = require('images');
            allFile = ToolsHelper.getFileList(svnPngDanTu, ['.jpg', '.png']);

            _.forEach(allFile, function (itemObj) {
                var size = Images(itemObj.path).size();
                if (size.width != 2048 || size.height != 2048) {
                    ToolsHelper.copyFileSync(itemObj.path, Path.join(shoudongYasuo, itemObj.name));
                    fs.unlinkSync(itemObj.path);
                }
            });
            callBack1();
        }

    }, function () {
        //上传压缩后的文件 到 svn 目录
        console.log('操作完成');
    });

}


var argvStr = process.argv[2];
if (!argvStr) {
    throw new Error(
        '----必须给参数 默认请给 1234  会生成合图后的png 到当前项目下\n' +
        '1 拷贝需要压缩的副本 \n' +
        '2 开始合图\n' +
        '3 生成svn 的 png 的res目录 \n' +
        '4 生成 png资源 到当前目录 并执行 配置修改  重新扫描文件 pb 更新等等 \n' +
        '5 拷贝 png 到 svn目录 上传 拿去压缩\n' +
        '6 生成 pvr的资源拷贝pvr资源 到 当前项目的 res 下 \n' +
        '7 拷贝压缩完成的pvr ccz到压缩后的目录\n' +
        '8 拷贝资源 进行压缩' +
        "9 整理压缩前目录"
    );
    return;
}
hetu();


//
// var plistPath = {};
// var xiaotuqu = Path.join(hetuzhongjianwenjianjia, 'xiaotuqu');
// var datuqu = Path.join(hetuzhongjianwenjianjia, 'datuqu');
// var tempPath = Path.join(hetuzhongjianwenjianjia, 'temp');
// var tempYasuohou = Path.join(hetuzhongjianwenjianjia, 'tempYasuohou');
// console.log('-------hetuhouDir1' + hetuhouDir1)
// var dirName = hetuhouDir1.split('/');
// dirName = dirName[dirName.length - 1];
//
// ToolsHelper.createDirByPath(tempPath);
// ToolsHelper.remvoeDirSync(tempPath);
// ToolsHelper.createDirByPath(tempPath);
//
// ToolsHelper.createDirByPath(tempYasuohou);
// ToolsHelper.remvoeDirSync(tempYasuohou);
// ToolsHelper.createDirByPath(tempYasuohou);
//
// ToolsHelper.createDirByPath(xiaotuqu);
// ToolsHelper.createDirByPath(datuqu);
//
// //1 todo 读取已经生成的合图分类文件夹
// var allPlistFile = ToolsHelper.getFileList(datuqu, '.plist');
//
// //2 todo 获取 当前的最新的文件
// var currFile = ToolsHelper.getFileList(hetuqianDir);
//
// //读取所有的plist 中的图片 看看现在还有没得 有就拷贝到单独的文件夹 没得的 移除
//
// var maxIndex = 0;
//
// async.eachSeries(allPlistFile, function (plistPathObj, callBackPlist) {
//     var fileIndex = plistPathObj.name.replace(/[^0-9]/ig, "");
//     fileIndex = parseInt(fileIndex);
//     maxIndex = Math.max(maxIndex, fileIndex);
//
//     plistPath[fileIndex] = readPlistFile(plistPathObj.path);
//     callBackPlist();
// }, function () {
//     //todo 已经生成了 plist 中的所有文件 把这些文件 拷贝到 xiaotuqu 下
//     plistPath[maxIndex] = [];//置空 最后一张图 重新压缩
//
//     // console.log('----- plistPath = ' + JSON.stringify(plistPath, null, 4));
//     // notHaveList 需要包含最后一个文件夹的内容
//     var notHaveList = _.filter(currFile, function (item) {
//         var flag = true;
//         _.forEach(plistPath, function (list, key) {
//             if (list.indexOf(item.name) != -1) {
//                 flag = false;
//             }
//         });
//         return flag
//     });
//     //将 最后一个文件夹的内容 和 新增的内容 放到临时文件夹中
//     _.forEach(notHaveList, function (itemObj) {
//         ToolsHelper.copyFileSync(itemObj.path, Path.join(tempPath, itemObj.name));
//     });
//
//     //对 tempPath 进行压缩
//     yasuoDirToDir(tempPath, tempYasuohou, dirName + '{n}', function () {
//         console.log('----- 对 临时文件夹进行压缩 ');
//         var plistFile = ToolsHelper.getFileList(tempYasuohou, '.plist');
//         var maxIndex1 = maxIndex;
//         async.eachSeries(plistFile, function (obj, callBackTempYasuohou) {
//             var fileIndex = obj.name.replace(/[^0-9]/ig, "");
//             var index = parseInt(fileIndex) + parseInt(maxIndex1);
//             console.log('----- index == ' + index);
//             plistPath[index] = readPlistFile(obj.path);
//             maxIndex = Math.max(maxIndex, index);
//             callBackTempYasuohou();
//         }, function () {
//             //
//             // for (var k123 in plistPath) {
//             //     console.log('----- plistPath k== ' + k123);
//             // }
//
//             //获取完了 现在开始 拷贝资源到 xiaotuqu
//             //移除 已经不存在的文件 和 更新文件
//             _.forEach(plistPath, function (valueList, index) {
//                 var curPath = Path.join(xiaotuqu, 'hetu_' + index);
//                 ToolsHelper.createDirByPath(curPath);
//
//                 var hasList = [];
//                 _.forEach(valueList, function (strPngName) {
//                     // console.log('objPath=======' + JSON.stringify(strPngName, null, 4));
//                     var endFilePath = Path.join(curPath, strPngName);
//                     var data = _.findWhere(currFile, {name: strPngName});
//                     if (data) {
//                         //拷贝文件
//                         ToolsHelper.copyFileSync(data.path, endFilePath);
//                         //该plist 中应该存在的文件
//                         hasList.push(data.name);
//                     } else {
//                         console.log('datadata 不存在 ')
//                     }
//                 });
//
//                 //移除多余的文件
//                 var currFile1 = ToolsHelper.getFileList(curPath, '.png');
//                 _.forEach(currFile1, function (item) {
//                     if (_.indexOf(hasList, item.name) == -1) {
//                         console.log('移除文件 :' + item.path);
//                         fs.unlinkSync(item.path);
//                     }
//                 })
//
//             });
//
//             //开始合图
//             var files = fs.readdirSync(xiaotuqu);
//             var allDirList = [];
//
//             files.forEach(walk);
//             function walk(file) {
//                 var fullPath = xiaotuqu + '/' + file;
//                 var states = fs.statSync(fullPath);
//                 if (states.isDirectory()) {
//                     allDirList.push(fullPath); //只有一级目录
//                 }
//             }
//
//             async.eachSeries(allDirList, function (pathStr, cb) {
//                 // console.log(' 开始压缩 =====' + pathStr);
//                 var name = pathStr.split('/');
//                 name = name[name.length - 1];
//                 // console.log('----- 对 小图文件夹进行压缩 ');
//
//                 yasuoDirToDir(pathStr, datuqu, name, cb);
//             }, function () {
//                 console.log(' 合图完成 =====');
//
//                 var file1 = ToolsHelper.getFileList(datuqu, '.png');
//                 var file2 = ToolsHelper.getFileList(datuqu, '.plist');
//                 var file3 = file1.concat(file2);
//
//                 //保证资源
//                 ToolsHelper.createDirByPath(hetuhouDir1);
//                 ToolsHelper.remvoeDirSync(hetuhouDir1);
//                 ToolsHelper.createDirByPath(hetuhouDir1);
//
//                 _.forEach(file3, function (obj) {
//                     ToolsHelper.copyFileSync(obj.path, Path.join(hetuhouDir1, obj.name));
//                 });
//
//                 console.log('拷贝资源到 :' + hetuhouDir1 + ' 完成');
//                 console.log('没有 移除多余资源');
//                 //todo 移除多余的资源
//
//                 callBack1 && callBack1();
//             })
//         })
//     });
// });
