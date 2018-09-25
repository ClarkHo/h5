import Vue from "vue";
import UiHeader from "../components/ui-header.vue";
import config from "../../env/config.js";


const mpId = Vue.utils.paramsFormat(window.location.href).mpId;
var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        sizeList_attrs: [],  //规格列表
        sizeList: [],  //规格列表
        size_attrs:[],
        mpId: mpId,
        companyId: Vue.mallSettings.getCompanyId(),
        groupsInfoLoaded: false
    },
    ready: function() {
        this.getSizeList();
    },
    methods: {
        //规格list
        getSizeList: function() {
            var params = {
                mpId: this.mpId,
                companyId:this.companyId,
            };
            Vue.api.get("" + "/api/product/groupsInfo", params, (result) => {
                this.size_attrs = result.data.attrs || [];
                this.groupsInfoLoaded = true;
                // this.sizeList_attrs = this.sizeList_attrs.concat(result.data.attrs.attrs);
                // this.sizeList = result.data;

            });
        },
    }
});

