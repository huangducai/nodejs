console.log('------- findAllNameInCsd.js -------不应该被执行');
// /**
//  * Created by huangducai on 16/3/4. 检查csd中那些文件没有被修改到
//  */
// var fs = require('fs');
// var Path = require('path');
// var _ = require('underscore');
// var async = require('async');
//
// var filterList = [
//     '_tableView',
//     '_button',
//     '_layout',
//     '_image',
//     '_checkBox',
//     '_text',
//     '_loadingBar',
//     '_textField',
//     '_listView',
//     '_node',
//     '_sprite',
//     '_slider',
//     '_pageView',
//     '_scrollView',
//     '_particle'
// ];
// var xml2js = require('xml2js');
//
// // 读取csd的路径
// var readCsdPath = './toolsOut/cocosstudio';//./toolsOut/cocosstudio
// var baohanCsds = {};
// var allList = {};
// var renameJson;
// var allCsdsssss = {};
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
// function writeFile(path, fileName, content, cb) {
//     var allPath = path + fileName;
//     if (fs.existsSync(path)) {
//         fs.writeFile(allPath, content, function (err) {
//             if (err) {
//                 console.log("fail " + err);
//             } else {
//                 console.log("allPath =" + allPath);
//             }
//             if (cb) {
//                 cb();
//             }
//         });
//     } else {
//         fs.mkdirSync(path);
//         writeFile(path, fileName, content, cb);
//     }
// }
// var allNameInCsd = {};
// function readXMLAndParseToAnother(xmlPath, cb) {
//     var currFileName = xmlPath.split(/[/,\\]/g);
//     currFileName = currFileName[currFileName.length - 1];
//     currFileName = currFileName.split('.')[0];
//     allNameInCsd[currFileName] = [];
//     fs.readFile(xmlPath, 'utf-8', function (err, data) {
//         if (err) {
//             console.log("error");
//         } else {
//             var parseString = xml2js.parseString;
//             parseString(data, {explicitArray: false}, function (err, json) {
//                 var bianliFun = function (json) {
//                     var nameKey = json['Name'];
//                     if (nameKey && nameKey[0] == '_') {
//                         allNameInCsd[currFileName].push(nameKey);
//                     }
//                     var name1 = json['FileData'] ? json['FileData']['$']['Path'] : '这里有个空节点';
//                     for (var k in json) {
//                         var value = json[k];
//                         if (_.isObject(value)) {
//                             if (value['ctype'] == 'ProjectNodeObjectData') {
//                                 baohanCsds[xmlPath] = baohanCsds[xmlPath] || [];
//                                 if (xmlPath.indexOf('UIClanBuildingList.csd') != -1) {
//                                     baohanCsds[xmlPath].push(name1);
//                                 } else {
//                                     baohanCsds[xmlPath].push(name1);
//                                 }
//                             }
//                             bianliFun(value);
//                         }
//                     }
//                 };
//                 bianliFun(json);
//             });
//         }
//         cb();
//     });
// }
//
// function reNameCsd() {
//     var allCsdPaths = getTextureConfigs(readCsdPath, null, '.csd');
//     async.series({
//         readAllCsd: function (cb) {
//             async.eachSeries(allCsdPaths, function (path, callBack) {
//                 readXMLAndParseToAnother(path, callBack);
//             }, function () {
//                 var obj = {};
//                 _.forEach(allNameInCsd, function (valueList, key) {
//                     obj[key] = _.filter(valueList, function (name) {
//                         var flag = true;
//                         _.forEach(filterList, function (item) {
//                             if (name.indexOf(item) == 0) {
//                                 flag = false;
//                             }
//                         });
//                         return flag;
//                     });
//                 });
//                 var str2 = '/*' + JSON.stringify(filterList, null, 4) + '**/';
//                 var obj1 = {};
//                 obj = _.filter(obj, function (value, key) {
//                     if (value.length) {
//                         obj1[key] = value;
//                     }
//                 });
//
//                 var str = '\n//该文件是所有csd中，以下划线开头，且不符合我们改名规则的\n\n' + str2 + '\n\n' + JSON.stringify(obj1, null, 4);
//                 writeFile('./toolsOut/', '所有不符合规则的名字.json', str, cb);
//             });
//         },
//
//         getCsd: function (cb) {
//             _.forEach(baohanCsds, function (list, index) {
//                 _.forEach(list, function (value) {
//                     allList[value] = value;
//                 })
//             });
//
//             var dataObj = {};
//
//             _.forEach(baohanCsds, function (obj, key) {
//                 _.forEach(obj, function (name, index) {
//                     dataObj[name] = dataObj[name] || [];
//                     dataObj[name].push(key);
//                 })
//             });
//
//             writeFile('./toolsOut/', '被包含文件的路径关系.json', JSON.stringify(dataObj, null, 4), function () {
//                 writeFile('./toolsOut/', 'csd中的包含关系.json', JSON.stringify(baohanCsds, null, 4), cb);
//             });
//
//         },
//
//         readCsd: function (cb) {
//             _.forEach(allList, function (value, key) {
//                 value = value.split('.')[0];
//                 if (allNameInCsd[value] && allNameInCsd[value].length) {
//                     allCsdsssss[value] = allNameInCsd[value];//现在的名字
//                 }
//             });
//             writeFile('./toolsOut/', '所有的csd节点.json', JSON.stringify(allCsdsssss, null, 4), cb);
//         },
//
//         findNowChangedName: function (cb) {
//             fs.readFile('./toolsOut/rename.json', 'utf-8', function (err, fileStr) {
//                 renameJson = JSON.parse(fileStr);
//                 cb();
//             });
//         },
//
//         setJieGuo: function (cb) {
//             var notHave = {};
//             _.forEach(allNameInCsd, function (value, key) {
//                 //如果 已经改名的里面 直接没得这个名字
//                 if (!renameJson[key]) {
//                     notHave[key] = {'从来没有改过名字的：': value};
//                     return;
//                 }
//                 _.forEach(value, function (kongjianming, index) {
//                     var flag = '';
//                     _.forEach(renameJson[key], function (value1, key1) {
//                         if (value1 == kongjianming) {
//                             flag = key1;
//                         }
//                     });
//                     if (!flag.length) {
//                         if (!renameJson[key][kongjianming]) {
//                             notHave[key] = notHave[key] || {};
//                             notHave[key][kongjianming] = kongjianming;
//                         }
//                     }
//                 })
//             });
//
//             writeFile('./toolsOut/', '未修改的csd控件名字.json', JSON.stringify(notHave, null, 4), cb);
//         },
//
//         setJieGuo1: function (cb) {
//             var notHave = {};//
//             _.forEach(allCsdsssss, function (value, key) {
//                 //如果 已经改名的里面 直接没得这个名字
//                 if (!renameJson[key]) {
//                     notHave[key] = {'从来没有改过名字的：': value};
//                     return;
//                 }
//
//                 _.forEach(value, function (kongjianming, index) {
//                     var flag = '';
//                     _.forEach(renameJson[key], function (value1, key1) {
//                         if (value1 == kongjianming) {
//                             flag = key1;
//                         }
//                     });
//                     if (!flag.length) {
//                         if (!renameJson[key][kongjianming]) {
//                             notHave[key] = notHave[key] || {};
//                             notHave[key][kongjianming] = kongjianming;
//                         }
//                     }
//                 })
//             });
//
//             writeFile('./toolsOut/', '未修改的csd节点名字.json', JSON.stringify(notHave, null, 4), cb);
//         }
//
//     });
// }
//
// reNameCsd();
//
