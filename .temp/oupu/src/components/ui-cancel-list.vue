<template>
    <ul>
        <li class="bgw marT10 padB10" v-for="order in orders">
            <ul class="ui-list ui-list-text">
                <li>
                    <div class="ui-list-info">
                        <h4 class="ui-nowrap">订单号：{{order.orderCode}}</h4>
                    </div>
                    <div class="ui-list-action">取消订单</div>
                </li>
            </ul>
            <div class="ui-row-flex ui-arrowlink pad12"><!--  v-link-to="'/my/aftersale-detail.html?orderAfterSalesId='+order.id + '&seller=1'" -->
                <div class="ui-col ui-col-3">
                    <img :src="product.productPicPath" v-if="$index<3" v-for="product in order.afterSalesProductVOs" width="70" height="70" class="marR10">
                </div>
                <div class="ui-col ui-flex ui-flex-ver ui-flex-pack-center ui-flex-align-start">共{{order.productAmount}}件商品</div>
            </div>
            <ul class="ui-list ui-list-text ui-border-t">
                <li>
                    <div class="ui-list-info">
                        <h4 class="ui-nowrap">&nbsp;</h4>
                    </div>
                    <div class="ui-list-action">合计：<i class="theme">{{order.actualReturnAmount | currency '￥'}}</i></div>
                </li>
            </ul>
            
            <!-- 卖家售后 -->
            <!-- <div class="ui-flex ui-flex-pack-end pad10">
                <button class="ui-btn border-btn on f14">拒绝售后</button>
                <button class="ui-btn border-btn on f14">同意申请</button>
            </div> -->

        </li>
    </ul>
</template>

<script>
//import Vue from "vue";
export default {
    props: ["orders"]
}
</script>
