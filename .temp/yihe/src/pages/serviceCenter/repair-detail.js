import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import uiOrderListSimple from "../../components/ui-order-list-simple.vue";
import UiOrderBtn from "../../components/ui-order-btn.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);


new Vue({
    el: 'body',
    components: {
        UiHeader,uiOrderListSimple,UiOrderBtn
    },
    data:{
        ut:Vue.auth.getUserToken(),
        repairDetail:{},//维修详情
        connectOrder:[],//关联的订单
        showDetail:false,//展示关联的服务订单
        showCancelApply:false,//取消弹窗
    },
    methods:{ 
        getRepairDetail:function () {
            let url = config.apiHost + '/back-order-web/restful/afterSales/queryReturnMaintainInfo.do';
            let params = {
                ut:this.ut,
                returnId:urlParams.id
            }
            Vue.api.postForm(url,params,(res) => {
                this.repairDetail = res.data;
                if(res.data.returnCode){
                    this.getConectOrder();
                }
            })
        },
        getConectOrder:function () {
            let url = config.apiHost + '/back-order-web/restful/order/queryRelationOrderList.do';
            let params = {
                ut:this.ut,
                orderCode:this.repairDetail.returnCode
            }
            Vue.api.postForm(url,params,(res) => {
                if(res.data){
                    res.data.listObj.forEach((item) => {
                        item.orderStatus = item.orderWebStatus;
                        item.canCancel = item.canCancelOrder;
                        item.presell = {};
                    })
                    this.connectOrder = res.data.listObj || [];
                }
            })
        },
        cancelApply:function () {
            let url = config.apiHost + '/api/my/orderAfterSale/cancelReturnProduct';
            let params = {
                ut:this.ut,
                companyId:Vue.mallSettings.getCompanyId(),
                returnCode:this.repairDetail.returnCode
            }
            Vue.api.postForm(url,params,(res) => {
                Vue.utils.showTips('取消成功');
                setTimeout(function() {
                    history.back();
                }, 500);
            })
        }
    },
    ready:function () {
        this.getRepairDetail();
    },
    filters:{
        status:function (id) {
            switch (id) {
                case 1:
                    return '待审核'
                    break;
                case 3:
                    return '审核不通过'
                    break;
                case 5:
                    return '审核通过'
                    break;
                case 9:
                    return '已撤消'
                    break;
            
                default:
                    break;
            }
        }
    }
});