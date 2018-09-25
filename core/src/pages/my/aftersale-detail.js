import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiLogistics from "../../components/ui-logistics.vue";
import config from "../../../env/config.js";

const ut = Vue.auth.getUserToken();
let urlParams = Vue.utils.paramsFormat(window.location.href);
const orderAfterSalesId = urlParams.orderAfterSalesId;

var vm = new Vue({
    el: 'body',
    components: {
        UiHeader,
        UiLogistics
    },
    data: {
        //是否已输入运单号
        hasCourierNumber: false,
        logisticsCompany: "",
        showLogistics: false,
        courierNumber: "",
        afterSaleDetails: {},
        orderListType: urlParams.seller ? 3 : 2,
        detailUrl: urlParams.seller ? config.apiHost + "/api/seller/AfterSale/detail" : config.apiHost + "/api/my/orderAfterSale/afterSaleDetails",
        enableAfterSale: false
    },
    computed: {
        //交易金额
        orderAmount: function () {
            var total = 0;

            if (this.afterSaleDetails && this.afterSaleDetails.merchantProductVOs) {
                var products = this.afterSaleDetails.merchantProductVOs;
                products.forEach(function (item) {
                    total += item.productItemAmount || 0;
                });
            }

            return total;
        },

        //是否显示录入物流信息
        showCourierInput: function () {
            return !this.hasCourierNumber && this.afterSaleDetails.returnStatus == 2;
        }
    },
    ready: function() {
        this.loadAfterSaleDetails(orderAfterSalesId);
    },
    methods: {
        loadAfterSaleDetails: function() {
            var params = {
                ut: ut,
                companyId: Vue.mallSettings.getCompanyId(),
                orderAfterSalesId: orderAfterSalesId
            };
            Vue.api.get(this.detailUrl, params, (res) => {
                this.afterSaleDetails = res.data;
                if(this.afterSaleDetails.returnStatus == 3 || this.afterSaleDetails.returnStatus == 6) {
                    this.getAfterSaleStatus(this.afterSaleDetails.orderCode);
                }
            });
        },
        selectedLogistics: function (name) {
            this.logisticsCompany = name;
        },
        //获取是否可退换货状态
        getAfterSaleStatus: function(orderCode) {
            var params = {
                ut: ut,
                companyId: Vue.mallSettings.getCompanyId(),
                orderCode: orderCode
            };
            Vue.api.get(config.apiHost + "/api/my/orderAfterSale/isAfterSale", params, (result) => {
                if (result.data) {
                    this.enableAfterSale = result.data.isAfterSale == 1;
                }
            });
        },
        
        //保存退货单号
        saveCourierNo: function () {
            if (!this.logisticsCompany) {
                $.dialog({
                    title: "",
                    content: "请输入物流公司",
                    button: ["确认"]
                });

                return;
            }

            if (!this.courierNumber) {
                $.dialog({
                    title: "",
                    content: "请输入正确的物流单号",
                    button: ["确认"]
                });

                return;
            }

            var params = { ut: ut, companyId: Vue.mallSettings.getCompanyId(), orderAfterSalesId: orderAfterSalesId, courierNumber: this.courierNumber, logisticsCompany: this.logisticsCompany};
            Vue.api.postForm(config.apiHost + "/api/my/orderAfterSale/saveCourierNo", params, (res) => {
                this.hasCourierNumber = true;
            });
        },
        //取消退货申请
        cancelReturnProduct: function() {
            var dialog = $.dialog({
                title: "",
                content: "您确定取消退换货申请吗？",
                button: ["取消", "确认"]
            });

            dialog.on("dialog:action", (e) => {
                //点击确定按钮
                if (e.index == 1) {
                    var params = { ut: ut, companyId: Vue.mallSettings.getCompanyId(), returnCode: this.afterSaleDetails.returnCode };
                    Vue.api.postForm(config.apiHost + "/api/my/orderAfterSale/cancelReturnProduct", params, (res) => {
                       this.loadAfterSaleDetails();
                    });
                }
            });
        },
        //换货确认收货
        confirmComplete: function() {
            var params = {
                ut: ut,
                returnId: orderAfterSalesId
            };
            Vue.api.postForm(config.apiHost + "/api/my/orderAfterSale/confirm", params, (result) => {
                this.loadAfterSaleDetails();
            });
        }
    }
});
