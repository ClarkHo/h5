import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);

var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        shopList: [],
        pageNo: 1,
        pageSize: 10,
        totalCount: 0,
        loc:null,//地址


    },
    ready: function() {
       this.loadShopList();
    },
    methods: {
        //加载门店信息
        loadShopList: function () {
            var loc = this.loc;
            //如果没有给定地址,使用默认地址
            if(!loc){
                loc=this.getDefaultLocation();
            }
            var params = {platformId: config.platformId, keyword: decodeURI(urlParams.keyword), longitude: loc.lng, latitude: loc.lat,
                pageNum: this.pageNo, pageSize: this.pageSize};
            //
            Vue.api.get("/api/read/merchant/queryBaseMerchantList", params, (result)=>{
                if (result.data) {
                    var data = result.data;
                    this.totalCount = data.totalNum || 0;
                    if (data.dataList && data.dataList.length>0) {
                        this.shopList = this.shopList.concat(data.dataList);
                        this.clearMarkers();
                        this.addMarkers();
                    }
                }
            });
        },
        //默认地址
        getDefaultLocation:function(){
            return {lng: 121.473701, lat: 31.230416}
        },

    }
});
