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

var all9Image = {};
var res = require('../../js/constant/resources.js');
res = res.hashFile;
//所有的res文件

var count = 0 ;

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

function resetJson(json, jsonPath) {
    for (var k in json) {
        var obj = json[k];
        if (obj && _.isObject(obj)) {
            var filePath = obj['Scale9Enable'];


            if(filePath){
                count ++;
                console.log('count === ' + count);
                //
                // "DisabledFileData": {
                //     "Type": "Normal",
                //         "Path": "UI/Button/add_btn2_0.png",
                //         "Plist": ""
                // },
                // "PressedFileData": {
                //     "Type": "Normal",
                //         "Path": "UI/Button/add_btn2_0.png",
                //         "Plist": ""
                // },
                // "NormalFileData": {
                //     "Type": "Normal",
                //         "Path": "UI/Button/add_btn2_0.png",
                //         "Plist": ""
                // },

                
                var data1 = obj['NormalFileData'] ||
                    obj['FileData'] ||
                    obj['DisabledFileData']||
                    obj['PressedFileData'] ;

                if(data1){
                    var pngFileName = data1.Path;
                    pngFileName = pngFileName.split('/');
                    pngFileName = pngFileName[pngFileName.length - 1];
                    all9Image[pngFileName] = all9Image[pngFileName] || {};
                   // all9Image[pngFileName][jsonPath] = jsonPath;

                    all9Image[pngFileName][jsonPath] = all9Image[pngFileName][jsonPath] || [];

                    var currNum = 'WIDTH: ' + obj['Size'].X + ' ,HEIGHT: ' + obj['Size'].Y;
                    // if(!_.findWhere(all9Image[pngFileName][jsonPath], currNum)){
                        all9Image[pngFileName][jsonPath].push(currNum);
                    all9Image[pngFileName][jsonPath] = _.uniq(all9Image[pngFileName][jsonPath] );
                    // }
                }
            }

            resetJson(json[k], jsonPath);
        }
    }
}


function readJsonAndReset(jsonObj) {
    var json = JSON.parse(fs.readFileSync(jsonObj.path));

    // var lsit = [];
    resetJson(json, jsonObj.path);
    //
    // // console.log('------ list == ' + JSON.stringify(lsit));
    //
    // //此路径要算相对路径
    // if (json['Content'] && json['Content']['Content']) {
    //     json['Content']['Content']['UsedResources'] = _.uniq(lsit);
    // }
    // return json;
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


var readJsonPath = 'res';//此处不要给./


function test() {
    async.eachSeries(allJosn, function (jsonObj, callBack) {
        // console.log('-------- 读取文件: -------' + jsonObj.pathOnly + '/' + jsonObj.name);
        readJsonAndReset(jsonObj, callBack);
        callBack();
    }, function () {
        console.log('-------- 写入文件完成 -------');
        writeFile('./toolsOut/', 'all9Image.json', JSON.stringify(all9Image, null, 4))
    })
}



var allJosn = geFileList('./res', '.json');//res下得所有json文件

test();





