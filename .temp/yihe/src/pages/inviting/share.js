import Vue from "vue";
import config from "../../../env/config.js";
import UiHeader from "../../components/ui-header.vue";
import UiShare from "../../components/ui-share.vue";

let urlParams = Vue.utils.paramsFormat(window.location.href);

new Vue({
    el: 'body',
    components: { UiHeader,UiShare},
    data: {
      showShare:false,
      shareConfig:{
        url: '/regis.html?inviting=1',
        title: '邀请好友注册送优惠券',
        description: "邀请好友注册送优惠券",
        pic: "${staticPath}/images/foucsWeixin.png",
      },
        showConfi: [{ name: '新浪微博' },{  name: '微信'}, {name: '朋友圈' },],
        ut:Vue.auth.getUserToken(),
        shareBackImg:''
      // 定义显示支持的分享属性，0，支持
    },
    ready: function() {
        this.getPicDolp();
    },
    methods: {
        // 分享送积分
        getSharePoint:function () {
            var params={
                ut:this.ut,
                refType:6,
            };
            Vue.api.get("/api/social/write/share/getSharePoint",params ,(res)=>{
                this.amount= res.data.amount;
                $.tips({
                    content:"获得分享积分"+this.amount+"分",
                    stayTime:2000,
                    type:"success"
                });
            },(res) => {

            });
        },
        //点击分享
        clickShare: function (e) {
            var self = this;
            e.stopPropagation();
            if(!Vue.auth.loggedIn()) {//如果没有登录 需要先登录 为了获取自家did
                var from = Vue.utils.getRelatedUrl();
                window.location.href = "/login.html?from=" + encodeURIComponent(from);
                return;
            }
            //获取分享信息
            var url = config.apiHost + '/api/share/shareInfo';
            var param = {
                type: 7,
                ut: this.ut,
                shareType:  1,//0:非分销模式，1：分销模式
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
                    /*if(!self.isDistribution){
                        Vue.distribution.clearCurrentDistributionData();//清除分销商的信息

                    }*/
                    self.getSharePoint();
                });
                this.showShare = true;
                this.rightNavFlag = false;
            });
        },
        getPicDolp:function () {
            var url = config.apiHost + '/api/dolphin/list';
            var param = {
                platform: config.platform,
                pageCode: "H5_HOME",
                adCode: 'share_friend_img',
                companyId: Vue.mallSettings.getCompanyId(),
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, param, (res) => {
                if(res.code == 0) {
                   this.shareBackImg = res.data.share_friend_img[0].imageUrl;
                }
            });

        },
    }
});