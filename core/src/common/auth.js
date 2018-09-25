import Vue from "vue";

//认证登录相关
Vue.auth = {
    //user token name
    utName: "ut",
    distributorId: 'distributorId',
    distributorType: 'distributorType',//0接口获取1地址栏获取2登录成功后获取

    //判断用户是否已登录
    loggedIn: function () {
        // 优先判断后端写入的ut是否存在
        var ut = this.getUserToken();
        return ut && ut.length > 0;
    },

    //获取UT
    getUserToken: function () {
        // 优先判断后端写入的ut是否存在

        var ut = Vue.cookie.getCookie(this.utName);

        if(Vue.browser.isApp()){
            if(!ut){//部分手机不能正常写入cookie
                ut = Vue.browser.getUaParams().ut;
                if(ut) Vue.cookie.setCookie(this.utName,ut);
            }
        }
        return  ut;
    },

    //获取distributorId 分销商ID
    getDistributorId: function () {
        return  Vue.cookie.getCookie(this.distributorId);
    },

    //设置分销商ID
    setDistributorId: function (type, id) {
        let dtype = Vue.cookie.getCookie(this.distributorType);
        if(type >= dtype) {//优先级按照type大小  覆盖原有值
            Vue.cookie.setCookie(this.distributorType, type);
            Vue.cookie.setCookie(this.distributorId, id || '');
        }
    },

    //设置UT
    setUserToken: function (ut) {
        Vue.cookie.setCookie(this.utName, ut);
    },

    //清空用户登录UT
    //因为在iphone6 se版本的微信里无法删除cookie，所以只能通过设置为空来标识用户退出登录状态。
    deleteUserToken: function () {
        Vue.cookie.setCookie(this.utName, '');
    }
};


/**
 * 如果用户访问需要登录的页面会自动跳转到登录页面
 * 
 * 例子：<body v-need-login>...</body>
 */
Vue.directive("needLogin", {
    priority: 3000,
    bind: function() {
        if (!Vue.auth.loggedIn()) {
            let from = Vue.utils.getRelatedUrl();
            window.location.href = "/login.html?from=" + encodeURIComponent(from);
        }
    }

});

