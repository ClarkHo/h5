import Vue from "vue";
import config from "../config/default.js";

Vue.directive('scroll-top', {
    bind: function () {
        this.handler = function(){
            var backTop = $(window).scrollTop();
            var timer = setInterval(function() {
                var scrollTop = $(window).scrollTop();
                //如果用户向下滚动了页面
                if (scrollTop > backTop) {
                    clearInterval(timer);
                    return;
                }
                var speed = scrollTop / 5;
                backTop = scrollTop - speed;
                //
                $(window).scrollTop(backTop);
                //如果已到顶部
                if (backTop == 0) {
                    clearInterval(timer);
                }
            }, 40);
        }
        this.el.addEventListener("click",this.handler);
    }
})