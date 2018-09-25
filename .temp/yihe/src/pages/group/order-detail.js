import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        //当前用户的usertoken
        ut: Vue.auth.getUserToken(),
        //订单编号
        orderCode: null,
        //订单列表
        order: {},
        isApp: Vue.browser.isApp(),
        weixin: Vue.browser.weixin(),
        cancleTimeStr: "",
        sysTime:0
    },

    //初始化
    ready: function() {
        this.orderCode = Vue.utils.paramsFormat(window.location.href).orderCode;
        this.loadOrderDetail();
        Vue.getSysTime((res)=>{
            this.sysTime=res.data.timestamp||0;
        })
    },

    methods: {
        //加载用户订单数据
        loadOrderDetail: function() {
            var params = { ut: this.ut, orderCode: this.orderCode };
            // this.order = testData.data;
            Vue.api.get(config.apiHost + "/api/my/order/detail", params, (result) => {
                this.order = result.data;
                this.getCancleTime(this.order.cancelTime);
            });
        },
        getCancleTime: function(cancleTime) {
            var _this = this;
            var ct = cancleTime;
            _this.cancleTimeStr = _this.timeSwitch(ct);
            var timeChange = setInterval(function() {
                ct = ct - 1;
                if (ct == 0) {
                    _this.cancelOrder();
                    clearInterval(timeChange);
                }
                _this.cancleTimeStr = _this.timeSwitch(ct);
            }, 1000)
        },
        timeSwitch: function(time) {
            time = parseInt(time);
            if (time <= 0) time = 0;
            var s = time >= 60 ? time % 60 : time;
            var m = parseInt((time >= 3600 ? time % 3600 : time) / 60);
            var h = parseInt((time >= 86400 ? time % 86400 : time) / 3600);
            var d = parseInt(time / 86400);
            d = d == 0 ? '' : d + '天';
            h = h == 0 && d == '' ? '' : h + '小时';
            m = m == 0 && h == '' ? '' : m + '分';
            s = s == 0 && m == '' ? '' : s + '秒';
            return d + h + m + s;
        },
        //确认收货
        confirmReceived: function(order) {
            var dialog = $.dialog({
                title: "",
                content: "您确定收货吗？",
                button: ["取消", "确认"]
            });

            dialog.on("dialog:action", (e) => {
                //点击确定按钮
                if (e.index == 1) {
                    var params = { ut: this.ut, orderCode: order.orderCode };
                    Vue.api.postForm(config.apiHost + "/api/my/order/confirmReceived", params, (result) => {
                        //更改订单为已完成
                        order.orderStatus = 8;
                    });
                }
            });
        },

        cancelOrder: function() {
            if (!this.order.orderCode) {
                return;
            }

            var dialog = $.dialog({
                title: "",
                content: "您确定要取消订单吗？",
                button: ["取消", "确认"]
            });

            dialog.on("dialog:action", (e) => {
                //点击确定按钮
                if (e.index == 1) {
                    var params = { ut: this.ut, orderCode: this.orderCode };
                    Vue.api.postForm(config.apiHost + "/api/my/order/cancel", params, (result) => {
                        //更改订单为已取消状态
                        this.order.orderStatus = 10;
                    });
                }
            });

        },
        //针对拼团订单的去支付链接
        goPayWay: function (orderCode, instId) {
            instId = instId ? '_' + instId : '';
            if(Vue.browser.weixin()) {
                location.href = Vue.utils.getPayUrl(orderCode + instId);
            }else if(Vue.browser.isApp()) {
                var url = '${appSchema}://pay?body={"orderCode":"'+ orderCode +'","amount":'+ this.order.paymentAmount +', "url": "'+
                                    Vue.utils.getPayBackUrl(orderCode + '_' + instId)+'"}';
                location.href = url;
            }else {
                location.href = '/pay/pay-way.html?orderCode='+ orderCode + instId;
            }
        }

    } //~ end methods

});
