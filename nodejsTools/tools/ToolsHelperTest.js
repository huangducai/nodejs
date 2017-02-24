/**
 * Created by chentao on 2016/10/10.
 */
var _ = require("underscore");
var ToolsHelper = require("./ToolsHelper.js");

console.log('这里是toolsHelper测试  require完成');

//1、项目根目录下创建路径
//ToolsHelper.createDirByPath('HelloWorld/hello');

//3、获取文件夹下的所有文件对象
//var filesArr = ToolsHelper.geFileList("UITools");

//2、将数据写入指定路径文件
//ToolsHelper.writeFile("HelloWorld/hello","tools.js", filesArr, function () {
//   console.log('successful');
//});
//
//if(filesArr){
//    _.forEach(filesArr, function (file) {
//        console.log(JSON.stringify(file,null,4));
//    });
//}

//4、文件流方式拷贝文件
//ToolsHelper.copyFileStream("UITools/resources.js","HelloWorld/hello/hello.js");

//5、同步方式拷贝文件
//ToolsHelper.copyFileSync("UITools/resources.js","HelloWorld/hello/hello1.js");
//6、获取获取相对路径
var from = "E:\\work1\\tok2\\svn\\androidRes";
var to = "E:\\work\\wow\\share";
var path = ToolsHelper.relative(from, to);
console.log('-----------------',path);