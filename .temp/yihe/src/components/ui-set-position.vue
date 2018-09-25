<template>
    <div class="location-container" :class="{'show':show}">
        <!--header-->
        <header class="ui-header ui-header-stable ui-header-location ui-border-b">
            <i class="ui-icon-return" @click="closeLocation()"></i>
            <h1>定位</h1>
        </header>
        <section class="ui-container" style="border-top: 44px solid transparent;" v-cloak>
            <!--首字母检索-->
            <div class="letter">
                <span v-for="l in letters" @click="findLetter($index,l)">{{l}}</span>
            </div>
            <div class="letter-box" id="letter-box"></div>
            <!--省份列表-->
            <ul class="province-list">
                <li>
                    <h6>当前定位地址</h6>
                    <ul>
                        <li class="ui-nowrap" @click="backCurLocation()">{{curLocation}}</li>
                    </ul>
                </li>
                <li v-if="ut && address.length>0">
                    <h6>收货地址</h6>
                    <ul>
                        <li :class="{'ui-border-b': $index < address.length -1}"
                            v-for="addr in address | limitBy 3"
                            @click="saveReceiverId(addr)">{{addr.provinceName}}{{addr.cityName}}{{addr.regionName}}{{addr.detailAddress}}</li>
                    </ul>
                </li>
                <li v-for="pro in provinces">
                    <h6 :id="pro.key">{{pro.key}}</h6>
                    <ul>
                        <li v-for="a in pro.list" :class="{'ui-border-b': $index < pro.list.length -1}" @click="getAreaList(a,2)">{{a.areaName}}</li>
                    </ul>
                </li>
            </ul>
            <!--市、区弹层-->
            <div class="area-pop" :class="{'show':showAreaPop == true}" @click="showAreaPop = false">
                <div class="wrap" @click="$event.stopPropagation()">
                    <div class="w-tit ui-border-b">
                        <i @click="showAreaPop = false">×</i>
                        选择收货城市
                    </div>
                    <div class="w-cnt ui-scroller">
                        <ul>
                            <li v-for="city in cities" :class="{'ui-border-b': $index < cities.length -1}" @click="getAreaList(city,3)">
                                {{city.name}}<i class="icon icon-down" :class="{'checked':city.checked}"></i>
                                <ul v-if="city.checked">
                                    <li v-for="region in regions" @click="choseArea(region)" :class="{'active':region.checked,'ui-border-b': $index < regions.length -1}">
                                        {{region.name}}
                                        <i v-if="region.checked" class="lyf-icons lyf-icons-duihao fr"></i>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>
<style lang="less">
.fix-body{
    position: fixed;
    overflow: hidden;
}
.ui-header-location{
    background-color: #fff;
    z-index: 107;

    .ui-icon-return {
        color: #ff6900 !important;
    }

    h1{
        color: #666;
    }
}
.location-container{
    display: none;
    height: 100%;
    background-color: #f0f0f0;
    z-index: 9999;

    &.show{
      display: block;
    }
}
.province-list{
  > li{
    h6{
      line-height: 36px;
      padding-left: 15px;
      color: #666;
    }

    ul{
      background-color: #fff;

      li{
        line-height: 44px;
        margin-left: 15px;
        background-color: #fff;
      }
    }
  }
}
.area-pop{
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: rgba(0,0,0,0.2);
  z-index: 112;
  opacity: 0;
  pointer-events: none;
  -webkit-transition: opacity 0.2s ease-in-out;
  transition: opacity 0.2s ease-in-out;

  .wrap{
    position: fixed;
    height: 100%;
    top: 0;
    left: 55px;
    right: 0;
    background-color: #fff;
    transform: translateX(100%);
    -webkit-transform: translateX(100%);
    -webkit-transition: transform 0.4s ease-in-out;
    transition: transform 0.4s ease-in-out;
  }

  &.show{
    opacity: 1;
    pointer-events: inherit;

    .wrap{
      transform: translateX(0);
      -webkit-transform: translateX(0);
    }
  }

  .w-tit{
    line-height: 44px;
    font-size: 15px;
    color: #666;
    text-align: center;

    i{
      position: absolute;
      top: 11px;
      left: 11px;
      font-size: 26px;
      line-height: 22px;
      color: #ff6900;
    }
  }

  .w-cnt{
    position: absolute;
    width: 100%;
    top: 44px;
    bottom: 10px;
    overflow-y: hidden;

    li{
      position: relative;
      margin-left: 15px;
      line-height: 44px;

      i{
        position: absolute;
        right: 15px;
        top: 17px;
      }

      .icon-down{
        width: 14px;
        height: 10px;
        background-position: 0 0;
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
        -webkit-transition: all 0.4s;
        transition: all 0.4s;

        &.checked{
          -webkit-transform: rotate(180deg);
          transform: rotate(180deg);
        }
      }

      ul{
        margin-left: 15px;

        li{
            &.active{
                color:#ff6900;
            }
        }
      }
    }
  }
}
.letter{
  position: fixed;
  right: 0;
  top: 75px;
  bottom: 20px;
  font-size: 12px;
  color: #808080;
  z-index: 102;
  text-align: center;

  span{
    display: block;
    width: 20px;
  }
}

.letter-box{
  position: fixed;
  left: 50%;
  top: 50%;
  width: 100px;
  height: 100px;
  line-height: 100px;
  border-radius: 5px;
  font-size: 75px;
  color: #555;
  text-align: center;
  background: rgba(145,145,145,0.6);
  margin: -50px 0px 0px -50px;
  z-index: 99;
  opacity: 0;
  pointer-events: none;
  -webkit-transition: opacity 0.4s;
  transition: opacity 0.4s;

  &.show{
    opacity: 1;
    pointer-events: inherit;
  }
}
</style>
<script>
import Vue from "vue";
import config from "../../env/config.js";
export default {
    data: function () {
        return {
            ut: Vue.auth.getUserToken(),
            companyId: Vue.mallSettings.getCompanyId(),
            curLocation: '',
            areaGroup: [],        //城市分组
            keyword: '',
            searchAreaResult: [], //搜索结果
            iShowResult: false,
            address: [],    //收货地址
            provinces: [], //省
            cities: [],    //市
            regions: [],   //区
            curProvince: {},
            curCity: {},
            curRegion: {},
            showAreaPop: false,
            letters: ['#','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
            isApp: Vue.browser.isApp(),
        }
    },
    props: ["show","callBack"],
    watch: {
        "show": function (boo, oldBoo) {
            if(boo) {
                //this.rePosition();
                this.curLocation = Vue.localStorage.getItem('areaInfo').province.name + ' ' + Vue.localStorage.getItem('areaInfo').city.name + ' ' + Vue.localStorage.getItem('areaInfo').region.name;
                if(this.ut) this.getAllAddress();
                this.getProvinceList();
                this.initLetter();
                document.body.scrollTop=0;
            }
        },
        "showAreaPop": function(boo){
            if(boo){
                setTimeout(()=> {
                    $('body').addClass('fix-body');
                },1000)
            }else{
                $('body').removeClass('fix-body');
            }
        }
    },
    ready:function(){

    },
    methods: {
        //收货地址
        getAllAddress: function() {
            var params = {
                ut: Vue.auth.getUserToken(),
                nocache: new Date().getTime()
            };
            Vue.api.postForm('' + '/ouser-web/address/getAllAddressForm.do', params,(res) => {
                if (res.data) {
                    this.address = res.data;
                }
            })
        },
        //省级索引接口
        getProvinceList: function () {
            Vue.api.get("" + '/api/location/areaGroupList',{areaLevel:1}, (res) => {
                if (res.data) {
                    this.provinces = res.data;
                }
            });
        },
        //市区
        getAreaList: function (area,flag) {
            var areaCode;
            if(flag==2) areaCode = area.areaCode;
            else areaCode = area.code;
            Vue.api.get("" + '/api/location/list/' + areaCode,null, (res) => {
                if (res.data) {
                    if(flag == 2){
                        this.showAreaPop = true;
                        this.cities = res.data;
                        //this.curProvince = area;
                        //保持省市区字段一致
                        this.curProvince.name = area.areaName;
                        this.curProvince.code = area.areaCode;
                    } else if(flag == 3){
                        if(area.checked){
                            Vue.set(area, 'checked', false);
                        }else{
                            this.regions = res.data;
                            for(var i in this.cities){
                                Vue.set(this.cities[i], 'checked', false);
                            }
                            for(var i in this.regions){
                                Vue.set(this.regions[i], 'checked', false);
                                if(this.regions[i].code == Vue.localStorage.getItem('areaInfo').region.code){
                                    Vue.set(this.regions[i], 'checked', true);
                                }
                            }
                            Vue.set(area, 'checked', true);
                            this.curCity = area;
                        }
                    }
                    this.initIscroll();
                }
            });
        },
        //选择区
        choseArea: function (area) {
            event.stopPropagation();
            this.curRegion = area;
            for(var i in this.regions){
                Vue.set(this.regions[i], 'checked', false);
                Vue.set(area, 'checked', false);
            }
            //保存区域
            Vue.area.setArea(this.curProvince.name,this.curProvince.code,this.curCity.name,this.curCity.code,this.curRegion.name,this.curRegion.code,1);
            Vue.localStorage.removeItem('receiverId');
            //close
            this.showAreaPop = false;
            this.closeLocation();

            if(this.isApp){
                Vue.app.postMessage("reload");
            }
        },
        //保存receiverId
        saveReceiverId: function(addr){
            Vue.localStorage.setItem('receiverId',addr.id);
            //保存区域
            Vue.area.setArea(addr.provinceName,addr.provinceCode,addr.cityName,addr.cityCode,addr.regionName,addr.regionCode,1);

            //close
            this.showAreaPop = false;
            this.closeLocation();

            if(this.isApp){
                Vue.app.postMessage("reload");
            }
        },
        initLetter: function () {
            var h = $('.letter').height();
            $('.letter').find('span').height(h/28);
        },
        findLetter: function (index,item) {
            $('.letter-box').html(item);
            $('.letter-box').addClass('show');
            setTimeout(function(){
                $('.letter-box').removeClass('show');
            },1000);
            if(index == 0){
                document.body.scrollTop = 0;
            }else{
                if($('#'+ item).length > 0){
                    var LetterTop = $('#'+ item).position().top;
                    document.body.scrollTop = LetterTop - 45;
                }
            }
        },
        initIscroll: function() {
            Vue.nextTick(function () {
                var scroll = new fz.Scroll('.ui-scroller', {
                    scrollY: true
                });
            })
        },
        closeLocation: function(){
            this.show = false;
            if(typeof this.callBack == 'function') {
                this.callBack();
            }
            document.body.scrollTop=0;
        },
        backCurLocation: function(){
            Vue.localStorage.setItem('areaInfo',Vue.localStorage.getItem('areaInfo'));
            Vue.localStorage.removeItem('receiverId');
            this.closeLocation();
        }

    }
}
</script>
