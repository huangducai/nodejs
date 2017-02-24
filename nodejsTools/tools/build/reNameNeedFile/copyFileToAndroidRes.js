/**
 * Created by huangducai on 16/9/12.
 */
var fs = require('fs');
var _ = require('underscore');
//取最新的资源的地方
var resGenPath = '../svn/client_res';
//
var writePath = '../svn/androidRes/resCopy';
//输出
var hebingMulu = '../svn/androidRes/hebingMulu';
var yasuohou = '../svn/androidRes/yasuohou';

//var shangchuanmulu = '../svn/androidRes/androidyasuoRes';
//ios 压缩过后的目录
var iosResMulu = '../svn/iosRes';
var iosPvrOutDir = '../svn/resouter/res';
//输出目录 正确的res目录
var projectResDir = './res';

var child_process = require('child_process');
var os = require('os');
var iosFilterResArray = [
    'binzhong_bg14',
    'PE_23',
    "PE_stars",
    "PE_EdgeFoam",
    "zhaozi_00472",
    "zhaozi_00532",
    "Guangyun",
    "PE_Mask_475",
    "PE_mask_216",
    "PE_467",
    "Libao",
    "yun3",
    "PE_mask_216",
    "PE_EdgeFoam",
    "dianqiu",
    'login',
    'zh_cn_logo',
    'zh_cn_logo_bg',
    'common_bar07',
    'common_frame',
    'city_15',
    'PE_Jar',
    'PE_464',
    'PE_Mask_475',
    '//',
    'PE_',
    'PE_Mask_475',
    'daditubeijing.png',
    'dadituquyu2.png',
    'baohuzhao.png',
    'yangguang',
    'dengji',
    'commonFrame0',
    'chuan_0'
];

var ios_filiterDirList = [
    'reportServer/',
    'images/',
    'commonFrame/'
];


var androidFilterResArray = [
    'common_frame'
];

function removeDir(path, callBack) {
    if (!fs.existsSync(path)) {
        if (callBack) {
            callBack();
        }
        return;
    }

    var commond = 'rm -rf yyyy';
    commond = commond.replace('yyyy', path);
    var child = child_process.exec(commond);

    child.stdout.on('data', function (data) {
        console.log(data);
    });
    child.stderr.on('data', function (data) {
        console.log(data);
    });
    child.on('exit', function (code) {
        // console.log('生成Zip文件' + code);
        if (callBack) {
            callBack();
        }
    });
}


//md5
var crypto = require('crypto');
var async = require('async');


// 把 所有的资源 拷贝到一个副本

//遍历文件夹，获取所有文件夹里面的文件信息
function geFileList(path) {
    var filesList = [];
    readFile(path, filesList);
    return filesList;
}
//遍历读取文件
function readFile(path, filesList) {
    var files = fs.readdirSync(path);//需要用到同步读取
    files.forEach(walk);
    function walk(file) {
        var states = fs.statSync(path + '/' + file);
        if (states.isDirectory()) {
            readFile(path + '/' + file, filesList);
        }
        else {
            //创建一个对象保存信息
            var obj = new Object();
            obj.size = states.size;//文件大小，以字节为单位
            obj.name = file;//文件名
            obj.path = path + '/' + file; //文件绝对路径
            obj.pathOnly = path;
            obj.states = states;

            filesList.push(obj);
            // console.log(' states = ' + JSON.stringify(states, null, 4));
            //     "dev": 16777224,
            //     "mode": 33188,
            //     "nlink": 1,
            //     "uid": 503,
            //     "gid": 20,
            //     "rdev": 0,
            //     "blksize": 4096,
            //     "ino": 15409925,
            //     "size": 372,
            //     "blocks": 8,
            //     "atime": "2016-09-09T09:36:47.000Z",
            //     "mtime": "2016-07-29T02:19:10.000Z",
            //     "ctime": "2016-07-29T02:19:10.000Z",
            //     "birthtime": "2016-07-29T02:19:10.000Z"
        }
    }
}
/**
 * 仅仅是创建目录
 * @param path
 */
function createDirByPath(path) {
    path = path.split('/');
    var genPath = '';
    _.forEach(path, function (dirName) {
        genPath += dirName;
        if (!fs.existsSync(genPath)) {
            fs.mkdirSync(genPath);
        }
        genPath += '/';
    });
}
var currFileList = geFileList(resGenPath);

//拷贝资源过去
function copyFile(copyPath, writePath) {
    //    todo copy
    var readable = fs.createReadStream(copyPath);// 创建读取流
    var writable = fs.createWriteStream(writePath); // 创建写入流
    readable.pipe(writable); // 通过管道来传输流

    // fs.writeFileSync(writePath, fs.readFileSync(copyPath));

    console.log(copyPath + '--------->' + writePath);
}

function writeFile(path, fileName, content, cb) {
    createDirByPath(path);
    var allPath = path + '/' + fileName;
    fs.writeFile(allPath, content, function (err) {
        if (err) {
            console.log("fail " + err);
        }
        if (cb) {
            cb();
        }
    });
}

function getFileMd5(path, callBack) {
    if (!fs.existsSync(path)) {
        if (callBack) {
            callBack();
        }
        return;
    }
    var md5sum = crypto.createHash('md5');
    //todo 生成文件的md5 码
    var startTime = new Date().getTime();
    var stream = fs.createReadStream(path);
    stream.on('data', function (chunk) {
        md5sum.update(chunk);
    });

    stream.on('end', function () {
        var str = md5sum.digest('hex').toUpperCase();
        var endTime = new Date().getTime();
        // console.log('文件:' + path + ',MD5签名为:' + str + '.耗时:' + (endTime - startTime) / 1000.00 + "秒");
        if (callBack) {
            callBack(str);
        }
    });
}

function androidResCopy() {

    async.series({
        removeDir: function (callBack) {
            //removeDir(hebingMulu, callBack);
            callBack();
        },

        createNeedPath: function (callBack) {
            /**
             * 创建需要的目录
             */
            // createDirByPath(writePath);
            createDirByPath(hebingMulu);
            //createDirByPath(shangchuanmulu);
            createDirByPath(yasuohou);
            callBack();
        },

        copyChangedRes: function (copyChangedResCallBack) {
            var index = 0;
            async.eachSeries(currFileList, function (currFilePathObj, callBack) {
                index++;
                if (index >= currFileList.length) {
                    setTimeout(function () {
                        copyChangedResCallBack();
                    }, 1000);
                }
                // console.log('index111111 = ' + index + 'len = ' + currFileList.length);
                if (
                    !(currFilePathObj.name.toUpperCase().indexOf('.JPG') != -1 ||
                        currFilePathObj.name.toUpperCase().indexOf('.PNG') != -1
                    )
                ) {
                    if (callBack) {
                        callBack();
                    }
                    return;
                }

                // var currFilePath = currFilePathObj.pathOnly;
                //  createDirByPath(writePath + '/' + currFilePath.split(resGenPath)[1]);
                //保证所有的目录
                // var path = currFilePathObj.path.split(resGenPath)[1];//文件路径
                // var md5List = [];
                //var writeFilePath = writePath + '/' + path;
                var hebingMuluFile = hebingMulu + '/' + currFilePathObj.name;

                copyFile(currFilePathObj.path, hebingMuluFile);
                // copyFile(currFilePathObj.path, writeFilePath);
                if (callBack) {
                    callBack();
                }
                // if (fs.existsSync(writeFilePath)) {
                //     async.series({
                //         getWriteMd5: function (cb) {
                //             getFileMd5(writeFilePath, function (md5Str) {
                //                 md5List.push(md5Str);
                //                 cb();
                //             });
                //         },
                //         getCopyMd5: function (cb) {
                //             getFileMd5(currFilePathObj.path, function (md5Str) {
                //                 md5List.push(md5Str);
                //                 cb();
                //             });
                //         }
                //
                //     }, function () {
                //         //
                //         console.log(currFilePathObj.path + ' -----》' + writeFilePath);
                //         if (md5List[0] != md5List[1]) {
                //             // console.log('--------- 文件不一样的 --------');
                //             copyFile(currFilePathObj.path, writeFilePath);
                //         } else {
                //             // console.log('--------- 文件一样的 --------');
                //         }
                //         if (callBack) {
                //             callBack();
                //         }
                //     })
                // } else {
                //     copyFile(currFilePathObj.path, writeFilePath);
                //     if (callBack) {
                //         callBack();
                //     }
                // }
                // console.log('index = ' + index + 'len = ' + currFileList.length);
            });
        }
    })
}

/**
 * 将生成的资源 还原到工程中来
 */
function copyAndroidResToCode() {
    //var allFileList = geFileList(shangchuanmulu);
    //async.eachSeries(allFileList, function (fileObjPath, callBack) {
    //    createDirByPath(projectResDir + '/' + fileObjPath.pathOnly.split(shangchuanmulu)[1]);
    //
    //    copyFile(fileObjPath.path, projectResDir + fileObjPath.path.split(shangchuanmulu)[1]);
    //    callBack();
    //})

    var allFileList = geFileList(projectResDir);
    async.eachSeries(allFileList, function (fileObjPath, callBack) {
        var able = _.find(androidFilterResArray, function (name) {
            return fileObjPath.name.toUpperCase().indexOf(name.toUpperCase()) == 0;
        });
        if (!able) {
            if (fs.existsSync(yasuohou + '/' + fileObjPath.name)) {
                copyFile(yasuohou + '/' + fileObjPath.name, fileObjPath.path);
            }
            // //如果存在 .pkm 文件 优先拷贝 pkm
            //
            // // console.log('yasuohou' + yasuohou + '/' + fileObjPath.name + '.pkm');
            //
            // var yasuoPath = yasuohou + '/' + fileObjPath.name;
            // var yasuoPath1 = yasuoPath + '.pkm';
            // if (fs.existsSync(yasuoPath1)) {
            //     console.log('-----------存在 .png.pkm');// + '.pkm'
            //     copyFile(yasuohou + '/' + fileObjPath.name, fileObjPath.path);
            // } else if (fs.existsSync(yasuoPath)) {
            //
            // }
        } else {
            console.log("ios 剔除资源不拷贝, 路径:" + fileObjPath.path);
        }
        callBack();
    })
}


/**
 * 将生成的资源 还原到工程中来 只拷贝pkm
 */
function copyAndroidPkmToCode() {
    //var allFileList = geFileList(shangchuanmulu);
    //async.eachSeries(allFileList, function (fileObjPath, callBack) {
    //    createDirByPath(projectResDir + '/' + fileObjPath.pathOnly.split(shangchuanmulu)[1]);
    //
    //    copyFile(fileObjPath.path, projectResDir + fileObjPath.path.split(shangchuanmulu)[1]);
    //    callBack();
    //})
    var allFileList = geFileList(projectResDir);

    async.eachSeries(allFileList, function (fileObjPath, callBack) {
        var able = _.find(androidFilterResArray, function (name) {
            return fileObjPath.name.toUpperCase().indexOf(name.toUpperCase()) == 0;
        });

        if (!able) {
            var pngPKMName = fileObjPath.name.replace('.png', '.pkm');
            if (fs.existsSync(yasuohou + '/' + pngPKMName)) {
                copyFile(yasuohou + '/' + pngPKMName, fileObjPath.pathOnly + pngPKMName);
                fs.unlinkSync(fileObjPath.path);
            }

            // fs.unlinkSync(path)
            // //如果存在 .pkm 文件 优先拷贝 pkm
            //
            // // console.log('yasuohou' + yasuohou + '/' + fileObjPath.name + '.pkm');
            //
            // var yasuoPath = yasuohou + '/' + fileObjPath.name;
            // var yasuoPath1 = yasuoPath + '.pkm';
            // if (fs.existsSync(yasuoPath1)) {
            //     console.log('-----------存在 .png.pkm');// + '.pkm'
            //     copyFile(yasuohou + '/' + fileObjPath.name, fileObjPath.path);
            // } else if (fs.existsSync(yasuoPath)) {
            //
            // }
        } else {
            console.log("ios 剔除资源不拷贝, 路径:" + fileObjPath.path);
        }
        callBack();
    })
}


function copyIOSResToCode() {
    var allFileList = geFileList(projectResDir);
    async.eachSeries(allFileList, function (fileObjPath, callBack) {

        //为 true 不拷贝
        var able = _.find(iosFilterResArray, function (name) {
            return fileObjPath.name.toUpperCase().indexOf(name.toUpperCase()) != -1;
        });
        //为 true 不拷贝
        var able1 = _.find(ios_filiterDirList, function (filiterName) {
            return fileObjPath.path.indexOf(filiterName) != -1;//补考呗
        });

        if (!(able || able1)) {
            if (fs.existsSync(iosResMulu + '/' + fileObjPath.name)) {
                copyFile(iosResMulu + '/' + fileObjPath.name, fileObjPath.path);
            }
        } else {
            console.log("ios 剔除资源不拷贝, 路径:" + fileObjPath.path);
        }
        callBack();
    })
}

/**
 * ios 专用
 */
function copyPvrAndReNameToPng() {
    createDirByPath(iosResMulu);
    //把所有的压缩资源 还原到对应的文件夹 怎么还原 重新读取一次呗
    //对整个工程下得 所有的文件 进行一次copy
    var yuanlaiFileList = geFileList(iosPvrOutDir);
    async.eachSeries(yuanlaiFileList, function (resObjPath, callBack) {
        if (
            resObjPath.name.indexOf('.png') != -1 ||
            resObjPath.name.indexOf('.PNG') != -1 ||
            resObjPath.name.indexOf('.jpg') != -1 ||
            resObjPath.name.indexOf('.JPG') != -1 ||
            resObjPath.name.indexOf('.pvr.ccz') != -1 ||
            resObjPath.name.indexOf('.PVR.CCZ') != -1

        ) {
            //拷贝这些文件 到ios 的目录
            copyFile(resObjPath.path, iosResMulu + '/' + resObjPath.name.replace('.pvr.ccz', '.png'));
        }
        callBack();
    });
}


//node ***.js 1
if (process.argv[2]) {
    switch (process.argv[2]) {
        case '1':
            //输出所有的最新资源到 hebingMulu
            androidResCopy();
            break;
        case '3':
            //将美术压缩过后的资源突变 还原到项目中来
            copyAndroidResToCode();
            break;
        case  '4':
            //将 ios 压缩后的资源 还原到项目中来
            copyIOSResToCode();
            break;
        //拷贝生成好的pvr 到 var iosResMulu = '../svn/iosRes' 中
        case '5':
            copyPvrAndReNameToPng();
            break;
        case '6':
            console.log('---------->6');
            copyAndroidPkmToCode();

    }
}








