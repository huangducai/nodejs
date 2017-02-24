console.log('----------- reNameCsd.js  不应该被执行了------');
// /**
//  * Created by huangducai on 16/3/4. 检查csd中那些文件没有被修改到
//  */
// var fs = require('fs');
// var Path = require('path');
// var _ = require('underscore');
// var async = require('async');
// var notHave = {};
// var xml2js = require('xml2js');
//
//
// var renameJson;
// var renameJson1;//todo 保存原始数据
// //输出的csd路径
// var writePath = './toolsOut/cocosstudio/';
// // 读取csd的路径
// var readCsdPath = '../share/ui/cocosstudio';
// //var readCsdPath = './newRes';
//
// //读取生成的renameJson的路径
// var renameJsonPath = './toolsOut/rename.json';
// var readfilePath = './toolsOut/所有的文件.json';
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
// function writeFile(path, fileName, content, cb) {
//     var allPath = path + fileName;
//     if (fs.existsSync(path)) {
//         fs.writeFile(allPath, content, function (err) {
//             if (err) {
//                 console.log("fail " + err);
//             } else {
//                 //console.log("写入文件ok");
//             }
//             if (cb) {
//                 cb();
//             }
//         });
//     } else {
//         fs.mkdirSync(path);
//         writeFile(path, fileName, content, cb);
//     }
//
// }
//
// function readXMLAndParseToAnother(xmlPath, cb) {
//     if (xmlPath.indexOf('.csd') == -1) {
//         cb();
//         return;
//     }
//
//     var currFileName = xmlPath.split(/[/,\\]/g);
//     currFileName = currFileName[currFileName.length - 1];
//     currFileName = currFileName.split('.')[0];
//     fs.readFile(xmlPath, 'utf-8', function (err, data) {
//         if (err) {
//             console.log("error");
//         } else {
//             var obj = renameJson1[currFileName];
//             var obj1 = renameJson[currFileName];
//             var parseString = xml2js.parseString;
//             parseString(data, {explicitArray: false}, function (err, json) {
//                 var bianliFun = function (json) {
//                     var nameKey = json['Name'];
//                     if (nameKey) {
//                         if (obj && obj[nameKey]) {
//                             json['Name'] = obj[nameKey];
//                             if (obj[nameKey]) {
//                                 delete  renameJson[currFileName][nameKey];
//
//                                 //console.log('currFileName == %s, nameKey = %s', currFileName, nameKey);
//                                 _.forEach(allFilePath, function (obj, path) {
//                                     if (obj['fun'][currFileName]) {
//                                         //console.log('obj["fun"][currFileName] %s', obj['fun'][currFileName]);
//                                         _.forEach(obj['fun'][currFileName], function (valueData, index) {
//                                             //console.log('obj["fun"][currFileName] %s', JSON.stringify(obj['fun'][currFileName][index], null, 4));
//                                             if (obj['fun'][currFileName][index]['alias'][nameKey]) {
//                                                 delete  obj['fun'][currFileName][index]['alias'][nameKey];
//                                             }
//                                         })
//                                     }
//                                 })
//                             }
//                         }
//                     }
//                     for (var k in json) {
//                         var value = json[k];
//                         if (_.isObject(value)) {
//                             bianliFun(value);
//                         }
//                     }
//                 };
//                 bianliFun(json, '');
//
//                 //////重新转换成xml
//                 var builder = new xml2js.Builder();
//                 var xml = builder.buildObject(json);
//
//                 notHave[currFileName] = obj1;
//                 ////console.log('重新写入到xml');
//                 writeFile(writePath, currFileName + '.csd', xml, cb);
//             });
//         }
//     });
// }
// var allFilePath;
// function reNameCsd() {
//
//     var allCsdPaths = getTextureConfigs(readCsdPath, null, '.csd');
//     allCsdPaths = allCsdPaths.filter(function (path) {
//         return path.indexOf('/CityMap/') === -1;
//     });
//
//     async.series({
//         readFile: function (cb) {
//             fs.readFile(renameJsonPath, 'utf-8', function (err, fileStr) {
//                 renameJson = JSON.parse(fileStr);//
//                 renameJson1 = JSON.parse(fileStr);//此处用clone不行 why？ 克隆的东西 我删除了 原来数据似乎也不存在了
//                 cb();
//             });
//         },
//
//         readFile2: function (cb) {
//             fs.readFile(readfilePath, 'utf-8', function (err, fileStr) {
//                 allFilePath = JSON.parse(fileStr);
//                 cb();
//             });
//         },
//
//         readAllCsd: function (cb) {
//             async.eachSeries(allCsdPaths, function (path, callBack) {
//                 readXMLAndParseToAnother(path, callBack);
//             }, function () {
//                 console.log('完成');
//                 var str = '\n\n// 该文件是代码中函数写了的名字，但是，在csd中没有找到的名字的部分\n\n\n' + JSON.stringify(renameJson, null, 4);
//                 writeFile('./toolsOut/', '改了名字但csd中没找到的部分.json', str);
//                 //allFilePath
//
//                 var obj = {};
//                 _.forEach(allFilePath, function (obj1, path) {
//                     //if(obj["fun"]){
//                     //
//                     //}
//                     obj[path] = obj[path] || [];
//
//                     var count1 = 0;
//                     _.forEach(obj1['fun'], function () {
//                         count1++;
//                     });
//                     if (count1 > 0) {
//                         _.forEach(obj1['fun'], function (value, key) {
//                             _.forEach(value, function (data, index) {
//                                 if (data['alias']) {
//                                     var count = 0;
//                                     _.forEach(data['alias'], function () {
//                                         count++;
//                                     });
//                                     if (count > 0) {
//                                         obj[path].push(obj1);
//                                     }
//                                 }
//                             })
//                         })
//                     } else {
//                         obj[path].push(obj1);
//                     }
//                 });
//
//                 _.forEach(obj, function (value, key) {
//                     if (value.length == 0 || key.indexOf('UICityGain') != -1) {
//                         delete obj[key];
//                     }
//                 });
//
//                 _.forEach(obj, function (value1, key1) {
//                     _.forEach(value1, function (value, index) {
//                         var k = 0;
//                         _.forEach(value['fun'], function () {
//                             k++;
//                         });
//                         if (k == 0) {
//                             obj[key1][index]['fun'] = {'该文件没得getWidgetAlias函数': ''}
//                         }
//                     })
//                 });
//                 var str2 = '\n //该文件是代码中写了改名函数的，但是文件中还有没有改完的名字的部分\n\n' + JSON.stringify(obj, null, 4);
//                 writeFile('./toolsOut/', '删除已经改名的结果.json', str2, cb);
//             });
//         }
//     });
// }
//
// reNameCsd();
//
