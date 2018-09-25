import Vue from "vue";
import config from "../../env/config.js";

// 获取实时价格库存
Vue.getPriceAndStock = function(mpIds,obj,promotionId,callback){
    "use strict";
    if((mpIds||'').length==0) return;
    var url = "" + '/api/realTime/getPriceStockList';
    var param = {
        mpIds: mpIds,//商品ids
        promotionId: promotionId || ''
    };
    Vue.api.get(url, param, (res) => {
        var plistMap={};
        for(let pl of res.data.plist||[]){
            plistMap[pl.mpId]=pl;
        }
        for(let pl of obj||[]){
            if(plistMap[pl.mpId]){
                $.extend(pl,plistMap[pl.mpId]);
                if(pl.isPresell){
                    pl.availablePrice = pl.presellTotalPrice;
                }
            }
        }
        if(callback){
            callback(obj);
        }
    }, (res) => {
        Vue.api._showError(res.message);
    })

}
// 获取积分商品实时价格库存
Vue.getPointProPriceAndStock = function(mpIds,obj,promotionId,callback){
    "use strict";
    if((mpIds||'').length==0) return;
    var url = "" + '/api/pointMallProduct/getPriceLimitList';
    var param = {
        mpIds: mpIds,//商品ids
        // promotionId: promotionId || ''
    };
    Vue.api.get(url, param, (res) => {
        var plistMap={};
        for(let pl of res.data.plist||[]){
            plistMap[pl.mpId]=pl;
        }
        for(let pl of obj||[]){
            if(plistMap[pl.mpId]){
                $.extend(pl,plistMap[pl.mpId])
            }
        }
        if(callback){
            callback(obj);
        }
    }, (res) => {
        Vue.api._showError(res.message);
    })

}


