<template>
    <div class="ui-actionsheet" :class="{'show': show}" @click="hideActionsheet">
        <div class="ui-actionsheet-cnt ui-tel" @click="stopPropagation">
            <slot></slot>
            <button @click="hideActionsheet" class="ui-actionsheet-close">取消</button>
        </div>
    </div>
</template>
<script>
export default {
    props: ["show"],
    methods: {
        //隐藏菜单
        hideActionsheet: function () {
            this.show = false;
        },
        //阻止冒泡
        stopPropagation: function (e) {
            e.stopPropagation();
        }
    }
}
</script>
