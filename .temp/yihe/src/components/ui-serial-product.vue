<template>
    <div class="ui-actionsheet" :class="{'show': show}" @click="hideActionsheet" v-if="itemInfo">
        <div class="ui-actionsheet-cnt ui-pop" @click="stopPropagation">
            <div class="close" @click="hideActionsheet">×</div>

            <div class="sp-info">
                <div class="info-img">
                    <img :src="itemPreviewImage">
                </div>
                <slot name="prod-info">
                    <div class="info-word" v-if="pageType == 'cut' || pageType == 'group'">
                        <div class="c6 ui-nowrap-multi">{{itemInfo.name}}</div>
                        <div class="theme">
                            <span class="f20">{{itemInfo.promotionPrice |currency '¥'}}</span>
                            <del>{{itemInfo.price |currency '¥'}}</del>
                        </div>
                    </div>
                    <div class="info-word" v-if="pageType == 'package'">
                        <div class="theme">¥<span class="f20">{{itemInfo.promPrice||itemInfo.price|currency '' 2}}</span><del v-if="itemInfo.promPrice">¥{{itemInfo.price |currency '' 2}}</del></div>
                        <div class="ui-nowrap-multi mgT5">{{itemInfo.name || itemInfo.mpName}}</div>
                    </div>
                    <div class="info-word" v-if="pageType == '' || pageType == 'search' || !pageType">
                        <div class="theme" v-if="!isPointPro">
                            ¥<span class="f20">{{itemInfo.presellDownPrice||itemInfo.availablePrice || itemInfo.originalPrice |currency '' 2}}</span>
                            <del v-if="itemInfo.availablePrice">{{itemInfo.originalPrice |currency '¥' 2}}</del>
                        </div>
                        <div class="theme" v-if="isPointPro">
                            <span class="c12 cfe6a00" v-if="itemInfo.pointPrice"><i class="f20 cfe6a00 fb">{{itemInfo.pointPrice}}</i>积分</span>
                            <span class="c12 cfe6a00" v-if="itemInfo.price && itemInfo.pointPrice">+</span>
                            <span class="c12 cfe6a00" v-if="itemInfo.price"><i class="f20 cfe6a00 fb">{{itemInfo.price |currency ''}}</i>元</span>
                        </div>
                        <!--<div class="c6 item-code" v-if="!noCheckDefault">库存：{{itemInfo.stockNum}}</div>-->
                        <!--<div class="c6 item-code">商品编号：{{itemInfo.code}}</div>-->
                        <div class="ui-nowrap-multi mgT5">{{itemInfo.name}}</div>
                    </div>
                </slot>
            </div>
            <ul class="size-list">
                <li class="ui-border-b f13" v-for="sa in serialAttributes">
                    <span>{{sa.name}}</span>
                    <div class="sort f13">
                    <span class="bgf0" v-for="v in sa.values"
                          :class="{active: v.checked&&!v.disabled,disabled:v.disabled}"
                          @click="selectAttributeValue(sa, v,$parent.$index)">{{v.value}}</span>
                    </div>
                </li>
                <li class="ui-border-b" v-if="servicePro && servicePro.length > 0 && !itemInfo.isPresell && !isPointPro && (pageType != 'group' && pageType != 'cut')" v-cloak>
                    <span>安装服务</span>
                    <div class="sort f13">
                        <span class="bgf0" v-for="item in servicePro" :class="{active: item.selected,disabled:!item.areaCansale||item.stockNum==0}" @click="chooseService(item)">{{(item.availablePrice || item.originalPrice) | currency '¥'}}</span>
                    </div>
                </li>
                <slot name="cart-num"></slot>
            </ul>

            <slot name="buttons"></slot>
        </div>
    </div>
</template>
<style lang="less">
    .ui-actionsheet .ui-pop .size-list {
        padding-left: 12px;
        height: auto;
        overflow-y: auto;
        max-height:300px;
    }

</style>
<script>
    import Vue from "vue";
    import config from "../../env/config.js";
    let urlParams = Vue.utils.paramsFormat(location.search);
    export default {
        props: ["show", "title","itemInfo","itemId","selectedItemInfo","serialAttributes","serialProducts","noCheckDefault","multi","pageType","itemAmount","promotionType","promotionId","servicePro","itemPreviewImage","isPointPro"],

        data:function(){
            return {
                isInit:true,
                //商品系列属性
//                serialAttributes: [],
                //系列商品
//                serialProducts: [],
//                itemPreviewImage: "",
                serialAttrsLib:{},
                serialProdsLib: {},
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
                oldPageType:'no'
            }
        },
        watch:{
            show:function(){
                if(this.show&&this.itemId&&(this.isInit||this.multi)) {
                    this.serialAttributes=[];
                    this.serialProducts=[];
                    this.updateItemPreviewImage();
                    if(this.oldPageType!=this.pageType){
                        this.oldPageType=this.pageType;
                        this.serialAttrsLib[this.itemId]={};
                        this.serialProdsLib[this.itemId]={};
                    }
                    if(Object.getOwnPropertyNames(this.serialAttrsLib[this.itemId]||{}).length>0&&Object.getOwnPropertyNames(this.serialProdsLib[this.itemId]||{}).length>0) {
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
                            this.afterGetSerialProducts(temp,this.itemId);
                        } else{
                            this.getSerialProducts(this.itemId);
                        }
                        this.getServicePro([this.itemId]);//服务商品要重新获取
                    }
                    
                };
            }
        },
        computed:{
            itemId:function(){
                return (this.itemInfo||{}).mpId||0;
            }
        },
        methods: {
            // 获取关联的服务商品
            getServicePro:function (mpIds) {

                if(this.itemInfo.isPresell || this.pageType == 'cut' || this.pageType == 'group') return;
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
            hideActionsheet: function () {
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
            //商品系列属性及系列商品
            getSerialProducts: function (itemId) {
                if((this.pageType == 'cut' || this.pageType == 'group') && !this.itemInfo.seriesId) {
                    return;
                }

                var url=this.pageType=='cut'?'/api/promotion/cut/serialProduct':this.pageType=='group'?"/api/patchgroupon/serialProduct":"/back-product-web/api/product/serialProducts.do"
                var param={
                    mpId: itemId,
                    platformId: config.platformId
                }
                if(['cut','group'].indexOf(this.pageType)>=0) {
                    param.seriesId = this.itemInfo.seriesId;
                    param.activityId = this.itemInfo.activityId;
                }
                if(this.pageType=='presell'){
                    param.sellType=1;
                }
                Vue.api.get(url, param, (result) => {
                    //积分商品的详情页，要屏蔽促销
                    if(this.isPointPro && result.data.serialProducts){
                        result.data.serialProducts.forEach((item) => {
                            item.product.isPresell = 0;
                            item.product.isSeckill = 0;
                        })
                    }
                    this.afterGetSerialProducts(result.data,itemId);
                })
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
                    //套餐、搜索系列属性组件，需要每次都重新初始化
                    if(this.pageType != 'package' && this.pageType != 'search'){
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
                            // if(sp.product&&sp.product.stockNum>0 && sp.product.managementState == 1) { //过滤无库存,上下架,价格库存应该在实时价格库存接口里面校验
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
                    //套餐商品不需要刷新实时价格接口,拼团，也不需要刷实时价格
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
                this.serialAttributes = this.serialAttrsLib[this.itemId];
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
                this.serialProducts = this.serialProdsLib[this.itemId];
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
            //初始化数据
            clearSerial:function(){
                this.serialAttrsLib= {};
                this.serialProdsLib= {};
                this.selectVars = {
                    prodKeys: [],
                    prodKeysV: [],
                    newItemInfo: null,
                    selectedIds: [],
                    allRefs : [],
                    selectedNoRefs : [],
                    allRefsInter : [],
                    refMap : {}
                }
            },
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

                                if(plistMap[sp.product.mpId].stockNum>0 && plistMap[sp.product.mpId].managementState == 1){
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

                            if(plistMap[sp.product.mpId].stockNum>0 && plistMap[sp.product.mpId].managementState == 1){
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
            groupAndCut: function (itemId) {
                let validKeys = [];
                for(let sp of this.serialProdsLib[itemId]||[]){
                    if(sp.product!=null){
                        validKeys.push(sp.key)
                    }
                }
                this.getSerialProductsEnd(validKeys.join().replace(/__/g,'_'));
            },
            //打开商品系列属性
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

                var validKeys = [];
                this.serialProducts.forEach((item) => {
                    validKeys.push(item.key);
                })
                var keys = validKeys.join().replace(/__/g,'_');
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
                }
            },
            /**
             * 选择某个系列属性值
             * @param serialAttribute
             * @param value
             */
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
                        this.$emit('updateitem');
                        //套餐传进来的数量限制要保留
                        if(this.itemInfo.individualCanBuyCount !=null && this.itemInfo.canSaleNum != null){
                            this.selectVars.newItemInfo.individualCanBuyCount = this.itemInfo.individualCanBuyCount;
                            this.selectVars.newItemInfo.canSaleNum = this.itemInfo.canSaleNum;
                        }
                        this.itemInfo = this.selectVars.newItemInfo;
                        this.getServicePro([this.itemId]);//服务商品要重新获取
                        this.itemAmount=1;
                        this.updateItemPreviewImage();
                    }
                    this.itemId=this.itemInfo.mpId;
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
            //更新预览图
            updateItemPreviewImage: function () {
                if (this.itemInfo && (this.itemInfo.pic||this.itemInfo.picUrl)) {
                    this.itemPreviewImage = this.itemInfo.pic||this.itemInfo.picUrl;
                }else if (this.itemInfo && this.itemInfo.pics instanceof Array && this.itemInfo.pics.length > 0) {
                    this.itemPreviewImage = this.itemInfo.pics[0].url;
                }else if(this.itemInfo&&this.itemInfo.url60x60)
                    this.itemPreviewImage=this.itemInfo.url60x60;
            },
        }
    }
</script>
