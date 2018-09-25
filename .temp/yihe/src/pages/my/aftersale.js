import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiActionsheetPop from "../../components/ui-actionsheet-pop.vue";
import UiFileUpload from "../../components/ui-file-upload.vue";
import config from "../../../env/config.js";

//退货类型
const SALETYPE_RETURN = 2;
//换货类型
const SALETYPE_REPLACEMENT = 4;

var urlParams = Vue.utils.paramsFormat(window.location.href);

var vm = new Vue({
    el: 'body',
    components: { UiHeader, UiActionsheetPop, UiFileUpload },
    data: {
        ut: Vue.auth.getUserToken(),
        showReturnCause: false, //显示退货原因
        orderCode: urlParams.orderCode,
        afterSaleCauseList: [], //退货原因列表
        selectCauseObj: { key: "", value: "请选择具体原因" }, //选中的原因
        productList: [], //订单对应的商品
        imgarr: [], //图片数组
        orderAfterSalesId: urlParams.orderAfterSalesId, //退货id
        afterSaleTypes: [],
        //当前选择的售后类型
        currentSaleType: 0,
        //换货的商品
        replacementProducts: [],
        afterSaleDetails: {},
        returnRemark: "", //退换货原因
        showSerialsPop: false,
        itemInfo: {},
        itemPreviewImage: "",
        //商品系列属性
        serialAttributes: [],
        //系列商品
        serialProducts: [],
        //记录选中的商品换货数量
        replacementNumMap: {},
        isLoading:false
    },
    ready: function() {
        //编辑已有的退换货信息
        if (this.orderAfterSalesId) {
            this.getAfterSaleDetails(this.orderAfterSalesId);
        } else {
            this.initAfterSaleTypes();
        }
    },
     computed: {
        //是否允许上传图片
        enableUploadImage: function () {
            return this.imgarr && this.imgarr.length < 3;
        },

        //是否是换货
        IsReplacement: function () {
            return this.currentSaleType == SALETYPE_REPLACEMENT;
        }
    },
    methods: {
        //切换退换货类型
        switchReturnType: function (type) {
            if (type != this.currentSaleType) {
                this.currentSaleType = type;
                this.productList = [];
                this.initReturnProduct();
                //换货
                if (type == SALETYPE_REPLACEMENT) {
                    this.replacementProducts = [];
                    this.selectCauseObj = { key: "", value: "请选择具体原因" };
                }
            }
        },

        //获得售后类型
        initAfterSaleTypes: function () {
            var params = { ut: this.ut, companyId: Vue.mallSettings.getCompanyId(), orderCode: this.orderCode };
            Vue.api.postForm(config.apiHost + "/api/my/orderAfterSale/afterSaleType", params, (res) => {
                this.afterSaleTypes = res.data || [];

                if (this.afterSaleTypes.length > 0) {
                    this.currentSaleType = this.afterSaleTypes[0].operateType;
                    this.initReturnProduct();
                }else {
                    $.tips({
                        content: '您已经申请过售后，请勿重复申请',
                        stayTime: 2000,
                        type: "success"
                    });
                    setTimeout(function () {
                        history.back();
                    }, 2000)
                }
            });
        },
        
        //初始化退货订单信息
        initReturnProduct: function() {
            var params = { ut: this.ut, companyId: Vue.mallSettings.getCompanyId(), orderCode: this.orderCode };
            Vue.api.get(config.apiHost + "/api/my/orderAfterSale/initReturnProduct", params, (res) => {
                this.afterSaleDetails = res.data;
                //初始化退换货信息
                if (this.afterSaleDetails.afterSalesProductVOs) {
                    for (var item of this.afterSaleDetails.afterSalesProductVOs) {
                        item.returnProductItemNum = item.mayReturnProductItemNum ||  0;
                        item.checked = false;
                        this.productList.push(item);
                    }
                }
            });
        },

        //获取退换货详情
        getAfterSaleDetails: function(orderAfterSalesId) {
            var params = { ut: this.ut, companyId: Vue.mallSettings.getCompanyId(), orderAfterSalesId: orderAfterSalesId, afterSaleType: config.afterSaleType };
            Vue.api.get(config.apiHost + "/api/my/orderAfterSale/afterSaleDetails", params, (res) => {
                this.afterSaleDetails = res.data;
                if (this.afterSaleDetails) {
                    this.productList = this.afterSaleDetails.merchantProductVOs || [];
                    this.imgarr = this.afterSaleDetails.picUrlList || [];
                    this.selectCauseObj = {key: this.afterSaleDetails.returnReasonId, value: this.afterSaleDetails.returnReason};
                    this.returnRemark = this.afterSaleDetails.returnRemark || "";
                    this.currentSaleType = this.afterSaleDetails.type;
                }

            });
        },

        //增加退货数量
        plus: function(product) {
            //修改退货信息时不允许编辑退换货数量
            if (this.orderAfterSalesId) {
                return;
            }

            if (product.returnProductItemNum < product.mayReturnProductItemNum) {
                product.returnProductItemNum += 1;
            }

            //更新换货商品数量
            if (this.IsReplacement) {
                this.replacementNumMap[product.id] = product.returnProductItemNum;
            }
        },

        //减少退货数量
        minus: function(product) {
             //修改退货信息时不允许编辑退换货数量
            if (this.orderAfterSalesId) {
                return;
            }
            
            if (product.returnProductItemNum > 0) {
                product.returnProductItemNum -= 1;
            }

            //更新换货商品数量
            if (this.IsReplacement) {
                this.replacementNumMap[product.id] = product.returnProductItemNum;
            }
        },

        //验证退换货的数量
        validReturnNum: function(product) {
            var num = parseInt(product.returnProductItemNum);
            if (num) {
                if (num > product.mayReturnProductItemNum) {
                    num = product.mayReturnProductItemNum;
                } else if (num < 0) {
                    num = 0;
                }
            }

            product.returnProductItemNum = num || 0;

        },

        //打开退货原因列表
        openCauseList: function() {
            this.getAfterSaleCauseList();
            this.showReturnCause = true;
        },

        //获取退货原因列表
        getAfterSaleCauseList: function() {
            var params = {
                ut: this.ut, companyId: Vue.mallSettings.getCompanyId(),
                afterSaleType: this.currentSaleType
            };
            // if(params.afterSaleType == 4) {
            //     params.afterSaleType = 1;
            // }
            Vue.api.get(config.apiHost + "/api/my/orderAfterSale/afterSaleCauseList", params, (res) => {
                this.afterSaleCauseList = res.data.orderAfterSalesCauseVOs;
            });
        },


        //选择/取消选择\退货商品
        checkReturnProduct: function (product) {
            product.checked = !product.checked;
            //更新选中的换货商品数量
            if (product.checked && this.IsReplacement) {
                Vue.set(this.replacementNumMap, product.id, product.returnProductItemNum);
            }

            //换货
            if (this.IsReplacement) {
                if (product.checked) {
                //加载退货商品
                    this.getReplacementProduct(product);
                }else {
                    //移除退货商品
                    this.removeReplacementProduct(product);
                }
            }
        },

        //获得可换货商品列表
        getReplacementProduct: function (product) {
            var params = { ut: this.ut, companyId: Vue.mallSettings.getCompanyId(), orderCode: this.orderCode, 
                returnMpId:  product.mpId, soItemId: product.id, platformId: config.platformId};
            Vue.api.postForm(config.apiHost + "/api/my/orderAfterSale/afterSaleProduct", params, (res) => {
                if (res.data) {
                    this.replacementProducts.push(res.data);
                }
            });
        },

        //移除选择的换货商品
        removeReplacementProduct: function (product) {
            var rp;
            for(var i=0; i<this.replacementProducts.length; i++) {
                rp = this.replacementProducts[i];
                if (rp.soItemId == product.id ) {
                    this.replacementProducts.splice(i, 1);
                    return;
                }
            }
        },

        //打开系列属性popup
        openSerialsPop: function (product) {
            this.itemInfo = product;
            this.itemPreviewImage = product.productUrl;
            this.serialAttributes = product.map.attributes;
            this.serialProducts = product.map.serialProducts;
            this.showSerialsPop = true;
        },

        //选择某个系列属性值
        selectAttributeValue: function (serialAttribute, value) {
            serialAttribute.values.forEach(function (v) {
                v.checked = false;
            });

            value.checked = true;

           var newItemInfo = this.getSerialItemInfo(this.serialAttributes, this.serialProducts);
           //选择了不同的属性
           if (newItemInfo && newItemInfo.mpId != this.itemInfo.mpId) {
                this.itemInfo = newItemInfo;
                this.updateItemPreviewImage();
           }

        },

        //更新预览图
        updateItemPreviewImage: function () {
            if (this.itemInfo && this.itemInfo.pics && this.itemInfo.pics.length > 0) {
                this.itemPreviewImage = this.itemInfo.pics[0].url;
            }
        },

         //更新已选择的商品信息
        getSelectedItemInfo: function (serialAttributes) {
            var arr = [];
            if (serialAttributes) {
                serialAttributes.forEach(function (sa) {
                    if (sa.values) {
                        sa.values.forEach(function (v) {
                            if (v.checked) {
                                arr.push(v.value);
                            }
                        })
                    }
                });
            }

            return arr.join("，");
        },

        //获得所选的系列商品信息
        getSerialItemInfo: function (serialAttributes, serialProducts) {
            if (!serialAttributes || serialAttributes.length ==0 
                || !serialProducts || serialProducts.length == 0) {
                return null;
            }

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

        //退货
        doReturnProduct: function() {
            if (this.orderAfterSalesId) {
                this.updateReturnProduct();
            } else {
                if (this.IsReplacement) {
                    this.applyReplacementProduct();
                } else {
                    this.applyReturnProduct();
                }
            }
        },

        //修改退换货信息
        updateReturnProduct: function() {
            if (!this.selectCauseObj.key) {
                 $.dialog({
                    title: "",
                    content: "请选择具体原因",
                    button: ["关闭"]
                });

                 return;
            }

            var params = {
                ut: this.ut,
                companyId: Vue.mallSettings.getCompanyId(),
                returnCode: this.afterSaleDetails.returnCode,
                returnReasonId: this.selectCauseObj.key,
                returnReason: this.selectCauseObj.value,
                returnRemark: this.returnRemark,
                picUrlList: this.getPicList()
            };

            Vue.api.postForm(config.apiHost + "/api/my/orderAfterSale/updateReturnProduct", params, (res) => {
                var tip = $.tips({
                    content: '成功修改退换货信息',
                    stayTime: 2000,
                    type: "success"
                });

                // tip.on("tips:hide",function(){
                //     if(urlParams.re == 1) {
                //         location.href = '/my/aftersale-detail.html?orderAfterSalesId=' + this.orderAfterSalesId;
                //     }else {
                //         location.href = '/my/order-detail.html?orderCode=' + this.orderCode;
                //     }
                // });

                location.href = '/my/aftersale-detail.html?orderAfterSalesId=' + this.orderAfterSalesId;

            });
        },

        //第一次申请换货
        applyReplacementProduct: function () {
            var swapProductList = this.getSwapProductList();
            //console.log(swapProductList)
            if (!swapProductList) {
                $.dialog({
                    title: "",
                    content: "请选择要换的商品",
                    button: ["关闭"]
                });

                return;
            }

             if (!this.selectCauseObj.key) {
                 $.dialog({
                    title: "",
                    content: "请选择换货原因",
                    button: ["关闭"]
                });

                 return;
            }

            this.applyAfterSale(swapProductList);
        },

        //第一次申请退货
        applyReturnProduct: function () {
            var soItemList = this.getSoItemList();
            if (!soItemList) {
                $.dialog({
                    title: "",
                    content: "请选择要退的商品",
                    button: ["关闭"]
                });

                return;
            }

             if (!this.selectCauseObj.key) {
                 $.dialog({
                    title: "",
                    content: "请选择原因",
                    button: ["关闭"]
                });

                 return;
            }

            this.applyAfterSale(soItemList);
        },
        //获取退货的跟踪云数据
        getHeimdallParams: function(pordList) {
            let idArr = [];
            let numArr = [];
            let prod;
            for (let i = 0; i < pordList.length; i++) {
                prod = pordList[i];
                if(prod.checked && prod.returnProductItemNum){
                    idArr.push(prod.mpId);
                    numArr.push(prod.returnProductItemNum);
                }
            }
            //console.log(this.parentOrderCode == null);
            var heimdallParam = {
                ev: "9",
                oid: this.orderCode,
                pri: idArr.join(','),
                prm: numArr.join(',')
            }
            return heimdallParam;
        },
        //第一次申请退换货
        applyAfterSale: function(productList) {
           if(this.isLoading) return;
            var params = {
                ut: this.ut,
                companyId: Vue.mallSettings.getCompanyId(),
                orderCode: this.orderCode,
                returnReasonId: this.selectCauseObj.key,
                returnReason: this.selectCauseObj.value,
                returnRemark: this.returnRemark,
                picUrlList: this.getPicList(),
                returnSoItemList:this.getSoItemList(),
                swapProducts:"",
                type:this.currentSaleType
            };

            //换货
            if (this.IsReplacement) {
                params.swapProducts = productList;
               // params.returnSoItemList = productList;
                // params.type = SALETYPE_REPLACEMENT;
            } else {
                //退货
                //params.returnSoItemList = productList;
                // params.type = SALETYPE_RETURN;
            }
            this.isLoading = true;
            Vue.api.postForm(config.apiHost + "/api/my/orderAfterSale/applyReturnProduct", params, (res) => {
                // this.orderAfterSalesId = res.data ? res.data.orderAfterSalesId : null;
                //跟踪云埋点 退款
                var heimdallParams = this.getHeimdallParams(this.productList);
                try {
                    window.eventSupport.emit('heimdallTrack', heimdallParams);
                } catch (err) {
                    console.log(err);
                }
                var msg = this.IsReplacement?'成功申请换货':'成功申请退货';
                var tip = $.tips({
                    content: msg,
                    stayTime: 2000,
                    type: "success"
                });
                 tip.on("tips:hide",() => {
                    history.back();
                    this.isLoading = false;
                });
            },(res) => {
                Vue.utils.showTips(res.message);
                this.isLoading = false;
            });
        },

        //选择退换货原因
        selectCause: function(cause) {
            this.showReturnCause = false;
            this.selectCauseObj = cause;
        },

        //图片上传成功
        uploadSuccess: function(data) {
            if (data && data.filePath) {
                this.imgarr.push(data.filePath);
            }
        },

        //删除图片
        delImg: function(index) {
            var dialog = $.dialog({
                title: "",
                content: "确定删除该图片吗？",
                button: ["取消", "确认"]
            });
            dialog.on("dialog:action", (e) => {
                //点击确定按钮
                if (e.index == 1) {
                    this.imgarr.splice(index, 1);
                }
            });
        },

        //获得上传图片的url列表
        getPicList: function() {
            return this.imgarr ? this.imgarr.join(",")  : "";
        },

        //获得订单商品列表(soitemid|num)
        getSoItemList: function() {
            let arr = [];
            let prod;

            for (let i = 0; i < this.productList.length; i++) {
                prod = this.productList[i];

                if (prod.checked && prod.returnProductItemNum) {
                    arr.push(prod.id + "|" + prod.returnProductItemNum);
                }
            }

            return arr.join(",");
        },

        //获得换货商品信息(soitemid|mpid|num,)
        getSwapProductList: function () {
            let arr = [];
            let prod;

            for (let i = 0; i < this.productList.length; i++) {
                prod = this.productList[i];

                if (prod.checked && prod.returnProductItemNum) {
                    arr.push(prod.id + "|" + this.getSwapMpId(prod.id) + "|" + prod.returnProductItemNum);
                }
            }

            return arr.join(",");
        },

        //获得换货的mpid
        getSwapMpId: function (soItemId) {
            var rp;
            for(var i=0; i<this.replacementProducts.length; i++) {
                rp = this.replacementProducts[i];
                if (rp.soItemId == soItemId) {
                    //如果是系列属性，返回选择的mpId
                    if (rp.isSerial == 1) {
                       return this.getSerialItemInfo(rp.map.attributes, rp.map.serialProducts).mpId;
                    } else {
                        return rp.mpId;
                    }
                }
            }
        }

    }

});
