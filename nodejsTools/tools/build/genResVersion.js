/**
 * Created by zxh on 16/1/27.
 * 此脚本用于生成客户端两个版本之间资源版本增量文件,
 */

var fs = require( 'fs' ),
    stat = fs.stat;
var util = require('util');
var path = require('path');
var _ = require('underscore');
var child_process = require('child_process');

function ResVerionGenerator(newResPath, oldResPath) {
    this.newResPath = newResPath;
    this.oldResPath = oldResPath;
    this.excludes = ['.DS_Store'];
    this.diffSnaps = [];
}

/**
 *
 * @param newSnaps
 * @param oldSnaps
 */
ResVerionGenerator.prototype.diff = function(newSnaps, oldSnaps) {

    return _.filter(newSnaps, function(newSnap, fileName) {
        var oldSnap = oldSnaps[fileName];
        if (!oldSnap) {
            return true;
        }

        return newSnap.size !== oldSnap.size || newSnap.mtime !== newSnap.mtime;
    }).map(function(snap) {
        return path.join(this.newResPath, snap.fileName);
    }, this);


};

/**
 * 创建文件快照对象
 * @param rootPath
 * @param fileName
 * @returns {{fileName: *, stat}}
 */
ResVerionGenerator.prototype.createFileSnap = function(rootPath, fileName) {

    var stat = fs.statSync(path.join(rootPath, fileName));
    return {fileName: fileName, stat:stat};
};

/**
 * 获取路径下所有文件的快照
 * @param rootPath
 * @param subPath
 * @returns {{}}
 */
ResVerionGenerator.prototype.getPathSnaps = function(rootPath, subPath) {
    var snaps = {};
    subPath = subPath || '';
    var files = fs.readdirSync(path.join(rootPath, subPath)).filter(function(file) {
        return this.excludes.indexOf(file) === -1;
    }, this);


    files.forEach(function(file) {
        var stat = fs.statSync(path.join(rootPath, subPath, file));
        if (stat.isDirectory()) {
            var temp = this.getPathSnaps(rootPath, path.join(subPath, file));
            snaps = _.extend(snaps, temp);
        } else {
            var snap = this.createFileSnap(rootPath, path.join(subPath, file));
            snaps[snap.fileName] = snap;
        }
    }, this);
    return snaps;
};

/**
 * 资源文件版本运算
 */
ResVerionGenerator.prototype.make = function() {
    var newResSnap = this.getPathSnaps(this.newResPath);
    var oldResSnap = this.getPathSnaps(this.oldResPath);
    this.diffSnaps = this.diff(newResSnap, oldResSnap);
    this.diffSnaps.push(this.newResPath.replace('res', 'src') + "/app-all.js");
    return true;
};


/**
 * 导出文件名
 * @param exportName
 */
ResVerionGenerator.prototype.export = function(exportName) {
    var command = util.format('rar a -r %s %s', exportName, this.diffSnaps.join(' '));
    if(process.platform !== 'win32') {
        command = util.format('zip -r %s %s', exportName, this.diffSnaps.join(' '));
    }
    console.log(command);
    var child = child_process.exec(command);
    child.stdout.on('data', function(data) {
        console.log(data);
    });

    child.stderr.on('data', function(data) {
        console.log(data);
    });

    child.on('exit', function (code) {
        console.log('生成Zip文件' + code);
    });
};

/**
 * 拷贝文件：
 * @param fileTo
 * @param fileIn
 */
function copyFile(fileTo, fileIn){
    var command = util.format('xcopy %s %s /s /e /y','.\\' + fileTo, fileIn + '\\'+fileTo);
    if(process.platform !== 'win32'){
        command = util.format('cp -r %s %s', './' + fileTo, fileIn + '/');
    }
    var child = child_process.exec(command);
    child.stdout.on('data', function(data) {
    });
    child.stderr.on('data', function(data) {
    });
    child.on('exit', function (code) {
    });
}

//---------------------------------------------------
var json = {};
//路径
json.location = process.argv[2] ? process.argv[2] : '.\\assetManager';
//文字描述
json.desc = process.argv[3] ? process.argv[3] : '没有说明';

/**
 * 写入版本文件
 */
function writeToVersion(versionCode){
    if(!versionCode){
        return;
    }

    var filePath =  json.location + "/version.manifest";

    fs.readFile(filePath,"utf8",function (error,data){
        if(error) throw error ;
        var versionData = JSON.parse(data);
        var groupVersions = versionData.groupVersions;
        groupVersions[(_.size(groupVersions) + 1).toString()] = versionCode;

        fs.writeFile(filePath,JSON.stringify(versionData, null, 4),function (err) {
            if (err) throw err ;
            console.log("version.manifest is OK"); //文件被保存
        }) ;
    });
}



function writeToProject(versionCode, fileName){
    if(!versionCode){
        return;
    }
    var filePath = json.location + "/project.manifest";
    fs.readFile(filePath,"utf8",function (error,data){
        if(error) throw error ;
        var versionData = JSON.parse(data);
        //写入groupVserions
        var groupVersions = versionData.groupVersions;
        var nowGroupSize = _.size(groupVersions) + 1;
        groupVersions[nowGroupSize.toString()] = versionCode;

        var assets = versionData.assets;
        assets['update' + nowGroupSize] = {
            "path": fileName,
            "compressed" : true,
            "group" :  nowGroupSize.toString()
        };

        fs.writeFile(filePath,JSON.stringify(versionData, null, 4),function (err) {
            if (err) throw err ;
            console.log("project.manifest is OK"); //文件被保存
        }) ;
    });
}

/**
 * 传入的数字转换成版本
 * @param versionCode
 * @returns {string}
 */
function convertVersionStr(versionCode){
    var versionCodeStr = versionCode.toString();
    var sureVersion = "";
    // 101 --> 1.0.1
    for(var i = 0; i< versionCodeStr.length; i++){
        if(i < versionCodeStr.length - 1){
            sureVersion += versionCodeStr[i] + '.';
        }else{
            sureVersion += versionCodeStr[i];
        }
    }
    return sureVersion;
}

/**
 * 写出版本更新说明
 * @param version
 * @param writeToDesc
 */
function writeToDesc(version, writeToDesc){
    var filePath = json.location + '/package/' + version + ".txt";
    fs.writeFile(filePath, writeToDesc ,function (err) {
        if (err) throw err ;
        copyFile('res', json.location);
        copyFile('src', json.location);
    })
}

function updateVersion(versionCode){
    var exclude = [];
    //判断有没有res和src文件夹 拷贝一个
    if(process.platform !== 'win32') {
        if(!fs.existsSync(json.location + '/res')){
            console.log('目标没有res目录，拷贝中。。还需要在跑2次');
            copyFile('res', json.location);
            return;
        }
        if(!fs.existsSync(json.location + '/src')){
            console.log('目标没有src目录，拷贝中。。还需要在跑1次');
            copyFile('src', json.location);
            return;
        }
    }else{
        if(!fs.existsSync(json.location + '\\res')){
            console.log('目标没有res目录，拷贝中。。还需要在跑2次');
            copyFile('res', json.location);
            return;
        }
        if(!fs.existsSync(json.location + '\\src')){
            console.log('目标没有src目录，拷贝中。。还需要在跑1次');
            copyFile('src', json.location);
            return;
        }
    }

    var rv = new ResVerionGenerator('./res', json.location +  '/res', exclude);
    if (rv.make()) {
        //先去判断 var fileName
        var filePath = json.location + "/version.json";
        fs.readFile(filePath,"utf8",function (error,data){
            var jsonVersionData = JSON.parse(data);
            var jsonVersionCode = jsonVersionData.versionCode;
            if(versionCode){
                if(versionCode <= jsonVersionCode){
                    console.log('当前版本:' + jsonVersionCode + '大于' +'更新版本' + versionCode);
                    return;
                }else{
                    jsonVersionData.versionCode = versionCode;
                }
            }else{
                //没有传入版本, 根据内容+1
                jsonVersionData.versionCode ++;
            }
            //把101转换成 1.0.1
            var sureVersion = convertVersionStr(jsonVersionData.versionCode);
            var fileName = sureVersion + '.zip';
            rv.export(json.location + '/package/' + fileName);
            fs.writeFile(filePath,JSON.stringify(jsonVersionData, null, 4),function (err) {
                if (err) throw err ;
                //写入文件
                writeToVersion(sureVersion);
                writeToProject(sureVersion, fileName);
                writeToDesc(sureVersion, json.desc);
                //运行完毕更新之最新
                copyFile('res', json.location);
                copyFile('src', json.location);
            }) ;
        });
    }
}

updateVersion();