/**
 * Created by zxh on 1/14/15.
 */

var xlsx = require('node-xlsx');
var inquirer = require('inquirer');
var async      = require('async');
var fs         = require('fs');
var path       = require('path');
var util       = require('util');
var _          = require('underscore');

var exportPath = process.argv[2];
var xlsxConfigPath = process.argv[3];
if (!fs.existsSync(exportPath)) {
    console.log('导出路径不存在！');
    process.exit(0);
    return;
}


var prompt = [
    {
        type: "list",
        name: "type",
        message: "What do you want to do?",
        choices: [
            {name: "全部导入", value: true},
            {name: "选择导入", value: false}
        ]
    }
];

/**
 * 选择要导入的配置
 */
function selectxlsxConfig() {

    var dirList = _.without(fs.readdirSync(xlsxConfigPath),'exportConfig.bat','importConfig.bat','node_modules','.DS_Store', ".svn","exportConfig.js", "importConfig.js");

    inquirer.prompt(prompt, function(answer1) {

        var tables = dirList.map(function(item) {
            return {name: item, checked: answer1.type};
        });

        inquirer.prompt({message: "请选择要导入的配置项:", type: "checkbox", name:'tables', choices: tables}, function(answer2) {
            console.log(answer2.tables);
            saveExcelToJson(answer2.tables);
        });
    });
};

/**
 * 开始导入
 * @param excels
 */
function saveExcelToJson(excels) {


    async.eachSeries(excels, function(excel, cb) {
        var tableName =excel.split(".");
        var fileName = path.join(xlsxConfigPath, excel);
        var excelData = xlsx.parse(fileName);
        if (fileName.indexOf('text_') !== -1) {
            formatLangueData(tableName[0], excelData[1].data, cb);
        } else {
            formatExcelData(tableName[0], excelData[1].data, cb);
        }

    }, function() {
        console.log("导出完成");
    });

}

/**
 * 格式化语言数据
 */
function formatLangueData(tableName,excelData, cb) {
    var jsonData = {};
    excelData.shift();
    var key =  excelData.shift();

    for (var i = 0; i < excelData.length; i++) {
        var data = excelData[i];
        jsonData[data[0]] = {};
        for (var j = 0; j < data.length; j++) {
            //var obj = data[j];
            jsonData[data[0]] = data[1];
        }
    }

    console.log(jsonData);
    writeFileJson(tableName, jsonData, cb);
}

/**
 * 格式化数据为JSON格式
 * @param tableName
 * @param excelData
 * @param cb
 */
function formatExcelData(tableName,excelData, cb){
    var jsonData = {};
    excelData.shift();
    var key =  excelData.shift();

    for (var i = 0; i < excelData.length; i++) {
        var data = excelData[i];
        jsonData[data[0]] = {};
        for (var j = 0; j < data.length; j++) {
            var obj = data[j];
            jsonData[data[0]][key[j].toUpperCase()] = obj;
        }
    }

    console.log(jsonData);
    writeFileJson(tableName, jsonData, cb);
}

/**
 * 写入数据到JSON
 * @param tableName
 * @param jsonData
 * @param cb
 */
function writeFileJson(tableName, jsonData, cb){

    var fileName = path.join(exportPath, tableName + ".json");

    //生成到文件中
    fs.writeFileSync(fileName, JSON.stringify(jsonData, null, 4), "utf8");
    cb();
}
//开始执行
selectxlsxConfig();

