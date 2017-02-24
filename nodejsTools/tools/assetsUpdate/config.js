/**
 * Created by zxh on 16/7/7.
 */
var fs = require('fs');
var _ = require('underscore');
var path = require('path');
var shelljs = require('shelljs');
var util = require('util');

//更新配置 默认版本 都是0.0.0.0.0//
var UPDATE_CONFIG = {
    "packageUrl": "http://address/package",
    "remoteManifestUrl": "http://address/project.manifest",
    "remoteVersionUrl": "http://address/version.manifest",
    "engineVersion": "3.8.1",
    "version": "0.0.0.0.0",
    "groupVersions": {},

    "assets": {},

    "searchPaths": []
};

var PROJECT_MANIFEST = 'project.manifest';
var VERSION_MANIFEST = 'version.manifest';

function Config(workPath) {
    this.workPath = workPath;
    this.proFileName = path.join(this.workPath, PROJECT_MANIFEST);
    this.verFileName = path.join(this.workPath, VERSION_MANIFEST);

    this.proManifest = null;
    this.verManifest = null;

    if (fs.existsSync(this.proFileName)) {
        this.proManifest = JSON.parse(fs.readFileSync(this.proFileName));
    }

    if (fs.existsSync(this.verFileName)) {
        this.verManifest = JSON.parse(fs.readFileSync(this.verFileName));
    }

}

Config.prototype = {

    setAdress: function (url) {
        this.proManifest.packageUrl = util.format('http://%s/package', url);
        this.proManifest.remoteManifestUrl = util.format('http://%s/project.manifest', url);
        this.proManifest.remoteVersionUrl = util.format('http://%s/version.manifest', url);

        this.verManifest.packageUrl = util.format('http://%s/package', url);
        this.verManifest.remoteManifestUrl = util.format('http://%s/project.manifest', url);
        this.verManifest.remoteVersionUrl = util.format('http://%s/version.manifest', url);
    },

    isValid: function () {

        if (!this.verManifest) {
            return {
                error: -1,
                msg: util.format('配置文件:%s不存在', this.verFileName)
            }
        }

        if (!this.proManifest) {
            return {
                error: -2,
                msg: util.format('配置文件:%s不存在', this.proFileName)
            }
        }


        var proManifest = _.omit(this.proManifest, 'assets', 'searchPaths');
        ret = _.isEqual(this.verManifest, proManifest);
        if (!ret) {
            return {
                error: -3,
                msg: util.format('配置文件【%s】与【%s】内容不匹配', this.verFileName, this.proFileName)
            }
        } else {
            return {
                error: null,
                msg: ''
            }
        }
    },
    /**
     * 生成 project.manifest 与 version.manifest
     * @param savePath
     * @param address
     */
    newManifest: function (address) {
        var str = JSON.stringify(UPDATE_CONFIG, null, 2);
        str = str.replace(/address/g, address);

        if (!fs.existsSync(this.workPath)) {
            shelljs.mkdir('-p', this.workPath);
        }

        this.proManifest = JSON.parse(str);
        fs.writeFileSync(this.proFileName, str, 'utf8');

        this.verManifest = _.omit(this.proManifest, 'assets', 'searchPaths');
        fs.writeFileSync(this.verFileName, JSON.stringify(this.verManifest, null, 2), 'utf8');
    },

    /**
     * 获取版本号
     * @param workPath
     */
    getLastGroup: function () {
        if (_.isEmpty(this.verManifest.groupVersions)) {
            return [0, this.verManifest.version];
        }

        var array = _.pairs(this.verManifest.groupVersions);
        return _.last(array);
    },

    /**
     * 添加版本
     */
    addGroupVersion: function (version, updateFile) {
        var lastGroup = this.getLastGroup();
        if (lastGroup[1] === version) {
            var msg = util.format('version:%s 已经存在, 请重新确认版本号', version);
            throw new Error(msg);
        }

        var groupVersions = this.verManifest.groupVersions;
        var groupKey = parseInt(lastGroup[0]) + 1;
        groupVersions[groupKey] = version;

        groupVersions = this.proManifest.groupVersions;
        groupVersions[groupKey] = version;

        var assets = this.proManifest.assets;
        var assetsKey = 'update' + groupKey;
        assets[assetsKey] = {
            'path': updateFile,
            'compressed': true,
            'group': groupKey
        }
    },

    save: function () {
        var str = JSON.stringify(this.verManifest, null, 2);
        fs.writeFileSync(this.verFileName, str, 'utf8');

        str = JSON.stringify(this.proManifest, null, 2);
        fs.writeFileSync(this.proFileName, str, 'utf8');
    }

};

module.exports = Config;

// var c = new Config('./abc/');
// c.addGroupVersion('1.0.1', '1.0.0-1.0.1.zip');
// c.save();
