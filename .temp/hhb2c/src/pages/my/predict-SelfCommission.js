import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        predictSelfCommissionOrderList: [],  //预计自销佣金订单列表
        predictSelfCommissionStatistics:[], //预计自销佣金统计
        predictType:0,
        startTime:'',
        endTime:'',
        pageNo: 1,
        pageSize: 10
    },
    ready: function() {
        this.predictType = Vue.utils.paramsFormat(window.location.href).predictType;
        //加载首屏内容
        this.getPredictSelfCommissionOrderList();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            this.pageNo += 1;
            this.getPredictSelfCommissionOrderList();
        });
        // 预计自销佣金统计
        this.getPredictSelfCommissionStatistics();
        // 默认搜索时间为当前时间
        const year = new Date().getFullYear();
        const month = new Date().getMonth()+1;
        const strDate = new Date().getDate();
        const seperator = "-";
        var currentdate = year + seperator + month + seperator + strDate;
        this.startTime = currentdate;
        this.endTime = currentdate;
        document.getElementById("startTime").value = this.startTime;
        document.getElementById("endTime").value = this.endTime;
        // 初始化时间
        $('#startTime').datePicker({
            beginyear: 2010, //判断日期类型，给出合理区间
            endyear: new Date().getFullYear(), //日期--年--份结束
            theme: 'date',
            callBack: () => {
                this.startTime = $('#startTime').val();
            }
        });
        $('#endTime').datePicker({
            beginyear: 2010, //判断日期类型，给出合理区间
            endyear: new Date().getFullYear(), //日期--年--份结束
            theme: 'date',
            callBack: () => {
                this.endTime =  $('#endTime').val();
            }
        });
    },
    methods: {

        //加载预计自销佣金订单列表
        getPredictSelfCommissionOrderList: function() {

            var params = {
                ut: this.ut,
                startTimeStr:this.startTime,
                endTimeStr:this.endTime,
                pageNo: this.pageNo,
                pageSize: this.pageSize,
                predictType: this.predictType
            };
            Vue.api.get("" + "/api/seller/income/predictSelfCommissionOrderList", params, (result) => {

                // this.predictSelfCommissionOrderList = result.data.orderList;
                this.predictSelfCommissionOrderList = this.predictSelfCommissionOrderList.concat(result.data.orderList);

            });
        },
        // 搜索
        searchList: function() {
            // 08.9-08.29 有数据
            if(this.startTime>this.endTime) {
                $.tips({
                    content: '开始时间必须小于结束时间',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }else{
                // 重置
                this.predictSelfCommissionOrderList = [];
                this.pageNo = 1;

                this.getPredictSelfCommissionOrderList();
            }
        },
        // 预计自销佣金统计
        getPredictSelfCommissionStatistics: function() {
            var params = {
                ut: this.ut,
                predictType: this.predictType
            };

            Vue.api.get("" + "/api/seller/income/predictSelfCommissionSummary", params, (result) => {

                this.predictSelfCommissionStatistics = result.data;

            });
        }


    }
});

