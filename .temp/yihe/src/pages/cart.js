import Vue from "vue";
import UiHeader from "../components/ui-header.vue";
import UiFooter from "../components/ui-footer.vue";
import UiActionsheet from "../components/ui-actionsheet.vue";
import UiActionsheetPop from "../components/ui-actionsheet-pop.vue";
import UiSerialProduct from "../components/ui-serial-product.vue";
import UiGuessLike from "../components/ui-guess-like.vue";
import config from "../../env/config.js";
import VueLazyload from 'vue-lazyload';

Vue.use(VueLazyload,{
    loading:config.defaultImg
});
var str=[];
var timer;
 
let vm = new Vue({
    el: 'body',
    components: { UiHeader, UiFooter, UiActionsheet, UiActionsheetPop,UiSerialProduct,UiGuessLike },
    data: {
        showChaiDan: false, //显示拆单
        editStatus: false,   //编辑状态
        showDelete:false,   //删除确认
        cartInfo:{},  //购物车信息
        failureProducts:[], //失效商品
        noGoods:true,
        rightNavFlag: false,
        removeDisabledActive:true, //删除失效商品状态
        showFavorite:false,//移动收藏夹

        //当前group
        thisGroup:{}, //当前组
        showGifts:false, //显示赠品
        giftList:[], //促销列表
        //giftListStore:'',//备份赠品信息
        giftSelectList:[],//选中赠品
        giftSelectAttr:{}, //选中赠品属性
        giftEditable:false, //是否可选赠品
        serialMap:{
            products:{},
            status:{},
            serial:{}
        }, //赠品系列属性映射
        maxGiftNum:0,//最大赠品数
        //serialMapStore:'',//备份赠品系列属性
        //普通商品系列
        showSizePop:false,//显示普通商品系列属性
        oldMpId:'',  //旧mpId
        itemInfo:{},
        itemAmount: 1,
        itemPreviewImage:'',//系列商品预览图
        //商品系列属性
        serialAttributes: [],
        //系列商品
        serialProducts: [],
        itemId:'',
        //初始化判断
        isLoaded:false,
        //无库存商品列表
        noStockList:{},
        cartCount:0, //购物车数目
        recoList: [],//猜你喜欢
        iShowNotice: false,
        noticeList: [],//公告
        iShowNoticeAction: false,
        mpIds: '',//购物车商品id拼接字符串
        summary: {},
        mainServeProductMap: {}    // 主品id与服务商品映射
    },
    ready: function() {
        this.getCartList();
        this.getNotice();
    },
    methods: {
        goPay:function () {
            Vue.utils.goLogin(() => {
                location.replace("/pay/pay.html");
            });
        },

        //判断是不是大于一件的数组
        checkArray:function(array){
            return array instanceof Array&&array.length>0;
        },
        //获取商品的服务商品
        getMerchantServiceProduct: function(cartInfo) {
            // 获取主品的服务商品，目前一个主品只有一个服务商品，下一期支持多个服务商品
            let url = config.apiHost + '/back-product-web/consultAppAction/getMerchantProductList.do';
            // var params = "[";
            var merchantList = cartInfo.merchantList;
            var mpIds = [];
            for (var i in merchantList) {
                for (var j in merchantList[i].productGroups) {
                    for(var k in merchantList[i].productGroups[j].productList) {
                        var mainProduct = merchantList[i].productGroups[j].productList[k];
                        // params += "" + mainProduct.mpId + ",";
                        mpIds.push(mainProduct.mpId)
                    }
                }
            }
            var params = {

            }           
            if (mpIds.length < 1) {
                // console.info("购物车无商品");
                return;
            }
            // if (params.length > 1) {
            //     params = params.substring(0, params.length-1);
            // }
            // params += "]";
            // 发送查询请求
			Vue.api.post(url, JSON.stringify({
                mpIds:mpIds,
                areaCode:Vue.area.getArea().aC
            }), (res) => {
                if (res.data) {
                    // 显示'选择服务'按钮
                    for (var k in res.data) {
                        var serveProduct = res.data[k];
                        this.mainServeProductMap[k] = serveProduct[0];
                    }
                    var merchantList = cartInfo.merchantList;
                    
                    for (var i in merchantList) {
                        for (var j in merchantList[i].productGroups) {
                            for(var k in merchantList[i].productGroups[j].productList) {
                                var mainProduct = merchantList[i].productGroups[j].productList[k];
                                if (this.mainServeProductMap[mainProduct.mpId]) {   // 该商品有服务商品
                                    if (!mainProduct.additionalProductList || mainProduct.additionalProductList.length<1) {  // 而且没有添加服务商品
                                        mainProduct.showServe = true;
                                    }
                                }
                            }
                        }
                    }
                }
            })
            
        },
        // 是否显示服务商品，有则显示，没有不显示
        showServiceProduct: function(product) {
            // 如果服务商品存在而且数量大于1
            if (product.additionalProductList && product.additionalProductList.length>0) {
                return true;
            } else {
                return false;
            }
        },
        //选择服务（添加服务商品给主品）
        addServiceProduct(product) {
            let url = config.apiHost + "/api/cart/editItemNum";
            let serveProduct = this.mainServeProductMap[product.mpId];
            let addItems = new Array();
            addItems[0] = {};
            addItems[0].mpId = serveProduct.id;
            addItems[0].num = product.num;
            addItems[0].itemType = 0;    // 服务商品，itemType传0
            addItems[0].objectId = product.objectId;

            let params = {
                mpId: product.mpId,
                num: product.num,
                ut: Vue.auth.getUserToken(),
                sessionId: Vue.session.getSessionId(),
                merchantId: product.merchantId,
                modeType: 0,    // B2B2C 0
                itemType: product.itemType,    
                objectId: product.objectId,
                itemId: product.itemId,
                additionalItems: JSON.stringify(addItems),
            }
            Vue.api.get(url, params, (res)=>{
                this.getCartList();
            });
        },
        //删除服务
        removeServiceProduct(serviceProduct) {
            let url = config.apiHost + "/api/cart/removeItem";
            let params = {
                sessionId: Vue.session.getSessionId(),
                itemId: serviceProduct.itemId
            }
            
            Vue.api.get(url, params, (res)=>{
                this.getCartList();
            });
        },
        //初始化购物车信息
        getCartList:function(flag){
            let url=config.apiHost+"/api/cart/list";
            let params={
                ut: Vue.auth.getUserToken(),
                sessionId:Vue.session.getSessionId(),
                platformId:config.platformId,
                areaCode: Vue.area.getArea().aC,
                receiverId: Vue.localStorage.getItem('receiverId') || '',
                v:1.2
            }
            Vue.api.get(url,params,(res)=>{
                var data=res.data;

                var merchantList=data.merchantList;
                for (var i in merchantList) {
                    for (var j in merchantList[i].productGroups) {
                        for(var k in merchantList[i].productGroups[j].productList) {
                            str.push({"id": merchantList[i].productGroups[j].productList[k].mpId ,
                                      "name": merchantList[i].productGroups[j].productList[k].name ,
                                      "category": merchantList[i].productGroups[j].productList[k].categoryName ,
                                      "unitPrice": merchantList[i].productGroups[j].productList[k].originalPrice ,
                                      "count": merchantList[i].productGroups[j].productList[k].num});
                            merchantList[i].productGroups[j].productList[k].showServe = false;
                        }
                    }
                }
                
                //if(data.merchantList)
                if(this.checkArray(data.merchantList)&&this.checkArray(data.merchantList[0].productGroups)){
                    data.merchantList[0].productGroups.forEach((v)=>{
                        if(this.checkArray(v.giftProductList)&&this.checkArray(v.giftProductList[0].giftProducts)){
                            v.giftProductList[0].giftProducts.forEach((v1)=>{
                                v1.showSerial=false;
                            })
                        }
                    })
                }
                this.cartInfo=data;
                this.summary = data.summary;
                //秒杀商品倒计时、获取商品id
                var mpIds = '';
                if(this.cartInfo.merchantList){
                    this.cartInfo.merchantList.forEach((v)=>{
                        v.productGroups.forEach((v1)=>{
                            v1.productList.forEach((v2)=>{
                                mpIds += v2.mpId + ',';
                                if(this.checkArray(v2.promotions)){
                                    if(v2.promotions[0].countdown > 0) this.startCountDown(v2.promotions[0].countdown, v2);
                                }
                            })
                        })
                    })
                    mpIds = mpIds.substring(0,mpIds.length-1);
                }

                this.failureProducts=data.failureProducts||[];
                this.isLoaded=true;
                if(this.cartInfo.merchantList && this.cartInfo.merchantList.length>0){
                    this.noGoods=false;
                    this.removeDisabledActive=true;
                }
                if(!flag) this.getRecoList(mpIds);
                this.setCheckList();
                this.getCartCount();
                this.getMerchantServiceProduct(this.cartInfo);
            }, () => {
                //处理掉不显示报错
            })
        },
        //设定初始选择状态
        setCheckList:function(){
            for(let m of this.cartInfo.merchantList||[]){
                var prodList=[];
                // m.checked=true;
                Vue.set(m,'checked',true);
                for(let g of m.productGroups||[]){
                    for(let p of g.productList||[]){
                        if(p.disabled == 0){
                            if(p.checked==0) m.checked=false;
                        }
                        //有无效商品与无库存商品
                        //if(p.disabled) m.disabled=true;
                        prodList.push(p.mpId.toString())
                        if(p.stockNum==0&&!this.noStockList[p.mpId]){
                            Vue.set(this.noStockList,p.mpId,false);
                        }
                    }
                }
            }
        },
        checkInputNum:function (pro) {
            if(pro.num > pro.stockNum){
                Vue.utils.showTips('超过可购买数量');
                pro.num = pro.stockNum;
            }
            if(timer) clearTimeout(timer);
            timer=setTimeout(()=>{
                let url=config.apiHost+"/api/cart/editItemNum";
                let params={
                    ut: Vue.auth.getUserToken(),
                    sessionId:Vue.session.getSessionId(),
                    mpId:pro.mpId,
                    num:pro.num
                }
                Vue.api.postForm(url,params,(res)=>{
                    if(!this.editStatus)
                        this.getCartList(true);
                },  (res)=>{
                    //库存等不足错误时刷新购物车
                    if(!this.editStatus)
                        this.getCartList();
                })
            },200)
        },
        //更新件数
        editNum:function(prod,step){
            step > 0 ? prod.num++ : prod.num--;
            if(timer) clearTimeout(timer);
            timer=setTimeout(()=>{
                let url=config.apiHost+"/api/cart/editItemNum";
                let params={
                    ut: Vue.auth.getUserToken(),
                    sessionId:Vue.session.getSessionId(),
                    mpId:prod.mpId,
                    num:prod.num
                }
                function heimdallEmit(step){
                    try{
                        //ev:14加车事件，12减车事件
                        window.eventSupport.emit('heimdallTrack',{
                            ev:  step > 0 ? "14" : "12",
                            pri: prod.mpId,
                            pvi: prod.mpId,
                            prm: 1,//购物车加减这里永远为1，修改数量传其他ev
                            prn: prod.name,
                            pt: prod.categoryName || "",
                            pti: prod.categoryId || "",
                            bn: prod.brandName || "",
                            bni: prod.brandId || "",
                            prp: prod.price
                        });
                    }catch(err){
                        console.log(err);
                    }
                }
                
                Vue.api.postForm(url,params,(res)=>{
                    //成功才发埋点事件
                    heimdallEmit(step);
                    if(!this.editStatus)
                        this.getCartList(true);
                },  (res)=>{
                    //库存等不足错误时刷新购物车
                    if(!this.editStatus)
                        this.getCartList();
                })
            },200)
        },
        //选中商品
        selectItem:function(product,merchant,taocan){
            merchant.checked = true;
            for(let g of merchant.productGroups||[]){
                for(let p of g.productList||[]){
                    //p.checked=false;
                    if(!p.checked) merchant.checked = false;
                }
            }
            if(this.editStatus){
                // product.checked=!product.checked;
                return;
            }

            if(timer) clearTimeout(timer);
            timer=setTimeout(()=>{
                let url=config.apiHost+"/api/cart/editItemCheck";
                let params={
                    ut: Vue.auth.getUserToken(),
                    sessionId:Vue.session.getSessionId()
                }
                if(product.mainItemId == 'isMain'){
                    params.skus = JSON.stringify([{
                        "mpId":product.mpId,
                        "num":product.num,
                        "itemType":product.itemType,
                        "objectId":product.objectId,
                        "isMain":1,
                        "checked":taocan.checked?1:0
                    }])
                } else{
                    params.checkStr = [product.mpId,product.checked?1:0,product.itemType,product.objectId].join('-');
                }

                // console.log(this.selectAll)
                Vue.api.postForm(url,params,(res)=>{
                    this.getCartList();
                })
            },200)
        },
        //选中某商家下商品
        selectMerchantItem:function(merchant){
            if(this.editStatus){
                for(let g of merchant.productGroups||[]){
                    for(let p of g.productList||[]){
                        if(merchant.checked) p.checked = true;
                        else p.checked = false;
                    }
                }
                return;
            }

            if(timer) clearTimeout(timer);
            timer=setTimeout(()=>{
                let url=config.apiHost+"/api/cart/editItemCheck";
                if(this.selectAll.unchecked.length==0){//全选状态
                    for(let g of merchant.productGroups||[]){
                        for(let p of g.productList||[]){
                            p.checked=false;
                        }
                    }
                }else { //部分选中或全不选中
                    for (let g of merchant.productGroups || []) {
                        for (let p of g.productList || []) {
                            p.checked = true;
                        }
                    }
                }
                let params={
                    ut: Vue.auth.getUserToken(),
                    sessionId:Vue.session.getSessionId(),
                    checkStr:(this.selectAll.checked_type.concat(this.selectAll.unchecked_type)).join()
                }
                Vue.api.postForm(url,params,(res)=>{
                    this.getCartList();
                })
            },200)
        },
        //选中所有商品
        checkAllItems:function(all){
            if(this.editStatus){
                for(let m of this.cartInfo.merchantList||[]){
                    if(this.allChecked) m.checked=true;
                    else m.checked=false;
                    for(let g of m.productGroups||[]){
                        if(m.groupId){
                            m.checked = true;
                            return;
                        }
                        for(let p of g.productList||[]){
                            if(this.allChecked) p.checked=true;
                            else p.checked=false;
                        }
                    }
                }
                return;
            }

            if(timer) clearTimeout(timer);
            timer=setTimeout(()=> {
                let url = config.apiHost + "/api/cart/editItemCheck";
                let params = {
                    ut: Vue.auth.getUserToken(),
                    sessionId:Vue.session.getSessionId(),
                    skus: JSON.stringify(all.checked_skus.concat(all.unchecked_skus))
                }
                Vue.api.postForm(url, params, (res)=> {
                    this.getCartList();
                })
            },200)

            //for(let k in this.noStockList){
            //    this.noStockList[k]= all.unchecked.length==0;
            //}
        },
        //删除商品
        removeItems:function(all,callback){
            // console.log(this.selectAll)
            // var all=this.selectAll;
            if(timer) clearTimeout(timer);
            timer=setTimeout(()=>{
                let url = config.apiHost + "/api/cart/removeItemBatch";
                let params = {
                    ut: Vue.auth.getUserToken(),
                    sessionId:Vue.session.getSessionId(),
                    mpIds: all.checked__type.join()
                }
                Vue.api.postForm(url, params, (res)=> {
                    this.getCartList();
                    this.showDelete=false;
                    if(callback) callback();
                })
            },200)
        },
        //批量移入收藏夹
        moveToFavorite:function(all){
            let url = config.apiHost + "/api/cart/batchFavorite";
            let params = {
                ut: Vue.auth.getUserToken(),
                //companyId: Vue.mallSettings.getCompanyId(),
                type:1,//商品
                entityIds: all.checked__type.join()
            }
            Vue.api.postForm(url, params, (res)=> {
                //只加入收藏(新)
                $.tips({
                    content:"移入收藏夹成功",
                    stayTime:2000,
                    type:"success"
                });
                this.showFavorite=false;
                this.getCartList();
            })
        },
        beforeMoveToFavorite:function () {
            if(this.checkedCount==0&&this.allSelectedNoStock.length<=0){
                Vue.utils.showTips('请选择商品');
                return;
            }
            this.showFavorite=true;
        },
        beforeDelete:function () {
            if(this.selectAll.checked.length<=0&&this.allSelectedNoStock.length<=0){
                Vue.utils.showTips('请选择商品');
                return;
            }
            this.showDelete=true;
        },
        //清除失效商品
        removeDisabledItems:function(all){
            this.removeDisabledActive=false;
            let url = config.apiHost + "/api/cart/clearFailure";
            let params = {
                ut: Vue.auth.getUserToken(),
                sessionId:Vue.session.getSessionId()
            }
            Vue.api.postForm(url, params, (res)=> {
                this.getCartList();
                //this.showDelete=false;
                this.removeDisabledActive=true;
            },(res)=>{
                "use strict";
                this.removeDisabledActive=true;
                $.tips({
                    content:res.message,
                    stayTime:2000,
                    type:"success"
                });
            })
        },
        /**
         * 查看/选择赠品
         * @param group
         * @param editAble true:选择 false:查看
         */
        viewGifts:function(group,editAble) {
            this.thisGroup=group;
            if (!group.promotion || !group.giftProductList) return;
            var gifts = group.giftProductList[0];
            //各种条件定义
            //可编辑状态
            this.giftEditable = editAble;
            //弹窗显示赠品列表
            this.showGifts = true;
            //赠品内容
            this.giftList = [];
            //选中的赠品id
            this.giftSelectList = [];
            //选中的赠品属性ID
            this.giftSelectAttr={};
            //获取对应赠品的系列属性
            (gifts.giftProducts||[]).forEach((v)=>{
                "use strict";
                this.giftList.push(v);
                if (v.checked == 1)
                    this.giftSelectList.push(v.mpId);
            });
            //最大赠品数
            this.maxGiftNum=gifts.canSelectedGiftsNum;
            //this.giftListStore=JSON.stringify(this.giftList);
            //恢复系列属性状态
            this.serialMap.status={}
            this.serialMap.serial={}
            this.serialMap.products={}
        },
        /**
         * 获取赠品的商品系列属性及系列商品
         * @param itemId
         */
        getGiftSerialProducts: function (mpId) {
            //this.thisGroup
            if (!this.thisGroup.promotion || !this.thisGroup.giftProductList||!this.thisGroup.promotion.promotionId||!this.thisGroup.promotion.promotionRuleId) return;
            if(this.serialMap.serial[mpId]){

                Vue.set(this.serialMap.status,mpId,!this.serialMap.status[mpId]);
                //this.serialMap.status[mpId]=!this.serialMap.status[mpId];
                return;
            }
            Vue.api.postForm("/api/cart/minSkuDetail", {
                ut: Vue.auth.getUserToken(),
                sessionId:Vue.session.getSessionId(),
                mpId: mpId,
                promotionId:this.thisGroup.promotion.promotionId,
                promotionRuleId:this.thisGroup.promotion.promotionRuleId
            }, (result) => {
                if (result.data) {
                    if(result.data.attributes instanceof Array&&result.data.attributes.length>0){
                        result.data.attributes.forEach((V)=>{
                            "use strict";
                            V.values.forEach((v)=>{
                                v.disabled=false;
                            })
                        })
                    }
                    Vue.set(this.serialMap.serial,mpId,result.data.attributes);
                    Vue.set(this.serialMap.products,mpId,result.data.serialProducts);
                    Vue.set(this.serialMap.status,mpId,true);
                    //this.serialMapStore=JSON.stringify(this.serialMap);
                }
            });
        },
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
        /**
         * 选择某个系列属性值
         * @param serialAttribute
         * @param value
         */
        selectGiftAttributeValue: function (serialAttribute, value,gift,index) {
            serialAttribute.values.forEach(function (v) {
                v.checked = false;
            });
            value.checked = true;
            //正常
            if(!gift){
                var newItemInfo = this.getSerialItemInfo();
                //选择了不同的属性
                if (newItemInfo && newItemInfo.mpId != this.itemInfo.mpId) {
                    this.itemInfo = newItemInfo;
                    this.updateItemPreviewImage();
                }
                return;
            }
            //存在的系列商品对应id数组
            var prodKeys=[];
            this.serialMap.products[gift.mpId].forEach((v)=>{
                "use strict";
                prodKeys.push(v.key.replace(/(^_|_$)/g,'').split('_'))
            })


            //取数组交集
            Array.prototype.intersect = function(b) {
                var flip = {};
                var res = [];
                for(var i=0; i< b.length; i++) flip[b[i]] = i;
                for(i=0; i<this.length; i++)
                    if(flip[this[i]] != undefined) res.push(this[i]);
                return res;
            }

            //每个属性映射的对象
            var allRefs=[],allRefsInter=[],reference=[];
            prodKeys.forEach((v3,i3)=>{
                //如果包含有当前选中的id
                if(v3.indexOf(value.id.toString())>=0){
                    reference=reference.concat(v3)
                }
                //当前选中id同级的所有id
                reference.push(v3[index]);
            })
            reference=this.uniqExecute(reference);
            allRefs.push(reference)
            //取合集
            allRefsInter=allRefs[0];
            for(var i=1;i<allRefs.length;i++){
                allRefsInter=allRefsInter.intersect(allRefs[i]);
            }

            //console.log(allRefsInter);
            var newItemInfo=null,selectedIds=[''];
            //取结果赋回属性列表
            this.serialMap.serial[gift.mpId].forEach((v1,i1)=> {
                "use strict";
                //遍历分类所有值
                var hasChecked=false;
                v1.values.forEach((v2, i2)=> {
                    v2.checked=false;
                    v2.disabled=true;
                    if(v2.id==value.id){
                        v2.disabled=false;
                        v2.checked=true;
                        selectedIds.push(v2.id)
                        hasChecked=true;
                    }
                    if(allRefsInter.indexOf(v2.id.toString())>=0){
                        v2.disabled=false;
                        if(i1!=index&&!hasChecked){
                            v2.checked=true;
                            hasChecked=true;
                            selectedIds.push(v2.id)
                        }
                    }
                })
            })
            selectedIds.push('');
            selectedIds=selectedIds.join('_');

            //根据key获取商品id
            for (var k = 0; k < this.serialMap.products[gift.mpId].length; k++) {
                var sp = this.serialMap.products[gift.mpId][k];
                if (sp.key == selectedIds) {
                    newItemInfo = sp.product;
                    break;
                }
            }

            gift.newId=newItemInfo.mpId;
            gift.giftName=newItemInfo.name;
            gift.canSaleNum=newItemInfo.stockNum;
            gift.merchantId=newItemInfo.merchantId;
            gift.picUrl=newItemInfo.pics[0].url;
            gift.originalPrice=newItemInfo.originalPrice;
            var propertyTags=[];
            newItemInfo.attres.forEach((v)=>{
                propertyTags.push({
                    name:v.attrName.name,
                    value:v.attrVal.value
                })
            })
            gift.propertyTags=propertyTags;

        },
        /**
         * 完成赠品的选择
         */
        changeGifts:function(giftList){
            // 没有赠品，或者giftEditable为false，是查看赠品，直接返回
            if(!giftList instanceof Array||giftList.length==0 || !this.giftEditable){
                this.showGifts = false;
                return;
            };
            var giftIds=[],promotionId,giftSelectList=this.giftSelectList;
            promotionId=giftList[0].promotionId;
            giftList.forEach((v)=> {
                if (giftSelectList.indexOf(v.mpId) >= 0) {
                    giftIds.push(v.newId||v.mpId)
                }
            });
            Vue.api.postForm("/api/cart/updateGift", {
                ut: Vue.auth.getUserToken(),
                sessionId:Vue.session.getSessionId(),
                mpIds: giftIds.join(','),
                promotionId:promotionId
            }, (result) => {
                if (result.code== 0) {
                    //更新
                    this.getCartList();
                    $.tips({
                        content:"选择成功",
                        stayTime:2000,
                        type:"success"
                    });
                    //if(giftIds.sort()!=this.giftSelectList.sort())
                    //    this.giftSelectList=giftIds
                    this.showGifts=false;
                }
            });
        },

        //商品系列

        //弹出系列属性选择窗口
        alertSerialProducts:function(prod){
            "use strict";
            if(prod.itemType==3) return;//如果是奖品, 不可进行系列属性修改
            this.itemPreviewImage='';
            this.itemInfo=prod;
            this.itemAmount=prod.num;
            //this.getItemInfo(prod.mpId);
            //this.getSerialProducts(prod.mpId)
            //this.itemId=prod.mpId;
            this.showSizePop=true;
            this.oldMpId=this.itemInfo.mpId;
            this.updateItemPreviewImage();
            this.itemInfo.isCart=true;
        },

        //商品基本信息
        getItemInfo: function (itemId) {
            Vue.api.get("/api/product/baseInfo", {mpId: itemId}, (result) => {
                if (result.data && result.data.length > 0) {
                    this.itemInfo = result.data[0];
                    this.showSizePop=true;
                    this.updateItemPreviewImage();
                    this.oldMpId=this.itemInfo.mpId;
                }
            }, () => {
                //处理掉不显示报错
            });
        },

        //获得所选的系列商品信息
        getSerialItemInfo: function () {
            var serialAttributes,serialProducts;
            if (!this.serialAttributes || this.serialAttributes.length == 0
                || !this.serialProducts || this.serialProducts.length == 0) {
                return null;
            }

            serialAttributes=this.serialAttributes;
            serialProducts=this.serialProducts;

            var delimiter = "_";
            var key = "";
            //收集选择的系列属性id
            for (var i = 0; i < serialAttributes.length; i++) {
                var values =  serialAttributes[i].values;

                inner:
                    for (var j = 0; j < values.length; j++) {
                        if(values[j].checked) {
                            key += delimiter + values[j].id;
                            break inner;
                        }
                    }
            }
            //_123_456_
            key += delimiter;

            var itemInfo = null;

            //根据key获取商品id
            for (var k = 0; k < serialProducts.length; k++) {
                var sp = serialProducts[k];
                if (sp.key == key) {
                    itemInfo = sp.product;
                    break;
                }
            }

            return itemInfo;
        },
        //更新预览图
        updateItemPreviewImage: function () {
            if (this.itemInfo && this.itemInfo.pics && this.itemInfo.pics.length > 0) {
                this.itemPreviewImage = this.itemInfo.pics[0].url;
            }
        },
        //增减购物数量
        plusAmount: function (step) {
            if (this.itemSoldOut) {
                return;
            }

            var num = this.itemAmount + step;
            if (num>0 && num <= this.itemInfo.stockNum) {
                this.itemAmount = num;
            }
        },
        //更新购物车
        updateCart: function (itemId) {
            var params = {
                oldMpId:this.oldMpId,
                newMpId: itemId,
                num: this.itemAmount,
                sessionId: Vue.session.getSessionId()};
            Vue.api.postForm("/api/cart/updateProduct", params, (result) => {
                //更新
                this.getCartList();
                $.tips({
                    content:"修改成功",
                    stayTime:2000,
                    type:"success"
                });
                this.showSizePop=false;
            });
        },

        //选择/更新赠品
        updateGift: function (itemId) {
            var params = {
                oldMpId:this.oldMpId,
                newMpId: itemId,
                num: this.itemAmount,
                sessionId: Vue.session.getSessionId()};
            Vue.api.postForm("/api/cart/updateGift", params, (result) => {
                //更新
                this.getCartList();
                $.tips({
                    content:"修改成功",
                    stayTime:2000,
                    type:"success"
                });
                this.showSizePop=false;
            });
        },
        //closeShowGifts:function(giftList,serialMap){
        //    this.showGifts=false;
        //    giftList=JSON.parse(this.giftListStore);
        //    serialMap=JSON.parse(this.serialMapStore);
        //},

        //去订单确认页
        gotoPay:function(num){
            if(num==0) return;
            window.location.href = "/pay/pay.html";
        },
        //判断是否属激活
        checkActive:function(boo,active,disabled){
            "use strict";
            if(this.giftEditable&&boo){
                return {active:true};
            }
            return {disabled:true};
        },
        //获取购物车数目
        getCartCount:function(){
            "use strict";
            var params = {sessionId: Vue.session.getSessionId(), ut: Vue.auth.getUserToken()};
            Vue.api.postForm("/api/cart/count", params, (result) => {
                this.cartCount=result.data;
            });
        },
        noop:function(){},
        //倒计时
        startCountDown: function (time, obj) {
            var hms = Vue.utils.getHhmmss(parseInt(time));
            Vue.set(obj,"hh",hms.h);
            Vue.set(obj,"mm",hms.m);
            Vue.set(obj,"ss",hms.s);
            Vue.set(obj,"day",hms.d);

            var inter = setInterval(() => {
                time--;
                var hms = Vue.utils.getHhmmss(time);
                Vue.set(obj,"hh",hms.h);
                Vue.set(obj,"mm",hms.m);
                Vue.set(obj,"ss",hms.s);
                Vue.set(obj,"day",hms.d);
                if (time <= 0) {
                    clearInterval(inter);
                }
            }, 1000);
        },
        //猜你喜欢
        getRecoList: function (mpIds) {
            this.recoList = [];
            var url = config.apiHost + '/api/read/product/recommendProductList';
            var param = {
                sceneNo: 2,
                ut: Vue.auth.getUserToken(),
                mpIds: mpIds,
                pageSize: 20,
                pageNo: 1,
                platformId: config.platformId,
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
                        this.initSwipe();
                    });
                }
            }, () => {
                //处理掉不显示报错
            });
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
        initScroll: function () {
            Vue.nextTick(function () {
                var scroll = new fz.Scroll('.ui-scroller', {
                    scrollY: true
                });
            })
        },
        //重置图片大小
        resizeImgHeight: function () {
            Vue.nextTick(function () {
                var width = $('.ui-grid-halve-img img').width();
                $('.ui-grid-halve-img img').height(width);
            })
        },
        stopPropagation: function (e) {
            e.stopPropagation();
        },
        //公告
        getNotice: function(){
            var url = config.apiHost + '/api/dolphin/list';
            var param = {
                platform: config.platform,
                pageCode: 'H5_SHOPPING_CART_PAGE',
                adCode: 'notice_shopping',
                companyId: Vue.mallSettings.getCompanyId(),
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, param, (res) => {
                this.noticeList = res.data.notice_shopping;
                if(this.noticeList.length>0){
                    this.iShowNotice=true
                }
                this.initNoticeScroll();
            }, () => {
                //处理掉不显示报错
            });
        },
        showNoticeAction: function () {
            this.initScroll();
            this.iShowNoticeAction = true;
        },
        //公告滚动初始化
        initNoticeScroll: function () {
            Vue.nextTick(function () {
                var $ul = $('.t-notice ul');
                var $lis = $ul.find('li');
                var liHeight = $lis.height();
                if($lis.length > 1) {
                    setInterval(function() { //终于解决了安卓滚动重影问题！！！背景色
                        $ul.css({
                            '-webkit-transform':'translate3d(0,-42px,0)',
                            '-webkit-transition':'-webkit-transform .5s'
                        });
                        setTimeout(function () {
                            $ul.css({
                                '-webkit-transform': 'translate3d(0,0,0)',
                                '-webkit-transition': null
                            });
                            $ul.append($ul.children().first());
                        }, 500);
                    }, 5000);
                }
            })
        },
        //加入购物车
        addItemInCart: function (item) {
            var params = {
                ut: Vue.auth.getUserToken(),
                mpId: item.mpId,
                num: 1,
                sessionId: Vue.session.getSessionId()
            };
            Vue.api.postForm(config.apiHost + "/api/cart/addItem", params, (res) => {
                $.tips({
                    content:"添加成功",
                    stayTime:2000,
                    type:"success"
                });
                this.getCartCount();
                this.getCartList();
            });
        },
        deleteTaocan:function (group) {
            if(!group) return;
            let url = config.apiHost + "/api/cart/removeItem";
            var mpPro = null;
            group.productList.forEach((item) => {

            })
            for(let item of group.productList){
                if(item.mainItemId == 'isMain'){
                    mpPro = item;
                }
            }
            if(mpPro == null) return;
            let params = {
                sessionId: Vue.session.getSessionId(),
                itemId: mpPro.itemId,
                itemType:mpPro.itemType
            }
            var dia=$.dialog({
                title:'',
                content:'<div class="text-center">确认删除套餐吗</div>',
                button:["确认","取消"]
            });
        
            dia.on("dialog:action",(e) => {
                if(e.index == 0){
                    Vue.api.get(url, params, (res)=>{
                        this.getCartList();
                    });
                }
            });
        },
    },
    computed:{
        allSelectedNoStock:{
            get:function(){
                "use strict";
                var ids=[];
                for(let k in this.noStockList){
                    if(this.noStockList[k]) ids.push(k.toString())
                }
                return ids;
            }
        },
        allChecked:{
            get:function(){
                return this.checkedCount==this.totalCount;
            },
            set:function(value){
                for(let m of this.cartInfo.merchantList||[]){
                    for(let g of m.productGroups||[]){
                        if(g.groupId) g.checked=value;
                        for(let p of g.productList||[]){
                            p.checked=value;
                        }
                    }
                }
                return value;
            }
        },
        checkedCount:{
            get:function(){
                var i=0;
                for(let m of this.cartInfo.merchantList||[]){
                    for(let g of m.productGroups||[]){
                        for(let p of g.productList||[]){
                            if(p.checked) i++
                        }
                    }
                }
                return i;
            }
        },
        
        totalCount:{
            get:function(){
                var count=0;
                for(let m of this.cartInfo.merchantList||[]){
                    for(let g of m.productGroups||[]){
                        for(let p of g.productList||[]){
                            if(g.groupId && p.mainItemId != 'isMain' || g.disabled == 1){
                                break;
                            }
                            if(!this.editStatus && p.stockNum>0 && p.disabled==0){
                                count++;
                            }
                            if(this.editStatus){
                                count++;
                            }
                        }
                        //count+=(g.productList||[]).length;
                    }
                }
                return count;
            }
        },
        selectAll:{
            get:function(){
                var mpIds={
                    checked:[],//100212-1
                    unchecked:[],//100212-0
                    checked_type:[],//100212-1-3-201000120000
                    unchecked_type:[],//100212-0-3-201000120000
                    checked__type:[],//100212-3-201000120000
                    unchecked__type:[],//100212-3-201000120000
                    checked_skus:[],
                    unchecked_skus:[],
                };
                for(let m of this.cartInfo.merchantList||[]){
                    for(let g of m.productGroups||[]){
                        for(let p of g.productList||[]){
                            //非编辑状态 需要过滤掉非销售区域的

                            if(g.groupId && p.mainItemId != 'isMain' || g.disabled == 1){
                                break;
                            }
                            if(!this.editStatus && p.disabled==0 && p.stockNum>0){
                                if(p.checked) {
                                    mpIds.checked.push([p.mpId , '1'].join('-'));
                                    mpIds.checked_type.push([p.mpId,'1',p.itemType,p.objectId].join('-'));
                                    mpIds.checked__type.push([p.mpId,p.itemType,p.objectId].join('-'));


                                    mpIds.checked_skus.push({
                                        "mpId":p.mpId,
                                        "num":p.num,
                                        "itemType":p.itemType,
                                        "objectId":p.objectId,
                                        "isMain":p.mainItemId == 'isMain'?1:0,
                                        "checked":1
                                    })
                                }else {
                                    mpIds.unchecked.push([p.mpId , '0'].join('-'));
                                    mpIds.unchecked_type.push([p.mpId,'0',p.itemType,p.objectId].join('-'));
                                    mpIds.unchecked__type.push([p.mpId,p.itemType,p.objectId].join('-'));

                                    mpIds.unchecked_skus.push({
                                        "mpId":p.mpId,
                                        "num":p.num,
                                        "itemType":p.itemType,
                                        "objectId":p.objectId,
                                        "isMain":p.mainItemId == 'isMain'?1:0,
                                        "checked":0
                                    })
                                }
                            }

                            if(this.editStatus){
                                if(p.checked) {
                                    mpIds.checked.push([p.mpId , '1'].join('-'));
                                    mpIds.checked_type.push([p.mpId,'1',p.itemType,p.objectId].join('-'));
                                    mpIds.checked__type.push([p.mpId,p.itemType,p.objectId].join('-'));


                                    mpIds.checked_skus.push({
                                        "mpId":p.mpId,
                                        "num":p.num,
                                        "itemType":p.itemType,
                                        "objectId":p.objectId,
                                        "isMain":p.mainItemId == 'isMain'?1:0,
                                        "checked":1
                                    });
                                }else {
                                    mpIds.unchecked.push([p.mpId , '0'].join('-'));
                                    mpIds.unchecked_type.push([p.mpId,'0',p.itemType,p.objectId].join('-'));
                                    mpIds.unchecked__type.push([p.mpId,p.itemType,p.objectId].join('-'));

                                    mpIds.unchecked_skus.push({
                                        "mpId":p.mpId,
                                        "num":p.num,
                                        "itemType":p.itemType,
                                        "objectId":p.objectId,
                                        "isMain":p.mainItemId == 'isMain'?1:0,
                                        "checked":0
                                    });
                                }
                            }

                        }
                    }
                }
                return mpIds;
            }
        },
        noGoods:{
            get:function(){
                //初始化的状态,不需要判断有没有商品
                if(!this.isLoaded) return false;
                return (!this.cartInfo.merchantList||this.cartInfo.merchantList instanceof Array&&this.cartInfo.merchantList.length==0)
                    &&this.failureProducts.length==0;
            }
        },

        fixBody: {
            get:function(){
                return this.showGifts||this.showSizePop;
            }
        },
        //商品已售完
        itemSoldOut: {
            get:function () {
                return !this.itemInfo || !this.itemInfo.stockNum;
            }
        }
    },
    watch: {
        editStatus:function(val,old){
            "use strict";
            if(val){
                //编辑状态
                for(let m of this.cartInfo.merchantList||[]){
                    for(let g of m.productGroups||[]){
                        for(let p of g.productList||[]){
                            if(p.disabled == 1){
                                m.checked = false;
                            }
                        }
                    }
                }
            }
            //完成编辑状态时刷一下数据
            if(old){
                this.getCartList();
            }
        }
    }
});
