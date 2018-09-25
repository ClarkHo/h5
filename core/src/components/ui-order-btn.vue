<template>
    <div v-if="orderListType == 0 && order && order.sysSource == 'ody' || order.sysSource == 'INTEGRAL_MALL'" class="pdR5">
        <!--等待付款-->
        <div class="ui-flex ui-flex-pack-end" v-if="order.orderStatus==1">
            <button class="posR disIB mgR20 mgT5 c6" @click="showMoreBtn=!showMoreBtn" v-if="(order.invoice && order.invoice.pdfUrl)">
                更多
                <div class="more-btn-box noCommitOrder" v-if="showMoreBtn">
                    <span class="ui-border-b" v-if="order.invoice && order.invoice.pdfUrl" @click="previewInvoice(order.invoice.pdfUrl)">查看电票</span>
                </div>
            </button>
            <button class="ui-btn marT10 marR10 mgB10 f14" v-if="order.sysSource != 'op' && order.orderType2!=2&& order.sysSource != 'INTEGRAL_MALL'" @click="againBuy(order)">再次购买</button>
            <button class="ui-btn marT10 marR10 mgB10 f14" v-if="order.canCancel==1" @click="cancelOrder()">取消订单</button>
            <button class="ui-btn marT10 marR10 mgB10 f14" v-if="order.canRefund==1" @click="openCauseList">取消订单</button>
            <button class="ui-btn btn-gradient marT10 marR10 mgB10 f14" v-if="!order.presell.status || (order.presell.status != 10 && order.presell.status != 20 && order.presell.status != 25)" v-link-to-pay="order">去支付</button>
            <button class="ui-btn btn-gradient marT10 marR10 mgB10 f14" v-if="order.presell.status == 10" v-link-to-pay="order">支付定金</button>
            <button class="ui-btn bgDis marT10 marR10 mgB10 f14" disabled v-if="order.presell.status == 20" v-link-to-pay="order">支付尾款</button>
            <button class="ui-btn btn-gradient marT10 marR10 mgB10 f14" v-if="order.presell.status == 25" @click="prePayMent(order)">支付尾款</button>
        </div>
        <!--待发货-->
        <div class="ui-flex ui-flex-pack-end" v-if="order.orderStatus==2">
            <button class="posR disIB mgR20 mgT5 c6" @click="showMoreBtn=!showMoreBtn" v-if="(order.invoice && order.invoice.pdfUrl)">
                更多
                <div class="more-btn-box noCommitOrder" v-if="showMoreBtn">
                    <span class="ui-border-b" v-if="order.invoice && order.invoice.pdfUrl" @click="previewInvoice(order.invoice.pdfUrl)">查看电票</span>
                </div>
            </button>
            <button class="ui-btn f14 marR10" v-if="order.sysSource != 'op' && order.orderType2!=2&& order.sysSource != 'INTEGRAL_MALL'" @click="againBuy(order)">再次购买</button>
            <button class="ui-btn f14 marR10" v-link-to-userpage="'/order/salesService.html?orderCode=' + order.orderCode" v-if="order.canSalesService==1">补购服务</button>
            <button class="ui-btn f14 marR10" v-if="order.canRefund==1" @click="openCauseList">取消订单</button>
        </div>
        <!--待收货-->
        <div class="ui-flex ui-flex-pack-end" v-if="order.orderStatus==3">
            <button class="posR disIB mgR20 mgT5 c6" @click="showMoreBtn=!showMoreBtn" v-if="order.orderType2!=2 && (order.canSalesService==1 || order.sysSource != 'INTEGRAL_MALL')">
                更多
                <div class="more-btn-box noCommitOrder" v-if="showMoreBtn">
                    <span class="ui-border-b"  @click="previewInvoice(order.invoice.pdfUrl)">查看电票</span>
                    <span class="ui-border-b" v-if="order.sysSource != 'op' && order.orderType2!=2&& order.sysSource != 'INTEGRAL_MALL'" @click="againBuy(order)">再次购买</span>
                    <span class="ui-border-b" v-link-to-userpage="'/order/salesService.html?orderCode=' + order.orderCode" v-if="order.canSalesService==1">补购服务</span>
                </div>
            </button>
            <button class="ui-btn f14 marR10" v-if="order.canAfterSale==1" v-link-to="'/my/aftersale.html?orderCode=' + order.orderCode">申请售后</button>
            <button class="ui-btn f14 marR10" v-if="order.orderType2!=2" v-link-to="'/my/logistics-information.html?orderCode='+ order.orderCode">查看物流</button>
            <button class="ui-btn on f14" v-if="order.sysSource != 'op'" @click="confirmReceived(order)">确认收货</button>
        </div>
        <!--待评价-->
        <div class="ui-flex ui-flex-pack-end" v-if="order.orderStatus==4">
            <button class="ui-btn marT10 marR10 mgB10 f14" @click="deleteOrder(order)" v-if="order.canDelete==1">删除订单</button>
            <button class="ui-btn marT10 marR10 mgB10 f14"  v-if="order.canAfterSale == 1" v-link-to="'/my/aftersale.html?orderCode=' + order.orderCode">申请售后</button>
            <button class="ui-btn marT10 marR10 mgB10 f14" v-if="order.orderType2!=2" v-link-to="'/my/logistics-information.html?orderCode='+ order.orderCode">查看物流</button>
            <button class="ui-btn on marT10 mgB10 marR10 f14 theme"  v-if="order.canComment==1"  v-link-to="'/evaluate/publish-evaluate.html?mpId='+ order.orderCode">去评价</button>
        </div>
        <!-- 交易完成-->
        <div class="ui-flex ui-flex-pack-end posR" v-if="order.orderStatus==8">

            <button class="posR disIB mgR20 mgT5 c6" @click="showMoreBtn=!showMoreBtn" v-if="!(order.orderType2==2)">
              更多
                <div class="more-btn-box" v-if="showMoreBtn">
                    <!--<span @click="">购买配件</span> -->
                    <span class="ui-border-b" v-if="order.invoice && order.invoice.pdfUrl" @click="previewInvoice(order.invoice.pdfUrl)">查看电票</span>
                    <span class="ui-border-b" v-if="order.sysSource != 'op' && order.orderType2!=2&& order.sysSource != 'INTEGRAL_MALL'" @click="againBuy(order)">再次购买</span>
                    <span class="ui-border-b" v-link-to-userpage="'/order/salesService.html?orderCode=' + order.orderCode" v-if="order.canSalesService==1">补购服务</span>
                    <span class="ui-border-b" @click="deleteOrder(order)" v-if="order.canDelete==1">删除订单</span>
                </div>
            </button>

            <button class="ui-btn  f14" v-if="order.canAfterSale==1" v-link-to="'/my/aftersale.html?orderCode=' + order.orderCode">申请售后</button>
            <button class="ui-btn  f14" v-if="order.orderType2!=2" v-link-to="'/my/logistics-information.html?orderCode='+ order.orderCode">查看物流</button>
            <button class="ui-btn  on f14"  v-if="order.commentStatus==1" v-link-to="'/evaluate/publish-evaluate.html?mpId='+ order.orderCode">去评价</button>
        </div>
        <!--已取消-->
        <div class="ui-flex ui-flex-pack-end" v-if="order.orderStatus==10">
            <button class="ui-btn marT10 marR10 mgB10 f14" v-if="order.invoice && order.invoice.pdfUrl" @click="previewInvoice(order.invoice.pdfUrl)">查看电票</button>
            <button class="ui-btn marT10 marR10 mgB10 f14" v-if="order.sysSource != 'op' && order.orderType2!=2&& order.sysSource != 'INTEGRAL_MALL'"  @click="againBuy(order)">再次购买</button>
            <button class="ui-btn marT10 marR10 mgB10 f14"  @click="deleteOrder(order)" v-if="order.canDelete==1">删除订单</button>
        </div>
    </div>
    <div v-if="orderListType == 0 && order.sysSource!='ody' && order.sysSource!='INTEGRAL_MALL'" class="pdR5">
        <!--欧普第三方订单，就只展示这三个按钮 -->
        <div class="ui-flex ui-flex-pack-end">
            <button class="ui-btn f14 marR10" v-if="order.orderType2!=2"  v-link-to="'/my/logistics-information.html?orderCode='+ order.orderCode">查看物流</button>
            <button class="ui-btn f14 marR10" v-link-to-userpage="'/order/salesService.html?orderCode=' + order.orderCode" v-if="order.canSalesService==1">补购服务</button>
            <button class="ui-btn f14" @click="previewInvoice(order.invoice.pdfUrl)" v-if="order.invoice && order.invoice.pdfUrl">查看电票</button>
        </div>
    </div>
    <!-- 卖家订单详情底部按钮 -->
    <div v-if="orderListType == 1">
        <!--待收货-->
        <div class="ui-flex ui-flex-pack-end" v-if="order.orderStatus==3">
            <button class="ui-btn marT10 marR10 mgB10 f14" v-if="order.orderType2!=2"  v-link-to="'/my/logistics-information-seller.html?orderCode='+ order.orderCode">查看物流</button>
        </div>
        <!-- 交易完成-->
        <div class="ui-flex ui-flex-pack-end" v-if="order.orderStatus==8">
            <button class="ui-btn marT10 marR10 mgB10 f14" v-if="order.orderType2!=2" v-link-to="'/my/logistics-information-seller.html?orderCode='+ order.orderCode">查看物流</button>
        </div>
        <!--已取消-->
        <!--  <div class="ui-flex ui-flex-pack-end" v-if="order.orderStatus==10">
              <button class="ui-btn marT10 marR10 f14">删除订单</button>
          </div> -->
    </div>
    <ui-actionsheet-pop title="退货原因" :show.sync="showReturnCause">
        <ul class="ui-list return-list">
            <li class="ui-border-t" v-for="cause in afterSaleCauseList">
                <h4 class="ui-nowrap" @click="selectCause(cause)">{{cause.value}}</h4>
            </li>
        </ul>
    </ui-actionsheet-pop>
    <!--再次购买-->
    <div class="ui-dialog" :class="{show: diaShow}">
        <div class="ui-dialog-cnt bgw" style="width: 300px;">
            <div class="ui-dialog-bd">
                <div class="text-center">
                    <h4 class="c6">确认将以下商品加入购物车吗？</h4>
                    <div class="marT15">
                        <ul class="ui-list">
                            <li :class="{'ui-border-b':$index<availableProductList.length-1}" v-for="prod in availableProductList" style="margin-left: 0">
                                <div class="ui-list-thumb">
                                    <span :style="'background-image:url('+prod.picUrl+')'"></span>
                                </div>
                                <div class="ui-list-info text-left">
                                    <h4 class="ui-nowrap">{{prod.name}}</h4>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="ui-dialog-ft ui-btn-group">
                <button type="button" data-role="button" class="select" id="dialogButton0" @click="noSave">取消</button>
                <button type="button" data-role="button" id="dialogButton1" @click="addMyCar">加入购物车</button>
            </div>
        </div>
    </div>
</template>
<style lang="less">
    @import (reference) "../common/variables.less";
    .more-btn-box{
        position: absolute;
        background-color: @themeColor;
        border-radius: 4px;
        z-index: 98;
        bottom: 23px;
        left: -24px;
        &:after{
            display: block;
            position: absolute;
            bottom: -5px;
            left: 50%;
            margin-left: -3px;
            content: '';
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid @themeColor;
        }

        span{
            display: block;
            width: 48px;
            margin: 0 10px;
            padding: 0 2px;
            line-height: 30px;
            font-size: 12px;
            color: #fff;
            &:last-child:after{
            background-color: @themeColor;
            }
        }
    }
</style>
<script>
import Vue from "vue";
import config from "../../env/config.js";
import UiActionsheetPop from "./ui-actionsheet-pop.vue";
export default {
    data: function () {
        return {
            ut:Vue.auth.getUserToken(),
            showReturnCause:false,
            showMoreBtn: false,
            afterSaleCauseList:[],
            availableProductList:[],
            diaShow:false
        }
    },
    components:{UiActionsheetPop},
    props: ["order", "orderListType","refresh"],
    watch: {
        
    },
    ready:function(){
        
    },
    methods: {
        previewInvoice:function(url) {
            var a = document.createElement('a');    
            a.setAttribute('href', url);  
            a.setAttribute('style', 'display:none');    
            // a.setAttribute('target', '_blank');    
            document.body.appendChild(a);  
            a.click();  
            a.parentNode.removeChild(a);  
        },
        addMyCar:function(){
            var temp = [];
            for(var i in this.availableProductList){
                temp.push({"mpId":this.availableProductList[i].mpId,"num":this.availableProductList[i].num});
            }
            var params = {
                ut: Vue.auth.getUserToken(),
                sessionId: Vue.session.getSessionId(),
                skus: JSON.stringify(temp)
            };
            Vue.api.postForm(config.apiHost + "/api/cart/addItem", params, (res) => {
                //跳转购物车
                if(Vue.browser.isApp()) {
                    location.href = "${appSchema}://shoppingCart";
                    this.diaShow = false;
                } else {
                    location.href = '/cart.html';
                }
            })
        },
        noSave:function () {
            this.diaShow = false;
        },
        //删除订单
        deleteOrder: function (order) {
            if (!order) {
                return;
            }

            var dialog = $.dialog({
                title: "",
                content: "<div class='text-center'>您确定删除订单吗？</div>",
                button: ["取消", "确认"]
            });

            dialog.on("dialog:action", (e) => {
                this.showMoreBtn = false;
                e.preventDefault();
                e.stopPropagation();
                //点击确定按钮
                if (e.index == 1) {
                    var params = { ut: this.ut, orderCode: order.orderCode, companyId: Vue.mallSettings.getCompanyId() };
                    Vue.api.postForm("/api/my/order/delete", params, (result) => {
                        // this.loadOrderDetail();
                        Vue.utils.showTips("成功删除订单");
                        setTimeout(()=>{
                            this.goback();
                        }, 1000);
                    });
                }
            });
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
                    location.href = '/order/order-suc.html?orderCode='+order.orderCode + '&mpId=' + this.order.childOrderList[0].orderProductList[0].mpId;
                }
            });
        },
        //选择退换货原因
        selectCause: function(cause) {
            this.showReturnCause = false;
            var params = {
                ut: this.ut,
                companyId: Vue.mallSettings.getCompanyId(),
                orderCode: this.order.orderCode,
                refundReasonId: cause.key,
                refundRemark: cause.value
            };
            Vue.api.postForm(config.apiHost + "/api/my/orderAfterSale/applyRefund", params, (result) => {
                if(typeof this.refresh == 'function'){
                    this.refresh();
                }
                $.tips({
                    content: '已成功申请退货，请在售后服务查看进度。',
                    stayTime: 2000,
                    type: "success"
                });
            });
        },
        //获取退货原因列表
        getAfterSaleCauseList: function() {
            var params = {
                ut: this.ut,
                companyId: Vue.mallSettings.getCompanyId(),
                afterSaleType: 1
            };
            Vue.api.get(config.apiHost + "/api/my/orderAfterSale/afterSaleCauseList", params, (res) => {
                this.afterSaleCauseList = res.data.orderAfterSalesCauseVOs;
            });
        },
        openCauseList: function() {
            this.getAfterSaleCauseList();
            this.showReturnCause = true;
        },
        cancelOrder: function() {
            if (!this.order.orderCode) {
                return;
            }
            document.location.href='/order/cancelOrderReason.html?orderCode='+ this.order.orderCode;
        },
        prePayMent:function (order) {
            if(!order){
                return;
            }
            var params = {
                ut: Vue.auth.getUserToken(),
                businessType:6,
                orderCode:order.orderCode,
                merchantId: order.childOrderList[0].orderProductList[0].merchantId,
                platformId: config.platformId,
            };
            var skus = {
                "mpId":order.childOrderList[0].orderProductList[0].mpId,
                "num":order.childOrderList[0].orderProductList[0].num,
                "isMain":0
                }
            params.skus = JSON.stringify([skus])
            Vue.utils.quickPurchase(params,null,false);
        },
        //再次购买
        againBuy: function (order) {
            var params = {
                ut: this.ut,
                orderCode: order.orderCode
            };
            Vue.api.get(config.apiHost + "/api/my/order/getOrderStockState", params, (res) => {
                this.showMoreBtn = false;
                if(!res.data || res.data.availableProductList.length == 0){
                    $.tips({
                        content:"没有可再次购买的有效商品！",
                        stayTime:2000,
                        type:"success"
                    });
                    return;
                }
                if(res.data && res.data.availableProductList.length > 0){
                    this.availableProductList = res.data.availableProductList;
                    this.diaShow = true;
                }
            });
        },
    }
}
</script>
