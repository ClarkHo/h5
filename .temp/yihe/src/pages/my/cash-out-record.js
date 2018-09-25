import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        withdrawRecordList: [],  //提现记录列表
        pageNo: 1,
        pageSize: 10
    },
    ready: function() {
        //加载首屏内容
        this.getWithdrawRecordList();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            this.pageNo += 1;
            this.getWithdrawRecordList();
        });
    },
    methods: {
        //提现记录列表
        getWithdrawRecordList: function() {
            var params = {
                ut: this.ut,
                pageNo: this.pageNo,
                pageSize: this.pageSize
            };
            Vue.api.get("" + "/api/seller/withdraw/recordList", params, (result) => {

                this.withdrawRecordList = result.data.recordList;

            });
        },
    }
});

