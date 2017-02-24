/**
 * Created by huangducai on 16/10/9.
 */
//对生成的json文件 根据 resources.js 进行修改

var _ = require('underscore');
var fs = require('fs');
var util = require('util');
var xml2js = require('xml2js');
var Plist = require('plist');
var async = require('async');
var Path = require('path');
var sep = Path.sep;

var notHaveObj = {};
var res1 = require('../../js/constant/resources.js');
var res = res1.hashFile;
//所有的res文件


function createDirByPath(path) {
    path = path.split('/');
    var genPath = '';
    _.forEach(path, function (dirName) {
        genPath += dirName;
        if (!fs.existsSync(genPath)) {
            fs.mkdirSync(genPath);
        }
        genPath += '/';
    });
}

function writeFile(path, fileName, content, cb) {
    createDirByPath(path);
    var allPath = path + fileName;
    fs.writeFile(allPath, content, function (err) {
        if (err) {
            console.log("fail " + err);
        } else {
            //console.log("写入文件ok");
        }
        cb && cb();
    });
}

//遍历文件夹，获取所有文件夹里面的文件信息
function geFileList(path, filiter) {
    var filesList = [];
    readFile(path, filesList, filiter);
    return filesList;
}
//遍历读取文件
function readFile(path, filesList, filiter) {
    files = fs.readdirSync(path);//需要用到同步读取
    files.forEach(walk);
    function walk(file) {
        states = fs.statSync(path + '/' + file);
        if (states.isDirectory()) {
            readFile(path + '/' + file, filesList, filiter);
        }
        else {
            //创建一个对象保存信息
            if (filiter) {
                if (file.indexOf(filiter) != -1) {
                    var obj = new Object();
                    obj.size = states.size;//文件大小，以字节为单位
                    obj.name = file;//文件名
                    obj.path = path + '/' + file; //文件绝对路径
                    obj.pathOnly = path; //文件绝对路径
                    filesList.push(obj);
                }
            } else {
                var obj = new Object();
                obj.size = states.size;//文件大小，以字节为单位
                obj.name = file;//文件名
                obj.path = path + '/' + file; //文件绝对路径
                obj.pathOnly = path; //文件绝对路径
                filesList.push(obj);
            }
        }
    }
}
//json 中 全部是全路径

function resetJson(json, lsit, jsonPath) {
    // jsonPath =
    for (var k in json) {
        var obj = json[k];
        if (obj && _.isObject(obj)) {
            var filePath = obj['Path'];
            if (filePath) {
                var fileName = filePath.split('/');
                fileName = fileName[fileName.length - 1];
                var onlyName = fileName.split('.')[0];
                var otherName = fileName.replace(/[.]/g, '_');//跟生成的时候 规则一样
                otherName = otherName.toUpperCase();
                var resourcesObj = res[otherName] || res[onlyName.toUpperCase()];

                if (resourcesObj) {
                    //存在的文件 或者
                    if (_.isObject(resourcesObj)) {
                        //肯定是图片
                        // "plist": "res/ccsRes/hetu/hetu_12.plist",
                        // "path": "common_bar06.png"

                        obj['Path'] = resourcesObj.path;
                        obj['Type'] = 'PlistSubImage';
                        obj['Plist'] = resourcesObj.plist.substring(11);
                        var zuizhonglujing = obj['Plist'];
                        //todo  android  或者 ios  存入图片 和 plist
                        lsit.push(zuizhonglujing);

                        if (argvFlag == 0) {
                            lsit.push(zuizhonglujing.replace('.plist', '.pvr.ccz'));
                        } else if (argvFlag == 1) {
                            lsit.push(zuizhonglujing.replace('.plist', '.pkm'));
                        } else {
                            lsit.push(zuizhonglujing.replace('.plist', '.png'));
                        }

                    } else {
                        //单文件  png jpg json
                        obj['Path'] = resourcesObj.substring(11);//t除前面的 res/
                        obj['Type'] = 'Normal';
                        obj['Plist'] = '';
                        lsit.push(obj['Path']);
                    }
                } else {
                    notHaveObj[fileName] = jsonPath;
                    //不存在的
                }
            }





            resetJson(json[k], lsit, jsonPath);
        }
    }
}


function readJsonAndReset(jsonObj) {
    var json = JSON.parse(fs.readFileSync(jsonObj.path));

    var lsit = [];
    resetJson(json, lsit, jsonObj.path);
    //此路径要算相对路径
    if (json['Content'] && json['Content']['Content']) {
        json['Content']['Content']['UsedResources'] = _.uniq(lsit);
    }
    return json;
}

//todo---------------------------------------- 检查工具 begin  =======可以直接屏蔽的部分
// var allFile = {};
// var sktonFileList = geFileList('../svn/cocosStudio/skeleton/cocosstudio');
// var uiFileList = geFileList('../svn/cocosStudio/ui/cocosstudio');
// _.forEach(sktonFileList.concat(uiFileList), function (itemObj) {
//     allFile[itemObj.name] = allFile[itemObj.name] || [];
//     allFile[itemObj.name].push(itemObj);
// });
// var file1 = {};
// _.forEach(allFile, function (item) {
//     if (item.length > 1) {
//         file1[item[0].name] = item;
//     }
// });
// writeFile('./toolsOut/', '重名文件.json', JSON.stringify(file1, null, 4));

//todo---------------------------------------- 检查工具 end =======可以直接屏蔽的部分
function test() {
    async.eachSeries(allJosn, function (jsonObj, callBack) {
        var json = readJsonAndReset(jsonObj, callBack);
        console.log('-------- 准备写入文件: -------' + jsonObj.pathOnly + '/' + jsonObj.name);
        writeFile(jsonObj.pathOnly + '/', jsonObj.name, JSON.stringify(json, null, 4), callBack)
    }, function () {
        console.log('-------- 写入文件完成 -------');
        writeFile('./toolsOut/', 'notHaveObj.json', JSON.stringify(notHaveObj, null, 4))
    })
}

var argvFlag = process.argv[2];
// argvFlag = 2;// todo test
if (!(argvFlag == 0 || argvFlag == 1 || argvFlag == 2)) {
    throw new Error('请指定平台 0 -- ios,1 android,2 默认的png图片');
    return;
}

var client_resource = "res/ccsRes";

var allJosn = geFileList(client_resource, '.json');//res下得所有json文件
test();





