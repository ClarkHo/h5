<template>
    <div class="ui-dialog" :class="{show: show}">
        <div class="ui-dialog-cnt">
            <div class="ui-dialog-bd">
                <h4 v-if="options.title">{{options.title}}</h4>
                <div v-if="options.content">{{{options.content}}}</div>
            </div>
            <div class="ui-dialog-ft ui-btn-group">
                <button type="button" v-if="options.hasCancel" @click="hideDialog" class="select">取消</button>
                <button type="button" class="select" @click="clickOne">{{options.btnOne}}</button>
                <button type="button" class="select" v-if="options.btnTwo && options.clickTwo" @click="clickTwo">{{options.btnTwo}}</button>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    props: ["show", "options"],
    methods: {
        //隐藏菜单
        hideDialog: function () {
            this.show = false;
        },
        //点击确定
        clickOne: function () {
            if(typeof this.options.clickOne === 'function') {
                this.options.clickOne();
            }else {
                this.hideDialog();
            }
        },
        //点击第二个按钮
        clickTwo: function () {
            if(typeof this.options.clickTwo === 'function') {
                this.options.clickTwo();
            }
        }
    }
}
</script>
