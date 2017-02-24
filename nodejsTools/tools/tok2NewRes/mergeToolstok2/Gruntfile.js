/**
 * Created by zxh on 15/10/12.
 */
var fs = require('fs');
var util = require('util');
var path = require('path');
var _ = require('underscore');
/**
 * 合并图片
 */
function mergeImage(workPath, publishPath) {
    console.log("\n包含文件夹:" + fs.readdirSync(workPath));
    console.log("\n\n传入路径:" + workPath);

    var returnList = [];

    var dirsNew = fs.readdirSync(workPath);
    var needPathList = [];
    _.forEach(dirsNew, function (dirName) {
        var dirPath = path.join(workPath, dirName);
        if (fs.statSync(dirPath).isDirectory()) {
            needPathList.push({
                path: dirPath,
                name: dirName
            });
        }
    });
    //找到所有的需要合图的文件夹

    _.forEach(needPathList, function (obj, index) {
        var shuchuPlistPath = util.format('%s/%s{n}.plist', publishPath, obj.name);
        var shuchuPngPath = util.format('%s/%s{n}.png', publishPath, obj.name);

        var hetuCmdStr = 'TexturePacker %s --smart-update --format cocos2d --opt RGBA8888 ' +
            '--allow-free-size ' +
            '--trim-mode None ' +
            '--force-squared ' +
            '--max-size 2048 ' +
            // '--dither-fs-alpha '+
            '--width 2048 ' +
            '--height 2048 ' +
            '--size-constraints POT ' +
            '--trim --enable-rotation --dither-fs-alpha --padding 0 ' +
            '--multipack --data %s --sheet %s';
        var commandStr = util.format(hetuCmdStr, obj.path, shuchuPlistPath, shuchuPngPath);
        console.log("commandStr------------->" + commandStr);
        //index == 0 &&
        returnList.push(commandStr);
    });
    console.log("命令条数------------->" + returnList.length);

    return returnList.join('&&');
    // var ret = [];
    // dirs.forEach(function (dirName) {
    //     // if (dirName === 'publish' || dirName.indexOf('DS_Store') !== -1 || dirName.indexOf('.json') !== -1) {
    //     //     return;
    //     // }
    //
    //     if (dirName.indexOf('.png') == -1 &&
    //         dirName.indexOf('.jpg') == -1
    //     ) {
    //         return;
    //     }
    //     // console.log("测试11------------->" + cmd);
    //
    //     var sourcePath = path.join(workPath, dirName);
    //     var plist = util.format('%s/%s{n}.plist', publishPath, dirName);
    //     var png = util.format('%s/%s{n}.png', publishPath, dirName);
    //
    //     var commandStr = util.format(cmd, sourcePath, plist, png);
    //
    //     console.log("commandStr------------->" + commandStr);
    //
    //     ret.push(commandStr);
    //
    // }, this);
    // return ret;
}

function mergeAllImages() {
    var list = [];
    var workPath = '../../../../svn/client_tp_res/android/daihetu';
    return mergeImage(workPath, workPath + '_hetuhou');
    // var files = fs.readdirSync(workPath);//需要用到同步读取
    // files.forEach(walk);
    // function walk(file) {
    //     var states = fs.statSync(workPath + '/' + file);
    //     if (states.isDirectory()) {
    //         // console.log('mergeImage(%s,%s):' + workPath + '/' + file + '   ' + workPath);
    //         // var publicPath = path.join(workPath, file);
    //         list.concat(mergeImage(workPath, workPath));
    //     }
    // }
    // return list;
}

function getCompressionCommandPath(workPath, array) {
    var dirs = fs.readdirSync(workPath);
    //    .filter(function(dirName) {
    //    return fs.statSync(path.join(workPath, dirName)).isDirectory();
    //});

    dirs.forEach(function (dirName) {
        if (dirName === 'publish' || dirName.indexOf('DS_Store') !== -1 ||
            dirName.indexOf('.json') !== -1) {
            return;
        }
        //console.log("文件夹名字" + workPath);

        if (fs.statSync(path.join(workPath, dirName)).isDirectory()) {
            getCompressionCommandPath(path.join(workPath, dirName), array);
            return;
        } else {
            if (dirName.indexOf('.png') !== -1) {
                array.push(path.join(workPath, dirName));
            }
        }
    }, this);
}

// function compressionSingleImage(workPath, textureFormat) {
//
//     var ret = [];
//     getCompressionCommandPath(workPath, ret);
//
//
//     var cmd = 'TexturePacker %s --smart-update --format cocos2d  --opt %s --allow-free-size\
//                    --no-trim --disable-rotation --dither-fs-alpha --padding 0 \
//                    --multipack --data %s --sheet %s';
//
//
//     var commands = [];
//     var plist = util.format('%s/1.plist', workPath);
//     for (var i = 0; i < ret.length; i++) {
//         var dirName = ret[i];
//         var commandStr = util.format(cmd, dirName, textureFormat, plist, dirName);
//         commands.push(commandStr);
//     }
//     var rmCommand = "rm -fr " + plist;
//     commands.push(rmCommand);
//     return commands;
// }
// var a = process.env['PAGER'] || "不存在";
// var UI_RES = '../../cocosStudio/ui/res';// process.env['UI_RES'] ||
// var SHARE_RES = '../../client_res';//process.env['SHARE_RES'] ||
//
// var UI_COCOSSTUDIO = '../../cocosstudio/ui/cocosstudio';//process.env['UI_COCOSSTUDIO'] ||
// var UI_COCOSSTUDIO1 = '../../cocosstudio/ui/cocosstudio1';// process.env['UI_COCOSSTUDIO1'] ||
//
// var ART_WORK_PATH = '../../11、美术工作目录/99、资源输出目录';//process.env['ART_WORK_PATH']||
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // sync: {
        //     syncUIImage: {
        //         files: [
        //             {
        //                 cwd: UI_RES,
        //                 src: ['**'],
        //                 dest: SHARE_RES + "/ui"
        //             }
        //         ],
        //         pretend: false,        //是否模拟
        //         verbose: true,         //显示日志
        //         updateAndDelete: false  //是否删除本地文件（在源目录中不存在的文件）
        //     },
        //
        //     syncSkeleton: {
        //         files: [
        //             {
        //                 cwd: '../../11、美术工作目录/99、资源输出目录/skeleton/publish/',
        //                 src: ['**'],
        //                 dest: "../../cocosStudio/skeleton/cocosstudio"
        //             }
        //         ],
        //         pretend: false,        //是否模拟
        //         verbose: true,         //显示日志
        //         updateAndDelete: false  //是否删除本地文件（在源目录中不存在的文件）
        //     },
        //
        //     syncCsd: {
        //         files: [
        //             {
        //                 cwd: UI_COCOSSTUDIO1,
        //                 src: ['**'],
        //                 dest: UI_COCOSSTUDIO
        //             }
        //         ],
        //         pretend: false,        //是否模拟
        //         verbose: true,         //显示日志
        //         updateAndDelete: false  //是否删除本地文件（在源目录中不存在的文件）
        //     }
        // },

        shell: {
            mergeAllImages: {
                command: mergeAllImages()
            },
            // mergeUIImage: {
            //     command: mergeImage(path.join(ART_WORK_PATH, '/ui/UIImages'), UI_COCOSSTUDIO).join('&&'),
            // },
            //
            // mergeIconImage: {
            //     command: mergeImage(path.join(ART_WORK_PATH, '/ui/icon'), path.join(UI_COCOSSTUDIO, '/icon')).join('&&')
            // },
            //
            // mergeSoldierStaticImg: {
            //     command: mergeImage(path.join(ART_WORK_PATH, '/soldierStaticImg'), path.join(SHARE_RES, '/soldierStaticImg')).join('&&'),
            // },
            //
            // mergeMonsterImg: {
            //     command: mergeImage(path.join(ART_WORK_PATH, '/monster'), path.join(SHARE_RES, '/monster')).join('&&'),
            // },
            //
            // XMLToJSON: {
            //     command: 'node XMLToJSON.js',
            // }
        }
    });
    // 加载包含任务的插件。
    // grunt.loadNpmTasks('grunt-sync');
    grunt.loadNpmTasks('grunt-shell');

    // grunt.registerTask('mergeUIImage', [
    //     'shell:mergeUIImage',
    //     'shell:mergeIconImage',
    //     'shell:XMLToJSON',
    //     'sync:syncCsd'
    // ]);
    //
    // grunt.registerTask('mergeMonsterImg', [
    //     'shell:mergeMonsterImg'
    // ]);
    //
    // //grunt.registerTask('mergeIconImage', [
    // //    'shell:mergeIconImage'
    // //]);
    //
    // grunt.registerTask('mergeSoldierStaticImg', [
    //     'shell:mergeSoldierStaticImg'
    // ]);
    //
    // grunt.registerTask('compression', [
    //     'shell:compression'
    // ]);
    //
    // grunt.registerTask('syncUIImage', [
    //     'sync:syncUIImage'
    // ]);
    //
    // grunt.registerTask('syncSkeleton',
    //     [
    //         'sync:syncSkeleton'
    //     ])
    //
    // grunt.registerTask('mergeAllImg', [
    //     'shell:mergeUIImage',
    //     'shell:mergeMonsterImg',
    //     //'shell:mergeIconImage',
    //     'shell:mergeSoldierStaticImg'
    // ]);

};
