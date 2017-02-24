/**
 * Created by huangducai on 16/11/14.
 */
var ToolsHelper = require('../ToolsHelper.js');
var _ = require('underscore');

var allFiles = ToolsHelper.getFileList('../svn/99、versions/');
var not = [];
_.forEach(allFiles, function (item) {
    var reg = new RegExp(/[a-zA-Z0-9_.]+/);
    var list = reg.exec(item.name);
    if (list[0] != item.name) {
        not.push(item.path);
    }
});

if (not.length > 0) {
    throw new Error('不正确的文件名:' + JSON.stringify(not, null, 4));
} else {
    console.log('文件下文件名称,全部符合规范 /[a-zA-Z0-9_.]+/ ');
}
