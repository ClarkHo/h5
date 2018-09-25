import Vue from "vue";
 

/*
 * 区域相关
 */
Vue.area = {
    areaInfo: {},

    getArea: function () {
        var provinceName,
            areaCode;
        if (Vue.browser.isApp()){
            //需要从APP中获取区域信息
            // Vue.app.postMessage("getAreaCode", null, (res)=>{
            //     areaCode = res;
            //     return {
            //         //pN: provinceName,
            //         aC: areaCode
            //     }
            // });

        } else {
            if (!Vue.localStorage.getItem('areaInfo')) {
                this.rePosition();
            } else {
                provinceName = Vue.localStorage.getItem('areaInfo').province.name;
                areaCode = Vue.localStorage.getItem('areaInfo').region.code;
            }

        }

        return {
            pN: provinceName,
            aC: areaCode
        }
    },

    setArea: function (pN,pC,cN,cC,rN,rC,flag) {
        this.areaInfo.province = {'name':pN,'code':pC};
        this.areaInfo.city = {'name':cN,'code':cC};
        this.areaInfo.region = {'name':rN,'code':rC};
        //保存区域
        if(flag == 1){
            Vue.localStorage.setItem('areaInfo',this.areaInfo);
        }
        //同时保存
        if(flag == 2){
            Vue.localStorage.setItem('areaInfo',this.areaInfo);
            Vue.localStorage.setItem('curLocation',this.areaInfo);
        }
        //保存定位
        if(flag == 3){
            Vue.localStorage.setItem('curLocation',this.areaInfo);
        }
    },

    //获取销售区域默认配置
    getConfig: function(fun){
        Vue.api.get("" + "/api/commondata/getConfig", null, function(res) {
            if(res.data){
                var param = {regionCode: res.data.defaultAreaCode || '310101'};
                Vue.api.get("" + "/api/location/getCompleteAreaInfo", param, function(result) {
                    if(fun){
                        fun(result.data);
                    }
                });
            }
        });
    },

    rePosition: function () {
        var map, geolocation;
        //加载地图，调用浏览器定位服务
        if (typeof AMap != 'undefined') {
            map = new AMap.Map('temp');
            map.plugin('AMap.Geolocation', function() {
                geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true
                });
                geolocation.getCurrentPosition();
                AMap.event.addListener(geolocation, 'complete', function(data) {
                    Vue.area.onComplete(data);
                });//返回定位信息
                AMap.event.addListener(geolocation, 'error', function(data) {
                    Vue.area.onError(data);
                });//返回定位出错信息
            });
        } else{
            Vue.area.onError();
        }
    },

    //获取区域
    getLocation: function (data) {
        if (data.city == '') data.city = data.province;
        var param = {
            countryName: '中国',
            provinceName: data.province,
            cityName: data.city,
            areaName: data.district,
        };
        Vue.api.get(config.apiHost + '/api/location/getArea', param, function(res) {
            if (res.data) {
                Vue.area.setArea(res.data.twoAddress, res.data.twoCode, res.data.thrAddress, res.data.thrCode, res.data.fouAddress, res.data.fouCode, 1);
            } else {
                this.getConfig(function(r) {
                    Vue.area.setArea(r.provinceName, r.provinceCode, r.cityName, r.cityCode, r.regionName, r.regionCode, 1);
                });
            }
        });
    },

    onComplete: function (data) {
        this.getLocation(data.addressComponent);
    },

    onError: function (data) {
        this.getConfig(function(r) {
            Vue.area.setArea(r.provinceName, r.provinceCode, r.cityName, r.cityCode, r.regionName, r.regionCode, 1);
            location.reload();
        });
    }
};


