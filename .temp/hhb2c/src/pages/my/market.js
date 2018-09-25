import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";


new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        //文章列表
        articles: [],
        //无文章数据
        noArticle: false,
        //当前选择tab的值（同type）
        currentTab: 1,
        pageNo: 1,
        pageSize: 4,
        totalCount: 0,
        titleQuery: '',
        type: 1,//默认总部 0:公共和我的
        status: 2,//总部、公共 我的不传
        keyword: ''
    },

    //初始化
    ready: function() {
        //url params
        let urlParams = Vue.utils.paramsFormat(window.location.href);
        //可以通过t参数指定初始化的tab
        switch (urlParams.t) {
            case "0":
            case "1":
            case "2":
                this.currentTab = urlParams.t;
                break;
        }
        //关键词
        if(urlParams.keyword){
            this.keyword = decodeURI(urlParams.keyword);
        }
        //加载首屏内容
        this.loadArticles();

        //滚动加载更多数据
        Vue.scrollLoading(() => {
            if (this.articles.length < this.totalCount) {
                this.pageNo += 1;
                this.loadArticles();
            }
        });

    },

    methods: {
        //加载文章数据
        loadArticles: function() {
            var params = {
                ut:Vue.auth.getUserToken(),
                //ut: '8582ccd17bf1429eadbb70abaabdc6e8',
                companyId: Vue.mallSettings.getCompanyId(),
                pageNo: this.pageNo,
                pageSize: this.pageSize
            };
            if(this.keyword){
                this.currentTab = -1;
                //文章查询
                params.titleQuery = this.keyword;
            }
            if(this.currentTab == 2){
                this.type = 0;
                //我的
                params.type = this.type;
            }else if(this.currentTab == 0 || this.currentTab == 1){
                //总部、公共
                this.type = this.currentTab;
                params.type = this.type;
                params.status = 2;
            }
            Vue.api.get("" + "/api/social/live/article/list", params, (result) => {
                this.totalCount = result.data.total;
                this.noArticle = this.totalCount == 0;
                if (result.data.listObj.length > 0) {
                    this.articles = this.articles.concat(result.data.listObj);
                }
            });
        },

        //切换tab
        switchTab: function(tab) {
            if (this.currentTab != tab) {
                this.currentTab = tab;
                this.pageNo = 1;
                this.noArticle = false;
                this.articles = [];
                //更新url的参数
                var url = tab >= 0 ? location.pathname + "?t=" + tab : location.pathname;
                window.history.replaceState(null, "", url);
                this.loadArticles();
            }
        },

        //搜索
        marketSearch: function(){
            if(!this.keyword) {
                $.tips({
                    content: '请输入相关文章',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            window.location.href = '/my/market.html?keyword='+this.keyword;
        },

        //删除我的文章
        deleteArticle: function (id) {
            var params = {
                ut:Vue.auth.getUserToken(),
                //ut: '8582ccd17bf1429eadbb70abaabdc6e8',
                companyId: Vue.mallSettings.getCompanyId(),
                ids: id
            }
            //接口中需要以form的形式提交，不能用post，json格式会出错
            Vue.api.postForm("" + "/api/social/live/article/deletelist", params, (result) => {
                $.tips({
                    content: '删除成功',
                    stayTime: 2000,
                    type: "warn"
                });
                this.articles = [];
                this.loadArticles();
            });
        }
    }
}).$watch('keyword',function(v){
    if(v.length == 0){
       this.switchTab(1);
    }
});
