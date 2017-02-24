var ToolsHelper = require('./ToolsHelper.js');
var _ = require('underscore');
var fs = require('fs');
var util = require('util');
var xml2js = require('xml2js');
var Plist = require('plist');
var async = require('async');
var Path = require('path');
var child_process = require('child_process');


//todo 查找cocosstudio 中的重复的文件名称 ----begin //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var allFile = ToolsHelper.getFileList('./testDir', ['.csd', '.png', '.jpg', '.JPG', '.PNG', '.txt', '.plist', '.fnt']);//, ['.plist', '.png', '.jpg', '.json']
// var dirList = ToolsHelper.getAllDirList('./testDi').length;
// console.log('-------文件夹个数:' + dirList);

var file = {};
var count = 0;


function getNotHaveHuzhui(str) {
    var strList = str.split('/');
    strList = strList[strList.length - 1];

    return strList.split('.')[0];
}


_.forEach(allFile, function (item) {
    var name = getNotHaveHuzhui(item.path);
    console.log('name = ' + name);

    file[name] = file[name] || [];
    file[name].push(item.path);
    count++;
});

file = _.filter(file, function (item) {
    return item.length > 1;
});

console.log('重复的文件: ' + JSON.stringify(file, null, 4) + '\n' + count);


console.log('this is nodejs test');

//todo 查找cocosstudio 中的重复的文件名称 ----end //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
//todo 查找查找错误图片----begin //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var Images = require('images');
//
// var allFile = ToolsHelper.getFileList('../svn/art_editor/cocosstudio', ['.png', '.jpg']);//, ['.plist', '.png', '.jpg', '.json']
// console.log('资源数量:' + allFile.length);
//
// var list = [];
// _.forEach(allFile, function (item) {
//
//     if (item.name == 'daditubeijing.png') {
//         console.log('-------' + JSON.stringify(Images(item.path).size(), null, 4));
//     }
//     console.log('-----  item.path = ' + item.path);
//     var size = Images(item.path).size();
//     if (size.width > 2040 || size.height > 2040) {
//         list.push(item.name);
//     }
// });
//
// console.log('损坏的文件:' + JSON.stringify(list, null, 4));

//todo 查找查找错误图片----end //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//todo 查找png资源的大小----begin //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// var nowPng = ToolsHelper.getFileList('./res/ccsRes', ['.png']);//, ['.plist', '.png', '.jpg', '.json']
// console.log('  nowPng:' + nowPng.length);
// var size = 0;
//
// _.forEach(nowPng, function (pathObj, index) {
//     size += pathObj.states.size;
// });
// console.log('  size:' + size / 1024 / 1024 + 'M');

//todo 查找png资源的大小----end //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////











