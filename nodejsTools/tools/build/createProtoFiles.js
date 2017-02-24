/**
 * Created by zxh on 13-11-11.
 */

//扫描Proto文件， 自动生成Proto对象

var fs = require("fs");
var util = require("util");

var rootPath =  "res/pb";

//要排除的写在这里
var excludes = [
    ".DS_Store"
];

function scar_dir(path, fileArray) {

    var files = fs.readdirSync(path);
    for(var i = 0; i < files.length; i++) {
        var fileName = files[i];

        if (excludes.indexOf(fileName) >= 0){
            files[i] = null;
            continue;
        }

        var fullPath = path + "/" + fileName;

        var status = fs.statSync(fullPath);
        if (status.isDirectory()) {

        } else if (fileName.lastIndexOf(".proto")){

            fileArray.push(fullPath);
            files[i] = null;
        }
    }

    for(var i = 0; i < files.length; i++) {
        if (files[i] == null) {
            continue;
        }
        fullPath = path + "/" + files[i];
        scar_dir(fullPath, fileArray);
    }
}

function getAllFiles(path) {
    var fileArray = [];
    scar_dir(path, fileArray);
    return fileArray;
}

function createPbObject(protoFullPath){
    //1.切除根路径
    var path = protoFullPath.substr(rootPath.length);

    //2.切除扩展名
    var pos = path.lastIndexOf('.');
    path = path.substr(0, pos);

    //3.替换‘/’为‘.’号
    path = path.replace(/\//g, '.');

    //4.取对象名字
    pos = path.lastIndexOf('.');
    var objectName = path.substr(pos + 1);

    return util.format("PB.%s = root%s;", objectName, path);

}

function createFile() {

    var arrayFiles = getAllFiles(rootPath);
    var fileName;

    //加载proto文件加载数据
    var loadPbArray = [];
    for(var i = 0; i < arrayFiles.length; i++) {
        fileName = arrayFiles[i];
        var text = util.format("    '%s',", fileName);
        loadPbArray.push(text);
    }

    var text = util.format("var protoFiles = [\n%s\n];\n", loadPbArray.join('\n'));
    text += 'module.exports = protoFiles;';
    //生成到文件中
    fs.writeFileSync("js/common/protoFiles.js", text, "utf8");
}

createFile();