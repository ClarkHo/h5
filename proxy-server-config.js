var envConfig = require('./envConfig.js');

var _path = __dirname;

var app,env,temp;

//命令行参数必须为-- oupu形式
//npm run dev -- oupu

console.log(JSON.stringify(process.argv));
var args = process.argv.splice(-3).join('-');
console.log(args);
var reg = /\-\-(dev|test|stg|online|edu)\-\-c\-(\w+)/i;

//默認值
app = 'saas';
env = 'dev';

if(reg.test(args)){//能匹配参数
    temp = args.match(reg);
    app = temp[2];
    env = temp[1];
}



var projectConfigs=envConfig[app];

var companyId=projectConfigs['companyId'];
var host=projectConfigs[env].domain;
var ip=projectConfigs[env].ip;

const BACK_PREFIXES=['/api','/agent-fx-web','/search-backend-web','/ouser-web','/ouser-center','/opay-web','/back-product-web','/obi-track','/osc-api','/cms','/admin-web','/gw','/back-finance-web','/back-order-web'];
var proxy={}

for(let bp of BACK_PREFIXES){
    proxy[bp]={
        prefixPath: bp,
        host:ip,
        headers:{
            host:host
        }
    }
}





module.exports = {
    hostname: "0.0.0.0",
    port: "80",
    logLevel: "debug",
    webPath: _path + "/dist/"+companyId+"/h5_mall",
    mockPath: _path + "mockdata",
    proxies: proxy,
    mocks: {
        //商品管理-商品列表
        // "/api/seller/product/list": "my/productList.json",
        // "/api/seller/product/cancel":{
        //     "post":"common.json"
        // },
        // "/api/seller/product/recommend": {
        //     "post": "common.json"
        // },
        // "/api/checkout/quickPurchase":{
        //     "post":"common.json"
        // },
        // "/api/seller/product/recoList":"seller/recoList.json",
        // //"/api/seller/distributor/currDistributor": "index/fenxiaoshang.json",
        // "/api/product/recoList":"index/shangjiatuijian.json",
        // "/api/share/shareInfo":"index/fenxiang.json",
        // "/api/product/recommendList":"index/tuijian.json",
        // "/api/cart/list":"cart/list0.json",
        // "/api/cart/removeItemBatch":{
        //     "post":"cart/removeItemBatch.json"
        // },
        // "/api/checkout/initOrder":{
        //     "post":"pay/initOrder.json"
        // },
        // "/api/checkout/showOrder":{
        //     "post":"pay/initOrder.json"
        // },
        // "/api/checkout/saveRemark":{
        //     "post":"common.json"
        // },
        // "/api/checkout/submitOrder":{
        //     "post":"pay/submitOrder.json"
        // },
        // "/api/my/order/detail":"my/detail.json",
        // "/api/checkout/getPayGateway":{
        //     "post":"pay/getPayGateway.json"
        // },
        // "/api/checkout/savePayment":{
        //     "post":"common.json"
        // },
        // "/opay-web/getPayInfoByOrderNo.do":{
        //     "post":"pay/getPayInfoByOrderNo.json"
        // },
        // "/api/search/searchHotWord":"search/searchHotWord.json",
        // // "/api/search/searchList":"search/searchList.json",
        // "/api/search/auto":"search/auto.json",
        // "/api/cart/addItem":{
        //     "post":"common.json"
        // },
        // "/cms/view/frontier_guide/h5/templateJS.json":"templateJS.js",
        // "/api/product/serialProducts":"detail/serialProducts.json",
        // "/api/cart/minSkuDetail":{
        //     "post":"detail/serialProducts.json"
        // },
        // "/api/cart/updateProduct":{
        //     "post":"common.json"
        // },
        // "/api/cart/updateGift":{
        //     "post":"common.json"
        // },
        // "/api/cart/editItemNum":{
        //     "post":"common.json"
        // },
        // "/api/my/favorite/add":{
        //     "post":"common.json"
        // },
        // "/api/my/favorite/batchAdd":{
        //     "post":"common.json"
        // },
        // "/api/checkout/getCoupons":{
        //     "post":"pay/getCoupons.json"
        // },
        // "/api/checkout/saveCoupon":{
        //     "post":"common.json"
        // },
        // "/api/checkout/saveBrokerage":{
        //     "post":"common.json"
        // },
        // "/api/checkout/savePoints":{
        //     "post":"pay/savePoints.json"
        // },
        // "/api/product/distributions":"detail/distributions.json",
        // "/api/product/baseInfo": "product/baseinfo.json",
        // "/api/product/promotionInfo": "product/promotionInfo.json",
        // "/api/product/serialProducts": "product/serialProducts.json",
        // "/api/product/deliveryFeeDesc": "product/deliveryFeeDesc.json",
        // "/api/product/desc": "product/desc.html",
        // "/api/product/spec": "product/spec.json",
        // "/api/product/groupsInfo": "product/groupsInfo.json",
        // '/api/product/hotlist': 'product/hotlist.json',
        // '/api/my/order/delivery': 'order/delivery.json',
        // '/osc-api/getMobileMallBasicSetting.do': {
        //     "post": "getMobileMallBasicSetting.json"
        // },
        // "/api/item/1": function(req, res) {
        //     res.json({ code: 0, data: { id: 1, name: "javascript in action" } });
        // },
        // "/api/cart/addItem": {
        //     "post": function(req, res) {
        //         res.json({code: 0, message: "successful"});
        //     }
        // },
        // "/api/cart/count": {
        //     "post": function (req, res) {
        //         res.json({code: 0, data: 6});
        //     }
        // },
        // "/api/cart/removeItemBatch":{
        //     "post":"cart/removeItemBatch.json"
        // },
        // "/api/checkout/initOrder":{
        //     "post":"pay/initOrder.json"
        // },
        // "/api/checkout/showOrder":{
        //     "post":"pay/initOrder.json"
        // },
        // "/api/checkout/saveRemark":{
        //     "post":"common.json"
        // },
        // "/api/checkout/submitOrder":{
        //     "post":"pay/submitOrder.json"
        // },
        // "/api/my/order/detail":"my/detail.json",
        // "/api/checkout/getPayGateway":{
        //     "post":"pay/getPayGateway.json"
        // },
        // "/api/checkout/savePayment":{
        //     "post":"common.json"
        // },
        // "/opay-web/getPayInfoByOrderNo.do":{
        //     "post":"pay/getPayInfoByOrderNo.json"
        // },
        // "/api/search/searchHotWord":"search/searchHotWord.json",
        // // "/api/search/searchList":"search/searchList.json",

        // "/api/my/order/list": "order/list.json",
        // "/api/my/coupon": {
        //     "post": "my/coupon.json"
        // },
        // "/api/my/point/account": {
        //     "post": "point/account.json"
        // },
        // "/api/my/point/list": {
        //     "post": "point/list.json"
        // },

        // //收益概况
        // "/api/seller/income/incomeSummary": {
        //     "get": "income/incomeSummary.json"
        // },
        // //收益账单列表
        // "/api/seller/income/incomeList": {
        //     "get": "income/incomeList.json"
        // },
        // //已结算自销佣金订单列表
        // "/api/seller/income/settledSelfCommissionOrderList": {
        //     "get": "income/settledSelfCommissionOrderList.json"
        // },
        // // 已结算自销佣金统计
        // "/api/seller/income/settledSelfCommissionSummary": {
        //     "get": "income/settledSelfCommissionSummary.json"
        // },
        // // 已结算子店佣金列表
        // "/api/seller/income/settledSubCommissionList": {
        //     "get": "income/settledSubCommissionList.json"
        // },
        // // 对账单自销佣金明细
        // "/api/seller/income/reconSelfCommissionDetail": {
        //     "get": "income/reconSelfCommissionDetail.json"
        // },
        // // 对账单子店佣金明细
        // "/api/seller/income/reconSubCommissionDetail": {
        //     "get": "income/reconSubCommissionDetail.json"
        // },
        // // 已结算子店佣金详情
        // "/api/seller/income/settledSubCommissionDetail": {
        //     "get": "income/settledSubCommissionDetail.json"
        // },
        // // 已结算子店佣金订单列表
        // "/api/seller/income/settledSubCommissionOrderList": {
        //     "get": "income/settledSubCommissionOrderList.json"
        // },

        // // 预计自销佣金统计
        // "/api/seller/income/predictSelfCommissionStatistics": {
        //     "get": "income/predictSelfCommissionStatistics.json"
        // },
        // // 预计自销佣金订单列表
        // "/api/seller/income/predictSelfCommissionOrderList": {
        //     "get": "income/predictSelfCommissionOrderList.json"
        // },
        // // 预计子店佣金列表
        // "/api/seller/income/predictSubCommissionList": {
        //     "get": "income/predictSubCommissionList.json"
        // },
        // // 预计子店佣金详情
        // "/api/seller/income/predictSubCommissionDetail": {
        //     "get": "income/predictSubCommissionDetail.json"
        // },
        // // 预计子店佣金订单列表
        // "/api/seller/income/predictSubCommissionOrderList": {
        //     "get": "income/predictSubCommissionOrderList.json"
        // },

        /* // 添加银行卡信息
         "/api/my/bank/add": {
         "get": "bank/add.json"
         },
         // 添加银行卡信息
         "/api/my/bank/list": {
         "get": "bank/list.json"
         },
         // 银行列表
         "/api/my/bank/bankList": {
         "get": "bank/bankList.json"
         },
         // 银行卡信息
         "/api/my/bank/detail": {
         "get": "bank/detail.json"
         },
         */



        // "/api/search/searchHotWord":"search/searchHotWord.json",
        // // "/api/search/searchList":"search/searchList.json",



        // // 提现记录列表
        // "/api/seller/withdraw/withdrawRecordList": {
        //     "get": "income/withdrawRecordList.json"
        // },
        // // 可提现金额
        // "/api/seller/withdraw/usableWithdrawAmount": {
        //     "get": "income/usableWithdrawAmount.json"
        // },
        // // 计算提现手续费
        // "/api/seller/withdraw/calcWithdrawFee": {
        //     "get": "income/calcWithdrawFee.json"
        // },
        // // 申请提现
        // "/api/seller/withdraw/apply": {
        //     "get": "income/apply.json"
        // },
        // /* // 银行卡列表
        //  "/api/my/fundAccount/bankCardList": {
        //  "get": "income/bankCardList.json"
        //  },*/

        // // 报表中心-流量统计
        // "/api/reportCenter/trafficInfo": {
        //     "get": "report/trafficInfo.json"
        // },
        // // 报表中心-子铺统计
        // "/api/reportCenter/subDistributorInfo": {
        //     "get": "report/subDistributorInfo.json"
        // },
        // // 报表中心-销售统计
        // "/api/reportCenter/saleInfo": {
        //     "get": "report/saleInfo.json"
        // },
        // // 报表中心-TOP商品
        // "/api/reportCenter/topProduct": {
        //     "get": "report/topProduct.json"
        // },
        // // 报表中心-子铺分页查询
        // "/api/reportCenter/pageSubDistributor": {
        //     "get": "report/pageSubDistributor.json"
        // },
        // // 获取消息列表
        // "/vl/message/getMsgList": {
        //     "get": "message/getMsgList.json"
        // },
        // // 获取消息摘要
        // "/vl/message/getMsgSummary": {
        //     "get": "message/getMsgSummary.json"
        // },
        // // 我的账单
        // "/api/my/myBill": {
        //     "get": "my/myBill.json"
        // },
        // // 子铺统计
        // "/api/seller/distributor/subStatistics": {
        //     "get": "my/subStatistics.json"
        // },
        // // 店铺列表
        // "/api/seller/distributor/list": {
        //     "get": "seller/list.json"
        // },
        // // 店铺详情页 评价列表
        // "/mpComment/get": {
        //     "post": "detail/get.json"
        // },
        // // 商品详情页 推荐商品
        // "/api/search/searchList": {
        //     "get": "search/searchList2.json"
        // },

        // "/api/my/order/list": "order/list.json",
        // "/api/my/coupon": {
        //     "post": "my/coupon.json"
        // },
        // "/api/my/point/account": {
        //     "post": "point/account.json"
        // },
        // "/api/my/point/list": {
        //     "post": "point/list.json"
        // },

        // "/api/my/order/list": "order/list.json",
        // "/api/my/coupon": {
        //     "post": "my/coupon.json"
        // },
        // "/api/my/point/account": {
        //     "post": "point/account.json"
        // },
        // "/api/my/point/list": {
        //     "post": "point/list.json"
        // },
        // "/api/my/orderAfterSale/afterSaleList": "aftersale/afterSaleList.json",


        // "/api/product/baseInfo": "product/baseinfo.json",
        // "/api/product/promotionInfo": "product/promotionInfo.json",
        // "/api/product/serialProducts": "product/serialProducts.json",
        // "/api/product/deliveryFeeDesc": "product/deliveryFeeDesc.json",
        // "/api/product/desc": "product/desc.html",
        // "/api/product/spec": "product/spec.json",
        // "/api/product/groupsInfo": "product/groupsInfo.json",
        // "/api/product/hotlist": "product/hotlist.json",
        // "/api/my/order/delivery": "order/delivery.json",
        // "/osc-api/getMobileMallBasicSetting.do": {
        //     "post": "getMobileMallBasicSetting.json"
        // },
        // "/api/category/list": "category/list1.json",
        // "/api/category/list2": "category/list2.json",
        // "/api/item/1": function(req, res) {
        //     res.json({ code: 0, data: { id: 1, name: "javascript in action" } });
        // },
        // "/api/cart/addItem": {
        //     "post": function(req, res) {
        //         res.json({code: 0, message: "successful"});
        //     }
        // },
        // "/api/cart/count": {
        //     "post": function (req, res) {
        //         res.json({code: 0, data: 6});
        //     }
        // },
        // "/api/seller/fans/list":"fans/list.json",
        // "/api/seller/fans/summary":"fans/summary.json",

        // "/api/my/order/list": "order/list.json",
        // "/api/my/order/search":{
        //     "post":  "order/search-orders.json"
        // },
        // "/api/my/coupon/count": {
        //     "post": "my/coupon.json"
        // },
        // "/api/my/point/account": {
        //     "post": "point/account.json"
        // },
        // "/api/my/point/list": {
        //     "post": "point/list.json"
        // },
        // "/api/my/orderAfterSale/afterSaleList": "aftersale/afterSaleList.json",
        // "/api/my/orderAfterSale/afterSaleType": {
        //     "post": "aftersale/afterSaleTypes.json"
        // },
        // "/api/my/orderAfterSale/initReturnProduct": "aftersale/initReturnProduct.json",
        // "/api/my/orderAfterSale/afterSaleProduct": {
        //     "post":  "aftersale/afterSaleProduct.json"
        // },
        // "/api/my/orderAfterSale/afterSaleDetails": "aftersale/afterSaleDetails.json"
    },
    // 帮助中心-意见反馈
    // "/api/live/complain/create": {
    //     "post": "help/create.json"
    // },
    // 收藏夹商品-
    // "/api/my/favorite/goods": {
    //     "get": "my/good.json"
    // },
    // 规格尺寸
    // "/api/product/groupsInfo": {
    //     "get": "groupsInfo.json"
    // }
};


console.log(module.exports.webPath);