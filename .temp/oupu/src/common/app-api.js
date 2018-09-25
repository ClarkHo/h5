import Vue from "vue";

//回调函数计数
var count = 0;

/**
 * 访问app的API工具类
 */
Vue.app = {
    /**
     * 发送app消息，通过callback处理返回
     *
     * @param func app提供的消息名称 [必填]
     * @param params 传递给app的参数 [非必填]
     * @param callback 消息处理后的回调函数 [非必填]
     * 
     * Example1: 
     * Vue.app.postMessage("getLocation", {x: 1, y: 2}, (data1, data2) => {
     *          alert("x=" + data1 + ",y=" + data2 + ",z=" + this.pageSize);
     *  });
     *
     * Example2: 
     * Vue.app.postMessage("getLocation",  (data1, data2) => {
     *          alert("x=" + data1 + ",y=" + data2 + ",z=" + this.pageSize);
     *  });
     */
    postMessage: function (func, params, callback) {
        //只有在app才执行
        if (!Vue.browser.isApp()) {
            return;
        }

        if (!func) {
            throw new Error("param [func]  is required");
        }

        if (typeof params == "function") {
            callback = params;
            params = null;
        }

        var msgParams = {"function": func};
        if (params) {
            msgParams["param"] = params;
        }

        if (callback) {
            var funcName = this.getFunctionName(func);
            window[funcName] = callback;
            msgParams["callback"] = funcName;
            // console.log("callback:" + funcName)
        }

        if (Vue.browser.ios()) {
             window.webkit.messageHandlers.mobileAPI.postMessage(msgParams);
        } else if (Vue.browser.android()) {
            window.mobileAPI.postMessage(JSON.stringify(msgParams));
        }
    },

    //生成全局函数名字
    getFunctionName: function (func) {
        return "App_" + func + "_callback_" + (++count);
    },

    //通知app返回上一页，refresh指定是否刷新上一页内容。
    //@params forceBack 是否强制app退出当前webview网页
    back: function (refresh,forceBack) {
        this.postMessage("webViewBack", {refresh: refresh ? 1 : 0, forceBack: forceBack ? 1 : 0});
    },

    //唤起app登录
    login: function () {
        window.location.href = "${appSchema}://login";
    },

    //通知app退出
    logout: function () {
        window.location.href = "${appSchema}://logout";
    }
};

//统一隐藏app头部
if(Vue.browser.isApp()) {
    Vue.app.postMessage('hiddenHead',{'isHidden':'1'});
}