#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var util = require('util');
var _ = require('underscore');
var Config = require('./config');
var crc = require('crc');
require('shelljs/global');


//-----------------------------------------

var argv = require('yargs')
    .option('p', {
        alias: 'projectPath',
        demand: true,
        describe: '工程路径',
        type: 'string'
    })
    .option('u', {
        alias: 'updatePath',
        demand: true,
        describe: '客户端下载更新路径',
        type: 'string'
    })
    .option('o', {
        alias: 'option',
        describe: '功能选项',
        default: 'update',
        choices: ['init', 'update']
    })
    .option('a', {
        alias: 'address',
        describe: '更新连接根地址 如:10.2.19.117:7777/wow',
        default: '127.0.0.1:7777',
        type: 'string'
    })
    .option('jscode', {
        describe: '选择打包的js代码格式',
        default: 'js',
        choices: ['js', 'jsc']
    })
    .option('pretend', {
        describe: '模拟生成更新包,打印差异文件列表'
    })
    .option('sync', {
        describe: '生成更新包后, 同步最新文件到更新目录',
        default: true,
        type: 'bool'
    })
    .argv;
/**
 *
 * @param projectPath   工程路径: 最新资源
 * @param upatePath     升级路径: 旧版资源
 * @constructor
 */
function AssetsPackage(projectPath, updatePath) {
    this.projectPath = projectPath;
    this.updatePath = updatePath;
    this.excludes = ['.DS_Store'];
}

AssetsPackage.prototype = {

    /**
     * 创建文件快照对象
     * @param rootPath
     * @param fileName
     * @returns {{fileName: *, stat}}
     */
    createFileSnap: function (rootPath, fileName) {
        var fullPath = path.join(rootPath, fileName);
        var crc32 = crc.crc32(fs.readFileSync(fullPath));
        return {fileName: fileName, crc32: crc32};
    },

    /**
     * 获取路径快照（递归）
     * @param rootPath
     * @param subPath
     */
    getPathSnaps: function (rootPath, subPath) {
        var snaps = {};
        var subPath = subPath || '';
        var basePath = path.join(rootPath, subPath);
        if (!fs.existsSync(basePath)) {
            return snaps;
        }

        var files = fs.readdirSync(basePath).filter(function (file) {
            return this.excludes.indexOf(file) === -1;
        }, this);


        files.forEach(function (file) {
            var stat = fs.statSync(path.join(rootPath, subPath, file));
            if (stat.isDirectory()) {
                var temp = this.getPathSnaps(rootPath, path.join(subPath, file));
                _.extend(snaps, temp);
            } else {
                var snap = this.createFileSnap(rootPath, path.join(subPath, file));
                snaps[snap.fileName] = snap;
            }
        }, this);
        return snaps;
    },

    /**
     * 对比新旧快照集,返回差异
     * @param newSnaps
     * @param oldSnaps
     * @returns {*}
     */
    diff: function (newSnaps, oldSnaps) {

        var diffSnaps = _.filter(newSnaps, function (newSnap, fileName) {
            var oldSnap = oldSnaps[fileName];
            if (!oldSnap) {
                return true;
            }
            return newSnap.crc32 !== oldSnap.crc32;
        });

        return diffSnaps;
    },

    /**
     * 生成差异文件
     * @param subpaths
     * @returns {Array}
     */
    make: function (subpaths) {
        if (_.isString(subpaths)) {
            subpaths = [subpaths];
        }

        var diffFiles = [];
        subpaths.forEach(function (subpath) {
            var updatePath = subpath, sourcePath = subpath;
            if (_.isObject(subpath)) {
                updatePath = subpath.updatePath;
                sourcePath = subpath.sourcePath;
            }
            var newSnaps = this.getPathSnaps(path.join(this.projectPath, sourcePath));
            var oldSnaps = this.getPathSnaps(path.join(this.updatePath, updatePath));

            console.log('sourcePath = %s', sourcePath);
            console.log('updatePath = %s', updatePath);

            var diffSnaps = this.diff(newSnaps, oldSnaps);
            diffFiles = diffFiles.concat(diffSnaps.map(function (snap) {
                return path.join(this.projectPath, sourcePath, snap.fileName);
            }, this));
        }, this);

        this.diffFiles = diffFiles;
        return diffFiles;
    },

    /**
     * 获取近的版本号（在工程目录中获取）
     */
    getNewVersion: function () {
        var gameConfigFile = path.join(this.projectPath, 'gameconfig.js');
        var array = fs.readFileSync(gameConfigFile, 'utf8').split('\n');
        var verLine = _.find(array, function (line) {
            return line.indexOf('version') !== -1;
        });
        //使用正则表达示,提取版本号
        var pattern = /[\d\.]+/;
        array = pattern.exec(verLine);
        return array[0];
    },

    /**
     * 导出名字
     * @param fileName
     */
    exportPackage: function (fileName) {
        var dirname = path.dirname(fileName);
        if (!fs.existsSync(dirname)) {
            mkdir(dirname);
        }

        if (fs.existsSync(fileName)) {
            throw new Error('文件:' + fileName + '已经存在, 请检查后再试');
        }
        // console.log('this.diffFiles = %s', JSON.stringify(this.diffFiles, null, 4));
        var command = util.format('zip -r %s %s', fileName, this.diffFiles.join(' '));
        var ret = exec(command);
        if (ret.code !== 0) {
            throw new Error('zip压缩失败, 请检查!');
        }
    },

    /**
     * 生成代码
     * @param jscode
     * @returns {Array.<*>|*}
     */
    makeSrcFile: function (jscode) {
        var srcPath = path.join(this.projectPath, 'src');
        var jsFile = path.join(srcPath, 'app-all.js');
        var jscFile = path.join(srcPath, 'app-all.jsc');


        if (jscode === 'js') {
            exec('webpack js/app.js ./src/app-all.js');
            this.diffFiles.push(jsFile);
        } else {
            //编译生成jsc文件
            exec('webpack js/app.js ./src/app-all.js');
            var command = util.format('cocos jscompile -s %s -d %s', srcPath, srcPath);
            exec(command);
            this.diffFiles.push(jscFile);
        }

        return this.diffFiles;
    }
};

/**
 * 初始化更新目录
 */
function init() {

    if (!argv.address) {
        console.error('错误: 初始化目录,请使用 -a 参数设置客户端更新地址');
        return;
    }

    var projectResPath = path.join(argv.projectPath, 'res');
    var projectScriptPath = path.join(argv.projectPath, 'frameworks/cocos2d-x/cocos/scripting/js-bindings/script');
    if (!fs.existsSync(projectResPath)) {
        console.error('错误: 工程目录不存在:', projectResPath);
        return;
    }

    var updatePath = argv.updatePath;
    if (!fs.existsSync(updatePath)) {
        mkdir('-p', updatePath);
    }

    var config = new Config(updatePath);
    config.newManifest(argv.address);

    //复制资源目录
    var rsyncCmdRes = util.format('rsync -uvr --delete %s %s', projectResPath, updatePath);
    exec(rsyncCmdRes);
    //todo 拷贝 scripting
    var rsyncCmdScript = util.format('rsync -uvr --delete %s %s', projectScriptPath, updatePath);
    exec(rsyncCmdScript);
}

function update() {

    //todo 拷贝 scripting

    var scriptPath = 'frameworks/cocos2d-x/cocos/scripting/js-bindings/script';
    var projectScriptPath = path.join(argv.projectPath, scriptPath);

    if (argv.jscode == 'jsc') {
        var command = util.format('cocos jscompile -s %s -d %s', projectScriptPath, path.join(argv.projectPath, 'script'));
        exec(command);
    } else {
        var rsyncCmdScript = util.format('rsync -uvr --delete %s %s', projectScriptPath, argv.projectPath);
        exec(rsyncCmdScript);
    }

    //检查配置文件
    var config = new Config(argv.updatePath);
    var ret = config.isValid();
    if (ret.error) {
        console.error(ret.msg);
        return;
    }

    var assetsPackage = new AssetsPackage(argv.projectPath, argv.updatePath);
    var newVersion = assetsPackage.getNewVersion();
    var lastGroup = config.getLastGroup();
    var lastUpdateVersion = lastGroup[1];
    var index = parseInt(lastGroup[0]) + 1;
    var packageName = util.format('[%s]%s-%s.zip', index, lastUpdateVersion, newVersion);
    console.log('更新包文件名:', packageName);

    //比较res目录
    var fileArray = assetsPackage.make(['res', 'script']);
    //根据jscode生成src文件: jsc 或 js
    assetsPackage.makeSrcFile(argv.jscode);

    var exportFile = path.join(argv.updatePath, 'package', packageName);
    console.log('-------对比出以下更新文件-------');
    console.log(fileArray);
    console.log('文件数量: %d', fileArray.length);
    console.log('生成更新名文件: %s', exportFile);

    //测试模式
    if (argv.pretend) {
        return;
    }


    try {
        console.log('更新配置文件');
        config.addGroupVersion(newVersion, packageName);
        console.log('开始压缩...');
        assetsPackage.exportPackage(exportFile);
    } catch (e) {
        //删除生成的更新包文件
        console.error(e.message);
        if (fs.existsSync(exportFile)) {
            rm(exportFile);
        }
        return;
    }

    if (argv.address) {
        config.setAdress(argv.address);
    }

    config.save();

    //同步差异文件更新目录
    if (argv.sync) {
        console.log('更新包生成完成, 同步最新文件到更新目录...');
        var projectResPath = path.join(argv.projectPath, 'res');
        var rsyncCmd = util.format('rsync -uvr %s %s', projectResPath, argv.updatePath);
        exec(rsyncCmd);

        //todo 拷贝 scripting
        var projectScriptPath = path.join(argv.projectPath, 'script');
        var rsyncCmdScript = util.format('rsync -uvr --delete %s %s', projectScriptPath, argv.updatePath);
        exec(rsyncCmdScript);
    }

}

function clearup() {
    var jscFile = path.join(argv.projectPath, 'src', 'app-all.jsc');
    if (fs.existsSync(jscFile)) {
        rm(jscFile);
        console.log('清除文件:', jscFile);
    }

    jscFile = path.join(argv.projectPath, 'script');
    if (fs.existsSync(jscFile)) {
        rm('-rf', jscFile);
        console.log('清除文件:', jscFile);
    }
}

function main() {

    switch (argv.o) {
        case 'init':
            init();
            break;
        case 'update':
            try {
                update();
            } catch (e) {

            }
            clearup();
            break;
    }
}

main();

