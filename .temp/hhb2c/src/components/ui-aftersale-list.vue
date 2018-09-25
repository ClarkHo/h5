<template>
    <div class="ui-card pad0" v-for="afterSale in afterSaleList">
        <ul class="ui-row-flex pad12 ui-border-b">
            <li class="ui-col ui-flex ui-flex-pack-start"><span v-if="afterSale.type == 1">退款</span><span v-if="afterSale.type == 2">退货</span><span v-if="afterSale.type == 4">换货</span><span v-if="afterSale.type == 11">维修</span> {{afterSale.applyTime | date}}</li>
            <li class="ui-col ui-flex ui-flex-pack-end c9">
                <!-- 成功 green  其他green -->
                <span class="theme" v-if="afterSale.returnStatus==1">待审核</span>
                <span class="green" v-if="afterSale.returnStatus==2">审核通过</span>
                <span class="theme" v-if="afterSale.returnStatus==3">审核不通过</span>
                <span class="aid" v-if="afterSale.returnStatus==4">待收件</span>
                <span v-if="afterSale.returnStatus==5">验货通过</span>
                <span class="theme" v-if="afterSale.returnStatus==6">验货不通过</span>
                <span class="green" v-if="afterSale.returnStatus==8">已完成</span>
                <span v-if="afterSale.returnStatus==9">已撤消</span>

                <span class="theme" v-if="afterSale.cancelStatus==1">待审核</span>
                <span class="theme" v-if="afterSale.cancelStatus==2">待退款</span>
                <span class="green" v-if="afterSale.cancelStatus==3">已退款</span>
                <span v-if="afterSale.cancelStatus==4">审核不通过</span>
            </li>
        </ul>
        <ul class="ui-list ui-list-customize">
            <li class="ui-border-b" v-for="product in afterSale.afterSalesProductVOs">
                <div class="ui-list-thumb">
                    <span :style="{'background-image':'url('+product.productPicPath+')'}"></span>
                </div>
                <div class="ui-list-info">
                    <p class="ui-nowrap">{{product.chineseName}}</p>
                    <div class="ui-flex ui-flex-pack-end c9 price">X{{product.returnProductItemNum}}</div>
                </div>
            </li>
        </ul>
        <div class="ui-row-flex ui-whitespace pad12">
            <!--交易金额：{{calcOrderAmount(afterSale)|currency '¥'}}&nbsp;&nbsp;&nbsp;&nbsp;-->
            <div class="ui-col ui-col-3" v-if="afterSale.type == 1 && (afterSale.cancelStatus==2 || afterSale.cancelStatus==3) || afterSale.type == 2 && (afterSale.returnStatus==5 || afterSale.returnStatus==8)">退款金额：<span class="theme">{{afterSale.actualReturnAmount | currency '¥'}}</span></div>
            <div class="ui-col" style="text-align: right" v-if="!maintain"><a v-if="orderType != 3" href="/my/aftersale-detail.html?orderAfterSalesId={{afterSale.id}}{{ orderType == 3 ? '&seller=1': '' }}" class="green">查看详情</a></div>
            <div class="ui-col" style="text-align: right" v-if="maintain"><a  v-link-to="'/serviceCenter/repair-detail.html?id=' + afterSale.id" class="green">查看详情</a></div>
        </div>
    </div>

</template>

<script>

export default {
    props: ["afterSaleList", 'orderType','maintain'],
    methods: {
      //计算订单实付金额
      calcOrderAmount: function (orderRefund) {
          var amount = 0;
          var prod;

          for (var i=0; i<orderRefund.afterSalesProductVOs.length; i++) {
              prod = orderRefund.afterSalesProductVOs[i];
              amount += (prod.productItemAmount || 0);
          }

          return amount;
      }

    }
}

</script>
