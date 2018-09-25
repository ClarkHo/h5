<template>
    {{{display}}}
</template>
<script>
    export default {
        props:["start","end","current","show","callback","date"],
        data: function () {
            return {
                display: '',
                timeLeft: 0,
                timer: null
            }

        },
        ready:function(){
            this.timeLeft = this.end - this.current;
            this.countDown()
        },
        watch:{
            show:function(){
                if(this.show) {
                    this.timeLeft = this.end - this.current;
                    this.countDown()
                }
            }
        },
        methods: {
            getDisplay: function (t) {
                var d = 0, h = 0, m = 0, s = 0;
                if (t >= 0) {
                    d = Math.floor(t / 1000 / 60 / 60 / 24);
                    h = Math.floor(t / 1000 / 60 / 60 % 24);
                    m = Math.floor(t / 1000 / 60 % 60);
                    s = Math.floor(t / 1000 % 60);
                }
                if(this.date){
                    this.display= (d>0?("<i style=\"width:auto\">"+d + "</i>天"):'')+
                        "<i>"+ this.fmtTimeStr(h) + "</i>时"+
                        "<i>"+ this.fmtTimeStr(m) + "</i>分"+
                        (d>0?"":("<i>"+ this.fmtTimeStr(s) + "</i>秒"))
                } else{
                    this.display= (d>0?("<i style=\"width:auto\">"+d + "</i>:"):'')+
                        "<i>"+ this.fmtTimeStr(h) + "</i>:"+
                        "<i>"+ this.fmtTimeStr(m) + "</i>:"+
                        "<i>"+ this.fmtTimeStr(s) + "</i>";
                }
                
            },
            countDown:function () {
                // console.log(this.timeLeft)
                if (this.timeLeft % 1000 > 0) this.getDisplay(this.timeLeft + 1000);
                this.timeLeft  -= this.timeLeft % 1000
                setTimeout( () => {
                    if (this.timer) {
                    clearInterval(this.timer);
                    this.timer = null;
                }

                this.getDisplay(this.timeLeft)
                this.timer = setInterval( () => {
                            // console.log(this.timeLeft)
                            this.getDisplay(this.timeLeft -= 1000)
                if (this.timeLeft <= 0){
                    this.show = false;
                    clearInterval(this.timer)
                    if(typeof this.callback == 'function') {
                        this.callback();
                    }
                }
            }, 1000)
            }, this.timeLeft % 1000)

            },
            fmtTimeStr: function (t) {
                return t >= 10 ? t : "0" + t;
            }
        }
    }
</script>