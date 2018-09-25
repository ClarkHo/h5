import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiActionsheetPop from "../../components/ui-actionsheet-pop.vue";
import config from "../../../env/config.js";

//let packageCode = Vue.utils.paramsFormat(window.location.href);
let urlParams = Vue.utils.paramsFormat(window.location.href);
var vm = new Vue({
    el: 'body',
    components: { UiHeader,UiActionsheetPop },
    data: {
        ut: Vue.auth.getUserToken(),
        orderCode: null,//订单编号
        packageCode:null,//包裹编号
        logistics: [],//物流信息
        logisticsList:[],
        detailTab: 1,
        showParcel: false,
        orderInfo:{},
        orderMsg:{},
        companyId: Vue.mallSettings.getCompanyId(),
        productList:[],
        childOrderList:[],
        packageList:[],
        orderList:[],
        backStoreFlags:{},
        packIndex:0,
        detailUrl: urlParams.seller ? config.apiHost + "/api/seller/order/detail" : config.apiHost + "/api/my/order/detail",
        msgUrl: urlParams.seller ? config.apiHost + "/api/seller/order/logistics": config.apiHost + "/api/my/order/newOrderMessage"
    },
    ready: function() {
        this.orderCode = urlParams.orderCode;
        if(urlParams.returnCode) {
            this.getOrderAfterSaleDelivery();
        }else {
            this.loadOrderDetail();    
        }
    },
    methods: {
        //加载用户订单数据
        loadOrderDetail: function() {
            var params = {
                ut: this.ut,
                companyId: Vue.mallSettings.getCompanyId(),
                orderCode: this.orderCode,
                v: '2.0'
            };
            Vue.api.get(this.detailUrl, params, (result) => {
                this.childOrderList = result.data.childOrderList;
                var packages=[];
                (result.data.childOrderList||[]).forEach((v)=>{
                    packages=packages.concat(v.packageList)
                })
                this.packageList=packages;
               if(this.packageList.length>0){
                    this.getNewOrderMessage(this.packageList[0].packageCode,1)
                }
               // this.productList = this.productList.concat(result.data.orderInfo.productList);
               // this.packageList = result.data.childOrderList.orderDeliveryFee;
                //this.packageCode = this.packageList.packageCode;
            });
        },
        getNewOrderMessage:function (packageCode,index) {
            if (this.detailTab != index) {
                this.detailTab = index;
            }
        
            if(!packageCode){
                $.tips({
                    content:"暂无数据，请耐心等待",
                    stayTime:2000,
                    type:"warn"
                });
                return;
            }
            if(this.backStoreFlags[packageCode]) {
                this.orderInfo=this.backStoreFlags[packageCode].orderInfo;
                this.orderMsg=this.backStoreFlags[packageCode].orderMessageList;
                return;
            }
            //this.productList=[];
            var params = {
                ut:this.ut,
                orderCode: this.orderCode,
                packageCode:packageCode,
                companyId:this.companyId,
                t:new Date().getTime()
            };

            Vue.api.get(this.msgUrl, params, (result) => {
                this.backStoreFlags[packageCode]=result.data;
                this.orderInfo=result.data.orderInfo;
                this.orderMsg=result.data.orderMessageList;
                // this.order= result.data;
                // this.orderList[index||1]=result.data;
                // this.orderMapping[packageCode]=result.data;
                //this.orderInfo = result.data.orderInfo;
                //this.logistics = this.logistics.concat(result.data.orderMessageList);
                this.productList = result.data.orderInfo.productList;
            });
        },
        //查询换货物流信息
        getOrderAfterSaleDelivery: function () {
            var url = config.apiHost + "/api/my/orderAfterSale/delivery";
            var params = {
                ut: this.ut,
                orderCode: this.orderCode,
                returnCode: urlParams.returnCode,
                exchangeCode: urlParams.exchangeCode
            };
            Vue.api.get(url, params, (result) => {
                if(result.data && result.data.orderInfo) {
                    this.orderInfo=result.data.orderInfo;
                    this.orderMsg=result.data.orderMessageList;
                    this.productList = result.data.orderInfo.productList;
                }
            });
        }
    }
});
