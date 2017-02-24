/**
 * Created by 051 on 2015/4/21.
 */
/**
 * Created by 051 on 2015/4/20.
 */

var fs = require("fs");
var util = require("util");

var async = require('async');

var jsonsArr = {};
jsonsArr.action = {};
jsonsArr.pushMsg = {};
//CODE码路径

var clientActionPath = "./res/pb/ClientAction.proto";
var pushMsgPath = "./res/pb/PushMsg.proto";


function updateStrForJson(data, obj) {
    /* //从｛ 开始截取 截取成JSON格式 { ** } */
    var jsonArrs = data.split("\n");
    var newJsonArr = [];
    jsonArrs.forEach(function (item, index) {
        item = item.replace(/[" "]/g, "");
        if (item.split(";") && item.split(";").length > 2) {
            newJsonArr.push(item.replace(/[\t, \r /]/g, ""));
        }
    });
    getProtoJson(newJsonArr, obj);
}

function getProtoJson(arr, obj) {
    arr.forEach(function (json) {
        var item = json.split(";");
        var number = item[0].replace(/[a-zA-Z_=]/g, "");
        if (item[2] === "null") {
            item[2] = null;
        }
        if (item[3] === "null") {
            item[3] = null;
        }
        obj[number.trim()] = {"name": item[1], "request": item[2], "response": item[3]};
    });
}
function getJsonToFile() {
    var returnPath = "./js/common/ProtoMap.js";
    console.log('写入文件中');
    var jsName = 'module.exports = ';
    fs.writeFile(returnPath, jsName + JSON.stringify(jsonsArr, null, 4) + ";", function (error) {
        if (error) {
            throw  error;
        }
    });
}

function setProtoMap() {
    async.series({
        readFile1: function (cb) {
            console.log('读取Action');
            fs.readFile(clientActionPath, "utf8", function (error, data) {
                if (error) {
                    throw error;
                }
                var start = data.indexOf("//start") + 7;
                var end = data.indexOf("//end");
                data = data.substring(start, end);
                updateStrForJson(data, jsonsArr.action);
                cb();
            });

        },
        readFile2: function (cb) {
            console.log('读取推送文件');
            fs.readFile(pushMsgPath, 'utf8', function (error, data) {
                if (error) {
                    throw error;
                }
                var start = data.indexOf("//start") + 7;
                var end = data.indexOf("//end");
                data = data.substring(start, end).replace(/[\t,\r /]/g, "");
                updateStrForJson(data, jsonsArr.pushMsg);
                cb();
            });
        },
        writeFile: function (cb) {
            getJsonToFile();
            cb();
        }
    }, function () {
        console.log('生成完成');
    });
}
setProtoMap();