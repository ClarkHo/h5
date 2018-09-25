<template>
  <input @input="updateValue($event.target.value)">
</template>

<script>

var regexInteger = /^\d+$/;
var regexFloat = /^\d+(\.\d*)?$/;
var regexCurrency = /^\d+(\.\d{0,2})?$/;

/**
 * 只接受指定类型的数字输入框
 * 
 * samples:
 * <ui-number-input v-model="person.age" type="integer"></ui-number-input>
 * <ui-number-input v-model="distance" type="float"></ui-number-input>
 * <ui-number-input v-model="money" type="currency"></ui-number-input>
 */
export default {
    //type=integer，仅整数(默认)
    //type=float, 浮点数
    props: ["type"],
    data: function () {
        return {
            oldValue: ''
        }
    },
    ready: function () {
        this.oldValue = this.$el.value;
    },
    methods: {
        updateValue: function (value) {
            var formattedValue = value.trim();
            //空字符不处理
            if (!formattedValue) {
              return;
            }
           
            var validator = null;

            if (this.type == "integer") {
                validator = regexInteger;
            } else if (this.type == "float") {
                validator = regexFloat
            } else if (this.type == "currency") {
                validator = regexCurrency;
            }

             //如果输入无效就以上次有效的值替换
            if (validator && !validator.test(formattedValue)) {
                formattedValue = this.oldValue;
            } else {
                this.oldValue = formattedValue;
            }

            if (formattedValue != this.$el.value) {
                this.$el.value = formattedValue
            }
        }
   }
}
</script>

