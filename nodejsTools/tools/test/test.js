// /**
//  * Created by huangducai on 16/11/9.
//  */
// var _ = require('underscore');
// var fs = require('fs');
// var util = require('util');
// var async = require('async');
//
// var ToolsHelper = require('../ToolsHelper.js');
//
// var jsonFile = ToolsHelper.getFileList('./res/config', '.json');
//
// function test() {
//     async.eachSeries(jsonFile, function (pathObj, cb) {
//         var data = fs.readFileSync(pathObj.path);
//         var str1 = "";//'global.ConfigJs = global.ConfigJs || {};\n' ;
//         str1 = str1 + util.format('ConfigJs["%s"] = ', pathObj.name.split('.')[0].toLowerCase());
//         fs.writeFileSync(pathObj.path.replace('.json', '.js'), str1 + data);
//         fs.unlinkSync(pathObj.path);
//         cb();
//     });
// }
//
// test();

//
// var crypto = require('crypto');
// var data = "156156165152165156156";
// console.log('Original cleartext: ' + data);
// var algorithm = 'aes-128-ecb';
// var key = '78541561566';
// var clearEncoding = 'utf8';
// var iv = "";
// //var cipherEncoding = 'hex';
// //If the next line is uncommented, the final cleartext is wrong.
// var cipherEncoding = 'base64';
// var cipher = crypto.createCipheriv(algorithm, key,iv);
//
// var cipherChunks = [];
// cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
// cipherChunks.push(cipher.final(cipherEncoding));
// console.log(cipherEncoding + ' ciphertext: ' + cipherChunks.join(''));
//
// var decipher = crypto.createDecipheriv(algorithm, key,iv);
// var plainChunks = [];
// for (var i = 0;i < cipherChunks.length;i++) {
//     plainChunks.push(decipher.update(cipherChunks[i], cipherEncoding, clearEncoding));
//
// }
// plainChunks.push(decipher.final(clearEncoding));
// console.log("UTF8 plaintext deciphered: " + plainChunks.join(''));



// var CryptoJS = require('crypto-js');
// var key = '123456798';
//
// var encrypt = CryptoJS.AES.encrypt('111111111', CryptoJS.enc.Utf8.parse(key), {
//     mode: CryptoJS.mode.ECB,
//     padding: CryptoJS.pad.Pkcs7
// });
//
// console.log("value: "+encrypt);
// // encrypt = 'djdlD+2FRBS2/Nh5bFcnZ4FzxacH8W6YPnUKgZTxHiFIfsIGRnDL9gI8FQVpuvsv';
// var decrypt = CryptoJS.AES.decrypt(encrypt, CryptoJS.enc.Utf8.parse(key), {
//     mode: CryptoJS.mode.ECB,
//     padding: CryptoJS.pad.Pkcs7
//
// });
//
// console.log("value: " + decrypt);


var plaintText = 'aaaaaaaaaaaaaaaa'; // 明文
var keyStr = 'bbbbbbbbbbbbbbbb'; // 一般key为一个字符串
var key = CryptoJS.enc.Utf8.parse(keyStr);

// 加密
var encryptedData = CryptoJS.AES.encrypt(plaintText, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
});
// var encryptedBase64Str = encryptedData.toString();
console.log('加密之后的数据是:' + encryptedData.toString());

var encryptedStr = encryptedData.ciphertext.toString();

console.log('ciphertext ====:' + encryptedStr);
var encryptedHexStr = CryptoJS.enc.Hex.parse(encryptedStr);


var encryptedBase64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
var decryptedData = CryptoJS.AES.decrypt(encryptedBase64Str, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
});

var decryptedStr = decryptedData.toString(CryptoJS.enc.Utf8);
console.log(decryptedStr);


