<template>
    <header class="ui-header ui-header-stable" :class="{'ui-border-b':!hideBorder}">
        <i class="ui-icon-return" @click="clickBack" v-if="!hideBack"></i>
        <!-- <a href="{{backUrl}}" v-if="backUrl"><i class="ui-icon-return"></i></a> -->
        <h1 v-cloak class="bold">{{title}}</h1>
        <slot></slot>
    </header>
</template>
<script>
import Vue from "vue";

export default {
    props: ["title", "hideBack", "backUrl", "backEvent", "appBack", 'hideBorder'],
    methods: {
        clickBack: function () {
             //调用app的回退
            if (Vue.browser.isApp() && this.appBack) {
                window.location.href = "${appSchema}://goback";
                return;
            }
          
            if(typeof this.backEvent == 'function') {
                this.backEvent();
            }else if (this.backUrl) {
                window.location.href = this.backUrl;
            } else {
                history.back();
            }
        }
    }
}
</script>
