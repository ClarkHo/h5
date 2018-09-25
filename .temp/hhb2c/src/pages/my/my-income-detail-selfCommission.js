import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        reconSelfCommissionDetail: [],  //对账单自销佣金明细
        reconSelfCommissionDetailList:[], //收益明细列表
        reconCode:0,
        pageNo: 1,
        pageSize: 10
    },
    ready: function() {
        this.reconCode = Vue.utils.paramsFormat(window.location.href).reconCode;
        //加载首屏内容
        this.getReconSelfCommissionDetail();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            this.pageNo += 1;
            this.getReconSelfCommissionDetail();
        });
    },
    methods: {

        //加载对账单自销佣金明细
        getReconSelfCommissionDetail: function() {
            var params = {
                ut: this.ut,
                reconCode:this.reconCode,
                pageNo: this.pageNo,
                pageSize: this.pageSize
            };
            Vue.api.get("" + "/api/seller/income/reconSelfCommissionDetail", params, (result) => {

                // this.reconSelfCommissionDetail = result.data;
                // this.reconSelfCommissionDetailList = result.data.orderList;
                this.reconSelfCommissionDetail = this.reconSelfCommissionDetail.concat(result.data);
                this.reconSelfCommissionDetailList = this.reconSelfCommissionDetailList.concat(result.data.orderList);

            });
        }


    }
});

