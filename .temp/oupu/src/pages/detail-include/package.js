import Vue from "vue";
import config from "../../../env/config.js";
import UiHeader from "../../components/ui-header.vue";
import UiNumberInput from "../../components/ui-number-input.vue";
import UiSerialProduct from "../../components/ui-serial-product.vue";




let urlParams = Vue.utils.paramsFormat(window.location.href);

new Vue({
    el: 'body',
    components: {
        UiHeader,UiNumberInput,UiSerialProduct
    },
    data: {
        currentTab:0,
        step:1,
        mpId:urlParams.mpId||'',
        itemId:urlParams.itemId||'',
        showSizePop:false,//系列属性弹窗
        promotionInfo:[],//所有的套餐
        choosedPackage:null,//选择的套餐
        choosedProArray:[],//选中的组，暂存
        choosedProArrayIndex:'',//选中的组的index索引
        choosedProMpId:'',//选中的商品Id
        choosedRule:{},//选中的组内规则
        itemPreviewImage:'',//系列属性预览图
        mainPro:{ 
            choosedMpId:'',
            num:1,
            serialProducts:[]
        },//主品
        servicePro:[],//服务商品 
        noCheckDefault:true,
        itemInfoForserial:null,//为系列属性组件使用，暂存
        serialAttributes:[],//为系列属性组件使用，暂存
        serialProducts:null,//为系列属性组件使用，暂存
        itemAmount: 1,//系列属性组件用,选择的数量
        mainChooseFlag: '',//标识是否选择的是主品
        recoverObj:null,//从购物车拿到的选中的商品
        localObj:{
            promotionId:'',//选中套餐的活动Id
            mpList:[],//所有选中的商品
        },//本地存储,和 api/cart/getCartItem，接口返回的数据结构保持一致
        // width:0
    }, 
    ready: function () { 
        // this.width = window.screen.width;
        // 有itemId表示是修改套餐
        if(!this.itemId){
            this.getAllInfo();
        } else{
            this.recoverPackage();
        }
    },
    watch:{
        choosedPackage:{
            handler:function () {
                try {
                    this.localObj.promotionId = this.choosedPackage.promotionId;
                    this.localObj.mpList = [];
                    this.choosedPackage.promotionRuleList.forEach((item) => {
                        item.choosedPro.forEach((itemTwo) => {
                            this.localObj.mpList.push(itemTwo);
                        })
                        var tempArry = [],  allNum = 0,  allAmout = 0, allKind = 0;
                        item.mpList.forEach((res) => {
                            if(res.num > 0){
                                tempArry.push(res);
                                allNum += res.num;
                                allKind += 1;
                                allAmout = (allAmout *100 + res.num * res.promPrice *100)/100;
                            }
                        });  
                        //1.满金额，2.满数量，4.满种类
                        var flag = false;
                        if(item.conditionType == 1){
                            if(allAmout >= item.conditionValue){
                                flag = true;
                            }
                        } else{
                            if(allKind >= item.conditionValue){
                                flag = true;
                            }
                        }
                        if(flag){
                            Vue.set(item,"accord",true);
                        } else{
                            Vue.set(item,"accord",false);
                        }
                        // Vue.set(this.choosedPackage.promotionRuleList[this.choosedProArrayIndex],"choosedPro",tempArry);
                        // Vue.set(this.choosedPackage.promotionRuleList[this.choosedProArrayIndex],"allAmout",allAmout);
                    })
                } catch (error) {
                    // console.log(error)
                }
            },
            deep:true
        }
    }, 
    computed:{
        canGoPay:function () {
            if(!this.mainPro.choosedMpId || this.mainPro.num < 1){
                return false;
            }
            for(let item of this.choosedPackage.promotionRuleList){
                if(item.level !=0 && !item.accord){
                    return false;
                }
            }
            return true;
        },
        allAmout:function () {
            try {
                var amout = 0;
                this.choosedPackage.promotionRuleList.forEach((item) => {
                    amout = (amout * 100 + item.allAmout * 100)/100;
                })
                return (amout * 100 + this.mainPro.promPrice * this.mainPro.num * 100)/100
            } catch (error) {
                
            }
        }
    },
    methods: {
        
        switchTab:function (index) {
            if(!index){
                return;
            }
            this.currentTab = index;
            
        },
        stepTwoBack:function () {
            this.step = 1
        },
        //从购物车来修改套餐
        recoverPackage:function () {
            if(!this.itemId) return;
            var url = config.apiHost + '/api/cart/getCartItem';
            var params ={
                platformId:config.platformId,
                itemId:this.itemId
            }
            if(Vue.auth.loggedIn){
                params.ut = Vue.auth.getUserToken();
            } else{
                params.sessionId = Vue.session.getSessionId();
            }
            Vue.api.postForm(url, params, (res) => {
                this.recoverObj = res.data;
                this.getAllInfo();
            })
        },
        // 获取每个商品的促销限制
        getProLimit:function (promIds,mpIds) {
            var url = config.apiHost + '/api/promotion/limitInfo';
            var params = {
                promotionIds:promIds.join(),
                mpIds:mpIds.join(),
                isCheckRealStock:true
            };
            if(Vue.auth.loggedIn()){
                params.ut = Vue.auth.getUserToken();
            }
            Vue.api.get(url, params, (res) => {
                this.promotionInfo.forEach((itemOne,index) => {
                    itemOne.promotionRuleList.forEach((itemTwo) => {
                        let mainProFlag = false;
                        // if(itemTwo.level == 0) mainProFlag = true;
                        itemTwo.mpList.forEach((itemThree) => {
                            res.data.forEach((itemFour) => {
                                if(itemOne.promotionId == itemFour.promotionId && itemThree.mpId == itemFour.mpId) {
                                    itemThree.individualCanBuyCount = itemFour.individualCanBuyCount;
                                    itemThree.canSaleNum = itemFour.canSaleNum;
                                    // if(mainProFlag){
                                    //     this.mainPro = itemThree;
                                    //     this.mainPro.num = 1;
                                    // }
                                };
                            });
                            //如果商品（组内商品，不包含子品），可购数量为0，或者不可用，跳过这个商品，不检测用户对本商品的操作（删除失效商品）
                            if(itemThree.individualCanBuyCount == 0 || itemThree.disabled == 1){
                                return;
                            }
                            //恢复套餐系列操作，先挑出用户选中的套餐
                            if(this.recoverObj && itemOne.promotionId == this.recoverObj.promotionId){
                                this.currentTab = index;
                                if(itemTwo.level != 0) itemTwo.accord = true;
                                for(let v of this.recoverObj.mpList){
                                    //组内商品本身就是子品
                                    if(v.mpId == itemThree.mpId){
                                        itemThree.choosedMpId = v.mpId;
                                        itemThree.checked = true;
                                        itemThree.noCheckDefault = v.noCheckDefault;
                                        if(!this.itemId){
                                            itemThree.picUrl = v.picUrl;
                                        }
                                        //如果超出可购买数，则将数量设定为当前最大可购买数(将超出限量的商品数量改为可购买的最大数量)
                                        itemThree.num = itemThree.individualCanBuyCount > v.num?v.num:itemThree.individualCanBuyCount;
                                        itemThree.servicePro = (v.additionalProductList&&v.additionalProductList.length>0)?v.additionalProductList[0]:null;//服务商品
                                        //检测本地存储的服务商品，加车报错时用
                                        if(!itemThree.servicePro){
                                            itemThree.servicePro = v.servicePro?v.servicePro:null
                                        }
                                        itemTwo.choosedPro.push(itemThree);
                                        itemTwo.allAmout = (itemTwo.allAmout*100 + itemThree.num * itemThree.availablePrice*100)/100;
                                        return;
                                    } else if(itemThree.serialProducts && itemThree.serialProducts.length > 0){
                                        //组内商品是虚品，找有没有相应的子品
                                        for(let m of itemThree.serialProducts){
                                            if(m.product.mpId == v.mpId){
                                                itemThree.choosedMpId = m.product.mpId;
                                                itemThree.checked = true;
                                                itemThree.noCheckDefault = v.noCheckDefault;
                                                if(!this.itemId){
                                                    itemThree.picUrl = v.picUrl;
                                                }
                                                //如果超出可购买数，则将数量设定为当前最大可购买数(将超出限量的商品数量改为可购买的最大数量)
                                                itemThree.num = itemThree.individualCanBuyCount > v.num?v.num:itemThree.individualCanBuyCount;
                                                itemThree.servicePro =(v.additionalProductList&&v.additionalProductList.length>0)?v.additionalProductList[0]:null;//服务商品
                                                //检测本地存储的服务商品，加车报错时用
                                                if(!itemThree.servicePro){
                                                    itemThree.servicePro = v.servicePro?v.servicePro:null
                                                }
                                                itemThree.availablePrice = m.product.promPrice;
                                                itemThree.originalPrice = m.product.price;
                                                itemTwo.choosedPro.push(itemThree);
                                                itemTwo.allAmout = (itemTwo.allAmout*100 + itemThree.num * itemThree.availablePrice*100)/100;
                                                //还原系列属性值
                                                itemThree.attributes.forEach((s) => {
                                                    s.values.forEach((ss) => {
                                                        if(m.key.includes(ss.id)){
                                                            itemThree.attres.push({
                                                                "attrName":s.name,
                                                                "attrVal":ss.value
                                                            })
                                                        }
                                                    })
                                                })
                                            }
                                        }
                                    }

                                }
                            }
                        })
                    })
                });
                this.choosedPackage = this.promotionInfo[this.currentTab];
                this.choosedPackage.promotionRuleList.forEach((item) => {
                    if(item.level == 0){
                        this.mainPro = item.mpList[0];
                        if(this.mainPro.num == 0){
                            this.mainPro.num == 1;
                        }
                    }
                })
            })
        },
        // 获取套餐的基本信息，之后需要去调促销限制接口，查每个商品的限制购买数量，BT。
        getAllInfo:function (params) {
            var params = {
                mpIds: this.mpId,
                companyId: Vue.mallSettings.getCompanyId(),
                platformId:config.platformId,
                proTypes:"15",
            };
            if(Vue.area.getArea().aC){
                params.areaCheckFlag = 1;
                params.areaCode = Vue.area.getArea().aC;
            } 
            Vue.api.get("/api/promotion/promotionInfo", params, (result) => {
                if(result.data.promotionInfo instanceof Array && result.data.promotionInfo.length>0){
                    var promIds = [], mpIds = [];
                    result.data.promotionInfo[0].promotions.forEach((itemOne) => {
                        promIds.push(itemOne.promotionId);
                        itemOne.promotionRuleList.forEach((itemTwo) => {
                            itemTwo.choosedPro = [];
                            itemTwo.accord = false;//是否满足组内条件
                            itemTwo.allAmout = 0;//组内商品总价
                            itemTwo.mpList.forEach((itemThree) => {
                                mpIds.push(itemThree.mpId);
                                itemThree.checked = false;
                                itemThree.isCart = 1; 
                                itemThree.num = 0;
                                itemThree.choosedMpId = '';
                                itemThree.attres = [];
                                itemThree.noCheckDefault = true; 
                                itemThree.servicePro = null;
                                itemThree.name = itemThree.mpName;
                                itemThree.availablePrice = itemThree.promPrice;
                                itemThree.originalPrice = itemThree.price;
                                itemThree.servicePro = null;
                                itemThree.serialProducts = itemThree.childProductList;
                                if(!itemThree.attributes){
                                    itemThree.choosedMpId = itemThree.mpId; 
                                }
                                
                            })
                            
                        })
                    });
                    this.promotionInfo = result.data.promotionInfo[0].promotions;
                    this.getProLimit(promIds,mpIds);
                }
            });
        },
        setChoosedPackage:function (index) {
            this.choosedPackage = this.promotionInfo[index];
            this.choosedPackage.promotionRuleList.forEach((item) => {
                if(item.level == 0){
                    this.mainPro = item.mpList[0];
                    if(this.mainPro.num == 0){
                        this.mainPro.num == 1;
                    }
                }
            })
        },
        setChoosedProArray:function (item,index) {
            this.choosedProArray = item.mpList;
            this.choosedProArrayIndex = index;
            this.choosedRule = {
                "conditionType":item.conditionType,
                "conditionValue":item.conditionValue
            }
        },
        changeNum:function (item,flag) {
            if(typeof item == "object"){
                if(!item.choosedMpId){
                    Vue.utils.showTips("请先选择商品规格！")
                    return;
                }
                if(flag){
                    if(item.num >= item.individualCanBuyCount || item.num >= item.canSaleNum){
                        var msg = item.individualCanBuyCount>item.canSaleNum?'该商品最多购买'+ item.individualCanBuyCount +'个':'该商品已达到活动购买上限';
                        Vue.utils.showTips(msg);
                        return;
                    }
                    item.num += 1;
                } else if(item.num > 0){
                    item.num -= 1;
                }
                if(item.num > 0){
                    item.checked = true;
                } else{
                    item.checked = false;
                }
            } else if(typeof item == "number"){
                if (this.noCheckDefault) {
                    if ($(".ui-poptips-cnt").length == 0)
                        Vue.utils.showTips("请先选择商品规格！")
                    return;
                }
                if(flag){
                    if(this.itemAmount >= this.itemInfoForserial.individualCanBuyCount || this.itemAmount >= this.itemInfoForserial.canSaleNum){
                        var msg = this.itemInfoForserial.individualCanBuyCount>this.itemInfoForserial.canSaleNum?'该商品最多购买'+ this.itemInfoForserial.individualCanBuyCount +'个':'该商品已达到活动购买上限';
                        Vue.utils.showTips(msg);
                        return; 
                    }
                    this.itemAmount = item + 1;
                } else if(item > 0){
                    this.itemAmount = item - 1;
                }
            }
            
        },
        comfirmChoose:function () {
            var tempArry = [],  allNum = 0,  allAmout = 0, allKind = 0;
            this.choosedProArray.forEach((res) => {
                if(res.num > 0){
                    tempArry.push(res);
                    allNum += res.num;
                    allKind += 1;
                    allAmout = (allAmout *100 + res.num * res.promPrice *100)/100;
                }
            });  
            //1.满金额，2.满数量，4.满种类
            var flag = false;
            if(this.choosedRule.conditionType == 1){
                if(allAmout >= this.choosedRule.conditionValue){
                    flag = true;
                }
            } else{
                if(allKind >= this.choosedRule.conditionValue){
                    flag = true;
                }
            }
            if(flag){
                Vue.set(this.choosedPackage.promotionRuleList[this.choosedProArrayIndex],"accord",true);
                this.step = 1;
            } else{
                var dia=$.dialog({
                    title:'',
                    content:'暂未满足组内促销规则，继续保存嘛？',
                    button:["取消","确认"]
                });
                dia.on("dialog:action",(e) =>{
                    if(e.index == 1){
                        
                        Vue.set(this.choosedPackage.promotionRuleList[this.choosedProArrayIndex],"accord",false);
                        this.step = 1;
                    } 
                });
            } 
            Vue.set(this.choosedPackage.promotionRuleList[this.choosedProArrayIndex],"choosedPro",tempArry);
            Vue.set(this.choosedPackage.promotionRuleList[this.choosedProArrayIndex],"allAmout",allAmout);
        },
        showSerial:function (item,flag) {
            // if(item.choosedMpId){ 
            //     item.mpId = item.choosedMpId;
            // }
            this.mainChooseFlag = flag;
            this.choosedProMpId = item.mpId;
            this.itemInfoForserial = item;
            this.itemAmount = item.num;
            this.itemPreviewImage = item.picUrl;
            this.noCheckDefault = item.noCheckDefault;
            if(item.servicePro){
                this.servicePro.push(item.servicePro);
            }
            this.showSizePop = true;
        },
        // 关闭系列属性后的操作,更新相应的商品属性，初始化组件以及暂存变量的状态
        updateProduct:function (params) {
            if(this.noCheckDefault){
                return;
            }
            if(this.mainChooseFlag == 'main'){
                Vue.set(this.mainPro,'attres',this.itemInfoForserial.attres);
                // this.mainPro.attres = this.itemInfoForserial.attres;
                this.mainPro.choosedMpId = this.itemInfoForserial.mpId;
                this.mainPro.mpId = this.itemInfoForserial.mpId;
                this.mainPro.mpName = this.itemInfoForserial.name || this.itemInfoForserial.mpName;
                this.mainPro.num = this.itemAmount;
                if(this.mainPro.num > 0 && this.mainPro.choosedMpId){
                    this.mainPro.checked = true;
                }
                this.mainPro.price = this.itemInfoForserial.price;
                this.mainPro.promPrice = this.itemInfoForserial.promPrice;
                this.mainPro.picUrl = this.itemPreviewImage;
                this.mainPro.noCheckDefault = this.noCheckDefault;
                //如果有服务商品，目前单选
                if(this.servicePro){
                    this.mainPro.servicePro = null;
                    for(let serItem of this.servicePro){
                        if(serItem.selected){
                            this.mainPro.servicePro = serItem;
                            break;
                        }
                    }
                } else{
                    this.mainPro.servicePro = null;
                }
                for(let v of this.choosedPackage.promotionRuleList){
                    if(v.level == 0){
                        v.choosedPro = [this.mainPro];
                    }
                }
            } else{
                for(let res of this.choosedProArray){
                    if (res.mpId == this.choosedProMpId){
                        Vue.set(res,'attres',this.itemInfoForserial.attres);
                        // this.mainPro.attres = this.itemInfoForserial.attres;
                        res.choosedMpId = this.itemInfoForserial.mpId;
                        res.mpId = this.itemInfoForserial.mpId;
                        res.mpName = this.itemInfoForserial.name || this.itemInfoForserial.mpName;
                        res.num = this.itemAmount;
                        if(res.num > 0 && res.choosedMpId){
                            res.checked = true;
                        }
                        res.price = this.itemInfoForserial.price;
                        res.promPrice = this.itemInfoForserial.promPrice; 
                        res.picUrl = this.itemPreviewImage;
                        res.noCheckDefault = this.noCheckDefault;
                        //如果有服务商品，目前单选
                        if(this.servicePro){
                            res.servicePro = null;
                            for(let serItem of this.servicePro){
                                if(serItem.selected){
                                    res.servicePro = serItem;
                                    break;
                                }
                            } 
                        } else{
                            res.servicePro = null;
                        }
                        break;
                    }
                }
            }
            this.showSizePop = false;
            this.noCheckDefault = true;
            this.choosedProMpId = '';
            this.servicePro = [];
            this.$refs.ser.clearSerial();
        },
        //判断是加车还是修改
        chooseAdd:function () {
            if(!this.itemId){
                this.addToCart(false)
            } else {
                this.editGroup();
            }
        },
        //加车
        addToCart:function (flag) {
            if(!this.canGoPay) {
                return;
            }
            var tempSkus = [];
            tempSkus[0] = {
                "mpId":this.mainPro.choosedMpId,
                "num":this.mainPro.num,
                "itemType":1025,
                "objectId":this.choosedPackage.promotionId,
                "isMain":1
            }
            if(this.mainPro.servicePro){
                tempSkus.additionalItems = {
                    "mpId":this.mainPro.servicePro.mpId,
                    "num":this.mainPro.servicePro.num,
                    "itemType":0,
                }
            }
            this.choosedPackage.promotionRuleList.forEach((packageList) => {
                if(packageList.level != 0){
                    packageList.choosedPro.forEach((item) => {
                        var obj = {
                            "mpId":item.choosedMpId,
                            "num":item.num,
                            "itemType":1025,
                            "objectId":this.choosedPackage.promotionId,
                            "isMain":0
                        };
                        if(item.servicePro){
                            obj.additionalItems = {
                                "mpId":item.servicePro.mpId,
                                "num":item.servicePro.num,
                                "itemType":0,
                            }
                        }
                        tempSkus.push(obj);
                    })
                }
            })
            var params = {
                sessionId: Vue.session.getSessionId(),
                skus:JSON.stringify(tempSkus),
                isReplace:flag?1:0
            };
            if(Vue.auth.loggedIn()){
                params.ut = Vue.auth.getUserToken()
            }
            Vue.api.postForm(config.apiHost + "/api/cart/addItem", params, (res) => {
                $.tips({
                    content:"添加成功",
                    stayTime:2000,
                    type:"success"
                });
            },(res) => {
                if(res.code == "001001018"){
                    var dia=$.dialog({
                        title:'',
                        content:'购物车中已存在该套餐，确认要替换它吗',
                        button:["确认","取消"]
                    });
                
                    dia.on("dialog:action",(e) => {
                        if(e.index == 0){
                            this.addToCart(true);
                        }
                    });
                } else{
                    Vue.utils.showTips(res.message);
                    this.recoverObj = this.localObj;
                    this.getAllInfo();
                }
            });
        },
        //修改套餐
        editGroup:function (params) {
            var tempSkus = [];
            tempSkus[0] = {
                "mpId":this.mainPro.choosedMpId,
                "num":this.mainPro.num,
                "itemType":1025,
                "objectId":this.choosedPackage.promotionId,
                "isMain":1
            }
            if(this.mainPro.servicePro){
                tempSkus.additionalItems = {
                    "mpId":this.mainPro.servicePro.mpId,
                    "num":this.mainPro.servicePro.num,
                    "itemType":0,
                }
            }
            this.choosedPackage.promotionRuleList.forEach((packageList) => {
                if(packageList.level != 0){
                    packageList.choosedPro.forEach((item) => {
                        var obj = {
                            "mpId":item.choosedMpId,
                            "num":item.num,
                            "itemType":1025,
                            "objectId":this.choosedPackage.promotionId,
                            "isMain":0
                        };
                        if(item.servicePro){
                            obj.additionalItems = {
                                "mpId":item.servicePro.mpId,
                                "num":item.servicePro.num,
                                "itemType":0,
                            }
                        }
                        tempSkus.push(obj);
                    })
                }
            })
            var params = {
                sessionId: Vue.session.getSessionId(),
                skus:JSON.stringify(tempSkus),
                isReplace:1,
                groupId:urlParams.groupId,

            };
            if(Vue.auth.loggedIn()){
                params.ut = Vue.auth.getUserToken()
            }
            var url = config.apiHost + '/api/cart/editGroup';
            Vue.api.postForm(url,params,(res) => {
                Vue.utils.showTips('修改成功');
            })
        },
        pay:function () {
            if(!this.canGoPay){
                return;
            }
            var tempSkus = [];
            tempSkus[0] = {
                "mpId":this.mainPro.choosedMpId,
                "num":this.mainPro.num,
                "itemType":1025,
                "objectId":this.choosedPackage.promotionId,
                "isMain":1
            }
            if(this.mainPro.servicePro){
                tempSkus.additionalItems = {
                    "mpId":this.mainPro.servicePro.mpId,
                    "num":this.mainPro.servicePro.num,
                    "itemType":0,
                }
            }
            this.choosedPackage.promotionRuleList.forEach((packageList) => {
                if(packageList.level != 0){
                    packageList.choosedPro.forEach((item) => {
                        var obj = {
                            "mpId":item.choosedMpId,
                            "num":item.num,
                            "itemType":1025,
                            "objectId":this.choosedPackage.promotionId,
                            "isMain":0
                        };
                        if(item.servicePro){
                            obj.additionalItems = {
                                "mpId":item.servicePro.mpId,
                                "num":item.servicePro.num,
                                "itemType":0,
                            }
                        }
                        tempSkus.push(obj);
                    })
                }
            })
            var params = {
                ut: Vue.auth.getUserToken(),
                businessType:'7',
                // merchantId: obj.merchantId,
                platformId: config.platformId,
                skus:JSON.stringify(tempSkus)
            };
            Vue.utils.quickPurchase(params,(res) => {
                // window.location.href = "/pay/pay.html?q=1";
                Vue.utils.showTips(res.message);
                this.recoverObj = this.localObj;
                this.getAllInfo();
            },false);
        },
        
    }
});