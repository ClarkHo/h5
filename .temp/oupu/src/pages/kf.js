import Vue from "vue";
import config from "../../env/config.js";

$(function () {
    var xiaonengEl, settingid;
    function showXiaoNeng(data) {
        var itemId = '';
        let uid = Vue.auth.getUserToken();
        let username = localStorage.username;
        if(Vue.utils.getRelatedUrl().indexOf('/detail.html') == 0) {
            itemId = Vue.utils.paramsFormat(location.href).itemId;
        }
        settingid = data.settingId;

        window.NTKF_PARAM = {
            "siteid": data.siteId /*网站siteid*/,
            "settingid": data.settingId /*代码ID*/,
            "erpparam": uid || "" /*会员ID*/,
            "uid": username || "",
            "uname": ""/*会员名*/,
            "userlevel": data.userLevel,/*会员等级*/
            "itemid": itemId,
            "itemparam": config.platformId
        }

       var da = document.createElement("script");
        da.src = 'http://dl.ntalker.com/js/xn6/ntkfstat.js?siteid='+data.siteId;
        document.body.appendChild(da);
    }




    function getXnConfig(name, code) {
       /* if(sessionStorage[name]) {
            showXiaoNeng(JSON.parse(sessionStorage[name]));
        }else {*/
            var url = config.apiHost + '/search-backend-web/getCustomerSiteInfo.json';
            var param = {
                merchantId: -99,
                platformId: 0,
                sessionId: Vue.session.getSessionId(),
                pageCode: code,
                companyId: 51
            };
            Vue.api.get(url, param, (res) => {
                if(res.data && res.data.siteId && res.data.settingId) {
                    sessionStorage[name] = JSON.stringify(res.data);
                    showXiaoNeng(res.data);
                }
            });
    }

    if(!Vue.browser.isApp()) {
        var page = Vue.utils.getRelatedUrl();
        if(page.indexOf('/feedback/') == 0) {
            return;
        }
        if(page.indexOf('/my/') == 0 || page.indexOf('/setting/') == 0 || page.indexOf('/receipt/') == 0) {
            getXnConfig('xnConfigAfter', 4);
            document.getElementById('getService').onclick = function() {
                NTKF.im_openInPageChat(settingid);
            }

        }else {
            getXnConfig('xnConfigPre', 1);
            document.getElementById('getService').onclick = function () {
                NTKF.im_openInPageChat(settingid);
            }
        }
    }
})