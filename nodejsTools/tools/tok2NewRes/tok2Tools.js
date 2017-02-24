/**
 * Created by huangducai on 16/10/28.
 */
var ToolsHelper = require('../ToolsHelper.js');

var _ = require('underscore');
var fs = require('fs');
var util = require('util');
var xml2js = require('xml2js');
var Plist = require('plist');
var async = require('async');
var Path = require('path');
var child_process = require('child_process');

var copyConfig = require('./copyConfig.js');
var copyPath = '../svn/client_res_test';
var writePath = '../svn/client_tp_res/ios';
var hetuhouDir = '../svn/client_tp_res/ios/hetuhou';
var currResDir = './res';

var argvStr = process.argv[2];

function test() {
    async.series({
        copyxiaotu: function (callBack) {
            if (argvStr.indexOf('copyxiaotu') == -1) {
                callBack();
                return;
            }
            ToolsHelper.remvoeDirSync(currResDir);
            ToolsHelper.createDirByPath(currResDir);
            ToolsHelper.copyDir(copyPath, currResDir);
        },
        

    });
}

test();









