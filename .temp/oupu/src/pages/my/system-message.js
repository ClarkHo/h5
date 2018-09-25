import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        msgList: [],  //消息列表
        isUpdate: true,  //是否将消息未读状态改为已读状态
        pageNo: 1,
        pageSize: 10,
        companyId: Vue.mallSettings.getCompanyId(),
    },
    ready: function() {

        //获取消息列表
        this.getMsgList();

        // 滚动加载更多数据
        Vue.scrollLoading(() => {
            this.pageNo += 1;
            this.getMsgList();
        });
    },
    methods: {

        // 获取消息列表
        getMsgList: function() {
            var params = {
                ut: this.ut,
                isUpdate:this.isUpdate,
                pageNo:this.pageNo,
                pageSize:this.pageSize,
                companyId: this.companyId
            };
            Vue.api.get("" + "/api/social/vl/message/getMsgList", params, (result) => {
                if (result.data && result.data.data) {
                    this.msgList = this.msgList.concat(result.data.data);
                }
            });
        }

    }
});