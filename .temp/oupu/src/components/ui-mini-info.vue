<template>
    <div class="ui-actionsheet" :class="{'show': show}"  @click="hideActionsheet">
        <div class="ui-actionsheet-cnt ui-pop info-circle" @click="stopPropagation">
            <!--<div style="background:white;height:400px;width:100%;"></div>-->
            <div class="close" @click="hideActionsheet">×</div>
            <div :class="[transformation ? '' : 'animation-big', 'box']" v-touch:swipeup="onSwipeUp" v-touch:swipedown="onSwipeDown">
                <div class="mini-info-wrapper clearfix ui-border-b">
                    <div :class="[transformation ? '' : 'fl', 'pic']">
                        <img :src="itemPreviewImage?itemPreviewImage:'http://cdn.oudianyun.com/prod1.0/dev/osc/1510123106936_39.30709996996013.png@base@tag=imgScale&q=80&m=0&h=160&w=160'">
                    </div>
                    <div class="pro-info clearfix">
                        <div class="name ui-nowrap-multi" v-show="transformdevation">
                            <span class="c3">{{itemInfo.name}}</span>
                        </div>
                        <div class="mini-price clearfix">
                            <span class="f14 ce91111 fb fl money">¥{{itemInfo.presellDownPrice || itemInfo.availablePrice || itemInfo.originalPrice |currency '' 2}}</span>
                            <span class="huiyuan f12 text-center fl" v-if="itemInfo.availablePriceText"></span>
                            <span class=" yuanjia f12 cb2 fl" v-show="transformation&&itemInfo.originalPrice">原价:
                                <span class="line-through">{{itemInfo.originalPrice | currency '¥' 2}}</span>
                            </span>
                            <span class="detail fr f12 c9" @click="gotoDetail">查看详情</span>
                        </div>
                        <ul class="ui-row-flex c808080 pdT10" v-show="transformation" v-if="itemInfo.promotionIconTexts && itemInfo.promotionIconTexts.length>0">
                            <li class="tips" v-for="p in itemInfo.promotionIconTexts" track-by="$index">{{p}}</li>
                        </ul>
                    </div>
                </div>
                <ul class="size-list " :class="[transformation ? '' : 'size-list-big']">
                    <li class="ui-border-b" v-for="sa in serialAttributes" track-by="id">
                        <span>{{sa.name}}</span>
                        <div class="sort">
                            <!--<span class="bgf0" v-for="v in sa.values" :class="{active: v.checked}" @click="selectAttributeValue(sa, v)">{{v.value}}</span>-->
                            <span class="bgf0" v-for="v in sa.values"
                            :class="{active: v.checked&&!v.disabled,disabled:v.disabled}"
                            @click="selectAttributeValue(sa, v,$parent.$index)">{{v.value}}</span>
                        </div>
                    </li>
                    <li class="ui-border-b" v-if="servicePro && servicePro.length > 0 && !itemInfo.isPresell && !isPointPro && pageType != 'group'" v-cloak>
                        <span>安装服务</span>
                        <div class="sort f13">
                            <span class="bgf0" v-for="item in servicePro" :class="{active: item.selected,disabled:!item.areaCansale||item.stockNum==0}" @click="chooseService(item)">{{(item.availablePrice || item.originalPrice) | currency '¥'}}</span>
                        </div>
                    </li>
                    <li class="ui-border-b">
                        <span>购买数量</span>
                        <div class="chose-num">
                            <span class="reduce" @click="plusAmount(-1)">-</span>
                            <!--<span class="num">{{itemSoldOut? 0 : itemAmount}}</span>-->
                            <input type="tel" class="num" v-model="itemAmount">
                            <!--<ui-number-input class="num" v-model="itemAmount" type="integer" @change="plusAmount(0)" :disabled="noCheckDefault"></ui-number-input>-->
                            <span class="plus" @click="plusAmount(1)">+</span>
                        </div>
                        <div style="clear:both;"></div>
                    </li>
                </ul>
            </div>
            <div class="foot-btn">
                    <a class="buy f18 cf f18 car" type="button" v-show="!buyNameStyle" :class="{'bgTheme': (itemAmount <= itemInfo.stockNum),'bgDis': (itemAmount > itemInfo.stockNum)}" @click="quickPurchase(false,7)">立即购买</a>
                    <a class="add cf ui-border-r f18 car" :style="{'background':buyNameStyle==true?'#ccc !important':'','width':buyNameStyle==true?'100%':'50%'}" type="button" :disabled="buyNameStyle" :class="{'bgAid': (itemAmount <= itemInfo.stockNum),'bgDis': (itemAmount > itemInfo.stockNum)}" @click="addItemInCart(itemInfo)">{{ buyName }}</a>
            </div>
        </div>
    </div>
</template>
<script>
import Vue from "vue";
import VueTouch from 'vue-touch';
import config from "../../env/config.js";
let urlParams = Vue.utils.paramsFormat(window.location.href);
// import UiNumberInput from "../components/ui-number-input.vue";

//引入手势事件支持
Vue.use(VueTouch);

export default {
    props: ["show", "mpId", "noCheckDefault"],
    data: function() {
        return {
            isInit:true,
            ut:Vue.auth.getUserToken(),
            transformation: true,//上拉，下拉滑动开关
            itemInfo: {},//商品基本信息对象
            itemPreviewImage: '',//预览图
            serialAttributes: [],//系列品属性集合
            serialProducts: [],//系列品集合
            preOrderInfo: {},//非正常状态商品错误信息
            itemSoldOut: 0,//购物车中商品数量
            sessionId:Vue.session.getSessionId(),
            itemInfoForSize: {}, //系列属性里使用,mpId为子品id
            servicePro: [],
            itemAmount: 1,//购物车商品数量
            cartCount:0 ,//购物车数目
            priceObj:{},
            serialAttrsLib:{},
            serialProdsLib: {},
            isPointPro:urlParams.isPointPro,
            selectVars: {
                prodKeys: [],
                prodKeysV: [],
                newItemInfo: null,
                selectedIds: [],
                allRefs : [],
                selectedNoRefs : [],
                allRefsInter : [],
                refMap : {}
            },
            selectedItemInfo:'', 
            oldPageType:'no'
        }
    },
    watch: {
        // show: function() {
        //     this.initMiniItem();
        // }
        show:function(){
            this.initMiniItem();    
            if(this.show&&this.mpId&&(this.isInit||this.multi)) {
                this.serialAttributes=[];
                this.serialProducts=[];
                this.updateItemPreviewImage();
                if(this.oldPageType!=this.pageType){ 
                    this.oldPageType=this.pageType;
                    this.serialAttrsLib[this.mpId]={};
                    this.serialProdsLib[this.mpId]={};
                }
                if(Object.getOwnPropertyNames(this.serialAttrsLib[this.mpId]||{}).length>0&&Object.getOwnPropertyNames(this.serialProdsLib[this.mpId]||{}).length>0) {
                    this.getSerialProductsEnd()
                }else {
                    if(this.pageType == 'package'){
                        var temp = {};
                        if(this.itemInfo.attributes && this.itemInfo.serialProducts){
                            temp = {
                                "attributes":this.itemInfo.attributes,
                                "serialProducts":this.itemInfo.serialProducts
                            }
                        }
                        this.afterGetSerialProducts(temp,this.mpId);
                    } else{
                        this.getSerialProducts(this.mpId);
                    }
                    this.getServicePro([this.mpId]);//服务商品要重新获取
                }
                
            };
        }
    },
    computed: {
        //商品已售完
        itemSoldOut: function () {
            return !this.itemInfo || !this.itemInfo.stockNum;
        },
        buyNameStyle:function(){
            return this.itemInfo&&this.itemInfo.stockNum == 0 || this.itemInfo&&this.itemInfo.managementState == 0;
        },
        buyName:function(){
            var retName='加入购物车';
            if( this.itemInfo&&this.itemInfo.stockNum == 0) {
                retName = '暂无库存'
            }else if(this.itemInfo&&this.itemInfo.managementState == 0){
                retName='已下架';
            }
            return retName;
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
    },
    methods: {
        // 获取关联的服务商品
        getServicePro:function (mpIds) {

            if(this.itemInfo.isPresell) return;
            //this.servicePro = [];
            var url = config.apiHost + '/back-product-web/consultAppAction/getMerchantProductList.do';
            Vue.api.postForm(url,JSON.stringify({
                mpIds:mpIds,
                areaCode:Vue.area.getArea().aC
            }), (res) => {
                var mpIds = [],array = [];
                for(var itemOne in res.data){
                    if(res.data[itemOne] && res.data[itemOne].length == 0){
                        this.servicePro = [];
                    }
                    res.data[itemOne].forEach((itemTwo) => {
                        itemTwo.selected = false;
                        itemTwo.mpId = itemTwo.id;
                        itemTwo.areaCansale = true;
                        mpIds.push(itemTwo.id)
                        array.push(itemTwo);
                    })
                }
                Vue.getPriceAndStock(mpIds.join(','),array,null,(obj)=>{
                    if(this.servicePro.length > 0){
                        obj.forEach((item) => {
                            this.servicePro.forEach((itemTwo) => {
                                if(item.mpId == itemTwo.mpId && itemTwo.selected){
                                    item.selected = true;
                                }
                            })
                        })
                    }
                    this.servicePro = obj;
                    this.checkProductSaleArea(mpIds);
                })
            })
        },
        //选择服务商品
        chooseService:function (item) {
            if(!item.areaCansale || item.stockNum == 0){
                return;
            }
            if(item.selected == true){
                item.selected = false;
            } else{
                this.servicePro.forEach((a) => {
                    a.selected = false;
                })
                item.selected = true;
            }
        },
        //服务商品区域可售检查
        checkProductSaleArea:function(mpIds){
            var url = config.apiHost + '/api/product/checkProductSaleArea';
            var params = {
                mpIds:mpIds.join(','),
                areaCode:Vue.area.getArea().aC
            }
            Vue.api.postForm(url, params, (res) => {
                if(!res.data) return;
                this.servicePro.forEach((item) => {
                    for(let v in res.data){
                        if(item.mpId == v){
                            item.areaCansale = res.data[v];
                        }
                    }
                })
            })
        },
        //隐藏菜单
        hideActionsheet: function() {
            this.$emit("close");
            this.show = false;
        },
        //阻止冒泡
        stopPropagation: function (e) {
            e.stopPropagation();
        },
        //初始化
        initPop:function(){
            this.serialProducts= [];
            this.itemPreviewImage='';
            this.serialAttributes=[];
        },
        
        initMiniItem: function() {
            //1.获取商品基本信息
            this.getItemInfo(this.mpId);
            //2.获取系列品信息
            this.getSerialProducts(this.mpId);
        },
        transformSerial:function(serials){
            if(this.pageType && serials.length>0){
                for(let se of serials){
                    for(let val of se.values){
                        if(!val.id&&val.attrValueId){
                            val.id=val.attrValueId;
                            val.value=val.attrValue;
                            delete val.attrValueId;
                            delete val.attrValue;
                        }
                    }
                }
            }
            return serials;
        },
        //商品基本信息
        getItemInfo: function (itemId) {
            Vue.api.get("/api/product/baseInfo", {mpsIds: itemId}, (result) => {
                if (result.data && result.data.length > 0) {
                    this.itemInfo = result.data[0];
                    // this.itemInfoForSize=JSON.parse(JSON.stringify(this.itemInfo));
                    Vue.getPriceAndStock(result.data[0].mpId,[result.data[0]],null,(obj)=>{
                        this.afterGetPrice(result,obj);
                    });
                    this.updateItemPreviewImage();
                }
            },(res) => {
                Vue.utils.showTips('该商品已下架')
              }
            );
        },
        afterGetPrice:function (result,obj) {
            var attres,self = this;
            Vue.set(this,'itemInfo',obj);
            if(this.itemInfo.attres){
                attres = this.itemInfo.attres;
            }
            this.itemInfo = obj[0];
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
            if(this.itemInfo.isAreaSale == 0){
                //该区域不可售
                var dialog = $.dialog({
                    title: "",
                    content: "<div class='text-center'>该商品在该地区暂不支持销售<br>非常抱歉</div>",
                    button: ["知道了"]
                });
            }
            this.updateSelectedItemInfo();
        },
        // 获取实时价格库存
        // getPriceStockList:function (itemIds) {
        //     if((itemIds||'').length==0) return;
        //     var url = config.apiHost + '/api/realTime/getPriceStockList';
        //     var param = {
        //         mpIds: itemIds,//商品ids
        //         promotionId: this.promotionId
        //     };
        //     Vue.api.get(url, param, (res) => {
        //         var plistMap={};
        //         for(let pl of res.data.plist||[]){
        //             plistMap[pl.mpId]=pl;
        //         }
        //         for(let pl of this.productList||[]){
        //             if(plistMap[pl.mpId]){
        //                 $.extend(pl,plistMap[pl.mpId]);
        //                 if(pl.isPresell){
        //                     pl.availablePrice = pl.presellTotalPrice;
        //                 }
        //             }
        //         }
        //     }, (res) => {
        //         Vue.api._showError(res.message);
        //     })
        // },  
        // 获取实时价格库存
        getPriceStockList:function (itemIds,itemId,mpIds) {
            if((itemIds||'').length==0) return;
            var url = config.apiHost + '/api/realTime/getPriceStockList';
            var param = {
                mpIds: itemIds,//商品id
                promotionId: ''
            };
            if(this.isPointPro){
                url = config.apiHost + '/api/pointMallProduct/getPriceLimitList';
            }
            //如果是拼团或砍价, 需要传入活动类型和活动ID
            if(this.promotionType&&this.promotionId){
                var promotionLimitParams = [];
                for (let item of mpIds) {
                    promotionLimitParams.push({
                        promotionId: this.promotionId,
                        mpId: item
                    })
                }
                data = JSON.stringify({
                    "promotionType":this.promotionType,
                    "promotionLimitParams":promotionLimitParams,
                });
                url = config.apiHost + '/gw/realTime/getPriceStockPromotionLimit';
                Vue.api.postForm(url, {data}, (res) => {
                    var plistMap={},result=[],validKeys=[];
                    for(let pl of res.data.plist||[]){
                        plistMap[pl.mpId]=pl;
                    }
                    for(let sp of this.serialProdsLib[itemId]||[]){
                        if(sp.product!=null&&plistMap[sp.product.mpId]){
                            // var originalPrice = sp.product.availablePrice;
                            $.extend(sp.product,plistMap[sp.product.mpId]);
                            // sp.product.availablePrice = originalPrice;

                            if(plistMap[sp.product.mpId].stockNum>0){
                                result.push(sp);
                                validKeys.push(sp.key)
                            }else{
//                                this.noCheckDefault=true;
                            }
                        }
                    }
                    this.serialProdsLib[itemId]=result;
                    //后续处理
                    this.getSerialProductsEnd(validKeys.join().replace(/__/g,'_'));
                }, (res) => {
                    Vue.api._showError(res.message);
                })
                return;
            }
            // Vue.gateway.getPriceStockList(data,(res)=>{
            Vue.api.get(url, param, (res) => {
                var plistMap={},result=[],validKeys=[];
                for(let pl of res.data.plist||[]){
                    plistMap[pl.mpId]=pl;
                }
                for(let sp of this.serialProdsLib[itemId]||[]){
                    if(sp.product!=null&&plistMap[sp.product.mpId]){
                        // var originalPrice = sp.product.availablePrice;
                        $.extend(sp.product,plistMap[sp.product.mpId]);
                        // sp.product.availablePrice = originalPrice;

                        if(plistMap[sp.product.mpId].stockNum>0){
                            result.push(sp);
                            validKeys.push(sp.key)
                        }else{
//                                this.noCheckDefault=true;
                        }
                    }
                }
                this.serialProdsLib[itemId]=result;
                //后续处理
                this.getSerialProductsEnd(validKeys.join().replace(/__/g,'_'));
            }, (res) => {
                Vue.api._showError(res.message);
            })
        },
        //更新预览图
        updateItemPreviewImage: function() {
            if (this.itemInfo && this.itemInfo.pics) {
                this.itemPreviewImage = this.itemInfo.pics[0].url;
            }
        },
        //获取商品系列属性及系列商品
        getSerialProducts: function(itemId) {
            var self = this; 
            // Vue.api.get("/api/product/serialProducts", { mpId: self.mpId, platformId: config.platformId }, (result) => {
            Vue.api.get("/back-product-web/api/product/serialProducts.do", { mpId: self.mpId, platformId: config.platformId }, (result) => {
                if (result.data) {
                    this.serialAttributes = result.data.attributes || [];
                    this.serialProducts = result.data.serialProducts || [];
                }
                this.afterGetSerialProducts(result.data,itemId);
            });
        },
        // 获取系列属性后的操作
        afterGetSerialProducts:function(result,itemId){
            if (Object.getOwnPropertyNames(result).length>1) {
                var validIds=[];
                //给系列属性增加一个属性字段disabled
                if(result.attributes instanceof Array&&result.attributes.length>0){
                    result.attributes.forEach((V)=>{
                        "use strict";
                        V.values.forEach((v)=>{
                            Vue.set(v,'disabled',false);
                        })
                    })
                }
                //套餐系列属性组件，需要每次都重新初始化
                if(this.pageType != 'package'){
                    this.isInit=false;
                }
                if(Object.getOwnPropertyNames(this.serialAttrsLib[itemId]||{}).length==0){
                    this.serialAttrsLib[itemId]=this.transformSerial(result.attributes||[])
                }
                var [items,promotionType]=[[],this.promotionType];
                var mpIds = [];//拼团砍价使用，系列品id集合
                if(Object.getOwnPropertyNames(this.serialProdsLib[itemId]||{}).length==0){
                    this.serialProdsLib[itemId]=[];
                    for(let sp of result.serialProducts||[]) {
                        if(sp.product) { //不过滤无库存
//                                    if(sp.product&&sp.product.stockNum>0) { //过滤无库存
                            this.serialProdsLib[itemId].push(sp);
                            validIds.push((this.promotionType&&this.promotionId?(this.promotionId+'_'):'')+sp.product.mpId);
                            items.push(Object.assign({promotionId:this.promotionId},sp.product));
                            mpIds.push(sp.product.mpId);
                        }
                    }
                }
//                        if(this.pageType == 'cut' || this.pageType == 'group') {//注释: 拼团砍价需要实时库存(实际库存和限量取最小)
//                            this.groupAndCut(itemId);
//                        }else {
//                            //取得实时价格与库存
//                            this.getPriceStockList(validIds.join(),itemId);
//                        }
                //取得实时价格与库存
                // this.getPriceStockList({items, promotionType},itemId);
                // this.getPriceStockList(validIds.join(),itemId,mpIds);
                //套餐商品不需要刷新实时价格接口,欧普拼团，也不需要刷实时价格
                if(this.pageType == 'package' || this.pageType == 'cut' || this.pageType == 'group'){
                    this.getSerialProductsEnd();
                } else{
                    this.getPriceStockList(validIds.join(),itemId,mpIds);
                }
                
                    
//                        //后续处理
//                        this.getSerialProductsEnd(validIds.join().replace(/__/g,'_'));
            }else{
                this.noCheckDefault=false;
            }
        },
        getSerialProductsEnd:function(keys){
            this.serialAttributes = this.serialAttrsLib[this.mpId];
            //判断哪些属性是没有商品或商品库存为0的,灰掉
            if((keys||'').length>0) {
                for (let sa of this.serialAttributes) {
                    for (let v of sa.values) {
                        if(keys.indexOf('_'+v.id.toString()+'_')>=0){
                            v.disabled=false;
                        }else{
                            v.disabled=true;
                        }
                    }
                }
            }  else if (keys == '' && keys != undefined){
                //传进来的keys 为空字符串，说明压根没有有效的商品，自然没有属性能够被选中，直接将所有属性灰掉
                for (let sa of this.serialAttributes) {
                    for (let v of sa.values) {
                        v.disabled=true;
                    }
                }
            }
            this.serialProducts = this.serialProdsLib[this.mpId];
            //如果noCheckDefault为false, 有默认选中
            if(!this.noCheckDefault) {
                if (this.itemInfo.isCart){
                    var thisAttrs = {};
                    (this.itemInfo.propertyTags||[]).forEach((v)=>{
                        thisAttrs[v.name]= v.value;
                    });
                    this.serialAttributes.forEach((v)=>{
                        if(thisAttrs[v.name]){
                            v.values.forEach((V)=>{
                                if(V.value==thisAttrs[v.name]){
                                    V.checked=true;
                                }
                            })
                        }
                    });
                }else{
                    var thisAttrs = {};
                    if ((this.itemInfo.attres || []).length > 0) {
                        this.itemInfo.attres.forEach((v)=>{
                            thisAttrs[v.attrName]= v.attrVal;
                        })
                    }
                    this.serialAttributes.forEach((v)=>{
                        if(thisAttrs[v.name]){
                            v.values.forEach((V)=>{
                                if(V.value==thisAttrs[v.name]){
                                    V.checked=true;
                                }else{
                                    V.checked=false;
                                }
                            })
                        }
                    })
                }
            }
            
            //系列属性初始化
            this.initSerial();
            this.openSerialProductsInner();
            this.updateItemPreviewImage();
        },
        //初始化系列属性
        initSerial:function(){
            this.selectVars={
                prodKeys: [],
                prodKeysV: [],
                newItemInfo: null,
                selectedIds: [],
                allRefs : [],
                selectedNoRefs : [],
                allRefsInter : [],
                refMap : {}
            }
            //把所有系列商品的Key拆分成二维数组
            this.serialProducts.forEach((v)=> {
                "use strict";
                this.selectVars.prodKeys.push(v.key.replace(/(^_|_$)/g, '').split('_'))
            });
            this.selectVars.prodKeys.forEach((v,i)=>{
                "use strict";
                v.forEach((V,I)=>{
                    this.selectVars.prodKeysV[I]=this.selectVars.prodKeysV[I]||[];
                    this.selectVars.prodKeysV[I][i]=V;
                })
                this.selectVars.prodKeysV.forEach((v)=>{
                    v= this.uniqExecute(v)
                })
            });
            //每个属性映射的对象
            this.selectVars.prodKeys.forEach((v1, i1)=> {
                "use strict";
                v1.forEach((v2,i2)=> {
                    //初始化属性map
                    this.selectVars.refMap[v2] = this.selectVars.refMap[v2] || [];
                    this.selectVars.refMap[v2] = this.selectVars.refMap[v2].concat(v1);
                    //如果所有属性都选择了
                    this.selectVars.prodKeys.forEach((v3, i3)=> {
                        this.selectVars.refMap[v2] = this.selectVars.refMap[v2].concat(v3[i2]);
                    })
                })
            })
            //去重
            for (var k in this.selectVars.refMap) {
                this.selectVars.refMap[k] = this.uniqExecute(this.selectVars.refMap[k])
                this.selectVars.selectedNoRefs=this.selectVars.selectedNoRefs.concat(this.selectVars.refMap[k]);
            }
        },
        //取多个数组的交集
        intersect:function(lists) {
            if((lists||[]).length==0) return [];
            else if (lists.length == 1) return lists.pop();
            var thisList1 = lists.pop(), thisList2 = lists.pop(), flip = {}, res = [];
            for (var i = 0; i < thisList1.length; i++) flip[thisList1[i]] = i;
            for (i = 0; i < thisList2.length; i++)if (flip[thisList2[i]] != undefined)res.push(thisList2[i]);
            if (lists.length == 0)return res;
            lists.push(res);
            return this.intersect(lists);
        },
        //数组去重
        uniqExecute:function(arr,exception){
            "use strict";
            var temArr=[];
            if(arr instanceof Array){
                for(var i in arr){
                    if(typeof arr[i]=='function');
                    else if(typeof arr[i]=='string' && arr[i].toString().length>0&&temArr.indexOf(arr[i].toString())<0){
                        temArr.push(arr[i].toString())
                        if(typeof exception!='undefined'&&arr[i].toString()==exception.toString())
                            temArr.pop();
                    }
                }
            }
            return temArr;
        },
        //选择某个系列属性值
        // selectAttributeValue: function(serialAttribute, value) {
        //     serialAttribute.values.forEach(function(v) {
        //         v.checked = false;
        //     });

        //     value.checked = true;

        //     var newItemInfo = this.getSerialItemInfo();
        //     //选择了不同的属性
        //     if (newItemInfo && newItemInfo.mpId != this.itemInfo.mpId) {
        //         this.itemInfo = newItemInfo;
        //         this.updateItemPreviewImage();
        //     }

        // },
        openSerialProductsInner:function(){
            //套餐默认选中属性
            if(this.pageType == 'package'){
                var key = '';
                for(let v of this.serialProducts){
                    if(this.itemInfo.choosedMpId == v.product.mpId){
                        key = v.key;
                        break;
                    }
                }
                if(key){
                    for (let sa of this.serialAttributes) {
                        for (let v of sa.values) {
                            if(key.indexOf('_'+v.id.toString()+'_')>=0){
                                v.checked=true;
                            }else{
                                v.checked=false;
                            }
                        }
                    }
                }
            }
            this.serialAttributes.forEach((v,i)=>{
                v.values.forEach((V,I)=>{
                    "use strict";
                    //默认选择不打开
                    if(this.noCheckDefault) {
                        V.checked = false
                    }else if(V.checked){
                        this.selectAttributeValue(v,V,i,V.checked)
                    }
                })
            })
            
        },
         selectAttributeValue: function (serialAttribute, value,index,init) {
            this.selectVars={
                prodKeys: this.selectVars.prodKeys,
                prodKeysV: this.selectVars.prodKeysV,
                newItemInfo: null,
                selectedIds: [],
                allRefs : [],
                selectedNoRefs : this.selectVars.selectedNoRefs,
                allRefsInter : [],
                refMap : this.selectVars.refMap
            }
            //属性不可点
            if (value.disabled)  return;

            if(!init) value.checked = !value.checked;
            serialAttribute.values.forEach(function (v) {
                if (v.id !== value.id)v.checked = false;
                else v.checked=value.checked;
            });

            //如果是取消选择
            if(!value.checked&&this.noCheckDefault==false) {
                this.noCheckDefault=true;
            }

            //所有选中id
            this.serialAttributes.forEach((v1)=> {
                v1.values.forEach((v2, i2)=> {
                    if (v2.checked && (this.selectVars.selectedIds.length != this.serialAttributes.length-1)){
                        this.selectVars.selectedIds.push(v2.id.toString());
                    } 
                })
            })


            //去重
            for (var k in this.selectVars.refMap) {
                //如果是被选中的,放入allRefs
                if (this.selectVars.selectedIds.indexOf(k) >= 0)
                    this.selectVars.allRefs.push(this.selectVars.refMap[k])
            }

            // if (this.selectVars.selectedIds.length > 0) {
                var notSelectMap={};
                this.selectVars.prodKeys.forEach((v1, i1)=> {
                    "use strict";
                    //判断是否选中属性都落在该商品中
                    var crossed=true;
                    this.selectVars.selectedIds.forEach((v2,i2)=>{
                        if(v1.indexOf(v2)<0)
                            crossed=false;
                    })
                    //所有选中的系列商品
                    if(crossed) {
                        v1.forEach((v3,i3)=>{
                            if(this.selectVars.selectedIds.indexOf(v3)<0){
                                notSelectMap[i3]=notSelectMap[i3]||[];
                                notSelectMap[i3].push(v3);
                            }
                        })
                    }
                })
                //找不存在的
                //prodKeysV.
                var allNotSelects=[],allNeedDelete=[];
                //所有未选中行属性
                for(var k in notSelectMap){
                    allNotSelects=allNotSelects.concat(this.selectVars.prodKeysV[k])
                    allNeedDelete=allNeedDelete.concat(notSelectMap[k])
                }
                //allNotSelects为所有disabled的元素
                for(var i=allNotSelects.length-1;i>=0;i--){
                    if(allNeedDelete.indexOf(allNotSelects[i])>=0){
                        allNotSelects.splice(i,1)
                    }
                }
                //获得初始的交集
                this.selectVars.allRefsInter = this.intersect(this.selectVars.allRefs)
                //从交集中把需要disabled的删除
                for(var i=this.selectVars.allRefsInter.length-1;i>=0;i--){
                    if(allNotSelects.indexOf(this.selectVars.allRefsInter[i])>=0){
                        this.selectVars.allRefsInter.splice(i,1)
                    }
                }

                //取结果赋回属性列表
                if(this.selectVars.selectedIds.length > 0){
                    this.serialAttributes.forEach((v1, i1)=> {
                        "use strict";
                        //遍历分类所有值
                        v1.values.forEach((v2, i2)=> {
                            if (this.selectVars.allRefsInter.indexOf(v2.id.toString()) >= 0) {
                                //if(selectedIds.length<selectedIdsH.length||!v2.disabled)
                                v2.disabled = false;
                            } else {
                                v2.disabled = true;
                                v2.checked = false;
                            }

                        })
                    })
                } else{
                    // this.serialAttributes.forEach((v1, i1)=> {
                    //     "use strict";
                    //     //遍历分类所有值,没有选中属性，所有按钮应该亮起来
                    //     v1.values.forEach((v2, i2)=> {
                    //         v2.disabled = false;
                    //         v2.checked = false;

                    //     })
                    // })
                }
                this.selectVars.selectedIds = [];
                this.serialAttributes.forEach((v1)=> {
                    v1.values.forEach((v2, i2)=> {
                        if (v2.checked){
                            this.selectVars.selectedIds.push(v2.id.toString());
                        } 
                    })
                });
                if(this.selectVars.selectedIds.length == 0){
                    // this.serialAttributes.forEach((v1, i1)=> {
                    //     "use strict";
                    //     //遍历分类所有值,没有选中属性，所有按钮应该亮起来
                    //     v1.values.forEach((v2, i2)=> {
                    //         v2.disabled = false;
                    //         v2.checked = false;

                    //     })
                    // })
                        //遍历分类所有值,没有选中属性，重新初始化属性
                    this.initSerial();
                }
                //根据key获取商品id
                for (var k = 0; k < this.serialProducts.length; k++) {
                    var sp = this.serialProducts[k];
                    if (sp.key == ([''].concat(this.selectVars.selectedIds, [''])).join('_')) {
                        this.selectVars.newItemInfo = sp.product;
                        this.noCheckDefault=false;
                        break;
                    } else{
                        this.noCheckDefault=true;
                    }
                }
                //选择了不同的属性
                if (this.selectVars.newItemInfo) {
                    //套餐传进来的数量限制要保留
                    if(this.itemInfo.individualCanBuyCount !=null && this.itemInfo.canSaleNum != null){
                        this.selectVars.newItemInfo.individualCanBuyCount = this.itemInfo.individualCanBuyCount;
                        this.selectVars.newItemInfo.canSaleNum = this.itemInfo.canSaleNum;
                    }
                    this.itemInfo = this.selectVars.newItemInfo;
                    this.getServicePro([this.mpId]);//服务商品要重新获取
                    this.itemAmount=1;
                    this.updateItemPreviewImage();
                }
                this.mpId=this.itemInfo.mpId;
                //为itemInfo添加属性
//                    if(['cut','group'].indexOf(this.pageType)>=0){

                //20170704没看懂这里传进来的attres是对象，为啥返回的确是数组，只能根据页面类型区分
                if(['cut','group'].indexOf(this.pageType) >= 0){//传入该组件的attres是对象,返回的确是数组
                    this.itemInfo.attres = {};
                    this.serialAttributes.forEach((v1)=> {
                        "use strict";
                        //遍历分类所有值
                        v1.values.forEach((v2)=> {
                            if(v2.checked){
                                this.itemInfo.attres[v1.name]=v2.value;
                            }
                        })
                    })
                }else{//传入的attres是数组，返回的也是数组
                    this.itemInfo.attres=[];
                    this.serialAttributes.forEach((v1)=> {
                        "use strict";
                        //遍历分类所有值
                        v1.values.forEach((v2)=> {
                            if(v2.checked){
                                this.itemInfo.attres.push({
                                    attrName:v1.name,
                                    attrVal:v2.value
                                })
                            }
                        })
                    })
                }
//                    }
            // } else {
            //     this.selectVars.allRefsInter = this.selectVars.selectedNoRefs;
            //     //取结果赋回属性列表
            //     this.serialAttributes.forEach((v1, i1)=> {
            //         "use strict";
            //         //遍历分类所有值
            //         v1.values.forEach((v2, i2)=> {
            //             if (this.selectVars.allRefsInter.indexOf(v2.id.toString()) >= 0) {
            //                 v2.disabled = false;
            //             } else {
            //                 v2.disabled = true;
            //             }

            //         })
            //     })
            // }
            
        },
        //获得所选的系列商品信息
        getSerialItemInfo: function() {
            if (!this.serialAttributes || this.serialAttributes.length == 0
                || !this.serialProducts || this.serialProducts.length == 0) {
                return null;
            }

            var delimiter = "_";
            var key = "";
            //收集选择的系列属性id
            for (var i = 0; i < this.serialAttributes.length; i++) {
                var values = this.serialAttributes[i].values;

                inner:
                for (var j = 0; j < values.length; j++) {
                    if (values[j].checked) {
                        key += delimiter + values[j].id;
                        break inner;
                    }
                }
            }
            //_123_456_
            key += delimiter;

            var itemInfo = null;

            //根据key获取商品id
            for (var k = 0; k < this.serialProducts.length; k++) {
                var sp = this.serialProducts[k];
                if (sp.key == key) {
                    itemInfo = sp.product;
                    break;
                }
            }

            return itemInfo;
        },
        //增减购物数量
        // plusAmount: function (step) {
        //     if(this.noCheckDefault){
        //         if($(".ui-poptips-cnt").length==0)
        //             $.tips({
        //                 content:"请先选择商品规格！",
        //                 stayTime:2000,
        //                 type:"success"
        //             });
        //         return;
        //     }
        //     // if (this.itemSoldOut) {
        //     //     return;
        //     // }
        //     //倍量判断
        //     var multiple = this.itemInfo.orderMultiple;  //倍量
        //     var stockNum = this.itemInfoForSize.stockNum;
        //     var num = parseInt(this.itemAmount) +step*multiple;
        //         if (isNaN(num)) {
        //             this.itemAmount = 1;
        //         }
        //         if (num == 0) {
        //             this.itemAmount = 1;
        //         }
        //         if (num < this.itemInfo.orderStartNum && num >= 1) {
        //             this.itemAmount = this.itemInfo.orderStartNum;
        //             return;
        //         }
        //         if (num >= 1 && num <= this.itemInfoForSize.stockNum) {
        //             this.itemAmount = num;
        //         }
        //         if(num <= 0){
        //             num = 1;
        //         }
        //         num = this.checkAmount(num);
        //         this.itemAmount = num;

        // },
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
            if (num>0 && num <= this.itemInfo.stockNum) {
                this.itemAmount = num;
                // Vue.localStorage.setItem('itemAmount',this.itemAmount);
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
            var params = {ut:this.ut,mpId: this.itemInfo.mpId, num: this.itemAmount, sessionId: this.sessionId};
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
                this.$emit("close");
                this.show = false;
                this.updateProduct();
                // this.getCartCount();
                // this.$refs.scrolltop.getCartCount();
                console.log(this.$parent.$refs.scrolltop.getCartCount());
            });
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
                //不在兑换时间内的积分商品
                if(!this.canExchange){
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
        //商品不正常状态处理 0 选购的商品总价发生了变化,1 商品失效或下架 2 选购的商品全部失效 提示后,直接返回购物车 3 部分商品不在销售区域内 4 所有商品都不在销售区域内
        unusualExecute: function(data) {
            "use strict";
            this.preOrderInfo = data;
            var dia, title, button, content = '';
            if (this.preOrderInfo.type == 0) {
                title = '<div class="c9 text-center">选购的商品总价发生了变化</div>';
                button = ['<span style="color:gray">返回购物车</span>', '继续结算'];
            } else if (this.preOrderInfo.type == 1) {
                title = '<div class="c9 text-center">以下商品暂时无货!</div>';
                button = ['<span style="color:gray">返回购物车</span>', '继续结算'];
            } else if (this.preOrderInfo.type == 2) {
                title = '<div class="c9 text-center">选购商品全部无货!</div>'
                button = ['<span style="color:gray">返回购物车</span>'];
            } else if (this.preOrderInfo.type == 3) {
                title = '<div class="c9 text-center">' + this.preOrderInfo.message + '</div>'
                button = ['<span style="color:gray">删除无效商品</span>', '修改收货地址'];
            } else if (this.preOrderInfo.type == 4) {
                title = '<div class="c9 text-center">' + this.preOrderInfo.message + '</div>'
                button = ['<span style="color:gray">修改收货地址</span>', '回去看看'];
            } else {
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

            dia.on("dialog:action", (e) => {
                if (e.index == 0)
                    location.href = '/cart.html';
                else {
                    //this.getOrder(null, null, true);
                    console.log('商品信息异常');
                    location.href = '/index.html';
                }
            });
        },
        gotoDetail: function() {
            "use strict";
            if (Vue.browser.isApp()) {
                location.href = '${appSchema}://productdetail?body={"mpId":' + this.mpId + '}';
            } else {
                location.href = '/detail.html?itemId=' + this.mpId;
            }
        },
        //上拉，下拉滑动事件
        onSwipeUp: function() {
            this.transformation = false;
        },
        onSwipeDown: function() {
            this.transformation = true;
        },
    }
}
</script>

<style lang="less">
@import (reference) "../common/variables.less";
@import url(../common/variables.less);
body {
    background: #fff;
} // .ui-actionsheet.show{
//         // display: inherit!important;
// }
.close {
    background: none !important;
}

.box {
    height: 460px;
    padding-bottom: 40px;
    overflow: hidden;
    opacity: 1;
    padding: 15px;
}

.info-circle {
    border-radius: 10px;
}

.close {
    position: absolute;
    right: 0;
    top: 0;
    width: 34px;
    height: 34px;
    line-height: 34px;
    border-radius: 17px;
    background-color: #fff;
    font-size: 32px;
    color: #999;
    text-align: center;
    z-index: 10000;
}

.pic {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    transition: all .6s linear;
    padding: 20px 0 12px;
}

.pic img {
    width: 100%;
    max-height: 250px!important;
}

.pro-info {
    .name {
        font-size: 16px;
        padding: 0 0 5px;
    }
}

.buy-num {
    padding: 3px 0 15px;
    margin-top: 14px;
}

.yuanjia {
    margin-left:6px;
}

.huiyuan {
    width: 40px;
    height: 17px;
    line-height: 17px;
    background: @redColor;
    border-radius: 5px;
    margin: 3px 12px 0 8px;
    color: #fff;
}

.tips {
    padding: 2px;
    font-size: 12px;
    border: 1px solid #e91111;
    border-radius: 2px;
    text-align: center;
    margin-right: 4px;
    color: @redColor;
    height: 12px;
    line-height: 12px;
}

.ui-border-b {
    padding-bottom: 12px;
}

.left {
    float: left;
    width: 58%;
    padding-top: 5px;
}

.chose-num {
    float: right;
    height: 32px;
    border: 1px solid @borderColor;
    border-radius: 4px;

    .num {
        float: left;
        width: 45px;
        height: 100%;
        line-height: 30px;
        font-size: 18px;
        text-align: center;
        border: none;
    }

    .plus,
    .reduce {
        float: left;
        width: 35px;
        height: 100%;
        line-height: 30px;
        font-size: 24px;
        text-align: center;
        color: @thFontColor;
    }

    .plus {
        border-left: 1px solid @borderColor;
    }

    .reduce {
        border-right: 1px solid @borderColor;
    }
}

.car {
    width: 50%;
    background-color: @redColor;
}

.money {
    margin-top: 0;
} // mini
.spp-info {
    height: 0;
    overflow: hidden;
    transition: all 2s linear;
    padding: 12px;
    display: none;
}

.info-img {
    width: 80px;
    height: 80px;
    background-color: #fff;
    margin-right: 12px;
}

img {
    width: 100%;
    height: 100%;
    border-radius: 4px;
}

.info-word {
    padding: 56px 0 12px 0;
    border-bottom: 1px #f5f5f5 solid;
    /* height: 75px; */
}

.huiyuan {
    width: 40px;
    height: 17px;
    line-height: 17px;
    background: red;
    border-radius: 5px;
    margin: 5px 12px 0 8px;
    color: #fff;
}

.detail {
    line-height: 26px;
}

.sort span {
    display: inline-block;
    padding: 0 20px;
    line-height: 35px;
    border-radius: 4px;
    margin: 10px 14px 0 0;
}

.sort {
    padding: 12px;
}

.sort .title {
    line-height: 30px;
}

.sort span.active {
    border: #f23030 1px solid;
    color: #e91111;
}

.close {
    position: absolute;
    right: 0;
    top: 0;
    width: 34px;
    height: 34px;
    line-height: 34px;
    border-radius: 17px;
    background-color: #fff;
    font-size: 32px;
    color: #999;
    text-align: center;
    z-index: 10000;
}

.buy-num {
    padding: 12px 0 15px;
    margin-top: 14px;
    border-top: 1px solid #f5f5f5;
    position: relative;
    bottom: -62px;
    .left {
        float: left;
        width: 58%;
        padding-top: 5px;
    }
}

.chose-num {
    float: right;
    height: 32px;
    border: 1px solid @borderColor;
    border-radius: 4px;

    .num {
        float: left;
        width: 45px;
        height: 100%;
        line-height: 30px;
        font-size: 18px;
        text-align: center;
        border: none;
    }

    .plus,
    .reduce {
        float: left;
        width: 35px;
        height: 100%;
        line-height: 30px;
        font-size: 24px;
        text-align: center;
        color: @thFontColor;
    }

    .plus {
        border-left: 1px solid @borderColor;
    }

    .reduce {
        border-right: 1px solid @borderColor;
    }
}

.car {
    width: 50%;
    background-color: @redColor;
}

.money {
    margin-top: 0;
}

.foot-btn {
    position: absolute;
    width: 100%;
    height: 40px;
    bottom: 0;
    a {
        display: block;
        width: 50%;
        line-height: 40px;
        float: left;
        text-align: center;
        font-size: 16px;
        background-color: #fcac00;
        color: #fff;
    }
    .buy {
        background-color: @redColor;
    }
}

.animation-big {
    .pic {
        width: 80px;
        height: 80px;
        padding: 0;
    }
    .mini-price {
        padding-top: 60px;
        padding-left: 10px;
    }
}

.fl {
    float: left;
}

.animation-small {
    height: 500px;
    overflow-y: scroll;
    opacity: 1;
} // mini --end
.size-list {
    height: 50px !important;
    padding: 0 !important;
    li:last-child {
        border: 0 !important;
    }
}

.size-list-big {
    padding-bottom: 20px;
    height: 380px !important;
}

.sort {
    padding-left: 0 !important;
}

.foot-btn {
    position: absolute;
    width: 100%;
    height: 40px;
    bottom: 0;
    a {
        display: block;
        width: 50%;
        line-height: 40px;
        float: left;
        text-align: center;
        font-size: 16px;
        background-color: #fcac00;
        color: #fff;
    }
    .buy {
        background-color: @redColor;
    }
}

.mini-price {
    height: 26px;
    line-height: 26px;
    overflow: hidden;
    transition: all .6s linear;
}
</style>
