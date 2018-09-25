<template>
    <input type="file" class="upload" :disabled="repeatDisabled" @change="upload($event)" @click="beforeUpload()">
</template>
<script>
import Vue from "vue";
 
export default {
    data: function () {
        return {
            repeatDisabled: false
        };
    },
    props: ["callback", "index"],
    methods: {
        beforeUpload: function (e) {
            //run in android app
            if (Vue.browser.isApp() && Vue.browser.android()) {
                var self = this;
                window.picchooseCallback = function (filepath) {
                    if (filepath && typeof self.callback == 'function') {
                        self.callback({filePath: filepath}, self.index);
                    }
                };

                window.location.href = "${appSchema}://picchoose";
            }
        },

        upload: function (e) {
            var self = this;
            //防止重复选择
            this.repeatDisabled = true;

            var _this = e.target;
            var file = _this.files[0];
            _this.value = '';
            var rFilter = /^(image\/bmp|image\/jpeg|image\/png)$/i;
            if(!rFilter.test(file.type)) {
                $.tips({
                    content: '只能上传jpg, png, bmp图片文件',
                    stayTime: 2000,
                    type: "warn"
                });
                this.repeatDisabled = false;
            }else {
                this.selectFileImage(file);
                this.previewImg(file);
            }
        },
        selectFileImage:function(file){
            var self = this;
            /* iphone下图片需要旋转 */
            //图片方向角 added by lzk  
            var orientation = null;  
            //var imageType = file.name.substring(file.name.lastIndexOf("/")+1,file.name.length).toLowerCase().split('.')[1];
            if (file) {  
                //获取照片方向角属性，用户旋转控制
                try{
                    EXIF.getData(file, function() {  
                        orientation = EXIF.getTag(file, 'Orientation');  
                    }); 
                }catch(err){
                    console.log(err);
                }
                var oReader = new FileReader();  
                oReader.onload = function(e) {  
                    var image = new Image();  
                    image.src = e.target.result;  
                    image.onload = function() {  
                        var expectWidth = this.naturalWidth;  
                        var expectHeight = this.naturalHeight;  
                        
                        if (this.naturalWidth > this.naturalHeight && this.naturalWidth > 800) {  
                            expectWidth = 800;  
                            expectHeight = expectWidth * this.naturalHeight / this.naturalWidth;  
                        } else if (this.naturalHeight > this.naturalWidth && this.naturalHeight > 1200) {  
                            expectHeight = 1200;  
                            expectWidth = expectHeight * this.naturalWidth / this.naturalHeight;  
                        }  
                        var canvas = document.createElement("canvas");  
                        var ctx = canvas.getContext("2d");  
                        canvas.width = expectWidth;  
                        canvas.height = expectHeight;  
                        ctx.drawImage(this, 0, 0, expectWidth, expectHeight);  
                        var base64 = null;  
                        //修复ios  
                        if (navigator.userAgent.match(/iphone/i)) {  
                            //如果方向角不为1，都需要进行旋转 added by lzk  
                            if(orientation != "" && orientation != 1){  
                                console.log('旋转'+orientation)
                                switch(orientation){  
                                    case 6://需要顺时针（向右）90度旋转  
                                        self.rotateImg(this,'left',canvas);  
                                        break;  
                                    case 3://需要180度旋转  
                                        self.rotateImg(this,'',canvas);  
                                        break;  
                                    case 8://需要270+270度旋转  
                                        self.rotateImg(this,'right',canvas);//转两次  
                                        self.rotateImg(this,'right',canvas);  
                                        break;  
                                }         
                            }  
                            base64 = canvas.toDataURL(file.type, 0.8);  
                        }
                        /* else if (navigator.userAgent.match(/Android/i)) {// 修复android  
                            var encoder = new JPEGEncoder();  
                            base64 = encoder.encode(ctx.getImageData(0, 0, expectWidth, expectHeight), 80);  
                        } */
                        else{  
                            if(orientation != "" && orientation != 1){  
                                switch(orientation){  
                                    case 6://需要顺时针（向右）90度旋转  
                                        self.rotateImg(this,'left',canvas);  
                                        break;  
                                    case 3://需要180度旋转  
                                        self.rotateImg(this,'',canvas);  
                                        break;  
                                    case 8://需要270+270度旋转  
                                        self.rotateImg(this,'right',canvas);//转两次  
                                        self.rotateImg(this,'right',canvas);  
                                        break;  
                                }         
                            }  
                            base64 = canvas.toDataURL(file.type, 0.8);  
                        }  
                        self.submit(base64);
                    };  
                };  
                oReader.readAsDataURL(file);  
            }  
        },
        //对图片旋转处理 added by lzk  
        rotateImg:function(img, direction,canvas) {    
            //alert(img);  
            //最小与最大旋转方向，图片旋转4次后回到原方向    
            var min_step = 0;    
            var max_step = 3;    
            //var img = document.getElementById(pid);    
            if (img == null)return;    
            //img的高度和宽度不能在img元素隐藏后获取，否则会出错    
            var height = img.height;    
            var width = img.width;    
            //var step = img.getAttribute('step');    
            var step = 2;    
            if (step == null) {    
                step = min_step;    
            }    
            if (direction == 'right') {    
                step++;    
                //旋转到原位置，即超过最大值    
                step > max_step && (step = min_step);    
            } else if(direction == 'left'){    
                step--;    
                step < min_step && (step = max_step);    
            }    
            //img.setAttribute('step', step);    
            /*var canvas = document.getElementById('pic_' + pid);   
            if (canvas == null) {   
                img.style.display = 'none';   
                canvas = document.createElement('canvas');   
                canvas.setAttribute('id', 'pic_' + pid);   
                img.parentNode.appendChild(canvas);   
            }  */  
            //旋转角度以弧度值为参数    
            var degree = step * 90 * Math.PI / 180;    
            var ctx = canvas.getContext('2d');    
            switch (step) {    
                case 0:    
                    canvas.width = width;    
                    canvas.height = height;    
                    ctx.drawImage(img, 0, 0);    
                    break;    
                case 1:    
                    canvas.width = height;    
                    canvas.height = width;    
                    ctx.rotate(degree);    
                    ctx.drawImage(img, 0, -height);    
                    break;    
                case 2:    
                    canvas.width = width;    
                    canvas.height = height;    
                    ctx.rotate(degree);    
                    ctx.drawImage(img, -width, -height);    
                    break;    
                case 3:    
                    canvas.width = height;    
                    canvas.height = width;    
                    ctx.rotate(degree);    
                    ctx.drawImage(img, -width, 0);    
                    break;    
            }    
        },
        //dataURL转换成blob二进制文件
        dataURLtoBlob:function(dataurl) {
            var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while(n--){
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], {type:mime});
        },
        //提交
        submit: function (base64) {
            var fd = new FormData(),suffix = '';
            //var fs = new File([file],'test.jpeg',{type:'image/jpeg'});
            //var tempFileName = file.name || '';
            // if(tempFileName.indexOf('.') <= -1){
            //     Vue.utils.showTips('文件格式错误');
            //     return;
            // } else{
            //     suffix = tempFileName.substring(tempFileName.lastIndexOf('.')+1)
            // }
            fd.append('file', base64);
            //fd.append('suffix', suffix);
            //fd.append("file",fs);
            //fd.append('suffix','jpeg')
            var xhr = new XMLHttpRequest();
            xhr.addEventListener("load", () => {
                this.repeatDisabled = false;
                try {
                    var resp = JSON.parse(xhr.responseText);
                    if(resp.code == 0) {
                        if(typeof this.callback == 'function') {
                            //此处为了兼容旧有接口数据格式
                            var url = {
                                filePath:(resp.data && resp.data.url) || ''
                            }
                            this.callback(url, this.index);
                        }
                    }else {
                        $.tips({
                            content: resp.message,
                            stayTime: 2000,
                            type: "warn"
                        });
                    }
                }catch(e) {
                    $.tips({
                        content: '服务器故障',
                        stayTime: 2000,
                        type: "warn"
                    });
                }
            }, false);
            xhr.addEventListener("error", function () {
                this.repeatDisabled = false;
                $.tips({
                    content: '上传失败',
                    stayTime: 2000,
                    type: "warn"
                });
            }, false);
            xhr.addEventListener("abort", function () {
                this.repeatDisabled = false;
                $.tips({
                    content: '上传被取消!',
                    stayTime: 2000,
                    type: "warn"
                });
            }, false);
            xhr.open("POST", '/api/fileUpload/putStringWithForm.do');
            xhr.send(fd);
        },
        //预览图片
        previewImg: function (file) {
            var reader = new FileReader();
            try {
                reader.readAsDataURL(file);
                reader.onload = (loadEvent) => {
                    var url = loadEvent.target.result;
                    var img = new Image();
                    img.src = url;

                    var base64Url = this.resizeMe(img, 200, 200);

                    if(base64Url.indexOf('base64') > 0) {
                        this.dataURLtoBlob(base64Url);
                        //this.submit(blob);
                        return;
                    }else {//红米note3 canvas不能获取绘制的图像
                        /* if(file.size > 2097152) {
                            $.tips({
                                content: '上传图片不能大于2M',
                                stayTime: 2000,
                                type: "warn"
                            });
                        }else {
                            //this.submit(file);?预览完提交?
                        } */
                    }
                }
            }catch(e){
                console.log('FileReader失败');
            }
        },
        //压缩图片大小
        resizeMe: function (img, max_width, max_height) {
            var canvas = document.createElement('canvas');

            var width = img.width;
            var height = img.height;

            // 宽高压缩
            /*if (width > height) {
                if (width > max_width) {
                    height = Math.round(height *= max_width / width);
                    width = max_width;
                }
            } else {
                if (height > max_height) {
                    width = Math.round(width *= max_height / height);
                    height = max_height;
                }
            }*/

            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            return canvas.toDataURL("image/jpeg", 0.3);
        }   
    }
}
</script>
