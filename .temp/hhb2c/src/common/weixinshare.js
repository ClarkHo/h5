import Vue from "vue";
import config from "../../env/config.js"

//调用getUnionId的页面
const SKEY_INVOLKEPAGE = "s_invokepage";
//是否是在微信里首次打开h5页面
const SKEY_ACCESSED = "s_accessed";
//微信用户信息
const SKEY_WXUSERINFO = "s_wxuserinfo";

//当前用户的shareCode
const SKEY_SHARECODE = "s_currentsharecode"

//不处理的页面 
var excludePages = [
    "/share.html",
    "/feedback/feedback.html",
    "/my/share-article-detail.html",
    "/download.html"
];

//取消分享朋友圈的页面
var regPage=/\/(cut|group|my)\//;

//这些my目录下的页面允许分享到朋友圈
var shareablePages = [
    "/my/market-article-detail.html",
    "/my/share-article-detail.html"
];

//不需要处理的页面
function excludeCurrentPage  () {
    var path = location.pathname;

    for (var i = 0; i < excludePages.length; i++) {
        if (excludePages[i] == path) {
            return true;
        }
    }

    return false;
}

var weixin = {
    /**
     * 获取当前用户微信unionid
     */
    getUnionid: function () {
        if(!Vue.browser.weixin()) {
            return "";
        }

        return this.getWxUserInfo().unionId || "";
    },

    /**
     * 当前用户是否已关注了微信公众号
     */
    isSubscribe: function () {
         if(!Vue.browser.weixin()) {
            return false;
        }

        //如果session里没有值，默认返回已关注
        var subscribe = this.getWxUserInfo().subscribe;
        if (subscribe == undefined) {
            return true;
        }

        return subscribe == 1;
    },


    /**
     * 获取微信的openid
     */
    getOpenid: function () {
        if(!Vue.browser.weixin()) {
            return "";
        }

        return this.getWxUserInfo().openId || "";
    },
    excludeCurrentPage: function  () {
        var path = location.pathname;

        for (var i = 0; i < excludePages.length; i++) {
            if (excludePages[i] == path) {
                return true;
            }
        }

        return false;
    },
    //处理url里的上家分享码并保存进cookie
    checkShareCode: function () {
        //不处理分享页面
        if (this.excludeCurrentPage()) {
            return;
        }
    
        var urlParams = Vue.utils.paramsFormat(location.href);
        var hashParams = Vue.utils.hashFormat(location.href);
        //缓存的上家的shareCode
        //FIXME 上家的sharecode key要用常量并注释
        var s_shareCode = Vue.cookie.getCookie("shareCode");
        //1. 获取url里的sharecode，复制链接的shareCode是在hash里，分享朋友圈的shareCode是在url里的
        // 上家的shareCode
        var shareCode=hashParams.shareCode||urlParams.shareCode;
        //TODO 2.  本人的shareCode要和url里的shareCode比较，如果相同就不处理
        //自己的shareCode的
        var ownShareCode = Vue.sessionStorage.getItem(SKEY_SHARECODE);
        //如果url里有上家的shareCode，且自己本地没有存shareCode，就保存上家的shareCode，在注册，预绑定，联合登录场景使用
        if(shareCode && !s_shareCode && shareCode != ownShareCode) {
                Vue.cookie.setCookie("shareCode", shareCode);
        }
        this.rewrite();
    },

    /**
     * 获取微信的用户信息
     */
    getWxUserInfo: function () {
        return Vue.sessionStorage.getItem(SKEY_WXUSERINFO) || {};
    },

    //处理url里的上家分享码并保存进cookie
    processInviterShareCode: function () {
        var urlParams = Vue.utils.paramsFormat(location.href);
        var hashParams = Vue.utils.hashFormat(location.href);
        //缓存的上家的shareCode
        var s_shareCode = Vue.distribution.getInviterShareCode();
        //1. 获取url里的sharecode，复制链接的shareCode是在hash里，分享朋友圈的shareCode是在url里的
        // 当前url里带的上家的shareCode
        var shareCode=hashParams.shareCode || urlParams.shareCode;
        //2.  本人的shareCode要和url里的shareCode比较，如果相同就不处理
        //自己的shareCode
        var ownShareCode = Vue.distribution.getCurUserShareCode();
        //如果url里有上家的shareCode，且自己本地没有存shareCode，就保存上家的shareCode，在注册，预绑定，联合登录场景使用
        if(shareCode && !s_shareCode && shareCode != ownShareCode) {
            Vue.distribution.setInviterShareCode(shareCode);
        }
    },

    /**
     * 在微信里进行预绑定处理
     */
    doPreBinding: function () {
        //已经预绑定过,直接返回        
        if(this.getUnionid()) {
            return;
        }
        
        var accessed = Vue.sessionStorage.getItem(SKEY_ACCESSED);
        var urlParams = Vue.utils.paramsFormat(location.href);
        //如果不是首次访问，并且页面带了code就存储起来(通过微信走了一圈回来)就进行预绑定
        if (accessed && urlParams.code) {
            var inviterShareCode = Vue.distribution.getInviterShareCode() || "" ;
            var createUnionid = urlParams.createUnionid || "";
            var params = {code: urlParams.code, shareCode: inviterShareCode, createUnionid: createUnionid};
            //请求接口完成预绑定，并返回unionid及是否已关注微信公众号等信息
            Vue.api.postForm("/agent-wx-web/weixinShare/getWxUserInfo.do", params, (result)=>{
                var data = result.data;
                if (data) {
                    Vue.sessionStorage.setItem(SKEY_WXUSERINFO, data);
                    Vue.event.emit("updateWeixinUserInfo");
                }
            }, ()=>{
                //预绑定出错暂不处理
            });

        } else {
            //设置已访问的标志
            Vue.sessionStorage.setItem(SKEY_ACCESSED, true);
            //走微信静默授权
            this.doWeixinAuth();
        }
    },

    /**
     * 通过微信静默授权获得code
     */
    doWeixinAuth: function () {
        //如果当前页已经走过一次静默授权流程，直接返回 (避免死循环)
        if (location.pathname == Vue.sessionStorage.getItem(SKEY_INVOLKEPAGE)) {
            Vue.sessionStorage.removeItem(SKEY_INVOLKEPAGE);
            return;
        }

        //记录当前页面已经请求过微信授权，避免多次请求。
        Vue.sessionStorage.setItem(SKEY_INVOLKEPAGE, location.pathname);
        var redirectUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + Vue.mallSettings.getAppId() + '&redirect_uri='
                + encodeURIComponent(location.href)
                + '&response_type=code&scope=snsapi_base&state=1#wechat_redirect';
        //为了避免用户看到反复加载一个页面，先将当前页的内容隐藏。
        $("body").hide();
        //请求微信授权页面
        location.replace(redirectUrl);
    },

    /**
     * 重写url-在hash中添加shareCode参数（复制分享需要）
     * 注意：因微信中无法复制history.replaceState修改后的url，这里通过location.hash来记录这些值
     */
    rewriteUrl: function () {
        //有可能包含的是上家的shareCode
        var hashParams = Vue.utils.hashFormat(location.href);
        var urlParams = Vue.utils.paramsFormat(location.href);
        delete urlParams.shareCode;
        delete hashParams.shareCode;
        //本地有缓存，或者接口返回成功才有
        var shareCode = Vue.sessionStorage.getItem(SKEY_SHARECODE);
        if (shareCode) {
            hashParams.shareCode = shareCode;
            urlParams.shareCode = shareCode;
        }

 /*       var urlParams = Vue.utils.paramsFormat(location.href);
        //微信中需要带上createUnionid
        if(Vue.browser.weixin() && !hashParams.createUnionid) {
           //从sessionstorage里取当前用户的unionid
            if (Vue.sessionStorage.contains(SKEY_UNIONID)) {
                hashParams.createUnionid = Vue.sessionStorage.getItem(SKEY_UNIONID);
            } else if (urlParams.unionid) {
                //取url参数里带的unionid
                hashParams.createUnionid = urlParams.unionid;
            } 
        }*/

        var hashStr = Vue.utils.convertToString(hashParams);
        if (hashStr) {
            //微信里只能更改hash的值，这里使用hash追踪分享人的信息
            location.hash = "#" + hashStr;
        }

        var urlStr = Vue.utils.convertToString(urlParams);
        if (urlStr) {
            var url = Vue.utils.getHost() + location.pathname + '?' + urlStr;
            history.replaceState(null, "", url);

            this.initWeixinShare();
        }

    },

    /**
     * 重写url 
     * 需要初始化用户的shareCode信息
     */
    rewrite: function ( ) {
        if(Vue.sessionStorage.getItem(SKEY_SHARECODE)) {
            this.rewriteUrl();
        }else {
            this.loadCurrentDistributionData(()=>{
                this.rewriteUrl();
            }, ()=>{
                //获取shareCode失败
                $.tips({
                    content: '当前分享功能异常，建议刷新页面',
                    stayTime: 2000,
                    type: "warn"
                });
                this.rewriteUrl();
            });
        }
    },

   /**
     * 重写url以便复制链接时同样可以带上分享人的信息
     */
    updateUrlForShare: function ( ) {
        if(Vue.distribution.getCurUserShareCode()) {
            this.rewriteUrl();
        }else {
            //获取当前用户分销信息
            Vue.distribution.loadCurrentDistributionData(()=>{
                this.rewriteUrl();
            }, ()=>{
                this.rewriteUrl();
            });
        }
    },

    /**
     * 判断当前页面是不是显示微信的分享功能
     */
    isShareablePage: function  () {
        var path = location.pathname;

        for (var i = 0; i < shareablePages.length; i++) {
            if (shareablePages[i] == path) {
                return true;
            }
        }

        return false;
    },

    /**
     * 初始化微信分享
     */
    initWeixinShare: function () {
        if(Vue.browser.weixin()) {
            var url = '/api/weixin/getSign?url=' + encodeURIComponent((location.href+'#').split('#')[0]);
            Vue.api.get(url, null, (res) => {
                if(typeof wx != 'undefined'){
                    Vue.mallSettings._getWeixinAppId((appId) => {
                        wx.config({
                            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                            appId: Vue.mallSettings.getAppId(), // 必填，公众号的唯一标识
                            timestamp: res.data.data.timestamp, // 必填，生成签名的时间戳
                            nonceStr: res.data.data.nonceStr, // 必填，生成签名的随机串
                            signature: res.data.data.signature,// 必填，签名，见附录1
                            jsApiList: ['showAllNonBaseMenuItem', 'hideAllNonBaseMenuItem', 'showMenuItems', 'hideMenuItems','onMenuShareTimeline','onMenuShareAppMessage','onMenuShareQQ','onMenuShareWeibo','onMenuShareQZone'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                        });
                        
                        // wx.ready(() => {
                        //     //以下页面去除分享功能
                        //     if(!this.isShareablePage() && regPage.test((location.href+'#').split('#')[0])) {
                        //         // wx.hideAllNonBaseMenuItem();
                        //     } else {
                        //         //微信会保留之前的菜单状态，所以需要调用显示菜单的方法
                        //         // wx.showAllNonBaseMenuItem();
                        //     }
                        // });
                    })
                    
                }
                    
            });

            // wx.error(function(res){
            //     // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
            //     alert(res);
            // });
        }
    },

    /**
     * 微信分享
     * 朋友圈和发送给朋友的success不会触发，未知原因，放在trigger中触发回调
     */
    weixinShare: function (data, callback) {
        if(Vue.browser.weixin() && typeof wx != 'undefined') {
             wx.ready(() => {
                wx.onMenuShareTimeline({
                    title: data.title, // 分享标题
                    desc: data.desc, // 分享描述
                    link: data.link, // 分享链接
                    imgUrl: data.imgUrl, // 分享图标
                    trigger:function(res){
                        if(typeof callback == 'function') {
                            callback();
                        }
                    }
                    
                });
                wx.onMenuShareAppMessage({
                    title: data.title, // 分享标题
                    desc: data.desc, // 分享描述
                    link: data.link, // 分享链接
                    imgUrl: data.imgUrl, // 分享图标
                    trigger:function(res){
                        if(typeof callback == 'function') {
                            callback();
                        }
                    }
                });
                wx.onMenuShareQQ({
                    title: data.title, // 分享标题
                    desc: data.desc, // 分享描述
                    link: data.link, // 分享链接
                    imgUrl: data.imgUrl, // 分享图标
                    success: function (res) {
                        if(typeof callback == 'function') {
                            callback();
                        }
                    },
                    cancel: function () {
                        
                    },
                    complete:function(){
                        
                    },
                    trigger:function(){
                        
                    },
                    fail:function(){
                        
                    }
                });
                wx.onMenuShareWeibo({
                    title: data.title, // 分享标题
                    desc: data.desc, // 分享描述
                    link: data.link, // 分享链接
                    imgUrl: data.imgUrl, // 分享图标
                    success: function (res) {
                        if(typeof callback == 'function') {
                            callback();
                        }
                    },
                    cancel: function () {
                        
                    },
                    complete:function(){
                        
                    },
                    trigger:function(){
                        
                    },
                    fail:function(){
                        
                    }
                });
                wx.onMenuShareQZone({
                    title: data.title, // 分享标题
                    desc: data.desc, // 分享描述
                    link: data.link, // 分享链接
                    imgUrl: data.imgUrl, // 分享图标
                    success: function (res) {
                        if(typeof callback == 'function') {
                            callback();
                        }
                    },
                    cancel: function () {
                        
                    },
                    complete:function(){
                        
                    },
                    trigger:function(){
                        
                    },
                    fail:function(){
                        
                    }
                });

            });
            
        }
            
    },
    //清除用户的分销商信息
    clearDistributionData: function () {
        Vue.sessionStorage.removeItem('distributorId');
        Vue.sessionStorage.removeItem('distributorType');
        Vue.sessionStorage.removeItem('currDistributor');
        Vue.sessionStorage.removeItem('s_currentsharecode');
    },

    /**
     * 重新获取并设置用户的分销商信息
     */
    loadCurrentDistributionData: function(callback, failCallback) {
        var url = '/api/seller/distributor/currDistributor';
        var param = {
            ut: Vue.auth.getUserToken(),
            unionid: Vue.weixin.getUnionid(),
            shareCode: Vue.cookie.getCookie("shareCode")
        };

        Vue.api.get(url, param, (res) => {
            var data = res.data;
            if (data && data.id) {
                Vue.auth.setDistributorId(2, data.id);
                Vue.sessionStorage.setItem('currDistributor', data);

                if (data.shareCode) {
                    Vue.sessionStorage.setItem('s_currentsharecode', data.shareCode);
                }
                
            }

            if (callback) {
                callback(data);
            }

        }, () => {
            //错误处理
            if (failCallback) {
                failCallback();
            }
        });
    }

};

Vue.weixin = weixin;


//初始化微信分享
weixin.initWeixinShare();
//默认分享内容
Vue.weixin.weixinShare({
    link: window.location.href,
    title: Vue.mallSettings.getMallName(),
    desc: '${companyName}',
    imgUrl: config.share.defaultImg
});
// Vue.weixin.checkShareCode();