console.log('-------- findPlistIsUsed.js ------ 不应该被执行');

// /**
//  * Created by huangducai on 16/3/4. 检查csd中那些文件没有被修改到
//  */
// var fs = require('fs');
// var Path = require('path');
// var _ = require('underscore');
// var Plist = require('plist');
// var async = require('async');
//
// function getTextureConfigs(rootPath, subPath, extname) {
//     var textureFiles = [];
//     subPath = subPath || '';
//     var files = fs.readdirSync(Path.join(rootPath, subPath));
//     files.forEach(function (file) {
//         var stat = fs.statSync(Path.join(rootPath, subPath, file));
//         if (stat.isDirectory()) {
//             var temp = getTextureConfigs(rootPath, Path.join(subPath, file), extname);
//             textureFiles = textureFiles.concat(temp);
//         } else if (extname) {
//             if (Path.extname(file) === extname) {
//                 textureFiles.push(Path.join(rootPath, subPath, file));
//             }
//         } else {
//             textureFiles.push(Path.join(rootPath, subPath, file));
//         }
//     }, this);
//     return textureFiles;
// }
//
// var allJsonPaths = {};
// function readJson(json, jsonPath) {
//     var name = json['Name'];
//     _.forEach(json, function (obj) {
//         if (_.isObject(obj)) {
//             if (obj['Plist'] && obj['Path']) {
//                 allJsonPaths[jsonPath] = allJsonPaths[jsonPath] || {};
//                 allJsonPaths[jsonPath][obj['Plist']] = allJsonPaths[jsonPath][obj['Plist']] || [];
//                 var str = '控件名字:' + name + '|| 所用图片名字:' + obj['Path'];
//                 allJsonPaths[jsonPath][obj['Plist']].push(str);
//             }
//             readJson(obj, jsonPath);
//         }
//     })
// }
//
//
// function readJsonFile(jsonPath, callBack) {
//     fs.readFile(jsonPath, 'utf-8', function (err, result) {
//         result = JSON.parse(result);
//         readJson(result, jsonPath);
//         callBack();
//     });
// }
//
// function findNotUseRes(plistPath, jsonPath) {
//     if (!plistPath || !jsonPath) {
//         // 这两句代码待测试
//         console.log('请输入正确的路径');
//         plistPath = './newRes';
//         jsonPath = './newRes';
//         //plistPath = './res/ui';
//         //jsonPath = './res/ui';
//         //return;
//     }
//     var allPlistPaths = getTextureConfigs(plistPath, null, '.plist');
//     var jsonPaths = getTextureConfigs(jsonPath, null, '.json');
//     console.log(JSON.stringify(allPlistPaths, null, 4));
//     async.series({
//         readJsons: function (cb) {
//             async.eachSeries(jsonPaths, function (path, callBack) {
//                 readJsonFile(path, callBack);
//             }, function () {
//                 cb();
//             });
//         },
//         /**
//          * 排除
//          */
//         excludes: function (cb) {
//             var notHaves = {};
//
//             //"NEWUI0.plist": [
//             //    "Panel_middle"
//             //],
//             //    "commonImage0.plist": [
//             //    "Image_28"
//             //],
//
//             _.forEach(allJsonPaths, function (value, key) {
//                 _.forEach(value, function (value1, key1) {
//                     //value1 数组【】空间名字数组  key1 plist名字
//                     var isFind = _.find(allPlistPaths, function (value2) {
//                         return value2.toUpperCase().indexOf(key1.toUpperCase()) != -1;
//                     });
//                     if (!isFind) {
//                         notHaves[key] = notHaves[key] || {};//文件名称
//                         notHaves[key][key1] = value1;
//                     }
//                 })
//             });
//
//             var str1 = "/**\n\n" + JSON.stringify(allPlistPaths, null, 4) + '**/\n\n';
//             var str = '//该文件是查找json中使用的图片是否输入某些plist\n\n\nplist 如下:\n\n' + str1 + JSON.stringify(notHaves, null, 4);
//
//             fs.writeFile('./toolsOut/未修改的文件.json', str, function (err) {
//                 if (err) {
//                     console.log("fail " + err);
//                 } else {
//                     console.log("写入文件ok");
//                 }
//                 cb();
//             });
//
//         }
//     });
// }
// var readPlistPath = '';
// var readCsdPath = '';
// if (process.argv[2]) {
//     readPlistPath = process.argv[2];
// }
//
// if (process.argv[3]) {
//     readCsdPath = process.argv[3];
// }
//
// findNotUseRes(readPlistPath, readCsdPath);
//
