var ToolsHelper = require("./ToolsHelper.js");
var _ = require("underscore");
var list = [];
_.forEach(ToolsHelper.getFileList("./test", ".js"), function(obj){
	list.push(obj.path);
})
ToolsHelper.writeFile("./test", "zhangsan.js", JSON.stringify(list, null, 4));