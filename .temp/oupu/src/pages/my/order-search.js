import Vue from "vue";
import UiOrderList from "../../components/ui-order-list.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);

new Vue({
    el: 'body',
    components: { UiOrderList },
    data: {
        //当前用户的usertoken
        ut: Vue.auth.getUserToken(),
        orders: [],
        pageNo: 1,
        pageSize: 10,
        totalCount: 0,
        noOrder:false,
        keyword: "",
        searchUrl: urlParams.seller == 1 ? "" + "/api/seller/order/search" : "" + "/api/my/order/list"
    },
    ready: function() {
        this.searchOrders();
    },
    methods: {
        back: function () {
            history.back();
        },
        
         //搜索用户订单数据
        searchOrders: function() {
            if (!this.keyword) {
                return;
            }

            this.keyword = this.keyword.replace(/(^\s*)|(\s*$)/g, "");  
            var params = {
                ut: this.ut,
                keyword: $.trim(this.keyword),
                pageNo: this.pageNo,
                pageSize: this.pageSize,
                orderStatus:0,//查询所有
            };

            Vue.api.postForm(this.searchUrl, params, (result) => {
                this.loaded=true;
                this.totalCount = result.data.totalCount;
                this.noOrder = this.totalCount == 0;
                this.orders = result.data.orderList || [];
            });
        },

    }   
});
