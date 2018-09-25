import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        settledSubCommissionList: [],  //已结算子店佣金列表
        pageNo: 1,
        pageSize: 10
    },
    ready: function() {

        //加载首屏内容
        this.getSettledSubCommissionList();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            this.pageNo += 1;
            this.getSettledSubCommissionList();
        });
    },
    methods: {

        // 已结算子店佣金列表
        getSettledSubCommissionList: function() {
            var params = {
                ut: this.ut
            };
            Vue.api.get("" + "/api/seller/income/settledSubCommissionList", params, (result) => {

                // this.settledSubCommissionList = result.data.subCommissionList;
                this.settledSubCommissionList = this.settledSubCommissionList.concat(result.data.subCommissionList);
            });
        }


    }
});

