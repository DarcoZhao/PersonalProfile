//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var Music = (function (_super) {
    __extends(Music, _super);
    function Music() {
        _super.call(this);
        this._touchStatus = false;
        this._pauseTime = 0;
        this.stageW = 640;
        this.xuanzhuan = 0;
        this._nScaleBase = 0;
        this.isplay = 0;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Music,p=c.prototype;
    p.onAddToStage = function (event) {
        this.loadSound();
    };
    //加载
    p.loadSound = function () {
        var sound = this._sound = new egret.Sound();
        ;
        //sound 加载完成监听
        sound.addEventListener(egret.Event.COMPLETE, function (e) {
            this.init();
        }, this);
        sound.load("resource/assets/Ref.wav");
    };
    //播放
    p.play = function () {
        //sound 播放会返回一个 SoundChannel 对象，暂停、音量等操作请控制此对象
        this._channel = this._sound.play(this._pauseTime, 1);
        this._channel.addEventListener(egret.Event.SOUND_COMPLETE, this.onComplete, this);
        this.addEventListener(egret.Event.ENTER_FRAME, this.onTimeUpdate, this);
        this.isplay = 1;
    };
    //停止
    p.stop = function () {
        if (this._channel) {
            this._channel.removeEventListener(egret.Event.SOUND_COMPLETE, this.onComplete, this);
            this.removeEventListener(egret.Event.ENTER_FRAME, this.onTimeUpdate, this);
            this._channel.stop();
            this._channel = null;
            this.isplay = 0;
        }
    };
    //播放完成
    p.onComplete = function (e) {
        this.stop();
    };
    //更新进度
    p.onTimeUpdate = function (e) {
        var position = this._channel ? this._channel.position : 0;
    };
    p.init = function () {
        var isplay = false;
        //play   
        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, function () {
            if (isplay == false) {
                this.play();
                isplay = true;
            }
            else if (isplay == true) {
                this.stop();
                isplay = false;
            }
        }, this);
    };
    return Music;
}(egret.DisplayObjectContainer));
egret.registerClass(Music,'Music');
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function (event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    p.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    p.createGameScene = function () {
        this.stageW = this.stage.stageWidth;
        this.stageH = this.stage.stageHeight;
        this.scrollRect = new egret.Rectangle(0, 0, this.stageW, this.stageH * 2);
        //this.cacheAsBitmap = true;   //？？？  缓存
        this.touchEnabled = true;
        this.starttouchY = 0;
        this.curPosY = 0;
        this.movedistance = 0;
        this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.startScroll, this);
        this.addEventListener(egret.TouchEvent.TOUCH_END, this.stopScroll, this);
        //Page1
        var page1 = new egret.DisplayObjectContainer;
        this.addChild(page1);
        page1.width = this.stageW;
        page1.height = this.stageH;
        page1.touchEnabled = true;
        //BG
        var bg1 = this.createBitmapByName("Green_jpg");
        page1.addChild(bg1);
        var stageW = this.stage.stageWidth;
        var stageH = this.stage.stageHeight;
        bg1.width = stageW;
        bg1.height = stageH;
        //黑色框
        var topMask = new egret.Shape();
        topMask.graphics.beginFill(0x000000, 0.85); //底色，透明度
        topMask.graphics.drawRect(0, 0, this.stageW, 120); //左上角原点，右正，下正
        topMask.graphics.endFill();
        topMask.y = 50;
        page1.addChild(topMask);
        egret.Tween.get(topMask).to({ alpha: 0 }, 1, egret.Ease.circIn).to({ alpha: 0.8 }, 3000, egret.Ease.sineIn);
        var icon = this.createBitmapByName("Icon_png");
        icon.alpha = 0.5;
        page1.addChild(icon);
        //icon.x = stageW / 2 - icon.width / 2;
        icon.x = 25;
        icon.y = stageH - icon.height - 20;
        egret.Tween.get(icon, { loop: true }).to({ alpha: 0.5, x: 25 }, 2000).
            to({ alpha: 1, x: 500 }, 2000).wait(500).
            to({ alpha: 0.5, x: 25 }, 2000).wait(500).
            to({ alpha: 1, x: 290 }, 2000, egret.Ease.sineIn).
            to({ alpha: 0.5, x: 500 }, 2000, egret.Ease.sineIn).
            to({ alpha: 1, x: 290 }, 2000, egret.Ease.sineIn).
            to({ alpha: 0.5, x: 25 }, 2000);
        var colorLabel0 = new egret.TextField();
        colorLabel0.textColor = 0x00000;
        colorLabel0.width = this.stageW - 172;
        colorLabel0.fontFamily = "KaiTi";
        colorLabel0.textAlign = "center";
        colorLabel0.text = "自我介绍有什么意思还是来聊聊食物好吗> <";
        colorLabel0.size = 32;
        colorLabel0.x = 90;
        colorLabel0.y = 900;
        colorLabel0.alpha = 0.5;
        page1.addChild(colorLabel0);
        egret.Tween.get(colorLabel0).to({ alpha: 1 }, 400, egret.Ease.sineIn).wait(2000).
            to({ alpha: 0 }, 800, egret.Ease.sineIn).wait(2000).
            to({ alpha: 1 }, 800, egret.Ease.sineIn);
        var line1 = new egret.Shape();
        line1.graphics.lineStyle(1, 0x333300);
        line1.graphics.moveTo(0, 18);
        line1.graphics.lineTo(0, 1050);
        line1.graphics.endFill();
        line1.x = 36;
        line1.y = 40;
        page1.addChild(line1);
        var line2 = new egret.Shape();
        line2.graphics.lineStyle(1, 0x333300); //线条格式一样显示不一样？？QAQ
        line2.graphics.moveTo(0, 18);
        line2.graphics.lineTo(0, 1050);
        line2.graphics.endFill();
        line2.x = 610;
        line2.y = 40;
        page1.addChild(line2);
        var colorLabell = new egret.TextField();
        colorLabell.textColor = 0xFFFFFF;
        colorLabell.width = this.stageW - 172;
        colorLabell.fontFamily = "KaiTi";
        colorLabell.textAlign = "center";
        colorLabell.text = "14081224";
        colorLabell.size = 48;
        colorLabell.x = stageW / 2 - colorLabell.width / 2;
        colorLabell.y = 100;
        page1.addChild(colorLabell);
        var colorLabel2 = new egret.TextField();
        colorLabel2.textColor = 0x000000;
        colorLabel2.alpha = 0;
        colorLabel2.width = this.stageW;
        colorLabel2.textAlign = "center";
        colorLabel2.text = "Slide to Continue";
        colorLabel2.size = 50;
        colorLabel2.x = 10;
        colorLabel2.y = 1600;
        page1.addChild(colorLabel2);
        egret.Tween.get(colorLabel2).to({ y: 950, alpha: 1 }, 1000, egret.Ease.sineIn);
        var textfield = new egret.TextField();
        //page1.addChild(textfield);
        textfield.alpha = 1;
        textfield.width = this.stageW - 172;
        textfield.textAlign = egret.HorizontalAlign.CENTER;
        textfield.size = 24;
        textfield.textColor = 0xffffff;
        textfield.x = 100;
        textfield.y = 135;
        this.textfield = textfield;
        var Singer = this.createBitmapByName("Mus_png");
        Singer.width = Singer.height = 120;
        var Song = new Music();
        page1.addChild(Song);
        Song.addChild(Singer);
        Song.x = 500;
        Song.y = 45;
        Song.addEventListener(egret.Event.ENTER_FRAME, function (evt) {
            switch (Song.isplay) {
                case 1:
                    break;
                case 0:
                    break;
            }
        }, this);
        //Page2
        var page2 = new egret.DisplayObjectContainer;
        page2.y = this.stageH;
        this.addChild(page2);
        page2.width = this.stageW; //this?
        page2.height = this.stageH;
        page2.touchEnabled = true;
        var bg2 = this.createBitmapByName("Shrimp_jpg");
        page2.addChild(bg2);
        var stageW02 = this.stage.stageWidth;
        var stageH02 = this.stage.stageHeight;
        bg2.width = stageW02;
        bg2.height = stageH02;
        var topMask2 = new egret.Shape();
        topMask2.graphics.beginFill(0x000000, 0.0);
        topMask2.graphics.drawRect(0, 120, this.stageW, 150);
        topMask2.graphics.endFill();
        page2.addChild(topMask2);
        topMask2.addEventListener(egret.TouchEvent.TOUCH_MOVE, function () {
            egret.Tween.get(topMask2).to({ alpha: 0 }, 1, egret.Ease.circIn).to({ alpha: 0.1 }, 2000, egret.Ease.circIn);
        }, this);
        var pic1 = this.createBitmapByName("AniS_jpg");
        page2.addChild(pic1);
        pic1.width = pic1.width * 0.3;
        pic1.height = pic1.height * 0.3;
        pic1.x = stageW / 2 - pic1.width / 2;
        pic1.y = stageH / 2 - 380;
        var Text1 = new egret.TextField();
        Text1.textColor = 0x333333;
        Text1.width = this.stageW - 172;
        Text1.textAlign = "center";
        Text1.fontFamily = "KaiTi";
        Text1.text = "Click";
        Text1.size = 60;
        Text1.x = 100;
        Text1.y = 55;
        page2.addChild(Text1);
        Text1.touchEnabled = true;
        Text1.addEventListener(egret.TouchEvent.TOUCH_TAP, function (evt) {
            Text1.text = "蟹粉豆腐", Text1.textColor = 0x990000;
        }, this);
        var Text2 = new egret.TextField();
        Text2.textColor = 0x000000;
        Text2.width = this.stageW - 172;
        Text2.fontFamily = "KaiTi";
        Text2.textAlign = "center";
        Text2.text = "想吃\n\n\n小笼包\n\n蒸凤爪\n\n榴莲酥\n\n奶黄包";
        Text2.size = 30;
        Text2.x = 100;
        Text2.y = 1100;
        page2.addChild(Text2);
        egret.Tween.get(Text2).to({ y: 360 }, 1000, egret.Ease.sineIn);
        var Text3 = new egret.TextField();
        Text3.textColor = 0x000000;
        Text3.width = this.stageW - 172;
        Text3.fontFamily = "KaiTi";
        Text3.textAlign = "center";
        Text3.text = "食物真是美好呀> <";
        Text3.size = 48;
        Text3.x = 90;
        Text3.y = 1000;
        Text3.alpha = 0;
        page2.addChild(Text3);
        egret.Tween.get(Text3).to({ alpha: 0.8 }, 1000, egret.Ease.sineIn);
        Text2.touchEnabled = true;
        Text2.addEventListener(egret.TouchEvent.TOUCH_TAP, function (evt) {
            Text2.textColor = 0x333333;
        }, this);
        //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
        // Get asynchronously a json configuration file according to name keyword. As for the property of name please refer to the configuration file of resources/resource.json.
        RES.getResAsync("description_json", this.startAnimation, this);
    };
    p.startScroll = function (e) {
        if ((this.scrollRect.y % this.stageH) != 0) {
            this.scrollRect.y = this.curPosY;
        }
        this.starttouchY = e.stageY;
        this.curPosY = this.scrollRect.y;
        this.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onScroll, this);
    };
    p.onScroll = function (e) {
        var rect = this.scrollRect;
        this.movedistance = this.starttouchY - e.stageY;
        rect.y = this.curPosY + this.movedistance;
        this.scrollRect = rect;
    };
    p.stopScroll = function (e) {
        var rect = this.scrollRect;
        if ((this.movedistance >= (this.stage.stageHeight / 4)) && this.curPosY != this.stageH) {
            rect.y = this.curPosY + this.stageH;
            this.scrollRect = rect;
            //this.scrollRect.y = this.currentpagePosY + this.stageH;  
            this.movedistance = 0;
        }
        else if ((this.movedistance <= (-(this.stage.stageHeight / 4))) && this.curPosY != 0) {
            rect.y = this.curPosY - this.stageH;
            this.scrollRect = rect;
            this.movedistance = 0;
        }
        else {
            this.movedistance = 0;
            rect.y = this.curPosY;
            this.scrollRect = rect;
        }
    };
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    p.startAnimation = function (result) {
        var self = this;
        var parser = new egret.HtmlTextParser();
        var textflowArr = [];
        for (var i = 0; i < result.length; i++) {
            textflowArr.push(parser.parser(result[i]));
        }
        var textfield = self.textfield;
        var count = -1;
        var change = function () {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            var lineArr = textflowArr[count];
            self.changeDescription(textfield, lineArr);
            var tw = egret.Tween.get(textfield);
            tw.to({ "alpha": 1 }, 200);
            tw.wait(2000);
            tw.to({ "alpha": 0 }, 200);
            tw.call(change, self);
        };
        change();
    };
    /**
     * 切换描述内容
     * Switch to described content
     */
    p.changeDescription = function (textfield, textFlow) {
        textfield.textFlow = textFlow;
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
//# sourceMappingURL=Main.js.map