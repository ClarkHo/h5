<template>
	<div class="bottom-tool ui-flex ui-flex-align-end ui-flex-pack-center" id="bottom-tool">
        <div class="inner">
			<div class="item ui-badge-wrap">
                <i class="icon icon-footprint"></i>
            </div>
            <div class="item scroll-top" id="scroll-top" v-scroll-top>
                <i class="icon icon-backTop"></i>
            </div>
        </div>
    </div>
</template>
<style lang="less">
@import (reference) "../common/variables.less";
	.ui-badge-corner{
		border: none;
		right: -5px;
		top: -6px;
		background-color: @themeColor;
        min-width: 7px;
	}
    .pdTips{
        padding: 0 6px;
        height: 16px;
        min-width: 11px;
        line-height: 16px;
    }
    .r50{
        border-radius: 50%;
        -webkit-border-radius: 50%;
    }
</style>
<script>
import Vue from "vue";
export default {
	data: function () {
		return {
			show: false,
			count: 0
		}
	},
	props: ["height","community"],//滚动多高时显示
	ready: function (){
		this.init();
		this.getCartCount();
	},
	methods: {
		init: function () {
            var height = this.height || $(window).height() * 2;
			$(window).scroll(() => {
	            //检查是否需要显示scrollToTop按钮
	            if ($(window).scrollTop() >= height) {
	                $('#scroll-top').addClass('show');
	            } else {
	                $('#scroll-top').removeClass('show');
	            }
	        });
		},
		// 如果是APP,跳APP地址管理页
		gotoCart:function(){
			"use strict";
			if(Vue.browser.isApp()){
				document.location = '${appSchema}://shoppingCar'
			}else{
				document.location.href='/cart.html'
			}
		},
		//获取购物车数目
        getCartCount:function(){
            "use strict";
            //不用统一处理，防止99跳登录
            Vue.http.post('/api/cart/count', {
              ut: Vue.auth.getUserToken(),
              sessionId: Vue.session.getSessionId()
            }, {
              emulateJSON: true
            }).then((result) => {
              this.count=result.data.data;
            });
        },
	}
}
</script>
