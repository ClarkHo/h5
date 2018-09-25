<template>
    <div>
        <ul>
            <li class="bgw marT10 padB10" v-for="order in orders">
                <ul class="ui-list ui-list-text ui-border-b">
                    <li class="verLine">
                        <div class="ui-list-info">
                            <h4  class="ui-nowrap f14" v-if="order.merchantName&&(order.sysSource=='ody' || order.sysSource=='INTEGRAL_MALL')"><i class="icons4 order-home mgR5 mgT-5"></i>{{order.merchantName}}</h4>
                            <h4  class="ui-nowrap f14" v-if="(order.sysSource!='ody' && order.sysSource!='INTEGRAL_MALL')"><i class="icons4 order-home mgR5 mgT-5"></i>{{order.storeName||order.merchantName}}</h4>
                            
                            <i v-if="order.orderPromotionType == 1 || order.orderPromotionType == 5" class="icons2" :class="{'icons2-pintuan':order.orderPromotionType == 1,'icons2-kanjia':order.orderPromotionType == 5}"></i>
                             <!--<h4  class="ui-nowrap" v-if=""><i class="icons4 order-homeDefault mgR5"></i>第三方商家</h4>-->
                            <!--<h4 class="ui-nowrap">订单号：{{order.orderCode}}</h4>-->
                        </div>
                        <!--待付款、待收货、待发货需要class .aid 变红色 完成、取消不用-->
                        <div class="ui-list-action theme" v-if="order.sysSource=='ody' || order.sysSource=='INTEGRAL_MALL'" :class="{'aid':order.orderStatus==8||order.orderStatus==10}">
                            <span v-if="order.presell && (order.presell.status == 20 ) && order.orderStatus == 1">{{order.presell.startTime | datetime 'MM月dd日hh:mm:ss'}}&nbsp;开始支付尾款</span>
                            <span v-if="order.presell && (order.presell.status == 25) && order.orderStatus == 1">{{order.presell.endTime | datetime 'MM月dd日hh:mm:ss'}}&nbsp;前支付尾款</span>
                            <span v-if="!order.presell.status || (order.presell.status!=20 && order.presell.status!=25) || order.orderStatus != 1">{{order.orderStatusName}}</span>
                        </div>
                    </li>
                </ul>
                <div v-if="!order.presell.status" class="ui-row-flex div-img ui-next" v-link-to="'/my/order-detail.html?orderCode='+order.orderCode + (forAftersale ? '&refer=aftersale': '') + (orderType == 1 ? '&seller=1' : '')">
                    <div class="ui-col ui-col-3 limitDiv">
                        <img :src="product.url160x160"  v-for="product in order.productList | limitBy  3" width="60" height="60" class="marR10 ui-border">
                    </div>
                    <div class="ui-col ui-flex ui-flex-ver ui-flex-pack-center ui-flex-align-start c6 text-right padR10">共{{order.totalCount}}件商品</div>
                    <i class="icons icons-next"></i>
                </div>
                <ul class="ui-list" v-else v-link-to="'/my/order-detail.html?orderCode='+order.orderCode + (forAftersale ? '&refer=aftersale': '') + (orderType == 1 ? '&seller=1' : '')">
                    <li class="presell-pro">
                        <div class="ui-list-thumb">
                            <img :src="product.url160x160"  v-for="product in order.productList | limitBy  1" width="60" height="60" class="marR10 ui-border">
                        </div>
                        <div class="ui-list-info">
                            <p class="ui-nowrap-multi">
                               <span class="bdTheme theme pdR5 pdL5">预售</span> {{order.productList[0].name}}
                            </p>
                            <ul class="ui-row-flex price">
                                <li class="ui-col ui-flex ui-flex-pack-start c6">
                                    <span class="f14">{{ order.productList[0].price | currency '¥'}}</span>
                                </li>
                                <li class="ui-col pdR15 ui-flex ui-flex-pack-end c9">x<span class="c3">{{order.totalCount}}</span></li>
                            </ul>
                        </div>
                    </li>
                </ul>
                <ul class="ui-list ui-list-text ui-border-t marL15 myUl">
                    <li class="marL0" v-if="!afterSales">
                        <div class="ui-list-info">
                            <h4 class="ui-nowrap">&nbsp;</h4>
                        </div>
                        <div class="ui-list-action">
                            <span v-if="(!order.presell.status || order.presell.status > 25) && order.presell.status != 30">合计</span>
                            <span v-if="order.presell && order.presell.status == 10">应付定金</span>
                            <span v-if="order.presell && (order.presell.status == 20 || order.presell.status == 25|| order.presell.status == 30)">
                                应付尾款：
                            </span>
                            <i class="theme" v-if="!order.presell.status || (order.presell.status == 10)">{{(order.presell.downPrice || order.amount) | currency '¥'}}</i>
                            <i class="theme" v-if="order.presell && (order.presell.status == 20 || order.presell.status == 25|| order.presell.status == 30)">{{order.presell.finalPayment | currency '¥'}}</i>
                            <i class="theme" v-if="order.presell && order.presell.status > 25 && order.presell.status != 30">{{order.presell.totalPrice | currency '¥'}}</i>
                        </div>
                    </li>
                    <li class="padB0" v-if="afterSales&&orderType == 2">
                        <div class="ui-list-info">
                            <h4 class="ui-nowrap f14">合计：<i class="theme myTotal">{{order.amount | currency '¥'}}</i></h4>
                        </div>
                        <div class="ui-list-action">  <button class="ui-btn border-btn  f14" v-link-to="'/my/aftersale.html?orderCode=' + order.orderCode">申请售后</button></div>
                    </li>
                </ul>
                <!-- 买家订单 -->
                <div v-if="orderType == 0 && (order.sysSource=='ody' || order.sysSource=='INTEGRAL_MALL')">
                    <!--待付款-->
                    <div class="txtr padR10" v-if="order.orderStatus==1">
                        <button class="ui-btn border-btn f14 marR10" v-if="!order.presell.status && order.orderType2!=2 && order.sysSource != 'INTEGRAL_MALL'" @click="againBuy(order)">再次购买</button>
                        <button class="ui-btn border-btn f14 marR10" v-if="order.canCancel==1" @click="cancelOrder(order)">取消订单</button>
                        <button class="ui-btn border-btn f14 marR10" v-if="order.canRefund==1" @click="openAfterSaleCauseList(order)">取消订单</button>
                        <button class="ui-btn btn-gradient f14 bgff6900" v-if="!order.presell.status || (order.presell.status != 10 && order.presell.status != 20 && order.presell.status != 25)" v-link-to-pay="order">去支付</button>
                        <button class="ui-btn btn-gradient f14 bgff6900"  v-if="order.presell.status == 10" v-link-to-pay="order">支付定金</button>
                        <button class="ui-btn cf f14 bgDis" disabled v-if="order.presell.status == 20">支付尾款</button>
                        <button class="ui-btn btn-gradient f14 bgff6900" v-if="order.presell.status == 25" @click="payMent(order)">支付尾款</button>

                    </div>
                    <!--待发货(欧普不可以取消待发货的订单)-->
                     <div class="ui-flex ui-flex-pack-end padR10" v-if="order.orderStatus==2">
                        <button class="ui-btn border-btn f14 marR10" v-if="order.sysSource != 'op' && order.orderType2!=2 && order.sysSource != 'INTEGRAL_MALL'" @click="againBuy(order)">再次购买</button>
                        <button class="ui-btn f14 marR10" v-link-to-userpage="'/order/salesService.html?orderCode=' + order.orderCode" v-if="order.canSalesService==1 || order.sysSource == 'op'">补购服务</button>
                        <button class="ui-btn border-btn f14 marR10" v-if="order.canRefund==1" @click="openAfterSaleCauseList(order)">取消订单</button>
                    </div>
                    <!--待收货-->
                    <div class="ui-flex ui-flex-pack-end padR10 posR" v-if="order.orderStatus==3">
                        <!--<button class="ui-btn border-btn  f14" @click="delayOrder(order)">延长收货</button>-->
                        <span class="posR disIB mgR20 mgT5 c6" @click="order.moreFlag=!order.moreFlag" v-if="order.orderType2!=2 && (order.canSalesService==1 || order.sysSource != 'INTEGRAL_MALL')">
                            更多
                            <div class="more-btn-box noCommitOrder hide" :class="{'show':order.moreFlag}">
                                <span class="ui-border-b" v-link-to-userpage="'/order/salesService.html?orderCode=' + order.orderCode" v-if="order.canSalesService==1 && order.orderType2!=2">补购服务</span>
                                <span class="ui-border-b" v-if="order.sysSource != 'op' && order.orderType2!=2 && order.sysSource != 'INTEGRAL_MALL'" @click="againBuy(order)">再次购买</span>
                            </div>
                        </span>

                        <button class="ui-btn border-btn f14" v-if="order.canAfterSale==1" v-link-to="'/my/aftersale.html?orderCode=' + order.orderCode">申请售后</button>
                        <button class="ui-btn f14 marR10" v-if="order.orderType2!=2 || order.sysSource == 'op'" v-link-to="'/my/logistics-information.html?orderCode='+ order.orderCode">查看物流</button>
                        <button class="ui-btn border-btn on f14" v-if="order.sysSource != 'op'" @click="confirmReceived(order)">确认收货</button>
                    </div>
                    <!--待评价   实际上接口不会返回状态为4的数据，而是返回8已完成的状态，根据canComment字段判断是否可以评价  -->
                    <div class="ui-flex ui-flex-pack-end padR10" v-if="order.orderStatus==4">
                        <button class="ui-btn border-btn on f14 marR10" v-if="order.canComment" v-link-to="'/evaluate/publish-evaluate.html?mpId='+ order.orderCode">去评价</button>
                        <button class="ui-btn border-btn f14 marR10" @click="deleteOrder(order)" v-if="order.canDelete==1">删除订单</button>
                        <button class="ui-btn f14" v-if="order.orderType2!=2 || order.sysSource == 'op'" v-link-to="'/my/logistics-information.html?orderCode='+ order.orderCode">查看物流</button>
                    </div>
                    <!--已完成-->
                    <div class="ui-flex ui-flex-pack-end padR10" v-if="order.orderStatus==8">   
                        <span class="posR disIB mgR20 mgT5 c6" @click="order.moreFlag=!order.moreFlag" v-if="(order.sysSource != 'op' && order.orderType2 != 2) || order.canSalesService == 1 || order.canDelete == 1">
                          更多
                            <div class="more-btn-box noCommitOrder hide" :class="{'show':order.moreFlag}">
                                <!--<span @click="">购买配件</span> -->
                                <span class="ui-border-b" v-if="order.orderType2!=2 && order.sysSource != 'INTEGRAL_MALL'" @click="againBuy(order)">再次购买</span>
                                <span class="ui-border-b" v-link-to-userpage="'/order/salesService.html?orderCode=' + order.orderCode" v-if="order.canSalesService==1">补购服务</span>
                                <span class="ui-border-b" @click="deleteOrder(order)" v-if="order.canDelete==1">删除订单</span>
                            </div>
                        </span>
                        <button class="ui-btn border-btn f14" v-if="order.canAfterSale==1" v-link-to="'/my/aftersale.html?orderCode=' + order.orderCode">申请售后</button>
                        <button class="ui-btn border-btn f14" v-if="order.orderType2!=2 || order.sysSource == 'op'" :class="{marR10:order.commentStatus==1}" v-link-to="'/my/logistics-information.html?orderCode='+ order.orderCode">查看物流</button>
                        <button class="ui-btn border-btn on f14"  v-if="order.commentStatus==1" v-link-to="'/evaluate/publish-evaluate.html?mpId='+ order.orderCode">去评价</button>
                    </div>
                    <!--已取消-->
                    <div class="ui-flex ui-flex-pack-end padR10" v-if="order.orderStatus==10">
                        <button class="ui-btn border-btn f14 marR10" v-if="order.sysSource != 'op' && order.orderType2!=2 && order.sysSource != 'INTEGRAL_MALL'" @click="againBuy(order)">再次购买</button>
                        <button class="ui-btn border-btn f14" @click="deleteOrder(order)" v-if="order.canDelete==1">删除订单</button>
                    </div>
                </div>
                <div v-if="orderType == 0 && order.sysSource!='ody' && order.sysSource!='INTEGRAL_MALL'">
                    <!--欧普第三方订单，就只展示这三个按钮 -->
                     <div class="ui-flex ui-flex-pack-end padR10">
                        <button class="ui-btn f14 marR10" v-if="order.orderType2!=2" v-link-to="'/my/logistics-information.html?orderCode='+ order.orderCode">查看物流</button>
                        <button class="ui-btn f14 marR10" v-link-to-userpage="'/order/salesService.html?orderCode=' + order.orderCode" v-if="order.canSalesService==1">补购服务</button>
                        <!--<button class="ui-btn border-btn f14 marR10"  v-link-to="'/serviceCenter/view-invoice.html?orderCode='+order.orderCode" v-if="order.canQueryElectronicInvoice == 1">查看发票</button>-->
                    </div>
                </div>

                <!-- 买家售后 -->
                <!--<div v-if="orderType == 2">-->
                    <!--<div class="ui-flex ui-flex-pack-end padR10">-->

                    <!--</div>-->
                <!--</div>-->

                <!-- 卖家订单 -->
                <div v-if="orderType == 1">
                    <!--待收货-->
                    <div class="ui-flex ui-flex-pack-end padR10" v-if="order.orderStatus==3">
                        <button class="ui-btn f14" v-link-to="'/my/logistics-information.html?seller=1&orderCode='+ order.orderCode">查看物流</button>
                    </div>
                    <!--已完成-->
                    <div class="ui-flex ui-flex-pack-end padR10" v-if="order.orderStatus==8">
                        <button class="ui-btn border-btn f14" v-link-to="'/my/logistics-information.html?seller=1&orderCode='+ order.orderCode">查看物流</button>
                    </div>
                </div>

            </li>
        </ul>
        <ui-actionsheet-pop title="请选择原因" :show.sync="showReturnCause">
            <ul class="ui-list return-list">
                <li class="ui-border-t" v-for="cause in afterSaleCauseList">
                    <h4 class="ui-nowrap" @click="selectReturnCause(cause)">{{cause.value}}</h4>
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
    </div>
</template>
<style lang="less">
@import (reference) "../common/variables.less";
    .myUl{
        width:auto;
    }
    .div-img{
        padding:12px 15px;
    }
    .verLine{
        position:relative;
    }
    .verLine:before{
        content: '';
        position: absolute;
        width: 4px;
        height: 14px;
        background: @themeColor;
        left: -10px;
        top: 15px;

    }
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
            border-top: 6px solid @themeColor
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
    @media screen and (max-width: 320px) {
        .ui-btn{
            padding: 0 2px;
        }
    }
    .presell-pro{
        .ui-list-thumb{
            margin: 15px 12px 15px 0;
            width: auto;
            height: auto;
        }

        .ui-list-info{
            padding: 15px 12px 15px 0;
            -webkit-box-pack: start;
            position: relative;

            p{
                color: @fontColor;
                line-height: 24px;
            }

            .name{
                line-height: 16px;
                height: 32px;
            }

            .price{
                position: absolute;
                width: 100%;
                bottom: 20px;
                left: 0;
            }
        }
    }
</style>
<script>

    import Vue from "vue";
    import UiActionsheetPop from "./ui-actionsheet-pop.vue";
    import config from "../../env/config.js";
    //user token
    const ut = Vue.auth.getUserToken();

    export default {
        components: { UiActionsheetPop },
        props: ["orders", "orderType","delete","afterSales","sysSource","showReturnCause"],  //0买家订单 1卖家订单 2买家售后 3卖家售后
        data: function () {
            return {
                // showReturnCause: false,
                afterSaleCauseList: null,
                //保存当前退货的订单
                refundOrder: null,
                diaShow:false,
                availableProductList:[],//再次购买
            };
        },
        watch:{
            'orders':function (val, old) {
                if(val.length > 0){
                    val.forEach((item) => {
                        if(item.moreFlag == undefined){
                            Vue.set(item,'moreFlag', false);
                        }
                    })
                }
            }
        },
        methods: {
            //申请售后
            applyAfterSales: function (order) {
                if (!order) {
                    return;
                }

                var dialog = $.dialog({
                    title: "延长收货",
                    content: "<div class='text-center'>您还没有确认收货，是否确认收货后继续售后申请？</div>",
                    button: ["取消", "确认"]
                });

                dialog.on("dialog:action", (e) => {
                    e.preventDefault();
                e.stopPropagation();
                //点击确定按
                //点击确定按钮
                if (e.index == 1) {
                    var params = { ut: ut, orderCode: order.orderCode };
                    Vue.api.postForm("/api/my/order/confirmReceived", params, (result) => {
                        //更改订单为已完成
                        for (var i = 0; i < this.orders.length; i++) {
                        if (this.orders[i].orderCode == order.orderCode) {
                            this.orders[i].orderStatus = 8;
                            this.orders[i].orderStatusName = "已完成";
                            break;
                        }
                    }
                    location.href ='/my/aftersale.html?orderCode=' + order.orderCode ;
                });
                }
            });
            },
            //确认收货
            confirmReceived: function(order) {
                var dialog = $.dialog({
                    title: "",
                    content: "<div class='text-center'>您确定收货吗？</div>",
                    button: ["取消", "确认"]
                });

                dialog.on("dialog:action", (e) => {
                    //点击确定按钮
                    if (e.index == 1) {
                    var params = { ut: ut, orderCode: order.orderCode };
                    Vue.api.postForm("/api/my/order/confirmReceived", params, (result) => {
                        //更改订单为已完成
                        for (var i = 0; i < this.orders.length; i++) {
                        if (this.orders[i].orderCode == order.orderCode) {
                            this.orders[i].orderStatus = 8;
                            this.orders[i].orderStatusName = "已完成";
                            break;
                        }
                    }
                    location.href = '/order/order-suc.html?orderCode='+order.orderCode;
                });
                }
            });
            },

            //取消订单
            cancelOrder: function(order) {
                if (!order) {
                    return;
                };
                document.location.href='/order/cancelOrderReason.html?orderCode='+ order.orderCode;
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
                    e.preventDefault();
                e.stopPropagation();
                //点击确定按钮
                if (e.index == 1) {
                    var params = { ut: ut, orderCode: order.orderCode, companyId: Vue.mallSettings.getCompanyId() };
                    Vue.api.postForm("/api/my/order/delete", params, (result) => {
                        //ui上删除该订单
                        for (var i = 0; i < this.orders.length; i++) {
                        if (this.orders[i].orderCode == order.orderCode) {
                            this.orders.splice(i, 1);
                            return;
                        }
                    }
                });
                }else{
                    this.delete=false;
                }
            });
            },
            //获取退货的跟踪云数据
            getHeimdallParams: function(order) {
                let idArr = [];
                let numArr = [];
                let prod;

                for (let i = 0; i < order.productList.length; i++) {
                    prod = order.productList[i];
                    idArr.push(prod.mpId);
                    numArr.push(prod.num);
                }
                //console.log(this.parentOrderCode == null);
                var heimdallParam = {
                    ev: "9",
                    oid: order.orderCode,
                    pri: idArr.join(','),
                    prm: numArr.join(',')
                }

                return heimdallParam;
                // $('#heimdall_el').attr('heimdall_productid', idArr.join(','));
                // $('#heimdall_el').attr('heimdall_productnum', numArr.join(','));
                // $('#heimdall_el').click();
            },
            //退款
            applyRefund: function (order, cause) {
                var params = {ut: ut, companyId: Vue.mallSettings.getCompanyId(), orderCode: order.orderCode,
                    refundReasonId: cause.key, refundRemark: cause.value};
                Vue.api.postForm("/api/my/orderAfterSale/applyRefund", params, (res)=> {
                    //跟踪云埋点 退款
                    var heimdallParams = this.getHeimdallParams(order);
                    try {
                        window.eventSupport.emit('heimdallTrack', heimdallParams);
                    } catch (err) {
                        console.log(err);
                    }
                    $.tips({
                        content: '已成功申请退货，请在售后服务查看进度。',
                        stayTime: 2000,
                        type: "success"
                });

                //更改订单为已取消状态
                order.orderStatus = 10;
                order.orderStatusName = "已取消";
            });
            },

            //打开退货原因列表
            openAfterSaleCauseList: function(order) {
                this.refundOrder = order;
                if (!this.afterSaleCauseList) {
                    this.getAfterSaleCauseList();
                }
                this.showReturnCause = true;
            },

            selectReturnCause: function (cause) {
                if (cause && this.refundOrder) {
                    this.applyRefund(this.refundOrder, cause);
                }

                this.showReturnCause = false;
            },

            //获取退货原因列表
            getAfterSaleCauseList: function() {
                var params = { ut: ut, companyId: Vue.mallSettings.getCompanyId(), afterSaleType: 1 };
                Vue.api.get("/api/my/orderAfterSale/afterSaleCauseList", params, (res) => {
                    this.afterSaleCauseList = res.data.orderAfterSalesCauseVOs;
                });
            },
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
            // 支付尾款
            payMent:function(order){
                if(!order){
                    return;
                }
                var params = {
                    ut: Vue.auth.getUserToken(),
                    businessType:6,
                    orderCode:order.orderCode,
                    merchantId: order.productList[0].merchantId,
                    platformId: config.platformId,
                };
                var skus = {
                    "mpId":order.productList[0].mpId,
                    "num":order.productList[0].num,
                    "isMain":0
                    }
                params.skus = JSON.stringify([skus])
                Vue.utils.quickPurchase(params,null,false);
            }
        }
    }

</script>
