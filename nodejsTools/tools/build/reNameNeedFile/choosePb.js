console.log('-----choosePb.js 不应该出现----');
// /**
//  * Created by huangducai on 16/2/1.
//  */
//
// var child_precess = require('child_process');
// var util = require('util');
// var fs = require('fs');
//
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
//     console.log(' 执行命令pb ＝＝ %s', command1);
//
//     var child = child_precess.exec(command1, function (err, result) {
//         console.log('执行完毕' + err);
//         console.log('执行完毕::' + result);
//     });
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
// //var command1 = util.format('pwd && grunt resDevelop');// && git checkout master
// //var command1 = util.format("git branch --no-color 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/(\1)/'");
// //var command1 = util.format('echo $(current_branch)');// && git checkout master
