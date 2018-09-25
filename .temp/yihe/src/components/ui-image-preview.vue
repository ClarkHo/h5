<template>
    <div class="ui-image-viewer" :class="{'show': show}" @click="hideImageViewer">
        <h4 class="step"><em>{{currentindex+1}}</em>/{{evaluatepiclist.length}}</h4>
        <div class="image-wrap">
            <ul>
                <li v-for="item in evaluatepiclist" class="view-item" :class="{active: $index == currentindex}" v-touch:swipeleft="onSwipeLeft" v-touch:swiperight="onSwipeRight">
                    <img :src="item.picurl" alt="">
                    <div class="imageDetail">
                        <ul class="ui-list ui-list-text" style="background: transparent">
                            <li>
                                <h4 class="ui-nowrap">
                                    <p v-if="item.rate == 1">
                                        <i class="icons icons-star"></i>
                                        <i class="icons icons-star-gray"></i>
                                        <i class="icons icons-star-gray"></i>
                                        <i class="icons icons-star-gray"></i>
                                        <i class="icons icons-star-gray"></i>
                                    </p>
                                    <p v-if="item.rate == 2">
                                        <i class="icons incos-star"></i>
                                        <i class="icons icons-star"></i>
                                        <i class="icons icons-star-gray"></i>
                                        <i class="icons icons-star-gray"></i>
                                        <i class="icons icons-star-gray"></i>
                                    </p>
                                    <p v-if="item.rate == 3">
                                        <i class="icons icons-star"></i>
                                        <i class="icons icons-star"></i>
                                        <i class="icons icons-star"></i>
                                        <i class="icons icons-star-gray"></i>
                                        <i class="icons icons-star-gray"></i>
                                    </p>
                                    <p v-if="item.rate == 4">
                                        <i class="icons icons-star"></i>
                                        <i class="icons icons-star"></i>
                                        <i class="icons icons-star"></i>
                                        <i class="icons icons-star"></i>
                                        <i class="icons icons-star-gray"></i>
                                    </p>
                                    <p v-if="item.rate == 5">
                                        <i class="icons icons-star"></i>
                                        <i class="icons icons-star"></i>
                                        <i class="icons icons-star"></i>
                                        <i class="icons icons-star"></i>
                                        <i class="icons icons-star"></i>
                                    </p>
                                </h4>
                                <div class="ui-txt-info">
                                    <span class="f14 c9">{{item.userUsername || '匿名用户'}}</span>
                                </div>
                            </li>
                            <li class="pdTB0">
                                <h4>
                                    <span class="f12 cf">{{item.content}}</span>
                                </h4>
                            </li>
                            <li>
                                <h4 class="ui-nowrap"></h4>
                                <div class="ui-txt-info">
                                    <span class="f14 c9">{{item.orderCreateTime | date}}</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>
<style lang="less">
    .ui-image-viewer{
        position: fixed;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        background-color: rgba(0,0,0,0.9);
        z-index: 1000;
        display: none;

        &.show {
            display: block;
            .image-wrap{
                top: 20%;
            }
        }

        em {
            color: #fff;
            font-weight: bold;
        }


        .view-item {
            display: none;

            &.active {
                display: block;
            }
        }

        .step {
            text-align: center;
            padding: 10px 0;
            color: #fff;
        }

        img {
            width: 100%;
            transition: transform 1.2s ease-in-out;
            -webkit-transition: transform 1.2s ease-in-out;
            &.enlarge{
                transform:scale(1.2);
            }
        }

        .image-wrap{
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            transition: top 1.2s ease-in-out;
            -webkit-transition: top 1.2s ease-in-out;
        }

        .imageDetail{
            width: 100%;
            position: fixed;
            bottom: 0;
            left: 0;
            background: #000;
        }
    }

</style>
<script>
    import Vue from "vue";
    import config from "../../env/config.js";
    export default {
        props: ["show", "evaluatepiclist","currentindex","pageno","itemid"],
//        data: function () {
//            return {
//                currentindex: 0
//            }
//        },
        methods: {
            //隐藏菜单
            hideImageViewer: function () {
                this.$emit("close");
                this.show = false;
            },

            //左滑动
            onSwipeLeft: function () {
                if (!this.evaluatepiclist || this.evaluatepiclist.length < 2) {
                    return;
                }

                if (this.currentindex < (this.evaluatepiclist.length-1)) {
                    this.currentindex += 1;
                } else {
                    this.currentindex = 0;
//                    请求大图数据接口
//                      this.getPicList();
                }
            },
            // 获取晒图列表
            getPicList:function () {
                var params = {
                    mpId: this.itemid,
                    hasPic:1,
                    rateFlag:5,
                    pageNo:this.pageno,
                    pageSize:10
                };
                Vue.api.get("" + "/api/social/read/mpComment/getPicList", params, (result) => {
                    this.evaluatepiclist = this.evaluatepiclist.concat(result.data.listObj);
                });
            },
            //右滑动
            onSwipeRight: function () {
                if (!this.evaluatepiclist || this.evaluatepiclist.length < 2) {
                    return;
                }

                if (this.currentindex > 0) {
                    this.currentindex -= 1;
                } else {
                    this.currentindex = this.evaluatepiclist.length-1;
                }
            }
        }
    }
</script>
