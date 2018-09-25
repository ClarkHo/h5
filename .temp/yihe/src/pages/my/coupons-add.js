import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";


new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
    	couponCode: ''
    },
    //初始化
    ready: function() {
    },
    methods: {
        //绑定优惠券
        bindCoupon: function () {
            var url = "" + '/api/my/coupon/bindCoupon';
            var param = {
                ut: Vue.auth.getUserToken(),
                companyId: Vue.mallSettings.getCompanyId(),
                couponCode: this.couponCode
            };
            Vue.api.postForm(url, param, (res) => {
                console.log(res);
                $.tips({
                    content: '添加成功',
                    stayTime: 2000,
                    type: "warn"
                });
                setTimeout(() => {
                    location.href = '/my/coupons-list.html';//优惠券中心
                }, 1000);

            });
        }
    }
});
