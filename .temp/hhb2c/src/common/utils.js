import Vue from "vue";
import config from "../../env/config.js";
var utils = {
    /**
     * 获得主机名
     * 如果当前完整url是：http://pintuan.test.odianyun.com/my-center/home.html?p=1
     * 返回：http://pintuan.test.odianyun.com
     */
    getHost: function () {
        //location.host = abc.com:8888
        //location.hostname = abc.com
        var url = location.protocol + "//" + location.host;
        return url;
    },
    /** 
     * 获得相对url
     * 如果当前完整url是：http://pintuan.test.odianyun.com/my-center/home.html?p=1
     * 返回：/my-center/home.html?p=1
     */
    getRelatedUrl: function () {
        return location.pathname + (location.search || "") + (location.hash || "");
    },
    
    /**
     * 根据团单号构造去支付url
     */
    getPayUrl: function (orderCode, param) {

        var prefix=this.getHost();
        var url= (config.wx302Url||prefix)+"/pay/pay-way.html?orderCode="+orderCode + (param || '');

        if(Vue.browser.weixin()) {
            url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + Vue.mallSettings.getAppId() + "&redirect_uri="+encodeURIComponent(url)+"&response_type=code&scope=snsapi_base&state=123&connect_redirect=1#wechat_redirect"
        }


        return url;
    },
    /**
     * 根据团单号构造支付成功的返回的页面url
     */
    getPayBackUrl: function (orderCode) {
        var url = location.protocol + "//" + location.host;
        if (location.port) {
            url += ":" + location.port;
        }

        url += "/pay/pay-success.html?orderCode="+orderCode;

        return url;
    },

    /**
     * url参数格式化
     * 例：?param=1 
     * 参数得到方式：paramsObj.param
     */
    paramsFormat: function(url) {
        var qInd = url.indexOf("?");
        var sharpInd = url.indexOf("#"); //路由
        var search = "";
        var paramsList = [];
        var paramsObj = {};
        
        if (qInd >= 0) {
            if (sharpInd > 0) {
                search = url.substring(qInd + 1, sharpInd);
            } else {
                search = url.substring(qInd + 1);
            }
            paramsList = search.split("&");
            for (var ind in paramsList) {
                var param = paramsList[ind];
                var pind = param.indexOf("=");
                if (pind >= 0) {
                    paramsObj[param.substring(0, pind)] = param.substr(pind + 1);
                } else {
                    paramsObj[param] = "";
                }
            }
        }
        return paramsObj;
    },
    /**
     * 返回时间的天、时、分、秒
     * param : 秒
     */
    getHhmmss: function (time) {
        time = parseInt(time);
        if(time <= 0) time = 0;
        var s = time >= 60 ? time%60 : time;
        var m = parseInt((time>=3600?time%3600:time)/60);
        var h = parseInt((time>=86400?time%86400:time)/3600);
        var d = parseInt(time/86400);
        h = h<10 ? "0"+h : h;
        m = m<10 ? "0"+m : m;
        s = s<10 ? "0"+s : s;

        return {
            d: d,
            h: h,
            m: m,
            s: s
        }
    },
    /**
     * 显示提示信息
     */
    showTips: function(msg) {
        $.tips({
            content: msg,
            stayTime: 2000,
            type: "info"
        });
    },
    /**
     * 获取url hash的值
     * 例：/details.html?itemid=1#sort=asc&price=100
     * 返回: {sort: "asc", price: 100 }
     */
    hashFormat: function (url) {
        var hashObj = {};
        var sind = url.indexOf('#');
        if (sind >= 0) {
            var hstr = url.substring(sind+1);
            var paramsList = hstr.split("&");
            for(var i=0; i<paramsList.length; i++) {
                var param = paramsList[i];
                var pind = param.indexOf("=");
                if (pind>=0) {
                    hashObj[param.substring(0, pind)] = param.substr(pind + 1);
                } else {
                    hashObj[param] = "";
                }
            }
        }

        return hashObj;
    },
    // 埋点封装
    //已废弃
    safeMode : function(fn) {
        var _fn = new Function();
        try {
            let evl = eval(fn);
            _fn = typeof evl === 'function' ? evl : _fn;
        } catch (e) {
            		// console.log(e)
        }
        return (...args) => _fn.call(this, ...args)
    },
    /**
     * 对象合并
     * 不支持深度合并
     */
    mergeObj : function(...sources) {
        return Object.assign({}, ...sources);
    },
    /**
     * 显示提示信息
     */
    showTips: function(msg) {
        $.tips({
            content: msg,
            stayTime: 2000,
            type: "info"
        });
    },
    // 用于js里面判断要去登录
    goLogin:function (callback) {
        if (Vue.auth.loggedIn()) {
            if(typeof callback == 'function') {
                callback();
            }
            return;
        } else {
            if (Vue.browser.isApp()) {
                //跳转到app登录页面
                window.location.href = "${appSchema}://login";
            } else {
                window.location.href = "/login.html?from=" + encodeURIComponent(location.href);
            }
            
        }
    },
    /**
     * 针对立即购买，预售封装公共方法
     * obj对象中，应该是包装好的请求参数，见Api文档
     * failCall 为失败执行的函数
     * ignore 外部调用，统一传false
     */
    quickPurchase:function(obj,failCall,ignore) {
        var params = obj;
        if(Vue.cookie.getCookie('shareCode')){
            params.shareCode = Vue.cookie.getCookie('shareCode');
        }
        if(ignore) params.ignoreChange=1;

        //第二版快速购买，结算页初始化订单

        Vue.localStorage.setItem('quick_buy',params);
        
        setTimeout(function() {
            window.location.href = "/pay/pay.html?quickBuy=1";
        }, 200);

        // 第一版快速购买，本页面初始化结算
        // Vue.api.postForm("/api/checkout/initOrder", params, (res) => {
        //     //如果存在非法商品
        //     if (res.code != 0 && res.code != '0') {
        //         // this.unusualStatus = true;
        //         if(typeof failCall == 'function'){
        //             failCall(res.data.error)
        //         } else{
        //             this.showTips(res.data.error.message);
        //         }
        //         return;
        //     }
        //     if(res.code==0){
        //         window.location.href = "/pay/pay.html?q=1";
        //     }else {
        //         var dia=$.dialog({
        //             title:res.message,
        //             content:'',
        //             button:['<span style="color:gray">取消购买</span>','继续购买']
        //         });
        //         dia.on("dialog:action",(e)=>{
        //             if(e.index==1)
        //                 this.quickPurchase(obj,failCall,true)
        //         });
        //     }
        // });
    },
    //安全域名检测，检测fromUrl
    safeDomainCheck:function (url,cb) {
        if(!url || /^\//.test(url)) return;
        // var safeDamain = ('${safeDamain}' || '').split(','),
        var safeDamain = ('${safeDamain}' || '').split(','),
            safeRegx = [],flag = false;
        safeDamain.forEach((v) => {
            safeRegx.push(new RegExp('^'+v));
        });
        for(var s in safeRegx){
            if(safeRegx[s].test(url)){
                flag = true;
                break;
            }
        }
        if(typeof cb == 'function'){
            cb(flag);
        }

    },
      // 针对地址对象转成字符串
      convertToString: function (obj) {
        if(typeof obj =='string'){
            return obj
        }
        if(typeof obj != 'object'){
            return '';
        }
        var string='';
        for(var item in obj){
            string += item + '=' + (obj[item] || '') +'&'
        }
        return string.substring(0,string.lastIndexOf('&'))
    },
    //字符串中是否有重复子串，可自定义正则
    isRepeat: function(str, subString, reg){
        var rege = reg ? reg : new RegExp(subString,'ig');
        return str.match(rege).length>1;
    }  
};

Vue.utils = utils;
