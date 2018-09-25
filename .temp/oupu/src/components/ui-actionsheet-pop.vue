<template>
    <div class="ui-actionsheet" :class="{'show': show}" @click="hideActionsheet">
        <div class="ui-actionsheet-cnt ui-pop" @click="stopPropagation">
            <div class="close" @click="hideActionsheet">×</div>
            <div class="tit" v-if="title">{{ title }}</div>
            <slot></slot>
        </div>
    </div>
</template>
<script>
export default {
    props: ["show", "title"],
    methods: {
        //隐藏菜单
        hideActionsheet: function () {
            this.$emit("close");
            this.show = false;
        },
        //阻止冒泡
        stopPropagation: function (e) {
            e.stopPropagation();
        }
    }
}
</script>
