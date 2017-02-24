var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var async = require('async');

function getTextureConfigs(rootPath, subPath, extname) {
    var textureFiles = [];
    subPath = subPath || '';
    var files = fs.readdirSync(path.join(rootPath, subPath));
    files.forEach(function (file) {

        var stat = fs.statSync(path.join(rootPath, subPath, file));
        if (stat.isDirectory()) {
            var temp = getTextureConfigs(rootPath, path.join(subPath, file), extname);
            textureFiles = textureFiles.concat(temp);
        } else if (extname) {
            if (path.extname(file) === extname) {
                textureFiles.push(path.join(rootPath, subPath, file));
            }
        } else {
            textureFiles.push(path.join(rootPath, subPath, file));
        }
    }, this);
    return textureFiles;
}

var csdUsePath = {};

var fileList = getTextureConfigs('../svn/cocosStudio/ui/cocosstudio', null, '.csd');
// console.log(JSON.stringify(fileList, null, 4));
var chongfu = {};

_.forEach(fileList, function (value1) {
    var fileName1 = value1.split('/');
    fileName1 = fileName1[fileName1.length - 1];
    _.forEach(fileList, function (value2) {
        if (value2 != value1) {//相同的就算了 不比较
            var fileName2 = value2.split('/');
            fileName2 = fileName2[fileName2.length - 1];
            if (fileName2 == fileName1) {
                chongfu[fileName2] = chongfu[fileName2] || {};
                chongfu[fileName2][value2] = '';
                chongfu[fileName2][value1] = '';
            }
        }
    })
});

//上面是重复的。。。。
async.eachSeries(fileList, function (path, callBack) {
    require('xml2js').parseString(fs.readFileSync(path), function (err, json) {
        var fun = function resetJson(jsonObj) {
            for (var k in jsonObj) {
                var obj = jsonObj[k];
                if (obj && _.isObject(obj)) {
                    var imgPath = obj['Path'];//&& imgPath.indexOf('png') != -1
                    if (imgPath) {
                        var fileName2 = imgPath.split('/');
                        fileName2 = fileName2[fileName2.length - 1];//***.csd

                        var able = false;
                        for (var k in chongfu) {
                            for (var m in chongfu[k]) {
                                if (m.indexOf(fileName2) != -1) {
                                    able = true;
                                }
                            }
                        }

                        if (imgPath.indexOf('chuizi_01.csd') != -1) {
                            csdUsePath['chuizi_01'] = csdUsePath['chuizi_01'] || [];
                            csdUsePath['chuizi_01'].push(path);
                        }

                        if (able) {
                            csdUsePath[imgPath] = csdUsePath[imgPath] || [];
                            csdUsePath[imgPath].push(path);
                        }
                    }
                    fun(jsonObj[k]);
                }
            }
        };
        fun(json);
        if (callBack) {
            callBack();
        }
    })
}, function () {
    var writeStr =
        "//下面的文件是 某个重复名字的csd文件 在 cocosstudio中的应用地方\n"
        + JSON.stringify(csdUsePath, null, 4)
        + '\n\n//下面是同一个文件名在多处使用 如果下面有 上面没得 那么说明 该文件名称没有在cocosstudio文件中使用过 代码中是否使用过 未知 可以随便删除一个\n\n\n'
        + JSON.stringify(chongfu, null, 4);
    writeFile('./toolsOut/', 'csd使用的地方.json', writeStr);

});

function writeFile(path, fileName, content, cb) {
    var allPath = path + fileName;
    if (fs.existsSync(path)) {
        fs.writeFile(allPath, content, function (err) {
            if (err) {
                console.log("fail " + err);
            }
            if (cb) {
                cb();
            }
        });
    } else {
        fs.mkdirSync(path);
        writeFile(path, fileName, content, cb);
    }

}





