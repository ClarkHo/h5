
import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";
import UiScrollTop from "../../components/ui-scroll-top.vue";



var vm = new Vue({
    el: 'body',
    components: {UiScrollTop, UiHeader },
    data: {
        // ut: Vue.auth.getUserToken(),
        // goodList: [],  //收藏列表
        // companyId: Vue.mallSettings.getCompanyId(),
        // pageNo: 1,
        // pageSize: 10,
        detailTab: "collect1",
        showScrollToTop: false,//返回顶部标识
        // totalCount: 0,
        // loaded:false
    },
    ready: function() {
        //加载首屏内容
        // this.getGoodList();
        // //滚动加载更多数据
        // Vue.scrollLoading(() => {
        //     this.pageNo += 1;
        //     this.getGoodList();
        // });
        //回到顶部
        $(window).scroll(() => {
            //检查是否需要显示scrollToTop按钮
            if ($(window).scrollTop() > $(window).height() * 2) {
                this.showScrollToTop = true;
            } else {
                this.showScrollToTop = false;
            }
        });
    },
    methods: {
        //收藏列表
        getGoodList: function() {
            // var params = {
            //     ut: this.ut,
            //     companyId: this.companyId,
            //     pageNo: this.pageNo,
            //     pageSize: this.pageSize
            // };
           Vue.api.get("" + "", params, (result) => {

                // //this.goodList = result.data.data;
                // this.loaded=true;
                // this.totalCount = result.data.totalCount;
                // if (result.data.data.length > 0) {
                //     this.goodList = this.goodList.concat(result.data.data);
                // }
            });
        },
    }
});