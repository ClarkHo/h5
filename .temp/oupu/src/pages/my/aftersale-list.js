import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiOrderList from "../../components/ui-order-list.vue";
import UiCancelList from "../../components/ui-cancel-list.vue";
import UiAftersaleList from "../../components/ui-aftersale-list.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);

new Vue({
    el: 'body',
    components: { UiHeader, UiOrderList, UiAftersaleList,UiCancelList},
    data: {
        //当前用户的usertoken
        ut: Vue.auth.getUserToken(),
        //可申请售后的订单列表
        afterSaleableList: [],
        //已完成的售后列表
        saleListScuss:[],
        //退换货列表
        afterSaleList: [],
        //无退换货信息
        noAfterSale: false,
        pageNum: 1,
        pageSize: 10,
        totalCount: 0,
        //当前所在的tab页
        currentTab: urlParams.t || 1,
        orderListType: urlParams.seller ? 3 : 2 ,//2买家 3卖家
        afterSales:true,
        rightNavFlag:false,
        isEnd: false
    },
    //初始化
    ready: function() {
        //加载首屏内容
        if (this.currentTab == 2) {
            if(urlParams.seller) {
                this.getSellerAfterSaleList();
            }else {
                this.getAfterSaleList();
            }
        }else if(this.currentTab == 3){
            if(urlParams.seller) {
                this.getSellerAfterSaleListScuss();
            }else {
                this.getSaleListScuss();
            }
        }
        else {
            if(urlParams.seller) {
                this.getCanCancelOrders();
            }else {
                this.getAfterSaleableList();
            }
        }

        //滚动加载更多数据
        Vue.scrollLoading(() => {
            //可售后
            if (this.currentTab == 1) {
                if(this.afterSaleableList.length < this.totalCount) {
                    this.pageNum += 1;
                    if (urlParams.seller) {
                        this.getCanCancelOrders();
                    } else {
                        this.getAfterSaleableList();
                    }
                }else {
                    this.isEnd = true;
                }
            } else if (this.currentTab == 2){
                if(this.afterSaleList.length < this.totalCount) {
                    this.pageNum += 1;
                    if (urlParams.seller) {
                        this.getSellerAfterSaleList();
                    } else {
                        this.getAfterSaleList();
                    }
                }else {
                    this.isEnd = true;
                }
            }else{
                if(this.saleListScuss.length<this.totalCount) {
                    this.pageNum += 1;
                    if (urlParams.seller) {
                        this.getSellerAfterSaleListScuss();
                    } else {
                        this.getSaleListScuss();
                    }
                }else {
                    this.isEnd = true;
                }
            }

        });

    },

    methods: {
        switchTab: function (tab) {
            if (tab == this.currentTab) {
                return;
            }
            this.isEnd = false;
            this.currentTab = tab;
            this.pageNum = 1;

            //更新url的参数
            var url = location.pathname;
            if(tab > 0) {
                url += url.indexOf('?') > 0 ? '&t=' + tab : '?t=' + tab;
            }
            if(urlParams.seller == 1) {
                url += url.indexOf('?') > 0 ? '&seller=1' : '?seller=1';
            }
            window.history.replaceState(null, "", url);

            //可售后
            if (this.currentTab == 2) {
                this.afterSaleList = [];
                if(urlParams.seller) {
                    this.getSellerAfterSaleList();
                }else {
                    this.getAfterSaleList();
                }
            }else if(this.currentTab == 3){
                this.saleListScuss = [];
                if(urlParams.seller) {
                    this.getSellerAfterSaleListScuss();
                }else {
                    this.getSaleListScuss();
                }
            }
            else {
                this.afterSaleableList = [];
                if(urlParams.seller) {
                    this.getCanCancelOrders();
                }else {
                    this.getAfterSaleableList();
                }
            }
        },

        //获得可申请售后的订单列表
        getAfterSaleableList: function () {
            var params = {
                ut: this.ut,
                companyId: Vue.mallSettings.getCompanyId(),
                orderStatus: 20, //可售后订单
                pageNo: this.pageNum,
                pageSize: this.pageSize,
                cache:Date.now()
            };

            Vue.api.get("/api/my/order/list", params, (result) => {
                this.totalCount = result.data.totalCount;
                this.noAfterSale = this.totalCount == 0;
                if (result.data && result.data.orderList && result.data.orderList.length > 0) {
                    this.afterSaleableList = this.afterSaleableList.concat(result.data.orderList);
                }
            });
        },

        //加载用户的售后中的订单列表
        getAfterSaleList: function() {
            var params = {
                ut: this.ut,
                companyId: Vue.mallSettings.getCompanyId(),
                //afterSaleType: 1,//不传值 查所有
                // queryType:'1',//售后中
                pageNum: this.pageNum,
                pageSize: this.pageSize
            };

            Vue.api.get("/api/my/orderAfterSale/afterSaleList", params, (result) => {
                this.totalCount = result.data.total;
                this.noAfterSale = this.totalCount == 0;

                if (result.data && result.data.orderRefundVOs) {
                    this.afterSaleList = this.afterSaleList.concat(result.data.orderRefundVOs);
                }

            });
        },
        //售后已完成的列表
        getSaleListScuss: function() {
            var params = {
                ut: this.ut,
                companyId: Vue.mallSettings.getCompanyId(),
                afterSaleType: '',//不传值 查所有
                queryType:'2',//售后已完成
                pageNum: this.pageNum,
                pageSize: this.pageSize
            };

            Vue.api.get("/api/my/orderAfterSale/afterSaleList", params, (result) => {
                this.totalCount = result.data.total;
                this.noAfterSale = this.totalCount == 0;

                if (result.data && result.data.orderRefundVOs) {
                    this.saleListScuss = this.saleListScuss.concat(result.data.orderRefundVOs);
                }

            });
        },
        //取消订单申请列表
        getCanCancelOrders: function () {
            var params = {
                ut: this.ut,
                companyId: Vue.mallSettings.getCompanyId(),
                types: 1,
                pageNum: this.pageNum,
                pageSize: this.pageSize
            };
            Vue.api.postForm(config.apiHost + "/api/seller/AfterSale/list", params, (result) => {
                this.totalCount = result.data.total;
                this.noAfterSale = this.totalCount == 0;

                if (result.data.orderRefundVOs) {
                    this.afterSaleableList = this.afterSaleableList.concat(result.data.orderRefundVOs);
                }

            });
        },

        //查询卖家售后中列表
        getSellerAfterSaleList: function () {
            var params = {
                ut: this.ut,
                companyId: Vue.mallSettings.getCompanyId(),
                types: '2,4',
                //queryType:'1',//售后中
                pageNum: this.pageNum,
                pageSize: this.pageSize
            };
            Vue.api.postForm(config.apiHost + "/api/seller/AfterSale/list", params, (result) => {
                this.totalCount = result.data.total;
                this.noAfterSale = this.totalCount == 0;

                if (result.data.orderRefundVOs) {
                    this.afterSaleList = this.afterSaleList.concat(result.data.orderRefundVOs);
                }

            });
        },
        // //查询卖家售后已完成列表
        getSellerAfterSaleListScuss: function () {
            var params = {
                ut: this.ut,
                companyId: Vue.mallSettings.getCompanyId(),
                types: '2,4',
                queryType:'2',//售后已完成
                pageNum: this.pageNum,
                pageSize: this.pageSize
            };
            Vue.api.postForm(config.apiHost + "/api/seller/AfterSale/list", params, (result) => {
                this.totalCount = result.data.total;
                this.noAfterSale = this.totalCount == 0;

                if (result.data.orderRefundVOs) {
                    this.saleListScuss = this.saleListScuss.concat(result.data.orderRefundVOs);
                }

            });
        }


    }
});
