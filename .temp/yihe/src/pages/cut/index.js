import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiDropDown from "../../components/ui-drop-down.vue";
import config from "../../../env/config.js";

var vm;

vm = new Vue({
    el: 'body',
    components: { UiHeader,UiDropDown },
    data: {
    	pageNo: 1,
    	pageSize: 10,
        kanjiaList: [],
        totalCount: 0,
        nomore: false,
        isApp: Vue.browser.isApp(),
        weixin: Vue.browser.weixin(),
        stopDropDown:false,
        isEmpty:false
    },
    ready: function() {
        //初始化PageRestorer
        Vue.pageRestorer.init(this, "cut-index");
        //restore页面的内容
        if (!Vue.pageRestorer.restore()) {
            this.getKanjiaList();
        }

        //滚动加载更多数据
        Vue.scrollLoading(() => {
            //if (this.kanjiaList.length < this.totalCount) {
            if (this.pageNo*this.pageSize < this.totalCount) {
                this.pageNo += 1;
                this.getKanjiaList();
            }else {
                this.nomore = true;
            }
        });
    },
    methods: {
        dropDown: function () {
            this.pageNo = 1;
            this.kanjiaList = [];
            this.getKanjiaList();
            setTimeout(() => {
                this.stopDropDown = true;
            }, 2000);
        },
        //获取砍价列表
        getKanjiaList: function () {
        	var url = config.apiHost + '/api/promotion/cut/mplist';
        	var params = {
        		platformId: config.platformId,
        		currentPage: this.pageNo,
        		itemsPerPage: this.pageSize,
                areaCode: Vue.area.getArea().aC,
        	};
        	Vue.api.get(url, params, (res) => {
                if(res.data && res.data.listObj) {
                    for(var i in res.data.listObj) {
                        if(res.data.listObj[i].mpStock < 1) {
                            res.data.listObj[i].disabled = true;
                        }
                        if(!res.data.listObj[i].canAreaSold) {
                            res.data.listObj[i].bukeshou = true;
                        }
                    }
                    this.totalCount = res.data.total;
                    this.kanjiaList = this.kanjiaList.concat(res.data.listObj);
                    if(this.kanjiaList.length == 0){
                        this.isEmpty = true;
                    }
                }
        	});
        },
        //跳转活动详情
        createInst: function (kj) {
            var url = '/cut/detail.html?id=' + kj.id + '&state=' + kj.mpStatus;
            if(kj.canAreaSold) {
                location.href = url;
            }
        }
    }
});