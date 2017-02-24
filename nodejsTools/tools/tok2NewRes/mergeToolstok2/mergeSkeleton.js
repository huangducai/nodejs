var async = require('async');
var child_process = require('child_process');
var fs = require('fs');
var path = require('path');
var util = require('util');
var _ = require('underscore');
/**
 * 合并骨骼动画图片
 * @return {[type]} [description]
 */
function mergeSkeletonImage(workPath, pixelFormat, textureFormat, extname, outDir) {
    console.log('----mergeSkeletonImage----');
    var dirs = fs.readdirSync(workPath).filter(function(dirName) {
        return fs.statSync(path.join(workPath, dirName)).isDirectory();
    });

    pixelFormat = pixelFormat || 'RGBA5555';
    textureFormat = textureFormat || 'png';
    extname = extname || 'png';
    outDir = outDir || 'publish';

    cmd = 'TexturePacker %s --smart-update --format cocos2d --allow-free-size ' +
        '--force-squared --opt %s --texture-format %s --size-constraints POT ' +
        '--trim --enable-rotation --dither-fs-alpha --padding 0 ' +
        '--data %s --sheet %s';
    var ret = [];
    console.log("测试-----》" + JSON.stringify(dirs));

    dirs.forEach(function(dirName) {
        console.log("dirName-----》" + dirName);
        return;

        if (dirName.indexOf('publish') !== -1 || dirName.indexOf('DS_Store') !== -1) {
            return;
        }
     
        var sourcePath = path.join(workPath, dirName);
        var plist = util.format('%s/%s/%s.plist', workPath, outDir, dirName)
        var png = util.format('%s/%s/%s.%s', workPath, outDir, dirName, extname)
        var commandStr = util.format(cmd, sourcePath, pixelFormat, textureFormat, plist, png);
        ret.push(commandStr);
        console.log("---->" + commandStr);
    }, this);
    // console.log(ret[30]);

    return ret;
}


function test(workPath, pixelFormat, textureFormat, extname, outDir) {
    pixelFormat = pixelFormat || 'RGBA5555';
    textureFormat = textureFormat || 'png';
    extname = extname || 'png';
    outDir = outDir || 'publish';

    cmd = 'TexturePacker %s --smart-update --format cocos2d --allow-free-size ' +
        '--force-squared --opt %s --texture-format %s --size-constraints POT ' +
        '--trim --enable-rotation --dither-fs-alpha --padding 0 ' +
        '--data %s --sheet %s';
   
    if (workPath.indexOf('publish') !== -1 || workPath.indexOf('DS_Store') !== -1) {
        return;
    }
    
    var sourcePath = workPath;
    var resName = workPath.split("\\");//window上这么使用
	//var resName = workPath.split("/");//mac上这么使用
	// console.log("dirTest---->" + dirTest);
    // console.log("outDir---->" + outDir);
	// console.log("resName[resName.length - 1])---->" + JSON.stringify(resName));

    var plist =  path.join(util.format('%s/%s/%s.plist', dirTest, path.join(outDir, resName[resName.length - 2]), resName[resName.length - 1]),"");
    var png = path.join(util.format('%s/%s/%s.%s', dirTest, path.join(outDir, resName[resName.length - 2]), resName[resName.length - 1], extname), "");
    var commandStr = util.format(cmd, sourcePath, pixelFormat, textureFormat, plist, png);

    var even = _.find(resArray, function(str){ return str === commandStr; });
    if(even){
        return;
    }
    // console.log(commandStr);
    resArray.push(commandStr);
}


function recursiveDir(workPath, pixelFormat, textureFormat, extname, outDir){
    var dirs = fs.readdirSync(workPath);

    var array = [];

    dirs.forEach(function(dirName) {
    var dirUrl = path.join(workPath, dirName);
    var stat = fs.lstatSync(dirUrl);
    if(stat.isDirectory()){
        console.log("---->" + dirTest);
       recursiveDir(dirUrl, pixelFormat, textureFormat, extname, outDir);
    }else{
        var extN = path.dirname(dirName);
        if (dirName.indexOf('.png') !== -1 || dirName.indexOf('.jpg') !== -1) {
            // console.log("---扩展名" + workPath);
            
            test(workPath, pixelFormat, textureFormat,extname,outDir);
        }
       
    }
    }, this);
}

var pixelFormat = process.argv[2];;
var textureFormat = process.argv[3];
var extname = process.argv[4];
var outDir = process.argv[5];

var dirTest = path.join('../../11、美术工作目录/99、资源输出目录/skeleton', "");
var resArray = [];
recursiveDir(dirTest, pixelFormat, textureFormat, extname, outDir);
console.log("你好啊 " + JSON.stringify(resArray));
async.eachSeries(resArray, function(command, cb) {
    var child = child_process.exec(command, function(err, stdout, stderr) {
        console.log(stderr||stdout);
    });
    child.on('exit', cb);
}, function() {

});
