import Vue from "vue";

/**
 * 滚动加载数据
 * 
 * @param delay 滚动默认延时毫秒
 * @param triggerHeight 距离文档尾部指定高度时执行回调函数
 * @param callback 执行回调函数
 * 完整options: {delay: 200, triggerHeight: 100, callback: null}
 * 例子1：Vue.scrollLoading(function(){})
 * 例子2：Vue.scrollLoading({delay: 100, callback: function(){}})
 */
Vue.scrollLoading = function(options) {
    //只有回调函数，其他参数默认。
    if (typeof options == "function") {
        let cb = options;
        options = {callback: cb};
    }

    let delay = options.delay || 200;
    let triggerHeight = options.triggerHeight || 100;
    let callback = options.callback;
    let parentEl = options.parentEl || window;  //父容器，用于局部滚动加载
    let childEl = options.childEl || document;  //子容器，用于局部滚动加载
    let busy = false;

    $(parentEl).scroll(function() {
        if (busy) {
            return;
        }

        //检查是否已到触发加载的高度
        if ($(parentEl).scrollTop() + $(parentEl).height() + triggerHeight > $(childEl).height() ) {
            busy = true;

            setTimeout(function() {
                busy = false;
                callback();
            }, delay);

        }
    });

};