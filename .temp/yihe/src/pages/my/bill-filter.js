import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";


const filterFlag = Vue.utils.paramsFormat(window.location.href).filterFlag;

var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        myBill: [],  //筛选列表
        pageNo:1,
        pageSize:10,
        startTime:'2016-01-01',
        endTime:'2016-01-02',
        filterFlag:filterFlag,

    },
    ready: function() {
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
                this.endTime = $('#endTime').val();
            }
        });

        // this.ifFilterFlag();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            if(this.filterFlag==1){
                this.pageNo += 1;
                this.filterMyBill();
            }else if(this.filterFlag==2){
                this.pageNo += 1;
                this.filterMyIncomeBill();
            }
        });

    },
    methods: {
        // 判断是 购物 or 收益
        ifFilterFlag:function(){
            if(this.filterFlag==1){
                this.filterMyBill();
            }else if(this.filterFlag==2){
                this.filterMyIncomeBill();
            }
        },
        //筛选购物列表
        filterMyBill: function() {
            if(!this.startTime) {
                $.tips({
                    content: '请选择开始时间',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };
            if(!this.endTime) {
                $.tips({
                    content: '请选择结束时间',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };
            if(this.startTime>this.endTime) {
                $.tips({
                    content: '开始时间必须小于结束时间',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }else{
                var params = {
                    ut: this.ut,
                    pageNo:this.pageNo,
                    pageSize:this.pageSize,
                    startTimeStr:this.startTime,
                    endTimeStr:this.endTime
                };
                Vue.api.get("" + "/api/my/bill", params, (result) => {
                    // this.myBill = result.data.data;
                    this.myBill = this.myBill.concat(result.data.data);
                });
            };

        },
        //筛选收益列表
        filterMyIncomeBill: function() {
            if(!this.startTime) {
                $.tips({
                    content: '请选择开始时间',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };
            if(!this.endTime) {
                $.tips({
                    content: '请选择结束时间',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };
            if(this.startTime>this.endTime) {
                $.tips({
                    content: '开始时间必须小于结束时间',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }else{
                var params = {
                    ut: this.ut,
                    pageNo:this.pageNo,
                    pageSize:this.pageSize,
                    startTimeStr:this.startTime,
                    endTimeStr:this.endTime
                };
                Vue.api.get("" + "/api/seller/income/bill", params, (result) => {
                    // this.myBill = result.data.data;
                    this.myBill = this.myBill.concat(result.data.data);
                });
            };
        }


    }
});

