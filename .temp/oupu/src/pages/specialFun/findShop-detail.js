import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);

//隐藏app头部
Vue.app.postMessage('hiddenHead',{'isHidden':'1'});

//地图引用
var map = null;
var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        //当前选择的门店信息
        currentShopInfo: {},
        //手机号码
        telNum:1,
        //门店时间
        businessTime:[],
        //当前选择的marker
        currentMarker: null,
        //地图上的所有markers
        markers: [],
        lat:null,//地址
        lng:null

    },
    ready: function() {
        this.initMap();
        this.getShopDetail();



    },
    methods: {
        //初始化地图
        initMap: function function_name(argument) {
            map = new AMap.Map('gdmap', {
                zoom: 15
            });
        },
        //打开门店详情
        getShopDetail: function () {
            var params = {platformId: config.platformId, merchantId: urlParams.merchantId};
            Vue.api.get("/api/read/merchant/getBaseMerchantShopInfo", params, (result)=>{
                if (result.data) {
                    this.currentShopInfo = result.data;
                    this.telNum = this.currentShopInfo.phone;
                    if(result.data.businessTime){
                        this.businessTime = this.currentShopInfo.businessTime || '';
                    }
                    this.lat = result.data.latitude;
                    this.lng = result.data.longitude;

                }
            });
            this.setLocation(this.currentShopInfo);
        },
        //获得当前位置并加载门店
        // getGeoLocation: function () {
        //     var loc = this.loc;
        //     //如果没有给定地址,使用默认地址
        //     if(!loc){
        //         loc=this.getDefaultLocation();
        //     }
        //     Vue.geo.getLocationByAddress(decodeURI(urlParams.addr),(res)=>{
        //
        //     })
        // },
        //默认地址
        getDefaultLocation:function(){
            return {lng: 121.473701, lat: 31.230416}
        },
        //在地图上定位
        setLocation: function(currentShopInfo) {
            var marker = new AMap.Marker({
                position: [currentShopInfo.longitude,currentShopInfo.latitude],
                content: ('<div class="map-loc-2">1</div>'),
                map: map
            });

            map.setCenter(marker.getPosition());
        },
    }
});
