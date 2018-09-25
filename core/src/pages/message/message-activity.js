import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        pageNo:1,
        pageSize:10,
        isEnd:false,
        noData:false,
        msgList:[]//消息列表
    },
    ready: function() {
        this.getMsgList();
        //滚动加载更多数据
        Vue.scrollLoading(() =>  {
            if (!this.isEnd) {
                this.pageNo += 1;
                this.getMsgList();
            }
        })
    },
    methods: {
        getMsgList:function(){
            var params = {
                ut: this.ut,
                isUpdate:true,
                pageNo:this.pageNo,
                pageSize:this.pageSize,
                messageType:2
            };
            Vue.api.get("/api/social/vl/message/getMsgList", params, (result) => {
                if(result.data){
                    if(result.data.data){
                        if(result.data.data.length>0){
                            this.msgList = this.msgList.concat(result.data.data);
                            if(result.data.data.length < this.pageSize && result.data.data.length !==0){
                                this.isEnd = true;
                            }
                        }else if(result.data.data.length == 0){
                            this.noData = true;
                        }
                    }else{
                        this.noData = true;
                    }

                }else{
                    this.noData = true;
                }


            });
        },
        goBack:function () {

                history.back();

        }

    }
});
