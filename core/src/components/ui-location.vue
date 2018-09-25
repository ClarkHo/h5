<template>
    <!--省市区选择-->
    <div class="ui-actionsheet" :class="{'show': show}">
        <div class="ui-actionsheet-cnt ui-pop area-wrap">
            <div class="close" @click="closeArea()">×</div>
            <div class="tit">选择地区</div>
            <div class="checked ui-border-b">
                <span :class="{'theme': currentProvince.id == -1}" @click="unselectProvince">{{currentProvince.name}}</span>
                <span :class="{'theme': currentCity.id == -1}" v-if="currentProvince.id != -1" @click="unselectCity">{{currentCity.name}}</span>
                <span :class="{'theme': currentRegion.id == -1}" v-if="currentCity.id != -1" @click="unselectRegion">{{currentRegion.name}}</span>
            </div>
            <div class="ui-scroller">
                <ul>
                    <li v-for="area in areaData" @click="choseArea(area)">
                        <span>{{area.name}}</span>
                        <i class="icon icon-ok" v-if="area.checked"></i>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
<script>
import Vue from "vue";
import config from "../../env/config.js";

export default {
    data: function () {
        return {
            areaData: [],//展示的数据
            provinces: [],//保存省份数据
            cities: [],//保存城市数据
            regions: [],//保存区域数据
            currentProvince: this.getInitState(),
            currentCity: this.getInitState(),
            currentRegion: this.getInitState(),
            index: 0
        };
    },
    props: ['show', 'callback'],
    watch: {
        "show": function (boo, oldBoo) {
            if(boo) {//每次打开的时候，判断id，查询地址详情
                this.getProvinces();
            }
        }
    },
    methods: {
        getInitState: function () {
            return {
                id: -1,
                name: '请选择',
                code: ''
            };
        },
        //获取区域
        getProvinces: function() {
            if (this.provinces.length == 0) {
                //初始化加载
                Vue.api.get("" + '/api/location/list/100000',null, (res) => {
                    if (res.code == '0') {
                        if (res.data) {
                            for (var i = 0; i < res.data.length; i++) {
                                res.data[i].checked = false;
                            }
                            this.areaData = res.data;//展示数据 展示省份
                            this.provinces = res.data; //存储省份数据
                        }
                    }
                    this.initIscroll();
                });
            } else {
                //关闭再打开]
                this.currentArea();
            }
        },
        //选择区域
        choseArea: function(area) {
            if (this.index == 0) {
                //获取当前选中的省级
                this.currentProvince.id = area.id;
                this.currentProvince.name = area.name;
                this.currentProvince.code = area.code;
            } else if (this.index == 1) {
                this.currentCity.id = area.id;
                this.currentCity.name = area.name;
                this.currentCity.code = area.code;
            } else if (this.index == 2) {
                this.currentRegion.id = area.id;
                this.currentRegion.name = area.name;
                this.currentRegion.code = area.code;

                //三个都选择了，回调
                if(typeof this.callback === "function") {
                    var obj = {
                        pid: this.currentProvince.id,
                        pcode: this.currentProvince.code,
                        pname: this.currentProvince.name,
                        cid: this.currentCity.id,
                        ccode: this.currentCity.code,
                        cname: this.currentCity.name,
                        rid: this.currentRegion.id,
                        rcode: this.currentRegion.code,
                        rname: this.currentRegion.name
                    };
                    this.callback(obj);
                    this.closeArea();
                }

            }
            if (this.index < 2) {
                this.index = this.index + 1;
            }
            for (var i = 0; i < this.areaData.length; i++) {
                this.areaData[i].checked = false;
            }
            area.checked = true;
            //TODO这里代码每次更换区域都会查询
            Vue.api.get("" + '/api/location/list/' + area.code,null, (res) => {
                if (res.data) {
                    this.areaData = [];
                    for (var i = 0; i < res.data.length; i++) {
                        res.data[i].checked = false;
                    }
                    this.areaData = res.data;
                    this.initIscroll();
                    if (this.index == 1) {
                        //市
                        this.cities = res.data;
                    } else if (this.index == 2) {
                        //区
                        this.regions = res.data;
                    }
                }
            });
        },
        //当前选择
        currentArea: function() {
            if (this.index == 2) {
                //区
                this.areaData = [];
                if(this.currentRegion.id) {
                    for (var i = 0; i < this.regions.length; i++) {
                        this.regions[i].checked = false;
                        if (this.regions[i].id == this.currentRegion.id) {
                            this.regions[i].checked = true;
                        }
                    }
                }
                this.areaData = this.regions;
                this.initIscroll();
            } else if (this.index == 1) {
                //市
                this.areaData = [];
                if(this.currentCity.id) {
                    for (var i = 0; i < this.cities.length; i++) {
                        this.cities[i].checked = false;
                        if (this.cities[i].id == this.currentCity.id) {
                            this.cities[i].checked = true;
                        }
                    }
                }
                this.areaData = this.cities;
                this.initIscroll();
                this.currentRegion.name = '请选择';
                this.currentRegion.id = -1;
            } else if (this.index == 0) {
                //回到省级
                this.areaData = [];
                if(this.currentProvince.id) {
                    for (var i = 0; i < this.provinces.length; i++) {
                        this.provinces[i].checked = false;
                        if (this.provinces[i].id == this.currentProvince.id) {
                            this.provinces[i].checked = true;
                        }
                    }
                }
                this.areaData = this.provinces;
                this.initIscroll();
                this.currentCity.name = '请选择';
                this.currentCity.id = -1;
            }
        },
        //取消选择省份
        unselectProvince: function () {
            this.index = 0;
            this.currentProvince = this.getInitState();
            this.currentCity = this.getInitState();
            this.currentRegion = this.getInitState();
            this.areaData = this.provinces;
            this.initProvinceData();
            this.initIscroll();
        },
        //取消选择城市
        unselectCity: function () {
            this.index = 1;
            this.currentCity = this.getInitState();
            this.currentRegion = this.getInitState();
            this.areaData = this.cities;
            this.initCityData();
            this.initIscroll();
        },
        //取消选择区域
        unselectRegion: function () {
            this.index = 2;
            this.currentRegion = this.getInitState();
            this.areaData = this.regions;
            this.initRegionData();
            this.initIscroll();
        },
        //初始化省市数据
        initProvinceData: function () {
            for (var i = 0; i < this.provinces.length; i++) {
                this.provinces[i].checked = false;
                if (this.provinces[i].id == this.currentProvince.id) {
                    this.provinces[i].checked = true;
                }
            }
        },
        //初始化城市数据
        initCityData: function () {
            for (var i = 0; i < this.cities.length; i++) {
                this.cities[i].checked = false;
                if (this.cities[i].id == this.currentCity.id) {
                    this.cities[i].checked = true;
                }
            }
        },
        //初始化区域数据
        initRegionData: function () {
            for (var i = 0; i < this.regions.length; i++) {
                this.regions[i].checked = false;
                if (this.regions[i].id == this.currentRegion.id) {
                    this.regions[i].checked = true;
                }
            }
        },
        //初始化iscroll
        initIscroll: function() {
            setTimeout(function() {
                var scroll = new fz.Scroll('.ui-scroller', {
                    scrollY: true
                });
            }, 500)
        },
        //关闭省市区选择框
        closeArea: function() {
            this.show = false;
        }
    }
}
</script>
