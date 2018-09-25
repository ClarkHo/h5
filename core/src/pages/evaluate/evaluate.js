import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiDropDown from "../../components/ui-drop-down.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader,UiDropDown },
    data: {
        ut: Vue.auth.getUserToken(),

        evaluateStatus:0,
        commentList:[],
        picList:[],
        pageNo: 1,
        pageSize: 10,
        isEnd:false,
        stopDropDown:false//下拉刷新
    },
    computed: {
        //是不是没有评论数据
        noData: function () {
            return this.commentList.length == 0 && this.isEnd;
        }
    },
    ready: function() {
        this.getEvaluateList();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            if (!this.isEnd) {
                this.pageNo += 1;
                this.getEvaluateList();
            }
        });
    },
    methods: {
        dropDown: function () {
            this.pageNo = 1;
            this.pageSize = 10;
            this.isEnd = false;
            this.commentList=[];
            this.getEvaluateList();
            setTimeout(() => {
                this.stopDropDown = true;
            }, 2000);
        },
        switchTab: function (status) {
            if (status != this.evaluateStatus) {
                this.evaluateStatus = status;
                this.pageNo = 1;
                this.commentList = [];
                this.isEnd = false;
                this.getEvaluateList();
            }
        },
        //  - 获取我的评论列表
        getEvaluateList: function () {
            let params = {
                ut: this.ut,
                pageNo: this.pageNo,
                pageSize: this.pageSize,
                status: this.evaluateStatus
            };
            Vue.api.get("/api/social/read/comment/myCommentList", params, (result) => {
                let data = result.data || {};
                let commentList = data.commentList || [];

                if(commentList.length>0){
                    this.commentList = this.commentList.concat(data.commentList);
                } 

                 if(commentList.length < this.pageSize){
                    this.isEnd = true;
                }

            });
        },
        resizeImgHeight: function () {
            //console.log("=====================");
            Vue.nextTick(
                function(){
                    var w = $('.evaluate-img .ui-col img').width();
                    $('.evaluate-img .ui-col img').height(w);
                }
            )
        },
    }
});
