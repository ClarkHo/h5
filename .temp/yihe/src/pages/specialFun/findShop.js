import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

//隐藏app头部
Vue.app.postMessage('hiddenHead',{'isHidden':'1'});

//地图引用
var map = null;
let urlParams = Vue.utils.paramsFormat(window.location.href);
var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        keyword: {
            value: "",
            flag: false
        },
        shopList: [],
        pageNo: 1,
        pageSize: 10,
        totalCount: 0,
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
        //是否选择门店详情
        showDetail: false,
        isApp: Vue.browser.isApp(),
        isFromPay:urlParams.from=='pay.html',
        loc:null,//地址
        longitude:null,//导航经纬度
        latitude:null,
        location:null,
    },
    ready: function() {
        this.initMap();
        //按具体地址查询
        if(this.isFromPay&&urlParams.addr) {
            Vue.geo.getLocationByAddress(decodeURI(urlParams.addr),(loc)=>{
                this.loc = loc;
                this.loadShopList();
            });
        } else {
            // Vue.geo.getCurrentLocation((loc)=>{
            //     this.loc = loc;
            //     this.loadShopList();
            // });
            if(Vue.browser.isApp()){
                Vue.app.postMessage("getLocation",  (loc) => {
                    if (typeof loc == "string") {
                        this.loc = JSON.parse(loc);
                    } else {
                        this.loc = loc
                    }
                    this.loadShopList();
                });
            } else{
                this.getLoc();
            }
            
        }

        // 滚动加载更多数据
        Vue.scrollLoading(() => {
            if (this.shopList.length < this.totalCount) {
                this.pageNo += 1;
                this.loadShopList();
            }
        });
    },
    methods: {
        //初始化地图
        initMap: function function_name(argument) {
            map = new AMap.Map('gdmap', {
                zoom: 15
            });
            

            //放大缩小
            var toolbar = new AMap.ToolBar({
                position: 'RB',
                liteStyle: true,
                direction: false,
                autoPosition: true,
                locate: true
            });
            map.addControl(toolbar);
            var marker = new AMap.Marker({
                icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_r.png",
                position: map.getCenter()
            });
            marker.setMap(map);
        },
        getLoc:function() {
            var that = this;
            map.plugin('AMap.Geolocation', function () {
                
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
                    that.loc = {
                        longitude: 121.473701, 
                        latitude: 31.230416
                    }
                    that.loadShopList();
                });      
                geolocation.getCurrentPosition((status,result)=>{
                    if(result.position){
                        that.loc = {
                            longitude:result.position.lng,
                            latitude:result.position.lat
                        } 
                        that.loadShopList();  
                    }
                                    
                });
            });
        },
        //失去焦点
        inputOnBlur: function(obj) {
            setTimeout(function() {
                obj.flag = false
            }, 50);
        },

        //搜索
        search: function () {
            this.pageNo = 1;
            this.totalCount = 0;
            this.shopList = [];
            //load shop data
            this.loadShopList();
        },

        //加载门店信息
        loadShopList: function () {
            var loc = this.loc;
            //如果没有给定地址,使用默认地址
            if(!loc){
                loc=Vue.geo.getDefaultLocation();
            }
            var params = {platformId: config.platformId, keyword: this.keyword.value, longitude: loc.longitude, latitude: loc.latitude,
                pageNum: this.pageNo, pageSize: this.pageSize};
            //筛选掉不支持自提的门店，用于结算页
            if (this.isFromPay) {
                params.isPickUp = 1;
            }

            Vue.api.get("/api/read/merchant/queryBaseMerchantList", params, (result)=>{
                if (result.data) {
                    var data = result.data
                    this.totalCount = data.totalNum || 0;
                    if (data.dataList && data.dataList.length>0) {
                        this.shopList = this.shopList.concat(data.dataList);
                        //this.clearMarkers();
                        this.addMarkers();
                    }
                }
                this.setLocation(loc);
            });
        },

        //在地图上定位
        setLocation: function(loc) {
            map.setCenter(new AMap.LngLat(loc.longitude, loc.latitude));
        },
        //打开门店详情
        openShopDetail: function (merchantId, index) {
            this.selectMarker(index);
            var params = {platformId: config.platformId, merchantId: merchantId};
            Vue.api.get("/api/read/merchant/getBaseMerchantShopInfo", params, (result)=>{
                if (result.data) {
                    this.currentShopInfo = result.data;
                    this.telNum = this.currentShopInfo.phone;
                    this.businessTime = this.currentShopInfo.businessTime;
                    this.latitude = this.currentShopInfo.latitude;
                    this.longitude = this.currentShopInfo.longitude;
                    this.location = this.currentShopInfo.location;
                    this.showDetail = true;
                }
            });
        },

        //选择门店
        selectShop:function(m_id){
            var url='/pay/pay.html?';
            var param=[];
            for(var k in urlParams||{}){
                if(['type','q','id','code'].indexOf(k)>=0){
                    param.push(k+'='+urlParams[k]);
                }
            }
            param.push('m_id='+m_id);
            param.push('back=1');
            window.location.replace(url+param.join('&'));
        },
        //清除地图的markers
        clearMarkers: function () {
            if (map) {
                map.clearMap();
            }
        },

        //在地图上显示所有门店的markers
        addMarkers: function () {
            this.markers = [];

            if (this.shopList.length ==  0) {
                return;
            }

            for (var i = 0; i < this.shopList.length; i++) {
                var shop = this.shopList[i];

                if (shop.longitude && shop.latitude) {
                    for(var j=0; i<this.markers.length; j++) {
                        var po = this.markers[j].getPosition();
                        if(po.getLng() == shop.longitude && po.getLat() == shop.latitude) {
                            continue;
                        }
                    }
                    var marker = new AMap.Marker({
                        position: [shop.longitude, shop.latitude],
                        content: this.getMarkerContent(i, false),
                        extData: {index: i, merchantId: shop.merchantId},
                        map: map
                    });

                    this.markers.push(marker);

                    //处理marker上的click事件
                    AMap.event.addListener(marker, 'click', (e) => {
                        var extData = e.target.getExtData();
                        //显示详情
                        this.openShopDetail(extData.merchantId, extData.index);

                    });

                }
            }

        },

        //选择指定的marker
        selectMarker: function (index) {
            var marker = this.markers[index];
            if (marker) {
                //重置之前选择的marker状态
                if (this.currentMarker && this.currentMarker.getExtData().index != index) {
                    this.currentMarker.setContent(this.getMarkerContent(this.currentMarker.getExtData().index, false));
                }
                marker.setContent(this.getMarkerContent(index, true));
                map.setCenter(marker.getPosition());
                this.currentMarker = marker;
                window.scroll(0,0);
            }
        },

        //get marker content
        getMarkerContent: function (index, selected) {
            if (selected) {
                return '<div class="map-loc-2">' + (index+1) + '</div>';
            } else {
                return '<div class="map-loc-1">' + (index+1) + '</div>';
            }
        },

        back: function () {
            if (this.showDetail) {
                this.showDetail = false;
                //取消marker选中状态
                if (this.currentMarker) {
                    this.currentMarker.setContent(this.getMarkerContent(this.currentMarker.getExtData().index, false));
                    this.currentMarker = null;
                }
            } else {
                if (this.isApp) {
                    Vue.app.back();
                } else {
                    history.back();
                }

            }
        },
        //导航
        navigate:function(){
            Vue.app.postMessage("navigate",{longitude: this.longitude,latitude:this.latitude,location:this.currentShopInfo.address});
            // Vue.app.postMessage("navigate",{longitude: '116.355257',latitude:'39.940409',location:'西直门'});

        }

    }
});
