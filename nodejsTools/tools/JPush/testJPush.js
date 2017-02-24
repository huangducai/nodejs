/**
 * Created by logan on 16/8/3.
 */
var JPush = require("jpush-sdk");
var client = JPush.buildClient('f07810143e8d5b9054ef7ab7', 'dea3d1b16c159cb458f2a977');
// client.push().setPlatform('ios')
//     .setAudience(JPush.ALL)
//     .setMessage('test logan')
//     .setNotification('Hi, JPush', JPush.ios('ios alert', '', 5, false))
//     .send(function(err, res) {
//         if (err) {
//             console.log(err.message);
//         } else {
//             console.log('Sendno: ' + res.sendno);
//             console.log('Msg_id: ' + res.msg_id);
//         }
//     });

client.push().setPlatform('ios')
    .setAudience(JPush.ALL)
    // .setAudience(JPush.alias('86d961bea41e498ba8851cd9b91b45b9'))
    .setNotification('H123dfgi, JPush', JPush.ios('123123', '', 0, false))
    .setMessage('msg content')
    .setOptions(null, 60, null, false)
    .send(function(err, res) {
        if (err) {
            console.log(err.message);
        } else {
            console.log('Sendno: ' + res.sendno);
            console.log('Msg_id: ' + res.msg_id);
        }
    });

