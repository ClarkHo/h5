import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        reconSubCommissionDetail: [],  //已结算子店佣金详情
        orderList: []
    },
    ready: function() {
        this.getReconSubCommissionDetail();
    },
    methods: {
        // 已结算子店佣金详情
        getReconSubCommissionDetail: function () {
            var url = "" + '/api/seller/income/reconSubCommissionDetail';

            Vue.api.post(url, null, (res) => {
                if(res.data && res.data.orderList) {
                    this.reconSubCommissionDetail = res.data;
                    this.orderList = res.data.orderList;
                }
            });
        }
    }
});

