import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        settledSubCommissionDetail: [],  //已结算子店佣金详情
        settledSubCommissionOrderList: [],  //已结算子店佣金订单列表
        subDistributorId:0,
        subDistributorLevel:0,
        pageNo: 1,
        pageSize: 10
    },
    ready: function() {
        this.subDistributorId = Vue.utils.paramsFormat(window.location.href).subDistributorId;
        this.subDistributorLevel = Vue.utils.paramsFormat(window.location.href).subDistributorLevel;
        //加载首屏内容
        this.getSettledSubCommissionDetail();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            this.pageNo += 1;
            this.getSettledSubCommissionOrderList();
        });
        this.getSettledSubCommissionOrderList();
    },
    methods: {

        //加载已结算子店佣金详情
        getSettledSubCommissionDetail: function() {
            var params = {
                ut: this.ut,
                subDistributorId:this.subDistributorId,
                subDistributorLevel:this.subDistributorLevel,
                pageNo: this.pageNo,
                pageSize: this.pageSize
            };
            Vue.api.get("" + "/api/seller/income/settledSubCommissionDetail", params, (result) => {

                this.settledSubCommissionDetail = result.data;

            });
        },
        // 加载已结算子店佣金订单列表
        getSettledSubCommissionOrderList: function() {
            var params = {
                ut: this.ut,
                subDistributorId:this.subDistributorId,
                subDistributorLevel:this.subDistributorLevel,
                pageNo: this.pageNo,
                pageSize: this.pageSize
            };
            Vue.api.get("" + "/api/seller/income/settledSubCommissionOrderList", params, (result) => {

                // this.settledSubCommissionOrderList = result.data.subCommissionOrderList;
                this.settledSubCommissionOrderList = this.settledSubCommissionOrderList.concat(result.data.subCommissionOrderList);

            });
        }


    }
});

