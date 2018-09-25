import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        //当前用户的usertoken
        ut: Vue.auth.getUserToken(),
        //支付订单信息
        order: {},
        isApp: Vue.browser.isApp(),
        weixin: Vue.browser.weixin(),
    },
    ready: function() {
         //url params
        this.getOrderDetails();
    },
    methods: {
        getOrderDetails: function() {
            var params = { ut: this.ut, businessType: 1}; //1-拼团订单
            Vue.api.post(config.apiHost + "/api/checkout/showGroupBuyOrder", params, (result) => {
                this.order = result.data;
            });
        },

        //保存支付方式
        savePayment: function (paymentId) {
            var params = {ut: this.ut, paymentId: paymentId};

            Vue.api.postForm(config.apiHost + "/api/checkout/savePayment", params, (result) => {
                //do nothing
            });
        },

        //提交订单
        submitOrder: function () {
            var params = {
                ut: this.ut,
                merchantId: this.order.merchantId,
                platformId: config.platformId,
                businessType: 1 //1-拼团订单
            };

            Vue.api.postForm(config.apiHost + "/api/checkout/submitGroupBuyOrder", params, (result) => {
                if(Vue.browser.weixin()) {
                    location.href = Vue.utils.getPayUrl(result.data.orderCode + '_' + result.data.groupOrderCode,'&paystate=1');
                }else if(Vue.browser.isApp()) {
                    var url = '${appSchema}://pay?body={"orderCode":"'+ result.data.orderCode +'","amount":'+ result.data.amount +', "url": "'+
                                    Vue.utils.getPayBackUrl(result.data.orderCode + '_' + result.data.groupOrderCode)+'"}';
                    location.href = url;
                }else {
                    location.href = '/pay/pay-way.html?orderCode='+result.data.orderCode + '_' + result.data.groupOrderCode + '&paystate=1';
                }
            });
        },
        //地址选择url
        getAddressUrl: function () {
            var base = "/my/address-chose.html";
            if (this.order.receiver) {
                base += "?receiverId=" + this.order.receiver.receiverId;
            }
            base += base.indexOf('?') > 0 ? '&from=' + encodeURIComponent(Vue.utils.getRelatedUrl()) : '?from=' + encodeURIComponent(Vue.utils.getRelatedUrl());
            base += base.indexOf('?') > 0 ? '&type=1' : '';

            return base;
        },
        //返回跟踪云可用字符串
        returnHeimdall: function (data) {
            var str = '';
                for(var j in data) {
                    str += '{pri:"'+ data[j].mpId +'",prm:'+data[j].num+',prp:'+ data[j].productAmount +'},'
                }
            str = str.substring(0, str.length-1);
            str = '[' + str + ']';

            //$('#heimdall_el').attr('heimdall_products', str);
            return str;
        }
    }
});
