import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);

var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        afterSaleCauseList:[],//取消订单原因列表
        cancelRemark:'',//其他原因
        cancelReasonId:'',//选中的原因id
    },
    ready: function() {
        this.getAfterSaleCauseList();
    },
    methods: {
        // 获取取消订单原因列表
        getAfterSaleCauseList: function() {
            var params = {
                afterSaleType: 1 //  取消/退款-1  退货-2； 换货-4
            };
            Vue.api.get(config.apiHost + "/api/my/orderAfterSale/afterSaleCauseList", params, (res) => {

                if(res.data.orderAfterSalesCauseVOs) {
                    (res.data.orderAfterSalesCauseVOs || []).forEach(function (v) {
                        v.isChecked = false;
                        switch (v.key){
                            case 1:
                                v.value = '运费多收了，我要重新买';
                                break;
                            case 2:
                                v.value = '我要退货、退运费';
                                break;
                            case 3:
                                v.value = '我要补退差价';
                                break;
                            case 4:
                                v.value = '我要退货、退款';
                                break;
                            case 5:
                                v.value = '商品及包装有损坏';
                                break;
                            case 6:
                                v.value = '商品发货与订单不符';
                                break;
                            case 7:
                                v.value = '实际发货少于订单商品';
                                break;
                            case 8:
                                v.value = '快递寄送有破损';
                                break;
                            case 9:
                                v.value = '发货缺失，需要部分退款';
                                break;
                        }
                    })
                };

                this.afterSaleCauseList = res.data.orderAfterSalesCauseVOs;

            }, () => {
                //处理掉不显示报错
            });
        },
        // 取消订单
        cancelOrder: function() {
            if(!this.cancelReasonId){
                $.tips({
                    content: '请选择取消原因',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            var params = {
                ut: Vue.auth.getUserToken(),
                orderCode: urlParams.orderCode,
                cancelReasonId:this.cancelReasonId,
                cancelRemark:this.cancelRemark,
            };
            Vue.api.get(config.apiHost + "/api/my/order/cancel", params, (res) => {
                //跟踪云埋点 取消订单成功
                try {
					window.eventSupport.emit('heimdallTrack', {
						ev: "8",
                        oid: urlParams.orderCode
					});
				} catch (err) {
					console.log(err);
				}
                $.tips({
                    content: '订单取消成功',
                    stayTime: 2000,
                    type: "warn"
                });
                setTimeout(function () {
                    history.back();
                },2000)
            }, (res) => {
                //处理掉不显示报错
                Vue.utils.showTips(res.message);
            });
        },
        ifCheckReason:function (item) {
            //取消选中
            if (item.isChecked == true) {
                item.isChecked = false;
                return;
            }
            //选中
            if (item.isChecked == false) {
                (this.afterSaleCauseList|| []).forEach(function (v) {
                    v.isChecked = false;
                });
                item.isChecked = true;
                return;
            }
        }
    },
    computed:{
        cancelReasonId: function () {
            var cancelReasonId = null;
            for (let p of this.afterSaleCauseList || []) {
                if (p.isChecked == true)
                    cancelReasonId = p.key
            }
            return cancelReasonId;
        },
    }
});

