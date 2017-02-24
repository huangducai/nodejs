/**
 * Created by huangducai on 16/11/10.
 */

var ToolsHelper = require('./ToolsHelper.js');

var _ = require('underscore');
var fs = require('fs');
var util = require('util');
var xml2js = require('xml2js');
var Plist = require('plist');
var async = require('async');
var Path = require('path');
var child_process = require('child_process');

var clientResDir = '../svn/client_res_test/ccsRes';
var clientConfigDir = '../svn/client_res_test/config';
//拷贝 config 和 res 到 clientRes 目录

var argvFlag = process.argv[2];//版本号 2.0.5
//Var.2.0
var dirVer = argvFlag.substr(0, argvFlag.lastIndexOf('.'));
var workPath = '../svn/99、versions';
var copyPath = Path.join(workPath, 'Var.' + dirVer);
if (!fs.existsSync(copyPath)) {
    throw new Error('目标路径不存在:' + copyPath);
    return;
}

async.series({
    'upRes': function (cb) {
        ToolsHelper.excCommond(['svn up ../svn/99、versions'].join('&&'), true, cb);
    },

    'checkFileName': function (cb) {
        ToolsHelper.excCommond(['node tools/tok2NewRes/checkFileName.js'].join('&&'), true, cb);
    },

    'copy': function (cb) {

        var dirList = [];
        var files = fs.readdirSync(copyPath);//需要用到同步读取
        files.forEach(function (file) {
            var fullPath = copyPath + '/' + file;
            var states = fs.statSync(fullPath);
            if (states.isDirectory()) {
                dirList.push(fullPath);
            }
        });

        dirList = dirList.sort(function (item1, item2) {
            return item1 > item2
        });
        // console.log('---- 所有的文件夹:' + JSON.stringify(dirList, null, 4));

        /**
         * 从后往前面找
         */
        var index = _.findLastIndex(dirList, function (item) {
            return item.indexOf(argvFlag) == item.length - argvFlag.length
        });
        // console.log('---- 找到的index =:' + index);
        var needCopyDirList = _.first(dirList, index + 1);
        console.log('---- 即将拷贝的文件:' + JSON.stringify(needCopyDirList, null, 4));

        _.forEach(needCopyDirList, function (item) {
            var copyDir = Path.join(item, 'ccsRes');
            if(fs.existsSync(copyDir)){
                var fileList = ToolsHelper.getFileList(copyDir);
                _.forEach(fileList, function (objPath) {
                    var lastPath = objPath.path.split(copyDir)[1];
                    ToolsHelper.copyFileSync(objPath.path, Path.join(clientResDir, lastPath));
                });
            }

            var copyDir1 = Path.join(item, 'config');
            if(fs.existsSync(copyDir1)){
                var fileList1 = ToolsHelper.getFileList(copyDir1);
                _.forEach(fileList1, function (objPath) {
                    var lastPath = objPath.path.split(copyDir1)[1];
                    ToolsHelper.copyFileSync(objPath.path, Path.join(clientConfigDir, lastPath));
                });
            }else {
                console.log('-----不存在');
            }
        });
        cb();
    }


});


































