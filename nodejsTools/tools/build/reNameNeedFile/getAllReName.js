/**
 * Created by huangducai on 16/2/15.
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

var filesList = geFileList(scanPath);

var filterList = [
    'js/view/mediator/',
    'js/model/proxy/',
    'js/controller/',
    'js/model/',
    'js/lib/',
    'js/common/',
    'js/constant/',
    'js/fsm/',
    'js/app.js',
    'DS_Store',
    'js/AppFacade.js'
];
//过滤
filesList = _.filter(filesList, function (obj) {
    var flag = true;
    _.forEach(filterList, function (item) {
        if (obj.path.indexOf(item) != -1) {
            flag = false;
        }
    });
    return flag;
});

var allFile = {};
var notChangeFile = [];
var changeNameObj = {};
var kk = 0;
function readAllFiles() {
    async.eachSeries(filesList, function (path, callBack) {
        if (path.path.indexOf('FormatWidget.js') != -1) {
            callBack();
            return;
        }
        //console.log('path == ' + JSON.stringify(path, null, 4));
        fs.readFile(path.path, 'utf-8', function (err, fileStr) {
            //if (fileStr.indexOf("puremvc") == -1 && ((fileStr.indexOf("BaseLayer.js") != -1) || (fileStr.indexOf("BaseLayout.js") != -1))) {
            //    kk++;
            //}
            // todo 找出继承自哪个文件

            if (fileStr.indexOf(".extend({") != -1) {
                var parent = fileStr.split(".extend({")[0];
                parent = parent.substring(parent.length - 30, parent.length);
                parent = parent.split(/[' ', '=']/);
                parent = parent[parent.length - 1];
                allFile[path.path] = {};
                allFile[path.path]['parent'] = parent;
                allFile[path.path]['fun'] = {};
            }


            var index1 = fileStr.indexOf('getWidgetAlias');
            if (index1 != -1) {
                var getAliasStr = fileStr.split('getWidgetAlias')[1];
                var list = [];
                var funStr = '';

                for (var i = 0; i < getAliasStr.length; i++) {
                    if (getAliasStr[i] == '{') {
                        list.push('{');
                    }
                    if (list.length) {
                        funStr = funStr + getAliasStr[i];
                    }
                    if (getAliasStr[i] == '}') {
                        list.pop();
                        if (list.length == 0) {
                            funStr = funStr.substr(0, funStr.length - 1);//排除最后一个
                            break;
                        }
                    }
                }

                //  funStr
                var index = funStr.indexOf('return');
                if (index != -1) {
                    try {
                        var str2 = funStr.split('return')[1];//返回的json 标准的json
                        var jsonObj = eval(" function nmb(){return " + str2 + '} nmb()');
                        jsonObj['parent'] = parent;
                        jsonObj['filePath'] = path.path;
                        if (jsonObj['uiFile']) {
                            var name1 = jsonObj['uiFile'];
                            if (name1.indexOf('/') != -1) {
                                name1 = name1.split(/[.,/]/g);
                                name1 = name1[name1.length - 2] || jsonObj['uiFile'];
                            }
                            changeNameObj[name1] = changeNameObj[name1] || [];
                            changeNameObj[name1].push(jsonObj);

                            allFile[path.path]['fun'][name1] = allFile[path.path]['fun'][name1] || [];
                            allFile[path.path]['fun'][name1].push(jsonObj);
                        } else {
                            //todo 重新拆字符串 loadUI
                            if (fileStr.indexOf('loadUI') != -1) {
                                var str3 = fileStr.split('loadUI')[1].substring(0, 100);
                                str3 = str3.split(/['(',')', ',']/g)[1];
                                //console.log('str3 == ' + str3);
                                str3 = str3.split('.')[1];
                                str3 = res[str3];
                                str3 = str3.split(/[/]/g);
                                str3 = str3[str3.length - 1];

                                changeNameObj[str3] = changeNameObj[str3] || [];
                                changeNameObj[str3].push(jsonObj);

                                allFile[path.path]['fun'][str3] = allFile[path.path]['fun'][str3] || [];
                                allFile[path.path]['fun'][str3].push(jsonObj);

                            } else {

                            }
                        }
                    } catch (e) {
                        if (fileStr.indexOf('无用函数') == -1) {
                            console.log('fileStr = ' + fileStr);
                            console.log('funcstr = ' + funStr);
                            console.log('错误原因：' + e);
                            changeNameObj['函数格式错误'] = changeNameObj['函数格式错误'] || [];
                            changeNameObj['函数格式错误'].push(path);
                        }
                    }
                } else {
                    changeNameObj['没有return'] = changeNameObj['没有return'] || [];
                    changeNameObj['没有return'].push(path)
                }

            } else {
                notChangeFile.push(path.path);
            }
            callBack();
        });

    }, function () {
        var chongfu = {};

        _.forEach(changeNameObj, function (obj, key) {
            if (obj.length > 1) {
                chongfu[key] = obj;
            }
        });


        function writeFile(fileName, data) {
            fs.writeFile(fileName, data, 'utf-8', complete);
            function complete() {
                console.log("文件生成成功 \n path = " + fileName);
            }
        }

        var obj = {};
        var count = 0;
        _.forEach(changeNameObj, function (value, key) {
            var data = {};
            _.forEach(value, function (value2, key2) {
                _.forEach(value2.alias, function (value1, key1) {
                    data[key1] = value1;//覆盖改名 组合起来的
                });
            });
            obj[key] = data;
            count++;
        });

        console.log('修改文件个数：\n' + count);

        var lastData = {};//
        _.forEach(chongfu, function (list, key) {
            var allKey = {};
            _.forEach(list, function (value, index) {
                _.forEach(value.alias, function (value1, key) {
                    allKey[key] = key;
                })
            });

            //{
            //    "uiFile": "res/ui/UISettingMessage.json",
            //    "alias": {
            //    "_panle": "_layoutPanle"
            //},
            //    "parent": "BaseLayer",
            //    "filePath": "js/view/component/system/UIOptionsLayer.js"
            //},
            //{
            //    "uiFile": "res/ui/UISettingMessage.json",
            //    "alias": {
            //    "_panle": "_layoutPanle"
            //},
            //    "parent": "BaseLayer",
            //    "filePath": "js/view/component/system/UISettingMessageLayer.js"
            //}


            console.log(JSON.stringify(allKey, null, 4));
            //找到一组中的所有的名字
            _.forEach(allKey, function (guanjianzi) {
                var data = null;
                for (var i = 0; i < list.length; i++) {
                    for (var j = 0; j < list.length; j++) {
                        data = list[j];
                        var flag = (data["alias"][guanjianzi] == list[i]["alias"][guanjianzi] ? true : false);
                        if (!flag) {
                            var data1 = list[i]["alias"][guanjianzi] ? '不相等' : '不存在';
                            lastData[key] = lastData[key] || {};
                            lastData[key]['其他信息'] = {};
                            lastData[key][guanjianzi] = lastData[key][guanjianzi] || [];
                            lastData[key][guanjianzi].push(list[i].filePath + '和' + data.filePath + data1);
                        }
                    }

                    //不相等的值
                }
            })
        });


        //重复的文件
        var str2 = '\n//该文件是同一个json在多出改名的列表\n\n' + JSON.stringify(lastData, null, 4);
        writeFile("./toolsOut/同一个json多处改名.json", str2);
        //没有改名的文件
        var str1 = '\n//没有getWidgetAlias函数的文件，该文件是排除了一大堆东西的\n\n' + JSON.stringify(notChangeFile, null, 4);
        writeFile("./toolsOut/没有getWidgetAlias的文件.json", str1);
        //改名的结果
        var str = '\n//所有文件的返回，需要改名的地方\n\n' + JSON.stringify(changeNameObj, null, 4);
        writeFile("./toolsOut/getWidgetAlias函数返回.json", str);
        //格式修改
        //
        var str3 = '\n//该文件是后面给csd改名需要的文件，后面改名是依赖于此文件的\n\n';
        writeFile("./toolsOut/rename.json", JSON.stringify(obj, null, 4));

        //函数
        //var str4 = '\n//该文件所有文件的输出结果，用于其他东西验证的 代码中改名没有修改的部分验证用的\n\n' + ;
        writeFile("./toolsOut/所有的文件.json", JSON.stringify(allFile, null, 4));
    })
}
readAllFiles();

