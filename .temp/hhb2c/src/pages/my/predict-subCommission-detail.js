import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        predictSubCommissionDetail: [],  //预计子店佣金详情
        predictSubCommissionOrderList: [],  //预计子店佣金订单列表
        subDistributorId:0,
        subDistributorLevel:0,
        predictType:0,
        pageNo: 1,
        pageSize: 10
    },
    ready: function() {
        this.subDistributorId = Vue.utils.paramsFormat(window.location.href).subDistributorId;
        this.subDistributorLevel = Vue.utils.paramsFormat(window.location.href).subDistributorLevel;
        this.predictType = Vue.utils.paramsFormat(window.location.href).predictType;
        //加载首屏内容
        this.getPredictSubCommissionOrderList();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            this.pageNo += 1;
            this.getPredictSubCommissionOrderList();
        });
        this.getPredictSubCommissionDetail();
    },
    methods: {

        //加载预计子店佣金详情
        getPredictSubCommissionDetail: function() {
            var params = {
                ut: this.ut,
                subDistributorId:this.subDistributorId,
                predictType:this.predictType,
            };
            Vue.api.get("" + "/api/seller/income/predictSubCommissionDetail", params, (result) => {

                this.predictSubCommissionDetail = result.data;

            });
        },
        // 加载预计子店佣金订单列表
        getPredictSubCommissionOrderList: function() {
            var params = {
                ut: this.ut,
                subDistributorId:this.subDistributorId,
                subDistributorLevel:this.subDistributorLevel,
                predictType:this.predictType,
                pageNo: this.pageNo,
                pageSize: this.pageSize
            };
            Vue.api.get("" + "/api/seller/income/predictSubCommissionOrderList", params, (result) => {

                // this.predictSubCommissionOrderList = result.data.subCommissionOrderList;
                this.predictSubCommissionOrderList = this.predictSubCommissionOrderList.concat(result.data.subCommissionOrderList);

            });
        }


    }
});

