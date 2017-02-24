/**
 * Created by huangducai on 16/10/12.
 */
// 整理 拷贝完整项目 包括json的生成
var _ = require('underscore');
var Path = require('path');
var fs = require('fs');
var ToolsHelper = require('../ToolsHelper.js');
var async = require('async');

//生成的 pvrccz的目录
// ../svn/client_res_test/ccsRes
var xiaotuClientPath = '../svn/client_res_test';

var iosOutPvrDir = '../svn/client_tp_res/ios/zhuanhuanhou';
//ios 最终生成文件的路径
var client_resource = '../svn/client_tp_res/ios/client_res';
var joinPath = 'ccsRes/hetu';
var iosFliterResList = require('./copyConfig.js').iosFliterResList;

function test() {
    async.series({
        copyClientRes: function (cb) {
            console.log('拷贝不包含.jpg和png::::::::::::    ' + xiaotuClientPath + '--->' + client_resource);
            ToolsHelper.copyDir(xiaotuClientPath, client_resource, ['.png', '.jpg']);
            cb();
        },

        copyIOSPvrRes: function (cb) {

            var writePath = Path.join(client_resource, joinPath);
            console.log('拷贝ios的压缩资源::::::::::::::    ' + iosOutPvrDir + '----->' + writePath);
            ToolsHelper.copyDir(iosOutPvrDir, writePath);
            cb();
        },

        copyNotChangedRes: function (cb) {
            console.log('拷贝不合图不压图的资源::::::::::   ' + xiaotuClientPath + '----->' + client_resource);

            var allFile = ToolsHelper.getFileList(xiaotuClientPath, iosFliterResList);
            // var allFile = ToolsHelper.getFileList(xiaotuClientPath, ['.png', '.jpg']);
            _.forEach(allFile, function (objPath) {
                var lastPath = objPath.path.split(xiaotuClientPath)[1];
                ToolsHelper.copyFileSync(objPath.path, Path.join(client_resource, lastPath));
            });
            cb();
        }
    }, function () {
        console.log('------ 拷贝完成 进行配置文件修改');
    })
}

test();