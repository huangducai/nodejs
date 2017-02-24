// /**
//  * Created by huangducai on 16/10/11.
//  */
// var _ = require('underscore');
// var Path = require('path');
//
// var fs = require('fs');
// var Images = require('images');
// var MaxRectsBinPack = require('./MaxRectsBinPack.js');
// var ToolsHelper = require('../ToolsHelper.js');
//
// var child_process = require('child_process');
//
// /**
//  * tp单张png 的大小
//  * @type {{width: number, height: number}}
//  */
// var tpEverySize = {
//     width: 2048,
//     height: 2048
// };
// var allowRotate = true;//放方格的时候 是否允许旋转
//
// //读取资源的根路径
//
// var readResGenDir = '../svn/client_res_test';
// //安卓不需要合图的资源名字
// var androidFliterList = [];
// //ios 不合图的资源的名字
// var iosFliterList = [];
//
//
// //始终找jpg 和 png
// var jpgList = ToolsHelper.getFileList(readResGenDir, '.jpg');
// var pngList = ToolsHelper.getFileList(readResGenDir, '.png');
//
//
// //todo png 和 jpg 过滤 有些资源是不需要压缩的 像网页那种 根据 iosFliterList
//
// var allImageList = jpgList.concat(pngList);
//
//
// var androidPath = '../svn/client_tp_res/android';
// var iosPath = '../svn/client_tp_res/ios';
//
// var peizhiwenjianMingzi = 'imageConfig.json';
// //保证路径存在
// ToolsHelper.createDirByPath(androidPath);
// ToolsHelper.createDirByPath(iosPath);
//
// var androidConfig;
// var iosConfig;
//
// if (fs.existsSync(androidPath + '/' + peizhiwenjianMingzi)) {
//     androidConfig = JSON.parse(fs.readFileSync(androidPath + '/' + peizhiwenjianMingzi));
// }
//
// if (fs.existsSync(iosPath + '/' + peizhiwenjianMingzi)) {
//     iosConfig = JSON.parse(fs.readFileSync(iosPath + '/' + peizhiwenjianMingzi));
// }
//
// /**
//  * 列出所有文件的文件大小 图片大小
//  */
// _.forEach(allImageList, function (pathObj) {
//
//     var size = Images(pathObj.path).size();
//     size.imageName = pathObj.name;
//     pathObj.states && delete pathObj['states'];
//     pathObj.size && delete pathObj['size'];
//     size.pathObj = _.clone(pathObj);
//     pathObj.imageSize = size;
// });
//
//
// var currImageList = allImageList;//当前的image
//
// function findZuiYouJie() {
//
//     var finalObj = {};
//     var count = 0;
//
//     while (currImageList.length > 0) {
//         var maxRectsBinPack = new MaxRectsBinPack(tpEverySize.width, tpEverySize.height, allowRotate);
//
//         var list = [];
//         _.forEach(currImageList, function (item) {
//             list.push(item.imageSize);
//         });
//         var list1 = maxRectsBinPack.insert2(list, 1);//0 52   1 53   2 53   3 59   4
//
//         currImageList = _.filter(currImageList, function (item) {
//             return !_.findWhere(list1, {imageName: item.name})
//         });
//
//         var list2 = [];
//
//         _.forEach(list1, function (item) {
//             var obj123 = _.clone(item.pathObj);
//             obj123.width = item.width;
//             obj123.height = item.height;
//             // obj123.size = {
//             //     width: item.width,
//             //     height: item.height
//             // };
//             list2.push(obj123);
//         });
//
//         console.log('--------- currImageList 的长度 == ' + currImageList.length);
//         finalObj[count] = list2;
//         count++;
//     }
//     ToolsHelper.writeFile('./toolsOut/', '返回结果.json', JSON.stringify(finalObj, null, 4));
//     //todo 拷贝资源
//     // androidPath
//
//     var copyPath = Path.join(androidPath, 'daihetu');
//     ToolsHelper.createDirByPath(copyPath);
//
//     var qianzhui = 'hetu_';
//
//     _.forEach(finalObj, function (list, key) {
//         var name = qianzhui + key;
//         var realPath = Path.join(copyPath, name);
//         ToolsHelper.createDirByPath(realPath);
//         // "name": "top_bg.jpg",
//         //     "pathOnly": "../svn/client_res/images",
//         //     "path": "../svn/client_res/images/top_bg.jpg",
//         //     "width": 720,
//         //     "height": 142
//         var size = 0;
//         _.forEach(list, function (itemObj) {
//             ToolsHelper.copyFileStream(itemObj.path, Path.join(realPath, itemObj.name));
//             size += itemObj.width * itemObj.height;
//         });
//
//         console.log('key === ' + key);
//         console.log('size === ' + size);
//     });
//
//     // //todo 合并小图到 大图 执行一句grunt 命令
//     // child_process.exec('cd ./tools/tok2NewRes/mergeToolstok2 && grunt shell:mergeAllImages && cd ../../../');
//     // //todo 大图转换成 pkm
//
// }
//
// findZuiYouJie();
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
