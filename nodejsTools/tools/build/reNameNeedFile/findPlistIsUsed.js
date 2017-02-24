console.log('-------- findPlistIsUsed.js ------ 不应该被执行');

// /**
//  * Created by huangducai on 16/3/4. 检查csd中那些文件没有被修改到
//  */
// var fs = require('fs');
// var Path = require('path');
// var _ = require('underscore');
// var Plist = require('plist');
// var async = require('async');
// var notHave = {};
// /**
//  * 此文件功能不完整 请不要使用
//  * @param rootPath
//  * @param subPath
//  * @param extname
//  * @returns {Array}
//  */
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
// //plist 对象
// var plistObj = {};
// function readPlistFile(PlistPath, callBack) {
//     var fileName1 = PlistPath;
//     fileName1 = fileName1.split(/[/,\\]/);
//     fileName1 = fileName1[fileName1.length - 1];//文件名
//     plistObj['resFile'] = plistObj['resFile'] || {};
//     fs.readFile(PlistPath, 'utf-8', function (err, result) {
//         if (err) {
//             console.log("error");
//         } else {
//             var data = Plist.parse(result);
//             var allFile = data['frames'];
//             for (var k in  allFile) {
//                 plistObj[fileName1] = plistObj[fileName1] || {};
//                 var key = k;
//                 k = k.split(/[/,\\]/);
//                 k = k[k.length - 1].split('.')[0];// 图片名字
//                 k = k.toUpperCase();
//                 plistObj[fileName1][k] = key;
//                 plistObj['resFile'][key] = key;//带点的
//                 plistObj['resFile'][k] = key;//不带点的
//             }
//         }
//         callBack();
//     });
// }
//
// function readXMLAndParseToAnother(xmlPath, cb) {
//     var fileName = xmlPath.split(/[/,\\]/g);
//     fileName = fileName[fileName.length - 1];
//     notHave[fileName] = notHave[fileName] || {};
//     fs.readFile(xmlPath, 'utf-8', function (err, data) {
//         if (err) {
//             console.log("error");
//         } else {
//             var parseString = require('xml2js').parseString;
//             parseString(data, {explicitArray: false}, function (err, json) {
//                 var bianliFun = function (json, name) {
//                     name = name || '';
//                     if (json['FileData'] || json["$"]) {
//                         name = name + (json['$'] ? (json['$']['Name'] ? json['$']['Name'] : '') : '');
//                     }
//
//                     for (var k in json) {
//                         var value = json[k];
//                         if (_.isObject(value)) {
//                             //<FileData Type="PlistSubImage" Path="bg_19.png" Plist="UIImages0.plist"/>
//                             if (value['Plist']) {
//                                 var path = value['Path'].split(/[/,\\]/);
//                                 path = path[path.length - 1];
//                                 if (!plistObj['resFile'][path]) {
//                                     //那么这个文件是我们不需要的 输出 文件名
//                                     notHave[fileName]['新资源没得的'] = notHave[fileName]['新资源没得的'] || {};
//                                     notHave[fileName]['新资源没得的'][value['Path']] = value['Plist'];
//                                     if (!notHave[fileName][value['Path']]) {
//                                         notHave[fileName][value['Path']] = name;
//                                     } else {
//                                         notHave[fileName][value['Path'] + '_count'] = notHave[fileName][value['Path'] + '_count'] || 0;
//
//                                         notHave[fileName][value['Path'] + '_count']++;
//                                         var num = notHave[fileName][value['Path'] + '_count'];
//                                         notHave[fileName][value['Path'] + '_' + num] = name;
//                                     }
//                                     //console.log(JSON.stringify(value, null, 4));
//                                 }
//                             }
//                             bianliFun(value, name);
//                         }
//                     }
//                 };
//                 bianliFun(json, '');
//             });
//             cb();
//         }
//     });
// }
//
// function findNotUseRes(plistPath, csdPath) {
//     if (!plistPath || !csdPath) {
//         // 这两句代码待测试
//         console.log('请输入正确的路径');
//         plistPath = '../share/ui/cocosstudio';
//         csdPath = '../share/ui/cocosstudio';
//         //return;
//     }
//
//     var allPlistPaths = getTextureConfigs(plistPath, null, '.plist');
//     //var allCsdPaths = getTextureConfigs('../share/ui/cocosstudio', null, '.csd');
//     var allCsdPaths = getTextureConfigs(csdPath, null, '.csd');
//     console.log(JSON.stringify(allPlistPaths, null, 4));
//     async.series({
//         getPlistObj: function (cb) {
//             async.eachSeries(allPlistPaths, function (path, callBack) {
//                 readPlistFile(path, callBack);
//             }, function () {
//                 //console.log(JSON.stringify(plistObj, null, 4));
//                 cb();
//             });
//         },
//
//         readAllCsd: function (cb) {
//             async.eachSeries(allCsdPaths, function (path, callBack) {
//                 readXMLAndParseToAnother(path, callBack);
//             }, function () {
//                 fs.writeFile('./toolsOut/不完整.json', JSON.stringify(notHave, null, 4), function (err) {
//                     if (err) {
//                         console.log("fail " + err);
//                     } else {
//                         console.log("写入文件ok");
//                     }
//                     cb();
//                 });
//             });
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
//
// findNotUseRes(readPlistPath, readCsdPath);
//
