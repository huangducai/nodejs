var _ = require('underscore');
var fs = require('fs');
var util = require('util');
var xml2js = require('xml2js');
var Plist = require('plist');
var async = require('async');
var Path = require('path');
var exec = require('child_process').exec;
var ToolsHelper = require('../ToolsHelper.js');
var sys = require('sys');

var scanPath= '../svn/client_tp_res/android/hetuhou';
var output_directory = "../svn/client_tp_res/android/zhuanhuanhou";
var clientResPath = '../svn/client_tp_res/android/client_res/hetu/';


//生成的 pvrccz的目录
// ../svn/client_res_test/ccsRes
var xiaotuClientPath = '../svn/client_res_test';

//ios 最终生成文件的路径
var client_resource = '../svn/client_tp_res/android/client_res';
var joinPath = 'ccsRes/hetu';
var androidFliterResList = require('./copyConfig.js').androidFliterResList;

console.log('androidFliterResList' + JSON.stringify(androidFliterResList));
function main() {
    async.series({

        startFormatComm: function (cb) {
            formatComm(cb);
        },

        copyClientRes: function (cb) {

            console.log(xiaotuClientPath + '--->' + client_resource + '\n 本次拷贝不包含.jpg 和 png');
            ToolsHelper.copyDir(xiaotuClientPath, client_resource, ['.png', '.jpg']);
            cb();
        },

        copyAndroidPkmRes: function (cb) {
            var writePath = Path.join(client_resource,  joinPath);
            console.log('拷贝android的压缩资源');
            console.log(output_directory + '----->' + writePath);

            ToolsHelper.copyDir(output_directory, writePath);
            cb();
        },

        copyNotChangedRes: function (cb) {
            console.log('拷贝 ---不合图 不压图--- 的资源');
            console.log(xiaotuClientPath + '----->' + client_resource);

            var allFile = ToolsHelper.getFileList(xiaotuClientPath, androidFliterResList);
            // var allFile = ToolsHelper.getFileList(xiaotuClientPath, ['.png', '.jpg']);
            // console.log("allFile---->" + JSON.stringify(allFile, null, 4));
            _.forEach(allFile, function (objPath) {
                var lastPath = objPath.path.split(xiaotuClientPath)[1];
                ToolsHelper.copyFileSync(objPath.path, Path.join(client_resource, lastPath));
            });
            cb();
        }

    }, function () {
        console.log('------ 拷贝完成 进行配置文件修改');
    });
}


/**
 * 用 scanPath 的路径下的图片生成pkm,和alphaPkM, 完成时候执行plist的生成
 */
function formatComm(cb) {
    console.log("--------------------------------开始扫描文件生成命令--------------------------------");
    var dirList = ToolsHelper.getFileList(scanPath, ".png");
    // console.log("一个有" + dirList.length +"个图片需要转换");
    var commTemplate = "etcpack %s %s -c etc1 -as";
    var array = [];
    _.each(dirList, function (value, key, list) {
        // console.log(JSON.stringify(value.path, null, 4));
        array.push(util.format(commTemplate, value.path, output_directory));
    });
    console.log("--------------------------------开始执行命令转换图片。请稍等--------------------------------");
    var date = new Date();
    exec(array.join("&&"), function(error, stdout, stderr) {
        // sys.print('stdout： ' + stdout);
        // sys.print('stderr： ' + stderr);
        if (!error) {
            console.log('图片转换完成,总共耗时:' + (new Date() - date) + "毫秒");
            console.log("--------------------------------执行plist解析生成pkm相关的plist文件--------------------------------");
            copyPlistAndFormat(cb);
        }
    });
}

/**
 * 1、读取 scanPath 路径下的plist  修改每个原始的图片引用为.pkm 同时拷贝到 output_directory
 * 2、生成alphaPkm的plist 同时 拷贝到 output_directory
 */
function copyPlistAndFormat(cb) {
    var dirList = ToolsHelper.getFileList(scanPath, ".plist");
    // console.log(JSON.stringify(dirList[1], null, 4));
    // ToolsHelper.copyFileToDir(scanPath ,".plist", output_directory);
    _.each(dirList, function (value, key, list) {
        var result = fs.readFileSync(value.path, 'utf-8');
        if(result){
            generatePkmPlistNoAlpha(value.name, result);
            generatePkmPlistAlpha(value.name, result);
        }else {
            console.log("error");
        }

        // fs.readFile(value.path, 'utf-8', function (err, result) {
        //     if (err) {
        //         console.log("error");
        //     } else {
        //         generatePkmPlistNoAlpha(value.name, result);
        //         generatePkmPlistAlpha(value.name, result);
        //     }
        // });
    });
    cb();
}

/**
 * 生成原始的plist 修改引用图片为.pkm
 * @param plistName  plist名字
 * @param result   使用 fs.readFile 读取获得的字节流
 */
function generatePkmPlistNoAlpha(plistName, result) {
    var data = Plist.parse(result);
    // var jsonFile = data['frames'];
    data.metadata.textureFileName = data.metadata.textureFileName.replace(".png", ".pkm");
    // console.log(JSON.stringify(data, null, 4));

    var xml = Plist.build(data);
    
    fs.writeFileSync(Path.join(output_directory, plistName), xml, 'utf-8');
}

/**
 * 生成原始的plist 修改引用图片为.pkm
 * @param plistName  plist名字
 * @param result   使用 fs.readFile 读取获得的字节流
 */


function generatePkmPlistAlpha(plistName, result) {
    var data = Plist.parse(result);
    var jsonFile = data['frames'];
    var frames = {};
    _.each(jsonFile, function (value, key, list) {
        var alphaKey = null;

        if(key.indexOf('.jpg') !== -1){
            alphaKey = key.replace(".jpg", "_alpha.jpg");
        }else if(key.indexOf('.png') !== -1){
            alphaKey = key.replace(".png", "_alpha.png");
        }

        if(alphaKey){
            frames[alphaKey] = value;
        }
    });
    if(_.isEmpty(frames)){
        console.log("警告--->生成alpha的plist出错 请检查引用图片的后缀名");
        return;
    }
    data.metadata.textureFileName = data.metadata.textureFileName.replace(".png", "_alpha.pkm");
    data['frames'] = frames;
    var xml = Plist.build(data);

    fs.writeFileSync(Path.join(output_directory, plistName.replace(".plist", "_alpha.plist")), xml, 'utf-8');
}

//入口开始执行
main();
/**
 * Created by huangducai on 16/10/12.
 */


// 整理 拷贝完整项目 包括json的生成 具体  整理 生成的pkm 和 pkm——alpha 文件  到 android/client_res/hetu

// 并且 拷贝其他资源到 android/client_res 目录下 拷贝规则






