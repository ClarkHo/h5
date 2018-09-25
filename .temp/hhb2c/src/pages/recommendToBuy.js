import Vue from "vue";
import UiHeader from "../components/ui-header.vue";
import UiShare from "../components/ui-share.vue";
import config from "../../env/config.js";

let urlParams = Vue.utils.paramsFormat(location.href);
let state = Vue.utils.paramsFormat(location.href).t;

new Vue({
    el: 'body',
    components: { UiHeader ,UiShare},
    data: {
    	showShare: false,   //显示分享
        shareConfig: {}, //分享配置
        productList: [],            //推荐商品列表
        pageNo:1,
        pageSize:10,
        isEnd:false,
        ItemIds :[],
        ItemPrice:[],
        earnMoney:[]
    },
    ready: function() {
       //this.getRecomentList();
       /* Vue.scrollLoading(() => {
            if (!this.isEnd) {
                this.pageNo += 1;
                this.getRecomentList();
            }
        }); */
    },
    methods: {
        getRecomentList : function () {
            var url = config.apiHost + '/api/read/product/recommendProductList';
            //TODO 场景 参数暂时不明。
            var param = {
                //distributorId: did,
                ut: Vue.auth.getUserToken(),
                platformId: config.platformId,
                pageSize: this.pageSize,
                pageNo: this.pageNo,
                sceneNo:5,      //暂时等待风华参数
                mpIds:1182036600000052,
                areaCode: Vue.area.getArea().aC,

            };

            Vue.api.get(url, param, (res) => {
                var itemIds = [];
                if(res.data){
                    for(let p of res.data.dataList){
                        itemIds.push(p.mpId)
                    }
                    itemIds = itemIds.join();
                    var proList = [];
                    //获取实时价格
                    Vue.getPriceAndStock(itemIds,res.data.dataList,null,(obj)=>{
                        this.productList = this.productList.concat(obj);
                        proList = this.productList;
                        //获取佣金
                        this.getMoney(proList);
                    });
                    if(res.data.totalNum <= this.productList.length){
                        this.isEnd = true;
                    }

                }
            }, () => {
                //处理掉不显示报错
            });

        },

        //点击分享
        clickShare: function (Item) {
            var self = this;
            //e.stopPropagation();
            if(!Vue.auth.loggedIn()) {//如果没有登录 需要先登录 为了获取自家did
                var from = Vue.utils.getRelatedUrl();
                window.location.href = "/login.html?from=" + encodeURIComponent(from);
                return;
            }
            //获取分享信息
            var url = config.apiHost + '/api/share/shareInfo';
            var param = {
                type: 2,
                ut: Vue.auth.getUserToken(),
                paramId: Item.mpId,
                shareType: 1 ,//0:非分销模式，1：分销模式
                platformId:config.platformId
            };
            Vue.api.get(url, param, (res) => {
                this.shareConfig = {
                    url: res.data.linkUrl,
                    title: res.data.title,
                    description: res.data.content,
                    pic: res.data.sharePicUrl
                };
                Vue.weixin.weixinShare({
                    link: res.data.linkUrl,
                    title: res.data.title,
                    desc: res.data.content,
                    imgUrl: res.data.sharePicUrl
                },function(){
                    //不是分销商品，清除分销商信息
                    if(!self.isDistribution){
                        Vue.distribution.clearCurrentDistributionData();//清除分销商的信息
                    }
                    self.getSharePoint();
                });
                this.showShare = true;
                this.rightNavFlag = false;
            });
        },

        getMoney: function(ProList){
            var ItemPrice = [];
            var mapIds = [];
            var requestJson ={
                commoditys:[]
            }
            //获取价格
            for(let p of ProList){
                requestJson.commoditys.push({
                    mpId:p.mpId,
                    salaPrice:p.price
                });
            }

            //获取商品Id

            //var self = this;
            var url = config.apiHost+ '/agent-fx-web/api/preCommissions.do';
            Vue.api.postForm(url, {requestJson:JSON.stringify({commoditys:requestJson.commoditys})}, (res) => {
                   if(res != null && res.data != null){
                       this.earnMoney = res.data;
                   }
            }, () => {

            });

        },
        //重置图片大小
        resizeImgHeight: function () {
            Vue.nextTick(function () {
                var width = $('.ui-grid-halve img').width();
                $('.ui-grid-halve img').height(width);
            })
        },
    }
});