import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";


var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        subStatistics: [],  //子铺统计
        distributorList: [],  //店铺列表
        pageNo: 1,
        pageSize: 10,
        level:1,
        currentTab:1,
        inputVal:''
    },
    ready: function() {
        //url params
        let urlParams = Vue.utils.paramsFormat(window.location.href);
        //可以通过t参数指定初始化的tab
        switch (urlParams.t) {
            case "1":
            case "2":
            case "3":
                this.currentTab = parseInt(urlParams.t);
                break;
        }
        //子铺统计
        this.getSubStatistics();
        //店铺列表
        this.getPredictSubCommissionList();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            this.pageNo += 1;
            this.getPredictSubCommissionList();
        });
    },
    methods: {

        // 子铺统计
        getSubStatistics: function() {
            var params = {
                ut: this.ut,
                level: this.currentTab
            };
            Vue.api.get("" + "/api/seller/distributor/subStatistics", params, (result) => {

                this.subStatistics = result.data;

            });
        },
        // 店铺列表
        getPredictSubCommissionList: function() {
            var params = {
                ut: this.ut,
                // companyId: Vue.mallSettings.getCompanyId(),
                level: this.currentTab,
                pageNo: this.pageNo,
                pageSize: this.pageSize,
                queryCondition: this.inputVal
            };
            Vue.api.get("" + "/api/seller/distributor/list", params, (result) => {
                this.loaded=true;
                this.distributorList = this.distributorList.concat(result.data.data);

            });
        },
        searchPredictSubCommissionList: function() {
            var params = {
                ut: this.ut,
                // companyId: Vue.mallSettings.getCompanyId(),
                level: this.currentTab,
                pageNo: this.pageNo,
                pageSize: this.pageSize,
                queryCondition: this.inputVal
            };
            Vue.api.get("" + "/api/seller/distributor/list", params, (result) => {
                this.loaded=true;
                this.distributorList=[];
                this.distributorList = result.data.data;

            });
        },
        //切换tab
        switchTab: function(tab) {
            if (this.currentTab != tab) {
                this.currentTab = tab;
                this.pageNo = 1;
                this.subStatistics = [];
                this.distributorList = [];
                //更新url的参数
                var url = tab > 0 ? location.pathname + "?t=" + tab : location.pathname;
                window.history.replaceState(null, "", url);
                // 店铺列表
                this.getPredictSubCommissionList();
                // 子铺统计
                this.getSubStatistics();
            }
        }


    }
});

window.addEventListener('load', function(){

    // var tab = new fz.Scroll('.ui-tab', {
    //     role: 'tab',
    //     autoplay: false,
    //     interval: 9000
    // });

    // /* 滑动开始前 */
    // tab.on('beforeScrollStart', function(from, to) {
    //     // from 为当前页，to 为下一页
    // })
    //
    // /* 滑动结束 */
    // tab.on('scrollEnd', function(curPage) {
    //     // curPage 当前页
    // });

})