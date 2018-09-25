import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiOrderList from "../../components/ui-order-list.vue";
import UiDropDown from "../../components/ui-drop-down.vue";
import UiDrag from "../../components/ui-drag.vue";
import config from "../../../env/config.js";

//隐藏app头部
Vue.app.postMessage('hiddenHead',{'isHidden':'1'});

let urlParams = Vue.utils.paramsFormat(window.location.href);
// var noProFlag = true;
new Vue({
    el: 'body',
    components: { UiHeader},
    data: {
        ut:Vue.auth.getUserToken(),
        orderCode:urlParams.orderCode || '',
        orderInfo:{},
        productList:[],
        totalPrice:0,
        totalNum:0,
        noProFlag:true
    },

    //初始化
    ready: function() {
        this.getOrderDetail();
    },
    watch:  {
        productList:{
            handler:function (val,old) {
                if(val){
                    var price = 0,num = 0;
                    this.productList.forEach((itemOne) => {
                        try {
                            itemOne.servicrProduct.forEach((itemTwo) => {
                                price += (itemTwo.availablePrice || itemTwo.originalPrice) * itemTwo.pickNum;
                                num = num - 0 + (itemTwo.pickNum - 0);
                            })
                        } catch (error) {
                            // console.log(error)
                        }
                    });
                    this.totalPrice = price;
                    this.totalNum = num;
                }
            },
            deep:true
        }
    },
    methods: {
        getOrderDetail:function () {
            var url = config.apiHost + "/api/my/order/detail";
            var params = {
                ut: this.ut,
                companyId: Vue.mallSettings.getCompanyId(),
                orderCode: this.orderCode,
                v: '2.2'
            }
            Vue.api.get(url, params, (res) => {
                if(res.data){
                    this.orderInfo = res.data;
                    var tempArry = [];
                    var mpIds = [];
                    res.data.childOrderList.forEach((itemOne) => {
                        itemOne.orderProductList.forEach((itemTwo) => {
                            tempArry.push(itemTwo);
                            mpIds.push(itemTwo.mpId);
                        })
                    });
                    // this.productList = tempArry;
                    Vue.getPriceAndStock(mpIds.join(),tempArry,null,(res) => {
                        this.productList = res;
                        this.getService(mpIds);
                    });
                }
            }) 
        },
        getService:function (mpIds) {
            var url = config.apiHost + '/back-product-web/consultAppAction/getMerchantProductList.do';
            Vue.api.postForm(url, JSON.stringify({
                mpIds:mpIds,
                areaCode:Vue.area.getArea().aC
            }), (res) => {
            // Vue.api.postForm(url, JSON.stringify(mpIds), (res) => {
                if(res.data){
                    if($.isEmptyObject(res.data)){
                        Vue.utils.showTips('该订单没有商品可提供安装服务');
                        return;
                    }
                    
                    for(var itemOne in res.data){
                        this.productList.forEach((itemTwo,idx) => {
                            if(itemTwo.mpId == itemOne){
                                var mpIdArry = [];
                                res.data[itemOne].forEach((itemThree) => {
                                    itemThree.mpId = itemThree.id;
                                    itemThree.pickNum = 0;
                                    mpIdArry.push(itemThree.id);
                                    this.noProFlag = false;
                                });

                                Vue.getPriceAndStock(mpIdArry.join(),res.data[itemOne],null,(result) => {
                                    // var temp = Object.assign({},result);
                                    /*测试表明同一个接口调用多次返回的result虽然是不同的对象，但是result中的每一项指向了同一个引用
                                    这里需要深度拷贝，而Object.assign是部分的深拷贝（嵌套层数不深）所以无效，这里采用转换成字符串后再转成对象实现深度拷贝
                                    */
                                    Vue.set(itemTwo,'servicrProduct',JSON.parse(JSON.stringify(result)));
                                });
                            }
                        })
                    }
                    if(this.noProFlag){
                        Vue.utils.showTips('该订单没有商品可提供安装服务');
                    }
                }
            })
        },
        changeNum:function (item,flag,pro,s) {
            if(!item){
                return;
            }
            
            if(flag){
                if((item.stockNum > item.pickNum) && item.pickNum < pro.num){
                    var add = item.pickNum - 0 + 1;
                    Vue.set(item,"pickNum",add);
                } else{
                    Vue.utils.showTips('库存不足或达到购买上限');
                }
            } else if(item.pickNum > 0 && !flag){
                var reduce = item.pickNum - 1;
                Vue.set(item,"pickNum",reduce);
            }
        },
        checkNum:function (item,server) {
            if(server.pickNum > item.num || server.pickNum > server.stockNum){
                var flagNum = item.num < server.stockNum ? item.num:server.stockNum;
                Vue.utils.showTips('最多选择' + flagNum +'个')
                server.pickNum = flagNum;
            }
        },
        goPay:function () {
            if(this.totalNum <= 0){
                return;
            }
            var skus = [];
            this.productList.forEach((itemOne) => {
                try {
                    itemOne.servicrProduct.forEach((itemTwo) => {
                        if(itemTwo.pickNum == 0){
                            return;
                        }
                        var obj = {
                            "mpId":itemTwo.mpId,
                            "num":itemTwo.pickNum,
                            "isMain":0,
                            "soParentItemIdList":[itemOne.soItemId]
                        };
                        skus.push(obj);
                    })
                } catch (error) {
                    
                }
            });
            // var url = config.apiHost + '/api/checkout/initOrder';
            var params = {
                ut:this.ut,
                platformId:config.platformId,
                skus:JSON.stringify(skus),
                businessType:7
            }
            // Vue.api.postForm(url, params, (res) => {
            //     location.href = '/pay/pay.html?type=7';
            // })

            Vue.utils.quickPurchase(params,(res) => {
                Vue.utils.showTips(res.message);
            })
        }
    }
});
