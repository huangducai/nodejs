var fs = require('fs');
var _ = require('underscore');
var files;
var scanPath = 'res'//注意斜杠

//过滤文件列表 用的是indexOf 检测
var filterList = [
    ".DS_Store",
    "/images/",
    "/pb/",
    "/reportServer/",
    // "/updateConfig/",
    '/shader/'
];
var needGroups = [
    'ccsRes',
    'config',
    'monster',
    'soldierStaticImg',
    'sound',
    "skeleton",
    'ui',
    'tiledMap',
    'icon',
    'CityMap',
    'tribe',
    'union',
    'commonFrame',
    'city_building_common',
    'city_building_tribe',
    'city_building_union',
    'effect',
    'updateConfig'
];
//遍历文件夹，获取所有文件夹里面的文件信息
function geFileList(path) {
    var filesList = [];
    readFile(path, filesList);
    return filesList;
}
//遍历读取文件
function readFile(path, filesList) {
    files = fs.readdirSync(path);//需要用到同步读取
    files.forEach(walk);
    function walk(file) {
        states = fs.statSync(path + '/' + file);
        if (states.isDirectory()) {
            readFile(path + '/' + file, filesList);
        }
        else {
            //创建一个对象保存信息
            var obj = new Object();
            obj.size = states.size;//文件大小，以字节为单位
            obj.name = file;//文件名
            obj.path = path + '/' + file; //文件绝对路径
            filesList.push(obj);
        }
    }
}

var filesList = geFileList(scanPath);
//过滤
filesList = _.filter(filesList, function (obj) {
    var flag = true;
    _.forEach(filterList, function (item) {
        if (obj.path.indexOf(item) != -1) {
            flag = false;
        }
    });
    return flag;
});

// 重置结构
var filePath = {};
var groups = {};
var chongfu = [];
filesList = _.forEach(filesList, function (obj) {
    var name = obj.name;
    var path = obj.path;
    if (name.indexOf('.png') != -1 ||
        name.indexOf('.jpg') != -1 ||
        name.indexOf('.pkm') != -1 ||
        name.indexOf('.pvr.ccz') != -1
    ) {
        name = name.split('.')[0];
    }
    name = name.replace(/[.]/g, '_');
    name = name.toUpperCase();
    if (!filePath[name]) {
        filePath[name] = path;
    } else {
        chongfu.push({1: filePath[name], 2: path});
    }
    //groups
    _.forEach(needGroups, function (dirName) {
        if (path.indexOf('/' + dirName + '/') != -1) {
            groups[dirName] = groups[dirName] || [];
            groups[dirName].push(name);
        }
    })
});
// console.log('res下文件重名：' + JSON.stringify(chongfu, null, 4));

var obj = {
    hashFile: filePath,
    groups: groups
};

//写入文件utf-8格式
function writeFile(fileName, data) {
    fs.writeFileSync(fileName, data, 'utf-8', complete);
    function complete() {
        console.log("文件生成成功");
    }
}

obj['aaaaa排除列表'] = filterList;
obj['生成文件夹下需要group的'] = needGroups;

var str = '\n // 该文件是res下所有文件 \n' + 'var res1 = ' + JSON.stringify(obj, null, 4) + ';\nmodule.exports = res1;';


writeFile("./js/constant/resources.js", str);