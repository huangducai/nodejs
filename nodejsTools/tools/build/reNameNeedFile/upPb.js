console.log('----------- upPb.js  不应该被执行 ------- ');
// /**
//  * Created by huangducai on 16/2/1.
//  */
//
// var child_precess = require('child_process');
// var util = require('util');
// var fs = require('fs');
// var os = require('os');
// function readFile(callBack) {
//     fs.readFile('./.git/HEAD', 'utf-8', function (err, result) {
//         console.log(JSON.stringify(result, null, 4));
//         if (callBack) {
//             callBack(result);
//         }
//     });
// }
//
// function chooseGrunt(currPath) {
//     var gitName = currPath.split('heads/')[1];
//     gitName = gitName.split(/[\n,/]/g)[0];
//     var command1 = '';
//     if (gitName == 'test') {
//         command1 = util.format('grunt pbTest');
//     } else {
//         command1 = util.format('grunt pbDevelop');
//     }
//     var child = child_precess.exec(command1, function (err, result) {
//         console.log('执行完毕' + err);
//         console.log('执行完毕::' + result);
//     });
//     console.log('当前系统名称 == %s , 执行命令 ＝＝ %s', os.platform(), command1);
//
//     child.stdout.on('data', function (data) {
//         console.log(data);
//     });
// }
//
// function buildOther() {
//     readFile(chooseGrunt);
//
// }
// buildOther();
//
//
