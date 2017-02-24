
console.log('-------- findNameNotChanged.js ------ 不应该被执行');

// /**
//  * Created by huangducai on 16/2/15.
//  */
// var fs = require('fs');
// var _ = require('underscore');
// var files;
// var scanPath = 'js'//注意斜杠
// var async = require('async');
// var res = require('../../js/constant/resources.js');
// res = res.hashFile;
//
// var renameJsonPath = './toolsOut/rename.json';
//
// //遍历文件夹，获取所有文件夹里面的文件信息
// function geFileList(path) {
//     var filesList = [];
//     readFile(path, filesList);
//     return filesList;
// }
// //遍历读取文件
// function readFile(path, filesList) {
//     files = fs.readdirSync(path);//需要用到同步读取
//     files.forEach(walk);
//     function walk(file) {
//         states = fs.statSync(path + '/' + file);
//         if (states.isDirectory()) {
//             readFile(path + '/' + file, filesList);
//         }
//         else {
//             //创建一个对象保存信息
//             var obj = new Object();
//             obj.size = states.size;//文件大小，以字节为单位
//             obj.name = file;//文件名
//             obj.path = path + '/' + file; //文件绝对路径
//             filesList.push(obj);
//         }
//     }
// }
//
// var filesList = geFileList(scanPath);
//
// var filterList = [
//     '/view/widget/',
//     'js/view/mediator/',
//     'js/model/proxy/',
//     'js/controller/',
//     'js/model/',
//     'js/lib/',
//     'js/common/',
//     'js/constant/',
//     'js/fsm/',
//     'js/app.js',
//     'DS_Store',
//     'js/AppFacade.js'
// ];
// //过滤
// filesList = _.filter(filesList, function (obj) {
//     var flag = true;
//     _.forEach(filterList, function (item) {
//         if (obj.path.indexOf(item) != -1) {
//             flag = false;
//         }
//     });
//     return flag;
// });
//
//
// var notChangeFile = [];
// var changeNameObj = {};
// var renameJson = {};
//
// var notAllChange = {};
//
// function readAllFiles() {
//     async.series({
//         readFile: function (cb) {
//             fs.readFile(renameJsonPath, 'utf-8', function (err, fileStr) {
//                 renameJson = JSON.parse(fileStr);
//                 cb();
//             });
//         },
//
//         readAllCsd: function (cb) {
//             async.eachSeries(filesList, function (path, callBack) {
//                 fs.readFile(path.path, 'utf-8', function (err, fileStr) {
//                     //取名字
//                     var fileName = '';
//                     var index1 = fileStr.indexOf('getWidgetAlias');
//                     if (index1 != -1) {
//                         var getAliasStr = fileStr.split('getWidgetAlias')[1];
//                         var list = [];
//                         var funStr = '';
//                         for (var i = 0; i < getAliasStr.length; i++) {
//                             if (getAliasStr[i] == '{') {
//                                 list.push('{');
//                             }
//                             if (list.length) {
//                                 funStr = funStr + getAliasStr[i];
//                             }
//                             if (getAliasStr[i] == '}') {
//                                 list.pop();
//                                 if (list.length == 0) {
//                                     funStr = funStr.substr(0, funStr.length - 1);//排除最后一个
//                                     break;
//                                 }
//                             }
//                         }
//
//                         //  funStr
//                         var index = funStr.indexOf('return');
//                         if (index != -1) {
//                             try {
//                                 var str2 = funStr.split('return')[1];//返回的json 标准的json
//                                 var jsonObj = eval(" function nmb(){return " + str2 + '} nmb()');
//                                 jsonObj['filePath'] = path.path;
//                                 if (jsonObj['uiFile']) {
//                                     var name1 = jsonObj['uiFile'];
//                                     if (name1.indexOf('/') != -1) {
//                                         name1 = name1.split(/[.,/]/g);
//                                         name1 = name1[name1.length - 2] || jsonObj['uiFile'];
//                                     }
//                                     fileName = name1;
//                                     changeNameObj[name1] = changeNameObj[name1] || [];
//                                     changeNameObj[name1].push(jsonObj);
//                                 } else {
//                                     //todo 重新拆字符串 loadUI
//                                     if (fileStr.indexOf('loadUI') != -1) {
//                                         var str3 = fileStr.split('loadUI')[1].substring(0, 100);
//                                         str3 = str3.split(/['(',')', ',']/g)[1];
//                                         //console.log('str3 == ' + str3);
//                                         str3 = str3.split('.')[1];
//                                         str3 = res[str3];
//                                         str3 = str3.split(/[/]/g);
//                                         str3 = str3[str3.length - 1];
//                                         fileName = str3;
//                                         changeNameObj[str3] = changeNameObj[str3] || [];
//                                         changeNameObj[str3].push(jsonObj);
//                                     }
//                                 }
//                             } catch (e) {
//
//                             }
//                         }
//                     }
//
//                     if (!fileName.length) {
//
//                     } else {
//                         // todo 读取文件内容
//                         _.forEach(renameJson[fileName], function (newValue, oldValue) {
//                             if (fileStr.indexOf("." + oldValue + '.') != -1) {
//                                 //if (fileStr.indexOf(oldValue) != -1) {
//
//                                 notAllChange[path.path] = notAllChange[path.path] || [];
//                                 notAllChange[path.path].push({"没改完的:": oldValue, "新名字：": newValue});
//                             }
//                         });
//                     }
//                     callBack();
//                 });
//
//             }, function () {
//                 function writeFile(fileName, data) {
//                     fs.writeFile(fileName, data, 'utf-8', complete);
//                     function complete() {
//                         console.log("文件生成成功 \n path = " + fileName);
//                     }
//                 }
//
//                 //重复的文件
//                 var str = '\n// 该文件是代码中还没有修改完整的名字\n\n\n' + JSON.stringify(notAllChange, null, 4);
//                 writeFile("./toolsOut/没有修改完整的文件.json", str);
//                 cb();
//             })
//         }
//     });
//
//
// }
// readAllFiles();
//
