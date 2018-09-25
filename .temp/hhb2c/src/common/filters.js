/**
 * Created by Roy on 16/8/18.
 */
import Vue from "vue";

Vue.filter("reverseArray", function (value, ignore) {
    "use strict";
    if (ignore) return value;
    if (value && value instanceof Array) {
        return value.reverse();
    }
    return value;
})
Vue.filter('cut', function (input, left) {
    var _in;
    if (_in = (input || 0) - 0) {
        _in = _in.toFixed(2);
        return left ? _in.split('.')[0] : _in.split('.')[1];
    }
    return '0';
});

Vue.filter('afterSaleType', function (value) {
    switch (value) {
        case 1:
            return "退款";
        case 2:
            return "退款退货";
        case 4:
            return "换货";
        default:
            return "";
    }
});
Vue.filter("hundredCut", function (money) {
    var moneyTemp = money;
    if(!money) return '0';
    if(money / 10000 < 1){
        return money
    } else {
        return Math.floor((money / 10000) * 100)/100 + '万';
    }
});
Vue.filter('specialMoney', function (value) {
    let newValue = (value * 100).toString();
    
    if(newValue < 10){
        newValue = '0' + newValue;
    }

    let intNum = newValue.substr(0,newValue.length-2)==''?'0':newValue.substr(0,newValue.length-2);

    let flaotNum = newValue.substr(newValue.length-2);

    return "<span class='f12 mgR2'>¥</span><span class='f20'>" + intNum + "</span>.<span class='f15'>" + flaotNum + "</span>"
});
//订单状态过滤
Vue.filter('orderStatus', function (value) {
    switch (value) {
        case 1:
            return "待付款";
        case 2:
            return "待发货";
        case 3:
            return "待收货";
        case 4:
            return "待评价";
        case 8:
            return "已完成";
        case 10:
            return "已取消";
        case 12:
            return "送货失败";
        case 20:
            return "可售后";
        case 25:
            return "可维修";
        default:
            return "";
    }
});
Vue.filter('numToString', function (value) {
    switch (value) {
        case 1:
            return "一";break;
        case 2:
            return "二";break;
        case 3:
            return "三";break;
        case 4:
            return "四";break;
        case 5:
            return "五";break;
        case 6:
            return "六";break;
        case 7:
            return "七";break;
        case 8:
            return "八";break;
        case 9:
            return "九";break;
        case 10:
            return "十";break;
        case 11:
            return "十一";break;
        case 12:
            return "十二";break;
        case 13:
            return "十三";break;
        case 14:
            return "十四";break;
        case 15:
            return "十五";break;
        case 16:
            return "十六";break;
        case 17:
            return "十七";break;
        case 18:
            return "十八";break;
        case 19:
            return "十九";break;
        case 20:
            return "二十";break;
        case 21:
            return "二十一";break;
        case 22:
            return "二十二";break;
        case 23:
            return "二十三";break;
        case 24:
            return "二十四";break;
        case 25:
            return "二十五";break;
        case 26:
            return "二十六";break;
        default:
            return "";
    }
});
// 去掉数据的前后空格
Vue.filter('selectItrim', function (value) {
    var str = trim(value);
    return str
});
//数组转换成string,系列属性专用
Vue.filter('arryToString', function (value) {
    var arr = [];
    if(value && value instanceof Array){
        value.forEach((sa) => {
            arr.push(sa.attrVal);
        });
    }
    return arr.length == 0 ? '请选择商品规格和数量' : arr.join("，");
});

function trim(s) {
    return s.replace(/(^\s*)|(\s*$)/g, "");
}
//过滤数组
Vue.filter('filterIgnore', function (attrs, ig, property) {
    "use strict";
    if (!(attrs instanceof Array) || attrs instanceof Array && attrs.length == 0) return '';
    var attr = [];
    attrs.forEach(function (v) {
        if (property) {
            if (v[property] != ig)
                attr.push(v);
        } else {
            if (v != ig)
                attr.push(v);
        }
    })
    return attr;

});
// 显示前三位、后三位，其余*号代替，加密手机号
Vue.filter('phoneFilter',function(val){
   if(val){
       return (val.substring(0,3) + '*'.repeat(val.length - 6) + val.substring(val.length-3,val.length));
   }
});
//自定义日期时间过滤器
/**
 * yyyy/MM/dd hh:mm:ss
 * yyyy年MM月dd日 hh时mm分ss秒 w
 */
Vue.filter('datetime', function (date, format) {
    "use strict";
    var weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    if (!date) return '';
    else if ((format || '').length == 0)
        return Vue.filter('date')(date);
    else {
        var t = new Date(date);
        var y = t.getYear() + 1900,
            M = t.getMonth() + 1,
            d = t.getDate(),
            w = t.getDay(),
            h = t.getHours(),
            m = t.getMinutes(),
            s = t.getSeconds();
        return format.replace(/(yyyy|YYYY)/, y)
            .replace(/MM/, M > 9 ? M : '0' + M)
            .replace(/(dd|DD)/, d > 9 ? d : '0' + d)
            .replace(/hh/, h > 9 ? h : '0' + h)
            .replace(/mm/, m > 9 ? m : '0' + m)
            .replace(/ss/, s > 9 ? s : '0' + s)
            .replace(/M/, M)
            .replace(/(w|W)/, weeks[w])
            .replace(/h/, h)
            .replace(/m/, m)
            .replace(/s/, s);
    }
});
/**
 * 图片size过滤器, 标准参数:'s','m','l','100x100','300x300'
 * 用法:
 * {{url|imgSize 'xs'}}
 * {{url|imgSize 's'}}
 * {{url|imgSize 'm'}}
 * {{url|imgSize 'l'}}
 * {{url|imgSize 'xl'}}
 * {{url|imgSize '200x200' 70}} 对应size,m,c,f
 */
Vue.filter('imgSize', (url, size, q) => {
    //非正常状态
    if (typeof url != 'string' || url == '' || typeof size != 'string') return url;

    let _url = '', //原图url
        _isKS = 0, //是否是金山云图
        _size = size.toLowerCase(),
        _sizes = ['xs', 's', 'm', 'l', 'xl'],
        _sizeMap = {
            'xs': '100',
            's': '200',
            'm': '300',
            'l': '400',
            'xl': '800'
        },
        reg1_1 = new RegExp('(http://images\\.laiyifen\\.com.*)_[sml](\\.jpg|\\.jpeg|\\.png|\\.gif)(\\?v.*)?$', 'i'), //来伊份格式_切过
        reg1_2 = new RegExp('(http://images\\.laiyifen\\.com.*)(\\.jpg|\\.jpeg|\\.png|\\.gif)$', 'i'), //来伊份格式_原图
        reg2_1 = new RegExp('(http://cdn\\.oudianyun\\.com.*|http://ds\\.cdn\\.oudianyun\\.com.*|http://ody\\.cdn\\.oudianyun\\.com.*)(\\.jpg|\\.jpeg|\\.png|\\.gif)(@base.*)', 'i'), //金山云格式_切过
        reg2_2 = new RegExp('(http://cdn\\.oudianyun\\.com.*|http://ds\\.cdn\\.oudianyun\\.com.*|http://ody\\.cdn\\.oudianyun\\.com.*)(\\.jpg|\\.jpeg|\\.png|\\.gif)$', 'i'); //金山云格式_原图

    //判断图源并获取原始图url
    if (reg1_1.test(url)) {
        _isKS = 1; //来伊份
        _url = url.replace(reg1_1, '$1$2');
    } else if (reg1_2.test(url)) {
        _isKS = 1; //来伊份
        _url = url.replace(reg1_2, '$1$2');
    } else if (reg2_1.test(url)) {
        _isKS = 2; //金山云
        _url = url.replace(reg2_1, '$1$2');
    } else if (reg2_2.test(url)) {
        _isKS = 2; //金山云
        _url = url.replace(reg2_2, '$1$2');
    } else {
        return url; //无法匹配已知图源,直接返回
    }

    //如果图是png格式, 使用原图, 因为对png进行裁剪性价比很低
    if (_url.indexOf('.png') >= 0 && ['xs', 's'].indexOf(_size) < 0) {
        return _url;
    }

    if (_isKS == 1) { //来伊份图
        var s = '';
        if (_size - 0) { //入参格式是?x?或?
            s = _size.split('x')[0] - 0;
            _size = s <= 200 ? 's' : s <= 400 ? 'm' : 'l';
        }
        if (_sizeMap[_size]) { //入参是xs|s|m|l|xl
            s = '_' + (_size == 'xs' ? 's' : _size == 'xl' ? 'l' : _size == 'l' ? 'm' : _size); //xs转为s,l转m, xl转为l
        }
        _url = _url.replace(reg1_2, '$1' + s + '$2?v=1.0');

    } else if (_isKS == 2) { //金山云图
        var newSize = '';
        if (_sizes.indexOf(_size) >= 0) { //入参是xs|s|m|l|xl
            _size = _sizeMap[_size];
        }
        if (_size - 0) { //入参格式是数值
            if (_size - 0) _size = _size + 'x' + _size; //如果输入size为纯数字,则默认拼接成?x?格式
            newSize = '@base@tag=imgScale&h=' + _size.split('x')[0] + '&w=' + _size.split('x')[1]; //h与w参数
            if (typeof q == 'number') newSize += '&q=' + q; //f参数
        }
        _url = _url.replace(reg2_2, '$1$2' + newSize);
    }

    return _url;
});
//千分隔断 两位小数
Vue.filter('numSeparator', function (val) {
    var int, num;
    if (!val) {
        return 0;
    } else {
        if (parseInt(val) == val) { //整数
            return val.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') + '.00';
        } else {
            num = val.toFixed(2);
            int = parseInt(val);
            return int.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') + num.slice(-3);
        }

    }
});