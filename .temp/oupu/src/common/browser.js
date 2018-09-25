import Vue from "vue";

Vue.browser = {
    ua: navigator.userAgent,
    trident: function () {
        return this.ua.indexOf('Trident') > -1;
    },
    presto: function () {
        return this.ua.indexOf('Presto') > -1;
    },
    webKit: function () {
        return this.ua.indexOf('AppleWebKit') > -1;
    },
    gecko: function () {
        return this.ua.indexOf('Gecko') > -1 && this.ua.indexOf('KHTML') == -1;
    },
    mobile: function () {
        return !!this.ua.match(/AppleWebKit.*Mobile.*/);
    },
    ios: function () {
        return this.iPhone() || this.iPad();
        //return !!this.ua.match(/\(i[^;]+;( U;)? CPthis.ua.+Mac OS X/);
    },
    android: function () {
        return this.ua.indexOf('Android') > -1 || this.ua.indexOf('Linux') > -1;
    },
    iPhone: function () {
        return this.ua.indexOf('iPhone') > -1;
    },
    iPad: function () {
        return this.ua.indexOf('iPad') > -1;
    },
    qq: function () {
        return this.ua.indexOf('QQBrowser') > -1;
    },
    weixin: function () {
        return this.ua.indexOf('MicroMessenger') > -1;
    },
    isApp: function () {
        return this.ua.indexOf('ody') > -1;
    },
    getUaParams: function () {
        var matchers = this.ua.match(/\-\-\[([\s\S]+?)\]\-\-/i);
        if (matchers && matchers.length>1) {
            var uaObj = JSON.parse(matchers[1]);
            return uaObj;
        }
        
        return {};
        
    },
    autoLogin: function () {
        if(this.isApp()) {
            // alert(navigator.userAgent)
            var ut = this.getUaParams().ut;
            //ios 默认ut为default
            if (ut && ut != "default") {
                Vue.auth.setUserToken(ut);
                Vue.cookie.setCookie("ut", ut);
            }
        }
    },
    //获取ios浏览器主版本号
    getIosVersion:function () {
      var ver = this.ua.match(/OS (\d+)_(\d+)_?(\d+)?/);
      if(ver && ver.length>1){
            return parseInt(ver[1], 10);
        }else{
            return -1;
        }
    }
};
Vue.browser.autoLogin();