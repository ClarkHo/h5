import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        reconSubCommissionDetail: [],  //对账单子店佣金明细
        reconSubCommissionDetailList:[],//对账单子店佣金列表
        reconCode:0,
        commissionLevel:0,
        pageNo: 1,
        pageSize: 10
    },
    ready: function() {
        this.reconCode = Vue.utils.paramsFormat(window.location.href).reconCode;
        this.commissionLevel = Vue.utils.paramsFormat(window.location.href).commissionLevel;
        //加载首屏内容
        this.getReconSubCommissionDetail();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            this.pageNo += 1;
            this.getReconSubCommissionDetail();
        });
    },
    methods: {
        //加载对账单子店佣金明细
        getReconSubCommissionDetail: function() {
            var params = {
                ut: this.ut,
                reconCode:this.reconCode,
                commissionLevel:this.commissionLevel,
                pageNo: this.pageNo,
                pageSize: this.pageSize
            };
            Vue.api.get("" + "/api/seller/income/reconSubCommissionDetail", params, (result) => {

                // this.reconSubCommissionDetail = result.data;
                // this.reconSubCommissionDetailList = result.data.orderList;

                this.reconSubCommissionDetail = this.reconSubCommissionDetail.concat(result.data);
                this.reconSubCommissionDetailList = this.reconSubCommissionDetail.concat(result.data.orderList);

            });
        },
    }
});

