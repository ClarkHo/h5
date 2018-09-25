import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiPopover from "../../components/ui-popover.vue";
import UiShare from "../../components/ui-share.vue";
import UiBtnCopy from "../../components/ui-btn-copy.vue";
import config from "../../../env/config.js";


let urlParams = Vue.utils.paramsFormat(window.location.href);
new Vue({
    el: 'body',
    components: { UiHeader ,UiPopover,UiShare,UiBtnCopy},
    data: {
        ut: Vue.auth.getUserToken(),
        companyId: Vue.mallSettings.getCompanyId(),

        proCodeList: [],//展示list
        tabIndex: 1, //1-返利的优惠码，2-领取的优惠码
        countData: {},//
        isEnd:false,
        noData:false,
        pageSize:10,
        pageNo:1,

        showShare: false,    //显示分享
        giving:false, //  赠送好友请求中
        shareConfig: {}, //分享配置
        height:0, //暂无数据时 留白高度
        shareCouponCode: '',
        shareCouponId: '',
        // platformId: config.platformId,
        shareType: '',
        proCodeIsVal:1,
        addProCodeShow:false,
        userAddProCode:'',//用户输入的添加优惠码code
    },
    ready: function() {
        this.getMyProCode();
        // this.getCouponsCount();
        this.computerHeight();

        //滚动加载更多数据
        Vue.scrollLoading(() => {
            if (!this.isEnd) {
                this.pageNo += 1;
                this.getMyProCode();
            }
        });
    },
    methods: {
        // - 获取优惠码列表
        getMyProCode: function (flag) {
            //var url = config.apiHost + '/api/promotion/referralCode/getMyList'; 老接口已抛弃，说好的不抛弃，不放弃那！
            var url = config.apiHost + '/api/referralCode/list';

            var param = {
                ut: this.ut,
                type: this.tabIndex*1,//1-返利，2：赠送
                isNeedCount:true,
                currentPage:this.pageNo,
                itemsPerPage:this.pageSize
            };

            Vue.api.get(url, param, (result) => {
                if (result.data) {
                    if(flag){
                        this.proCodeList = result.data.listObj || [];
                    } else{
                        this.proCodeList = this.proCodeList.concat(result.data.listObj || []);
                    }
                    if(this.proCodeList.length >= result.data.total){
                        this.isEnd = true;
                    }
                }
               this.initStatus();
            });
        },
        //添加优惠码(与用户绑定)
		addProCode: function () {
			if(!this.userAddProCode){
				Vue.utils.showTips('请输入优惠码');
				return;
			}
			var url = config.apiHost + '/api/promotion/referralCode/receive';
			var params = {
				"type": 2,
				"referralCode": this.userAddProCode,
				"ut": Vue.auth.getUserToken(),
				"platformId": 3	//微信(H5)
			}
			
			Vue.api.get(url, params, (res) => {
                this.pageNo = 1;
				this.getMyProCode();
				this.addProCodeShow = false;
			})
		},

        //计算无数据空白

        computerHeight:function(){
            this.height=window.screen.availHeight;
        },

        // 优惠券赠送好友
        clickShareToFriend:function (item,state) {
            //上一次请求还没有结束
            if(this.giving) return;
            var params = {
                ut: this.ut,
                marketingShareType:4,//营销分享类型 1.优惠券 2.来伊份券 3.来伊份卡 4.优惠码
                entityId:item.referralCodeId,//
                // entityCode:item.referralCode,//优惠码只传entityId
            };
            //请求设为进行中
            this.giving=true;
            Vue.api.postForm(config.apiHost + "/api/promotion/shareByType", params, (res)=>{
                //请求结束
                this.giving=false;
                // this.showShare = true;
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
                if(Vue.browser.weixin()){
                    Vue.weixin.weixinShare({
                        link: data.linkUrl,
                        title: data.title,
                        desc: data.content,
                        imgUrl: data.sharePicUrl
                    });
                }
                this.showShare = true;
            }
        },

        //切换 重置
        switchCode: function (index) {
            if(this.tabIndex == index) return;
            this.tabIndex = index;
            this.pageNo = 1;
            this.isEnd=false;
            this.proCodeIsVal = index;
            this.getMyProCode(true);
        },

        //初始化配置
        initStatus: function () {
            for(var i in this.proCodeList) {
                Vue.set(this.proCodeList[i], 'isFold', false);
            }
        },
    }
});
