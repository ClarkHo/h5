<template>
    <!-- <div :class="{'ui-reddot-s':show}"><slot></slot></div> -->
    <!--<div class="ui-badge-wrap"><slot></slot><div v-if="show" style="font-size: 10px;line-height: 12px;padding:0 2px;height:auto;top:3px;right:3px;min-width: 8px;" class="ui-badge-cornernum">{{count}}</div></div> -->
</template>
<script>
import Vue from "vue";
export default {
    data: function () {
        return {
            show: false,
            count: 0
        }
    },
    props: ['absolute', 'top', 'right'],
    ready: function (){
        this.init();
    },
    methods: {
        init: function () {
            if(Vue.auth.getUserToken()) {
                var url = '/api/social/vl/message/getMsgSummary?ut=' + Vue.auth.getUserToken() 
                    + '&companyId=' + Vue.mallSettings.getCompanyId()
                    + '&nocache=' + new Date().getTime();
                //不用统一处理，防止99跳登录
                Vue.http.get(url).then((result) => {
                    if(result.data && result.data.data && result.data.data.unReadMsgCount > 0) {
                        this.count = result.data.data.unReadMsgCount;
                        this.show = true;
                        $('body').append('<div style="position: '+ (this.absolute ? 'absolute':'fixed') +';top: '+(this.top ? this.top:'5')+'px;right: '+(this.right ? this.right:'5')+'px;min-width: 8px;padding: 0 2px;color: #fff; font-size: 10px;text-align:center;line-height: 12px;background-color: #f74c31;border-radius: 50%;z-index: 106">'+(this.count>99?99+'+':this.count)+'</div>');
                    }

                });
            }
        }
    }
}
</script>
