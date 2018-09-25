import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiShare from"../../components/ui-share.vue";
import UiDropDown from "../../components/ui-drop-down.vue";
import config from "../../../env/config.js";

new Vue({
    el: 'body',
    components: {
        UiHeader,
        UiShare,
        UiDropDown
    },
    data: {
        patchgrouponList: [],//团列表
        currentTab: 0,//当前tab
        currentPage: 1,
        itemsPerPage: 10,//条数
        totalCount: 0,//总条数
        iShowShare: false,
        isApp: Vue.browser.isApp(),
        weixin: Vue.browser.weixin(),
        showShare: false,
        shareConfig: null,
        stopDropDown:false,
    },
    //初始化
    ready: function() {
        this.getGroupList();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            if (this.patchgrouponList.length < this.totalCount) {
                this.currentPage += 1;
                this.getGroupList();
            }
        });
        //记录上一页
        sessionStorage.prevPage = 'my-group';
    },
    methods: {
        dropDown: function () {
            this.currentPage = 1;
            this.patchgrouponList = [];
            this.getGroupList();
            setTimeout(() => {
                this.stopDropDown = true;
            }, 2000);
        },
        //我的团数据
        getGroupList: function() {
            if(this.currentTab == 0){
                //显示全部
                var params = {
                    ut: Vue.auth.getUserToken(),
                    //status: this.currentTab,//1:组团中；2：已成团；3：组团失败
                    currentPage: this.currentPage,
                    itemsPerPage: this.itemsPerPage
                };
            }else{
                var params = {
                    ut: Vue.auth.getUserToken(),
                    status: this.currentTab,//1:组团中；2：已成团；3：组团失败
                    currentPage: this.currentPage,
                    itemsPerPage: this.itemsPerPage
                };
            }
            Vue.api.get("/api/patchgroupon/getMyPatchGrouponInfo", params, (res) => {
                if(res.code == '0'){
                    this.totalCount = res.data.total;
                    if (res.data.listObj) {
                        this.patchgrouponList = this.patchgrouponList.concat(res.data.listObj);
                    }
                }
            });
        },
        //切换tab
        switchTab: function(tab) {
            if (this.currentTab != tab) {
                this.currentTab = tab;
                this.currentPage = 1;
                this.patchgrouponList = [];
                this.getGroupList();
            }
        },
        //点击分享
        clickShare: function (group) {
            var obj = {
                url: location.protocol + '//' + location.host + '/group/group-detail.html?instId='+group.patchGrouponInstId,
                title: '',
                description: '',
                pic: group.patchGrouponMainPicUrl
            }
            if(group.productInfo && group.productInfo[0]) {
                obj.title = '我买了“' + group.patchGrouponPrice +'元【' + group.productInfo[0].name + '】';
            }
            if(group.attendeeList) {
                obj.description = '还差'+(group.totalMembers-group.attendeeList.length)+'人 ' + (group.patchGrouponDesc || '');
            }
            //初始化微信分享信息
            Vue.weixin.weixinShare({
                link: obj.url,
                title: obj.title,
                desc: obj.description,
                imgUrl: obj.pic
            });


            this.h5OrAppShare(obj);
        },
        //H5分享APP分享
        h5OrAppShare: function (data) {
            if(Vue.browser.isApp()) {
                Vue.app.postMessage('share',{
                    url: data.url,
                    title: data.title,
                    description: data.description,
                    url160x160: data.pic,
                    pic: data.pic
                });
            }else {
                this.shareConfig = {
                    url: data.url,
                    title: data.title,
                    description: data.description,
                    pic: data.pic
                };
                this.showShare = true;
            }
        }
    }
});