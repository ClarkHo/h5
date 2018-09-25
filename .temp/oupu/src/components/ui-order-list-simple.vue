
/**
 * Vue-btn-copy
 * orders 需要是一个数组
 * orders 里面的每个对象里面需要包含以下字段
 *        titleName
 *        titleStatus
 *        childList  
 *          picUrl  
 *        totalAmount  
*/


<template>
    <li class="">
        <ul class="ui-list ui-list-text mgB10" v-for="order in orders">
            <h3 class="ui-border-b f14 lineH45px pdL10"><i class="icons icons-shop mgR5"></i>{{order.titleName}}<span class="disIB fr mgR10 c9">{{order.titleStatus}}</span></h3>
            <li class="borB1ddd" v-link-to="'${contextPath}/my/order-detail.html?orderCode='+order.orderCode + (forAftersale ? '&refer=aftersale': '') + (orderType == 1 ? '&seller=1' : '')">
                <h4 class="ui-nowrap repair-img" >
                    <span class="ui-avatar-tiled" v-for="prod in order.childList | limitBy 3"><span :style="'background-image:url('+prod.picUrl+')'"></span></span>
                </h4>
                <div class="ui-txt-info">共{{order.childList.length}}件商品 <i class="f13 c9 icons icons-next"></i></div>
            </li>
            <p class="text-right pdT10 pdB10 mgR10">
                合计：<span class="fb">{{order.totalAmount | currency '¥'}}</span>
                <span class="disB mgT10" v-if="btnTitle">
                    <a class="ui-btn repair-btn" @click.prevent="clickEvent(order)">
                        {{btnTitle}}
                    </a>
                </span>
                <solt name="buttons"></solt>
            </p>
            
        </ul>
    </li>
</template>
<style lang="less">
@import (reference) "../common/variables.less";
    
</style>
<script>
    import Vue from "vue";
    //user token
    // const ut = Vue.auth.getUserToken();

    export default {
        components: { },
        props: ["orders","event","btnTitle"],
        data: function () {
            return {
                
            };
        },
        watch:{
            
        },
        methods: {
            clickEvent:function(order){
                if(typeof this.event == 'function'){
                    this.event(order);
                }
                return;
            }
        }
    }

</script>
