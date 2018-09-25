import Vue from "vue";
import config from "../../../env/config.js";
import UiHeader from "../../components/ui-header.vue";


let urlParams = Vue.utils.paramsFormat(window.location.href);

new Vue({
    el: 'body',
    components: {
        UiHeader
    },
    data: {
        windowWidth: '365',
        windowHeight: '667',
        itemInfo: {},
        askObj: {},
        answerList:[],//回复列表
        pageNo:1,
        pageSize:10,
        isEnd:false,
        content:'',
        limitRight:false,//当前用户是否有权限回复问题
    },
    ready: function () {
        this.windowWidth = document.body.scrollWidth;
        this.windowHeight = document.body.scrollHeight;
        this.getAskObj();
        Vue.scrollLoading(() => {
            if (!this.isEnd) {
                this.pageNo += 1;
                this.getAskObj();
            }
        });
    },
    methods: {
        // getBaseInfo: function (params) {
        //     var url = config.apiHost + '/api/product/baseInfo';
        //     var params = {
        //         mpsIds: urlParams.mpId || '',
        //         platformId: config.platformId,
        //         areaCode: Vue.area.getArea().aC,
        //     }
        //     Vue.api.get(url, params, (res) => {
        //         if (res.data) {
        //             this.itemInfo = res.data[0];
        //         }
        //     })
        // },
        getAskObj:function (flag) {
            var url = config.apiHost + '/back-product-web/consultAppAction/getQaDetailList.do';
            var params = {
                consultItemId:urlParams.askId,
                currentPage:this.pageNo,
                itemsPerPage:this.pageSize
            }
            Vue.api.post(url, params, (res) => {
                if(res.data){
                    this.askObj = res.data;
                    if(flag){
                        this.answerList = res.data.listObj||[];
                    } else{
                        this.answerList = this.answerList.concat(res.data.listObj||[]);
                    }
                    if(this.pageSize > res.data.listObj.length){
                        this.isEnd = true;
                    }
                    this.getRightLimit();
                }
            })
        },
        answerQuestion:function (params) {
            if(!this.content){
                Vue.utils.showTips('请输入回复内容');
                return;
            }
            if(!this.limitRight){
                Vue.utils.showTips('暂无权限回答该问题哦~');
                return;
            }
            var url = config.apiHost + '/back-product-web/consultAppAction/answerTheConsult.do';
            var params = {
                consultItemId:urlParams.askId,
                consultHeaderId:this.askObj.consultHeaderId,
                content:this.content,
                isAvailable:1,
            }
            Vue.api.post(url, params, (res) => {
                this.pageNo = 1;
                this.getAskObj(true);
                Vue.utils.showTips('回复成功');
                this.content = '';
                this.getRightLimit();
            })
        },
        getRightLimit:function (params) {
            var url = config.apiHost + '/back-product-web/consultAppAction/validatePublish.do';
            var params = {
                headerType:1,//0 =咨询，1 =问答,默认是咨询
                merchantProductId:this.askObj.merchantProductId
            }
            Vue.api.post(url, params, (res) => {
                if(res.data) {
                    this.limitRight = res.data;
                }
            })
        }
    }
});