/**
 * Created by Administrator on 2016/6/27.
 */
//JS操作cookies方法!
//写cookies

import Vue from "vue";
var cookie = {
    /**
     * obj对象：
     *      needExp：是否设置过期时间，不设置即为session级别cookie
     *      expTime：有效时间，单位天
     */
    setCookie: function setCookie(name, value, obj) {
        var newObj = obj || {};
        var Days = newObj.expTime || 30;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
        if(newObj.needExp == false){
            document.cookie = name + "=" + escape(value) + "; path=/; domain=" + (frontTemplate.cookieDomain|| location.host);
        } else{
            document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + "; path=/; domain=" + (frontTemplate.cookieDomain|| location.host);
        }
    },
    getCookie: function getCookie(name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg))
            return unescape(arr[2]);
        else
            return null;
    },
    //删除所有子域名下的同名cookie
    delCookie: function delCookie(name) {
        var domain = '.'+document.domain;//.m.opplestore.com
        var regDot = /\./g;
        var regDomain = /([\w-]+)/i;
        document.cookie = name + " = null; path=/; expires=" + new Date(0).toUTCString();//清除掉不带域名的
        while(domain.match(regDot).length>1){//清除多个子域名
            //清除掉当前域名cookie，并减少一级子域名(.m.opplestore.com、m.opplestore.com、.opplestore.com、opplestore.com)
            document.cookie = name + " = null; path=/; expires=" + new Date(0).toUTCString()+"; domain=" + domain; 
            if(domain.indexOf('.')===0){//以.开头
                domain = domain.replace(/\./,'');
            }else{
                domain = domain.replace(regDomain,'');
            }
        }
    },
    //如果有超过1个子域名的ut，则肯定有无效ut，则清除所有
    delUt:function(){
        var cookies = document.cookie;
        var reg = /(^|\s?)ut=/ig;
        var mat = cookies.match(reg);
        if(mat && mat.length>1){//多个ut
            this.delCookie('ut');
        }
        
    }
}

Vue.cookie = cookie;
