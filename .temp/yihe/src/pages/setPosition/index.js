import Vue from "vue";
import config from "../../../env/config.js";
import UiHeader from "../../components/ui-header.vue";


let urlParams = Vue.utils.paramsFormat(window.location.href);
var autocomplete,map,geocoder,marker;

new Vue({
    el: 'body',
    components: { UiHeader},
    data: {
        step:1,//1、选择收货地址，2、城市列表，3、定位服务
        stepOne:1,//1、选择地址静态页，2、输入框搜索地址
        choosedPos:'北京市',
        loc:{
            lng:116.397428,
            lat:39.90923
        },//默认的经纬度，北京天安门
        stepOneKeyWord:'',
        stepOneSearchList:[],//输入地址，高德给出的搜索结果
        stepThreeSearchList:[],//输入地址，高德给出的搜索结果
        cityList:[],//已开通的城市列表
        stepThreeKeyWord:'',//地图定位搜索词
        windowHeight:667,
    },
    ready: function() {
        this.windowHeight = window.screen.availHeight;
        Vue.nextTick(() => {
            this.init(this.choosedPos);
            this.initMap();
        })
        this.getCity();
    },
    methods: {
        //根据选择的城市，初始化高德地图
        init:function (city) {
            AMap.plugin('AMap.Autocomplete',function(){//回调函数
                autocomplete= new AMap.Autocomplete({
                    city: city || "" //城市，默认全国
                });
            })
        },
        //根据输入的地址，搜索附近的地址,一、三步公用方法，flag标识
        getSearch:function (keyWord,flag) {
            autocomplete.search(keyWord, (status, result) => {
                if(status != 'complete') return;
                var tempArray = [];
                result.tips.forEach((item) => {
                    if(item.adcode != ''){
                        tempArray.push(item);
                    }
                });
                if(flag){
                    this.stepThreeSearchList = tempArray;
                } else{
                    this.stepOneSearchList = tempArray;
                }
            });
        },
        // 根据经纬度获取地址
        getAddressByInglat:function (lnglatXY) {
            geocoder.getAddress(lnglatXY, (status, result) => {
                if (status === 'complete' && result.info === 'OK' && result.regeocode.formattedAddress) {
                    this.getSearch(result.regeocode.formattedAddress,true);
                }
            }); 
        },
        //返回
        stepOneBack:function () {
            if(this.stepOne == 1){
                history.back();
            } else{
                this.stepOne = 1;
            }
        },
        //选择城市
        selectCity:function (item) {
            if(item.areaName == this.choosedPos) return;
            this.choosedPos = item.areaName;
            this.cityList.forEach((v) => {
                if(v.areaName != item.areaName){
                    v.choosed = false;
                } else{
                    v.choosed = true;
                }
            });
            //选择完城市之后重新初始化高德地图
            this.init(this.choosedPos);
            this.stepOneKeyWord = '';
            this.stepOneSearchList = [];
            this.step = 1;
        },
        getCity:function () {
            var url = config.apiHost + '/rest/search/merchant/serviceAreaList.do';
            Vue.api.get(url,null,(res) => {
                
                if(res.data && res.data.length > 0){
                    res.data.forEach((item) => {
                        item.choosed = false;
                    });
                    res.data[0].choosed = true;
                    this.cityList = res.data || [];
                    this.choosedPos = this.cityList[0].areaName;
                    this.initGeocoder();
                }
            })
        },
        //初始化地图
        initMap: function () {
            map = new AMap.Map('gdmap', {
                zoom: 15,
            });
            map.on('click', (e) => {
                this.setLocation({
                    lng:e.lnglat.getLng(),
                    lat:e.lnglat.getLat()
                });
                if(marker){
                    map.remove(marker);
                }
                marker = new AMap.Marker({
                    icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_r.png",
                    position: [e.lnglat.getLng(), e.lnglat.getLat()],
                });
                marker.setMap(map);
            });
            //放大缩小
            var toolbar = new AMap.ToolBar({
                position: 'RB',
                liteStyle: true,
                direction: false,
                autoPosition: true,
                locate: false
            });
            map.addControl(toolbar);
            // var marker = new AMap.Marker({
            //     icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_r.png",
            //     position: map.getCenter()
            // });
            // marker.setMap(map);
            this.getLoc();
        },
        getLoc:function() {
            var that = this;
            map.plugin('AMap.Geolocation',  () => {
                var geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                    maximumAge: 0,           //定位结果缓存0毫秒，默认：0
                    convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
                    buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                    showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
                    showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
                    panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
                    zoomToAccuracy:true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                });
                
                // map.addControl(geolocation);
                AMap.event.addListener(geolocation, 'error', () => {
                    // 获取经纬度出错，使用默认地址
                    Vue.utils.showTips('定位失败')
                    // that.loc = {
                    //     longitude: 121.473701, 
                    //     latitude: 31.230416
                    // }
                });      
                geolocation.getCurrentPosition((status,result)=>{
                    if(result.position){
                        this.loc = {
                            lng:result.position.lng,
                            lat:result.position.lat
                        } 
                    }
                    this.setLocation(this.loc);
                });
            });
        },
        //初始化工具，根据地址查经纬度
        initGeocoder:function () {
            AMap.service('AMap.Geocoder',() => {//回调函数
                //实例化Geocoder
                geocoder = new AMap.Geocoder({
                    city: '全国'//城市，默认：“全国”
                });
                //TODO: 使用geocoder 对象完成相关功能
            })
        },
        //使用上面的工具
        useGeocoder:function () {
            if(!this.stepThreeKeyWord) return;
            geocoder.getLocation(this.stepThreeKeyWord, (status, result) => {
                if (status === 'complete' && result.info === 'OK') {
                    //TODO:获得了有效经纬度，可以做一些展示工作
                    //比如在获得的经纬度上打上一个Marker
                    //尝试在地图上定位
                    try {
                        this.setLocation(result.geocodes[0].location);
                    } catch (error) {
                        
                    }
                }else{
                    //获取经纬度失败
                }
            }); 
        },
        //在地图上定位
        setLocation: function(loc) {
            map.setCenter(new AMap.LngLat(loc.lng, loc.lat));
            this.getAddressByInglat(loc.lng+','+loc.lat);
        },
        goIndex:function (pos) {
            if(!pos) return;

            location.href = '/index.html?lng=' + pos.lng + '&lat=' + pos.lat;
        }
    }
});