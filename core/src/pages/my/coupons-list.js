import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiPopover from "../../components/ui-popover.vue";
import UiShare from "../../components/ui-share.vue";
import config from "../../../env/config.js";


let urlParams = Vue.utils.paramsFormat(window.location.href);
new Vue({
    el: 'body',
    components: { UiHeader ,UiPopover,UiShare},
    data: {
        ut: Vue.auth.getUserToken(),
        companyId: Vue.mallSettings.getCompanyId(),

    	showCouponsList: [],//展示list
        tabIndex: 1, //1-未使用 2-已使用 3-已过期 4-已赠送
        status:['可用','已用','过期'],
        countData: {},//优惠券数量
        couponCode: '',//卡号
        couponPsw: '',//密码

        isEnd:false,
        noData:false,
        pageSize:10,
        pageNo:1,
        showCouponsList_load:0,//是否是第一次加载

        showShare: false,    //显示分享
        giving:false, //  赠送好友请求中
        shareConfig: {}, //分享配置
        height:0, //暂无数据时 留白高度
        shareCouponCode: '',
        shareCouponId: '',
        // platformId: config.platformId,
        shareType: ''
        
    },
    ready: function() {
        this.getMyCoupons();
        // this.getCouponsCount();
        this.computerHeight();

        //滚动加载更多数据
        Vue.scrollLoading(() => {
            if (!this.isEnd) {
                this.pageNo += 1;
                this.getMyCoupons();
            }
        });
    },
    methods: {
        //LYF - 获取优惠券列表
        getMyCoupons: function () {
            var url = config.apiHost + '/api/my/coupon';

            var param = {
                ut: this.ut,
                companyId: this.companyId,
                pageSize: this.pageSize,
                pageNo: this.pageNo,
                couponStatus: this.tabIndex,//1-未使用 2-已使用 3-已过期 4-已赠送
            };

            Vue.api.get(url, param, (result) => {
                this.showCouponsList_load = this.showCouponsList_load + 1;
                if (result.data) {
                    var couponList = [];
                    if (this.tabIndex == 1) {
                        couponList = result.data.canUseCouponList.concat(result.data.inactiveCouponList) || [];
                    } else if (this.tabIndex == 2) {
                        couponList = result.data.usedCouponList|| [];
                    }else if (this.tabIndex == 4) {
                        couponList = result.data.shareCouponList|| [];
                    }else if (this.tabIndex == 3) {
                        couponList = result.data.expiredCouponList|| [];
                    }

                    if (this.showCouponsList_load == 1) {
                        if (couponList.length == 0) {
                            this.noData = true;
                        }
                    } else {
                        if (couponList.length == 0) {
                            this.isEnd = true;
                        }
                    }

                    this.showCouponsList = this.showCouponsList.concat(couponList);
                }
               this.initStatus();
            });
        },

        // //LYF - 查询优惠券数量
        // getCouponsCount: function () {
        //     var url = config.apiHost + '/api/my/coupon/count';
        //     var param = {
        //         ut: this.ut,
        //         companyId: this.companyId
        //     };
        //     Vue.api.get(url, param, (res) => {
        //         this.countData = res.data;
        //     });
        // },

        //LYF - 添加优惠券
        addCoupon: function () {
            var url = config.apiHost + '/api/my/coupon/bindCoupon';
            var param = {
                ut: this.ut,
                companyId: this.companyId,
                couponCode: this.couponCode.trim(),
                pwd: this.couponPsw.trim()
            };
            Vue.api.postForm(url, param, (res) => {
                $.tips({
                    content:"添加优惠券成功！",
                    stayTime:2000,
                    type:"success"
                });
                this.couponCode = '';
                this.couponPsw = '';

                this.tabIndex = 1;
                this.isEnd=false;
                this.noData=false;
                this.showCouponsList = [];

                this.getMyCoupons();

                this.countData = {};
                // this.getCouponsCount();
            });
        },

        //计算无数据空白

        computerHeight:function(){
            this.height=window.screen.availHeight;
        },

        // 优惠券赠送好友
        clickShareToFriend:function (item,state) {
            //上一次请求还没有结束
            if(this.giving) return;
            //组件点击在送
            if(item){
                this.shareCouponCode = item.couponCode;
                this.shareCouponId = item.couponId;
                this.shareType = item.type;
            }
            var params = {
                ut: this.ut,
                couponCode: this.shareCouponCode,
                couponId: this.shareCouponId,
                // platformId: config.platformId,
                type: this.shareType,
                needUpdateStatus:state//是否修改优惠券状态。0否，1是
            };
            //请求设为进行中
            this.giving=true;
            Vue.api.postForm(config.apiHost + "/api/promotion/coupon/share", params, (res)=>{
                //请求结束
                this.giving=false;
                this.showShare = false;
                this.h5OrAppShare(res.data);
            });
        },

        //H5分享、APP分享
        h5OrAppShare: function (data) {
            if(Vue.browser.isApp()) {
                data.info = {
                    couponCode: this.shareCouponCode,
                    couponId: this.shareCouponId,
                    // platformId: config.platformId,
                    type: this.shareType,
                }
                Vue.app.postMessage("share", data);
            }else {
                this.shareConfig = {
                    url: data.linkUrl,
                    title: data.title,
                    description: data.content,
                    pic: data.sharePicUrl
                };
                this.showShare = true;
            }
        },
        //切换 重置
        switchCoupons: function (index) {
            this.tabIndex = index;
            this.isEnd=false;
            this.noData=false;
            this.pageNo=1;
            this.showCouponsList_load = 0;
            this.showCouponsList = [];
            this.getMyCoupons();
        },

        //初始化配置
        initStatus: function () {
            for(var i in this.showCouponsList) {
                Vue.set(this.showCouponsList[i], 'isFold', true);
            }
        },
    }
});