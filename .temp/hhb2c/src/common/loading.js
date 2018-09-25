import Vue from "vue";

//模板
var tplLoading = '<div class="ui-loading-block">' +
    '<div class="ui-loading-cnt">' +
      '<img class="lyf-loading" src="${staticPath}/images/page-loading.gif?v=${version}" alt="" />' +
   '</div>' +
 '</div>';

/**
 * 全局加载中动画
 */
class Loading {
    constructor() {
       this.element =$(tplLoading);
       this.visible = false;
    }

    //显示加载中动画
    show() {
        if (this.visible) {
            return;
        }

        this.visible = true;
        this.element.appendTo("body");
        this.element.addClass("show");
    }

    //隐藏加载中动画
    hide() {
        this.element.remove();
        this.visible = false;
    }
}

//全局注册
Vue.loading = new Loading();
