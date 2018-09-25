import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiOrderList from "../../components/ui-order-list.vue";
import UiDropDown from "../../components/ui-drop-down.vue";
import UiDrag from "../../components/ui-drag.vue";
import config from "../../../env/config.js";

//隐藏app头部
Vue.app.postMessage('hiddenHead',{'isHidden':'1'});

let urlParams = Vue.utils.paramsFormat(window.location.href);
  
new Vue({
    el: 'body',
    components: { UiHeader, UiOrderList, UiDropDown, UiDrag},
    data: {
        //当前用户的usertoken
        ut: Vue.auth.getUserToken(),
        //订单列表
        orders: [],
        //无订单数据
        noOrder: false,
        //当前选择tab的值（同orderStatus）
        currentTab: 0,
        pageNo: 1,
        pageSize: 10,
        totalCount: 0,
        rightNavFlag:false,
        loaded:false,
        orderListType: urlParams.seller ? 1:0, //0买家1卖家
        orderReqUrl: urlParams.seller ? config.apiHost + "/api/seller/order/list" : config.apiHost + "/api/my/order/list",                 
        title: urlParams.orderType == 2 ? '服务订单' : '我的订单',
        isDistributorId: urlParams.isDistributorId,
        delete:false,//删除按钮
        showOrders:false,//没有了
        afterSales:false,
        isEnd:false,
        noData:false,
        orderList_load:0,
        stopDropDown: false,
        tabsWidth: 60,
        orderType:urlParams.orderType?urlParams.orderType:null,//订单类型 0普通订单 2服务订单
        /*sysSource:'ody',//系统来源 0自营 1其他*/
        /*sysSourceList:['ody','op'].join(','),//sysSourceList参数可以多个以逗号分隔,区分商家平台*/
        sysSourceType:"selfSupport",//sysSourceType参数可以多个以逗号分隔,区分商家平台
        tabIndex:0,
        orderTabs:['欧普官方商城','天猫京东其他'],
        showReturnCause:false 
    },

    //初始化
    ready: function() {
        // 动态计算tab的宽 保证各设备上右侧最后一个显示一半 表示可滑动
        this.tabsWidth = (window.screen.width)/4.7;
        Vue.event.on("pageShow", this.pageShowHandler);
        window.onpageshow =  this.pageShowHandler
    },
    computed:{
        dropdownTop:function(){
            return this.orderType == 2 ? '25' : '65';
        },
        pageConfig:function () {
            return config.order
        }
    },   
    methods: {
        //自营，服务，其他
        changeOrderType:function(flag){
            var self = this;
            if(self.tabIndex == flag){
                return;
            }
            self.tabIndex = flag;
            switch (flag){
                case 0://自营
                    this.sysSourceType="selfSupport";
                    break;
                // case 1://服务
                //     self.sysSource = 'ody';
                //     self.orderType = 2;
                //     break;
                case 1://其他
                    this.sysSourceType="thirdParty";
                    break;
            }
            self.switchTab(0,true);
        },
        //app显示该页时会触发该事件
        pageShowHandler: function (res) {
            //解决App下，返回初始化的问题
            this.orders.length=0;
            this.pageNo=1;
            this.totalCount=0;
            this.isEnd=false;
            //可以通过t参数指定初始化的tab
            switch (urlParams.t) {
                case "1":
                case "2":
                case "3":
                case "4":
                case "8":
                case "10":
                    this.currentTab = parseInt(urlParams.t);
                    break;
            }

            //        加载首屏内容
            this.loadOrders();

            //        滚动加载更多数据
            Vue.scrollLoading(() => {
                if (!this.isEnd) {
                    this.pageNo += 1;
                    this.loadOrders();
                }
            });
        },
        goGroup:function () {
            location.href = '/group/my-group.html'
        },
        dropDown: function () {
            this.orders.length=0;
            this.pageNo=1;
            this.totalCount=0;
            this.isEnd=false;
            this.loadOrders();
			setTimeout(() => {
				this.stopDropDown = true;
			}, 2000);
        },
        
        //加载用户订单数据
        loadOrders: function() {
            var params = {
                ut: this.ut,
                companyId: Vue.mallSettings.getCompanyId(),
                orderStatus: this.currentTab,
                pageNo: this.pageNo,
                nocache: new Date().getTime(),
                pageSize: this.pageSize,
                orderType:this.orderType,
                /*sysSource:this.sysSource,*/
                sysSourceType:this.sysSourceType,//为了区分多商家新加字段
            };
            Vue.api.get(this.orderReqUrl, params, (result) => {
                this.loaded=true;
                this.totalCount = result.data.totalCount;
                // this.noOrder = this.totalCount == 0;
                this.orderList_load = this.orderList_load + 1;
                if(this.totalCount>0){
                    if (result.data && result.data.orderList && result.data.orderList.length > 0) {
                        (result.data.orderList || []).forEach(function (v) {
                            v.delete = false;
                        })
                        this.orders = this.orders.concat(result.data.orderList);
                        if( this.orders.length < this.pageSize && this.orders.length !== 0){
                            this.isEnd = true;
                        }
                    } else{ 
                        this.isEnd = true; 
                    }
                } else {
                    this.orders = [];
                    this.noOrder=true;
                }  



            }); 
        },       

        //切换tab
        switchTab: function(tab,bl) {
            //bl 为true则强制更新
            if (this.currentTab != tab || bl) {
                this.currentTab = tab;   
                this.pageNo = 1;
                this.noOrder = false;
                this.isEnd = false;
                this.orders = [];
                //更新url的参数
                var url = location.pathname;
                if(tab > 0) {
                    url += url.indexOf('?') > 0 ? '&t=' + tab : '?t=' + tab;
                }
                if(urlParams.seller == 1) {
                    url += url.indexOf('?') > 0 ? '&seller=1' : '?seller=1';
                }
                if(urlParams.orderType) {
                    url += url.indexOf('?') > 0 ? '&orderType=' + urlParams.orderType : '?orderType=' + urlParams.orderType;
                }
                window.history.replaceState(null, "", url);
                this.loadOrders()
            }
        },

        back: function () {
            if (Vue.browser.isApp()) {
                Vue.app.back(false, true);
            } else {
                window.location.href = "/my/home.html";
            }
        },

        // 如果是APP,跳APP详情页
        gotoIndex:function(){
            "use strict";
            if(Vue.browser.isApp()){
                document.location.href = '${appSchema}://home';
            }else{
                document.location.href='/index.html';
            }
        },

    }
});
