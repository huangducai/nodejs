/**
 * Created by huangducai on 16/2/15.
 * 该文件是查找 js 代码中用到的 res.XXXX的文件 但是在我们resources.js找不到的文件
 */
var fs = require('fs');
var _ = require('underscore');
var files;
var scanPath = 'js'//注意斜杠
var async = require('async');
var res = require('../../../js/constant/resources.js');
res = res.hashFile;
//遍历文件夹，获取所有文件夹里面的文件信息
function geFileList(path) {
    var filesList = [];
    readFile(path, filesList);
    return filesList;
}
//遍历读取文件
function readFile(path, filesList) {
    files = fs.readdirSync(path);//需要用到同步读取
    files.forEach(walk);
    function walk(file) {
        states = fs.statSync(path + '/' + file);
        if (states.isDirectory()) {
            readFile(path + '/' + file, filesList);
        }
        else {
            //创建一个对象保存信息
            var obj = new Object();
            obj.size = states.size;//文件大小，以字节为单位
            obj.name = file;//文件名
            obj.path = path + '/' + file; //文件绝对路径
            filesList.push(obj);
        }
    }
}

var regObj = {};
var paichuRegObj = {};

var filesList = geFileList(scanPath);

//var filterList = [];
////过滤
//filesList = _.filter(filesList, function (obj) {
//    var flag = true;
//    _.forEach(filterList, function (item) {
//        if (obj.path.indexOf(item) != -1) {
//            flag = false;
//        }
//    });
//    return flag;
//});

function readAllFiles() {
    async.eachSeries(filesList, function (path, callBack) {
        fs.readFile(path.path, 'utf-8', function (err, fileStr) {
            var rep1 = new RegExp(/(res\.).*/g);//res.的文件
            var rep2 = new RegExp(/(res\.).*_JSONasdfasdf.*/g);
            var rep3 = new RegExp(/(res\.).*_PLISTasdfasdfasd.*/g);

            regObj[path.path] = fileStr.match(rep1);
            paichuRegObj[path.path] = fileStr.match(rep2) || [];
            var list123 = fileStr.match(rep3);
            if (list123) {
                paichuRegObj[path.path] = paichuRegObj[path.path].concat(list123);
            }
            callBack();
        });

    }, function () {
        var lastObj = {};
        _.forEach(regObj, function (value, filePath) {
            _.forEach(value, function (value2, index2) {
                var flag = false;
                _.forEach(paichuRegObj[filePath], function (value1, index1) {
                    if (value1.indexOf(value2) != -1) {
                        flag = true;
                    }
                });
                if (!flag) {
                    lastObj[filePath] = lastObj[filePath] || {};
                    var resData = '';
                    try {
                        resData = value2.split(/[';','||',')',',','(']/g)[0];
                        resData = eval(resData);
                    } catch (e) {

                    }
                    if (!resData) {
                        lastObj[filePath][value2] = value2;
                    }
                }
            })
        });
        var obj2 = {};
        _.forEach(lastObj, function (value, key) {
            _.forEach(value, function (value1, key1) {
                obj2[key1] = obj2[key1] || [];
                obj2[key1].push(key);
            })
        });


        function writeFile(fileName, data) {
            fs.writeFile(fileName, data, 'utf-8', complete);
            function complete() {
                console.log("文件生成成功 \n path = " + fileName);
            }
        }

        var str1 = '\n//该文件是所有的包含 res.xxx 的文件\n\n' + JSON.stringify(regObj, null, 4);
        var str2 = '\n\n //该文件是包含了所有的排除 即 所有的res.*_json* res.*_plist*\n' + JSON.stringify(paichuRegObj, null, 4);
        var str3 = '\n //该文件包括了所有的 需要在js文件中替换的图片资源名称和路径\n\n' + JSON.stringify(lastObj, null, 4);
        var str4 = "\n\n //该文件是 结果文件.json的另外一种表现形式\n\n" + JSON.stringify(obj2, null, 4);
        //writeFile("./toolsOut/所有的匹配.json", str1);
        //writeFile("./toolsOut/需要排除的匹配.json", str2);
        //writeFile("./toolsOut/结果文件.json", str3);
        writeFile("./toolsOut/结果文件1.json", str4);
    })
}
readAllFiles();

