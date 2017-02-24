var _ = require('underscore');
var fs = require('fs');
var util = require('util');
var xml2js = require('xml2js');
var Plist = require('plist');
var async = require('async');
var path = require('path');
var Path = require('path');
var sep = path.sep;
var ToolsHelper = require('../ToolsHelper.js');
var notXiugaiPlist = {};
var notXiugai = {};

function readXMLAndParseToAnother(xmlObj, writePath, cb) {
    var xmlPath = xmlObj.path;
    var fileName = xmlObj.name;
    // console.log('xmlPath = ' + xmlPath);
    fs.readFile(xmlPath, 'utf-8', function (err, data) {
        if (err) {
            console.log("error");
        } else {
            //console.log('读取xml成功');
            var parseString = require('xml2js').parseString;
            parseString(data, {explicitArray: false}, function (err, json) {
                var modifyJson = getModifyPathFromJson(json, fileName);
                //////将路径修改的json重新转换成xml
                var builder = new xml2js.Builder();
                var xml = builder.buildObject(modifyJson);
                // console.log('重新写入到xml xmlPath =  scanCsdPath' + xmlPath + ' ' + scanCsdPath)
                var needPath = xmlPath.split(scanCsdPath)[1];
                needPath = needPath.split(fileName)[0];
                // console.log('重新写入到xml writePath = writePath' + writePath + needPath + fileName);
                writeFile(writePath + needPath, fileName, xml, cb);
            });
        }
    });
}
/**
 * 仅仅是创建目录
 * @param path
 */
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

function getModifyPathFromJson(json, fileName) {
    resetJson(json, fileName);
    return json;
}

//todo 重新修改路径

function resetJson(json, fileName123) {
    for (var k in json) {
        var obj = json[k];
        if (obj && _.isObject(obj)) {
            var path = obj['Path'];
            if (path) {
                var fileName = path.split('/');
                fileName = fileName[fileName.length - 1];
                //.split('.')[0]
                // if (fileName.indexOf('chuizi_01.plist'))
                // var isHave = _.find(allFileAndPlistAndCsd, {name: fileName});
                // if (fileName.indexOf('Effect_') == 0) {
                //     isHave = _.findWhere(allFileAndPlistAndCsd, {name: fileName.substr(7)});
                // }
                var isHave = _.find(allFileAndPlistAndCsd, function (pathObj123123) {
                    if (pathObj123123.name.toUpperCase().indexOf(fileName.toUpperCase()) != -1) {

                        return true;
                    }
                    return false;
                });


                // if(fileName.indexOf('common_bar07.png') != -1){
                //     console.log(JSON.stringify(isHave, null, 4));
                // }
                //找到对应的path
                if (isHave) {
                    //todo 修改
                    if (fileName.indexOf('.csd') != -1 || fileName.indexOf('.fnt') != -1) {
                        var realPath = isHave.path.split(scanCsdPath)[1];
                        realPath = realPath[0] == '/' ? realPath.substring(1) : realPath;
                        //csd的处理方式
                        obj['Path'] = realPath;
                        obj['Type'] = 'Normal';
                        obj['Plist'] = '';
                    }
                    //todo 修改
                    if (fileName.indexOf('.png') != -1 || fileName.indexOf('.jpg') != -1) {
                        //csd的处理方式
                        var realPath = isHave.path.split(scanImagePath)[1];
                        realPath = realPath[0] == '/' ? realPath.substring(1) : realPath;
                        if (isHave.isPlsit) {
                            obj['Path'] = isHave.name;
                            obj['Plist'] = realPath;
                            obj['Type'] = 'PlistSubImage';
                        } else {
                            obj['Path'] = realPath;
                            obj['Plist'] = '';
                            obj['Type'] = 'Normal';
                        }
                    }

                    if (fileName.indexOf('.plist') != -1) {
                        var realPath = isHave.path.split(scanImagePath)[1];
                        realPath = realPath[0] == '/' ? realPath.substring(1) : realPath;
                        obj['Path'] = realPath;
                        obj['Plist'] = '';
                        obj['Type'] = 'Normal';
                    }
                } else {
                    // console.log('-------------- 没找到 --------');
                    notXiugai[fileName123] = notXiugai[fileName123] || [];
                    notXiugai[fileName123].push({
                        name: fileName
                    });
                }
            }
            resetJson(json[k], fileName123);
        }
    }
}


function resetPlistFile(pathObj, callBack) {
    var PlistPath = pathObj.path;

    var path11 = PlistPath.substring(0, PlistPath.lastIndexOf('/'));
    // var plistRealPath = PlistPath.split(scanPlsitPath)[1];
    // plistRealPath = plistRealPath.substring(scanPlsitPath.indexOf('/') - 1);
    // console.log('PlistPath1 = ' + PlistPath);
    //此处必须用 utf-8 模式读取 否则报错
    var result = fs.readFileSync(PlistPath, 'utf-8');
    var data = Plist.parse(result);
    var allFile = data['frames'];

    if (pathObj.path.indexOf('chuizi_03.plist') != -1) {
        // writeFile('./toolsOut/', 'chuizi_03.json', JSON.stringify(data, null, 4));
        console.log('---- :' + JSON.stringify(data, null, 4));
    }

    /**
     * 粒子特效
     */
    var textureFileName = data['textureFileName'];
    if (textureFileName) {
        var isHave1 = _.find(allFileListInCocosStudio, {name: textureFileName});
        // if (pathObj.path.indexOf('chuizi_03.plist') != -1) {
        //     // writeFile('./toolsOut/', 'chuizi_03.json', JSON.stringify(data, null, 4));
        //     console.log('isHave1 == ---- :' + JSON.stringify(isHave1, null, 4));
        // }
        if (isHave1) {
            // 找到了 修改路径
            // isHave1.path
            var path22 = isHave1.path;
            path22 = path22.substring(0, path22.lastIndexOf('/'));
            var realPath = Path.relative(path11, path22);
            data['textureFileName'] = Path.join(realPath, isHave1.name);
        } else {
            notXiugaiPlist[textureFileName] = PlistPath;
        }
    }


    if (allFile) {
        for (var k in  allFile) {
            var isHave = _.find(allFileListInCocosStudio, {name: k});
            if (isHave) {
                var path221 = isHave1.path;
                path221 = path221.substring(0, path221.lastIndexOf('/'));
                var realPath12 = Path.join(Path.relative(path11, path221), isHave.name);

                allFile[k] = realPath12;
            } else {
                notXiugaiPlist[k] = PlistPath;
            }
        }
    }
    var xml = Plist.build(data);
    fs.writeFileSync(PlistPath, xml, 'utf-8');
    // console.log('plistRealPath22 = ' + plistRealPath);
    // plist.build(json)
    callBack && callBack();
    // return hasList;
}


function readPlistFile(pathObj, callBack) {
    //scanPlsitPath  plist的路径
    var hasList = [];
    var PlistPath = pathObj.path;
    var plistRealPath = PlistPath.split(scanPlsitPath)[1];

    // plistRealPath = plistRealPath.substring(scanPlsitPath.indexOf('/') - 1);
    // console.log('PlistPath = ' + PlistPath);
    //此处必须用 utf-8 模式读取 否则报错
    var result = fs.readFileSync(PlistPath, 'utf-8');
    var data = Plist.parse(result);
    var allFile = data['frames'];

    if (allFile) {
        for (var k in  allFile) {
            var obj = new Object();
            obj.size = -1;//文件大小，以字节为单位
            obj.name = k;//文件名
            obj.path = pathObj.path; //文件绝对路径
            obj.isPlsit = true;
            hasList.push(obj);
        }
    }
    // console.log('plistRealPath22 = ' + plistRealPath);
    callBack && callBack(hasList);
    return hasList;
}

//扫描的路径

var scanPath123 = '../svn/art_editor/cocosstudio';
var scanImagePath = scanPath123;
var scanCsdPath = scanPath123;
var scanPlsitPath = scanPath123;
var writePath = scanCsdPath;//+ '111';

//遍历文件夹，获取所有文件夹里面的文件信息
function geFileList(path, filiter, notHaveList) {
    var filesList = [];
    notHaveList = notHaveList || [];

    readFile(path, filesList, filiter, notHaveList);
    return filesList;
}
//遍历读取文件
function readFile(path, filesList, filiter, notHaveList) {
    var files = fs.readdirSync(path);//需要用到同步读取
    files.forEach(walk);
    function walk(file) {
        var states = fs.statSync(path + '/' + file);
        if (states.isDirectory()) {
            readFile(path + '/' + file, filesList, filiter, notHaveList);
        }
        else {
            //创建一个对象保存信息
            if (!filiter || file.indexOf(filiter) != -1) {
                var flag = false;
                _.forEach(notHaveList, function (item) {
                    if ((path + '/' + file).indexOf(item) != -1) {
                        flag = true;
                    }
                });
                if (!flag) {
                    var obj = new Object();
                    obj.size = states.size;//文件大小，以字节为单位
                    obj.name = file;//文件名
                    obj.nameOnly = file.substr(0, file.lastIndexOf('.'));//文件名
                    obj.path = path + '/' + file; //文件绝对路径
                    filesList.push(obj);
                }
            }
        }
    }
}

function getTextureConfigs(rootPath, subPath, extname) {
    var textureFiles = [];
    subPath = subPath || '';
    var files = fs.readdirSync(path.join(rootPath, subPath));
    files.forEach(function (file) {

        var stat = fs.statSync(path.join(rootPath, subPath, file));
        if (stat.isDirectory()) {
            var temp = getTextureConfigs(rootPath, path.join(subPath, file), extname);
            textureFiles = textureFiles.concat(temp);
        } else if (path.extname(file) === extname) {
            textureFiles.push(path.join(rootPath, subPath, file));
        }
    }, this);

    return textureFiles;
}


//工具中需要用到的资源文件就这些
//这个是为了plsit 做扩展用的

var allFileListInCocosStudio;
var pngList;
var jpgList;
var csdList;
var plistList;

//
// var needGaimingObj = {
//     chuizi_01: 'effect_chuizi_01'
// };

var allFileAndPlistAndCsd = [];


function test() {
    async.series({
        renameEffect: function (cb) {
            var allEffect = ToolsHelper.getFileList(scanImagePath, 'Csd_Effect/');

            console.log('allEffect = ' + JSON.stringify(allEffect, null, 4));

            _.forEach(allEffect, function (itemObj) {
                if (itemObj.name.toUpperCase().indexOf('EFFECT_') == 0) {
                    //大小写
                    fs.renameSync(itemObj.path, Path.join(itemObj.pathOnly, 'Effect_' + itemObj.name.substr(7)));
                } else {
                    console.log('改名:' + itemObj.path + '----->' + Path.join(itemObj.pathOnly, 'Effect_' + itemObj.name));
                    fs.renameSync(itemObj.path, Path.join(itemObj.pathOnly, 'Effect_' + itemObj.name));
                }
            });
            // return;
            cb();
        },

        getPath: function (cb) {
            allFileListInCocosStudio = geFileList(scanImagePath, '', ['/.']);
            //扫描图片的路径
            pngList = geFileList(scanImagePath, '.png', ['/.']);
            jpgList = geFileList(scanImagePath, '.jpg', ['/.']);

            //扫描csd的路径
            csdList = geFileList(scanCsdPath, '.csd', ['/.']);
            //扫描plsit的路径
            plistList = geFileList(scanPlsitPath, '.plist', ['/.']);


            // var test = [];
            //
            // _.forEach(plistList, function (item) {
            //     test.push(item.name);
            // });
            //
            // writeFile('./toolsOut/', 'plistList.json', JSON.stringify(test, null, 4));
            // // return;
            cb();
        },

        resetPlistPath: function (cb) {
            async.eachSeries(plistList, function (pathObj, callBack) {
                resetPlistFile(pathObj, callBack);
            }, function () {
                writeFile('./toolsOut/', 'notXiugaiPlist.json', JSON.stringify(notXiugaiPlist, null, 4), cb);
            });
        },


        // /**
        //  * 获取合图中的文件的路径 暂时没得plist  不实现
        //  * @param cb
        //  */
        readPlistPath: function (cb) {
            var list = [];
            // console.log('plistList = ' + JSON.stringify(plistList, null, 4));
            async.eachSeries(plistList, function (pathObj, callBack) {
                readPlistFile(pathObj, function (list123) {
                    list = list.concat(list123);
                    callBack();
                });
                
            }, function () {
                allFileAndPlistAndCsd = allFileListInCocosStudio.concat(list);
                // writeFile('./toolsOut/', 'notXiugai.json', JSON.stringify(allFileAndPlistAndCsd, null, 4));
                // console.log('list = ' + JSON.stringify(list, null, 4));
                cb();
            });
            //所有的路径  plist 中得 和 文件路径
        },
        /**
         * csd文件修改
         * @param cb
         */
        readCsdAndWrite: function (cb) {
            // console.log('生成新的文件中...csdList = ' + JSON.stringify(csdList, null, 4));
            async.eachSeries(csdList, function (obj, callBack) {
                readXMLAndParseToAnother(obj, writePath, callBack);
            }, function () {
                // console.log('修改的文件有\n' + JSON.stringify(resetCsd, null, 4));
                cb();
            })
        }
    }, function () {
        console.log('完成');

        var allData = {};

        _.forEach(notXiugai, function (list, key) {
            _.forEach(list, function (itemData) {
                allData[itemData.name] = key;
            })
        });

        writeFile('./toolsOut/', 'notXiugai.json', JSON.stringify(allData, null, 4));
    });
}
test();
