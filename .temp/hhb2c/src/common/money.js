/**
 * Created by dcl on 2016/7/30.
 */
import Vue from "vue";
/**
 * 格式化金额
 * 加入html元素显示特殊样式
 * 
 * 例子：<div v-money="pro.price"></div>
 * 结果：<div>￥<span class="mainprice">1550</span>.00</div>
 */
function currency(value) {
    value = parseFloat(value);
    if (!isFinite(value) || !value && value !== 0) return '';
    var stringified = Math.abs(value).toFixed(2);
    var _int = stringified.slice(0, -3);
    var _float = stringified.slice(-3);
    var sign = value < 0 ? '-' : '';
    return sign + '￥' + '<span class="mainprice">' + _int + '</span>' + _float;
}
Vue.directive("money", {
    bind: function(value) {
        //console.log(value);
    },
    update: function (value) {
        this.el.innerHTML = currency(value);
    }
});