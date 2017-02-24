/**
 * Created by huangducai on 16/2/1.
 */
//var fs = require('fs'),
//    xml2js = require('xml2js');
//
//
//
//
//
//var parser = new xml2js.Parser();
//fs.readFile(__dirname + '/foo.xml', function(err, data) {
//    parser.parseString(data, function (err, result) {
//        console.dir(result);
//        console.log('Done');
//    });
//});
var _ = require('underscore');
var fs = require('fs'),
    util = require('util');
//var iconv = require('iconv-lite');
var xml2js = require('xml2js');
var Plist = require('plist');
var async = require('async');

var path = require('path');
var sep = path.sep;
var resetCsd = [];
/**
 *
 * @type {Array}
 */
var csdPath = [];
var plistPath = [];
var plistImgPath = {};

/**
 * 获取某个路径下的所有扩展名为 extname 的文件数组
 * @param rootPath
 * @param subPath
 * @param extname
 * @returns {Array}
 */
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
};

function readXMLAndParseToAnother(xmlPath, writePath, cb) {
    var fileName = xmlPath.split(sep);
    fileName = fileName[fileName.length - 1];

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
                ////console.log('重新写入到xml');
                writeFile(writePath, fileName, xml, cb);
            });
        }
    });
}

function writeFile(path, fileName, content, cb) {
    var allPath = path + fileName;
    if (fs.existsSync(path)) {
        fs.writeFile(allPath, content, function (err) {
            if (err) {
                console.log("fail " + err);
            } else {
                //console.log("写入文件ok");
            }
            cb();
        });
    } else {
        fs.mkdirSync(path);
        writeFile(path, fileName, content, cb);
    }

}

function getModifyPathFromJson(json, fileName) {
    resetJson(json, fileName);
    return json;
}

function resetJson(json, fileName123) {
    for (var k in json) {
        var obj = json[k];
        var isReset = false;
        if (obj && _.isObject(obj)) {
            var imgPath = obj['Path'];//&& imgPath.indexOf('png') != -1
            if (imgPath) {
                //console.log('pngPath' + imgPath);
                var fileName = imgPath.split('/');
                fileName = fileName[fileName.length - 1].split('.')[0];
                if (plistImgPath[fileName]) {
                    json[k]['Path'] = plistImgPath[fileName].name;
                    json[k]['Plist'] = plistImgPath[fileName].plist;
                    json[k]['Type'] = 'PlistSubImage';
                    //console.log('fileName123 === ' + fileName123);
                    //console.log('fileName === ' + fileName);
                    isReset = true;
                } else {
                    console.log('图片：' + fileName + '   fileName123 ＝' + fileName123);
                }
            }
            resetJson(json[k], fileName123);
        }
        if (isReset && resetCsd.indexOf(fileName123) == -1) {
            resetCsd.push(fileName123);
        }
    }
}

function readPlistFile(PlistPath, callBack) {
    //console.log('fileNameyyyyyy000 = ' + PlistPath);

    var fileName = PlistPath.split('cocosstudio');
    fileName = fileName[fileName.length - 1];
    //console.log('fileNameyyyyyy111 = ' + fileName);

    if (fileName[0] == sep) {
        fileName = fileName.substr(1, fileName.length);
    }

    //console.log('fileNameyyyyyy222 = ' + fileName);
    fs.readFile(PlistPath, 'utf-8', function (err, result) {
        if (err) {
            console.log("error");
        } else {
            var data = Plist.parse(result);
            var allFile = data['frames'];
            for (var k in  allFile) {
                var key = k;
                k = k.split('/');
                k = k[k.length - 1].split('.')[0];// 图片名字
                //console.log('读取plist成功 : fileName ==' + fileName);
                plistImgPath[k] = {name: key, plist: fileName.replace(/[\\]/g, '/')};
            }
        }
        callBack();
    });
}

function test(readPlistPath, readCsdPath, writePath) {
    async.series({
        getPath: function (cb) {
            csdPath = getTextureConfigs(readCsdPath, null, '.csd');
            console.log('所有的cocosstudio文件 = ' + JSON.stringify(csdPath, null, 4));
            plistPath = getTextureConfigs(readPlistPath, null, '.plist');
            console.log('所有的合图文件 = ' + JSON.stringify(plistPath, null, 4));
            cb();
        },
        /**
         * 获取合图中的文件的路径
         * @param cb
         */
        readPlistPath: function (cb) {
            async.eachSeries(plistPath, function (path, callBack) {
                readPlistFile(path, callBack);
            }, function () {
                cb();
            })
        },
        /**
         * csd文件修改
         * @param cb
         */
        readCsdAndWrite: function (cb) {
            console.log('生成新的文件中...');
            async.eachSeries(csdPath, function (path, callBack) {
                readXMLAndParseToAnother(path, writePath, callBack);
            }, function () {
                console.log('修改的文件有\n' + JSON.stringify(resetCsd, null, 4));
                cb();
            })
        }
    }, function () {
        console.log('完成');
    });
}
var readPlistPath = '../../cocosStudio/ui/cocosstudio';
var readCsdPath = '../../cocosStudio/ui/cocosstudio';
var writePath = '../../cocosStudio/ui/cocosstudio1/';

// var readPlistPath = UI_COCOSSTUDIO;
// var readCsdPath = UI_COCOSSTUDIO;
// var writePath = UI_COCOSSTUDIO1 + "/";

if (process.argv[2] && process.argv[2].indexOf('cocosstudio') != -1) {
    readPlistPath = process.argv[2];
}

if (process.argv[3]) {
    readCsdPath = process.argv[3];
}

if (process.argv[4]) {
    writePath = process.argv[4];
}

console.log('读取plist路径==' + readPlistPath);
console.log('读取plist路径==' + readCsdPath);
console.log('输出路径==' + writePath);

test(readPlistPath, readCsdPath, writePath);



