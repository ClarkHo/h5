import Vue from "vue";

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_YEAR = 365 * ONE_DAY;

/**
 * 日期格式化
 * 例{{ q.startTime | dateformat 'yyyy-MM-dd hh:mm:ss w' }} 返回 2016-11-16 14:40:25 周三
 */
Vue.filter('dateformat', function (value, fmt) {
    function format(value, fmt) {
        var date = new Date(value);
        var o = {
            "M+": date.getMonth() + 1, //月份
            "d+": date.getDate(), //日
            "h+": date.getHours(), //小时
            "m+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "w+": date.getDay(), //星期
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o) {
            if(k === 'w+') {
                if(o[k] === 0) {
                    fmt = fmt.replace('w', '周日');
                }else if(o[k] === 1) {
                    fmt = fmt.replace('w', '周一');
                }else if(o[k] === 2) {
                    fmt = fmt.replace('w', '周二');
                }else if(o[k] === 3) {
                    fmt = fmt.replace('w', '周三');
                }else if(o[k] === 4) {
                    fmt = fmt.replace('w', '周四');
                }else if(o[k] === 5) {
                    fmt = fmt.replace('w', '周五');
                }else if(o[k] === 6) {
                    fmt = fmt.replace('w', '周六');
                }
            }else if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }
    if(value) {
        value = format(value, fmt);
    }
    return value;
});

/**
 * 格式化日期
 * 例子：2016-08-01
 */
Vue.filter("date", function (date) {
    if (date) {
        var d = new Date(date);
        var arr = [d.getFullYear(), fmtNum(d.getMonth() + 1), fmtNum(d.getDate())];
        return arr.join("-");
    }
    return "";
});
Vue.filter("datedot", function (date) {
    if (date) {
        var d = new Date(date);
        var arr = [d.getFullYear(), fmtNum(d.getMonth() + 1), fmtNum(d.getDate())];
        return arr.join(".");
    }
    return "";
});

//格式化日期的格式为：2016.10.01
Vue.filter("date2", function (date) {
     if (date) {
        var d = new Date(date);
        var arr = [d.getFullYear(), fmtNum(d.getMonth() + 1), fmtNum(d.getDate())];
        return arr.join(".");
    }

    return "";
});
//格式化日期的格式为：11/21 23:00前
Vue.filter("preSellTime", function (date) {
     if (date) {
        var d = new Date(date);
        var time = fmtNum(d.getMonth() + 1) + '/' + fmtNum(d.getDate()) + ' ' + fmtNum(d.getHours()) + ':' + fmtNum(d.getMinutes()) + '前';
        return time;
    }

    return "";
});


Vue.filter("time", function (date) {
    if (date) {
        var d = new Date(date);
        var arr = [fmtNum(d.getHours()),fmtNum(d.getMinutes())];
        return arr.join(":");
    }

    return "";
});
Vue.filter("time2", function (date) {
    if (date) {
        var d = new Date(date);
        var arr = [fmtNum(d.getHours()),fmtNum(d.getMinutes()),fmtNum(d.getSeconds())];
        return arr.join(":");
    }

    return "";
});
//格式化时间  例如：2016-10-12 16:14
Vue.filter("dateTime", function (date) {
    return fmtDatetime(date);
});

//格式化日期对象为：2016-10-12 16:14
function fmtDatetime(date) {
     if (date) {
        var d = new Date(date);
        var arr1 = [d.getFullYear(), fmtNum(d.getMonth() + 1), fmtNum(d.getDate())];
        var arr2 = [fmtNum(d.getHours()),fmtNum(d.getMinutes())];
        return arr1.join("-")+' '+arr2.join(":");
    }

    return ""
}


function fmtNum(num) {
    return num >= 10 ? num : ("0" + num);
}

//格式date为相对时间格式,如：刚刚，10分钟前
Vue.filter("relativeTime", function (date) {
    if (!date) {
        return "";
    }

    var now = new Date().getTime();
    var d = new Date(date).getTime();
    var rtime = now - d;

    if (rtime < ONE_MINUTE) {
        //小于一分钟
        return "刚刚";
    } else if (rtime < ONE_HOUR) {
        //几分钟前
        return Math.floor(rtime / ONE_MINUTE) + "分钟前";
    } else if (rtime < ONE_DAY) {
        //几小时前
        return Math.floor(rtime / ONE_HOUR) + "小时前";
    } else if (rtime < ONE_DAY*2) {
        //昨天HH:MM
        var t = (rtime - ONE_DAY) / ONE_HOUR;
        var h = Math.floor(t);
        var m = Math.round((t-h) * 60); 
        return "昨天" + fmtNum(h) + ":" + fmtNum(m);        
    } else if(rtime < ONE_YEAR) {
        //几月几日 HH:MM
        var str = fmtDatetime(date);
        var yind = str.indexOf("-");
        return str.substr(yind + 1);
    } else {
        //2016-10-12 16:14
       return fmtDatetime(date);
    }
});


Vue.filter("dateMDMS", function (date) {
    if (date) {
        var d = new Date(date);
        var arr1 = [fmtNum(d.getMonth() + 1), fmtNum(d.getDate())];
        var arr2 = [fmtNum(d.getHours()),fmtNum(d.getMinutes())];
        return arr1.join("-")+' '+arr2.join(":");
    }

    return "";
});


