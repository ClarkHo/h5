import Vue from "vue";

/**
 * 监听元素的点击事件，并跳转到指定页面
 * 
 * 例子1：<button v-link-to.literal="/my-center/home.html?id=1">test</button>
 * 例子2：<button v-link-to="'/my-center/home.html?id=' + item.id">test</button>
 */
Vue.directive("linkTo", {
    bind: function() {
        this.handler = function() {
            if(!this.url) return;
            window.location.href = this.url;
        }.bind(this);

        $(this.el).on("click", this.handler);
    },
    update: function(value) {
        this.url = value;
    },
    unbind: function() {
        $(this.el).off("click", this.handler);
    }

});

/**
 * 监听元素的点击事件，并跳转到指定用户页面(需要登录才可以看到的页面)
 * 
 * 例子1：<button v-link-to-userpage.literal="/my-center/home.html?id=1">test</button>
 * 例子2：<button v-link-to-userpage="'/my-center/home.html?id=' + item.id">test</button>
 */
Vue.directive("linkToUserpage", {
    bind: function() {
        this.handler = function() {
           if (Vue.auth.loggedIn()) {
                window.location.href = this.url;
            } else {
                 if (Vue.browser.isApp()) {
                    //跳转到app登录页面
                    window.location.href = "${appSchema}://login";
                } else {
                    window.location.href = "/login.html?from=" + this.url;
                }
                
            }
        }.bind(this);

        $(this.el).on("click", this.handler);
    },
    update: function(value) {
        this.url = value;
    },
    unbind: function() {
        $(this.el).off("click", this.handler);
    }

});

/**
 * 监听元素的点击事件，并跳转到指定用户页面(app，web可以配置不同的跳转)
 * 
 * 例子：<button v-link-to-webapp="{web:'/login.html', app:'saas://login'}">test</button>
 */
Vue.directive("linkToWebapp", {
    bind: function() {
        this.handler = function() {
             if (Vue.browser.isApp()) {
                //跳转到app登录页面
                window.location.href = this.config.app;
            } else {
                window.location.href = this.config.web;
            }
                
        }.bind(this);

        $(this.el).on("click", this.handler);
    },
    update: function(value) {
        this.config = value;
    },
    unbind: function() {
        $(this.el).off("click", this.handler);
    }

});


/**
 * 监听元素的点击事件，并跳转到商品详情页
 * 
 * 例子：<button v-link-to-item="item.id">test</button>
 */
Vue.directive("linkToItem", {
    bind: function() {
        this.handler = function() {
            var url;
            if(!this.itemId){
                return;
            }
            if (Vue.browser.isApp()) {
                url =  '${appSchema}://productdetail?body={"mpId":' +  this.itemId + '}';
            } else {
                url =  "/detail.html?itemId="+ this.itemId;
            }
            window.location.href = url;
        }.bind(this);

        $(this.el).on("click", this.handler);
    },
    update: function(value) {
        this.itemId = value;
    },
    unbind: function() {
        $(this.el).off("click", this.handler);
    }

});

/**
 * 监听元素的点击事件，并跳转到支付页面
 * 
 * 例子：<button v-link-to-pay="order.orderCode">test</button>
 */
Vue.directive("linkToPay", {
    bind: function() {
        this.handler = function() {
            var url;
            if (Vue.browser.isApp()) {
                // url =  'lyf://pay?body={"orderCode":'+ this.order.orderCode + ', "amount":' + this.order.amount + '}';
                let params={
                    orderCode:this.order.orderCode
                }
                //如果订单是团单，要传orderType = 2 给 App
                url = '${appSchema}://pay?body={"orderType":"'+ (this.order.groupBuyOrderCode ? '2':'') +'","orderCode":"'+ this.order.orderCode +'","amount":'+ this.order.paymentAmount +', "url": "'+
                            Vue.utils.getPayBackUrl(this.order.orderCode + (this.order.groupBuyOrderCode ? '_' + this.order.groupBuyOrderCode:''))+'"}';
            } else {
                // url =  "/pay/pay-way.html?orderCode="+ this.order.orderCode + (this.order.groupBuyOrderCode ? '_' + this.order.groupBuyOrderCode:'');
                url = Vue.utils.getPayUrl(this.order.orderCode + (this.order.groupBuyOrderCode ? '_' + this.order.groupBuyOrderCode : ''), '&paystate=1');
            }
            window.location.href = url;
        }.bind(this);

        $(this.el).on("click", this.handler);
    },
    update: function(value) {
        this.order = value;
    },
    unbind: function() {
        $(this.el).off("click", this.handler);
    }

});


/**
 * 监听元素的点击事件，并跳转到地址管理页面
 * 
 * 例子：<button v-link-to-address>test</button>
 */
Vue.directive("linkToAddress", {
    bind: function() {
        this.handler = function() {
            var url;
            if (Vue.browser.isApp()) {
                url =  "saas://addressManager";
            } else {
                url =  "/my/address-manage.html";
            }
            window.location.href = url;
        }.bind(this);

        $(this.el).on("click", this.handler);
    },
    update: function(value) {
        this.order = value;
    },
    unbind: function() {
        $(this.el).off("click", this.handler);
    }

});