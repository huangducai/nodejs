/**
 * Created by huangducai on 16/10/12.
 */
var _ = require('underscore');
var Path = require('path');
var fs = require('fs');
var ToolsHelper = require('../ToolsHelper.js');
var async = require('async');
/**
 * 资源根路径
 * @type {string}
 */
var scanPath = '../svn/client_res_test';

var otherPathList = [
    //合图后的存放文件夹
    '../svn/client_tp_res/android/hetuhou',//安卓合图后存放的地方
    '../svn/client_tp_res/ios/hetuhou', //ios 合图后存放的地方

    '../svn/client_tp_res/ios/zhuanhuanhou', // 转换成 pvrccz的资源目录
    '../svn/client_tp_res/android/zhuanhuanhou',//转换后的pkm 和 pkm_alpha 图片

    '../svn/client_tp_res/android/client_res/ccsRes/hetu',//包含 plist 的 文件夹
    '../svn/client_tp_res/ios/client_res/ccsRes/hetu', //
];

var config = require('./copyConfig.js');
//安卓输出目录
var androidWritePath = '../svn/client_tp_res/android/daihetu';
//ios 输出目录
var iosWritePath = '../svn/client_tp_res/ios/daihetu';
//安卓 过滤 文件 和 文件夹
var androidFliterResList = config.androidFliterResList;
//苹果 过滤 文件 和 文件夹
var iosFliterResList = config.iosFliterResList;

function copyFileToDir(copyPath, filiter, writePath, notCopyList) {
    notCopyList = notCopyList || [];
    if (notCopyList) {
        if (_.isString(notCopyList)) {
            notCopyList = [notCopyList];
        }
        if (!_.isArray(notCopyList)) {
            notCopyList = [];
        }
    }

    /**
     * t除不要的
     * @type {*|Array}
     */
    var allFileList = ToolsHelper.getFileList(copyPath, filiter);
    allFileList = _.filter(allFileList, function (objPath) {
        var flag = true;
        if (notCopyList.length > 0) {
            _.forEach(notCopyList, function (item) {
                if (objPath.path.indexOf(item) != -1) {
                    flag = false;
                }
            });
        }
        return flag;
    });

    var copyPathList = [];
    _.forEach(allFileList, function (currFilePathObj) {
        var write = writePath + '/' + currFilePathObj.name;
        ToolsHelper.copyFileSync(currFilePathObj.path, write, false);
        copyPathList.push(write);
    });
    return copyPathList;
}

function tok2CopyTools() {
    async.series({
        createNeedPath: function (callBack) {
            otherPathList.push(androidWritePath);
            otherPathList.push(iosWritePath);
            _.forEach(otherPathList, function (pathStr) {
                ToolsHelper.createDirByPath(pathStr)
            });

            callBack && callBack();
        },
        /**
         * 拷贝安卓资源
         * @param callBack
         */
        copyAndroidRes: function (callBack) {
            if (argvFlag == 0) {
                console.log('拷贝android资源中.....');
                copyFileToDir(scanPath, ['.png', '.jpg'], androidWritePath, androidFliterResList);
            }
            callBack && callBack();
            //todo 下面是不删除 daihetu目录的处理方法
        },
        /**
         * 拷贝ios 资源
         */
        copyIosRes: function (callBack) {
            if (argvFlag == 1) {
                console.log('拷贝ios资源中.....');
                copyFileToDir(scanPath, ['.png', '.jpg'], iosWritePath, iosFliterResList);
            }
            callBack && callBack();
            //todo 下面是不删除 daihetu目录的处理方法
        },
        //todo 更多
    }, function () {
        console.log('资源拷贝 和 文件夹创建完成 完成---------------------');
    });
}

var argvFlag = process.argv[2];// todo 添加参数 只拷贝android 或者 ios 的
tok2CopyTools();




















