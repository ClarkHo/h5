import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiShare from "../../components/ui-share.vue";
import config from "../../../env/config.js";
import VueLazyload from 'vue-lazyload';

Vue.use(VueLazyload,{
    loading:config.defaultImg
});

let urlParams = Vue.utils.paramsFormat(window.location.href);
let orderCode = ''; //真实订单code
let instId = '';//拼团ID
var ut = Vue.auth.getUserToken();
var goGroupDetailIntervalTimes=0;//定时跳转拼团详情 定时器最多执行次数
if(urlParams.orderCode.indexOf('_') > 0) {
    orderCode = urlParams.orderCode.split('_')[0];
    instId = urlParams.orderCode.split('_')[1];//
    // 拼团详情返回正确数据 才跳转
    var a = setInterval(() => {
        var params = {
            ut: ut,
            instanceId: instId
        };
        Vue.api.get("/api/patchgroupon/getGrouponInstanceInfoById", params, (res) => {
        	location.href = '${contextPath}/group/group-detail.html?refer=pay&instId=' + instId + '&payBack=' + instId;
        	}, (res) => {}
        );
        goGroupDetailIntervalTimes=goGroupDetailIntervalTimes+1;
    	if(goGroupDetailIntervalTimes>20){
    		clearInterval(a);
    	};
    }, 1500);
}else {
    orderCode = urlParams.orderCode;
}

const sessionId = Vue.session.getSessionId();

var vm = new Vue({
    el: 'body',
    components: { UiHeader, UiShare },
    data: {
        ut: Vue.auth.getUserToken(),
        orderCode: orderCode,
        instId: instId,
        paymentName:'',
        amount:0,
        title:'',
        order:{},
        productList: [],//猜你喜欢
        recommendProductList: [],//猜你喜欢
        childOrderList: [],//猜你喜欢
        mpIds: [],//猜你喜欢
        mpIdsStr: '',//猜你喜欢
        adsImage:'',//广告图
        sharedImage:'', //分享图
        items:[],//订单详情，埋点需要,
        packetShow:true,//领取红包弹窗,
        showShare:false,
        shareConfig:{},
        showExplain:false,//是否显示佣金说明
        shareConfig: {}, //分享配置
        urlParams:Vue.utils.paramsFormat(window.location.href),
        moneyInfact:'',//实际支付金额
    },
    ready: function() {
        //this.orderCode = Vue.utils.paramsFormat(window.location.href).orderCode||this.orderCode;
        this.paymentName=decodeURIComponent(Vue.utils.paramsFormat(window.location.href).p||'');
        this.amount=Vue.utils.paramsFormat(window.location.href).a||0;
        if(this.paymentName.length>0)
            this.title='订单提交成功';
        else
            this.title='支付成功';

        this.loadOrderDetail();//加载用户订单
        this.getAdsImage();//获取广告图
        this.payMoneyInfact();//金额读取财务接口
    },
    methods: {
        //跳转首页
        goHome:function (order) {
            if(Vue.browser.isApp()){
                window.location.href="${appSchema}://home"
            } else{
                if(order.sysSourceName == '积分商城'){
                    window.location.href="/score/index.html"
                }else {
                    window.location.href="/index.html"
                }
            }
        },
        //跳转拼团页面
        goGroupDetail:function () {
            var params = {
                    ut: ut,
                    instanceId: instId
                };
            Vue.api.get("/api/patchgroupon/getGrouponInstanceInfoById", params, (res) => {
            	location.href = '${contextPath}/group/group-detail.html?refer=pay&instId=' + instId + '&payBack=' + instId;
            });
        },
        //加载用户订单
        loadOrderDetail: function() {
            var url=config.apiHost + "/api/my/order/detail";
            var params = {
                ut: this.ut,
                companyId:Vue.mallSettings.getCompanyId(),
                orderCode: this.orderCode,
                v: '2.0'
            };
            Vue.api.get(url, params, (result) => {
                this.order = result.data||this.order;
                this.childOrderList = result.data.childOrderList ;
                if(this.order && this.childOrderList){
                    this.childOrderList.forEach((v) => {
                        if(v.packageList){
                            v.packageList.forEach((e) => {
                                if(e.productList){
                                    e.productList.forEach((q) => {
                                        this.mpIds.push(q.mpId);
                                        this.items.push({"id": q.mpId ,"name": q.name ,"category": q.categoryName ,"unitPrice": q.originalPrice ,"count": q.num})
                                    })
                                }
                            })
                        }
                    });
                };
                this.mpIdsStr =  this.mpIds.join(",");
                this.recommendList();
            },()=>{});
        },
        //支付金额单独调用财务接口
        payMoneyInfact:function(){
            var url=config.apiHost+'/opay-web/queryPayOrder.do';
            var params={
                orderCode:this.orderCode,
                payStatus: 2,
            }
            Vue.api.postForm(url, params, (res)=> {
                if(res.data!=null){
                    this.moneyInfact = res.data[0].money;
                }
            })
        },
        //获取广告图
        getAdsImage:function () {
            var url=config.apiHost + "/api/dolphin/list";
            var params = {
                platformId: config.platformId,
                pageCode: 'H5_PAYMENT_SUCCESS_PAGE',
                adCode: 'pay_success_share',
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, params, (result) => {
                this.sharedImage = result.data.pay_success_share[0];
                console.log("分享图"+this.sharedImage);
                if(this.sharedImage == undefined){
                    this.packetShow=false;
                }
            },()=>{});

            var params2 = {
                platformId: config.platformId,
                pageCode: 'H5_PAYMENT_SUCCESS_PAGE',
                adCode: 'active_spread',
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, params2, (result) => {
                this.adsImage = result.data.active_spread[0];
            },()=>{});

        },
        //猜你喜欢
        recommendList: function () {
            this.recommendProductList = [];
            var url = config.apiHost + '/api/read/product/recommendProductList';
            var param = {
                //distributorId: did,
                ut: Vue.auth.getUserToken(),
                platformId: config.platformId,
                pageSize: 12,
                pageNo: 1,
                sceneNo:3,
                mpIds:this.mpIdsStr,
                areaCode: Vue.area.getArea().aC,

            };
            Vue.api.get(url, param, (res) => {
                this.productList = res.data.dataList;
                if(res.data && res.data.dataList.length>0) {
                    var itemIds=[];
                    for(let p of res.data.dataList){
                        itemIds.push(p.mpId)
                    }
                    itemIds = itemIds.join();
                    //获取实时价格
                    Vue.getPriceAndStock(itemIds,res.data.dataList,null,(obj)=>{
                        var list = [];
                        var temp = [];
                        for(var i in obj) {
                            if(i % 4 == 0) {
                                temp = [];
                            }
                            temp.push(obj[i]);
                            if(i % 4 == 0) {
                                list.push(temp);
                            }
                        }
                        this.recommendProductList = list;
                        this.resizeImgHeight();
                        this.initSwipe();
                    });
                }
            }, () => {
                //处理掉不显示报错
            });
        },

        //重置图片大小
        resizeImgHeight: function () {
            Vue.nextTick(function () {
                var width = $('.ui-grid-halve img').width();
                $('.ui-grid-halve img').height(width);
            })
        },

        //轮播初始化
        initSwipe: function () {
            Vue.nextTick(function () {
                $('.swipe').each(function () {
                    var points = $(this).find('.swipe-point li');
                    Swipe(this, {
                        //auto: 3000,
                        continuous: true,
                        disableScroll: false,
                        callback: function (i, ele) {
                            points.removeClass('active').eq(i).addClass('active');
                        }
                    });
                });

            })
        },

        //加入购物车
        addItemInCart: function (item) {
            var params = {mpId: item.mpId, num: 1, sessionId: sessionId};
            Vue.api.postForm("/api/cart/addItem", params, (result) => {
                $.tips({
                    content:"添加购物车成功",
                    stayTime:2000,
                    type:"success"
                });
            });
        },
        //点击分享
        clickShare: function (e) {
            if(!Vue.auth.loggedIn()) {//如果没有登录 需要先登录 为了获取自家did
                var from = Vue.utils.getRelatedUrl();
                window.location.href = "/login.html?from=" + encodeURIComponent(from);
                return;
            }
            //获取分享信息
            var url = config.apiHost + '/api/share/shareInfo';
            var param = {
                ut: Vue.auth.getUserToken(),
                type: 7,        // 1是首页，2是商品详情页，3是品牌搜索页，4是cms文章，5.亲密付，6.下单，7.邀请	
                platformId: 3,  // 平台id。0:ANDROID;1:IOS;2:PC;3:H5	
            };

            Vue.api.get(url, param, (res) => {
                console.info(res);
                this.shareConfig = {
                    url: res.data.linkUrl,
                    title: res.data.title,
                    description: res.data.content,
                    pic: res.data.sharePicUrl
                };
                this.showShare = true;
            });
        },
    }
});

