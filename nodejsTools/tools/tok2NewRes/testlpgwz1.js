// /**
//  * Created by logan on 16/10/20.
//  */
// var ToolsHelper = require('../ToolsHelper.js');
//
// var _ = require('underscore');
// var fs = require('fs');
// var util = require('util');
// var xml2js = require('xml2js');
// var Plist = require('plist');
// var async = require('async');
// var path = require('path');
// var Path = require('path');
//
//
// var copyPath = '../svn/client_res_test';
// var writePath = './res_lp';
// var xiaotulujing = './res_xiaotu';
// var pkmPath = './res_pkmlp';
//
//
// ToolsHelper.createDirByPath(pkmPath);
//
// var argvFlag = process.argv[2];
//
// /**
//  * 生成 带压缩的文件 和 目录
//  */
// function test() {
//     //1
//     ToolsHelper.copyDir(copyPath, writePath, ['.png', '.jpg', '.JPG']);
//     //2
//     // ToolsHelper.copyFileToDir(copyPath, ['.png', '.JPG', '.jpg'], xiaotulujing);
// }
//
// if (argvFlag == 0) {
//     test();
// }
//
//
// /**
//  * 拷贝 pkm plist 到 writePath
//  */
// function test1() {
//     var pkmFiles = ToolsHelper.getFileList(pkmPath, ['.pkm']);
//
//     //小图路径 一定不存在plist 图片 不处理。。。。
//     var yuanlaiFiles = ToolsHelper.getFileList(copyPath, ['.png', '.jpg']);
//
//     _.forEach(yuanlaiFiles, function (yuanlaiObj) {
//         var name = yuanlaiObj.name;
//         name = name.split('.')[0];
//         // console.log(' name = ' + name);
//         var isHave = _.find(pkmFiles, function (pkmObj) {
//             var pkmName = pkmObj.name;
//             pkmName = pkmName.split('.')[0];
//             return pkmName == name;
//         });
//
//
//         //pkm 中找到图片
//         if (isHave) {
//             var otherPath = yuanlaiObj.pathOnly.split(copyPath)[1];
//             // console.log('otherPath = ' + otherPath);
//             var endPaht = Path.join(writePath, otherPath, yuanlaiObj.name);//yuanlaiObj.name   isHave.name
//             ToolsHelper.copyFileSync(isHave.path, endPaht, true);
//         } else {
//             // console.log('--------- 没找到对应的文件');
//         }
//     })
// }
// if (argvFlag == 1) {
//     test1();
// }
//
//
// var child_process = require('child_process');
//
//
// function test2() {
//     console.log("--------------------------------开始扫描文件生成命令--------------------------------");
//     var dirList = ToolsHelper.getFileList("./res_hebing", ".png");
//     console.log('长度:' + dirList.length);
//     var commTemplate = "etcpack '%s' '%s'  -c  etc1  -as";
//     var array = [];
//     _.each(dirList, function (value, key, list) {
//         // console.log(JSON.stringify(value.path, null, 4));
//         array.push(util.format(commTemplate, value.path, './res_pkmlp'));
//     });
//
//     console.log("--------------------------------开始执行命令转换图片。请稍等--------------------------------");
//
//     // ToolsHelper.writeFile('./toolsOut', 'test.json', JSON.stringify(array, null, 4));
//     // console.log("--------array:" + array.length);
//
//     for (var i = 0; i < array.length; i += 200) {
//         array.splice(i, 0, 'clear');
//     }
//
//     var date = new Date();
//     child_process.exec(array.join("&&"), {
//         maxBuffer: 5000 * 1024
//     }, function (error, stdout, stderr) {
//         // console.log(' stdout: ' + stdout);
//         error && console.log(' error: ' + error);
//         if (!error) {
//             console.log('图片转换完成,总共耗时:' + (new Date() - date) + "毫秒");
//             console.log("--------------------------------执行plist解析生成pkm相关的plist文件--------------------------------");
//         }
//     });
// }
//
// if (argvFlag == 2) {
//     test2();
// }
//
//
// function test3() {
//     var dirList = ToolsHelper.getFileList("./res", ".png");
//     var writeDir = './res_hebing';
//
//     var count = 0;
//     _.forEach(dirList, function (item) {
//         ToolsHelper.copyFileSync(item.path, Path.join(writeDir, 'copyPng_' + count + '.png'));
//         count++;
//     })
// }
//
// if (argvFlag == 3) {
//     test3();
// }
//
//
// function test4() {
//     var allFile = ToolsHelper.getFileList('./res_pkmlp', '.pkm');
//     _.forEach(allFile, function (item) {
//
//         // if (item.name.indexOf('_alpha.pkm') != -1) {
//         //     fs.renameSync(item.path, Path.join(item.pathOnly, item.name.replace('_alpha.pkm', ".pkm@Alpha")))
//         // }
//
//         if (item.name.indexOf('.pkm@Alpha') != -1) {
//             fs.renameSync(item.path, Path.join(item.pathOnly, item.name.replace('.pkm@Alpha', ".pkm@alpha")))
//         }
//     })
// }
//
// if (argvFlag == 4) {
//
//     test4();
// }
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
