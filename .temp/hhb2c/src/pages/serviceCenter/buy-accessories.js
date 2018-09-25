import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);


new Vue({
    el: 'body',
    components: {
        UiHeader
    },
    data:{
        pageNo:1,
        pageSize:10,
        orderList:[],
        sysSourceType:'selfSupport',
        totalNum:0,
        loaded:false,//是否正在加载中
        searchWord:'请输入订单编号或商品名称',//搜索关键词
        ut: Vue.auth.getUserToken(),
        showPage:false,//接口请求完在展示页面
        showList:true,//切換時隱藏列表
    },
    ready:function () {
        this.getOrderList();
        Vue.scrollLoading(() => {
            if (this.totalNum > this.orderList.length) {
                this.pageNo += 1;
                this.getOrderList(false);
            }
        });
    },
    methods:{
        getSearchList:function () {
            var param ={
                keyword:this.searchWord,
                ut:this.ut,
                orderStatus:21,
                pageSize:100,
                pageNo:1,
                sysSourceType:this.sysSourceType
            }

            var url =config.apiHost + "/api/my/order/list";
            this.showPage = false;
            Vue.api.get(url, param, (res) => {
                this.showPage = true;
                if(res.code == 0){
                    if(res.data.totalCount > 0){
                        this.orderList = res.data.orderList;
                    }else{
                        this.orderList = [];
                        Vue.utils.showTips('抱歉，没有找到你要的结果');
                    }
                }else{
                    this.orderList = [];
                    Vue.utils.showTips('抱歉，没有找到你要的结果');
                }
            },(res) => function () {
                this.orderList = [];
                Vue.util.showTips('抱歉，没有找到你要的结果');
            })

        },
        getOrderList:function (flag) {
            if(this.loaded) return;
            var url = config.apiHost + '/api/my/order/list';
            var params = {
                ut: Vue.auth.getUserToken(),
                companyId: Vue.mallSettings.getCompanyId(),
                orderStatus: 21,//查询所有已付款的订单
                pageNo: this.pageNo,
                nocache: new Date().getTime(),
                pageSize: this.pageSize,
                orderType:0,
                sysSourceType:this.sysSourceType
            }
            this.loaded = true;
            this.showPage = false;
            Vue.api.get(url, params, (res) => {
                this.loaded = false;
                this.showPage = true;
                if(!res.data || !res.data.orderList) {
                    this.orderList = [];
                    return;
                }
                this.totalNum = res.data.totalCount;
                if(flag){
                    this.orderList = res.data.orderList || [];
                } else{
                    this.orderList = this.orderList.concat(res.data.orderList || []);
                }
                this.showList = true;
            })
        },
        switchTab:function (type) {
            if(this.sysSourceType == type) return;
            this.sysSourceType = type;
            this.showList = false;
            this.pageNo = 1;
            this.getOrderList(true);
        }
    }
});