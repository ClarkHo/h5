import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        incomeList: [],  //收益账单列表
        pageNo: 1,
        pageSize: 10
    },
    ready: function() {
        //加载首屏内容
        this.getIncomeDetailList();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            this.pageNo += 1;
            this.getIncomeDetailList();
        });
    },
    methods: {
        //加载收益账单列表
        getIncomeDetailList: function() {
            var params = {
                ut: this.ut,
                pageNo: this.pageNo,
                pageSize: this.pageSize
            };
            Vue.api.get("/api/seller/income/incomeList", params, (result) => {
                this.incomeList = this.incomeList.concat(result.data.incomeList);

            });
        },
    }
});

