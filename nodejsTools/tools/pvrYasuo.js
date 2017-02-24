/**
 * Created by huangducai on 16/11/20.
 */
var _ = require('underscore');
var fs = require('fs');
var util = require('util');
var Path = require('path');
var child_process = require('child_process');

var async = require('async');

var ToolsHelper = require('./ToolsHelper.js');
// var pngFileDir = '../svn/client_tp_res/ios/allPng_yasuoqian';
// var pvrShuchuDir = '../svn/client_tp_res/ios/allPvr_yasuohou';
var pngFileDir = './res';
var pvrShuchuDir = './res1';
var pngFileList = ToolsHelper.getFileList(pngFileDir, ['.png']);

function yasuoDirToDir(from, to, mingzi, callBack, isShowLog) {
    console.log('from :' + from + '  -------> ' + to);
    var command = 'TexturePacker ' +
        from + ' ' +
        ' --texture-format  pvr2ccz' +
        ' --smart-update ' +
        ' --format cocos2d ' +
        ' --opt PVRTC4 ' + //todo 改变
        ' --allow-free-size ' +
        ' --trim-mode None ' +
        ' --disable-rotation ' +
        ' --dither-fs-alpha ' +
        ' --padding 0 ' +
        ' --multipack ' +
        ' --extrude 10 ' +
        ' --data ' +
        Path.join(to, mingzi + '.plist') + ' ' +
        ' --sheet ' +
        Path.join(to, mingzi + '.pvr.ccz');
    // command, isShowLog, callBack

    console.log(' commond:' + command);

    ToolsHelper.excCommond(command, true, callBack)
}

function test() {
    async.eachSeries(pngFileList, function (item, cb) {
        //from, to, mingzi, callBack, isShowLog
        yasuoDirToDir(item.path, pvrShuchuDir, item.name.split('.')[0], cb);
    }, function () {
        console.log('-------输出完毕');
    })
}

test();

