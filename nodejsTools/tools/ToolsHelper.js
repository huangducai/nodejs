/**
 * Created by huangducai on 16/10/10.
 */
var _ = require('underscore');
var fs = require('fs');
var util = require('util');
//var xml2js = require('xml2js');
var Plist = require('plist');
var async = require('async');
var Path = require('path');
// var sep = Path.sep;
//md5
var crypto = require('crypto');


var ToolsHelper = {
    /**
     * 创建路径 不包含文件名称
     * @param path
     */
    createDirByPath: function (path) {
        if (!path) {
            return;
        }
        path = path.split('/');
        var genPath = '';
        _.forEach(path, function (dirName) {
            genPath += dirName;
            if (!fs.existsSync(genPath)) {
                fs.mkdirSync(genPath);
            }
            genPath += '/';
        });
    },
    /**
     * 写入一个文件
     * @param path
     * @param fileName
     * @param content
     * @param cb
     */
    writeFile: function (path, fileName, content, cb) {
        if (!path || !fileName) {
            throw  new Error('路径或者 文件名不存在');
            cb && cb();
            return;
        }
        content = content || '';
        this.createDirByPath(path);

        var allPath = Path.join(path, fileName);
        fs.writeFile(allPath, content, function (err) {
            if (err) {
                console.log("fail " + err);
            } else {
                //console.log("写入文件ok");
            }
            cb && cb();
        });
    },

    /**
     * 获取文件夹下面的所有文件对象
     * @param path
     * @param filiter 可有可无 给了就是只过滤出包含的文件 一般给后缀名
     * @returns {Array}
     */
    getFileList: function (path, filiter) {
        var filesList = [], self = this;
        // filiter 初始化
        if (filiter) {
            if (_.isString(filiter)) {
                filiter = [filiter];
            }
            if (!_.isArray(filiter)) {
                filiter = null;
            }
        }

        if (!filiter) {
            this.readFile(path, filesList, null);
        } else {
            _.forEach(filiter, function (item) {
                // console.log('item == |||' + item + '|||');
                var list = [];
                self.readFile(path, list, item);
                // console.log('list.len == ' + list.length);
                filesList = filesList.concat(list);
            });
        }
        return filesList;
    },

    /**
     * 获取所有的文件夹
     */
    getAllDirList: function (path) {
        var list = [];
        this.readFile(path, null, null, list);
        return list;
    },

    getFileStates: function (fullPath) {
        return fs.statSync(fullPath);

        // return obj;
    },

    //遍历读取文件
    readFile: function (path, filesList, filiter, dirList) {
        var files = fs.readdirSync(path);//需要用到同步读取
        var self = this;
        files.forEach(walk);
        function walk(file) {
            var fullPath = path + '/' + file;
            var states = self.getFileStates(fullPath);

            var obj = new Object();
            obj.size = states.size;//文件大小，以字节为单位
            obj.name = file;//文件名
            obj.pathOnly = path; //文件绝对路径
            obj.path = fullPath; //文件绝对路径
            obj.states = states;

            if (states.isDirectory()) {
                obj.desc = 'this is a dir';
                dirList && dirList.push(obj);
                self.readFile(fullPath, filesList, filiter, dirList);
            }
            else {
                if (fullPath.indexOf('.DS_Store') == -1 && (!filiter || fullPath.indexOf(filiter) != -1)) {
                    obj.desc = 'this is a file';
                    filesList && filesList.push(obj);
                }
            }
        }
    },

    /**
     * 拷贝文件 文件流方式 适合小内存使用
     * @param copyPath
     * @param writePath
     */
    copyFileStream: function (copyPath, writePath, isShowLog) {
        //    todo copy
        var readable = fs.createReadStream(copyPath);// 创建读取流
        var writable = fs.createWriteStream(writePath); // 创建写入流
        readable.pipe(writable); // 通过管道来传输流
        // fs.writeFileSync(writePath, fs.readFileSync(copyPath));
        isShowLog && console.log(copyPath + '--------->' + writePath);
    },

    /**
     * 适合操作少量文件的时候使用
     */
    copyFileSync: function (copyPath, writePath, isShowLog) {
        var pathOnly = writePath.substring(0, writePath.lastIndexOf('/'));
        if (fs.existsSync(copyPath) && fs.existsSync(writePath)) {
            var obj1 = this.getFileStates(copyPath);
            var obj2 = this.getFileStates(writePath);
            if (JSON.stringify(obj1) == JSON.stringify(obj2)) {
                console.log('----两个相等:' + copyPath + '\n' + writePath);
                return;
            }
        }
        isShowLog && console.log(copyPath + '--------->' + writePath);
        this.createDirByPath(pathOnly);
        var str1 = fs.readFileSync(copyPath);
        fs.writeFileSync(writePath, str1);
    },
    /**
     * 获取单个文件的md5码
     * @param path
     * @param callBack
     */
    getFileMd5: function (path, callBack) {
        if (!fs.existsSync(path)) {
            console.log('path 不存在', +path);
            if (callBack) {
                callBack();
            }
            return;
        }
        var md5sum = crypto.createHash('md5');
        var stream = fs.createReadStream(path);
        stream.on('data', function (chunk) {
            md5sum.update(chunk);
        });

        stream.on('end', function () {
            var str = md5sum.digest('hex').toUpperCase();
            if (callBack) {
                // console.log('md5 = ' + str);
                callBack(str);
            }
        });
    },
    /**
     * 求一个目录相对另外一个目录的路径
     * @param from
     * @param to
     * @returns {*|{>,  , +, ~}}
     */
    relative: function (from, to) {
        //todo 兼容文件
        return Path.relative(from, to);
    },

    /**
     * 拷贝指定文件夹的文件 到 写入目录
     * @param copyPath 拷贝路径 文件夹
     * @param filiter  相似的文件 一般给后缀名
     * @param writePath  写入路径
     * @param notCopyList  不拷贝的文件数组
     */
    copyFileToDir: function (copyPath, filiter, writePath, notCopyList) {
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
    },
    /**
     *
     * @param copyPath  拷贝路径
     * @param writePath 写入路径
     * @param filiterList  过滤列表 数组 或者字符串 或者不给
     */
    copyDir: function (copyPath, writePath, filiterList) {
        console.log(copyPath + '--------->' + writePath);
        if (_.isString(filiterList)) {
            filiterList = [filiterList];
        }

        if (!_.isArray(filiterList)) {
            filiterList = [];
        }

        var fileList = this.getFileList(copyPath);
        // console.log('fileList.len1:' + fileList.length);
        fileList = _.filter(fileList, function (item) {
            var flag = true;
            _.forEach(filiterList, function (pathStr) {
                if (item.path.indexOf(pathStr) != -1) {
                    // console.log('pathStr = ' + pathStr);
                    flag = false;
                }
            });
            return flag;
        });
        // console.log('fileList.len2:' + fileList.length);

        var self = this;

        _.forEach(fileList, function (objPath) {
            var lastPath = objPath.path.split(copyPath)[1];
            self.copyFileSync(objPath.path, Path.join(writePath, lastPath));
        })
    },

    /**
     * 删除文件夹
     * @param path
     */
    remvoeDirSync: function (path) {
        var files = [];
        var self = this;
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    self.remvoeDirSync(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    },
    /**
     * 读取合图文件
     * @param PlistPath
     * @returns {Array}
     */
    readPlistFile: function (PlistPath) {

        var allFile = [];
        var result = fs.readFileSync(PlistPath, 'utf-8');
        var data = Plist.parse(result);
        var jsonFile = data['frames'];
        if (jsonFile) {
            for (var k in jsonFile) {
                allFile.push(k);
            }
        }
        return allFile;
    },

    excCommond: function (command, isShowLog, callBack) {
        if (_.isString(command)) {
            command = [command];
        }
        var isCallBack = true;
        if (!_.isArray(command)) {
            callBack && callBack();
            return;
        }
        var child_process = require('child_process');
        var child = child_process.exec(command.join('&&'));
        child.stdout.on('data', function (data) {
            isShowLog && console.log(data);
        });

        child.stderr.on('data', function (data) {
            isShowLog && console.log(data);
            isCallBack = false;
        });

        child.on('exit', function (code) {
            console.log('------------ 执行完毕' + code);
            isCallBack && callBack && callBack();
        });
    }
};


module.exports = ToolsHelper;


