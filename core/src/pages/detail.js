import Vue from "vue";
import VueTouch from "vue-touch";
import UiHeader from "../components/ui-header.vue";
import UiActionsheetPop from "../components/ui-actionsheet-pop.vue";
import UiSerialProduct from "../components/ui-serial-product.vue";
import UiImageViewer from "../components/ui-image-viewer.vue";
import UiImagePreview from "../components/ui-image-preview.vue";
import UiShare from "../components/ui-share.vue";
import UiAddress from "../components/ui-address.vue";
import UiSetPosition from "../components/ui-set-position.vue";
import UiCountDown from "../components/ui-count-down.vue";
import UiGuessLike from "../components/ui-guess-like.vue";
import config from "../../env/config.js";
 
 
//引入手势事件支持
Vue.use(VueTouch);    
var typeFlag = 0; 
const sessionId = Vue.session.getSessionId();
const ut = Vue.auth.getUserToken();
let urlParams = Vue.utils.paramsFormat(window.location.href);
let itemId = Vue.utils.paramsFormat(window.location.href).itemId;
//浏览商品历史记录
const itemViewHistoryKey = "itemViewHistory";
// const mpId = Vue.utils.paramsFormat(window.location.href).mpid;
 
    
 
 
 
var vm = new Vue({
    el: 'body',
    components: { UiHeader, UiActionsheetPop, UiImageViewer, UiShare,UiSerialProduct,UiAddress,UiCountDown,UiImagePreview,UiSetPosition, UiGuessLike},
    data: {
        ut:Vue.auth.getUserToken(),
        paramItemIdP:itemId,
        itemId:itemId,    
        showServicePop: false,
        showCouponPop: false,
        showVoucherPop: true, //显示优惠券弹窗
        showSizePop: false,
        showFullPic: false,
        showFullPic2: false,
        itemImages: [],
        preViewIndex: 0,
        detailTab: "desc",
        currentPromo: {},
        itemInfo: {},
        itemInfoForSize: null, //系列属性里使用
        distributionInfo:[],
        promotionInfo: [],
        promotions: [], //促销集合
        //商品系列属性
        //serialAttributes: [],
        ////系列商品
        //serialProducts: [],
        //itemPreviewImage: "",
        deliveryFeeDesc: "",
        productDesc: "",
        productSpec: [],
        afterSaleService: '',
        afterSaleService_arr: [],
        itemAmount: 1,
        selectedItemInfo: "",
        itemCountInCart: 0,
        // 商品评价信息
        tradeRate:{},
        tradeRate_mpcList:[],
        tradeRate_mpLabelList:[],
        tradeRate_mpcList_mpShinePicList:'',
        pageNo:1,
        pageSize:10,
        hasPic:'',
        currentTab:0,
        currentArea:0,
        rateFlag:0,//0:全部;1:好评;2:中评;3:差评;4:有图
        // 商品推荐
        brandRecommendProduct:[],
        showShare: false,   //显示分享
        shareConfig: {}, //分享配置
        itemBrandIds: '',
        type:1,
        companyId: Vue.mallSettings.getCompanyId(),
        entityId:'',
        recoList: [],      //猜你喜欢
        cartCount:0 ,//购物车数目
        showAddress :false,
        showAddAddress:false,
        showAddressList:false,
        curLocation: Vue.localStorage.getItem('areaInfo'),
        locationCity: Vue.localStorage.getItem('areaInfo'),
        curDeliveryArea: {},//当前选中配送区域
        isUt:false,
        defaultAddress:'',
        deliveryTime: '',//配送时间
        addressList: [],//收货地址列表
        evaluatePicListState:false,//评价中大图模板
        evaluatePicList:[],//晒图列表
        isEnd:false,
        noData:false,
        getPicList_load:0,//列表接口是否加载
        sysTime: 0,
        showCountDown: false,
        preOrderInfo: {},
        showLocation: false,
        showAssociateProductsWrap:false,
        associateProducts:{},
        amount:0,
		markprice:[],
        aboutprice:[],
        showPlus:false,//增减数量
        showExplain:false,//是否显示佣金说明
        isDistribution:0,//是否是分销商
        pintuanEntry:'',//拼团入口
        kanjiaEntry:'',//砍价入口 
        totalNum:0,//问题总数，
        askList:[],//问题列表
        noCheckDefault: !Vue.utils.paramsFormat(window.location.href).ch, //默认不选中任何商品属性
        tab:null,
        servicePro:[],
        priceObj:{},
        isPointPro:urlParams.isPointPro,
        sysSource:'ody',
        canExchange:true,//是否在兑换时间内的标识
        presellPromotion:null,//预售活动对象
        seckillPromotion:null,//秒杀活动对象   
        showVideo:false //展示视频弹层        
    },
    computed: {
        //商品已售完
        itemSoldOut: function () {
            return this.itemInfoForSize && !this.itemInfoForSize.stockNum
        }, 
        fixBody:function(){
            "use strict";
            return this.showServicePop||this.showCouponPop||this.showFullPic||this.showSizePop || this.showFullPic2 || this.showAddressList || this.showSizePop;
        },
        selectedItemInfo: function() {
            "use strict";
            var arr = [];
            if (this.itemInfo.attres instanceof Array) {
                this.itemInfo.attres.forEach((sa) => {
                    if(sa.attrVal){
                        arr.push(sa.attrVal);
                    }   
                });
            }
            arr.push(this.itemAmount + "个");

            return this.noCheckDefault ? '请选择商品规格和数量' : arr.join("，");
        },
        pageConfig:function () {
            return config.detail;
        }
    },
    watch:{
        itemAmount:function (val,oldVal) {

            if(this.noCheckDefault){
                Vue.utils.showTips('请先选择商品规格');
                this.itemAmount = 1;
                return;
            }

            if(val > this.itemInfoForSize.stockNum){
                Vue.utils.showTips('超过购买限制');
                this.itemAmount = oldVal;
            }
            if(val == '' || !val || val == 0){
                this.itemAmount = oldVal;
            }
        }
    },
    
    ready: function() {
        //获取分享信息
        this.getShareInfo();
        // this.itemAmount = Vue.localStorage.getItem('itemAmount',this.itemAmount) || 1;
        if(this.pageConfig.showQA){
		    this.getAskList();//获取该商品的提问
        }
		this.getAdvPrice();
        this.getRecoList();
        if (this.itemId) {
            this.initProductInfo(this.itemId);
        }
        
        
        this.showDeliveryAddress();
         //获取购物车数目
        this.getCartCount();

        //滚动加载更多数据
        Vue.scrollLoading(() => {
            if(this.currentArea==2 && this.rateFlag !== 5 && !this.isEnd && !this.noData){
                this.pageNo += 1;
                this.getTradeRate();
            };
            if(this.currentArea==2 && this.rateFlag == 5 && !this.isEnd && !this.noData){
                this.pageNo += 1;
                this.getPicList();
            };

        });
        if(this.itemId){//不重要的请求放在最后处理
            // 检查是否收藏，放在 afterGetPrice  之后
            // this.checkFavorite();//检查是否收藏
        }
    },

    methods: {
        //播放视频
        playVideo: function (url,e) {
            e.stopPropagation();
            this.showVideo=true;
            $('.detail-video>video').attr('src',url)[0].play();
            $('.ui-slider,.icons3-play').hide();
            $('.detail-video *').show();
        },
        
        //停止播放视频
        stopVideo:function () {
            this.showVideo=false;
            $('.detail-video>video')[0].pause();
            $('.detail-video *').hide();
            $('.ui-slider,.icons3-play').show();
        },
        // 选择子品之后，重置选择的数量；
        updatePro:function () {
            this.itemAmount = 1;
        },
        //唤起app客服
        goCustomService:function () {
            if(Vue.browser.weixin()) {
                var dia=$.dialog({
                    title:'温馨提示',
                    content:'请点击右上角菜单选择“在浏览器打开”',
                    button:["知道了"]
                });
                return;
            }
            if(!Vue.auth.loggedIn() || !Vue.localStorage.getItem('username')) {
                location.href = '/login.html?from=' + encodeURIComponent(Vue.utils.getRelatedUrl());
                return;
            }
            var url = '/search-backend-web/getTaoBaoOpenIM.json';
            var params = {
                platform: config.platform,
                areaCode: Vue.area.getArea().aC,
                platformId: config.platformId,
                sessionId: sessionId,
                userId: Vue.localStorage.getItem('username'),
                companyId: Vue.mallSettings.getCompanyId()
            };
            Vue.api.get(url, params, (res) => {
                if(res.data.appKey && res.data.password && res.data.receiveId) {
                    this.getUserHeadPic(()=> {
                        location.href = '/kf.html?ak=' + res.data.appKey + 
                                        '&pwd=' + res.data.password + 
                                        '&rid=' + res.data.receiveId;
                    })
                        
                }
            }, ()=> {
                
            });
        },
        //获取用户头像
        getUserHeadPic: function (callback) {
            var headPic = Vue.sessionStorage.getItem('kf_head_pic');
            if(headPic) {
                if(typeof callback == 'function') {
                    callback();
                }
            }else {
                var url = config.apiHost + '/api/my/user/info';
                var param = {
                    ut: Vue.auth.getUserToken(),
                    companyId: Vue.mallSettings.getCompanyId()
                };
                Vue.api.postForm(url, param, (res) => {
                    Vue.sessionStorage.setItem('kf_head_pic', res.data.url100x100);
                    if(typeof callback == 'function') {
                        callback();
                    }
                });
            }
                
        },
        // 选择地区 获取送货时间
        getDeliveryTime:function (pc,cc,rc) {
            var params = {
                ut:this.ut,
                mpId: itemId,
                provinceCode: pc,
                cityCode: cc,
                regionCode: rc
            };
            Vue.api.postForm("/api/product/deliveryTime", params, (result) => {
                this.deliveryTime = result.data;
            });
        },

        //展示收货地址
        showDeliveryAddress: function () {
            if(this.ut){
                var params = {
                    ut: Vue.auth.getUserToken(),
                    nocache: new Date().getTime()
                };
                Vue.api.postForm(config.ouserHost + '/ouser-web/address/getAllAddressForm.do', params,(res) => {
                    if (res.data) {
                        this.addressList = res.data;
                        if(Vue.localStorage.getItem('receiverId')){
                            for(var i in this.addressList){
                                Vue.set(this.addressList[i],'checked',false);
                                if(Vue.localStorage.getItem('receiverId') == this.addressList[i].id){
                                    this.addressList[i].checked = true;
                                    this.choseAddress(this.addressList[i],false);
                                    return;
                                }else{
                                    this.setDefaultAddress();
                                }
                            }
                        }else{
                            this.setDefaultAddress();
                        }
                    }
                })
            }else{
                this.setDefaultAddress();
            }

        },

        //设置默认地址
        setDefaultAddress: function () {
            this.curDeliveryArea = {};
            this.curDeliveryArea.provinceName = this.locationCity.province.name;
            this.curDeliveryArea.cityName = this.locationCity.city.name;
            this.curDeliveryArea.regionName = this.locationCity.region.name;
            this.getDeliveryTime(this.locationCity.province.code,this.locationCity.city.code,this.locationCity.region.code);
        },

        //获取新增地址
        afterAddAddress: function (id) {
            var params = {
                ut: Vue.auth.getUserToken(),
                nocache: new Date().getTime()
            };
            Vue.api.postForm(config.ouserHost + '/ouser-web/address/getAllAddressForm.do', params,(res) => {
                if (res.data) {
                    this.addressList = res.data;
                    for (var i in res.data) {
                        Vue.set(res.data[i],'checked',false);
                        if (id == res.data[i].id) {
                            res.data[i].checked = true;
                            this.choseAddress(res.data[i]);
                        }
                    }
                }
            })
        },

        //选择配送地址
        choseAddress: function (address,flag,item) {
            this.curDeliveryArea = address;
            this.showAddressList = false;

            Vue.area.setArea(address.provinceName,address.provinceCode,address.cityName,address.cityCode,address.regionName,address.regionCode,1);

            //保存receiverId
            Vue.localStorage.setItem('receiverId',address.id);
            this.getDeliveryTime(address.provinceCode,address.cityCode,address.regionCode);

            if (this.itemId && flag) {
                this.initProductInfo(this.itemId);
                for(var i in this.addressList){
                    Vue.set(this.addressList[i],'checked',false);
                }
                item.checked = true;
            }

            //console.log(this.curDeliveryArea.detailAddress);
        },

        //显示大图预览
        showImageViewer: function () {
            this.itemImages = [];
            if (this.itemInfo && this.itemInfo.pics) {
                this.itemInfo.pics.forEach( (pic) => {
                    this.itemImages.push(pic.url);
                });
            }

            this.showFullPic = true
        },

        showImageViewer2: function (index) {
            this.preViewIndex = index;
            this.showFullPic2 = true
        },

        showImageViewer3: function (images,index) {
            this.preViewIndex = index;
            this.itemImages = images;
            this.showFullPic = true
        },

        //加载商品数据
        initProductInfo: function (itemId) {
            this.getItemInfo(itemId);
            this.getDistributions(itemId);
            //积分商品不查促销信息
            if(!this.isPointPro){
                this.getPromotionInfo(itemId);
            }
            //this.getSerialProducts(itemId);
            // this.getDeliveryFeeDesc(itemId);
            this.getProductDesc(itemId);
            this.getProductSpec(itemId);
            this.getAfterSaleService(itemId);
        },

        //showCoupon: function (promo) {
        //    this.currentPromo = promo;
        //    this.showCouponPop = true;
        //},

        //更新用户浏览足迹
        getFoot: function () {
            var params = {
                mpId: itemId,
                ut:ut
            };
            Vue.api.postForm("/api/my/foot/update", params, (result) => {
            });
        },

        //记录用户流量记录
        recordItemViewHistory: function (itemInfo) {
            if (!itemInfo) {
                return;
            }
            if (Vue.auth.loggedIn()) {
                this.getFoot();
            }else {
                var viewHistory = Vue.localStorage.getItem(itemViewHistoryKey);
                if (!viewHistory) {
                    viewHistory = [];
                }

                var exists = false;
                var vh;
                for (var i = 0; i < viewHistory.length; i++) {
                    vh = viewHistory[i];
                    //判断是否已存在
                    if (vh.mpId == itemInfo.mpId) {
                        exists = true;
                        break;
                    }
                }

                if (!exists) {
                    vh = {mpId: itemInfo.mpId, browsingTime: new Date().getTime()};
                    viewHistory.push(vh);
                }

                Vue.localStorage.setItem(itemViewHistoryKey, viewHistory);
            }
 
        },
        //商品基本信息
        getItemInfo: function (itemId) {
            Vue.api.get("/api/product/baseInfo",
                {
                    mpsIds: itemId,
                    platformId: config.platformId,
                    // ut:this.ut,
                    areaCode: Vue.area.getArea().aC,
                }, (result) => {
                if (result.data && result.data.length > 0) {
                    // this.itemInfo = result.data[0];
                    // this.itemInfoForSize=JSON.parse(JSON.stringify(this.itemInfo));
                    if(this.isPointPro){
                        Vue.getPointProPriceAndStock(result.data[0].mpId,[result.data[0]],null,(obj)=>{
                            //积分商品促销信息重置
                            obj[0].isPresell = 0;
                            obj[0].isSeckill = 0;
                            this.afterGetPrice(result,obj);
                        });
                    } else{
                        Vue.getPriceAndStock(result.data[0].mpId,[result.data[0]],null,(obj)=>{
                            this.afterGetPrice(result,obj);
                        });
                    }
                    
                    //this.updateItemPreviewImage();
                    //this.updateSelectedItemInfo(true);

                    // this.initScroll();

                    // 获取推荐列表
                    //详情页暂无推荐商品 2016.12.26
                    // this.getBrandRecommendProduct();

                    // 获取评论列表
                    this.getTradeRate();

                    //秒杀倒计时
                    Vue.getSysTime((res) => {
                        this.showCountDown=true;
                        this.sysTime = res.data.timestamp;
                    })
                }
            },(res) => {
                Vue.utils.showTips('该商品已下架')
            });
        },
        afterGetPrice:function (result,obj) {
            var attres,self = this;
            Vue.set(this,'itemInfo',obj);
            if(this.itemInfo.attres){
                attres = this.itemInfo.attres;
            }
            this.itemInfo = obj[0];
            this.checkFavorite();//检查是否收藏
            if(attres && attres.length > 0){
                this.itemInfo.attres = attres;
            }
            this.itemInfoForSize=JSON.parse(JSON.stringify(this.itemInfo));
            this.priceObj = {
                originalPrice:this.itemInfo.originalPrice,
                availablePrice:this.itemInfo.availablePrice,
                availablePriceText:this.itemInfo.availablePriceText
            }

            //积分兑换时间判断
            if(this.itemInfo.exchangeStartTime  > new Date().getTime() || this.itemInfo.exchangeEndTime  < new Date().getTime()){
                this.canExchange = false;
                Vue.set(this,'canExchange',false);
            }

            if(this.itemInfo.isPresell){
                Vue.set(this.itemInfo,'originalPrice',result.data[0].originalPrice);
            }
            // this.getServicePro([this.itemInfo.mpId]);
            this.recordItemViewHistory(this.itemInfo); 
            if(this.itemInfo.isAreaSale == 0){
                //该区域不可售
                var dialog = $.dialog({
                    title: "",
                    content: "<div class='text-center'>该商品在该地区暂不支持销售<br>非常抱歉</div>",
                    button: ["知道了"]
                });
            }
            this.initScroll();
            this.updateSelectedItemInfo();

            window.eventSupport.emit('productHeimdallTrack',{
                productName:self.itemInfo.name, //商品名称（详情页需要填写）
                productType:self.itemInfo.categoryName, //商品类型（详情页需要填写）
                productTypeId:self.itemInfo.categoryId, //商品类型（详情页需要填写）
                brandId:self.itemInfo.brandId, //品牌id（详情页需要填写）
                brandName:self.itemInfo.brandName, //品牌名称（详情页需要填写）
                productPrice:self.itemInfo.availablePrice || self.itemInfo.originalPrice, //产品价格（详情页需要填写）
                productId:self.itemId, //产品id（详情页需要填写
            });
            this.isDistribution = result.data[0].isDistribution;
            if(this.isDistribution){
                this.shareType = 1;
                this.showExplain = true;
            }else{
                this.shareType = 0;
            }
            this.itemBrandIds = this.itemInfo.brandId;
        },
        getPointProInfo:function (params) {
          var url = config.apiHost +  '/api/pointMallProduct/getPriceLimitList';
          var param = {
              mpIds:[itemId].join()
          }
          Vue.api.post(url, param, (res) => {
            
          })  
        },
        //快递与运费
        getDistributions: function (itemId) {
            var params = {mpId: itemId, companyId: Vue.mallSettings.getCompanyId(),provinceCode:310000};
            Vue.api.get("/api/product/distributions", params, (result) => {
                this.distributionInfo=result.data;
            });
        },

        //促销信息
        getPromotionInfo: function (itemId) {
            var params = {
                mpIds: itemId,
                companyId: Vue.mallSettings.getCompanyId(),
                platformId:config.platformId
            };
            Vue.api.get("/api/promotion/promotionInfo", params, (result) => {
                this.promotionInfo = result.data.promotionInfo;
                if(result.data.promotionInfo instanceof Array && result.data.promotionInfo.length>0){
                    var tempArry = [];
                    result.data.promotionInfo[0].promotions.forEach((res) => {
                        var flag = true;
                        for(let item of tempArry){
                            if(item && (item.frontPromotionType == res.frontPromotionType) && res.frontPromotionType == 1025){
                                flag = false
                            }
                        }
                        switch (res.frontPromotionType) {
                            case 1022:
                                this.presellPromotion = res;
                                break;
                            case 1012:
                                this.seckillPromotion = res;
                                break;
                            default:
                                break;
                        }
                        if(flag){
                            tempArry.push(res)
                        }
                    })
                    this.promotions = tempArry;
                }
            });
        },

        //打开促销信息
        openPromotionInfo:function(promotion){
            "use strict";
            //有详细内容
            if(promotion.promotionRuleList&&promotion.promotionRuleList.length>0
                ||promotion.promotionGiftDetailList&&promotion.promotionGiftDetailList.length>0) {
                //新增属性
                (promotion.promotionGiftDetailList||[]).forEach(function(v){
                    Vue.set(v,'isFold',false);
                })
                Vue.set(this, 'currentPromo', promotion);
                this.showCouponPop = true;
            }

        },

        //更新已选择的商品信息
        updateSelectedItemInfo: function (isInit) {
            var arr = [];
            //if(isInit) {
            //    if (this.itemInfoForSize.attres instanceof Array) {
            //        this.itemInfoForSize.attres.forEach( (sa)=> {
            //            arr.push((sa.attrVal || {}).value || '');
            //        });
            //    }
            //}else{
            //    if (this.serialAttributes) {
            //        this.serialAttributes.forEach( (sa)=> {
            //            if (sa.values) {
            //                sa.values.forEach((v)=> {
            //                    if (v.checked) {
            //                        arr.push(v.value);
            //                    }
            //                })
            //            }
            //        });
            //    }
            //}

            if (this.itemInfoForSize.attres instanceof Array) {
                this.itemInfoForSize.attres.forEach( (sa)=> {
                    arr.push((sa.attrVal || {}).value || '');
                });
            }
            // arr.push(this.itemAmount + "个");

            this.selectedItemInfo = arr.join("，");
        },

        //快递费用描述
        getDeliveryFeeDesc: function (itemId) {
            //TODO:
            var params = {mpId: itemId, companyId: Vue.mallSettings.getCompanyId(), deliveryRange: 0};
            Vue.api.get("/api/product/deliveryFeeDesc", params, (result) => {
                this.deliveryFeeDesc = result.data;
            });
        },

        //商品描述（文描）
        getProductDesc: function (itemId) {
            var params = {mpId:itemId, platform:config.platformId};
            Vue.api.get("/api/product/desc", params, (result) => {
                

                //result = result.replace(/src/gi, 'data-original');
                this.productDesc = result;
                // Vue.nextTick(function () {
                //     var timer = setInterval(function () {
                //         if($(document).lazyload) {
                //             clearInterval(timer);
                //             $('img[data-original]').lazyload({
                //                 placeholder_data_img: config.defaultImg
                //             });
                //         }
                //     }, 500);
                // })
            });
        },

        //商品规格
        getProductSpec: function (itemId) { 
            Vue.api.get("/api/product/spec", {mpsId: itemId}, (result) => {
                this.productSpec = result.data;
            });
        },

        //售后服务
        getAfterSaleService: function (itemId) {
            Vue.api.get("/api/product/groupsInfo", {mpId: itemId, companyId: Vue.mallSettings.getCompanyId()}, (result) => {
                this.afterSaleService = result.data && result.data.afterService ? result.data.afterService : "";
                this.afterSaleService_arr = this.afterSaleService.split('\n');
            });
        },
         
        //增减购物数量
        plusAmount: function (step) {
            var self = this;
            if (this.noCheckDefault) {
                if ($(".ui-poptips-cnt").length == 0)
                    $.tips({
                        content: "请先选择商品规格！",
                        stayTime: 2000,
                        type: "success"
                    });
                return;
            }
            if (this.itemSoldOut) {
                return;
            }

            var num = this.itemAmount - 0 + (step - 0);
            if (num>0 && num <= this.itemInfoForSize.stockNum) {
                this.itemAmount = num;
                // Vue.localStorage.setItem('itemAmount',this.itemAmount);
            }
        },

        //根据选择更新商品信息 
        updateProduct: function () {
            //如果mpId发生变化
            // if(this.itemInfoForSize.mpId!=this.paramItemIdP)
            //     location.href="/detail.html?itemId="+this.itemInfoForSize.mpId;
            //this.updateSelectedItemInfo();
            ////更新页面显示内容
            //for (var k in this.itemInfoForSize) {
            //    if (typeof this.itemInfoForSize[k] != undefined && this.itemInfoForSize[k] != null) {
            //        this.itemInfo[k] = this.itemInfoForSize[k];
            //    }
            //}
            Vue.set(this.itemInfo, 'attres', this.itemInfoForSize.attres);
            Vue.set(this.itemInfo, 'mpId', this.itemInfoForSize.mpId);
            if(this.noCheckDefault){
                Vue.set(this.itemInfo, 'availablePrice', this.priceObj.availablePrice);
                Vue.set(this.itemInfo, 'originalPrice', this.priceObj.originalPrice);
                Vue.set(this.itemInfo, 'availablePriceText', this.priceObj.availablePriceText);
                
            } else{
                Vue.set(this.itemInfo, 'availablePrice', this.itemInfoForSize.availablePrice);
                if(!this.isPointPro){
                    Vue.set(this.itemInfo, 'originalPrice', this.itemInfoForSize.originalPrice);
                } else{
                    Vue.set(this.itemInfo, 'originalPrice', this.priceObj.originalPrice);
                }
                // Vue.set(this.itemInfo, 'availablePriceType', this.itemInfoForSize.availablePriceType);
                Vue.set(this.itemInfo, 'availablePriceText', this.itemInfoForSize.availablePriceText);
            }
        },

        //加入购物车
        addItemInCart: function (item) {
            var self = this;
            try{
                window.eventSupport.emit('heimdallTrack',{
                    ev: "4",
                    pri: self.itemInfoForSize.mpId,
                    pvi: self.itemInfo.mpId,
                    prm: self.itemAmount,
                    prn: self.itemInfoForSize.name,
                    pt: self.itemInfo.categoryName,
                    pti: self.itemInfo.categoryId,
                    bn: self.itemInfo.brandName,
                    bni: self.itemInfo.brandId,
                    prp: self.itemInfoForSize.availablePrice
                });
            }catch(err){
                console.log(err);
            }
            if (this.noCheckDefault) return;
            var params = {ut:this.ut,mpId: this.itemInfoForSize.mpId, num: this.itemAmount, sessionId: sessionId};
            // 服务商品检测
            var serviceObj = [];
            if(this.servicePro.length > 0){
                this.servicePro.forEach((res) => {
                    if(res.selected){
                        serviceObj.push({
                            "mpId":res.id,
                            "num":1,
                            "itemType":0,
                            "objectId":0
                        });
                        return;
                    }
                })
                params.additionalItems = JSON.stringify(serviceObj);
            }
            Vue.api.postForm("/api/cart/addItem", params, (result) => {
                $.tips({
                    content:"添加成功",
                    stayTime:2000,
                    type:"success"
                });
                this.showSizePop=false;
                this.updateProduct();
                this.getCartCount();
            });
        },

        //获取购物车数目
        getCartCount:function(){
            "use strict";
            var params = {sessionId: sessionId, ut: Vue.auth.getUserToken()};
            Vue.api.postForm("/api/cart/count", params, (result) => {
                this.cartCount=result.data;
            }, () => {
                //处理掉不显示报错
            });
        },
        payment:function (ignore) {
            var params = {
                ut: ut,
                sessionId: sessionId,
                mpId: this.itemInfoForSize.mpId,
                num: this.itemAmount,
                merchantId: this.itemInfoForSize.merchantId,
                companyId: Vue.mallSettings.getCompanyId(),
                platformId: config.platformId,
                areaCode: Vue.area.getArea().aC,
                businessType:5,//预售第一阶段
            };
            if(ignore) params.ignoreChange=1;
            Vue.api.postForm("/api/checkout/initOrder", params, (res) => {
                window.location.href = "/pay/pay.html?type=5";

            },(res) => {
                var dia=$.dialog({
                    title:res.message,
                    content:'',
                    button:['<span style="color:gray">取消购买</span>','继续购买']
                });

                dia.on("dialog:action",(e)=>{
                    if(e.index==1)
                        this.payment(true)
                });
            });
        },
        
        //立即购买
        quickPurchase: function(ignore,type,itemType,itemInfo) {
            var self = this;
            try{
                window.eventSupport.emit('heimdallTrack',{
                    ev: "15",
                    pri: self.itemInfoForSize.mpId,
                    pvi: self.itemInfo.mpId,
                    prm: self.itemAmount,
                    prn: self.itemInfoForSize.name,
                    pt: self.itemInfo.categoryName,
                    pti: self.itemInfo.categoryId,
                    bn: self.itemInfo.brandName,
                    bni: self.itemInfo.brandId,
                    prp: self.itemInfoForSize.availablePrice
                });
            }catch(err){
                console.log(err);
            }
            typeFlag = type;
            //type等于7为立即购买，等于5为预售第一阶段
            if (this.noCheckDefault) return;
            var params = {
                ut: Vue.auth.getUserToken(),
                businessType:type,
                merchantId: this.itemInfoForSize.merchantId,
                platformId: config.platformId,
            };
            var obj = {
                "mpId":this.itemInfoForSize.mpId,
                "num":this.itemAmount,
                "isMain":0,
            }
            if(itemType){
                obj.itemType = itemType;
            }
            params.sysSource = 'ody';
            if(this.isPointPro){
                params.sysSource = 'INTEGRAL_MALL';
                //不在兑换时间内的积分商品 或者兑换数量大于库存
                if(!this.canExchange || this.itemAmount > this.itemInfo.stockNum){
                    return;
                }
            }
            // 服务商品检测
            var serviceObj = [];
            if(this.servicePro.length > 0 && type != 5){
                this.servicePro.forEach((res) => {
                    if(res.selected){
                        serviceObj.push({
                            "mpId":res.id,
                            "num":1,
                            "itemType":0,
                            "objectId":0
                        });
                        return;
                    }
                })
                obj.additionalItems = serviceObj;
            }
            params.skus = JSON.stringify([obj]);
            if(Vue.localStorage.getItem('receiverId')){
                params.receiverId = Vue.localStorage.getItem('receiverId');
            }
            Vue.utils.quickPurchase(params,this.unusualExecute,ignore)
        },
        initScroll: function () {
            var self = this;
            Vue.nextTick(function () {
                self.tab = new fz.Scroll('.ui-tab', {
                    role: 'tab',
                    // autoplay: true,
                    interval: 3000,
                    // click:true
                });
                var slider = new fz.Scroll('.ui-slider', {
                    role: 'slider',
                    indicator: true,
                    autoplay: true,
                    interval: 3000
                });
            });
        },

        //点击分享
        //点击分享
        clickShare: function (e) {
            var self = this;
            e.stopPropagation();
            this.showShare = true;
            this.rightNavFlag = false;
        },
        getShareInfo:function(){
            var self = this;            
            if(!itemId) return;
            var url = config.apiHost + '/api/share/shareInfo';
            var params = {
                type: 2,//商品详情页
                // ut: Vue.auth.getUserToken(),
                paramId: itemId,
                // shareType: self.isDistribution ? 1 : 0,//0:非分销模式，1：分销模式
                shareType: config.distributionType,//0:非分销模式，1：分销模式
                platformId:config.platformId
            };
            if(Vue.auth.loggedIn()){
                params.ut = Vue.auth.getUserToken();
            }
            Vue.api.get(url, params, (res) => {
                if(this.isPointPro){
                    res.data.linkUrl += '&isPointPro=1'
                }
                this.shareConfig = {
                    url: res.data.linkUrl,
                    title: res.data.title,
                    description: res.data.content,
                    pic: res.data.sharePicUrl
                }; 
                Vue.weixin.weixinShare({
                    link: res.data.linkUrl,
                    title: res.data.title,
                    desc: res.data.content,
                    imgUrl: res.data.sharePicUrl
                },function(){
                    //不是分销商品，清除分销商信息 
                    // if(!self.isDistribution){
                    //     Vue.distribution.clearCurrentDistributionData();//清除分销商的信息
                    // }
                    self.getSharePoint(); 
                });
            });
        }, 
        // 分享送积分
        getSharePoint:function () {
            if(!Vue.auth.loggedIn()) return;
            var params={
                ut:this.ut,
                refType:6,
            };
            Vue.api.get("/api/social/write/share/getSharePoint",params ,(res)=>{
                this.amount= res.data.amount;
                $.tips({
                    content:"获得分享积分"+this.amount+"分",
                    stayTime:2000,
                    type:"success"
                });
            },(res) => {

            });
        },

        //切换tab
        switchTab: function(tab, rateFlag) {
            this.rateFlag = rateFlag;
            if(this.rateFlag !== 5){
                this.evaluatePicListState = false;
                if (this.currentTab != tab && this.currentArea==2) {
                    this.currentTab = tab;
                    this.tradeRate_mpcList = [];
                    this.evaluatePicList = [];
                    this.pageNo = 1;
                    this.isEnd = false;
                    this.noData = false;
                    this.getTradeRate();
                }
            };
            if(this.rateFlag == 5){
                this.evaluatePicListState = true;
                if (this.currentTab != tab && this.currentArea==2) {
                    this.currentTab = tab;
                    this.tradeRate_mpcList = [];
                    this.evaluatePicList = [];
                    this.pageNo = 1;
                    this.isEnd = false;
                    this.noData = false;
                    this.getPicList();
                }
            }

        },

        // 获取晒图列表
        getPicList:function () {
            var params = {
                mpId: itemId,
                hasPic:1,
                rateFlag:5,
                pageNo:this.pageNo,
                pageSize:10
            };
            Vue.api.get(config.apiHost + "/api/social/read/mpComment/getPicList", params, (result) => {
                    this.getPicList_load = this.getPicList_load + 1;

                    if(this.getPicList_load == 1){
                        if(result.data){
                            if(result.data.listObj){
                                this.evaluatePicList = this.evaluatePicList.concat(result.data.listObj);
                                this.resizeImgHeight_picList();
                                if(result.data.listObj.length < this.pageSize && result.data.listObj.length !==0){
                                    this.isEnd = true;
                                };
                                if(result.data.listObj.length == 0){
                                    this.noData = true;
                                }
                            }else{
                                this.noData = true;
                            }
                        }else{
                            this.noData = true;
                        };
                    }else{
                        if(result.data){
                            if(result.data.listObj){
                                this.evaluatePicList = this.evaluatePicList.concat(result.data.listObj);
                                this.resizeImgHeight_picList();
                                if(result.data.listObj.length < this.pageSize || result.data.listObj.length ==0){
                                    this.isEnd = true;
                                };
                            }else{
                                this.isEnd = true;
                            }
                        }else{
                            this.isEnd = true;
                        };
                    };

            });
        },

        // 调至图片预览页
        goToPageDetailPreviewImage:function () {
            document.location.href='/detail-previewImages.html?itemId='+ itemId;
        },

        //商品推荐
        getBrandRecommendProduct:function () {
            var params = {
                companyId: Vue.mallSettings.getCompanyId(),
                ut: Vue.auth.getUserToken(),

                pageSize: 12,
                brandId:this.itemBrandIds,
                mpId:itemId
            };
            Vue.api.get(config.apiHost + "/api/search/brandRecommendProduct", params, (result) => {
                this.brandRecommendProduct = result.data.productList;
            });
        },

        // 点击“查看更多评论”切换Tab页
        navTabSwitch:function(){
            //解决tab切换导致界面坏掉的情况
            this.tab.currentPage = 2;
            $('.ui-tab-nav li:first-child').removeClass('current');
            $('.ui-tab-nav li:last-child').addClass('current');

            $('.ui-tab-content >li:first-child').removeClass('current');
            $('.ui-tab-content >li:last-child').addClass('current');

            var screenW = -document.body.clientWidth*2;
            $('.ui-tab-content').css({
                transform:'translate('+ screenW + 'px, 0px) translateZ(0px)'
            });
            $('.ui-tab-content >li:first-child').css({
                height:"0px"
            });
            $('.ui-tab-content >li:last-child').css({
                height:"auto!important"
            });
            $('.ui-tab-content >li:last-child').find('.ui-list li:first-child').css({
                height:"auto!important"
            });
            // 切换区域为评论区，方便滚动
            this.currentArea=2;
        },

        // 获取商品评价信息列表
        getTradeRate: function() {
            var params = {
                companyId: Vue.mallSettings.getCompanyId(),
                ut: Vue.auth.getUserToken(),
                mpId: itemId,
                pageNo: this.pageNo,
                pageSize: this.pageSize,
                hasPic: 0,
                rateFlag: this.rateFlag
            };
            Vue.api.get(config.apiHost + "api/social/mpComment/get", params, (result) => {
                this.tradeRate = result.data || this.tradeRate;
                this.tradeRate_mpLabelList = result.data.mpLabelList||this.tradeRate_mpLabelList;


                this.tradeRate_mpcList = this.tradeRate_mpcList.concat(result.data.mpcList.listObj||[]);

                if(result.data){
                    if(result.data.mpcList){
                        if(result.data.mpcList.listObj){
                            if(result.data.mpcList.listObj.length < this.pageSize && result.data.mpcList.listObj.length !==0){
                                this.isEnd = true;
                            };
                            if(result.data.mpcList.listObj.length == 0){
                                this.noData = true;
                            }
                        }else{
                            this.noData = true;
                        }
                    }else{
                        this.noData = true;
                    }
                }else{
                    this.noData = true;
                }

                if(this.tradeRate_mpcList.length>0){
                    $('.ui-tab-content').css({
                        width:"300%!important"
                    })
                }
            });
        },



        //加入收藏夹
        addCollect: function (e) {
            e.stopPropagation();
            // console.log(this.itemInfo.favoriteId)
            if(this.itemInfo.isFavorite ==0){
                // 未收藏
                this.addFavorite();
            }else{
                // 已收藏
                this.deleteFavorite();
            }

        },
        checkFavorite:function(flag){
            var self = this;
            if(!ut){
                return;
            }
            var params = {
                ut:ut,
                entityId: itemId,
                companyId: self.companyId,
                type: 1
            };
            //以form提交而不是json格式
            Vue.api.postForm("/api/my/favorite/checkFavorite", params, (result) => {
                self.itemInfo.isFavorite = result.data.isFavorite;
                if(flag){
                    if(self.itemInfo.isFavorite){
                        $.tips({
                            content:"收藏成功",
                            stayTime:2000,
                            type:"success"
                        });
                    }else{
                        $.tips({
                            content:"取消收藏成功",
                            stayTime:2000,
                            type:"success"
                        });
                    }
                }
            }); 
        },
        getAskList:function () {
            var url = '/back-product-web/consultAppAction/getOwnerConsultAndQaList.do';
            var params = {
                merchantProductId:itemId,
                currentPage:1,
                itemsPerPage:10,
                headerType:1,//0 =咨询，1 =问答,默认是咨询
                fullReturn:false
            }
            Vue.api.post(url, params, (res) => {
                if(res.data && res.data.listObj){
                    this.totalNum = res.data.total;
                    this.askList = this.askList.concat(res.data.listObj || []);
                }
            })
        },
        addFavorite : function(){
            var self = this;
            try{
                window.eventSupport.emit('heimdallTrack',{
                    ev: "3",
                    pri: self.itemId,
                    prn: self.itemInfo.name,
                    pt: self.itemInfo.categoryName,
                    pti: self.itemInfo.categoryId,
                    bn: self.itemInfo.brandName,
                    bni: self.itemInfo.brandId,
                    prp: self.itemInfo.availablePrice
                });
            }catch(err){
                console.log(err);
            }
            var params = {
                ut:ut,
                entityId: itemId,
                companyId: this.companyId,
                type: 1
            };
            //以form提交而不是json格式
            Vue.api.postForm("/api/my/favorite/add", params, (result) => {
                self.checkFavorite(true);
            });
       },

        deleteFavorite : function(){
            var self = this;
            try{
                window.eventSupport.emit('heimdallTrack',{
                    ev: "11",
                    pri: self.itemId,
                });
            }catch(err){
                console.log(err);
            }
            var params = {
                ut:ut,
                entityId: itemId,//商品id
                companyId: this.companyId,
                type: 1
            };
            //以form提交而不是json格式
            Vue.api.postForm("/api/my/favorite/clear", params, (result) => {
                self.checkFavorite(true);
            });
        },
        //轮播
        initSwipe2: function () {
            Vue.nextTick(function () {
                var points = $('#slider .swipe-point li');
                Swipe(document.getElementById('slider'), {
                    auto: false,
                    continuous: true,
                    disableScroll: false,
                    callback: function (i, ele) {
                        points.removeClass('active').eq(i).addClass('active');
                    }
                });
            })
        },

        //重置图片大小
        resizeImgHeight: function () {
            Vue.nextTick(function () {
                var width = $('.prod-img img').width();
                $('.prod-img img').height(width);
            })
        },

        // 重置晒图图片大小
        resizeImgHeight_picList: function () {
            Vue.nextTick(function () {
                var width = $('.picList .ui-col-33 img').width();
                $('.picList .ui-col-33 img').height(width);
            })
        },

        //猜你喜欢
        getRecoList: function (did) {
            var url = config.apiHost + '/api/read/product/recommendProductList';
            var param = {
                //distributorId: did,
                sceneNo:1,
                ut:ut,
                pageSize: 20,
                pageNo: 1,
                platformId: config.platformId,
                mpIds:itemId,//商品id
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, param, (res) => {
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
                        this.recoList = list;
                        this.resizeImgHeight();
                        var that = this;
                        that.initSwipe2();
                    });
                }
            }, () => {
                //处理掉不显示报错
            });
        },

        //新增或编辑
        addOrUpdAddress: function (id) {
            if(this.ut){
                this.addressId = id || '';
                this.showAddress = true;
            }else{
                let from = Vue.utils.getRelatedUrl();
                window.location.href = "/login.html?from=" + encodeURIComponent(from);
            }

        },

        //价格说明
        priceCaption: function () {
            var dialog = $.dialog({
                title: "价格说明",
                content: "价格说明价格说明价格说明价格说明价格说明价格说明价格说明",
                button: ["我知道了"]
            });
        },

        //地址选择url
        getAddressUrl: function (type) {
            var base = '';
            if (type == 1) {
                base = "/my/address-chose.html";
                if (this.orderInfo.receiver) {
                    base += "?receiverId=" + this.orderInfo.receiver.receiverId;
                }
            } else if (type == 2) {
                base = "/my/coupons-list.html";
            } else if (type == 3) {
                base = "/my/shop-chose.html";
            }
            if (location.search.length > 1) {
                if (base.indexOf('?') > -1) {
                    base += '&from=' + encodeURIComponent(Vue.utils.getRelatedUrl());
                } else {
                    base += '?from=' + encodeURIComponent(Vue.utils.getRelatedUrl());
                }
                if (urlParams.type) {
                    base += "&type=" + urlParams.type;
                }
            }

            return base;
        },
        //商品不正常状态处理 0 选购的商品总价发生了变化,1 商品失效或下架 2 选购的商品全部失效 提示后,直接返回购物车 3 部分商品不在销售区域内 4 所有商品都不在销售区域内
        unusualExecute: function (data) {
            Vue.utils.showTips(data.message);
            return; 
            "use strict";
            this.preOrderInfo = data;
            var dia, title, button, content = '';
            if (this.preOrderInfo.type == 0 || this.preOrderInfo.type == 1) {
				title = '<div class="c9 text-center">'+this.preOrderInfo.message+'</div>';
				button = ['<span style="color:gray">确定</span>', '继续结算'];
			}  else if (this.preOrderInfo.type == 2) {
				title = '<div class="c9 text-center">'+this.preOrderInfo.message+'</div>'
				button = ['<span style="color:gray">确定</span>'];
			} else if(this.preOrderInfo.type == 3){
				title = '<div class="c9 text-center">'+this.preOrderInfo.message+'</div>'
				button = ['<span style="color:gray">确定</span>', '删除无效商品'];
			} else if(this.preOrderInfo.type == 4){
				title = '<div class="c9 text-center">'+this.preOrderInfo.message+'</div>'
				button = ['<span style="color:gray">确定</span>', '回去看看'];
			} else {
                Vue.utils.showTips(data.message);
                return;
			}

            if (this.preOrderInfo.type == 0 || this.preOrderInfo.type == 1) {
                for (let item of (this.preOrderInfo.data || [])) {
                    content += '<li class="ui-border-b" style="margin:0;margin: 0;">' +
                        '<div class="ui-list-thumb">' +
                        '<img src="' + item.imgUrl + '" width="60" height="60"></div>' +
                        '<div class="ui-list-info">' +
                        '<p class="name ui-nowrap-multi">' + item.name + '</p></div></li>';
                }
            }
            content = '<ul class="ui-list ui-list-customize" style="background:none;overflow: auto;max-height: 200px;">' + content + '</ul>';

            dia = $.dialog({
                title: title,
                content: content,
                button: button
            });

            dia.on("dialog:action", (e)=> {
                if (e.index == 0){

                }
                    // location.href = '/cart.html';
                else {
                //    this.quickPurchase(true,typeFlag);
                }
            });
        },
        showSetLocation: function () {
            this.showLocation = true;
            this.showAddressList = false;
        },
        //更新location
        updateLocation: function () {
            this.locationCity = Vue.localStorage.getItem('areaInfo');
            this.showDeliveryAddress();
            //重新获取商品数据
            if (this.itemId) {
                this.initProductInfo(this.itemId);
            }
        },

        back: function () {
            if (Vue.browser.isApp()) {
                Vue.app.back();
            } else {
//                 解决分享出去的页面 没有上一页的情况
                if(history.length == 1){
                    location.href = '/index.html';
                }
                if(history.length > 1){
                    history.back();
                }
            }
        },
        //促销跳转
        promotionLink: function (item) {
            switch(item.frontPromotionType) {
                case 1:
                case 7:
                case 8:
                case 1022:
                case 2001:
                case 2002:
                case 3001:
                case 1014:
                case 1015:
                case 1007:
                    break;
                case 1012:
                    location.href = '/seckill.html';
                    break;
                case 1013:
                    location.href = '/flashSales/index.html';
                    break;
                case 1025:
                    location.href = '/detail-include/package.html?mpId=' + itemId;
                    break;
                default:
                    location.href = '/search.html?promotionId=' + item.promotionId;
            }
        },
		//获取详情页广告-划线广告
        //获取关于价格
        getAdvPrice:function(){
            var url = config.apiHost + '/api/dolphin/list';
            var param = {
                platform: 2,
                pageCode: 'H5_COMMODITY_DETAILS_PAGE',
                adCode: 'about_price,mark_price_illustration,pintuan_entry,kanjia_entry',
                companyId: this.companyId,
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, param, (res) => {
                if(res.data.about_price) {
                    this.aboutprice = res.data.about_price[0];
                    this.markprice = res.data.mark_price_illustration[0];
                    this.pintuanEntry = res.data.pintuan_entry[0];
                    this.kanjiaEntry = res.data.kanjia_entry[0];
                }
            });
        },
        //去拼团或者砍价详情
        goPromoition:function (promotion) {
            if(!promotion){
                return;
            }
            if(promotion.frontPromotionType == 2001){
                location.href = '/group/detail.html?patchGrouponId='+ promotion.promotionId + '&mpId=' + this.itemInfo.mpId
            }
            if(promotion.frontPromotionType == 2002){
                location.href = '/group/detail.html?patchGrouponId='+ promotion.promotionId;
            }
            if(promotion.frontPromotionType == 3001){
                location.href = '/cut/detail.html?id='+ promotion.promotionId;
            }
        },
        //拼团、砍价查看更多
        goMore:function (promotion) {
            if(!promotion){
                return;
            }
            if(promotion.frontPromotionType == 3001 && this.kanjiaEntry.linkUrl){
                location.href = this.kanjiaEntry.linkUrl
            } else if((promotion.frontPromotionType == 2001 || promotion.frontPromotionType == 2002) && this.pintuanEntry.linkUrl){
                location.href = this.pintuanEntry.linkUrl
            }
        }
    }
});