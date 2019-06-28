myFunc(function() {
	updateSerivces();
	
	if (plus.os.name == "Android") {
        Intent = plus.android.importClass("android.content.Intent");
        File = plus.android.importClass("java.io.File");
        Uri = plus.android.importClass("android.net.Uri");
        main = plus.android.runtimeMainActivity();
	}
	
	//分享点击事件
	$(".share").on("tap", function() {
		var ids = [{
        	id: "weixin", 
        	ex: "WXSceneSession"  /*微信好友*/
    	}, {
        	id: "weixin",
        	ex: "WXSceneTimeline" /*微信朋友圈*/
    	}],
        bts = [{
            title: "发送给微信好友"
        }, {
            title: "分享到微信朋友圈"
        }];
		plus.nativeUI.actionSheet({
            cancel: "取消",
            buttons: bts
       	 	},
        	function(e) {
                var i = e.index;
                if (i > 0) {
                    shareAction(ids[i - 1].id, ids[i - 1].ex);
                }
        	}
		);
	})
	
	
	
});
	/**
    * 分享操作
    */
    function shareAction(id, ex) {
        var s = null;
        if (!id || !(s = shares[id])) {
            osg.toast("无效的分享服务！");
            return;
        }
        if (s.authenticated) {
            //已授权
            shareMessage(s, ex);
        } else {
            //未授权
            s.authorize(function() {
                shareMessage(s, ex);
            }, function(e) {
                osg.toast("认证授权失败");
            });
        }
    }
	/**
    * 发送分享消息
    */
    function shareMessage(s, ex) {
        var msg = {
            href: shareUrl,
            title: shareTitle,
            content: shareContent,
            thumbs: [sharePictures],
            pictures: [sharePictures],
            extra: {
                scene: ex
            }
        };
        s.send(msg, function() {
        	if(typeId){
		    	osg.ajax('favor/addShare', {
					'newsId': typeId
				}, function(data) {
					if(data>0){
						$('.shareNum').text(data);
					}
				}, {
					noload: true
				});
        	}
            osg.toast("分享成功!");
        }, function(e) {
            osg.toast("分享失败!");
        });
    }
	
	/**
     * 更新分享服务
     */
    function updateSerivces() {
        plus.share.getServices(function(s) {
            shares = {};
            for (var i in s) {
                var t = s[i];
                shares[t.id] = t;
            }
            console.log("获取分享服务列表成功");
        }, function(e) {
            console.log("获取分享服务列表失败：" + e.message);
        });
    }