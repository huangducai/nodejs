/**
 * Created by zxh on 15/12/28.
 */

var fs = require('fs');
var util = require('util');
var child_process = require('child_process');


//升级版本
function upgradeVersion(version) {
    var array = version.split('.').map(function(str) { return parseInt(str); } );
    var flag = 0;
    for(var i = array.length - 1; i >= 0; i--) {

        var num = array[i];
        if (i === array.length - 1) {
            num++;
        }

        if (flag) {
            num += 1;
            flag = 0;
        }

        if (num > 9) {
            flag = 1;
            array[i] = 0;
        } else {
            array[i] = num;
            flag = 0;
        }
    }

    return array.join('.');
};

var json;
try {
    json = require('../../js/common/version.js');//fs.readFileSync('./js/common/version.js').toString();
} catch(e) {
    json = '{"codeVersion":"0.0.0.0" }';
}

json.codeVersion = upgradeVersion(json.codeVersion);
json.isUpdate = process.argv[2] ? true : false;


var jsonstr = 'module.exports = ' + JSON.stringify(json, null, 4);
console.log(jsonstr);
fs.writeFileSync('./js/common/version.js', jsonstr, 'utf8');

var isDebug = process.argv[3] || '';
//var commandStr = util.format('browserify js/app.js %s > app-all.js', isDebug)
var commandStr = util.format('webpack %s js/app.js app-all.js', isDebug)
console.log('开始编译代码');
child_process.exec(commandStr, function(error) {
    console.log('编译完成');
    if (!error) {
        child_process.exec('cp app-all.js ./src/');
    }

});

