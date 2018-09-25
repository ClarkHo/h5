import Vue from "vue";
import config from "../../env/config.js";

const oneHour = 1000 * 60 * 60;
//网站的companyId，使用cms返回的数据
const companyId = frontTemplate ? frontTemplate.companyId : 1001;

/**
 * 商城配置
 */
class MallSettings {
    //构造函数
    //onLoad setting加载完后执行的回调函数
    constructor(onLoad) {
        this.settingsKey = "mallSettings";
        this.expireDateKey = "settingExpireDate";
        this.appIdKey = "weixinAppId";
        this.appIdexpireDateKey = "appIdExpireDate";
        this.settings = {};
        this.onLoad = onLoad;
        this._loadSettings();
        if (Vue.browser.weixin()) {
            this._getWeixinAppId();
        }
    }

    //获取商城名称
    getMallName() {
       return  this._getSetting("mobileMallName");
    }

    //获取商城的域名
    getMallDomain() {
        return  this._getSetting("mobileMallDomain");
    }

    //获取商城的logo
    getMallLogo() {
        return  this._getSetting("mobileMallLogo");
    }

    //获取商城版权信息
    getMallCopyright() {
        return  this._getSetting("mobileRight");
    }

    /**
     * 获得网站的companyId，使用cms返回的数据
     */
    getCompanyId() {
        return companyId;
    }

    /**
     * 获得网站的companyId，使用cms返回的数据
     */
    getAppId() {
        return this._getSetting("appId");
    }

    _getSetting(settingName) {
        return this.settings[settingName];
    }

    //加载设置
    _loadSettings() {
        var localSettings = Vue.localStorage.getItem(this.settingsKey);
        var expired = false;
        //检测settings是否过期
        if(Vue.localStorage.contains(this.expireDateKey)) {
            var expDate = new Date(Vue.localStorage.getItem(this.expireDateKey));
            var now = new Date();

            if (expDate.getTime() < now.getTime()) {
                expired = true;
            }
        }
        //优先使用本地存储的内容(未过期时)
        if (localSettings && !expired) {
            this.settings = localSettings;
            if(this.onLoad) {
                this.onLoad(this);
            }
            return;
        }

        var params = { data: { companyId: companyId } };
        Vue.api.post("/osc-api/getMobileMallBasicSetting.do", params, (result) => {
            this.settings = result.resultData || {};
            Vue.localStorage.setItem(this.settingsKey, this.settings);
            Vue.localStorage.setItem(this.expireDateKey, this._getExpireDate());

            if(this.onLoad) {
                this.onLoad(this);
            }
        });
    }

    _getWeixinAppId(cb) {
        var appId = Vue.localStorage.getItem(this.appIdKey);
        var expired = false;
        //检测settings是否过期
        if(Vue.localStorage.contains(this.appIdexpireDateKey)) {
            var expDate = new Date(Vue.localStorage.getItem(this.appIdexpireDateKey));
            var now = new Date();

            if (expDate.getTime() < now.getTime()) {
                expired = true;
            }
        }
        //优先使用本地存储的内容(未过期时)
        if (appId && !expired) {
            this.settings['appId'] = appId;
            if(typeof cb == 'function'){
                cb(appId)
            }
            return;
        }

        var params = {companyId: companyId};
        Vue.api.postForm("/opay-web/getWxpayAppId.do", params, (result) => {
            this.settings['appId'] = result.data.appId;
            if(typeof cb == 'function'){
                cb(appId)
            }
            Vue.localStorage.setItem(this.appIdKey, result.data.appId);
            Vue.localStorage.setItem(this.appIdexpireDateKey, this._getExpireDate());
        }, () => {
           // 拦截接口提示信息
        });
    }

    _getExpireDate() {
        var now = new Date();
        return  new Date(now.getTime() + oneHour);
    }

}

Vue.mallSettings = new MallSettings(function (mallSettings) {
    document.title = mallSettings.getMallName() || "SAAS商城";
});
