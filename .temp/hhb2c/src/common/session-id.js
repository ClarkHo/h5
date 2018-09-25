import Vue from "vue";

/*
 * 操作用户客户端session id
 */
Vue.session = {
    //用户的session id 名称
    sidName: "sessionId",

    //获取用户session id， 如果没有生成一个。
    getSessionId: function () {
        var sid = Vue.cookie.getCookie(this.sidName);

        if (!sid) {
            var now = new Date();
            //随机数字
            var randNum = Math.round(Math.random() * 1000);
            sid = now.getTime() + "" + randNum;
            Vue.cookie.setCookie(this.sidName, sid);
        }

        return sid;
    },

    //删除session id
    deleteSessionId: function () {
        Vue.cookie.delCookie(this.sidName);
    }
};


