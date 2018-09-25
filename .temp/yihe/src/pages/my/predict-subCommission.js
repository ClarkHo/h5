import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        predictSubCommissionList: [],  //预计子店佣金列表
        pageNo: 1,
        pageSize: 10,
        predictType:0
    },
    ready: function() {
        this.predictType = Vue.utils.paramsFormat(window.location.href).predictType;
        //加载首屏内容
        this.getPredictSubCommissionList();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            this.pageNo += 1;
            this.getPredictSubCommissionList();
        });
    },
    methods: {

        // 预计子店佣金列表
        getPredictSubCommissionList: function() {
            var params = {
                ut: this.ut,
                predictType: this.predictType
            };
            Vue.api.get("" + "/api/seller/income/predictSubCommissionList", params, (result) => {
                // this.predictSubCommissionList = result.data.subCommissionList;
                this.predictSubCommissionList = this.predictSubCommissionList.concat(result.data.subCommissionList);
            });
        }


    }
});

