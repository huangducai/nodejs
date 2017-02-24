/**
 * Created by huangducai on 16/10/12.
 */
var data = {
    androidFliterResList: [
        'slide_btn01.png',
        'apple45.png',///测试使用的
        'client_clipping_iconbg.png',
        'client_jianzhuzhezhao01.png',
        'client_jianzhuzhezhao02.png',
        //正式资源
        'reportServer/',
        'images/',
        'Effice/',
        'KingdomMap/',
        'Default/',
        'CommonFrame/',
        //单图写在下面
        'wgdt.png',
        'client_foot.png'

    ],
    iosFliterResList: [
        //正式资源
        'reportServer/',
        'images/',
        'Effice/',
        'Defult/',
        'KingdomMap/',
        'CommonFrame/',
        // '/Icon/',
        'CommonImage/',
        'main_frame01_loding02',
        'main_frame01_loding01',
        'zh_cn_logo',
        'CommonFrame/',
        //'CityMap_Common0.png',///测试使用的
        //单图写在下面
    ],

    /**
     *
     */
    iosNotYasuo:[
        'main_vip_frame'
    ]
};
//安卓 和 ios 的不需要压缩的资源 写在这里

//文件请在后面加 "/" 尽量避免耦合  //单文件 请写全名  比如 a文件夹   那么就是 "a/" 有多个a文件夹 指明 是那个文件夹下的

module.exports = data;
