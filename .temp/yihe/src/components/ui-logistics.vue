<template>
    <div class="address-container" style="overflow:auto" :class="{'show': show}">
        <header class="ui-header ui-header-stable ui-border-b">
            <i class="ui-icon-return" @click="hidePanel"></i>
            <h1>选择物流公司</h1>
        </header>
        <section class="ui-container">
            <div class="ui-form marT10">
                <div class="ui-form-item" style="height: 44px;line-height: 44px">
                    <input type="text" style="padding-left: 12px" v-model="name" placeholder="找不到您的快递公司请填写">
                </div>
            </div>
            <ul class="ui-list ui-list-text marT10">
                <li class="ui-border-t" v-if="name" @click="selectLogistics(name)">
                    <div class="ui-list-info">
                        <h4 class="ui-nowrap">{{name}}</h4>
                    </div>
                </li>
                <li class="ui-border-t" @click="selectLogistics(l.name)" v-for="l in logisticsList">
                    <div class="ui-list-info">
                        <h4 class="ui-nowrap">{{l.name}}</h4>
                    </div>
                </li>
            </ul>
        </section>
    </div>
</template>
<script>
import Vue from "vue";
import config from "../../env/config.js";

export default {
    data: function () {
        return {
            name: '',
            logisticsList: []
        };
    },
    props: ['show', 'selectedEvent'],
    watch: {
        "show": function (boo, oldBoo) {
            if(boo && this.logisticsList.length == 0) {
                this.getLogisticsList();
            }
        },
        "name": function () {
            this.getLogisticsList();
        }
    },
    methods: {
        //返回
        hidePanel: function () {
            this.show = false;
        },
        //查询物流公司
        getLogisticsList: function() {
            var url = config.apiHost + '/api/my/orderAfterSale/logistics';
            var params = {
                name: this.name,
                currentPage: 1,
                itemsPerPage: 100
            };
            Vue.api.postForm(url, params, (res) => {
                this.logisticsList = res.data;
            });
        },
        //选择物流公司
        selectLogistics: function (name) {
            if(typeof this.selectedEvent == 'function') {
                this.selectedEvent(name);
            }
            this.hidePanel();
        }
    }
}
</script>
