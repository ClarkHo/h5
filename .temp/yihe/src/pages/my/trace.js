import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";

//浏览商品历史记录
const itemViewHistoryKey = "itemViewHistory";

var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        itemViewHistory: []
    },
    computed: {
        hasViewHistory: function () {
            return this.itemViewHistory && this.itemViewHistory.length > 0;
        }
    },
    ready: function() {
        console.log("ready")
        this.loadHistory();
    },
    methods: {
        //加载本地浏览记录
        loadHistory : function () {
            console.log("loadHistory")
            if (Vue.localStorage.contains(itemViewHistoryKey)) {
                this.itemViewHistory = Vue.localStorage.getItem(itemViewHistoryKey);
                console.log(this.itemViewHistory)
            }
        },

        //清空本地浏览记录
        clearHistory: function () {
            var dialog = $.dialog({
                title: "",
                content: "确定清空浏览记录？",
                button: ["取消", "确认"]
            });

            dialog.on("dialog:action", (e) => {
                //点击确定按钮
                if (e.index == 1) {
                    Vue.localStorage.removeItem(itemViewHistoryKey);   
                    this.itemViewHistory = [];              
                }
            });
        }
    }
});
