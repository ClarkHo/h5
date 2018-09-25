import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import uiOrderListSimple from "../../components/ui-order-list-simple.vue";
import UiAftersaleList from "../../components/ui-aftersale-list.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);


new Vue({
    el: 'body',
    components: {
        UiHeader,uiOrderListSimple,UiAftersaleList
    },
    data:{
        ut:Vue.auth.getUserToken(),
        pageNo:1,
        pageSize:10,
        sysSource:'apply',
        orderList:[],
        loaded: false,//是否正在加载中
        searchWord: '',//搜索关键词
        totalNum: 0,
    },
    computed:{
        btnTitle:function () {
            if(this.sysSource == 'apply'){
                return '维修'
            } else if(this.sysSource == 'process'){
                return '查看详情'
            }
        }
    },
    methods:{
        //flag标识滚动加载还是初始化，search标识是否点击搜索按钮
        getOrderList:function (flag,search) {
            if (this.loaded) return;
            let url = config.apiHost + '/back-order-web/restful/order/queryOrderList.do';
            if(search){
                this.pageNo = 1;
            }
            let params = {
                ut:this.ut,
                status:25,//25可维修的订单列表
                currentPage:this.pageNo,
                itemsPerPage:this.pageSize,
                companyId:Vue.mallSettings.getCompanyId(),
                // orderType:
                // orderSource:
                // sysSource:this.sysSource
            };
            if(this.searchWord){
                params.keyword = this.searchWord;
            }
            this.loaded = true;
            Vue.api.postForm(url, params, (res) => {
                this.loaded = false; 
                if (!res.data || !res.data.listObj) {
                    return;
                }
                if(res.data.total == 0 && search){
                    Vue.utils.showTips('抱歉，没有找到你要的结果');
                }
                this.totalNum = res.data.total;
                res.data.listObj.forEach((item) => {
                    item.titleName = item.merchantName;
                    item.titleStatus = (function (status) {
                        switch (status) {
                            case 1:
                            return "待付款";
                            case 2:
                                return "待发货";
                            case 3:
                                return "待收货";
                            case 4:
                                return "待评价";
                            case 8:
                                return "已完成";
                            case 10:
                                return "已取消";
                            case 12:
                                return "送货失败";
                            case 20:
                                return "可售后";
                            case 25:
                                return "可维修";
                            default:
                                return "";
                        }
                    })(item.orderWebStatus);
                    item.orderItemListOutputVOList.forEach((v) => {
                        v.picUrl = v.productPicPath;
                    })
                    item.childList = item.orderItemListOutputVOList;
                    item.totalAmount = item.totalAmount;
                })
                if (flag) {
                    this.orderList = res.data.listObj || [];
                } else {
                    this.orderList = this.orderList.concat(res.data.listObj || []);
                }
            })
        },
        //获取维修进度列表
        getProcessList:function (flag,search) {
            if (this.loaded) return;
            let url = config.apiHost + '/api/my/orderAfterSale/afterSaleList';
            if(search){
                this.pageNo = 1;
            }
            let params = {
                ut:this.ut,
                status:25,//25可维修的订单列表
                pageNum:this.pageNo,
                pageSize:this.pageSize,
                companyId:Vue.mallSettings.getCompanyId(),
                afterSaleType:11,//维修订单列表
                // orderType:
                // orderSource:
                // sysSource:this.sysSource
            };
            if(this.searchWord){
                params.keyword = this.searchWord;
            }
            this.loaded = true;
            Vue.api.postForm(url, params, (res) => {
                this.loaded = false; 
                if (!res.data || !res.data.orderRefundVOs) {
                    return;
                }
                this.totalNum = res.data.total;
                res.data.orderRefundVOs.forEach((item) => {
                    item.titleName = item.merchantName;
                    item.titleStatus = item.statusDescribe;
                    item.afterSalesProductVOs.forEach((v) => {
                        v.picUrl = v.productPicPath;
                    })
                    item.childList = item.afterSalesProductVOs;
                    item.totalAmount = item.totalAmount;
                })
                if (flag) {
                    this.orderList = res.data.orderRefundVOs || [];
                } else {
                    this.orderList = this.orderList.concat(res.data.orderRefundVOs || []);
                }
            })
        },
        switchTab: function (type) {
            if (this.sysSource == type || this.loaded) return;
            // this.sysSource = type;
            Vue.set(this,'sysSource',type)
            this.pageNo = 1;
            this.orderList = [];
            switch (type) {
                case 'apply':
                    this.getOrderList(true);
                    break;
                case 'process':
                    this.getProcessList(true);
                    break;
            
                default:
                    break;
            }
        },
        goRepair:function (order) {
            // console.log(order);
            if(this.sysSource == 'apply'){
                location.href = '/serviceCenter/repair-list.html?orderCode=' + order.orderCode;
            } else if(this.sysSource == 'process'){
                location.href = '/serviceCenter/repair-detail.html?id=' + order.id;
            }
        }
    },
    ready:function () {
        this.getOrderList(true);
        Vue.scrollLoading(() => {
            if (this.totalNum > this.orderList.length && !this.loaded) {
                this.pageNo += 1;
                switch (this.sysSource) {
                    case 'apply':
                        this.getOrderList();
                        break;
                    case 'process':
                        this.getProcessList();
                        break;
                
                    default:
                        break;
                }
            }
        });
    },
});