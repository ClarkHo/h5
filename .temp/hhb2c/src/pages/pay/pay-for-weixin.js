import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);
let alipayUrl = urlParams.alipayUrl;
let orderNo = urlParams.orderNo;

new Vue({
    el: 'body',
    components: { UiHeader },
    data:{
        isWinxin: Vue.browser.weixin(),
        isPay: false
    },
    ready: function() {
        if(!this.isWinxin) {
            location.href = decodeURIComponent(alipayUrl);
        }
        //定时刷新订单状态
        setInterval(() => {
            if(!this.isPay) {
                this.getOrderDetail();
            }
        }, 1000);
    },
    methods:{
        //刷新订单详情
        getOrderDetail: function () {
            var params = {
                ut: Vue.auth.getUserToken(),
                companyId: Vue.mallSettings.getCompanyId(),
                orderCode: orderNo,
                v: '2.0'
            };
            Vue.api.get(config.apiHost + "/api/my/order/detail", params, (res) => {
                if(res.data.orderStatus != 1) {
                    this.isPay = true;
                    location.href = '/my/order-detail.html?orderCode='+orderNo;
                }
            });
        }
    }
})