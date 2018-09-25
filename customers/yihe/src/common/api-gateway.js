/**
 * api gateway
 */
import Vue from "vue";
import VueResource from "vue-resource";
import config from "../config/default.js";

var gateway = {
    /**
     * 获取实时库存
     * @param dataInput
     * @param fn
     */
    getPriceStockList: function(dataInput, ...fn) {
        let {mpIds,promotionType,items,promotionLimitParams}=dataInput,
            url = config.apiHost + (promotionType ? '/gw/realTime/getPriceStockPromotionLimit' : '/gw/realTime/getPriceStockList'),
            data,
            [fnS,fnE]=fn;
        //如果有商品列表
        if (items) {
            for (let item of items) {
                if (promotionType) {
                    promotionLimitParams = promotionLimitParams || [];
                    promotionLimitParams.push({
                        promotionId: item.promotionId,
                        mpId: item.mpId
                    })
                } else {
                    mpIds=mpIds||[];
                    mpIds.push(item.mpId);
                }
            }
        }
        if (mpIds) {
            mpIds = [mpIds].join(',').split(',').map(id=>id - 0);
        }
        //如果普通商品的mpIds为空,
        if (!promotionType) {
            mpIds = mpIds || []
        }


        data = JSON.stringify({
            promotionType,
            mpIds,//商品id
            promotionLimitParams,
        });
        Vue.api.postForm(url, {data}, (res)=> {
            if (fnS) {
                return fnS(res);
            }
        }, (res)=> {
            if (fnE) {
                fnE(res)
            } else {
                Vue.api._showError(res.message)
            }
        })
    },

    /**
     * 广告
     * pageCode addCode callback
     */
    getDolphin: function (pageCode,adCode,fn) {
        var url = config.apiHost + '/gw/dolphin/list';
        var param = {
            platform: config.platform,
            pageCode: pageCode,
            adCode: adCode,
            companyId: Vue.mallSettings.getCompanyId(),
            areaCode: -1, //区域code 德升 -1
            systemId: 1 //稍后可不传
        };
        var data = JSON.stringify(param);
        Vue.api.get(url, {data}, (res)=> {
            if (fn) {
                return fn(res);
            }
        }, (res)=> {
            Vue.api._showError(res.message);
        })
    },

    /**
     * 获取首页广告
     * pageCode: H5_HOME
     */
    getHomeDolphin: function (adCode,fn) {
       this.getDolphin('H5_HOME',adCode,fn);
    },

}

Vue.gateway = gateway;