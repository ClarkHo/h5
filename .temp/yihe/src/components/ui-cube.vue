<template>
    <div class="cube-wrapper clearB" >
        <div class="cube-case" :style="{ width: data.width}">
            <div class="cube-item" v-for="item in data.children" :style="{ float:item.cssFloat,width:item.width}">
                <div v-if="item.imgUrl" class="cube-img" :style="{float:item.cssFloat}">
                    <img v-link-to="item.link.data" v-lazy="item.imgUrl" alt="">
                </div>
                <div class=""  v-if="!!item.children" style="width: 100%;height: 100%">
                    <div v-for="itemc in item.children" class="cube-itemc" :style="{width:itemc.width,float:itemc.cssFloat}">
                        <div class="itemc-img" :style="">
                            <img v-link-to="itemc.link.data" v-lazy="itemc.imgUrl" alt="">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<style>
    .cube-wrapper{
        overflow: hidden;
    }
    .cube-wrapper img{
        width:100%;
        height:100%;
        display: block;
        border:0;
    }
</style>

<script>
    export default {
        data: function () {
            return {

            };
        },
        watch: {

        },
        props: ["data"],
        methods: {
        }
    }

</script>
