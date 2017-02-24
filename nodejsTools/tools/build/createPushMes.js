/**
 * Created by 040 on 2015/12/3.
 */
var fs = require("fs");
var util = require("util");

function readFile() {
    var data = fs.readFileSync("./res/pb/PushMsg.proto", 'utf8');
    var start = data.indexOf("//start") + 7;
    var end = data.indexOf("//end");
    return data.substring(start, end);
}

function updateStrForJson(data) {
    var jsonArrs = data.split("\n");
    var newJsonArr = [];
    jsonArrs.forEach(function (item, index) {
        item = item.replace(/[" "]/g, "");
        if (item.split(";") && item.split(";").length > 2) {
            newJsonArr.push(item.replace(/[\t, \r /]/g, ""));
        }
    });
    return newJsonArr;
}

function getProtoJson(newJsonArr) {
    var obj = {};
    newJsonArr.forEach(function (item) {
        var itemArr = item.split(";");
        var dataArr = itemArr[0].split("=");
        var key = dataArr[0].replace([/"/], "");
        obj[key] = "push_msg_" + dataArr[1];
    });

    return "\n var PushType = " + JSON.stringify(obj, null, 4) + ';\nmodule.exports = PushType;';
    // return "var Notifier = require('./Notifier.js');\n Notifier.PushType = " + JSON.stringify(obj, null, 4) + ';';
}

function createPushMes() {
    var newJsonArr = updateStrForJson(readFile());
    var content = getProtoJson(newJsonArr);
    fs.writeFileSync("./js/constant/newPushNotifier.js", content);
    console.log('写入到 newPushNotifier.js 完成');
}
createPushMes();
