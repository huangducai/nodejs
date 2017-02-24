/**
 * Created by huangducai on 16/10/20.
 */


var _ = require('underscore');
var fs = require('fs');
var util = require('util');
var xml2js = require('xml2js');
var Plist = require('plist');
var async = require('async');
var Path = require('path');

var ToolsHelper = require('../ToolsHelper.js');



var scanPath =  process.argv[2] || 'res/ccsRes';


if (!fs.existsSync(scanPath)) {
    console.log('-------- scanPath 不存在:' + scanPath);
    return;
}

// var scanPath = 'res';
/**
 * 生成原始的plist 修改引用图片为.pkm
 * @param obj  plist名字
 * @param result   使用 fs.readFile 读取获得的字节流
 */
function generatePkmPlistNoAlpha(obj, result) {
    var houzhuimingList = ['.png', '.pkm', '.pvr.ccz'];

    var data = Plist.parse(result);
    //原来文件的名字
    if (!data.textureFileName && !(data.metadata && data.metadata.textureFileName)) {
        console.log('此文件没有 textureFileName字段:' + obj.path);
        console.log('data == ' + JSON.stringify(data, null, 4));
        return;
    }
    var fileName = data.textureFileName || data.metadata.textureFileName;
    fileName = fileName.split('.')[0];
    var changedName = '';
    _.forEach(houzhuimingList, function (houzhuiming) {
        if (fs.existsSync(Path.join(obj.pathOnly, fileName + houzhuiming))) {
            changedName = houzhuiming;
        }
    });
    //替换后缀名称

    if (!changedName) {
        console.log('-------- 这个没得对应的图片:' + obj.name);
        return;
    }
    /**
     * 兼容例子特效
     * @type {string}
     */
    fileName = fileName + changedName;
    if (data.textureFileName) {
        data.textureFileName = fileName;
    } else {
        data.metadata.textureFileName = fileName;
    }
    var xml = Plist.build(data);
    fs.writeFileSync(obj.path, xml, 'utf-8');
}


var dirList = ToolsHelper.getFileList(scanPath, ".plist");

// dirList = _.filter(dirList, function (item) {
//     return item.path.indexOf('Defult/') == -1;
// });


_.each(dirList, function (value, key, list) {
    var result = fs.readFileSync(value.path, 'utf-8');
    if (result) {
        generatePkmPlistNoAlpha(value, result);
    } else {
        console.log("error");
    }
});
