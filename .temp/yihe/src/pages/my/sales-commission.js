import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        settledSelfCommissionOrderList: [],  //已结算自销佣金订单列表
        settledSelfCommissionStatistics:[], //已结算自销佣金统计
        startTimeStr:'',
        endTimeStr:'',
        pageNo: 1,
        pageSize: 10
    },
    ready: function() {

        //加载首屏内容
        this.getSettledSelfCommissionOrderList();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            this.pageNo += 1;
            this.getSettledSelfCommissionOrderList();
        });
        // 已结算自销佣金统计
        this.getSettledSelfCommissionStatistics();

        $('#startTime').datePicker({
            beginyear: 2010, //判断日期类型，给出合理区间
            endyear: new Date().getFullYear(), //日期--年--份结束
            theme: 'date',
            callBack: () => {
                this.startTimeStr = $('#startTime').val();
            }
        });
        $('#endTime').datePicker({
            beginyear: 2010, //判断日期类型，给出合理区间
            endyear: new Date().getFullYear(), //日期--年--份结束
            theme: 'date',
            callBack: () => {
                this.endTimeStr = $('#endTime').val();
            }
        });
    },
    methods: {

        //加载已结算自销佣金订单列表
        getSettledSelfCommissionOrderList: function() {
            var params = {
                ut: this.ut,
                startTimeStr:this.startTimeStr,
                endTimeStr:this.endTimeStr,
                pageNo: this.pageNo,
                pageSize: this.pageSize
            };
            Vue.api.get("" + "/api/seller/income/settledSelfCommissionOrderList", params, (result) => {

                // this.settledSelfCommissionOrderList = result.data.orderList;

                this.settledSelfCommissionOrderList = this.settledSelfCommissionOrderList.concat(result.data.orderList);

            });
        },
        // 搜索
        searchList: function() {
            if(!this.startTimeStr) {
                $.tips({
                    content: '请输入开始时间',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };
            if(!this.endTimeStr) {
                $.tips({
                    content: '请输入结束时间',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };
            if(!this.startTimeStr>this.endTimeStr) {
                $.tips({
                    content: '开始时间必须小于结束时间',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            // 重置
            this.settledSelfCommissionOrderList = [];
            this.pageNo = 1;

            this.getSettledSelfCommissionOrderList();

        },
        // 已结算自销佣金统计
        getSettledSelfCommissionStatistics: function() {
            var params = {
                ut: this.ut
            };
            Vue.api.get("" + "/api/seller/income/settledSelfCommissionSummary", params, (result) => {

                    this.settledSelfCommissionStatistics = result.data;

            });
        }


    }
});

