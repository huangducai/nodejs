
/**
 * Created by zxh on 1/14/15.
 */

var xlsx = require('node-xlsx');
var inquirer = require('inquirer');
var mysql      = require('mysql');
var async      = require('async');
var fs         = require('fs');
var path       = require('path');
var util       = require('util');
var _          = require('underscore');
console.log("---------正在连接数据库---------------");
var connection = mysql.createConnection({
    host     : '10.2.19.254',
    user     : 'dogame',
    password : 'gamework',
    database : 'wow'
});

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

var errorFiles = [];

var xlsxConfigPath = process.argv[2];
if (!fs.existsSync(xlsxConfigPath) /*|| !fs.existsSync(jsonConfigPath)*/) {
    console.log("Excel配置目录或json输出目录不存在!");
    process.exit(1);
}



connection.connect(function(err) {
    if (err) {
        console.log('连接数据库失败!');
        return;
    }

    var dirList = _.without(fs.readdirSync(xlsxConfigPath),'exportConfig.bat','importConfig.bat','node_modules','.DS_Store', ".svn","exportConfig.js", "importConfig.js");

        inquirer.prompt(prompt, function(answer1) {

            var tables = dirList.map(function(item) {
                return {name: item, checked: answer1.type};
            });

            inquirer.prompt({message: "请选择要导入的配置项:", type: "checkbox", name:'tables', choices: tables}, function(answer2) {
                //console.log(answer2);
                dropTables(answer2.tables);
            });
        });

});

//删除选择导入的表
function dropTables(tables){
    connection.query('show table status',function(err, rows) {
        if (err) throw err;

        //判断选择的表才能被删除
        var names = "";
        rows.map(function(item) {

            for (var i = 0; i < tables.length; i++) {
                var obj = tables[i];
                var tablesNames = obj.split(".");
                if(item.Name === tablesNames[0]){
                    names += (item.Name + ",");
                    break;
                }
            }
        });

        if(names === ""){
            importTables(tables);
            return;
        }
        names = names.substring(0,names.length - 1);

        var sql = util.format('drop table %s ;', names);

        connection.query(sql ,function(err, rows1) {
            if (err) throw err;
            console.log("删除表成功");
            importTables(tables);
        });
    });
}

/**
 * 创建表并且同时导入数据
 * @param tables
 */
function importTables(tables) {

    async.eachSeries(tables, function(name, cb) {
        // importExcelToTabel(name, cb);
        createTabel(name, cb);
    }, function() {
        connection.end();
        console.log("----------导入完成-------");
        errorFiles.forEach(function(s) {
            console.log(s);
        });

    });
}

/**
 * 创建表
 * @param tableName
 * @param cb
 */
function createTabel(tableName, cb){

    console.log("开始导入" + tableName);
    var fileName =  path.join(xlsxConfigPath, tableName);
    var name = tableName.split(".");
    var obj = xlsx.parse(fileName);
    var dateTypes = obj[1].data.shift();
    var keys = obj[1].data.shift();


    var parameters = "";
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var type = dateTypes[i];
        if(type === "char"){
            type = "char(255)" 
        }
        parameters += (key + " " + type + " " + " not null,");
    }
    parameters = parameters.substring(0,parameters.length - 1);

    var sql = util.format('create table %s ( %s );', name[0], parameters);

    connection.query(sql,function(err, rows) {
        if (err) throw err;
        console.log("创建表成功--->" + name[0]);
        //cb()
        importExcelToTabel(name[0], obj[1].data,cb, dateTypes)
    });
}

/**
 * 导入excel数据到mysql
 * @param tableName
 * @param data
 * @param cb
 */
function importExcelToTabel(tableName, data, cb, dateTypes) {

    var sql = 'select * from '+ tableName +' limit 1';
    connection.query(sql, function(err, rows, fields) {
        if (err) {
            console.log('打开数据表失败');
            cb();
            return;
        }


        var row = "";
        for (var i = 0; i < data.length; i++) {
            var rowData = data[i];
            if(rowData.length === 0){
                console.log(tableName + "有空数据退出");
                break;
            }
            var str = "(";
            for (var j = 0; j < rowData.length; j++) {
                var obj = rowData[j];

                if(obj.match && obj.match("[|:]") || dateTypes[j] === "char" || dateTypes[j] === "text"){
                    obj = "\'" + obj + "\'"
                }

                str += (obj + ",")
            }
            str = str.substring(0,str.length - 1) + ")";
            row += (str + ",");
        }
        row = row.substring(0,row.length - 1);

        var sql = util.format('insert into %s values %s', tableName, row);


        connection.query(sql, function(err) {
            if (err) console.log(err);
            console.log("导入数据成功--->" + tableName);
            cb();
        });
    });
};