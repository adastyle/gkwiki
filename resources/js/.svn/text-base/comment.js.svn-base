myFunc(function() {
	// 评论框相关操作
	$(".mui-scroll-wrapper").tap(function() {
		//$('#comment_content').blur();
	});
	setInterval(function() {
		$('.comment_div')[0].scrollIntoView(false);
	}, 100);

	/*发布评论的输入框监听事件*/
	mui('#comment_content')[0].addEventListener('input', function() {
		var content = $(this).val();
		if(content.length > 0) {
			$(this).parent().next().children(".comment_commentTimes").css({
				"display": "none"
			});
			$(this).parent().next().children(".icon-xiaoxi1").css({
				"display": "none"
			});
			$(this).parent().next().children(".comment_submit").css({
				"display": "inline"
			});
		} else {
			$(this).parent().next().children(".comment_commentTimes").css({
				"display": "inline"
			});
			$(this).parent().next().children(".icon-xiaoxi1").css({
				"display": "inline"
			});
			$(this).parent().next().children(".comment_submit").css({
				"display": "none"
			});
		}
	})
	/*发布评论*/
	$(".comment_submit").tap(function() {
		if(!osg.isLogined()) {
			osg.confirm("请登录！", function() {
				osg.open('../mine/login.html');
			});
		} else {
			submitComment();
			//隐藏发布按钮
			$(this).css({
				"display": "none"
			});
			$(this).parent().children(".comment_commentTimes").css({
				"display": "inline"
			});
			$(this).parent().children(".icon-xiaoxi1").css({
				"display": "inline"
			});
		}
	})

	/*$('#comment_content').keypress(function() {
		if(event.keyCode == 13) { // 换行，回车键盘
			if(!osg.isLogined()) {
				osg.confirm("请登录！", function() {
					osg.open('../mine/login.html');
				});
			} else {
				submitComment();
			}
		}
	});*/

	// 以下为滚动事件对菜单的控制逻辑
	mui('.mui-scroll-wrapper')[0].addEventListener("scroll", scrolled);
	var offtop = 0,
		cmed = false;

	function scrolled() {
		var t = $(".mui-scroll-wrapper").find(".mui-scroll"),
			offset = t.offset();
		offtop = offset.top - 64;
	}
	$(".comment_right").tap(function() {
		if(!cmed) {
			cmed = true;
			var scroll = mui('.mui-scroll-wrapper').scroll();
			scroll.reLayout();
			var t = $(".div_coments").offset().top,
				ch = $(".div_coments").height();
			var vh = plus.display.resolutionHeight;
			if(ch <= vh)
				scroll.scrollToBottom(100);
			else
				scroll.scrollTo(0, t * -1, 100);
		} else {
			cmed = false;
			var scroll = mui('.mui-scroll-wrapper').scroll();
			scroll.scrollTo(0, offtop, 100);
		}
	});
	//容器初始化
	var myscroll = $(".coment_scroll")[0];
	mui(myscroll).pullToRefresh({
		up: {
			auto: true,
			callback: function() {
				ptr = this;
				var nextPage;
				if(commentFpi) {
					nextPage = commentFpi.page + 1;
				} else {
					nextPage = 1;
				}
				findPage(nextPage, {
					'self': this
				});
			}
		},
	});
	//评论分页函数
	function findPage(page, param) {
		if(!param) {
			param = {};
		}
		param.self = ptr;
		var $commentList = $("#comment_list");
		osg.ajax('comment/query', {
			'page': page,
			'type|integer': type,
			'typeId': typeId
		}, function(data) {
			// 下拉的情况下，结束下拉刷新状态
			if(param.pullDown)
				param.self.endPullDownToRefresh();
			if(!data) {
				param.self.endPullUpToRefresh(true);
				return;
			}
			if(page == 1) {
				$commentList.html('');
			}
			commentFpi = data;
			for(var i = 0; i < data.data.length; i++) {
				var oneData = data.data[i];
				$('#comment_list').append(getItemComment(oneData));
				if(oneData.zaned) {
					$(".comment_zan[comment_id='" + oneData._id + "'] i").attr('class', 'iconfont icon-dianzan_dianji');
				}
			}
			param.self.endPullUpToRefresh(data.page >= data.pages);
		}, {
			noload: true
		});
	}
	// 评论条目模板
	var user = osg.currentUser();
	var comment1Obj = $('.comment_item');
	comment1Obj.remove().removeClass("debug");

	function getItemComment(oneData) {
		comentObj = comment1Obj.clone();
		if(oneData.userAvatar)
			comentObj.find('.comment_avatar').attr('src', qiniuRoot + oneData.userAvatar + "!user.avatar");
		else
			comentObj.find('.comment_avatar').attr('src', "../resources/images/avatar.png");
		comentObj.find('.comment_name').text(oneData.userName);
		comentObj.find('.comment_zan').attr('comment_id', oneData._id);
		if(oneData.rootUserName != null) {
			comentObj.find('.comment_name').html(oneData.userName + "<span>&nbsp;回复&nbsp;</span>" + oneData.rootUserName);
		}
		comentObj.find('.comment_content').html(oneData.realContent);
		comentObj.find('#comment_time').text(oneData.createTime);
		comentObj.find('#comment_dianzan').text(oneData.zanTimes);
		comentObj.find('.comment_zan').tap(function() {
			if(osg.isLogined()) {
				zanAjax(oneData._id, oneData.userId);
			} else {
				osg.confirm("请登录！", function() {
					osg.open('../mine/login.html');
				});
			}
		});
		comentObj.find('.comment_reply').data('data', oneData);
		return comentObj;
	}
	mui('.coment_scroll').on('tap', '.comment_reply', function(e) {
		var data = $(this).data('data');
		if(osg.isLogined()) {
			pid = data._id;
			$('#comment_content').focus();
		} else {
			osg.confirm("请登录！", function() {
				osg.open('../mine/login.html');
			});
		}
	});
	//点赞ajax函数
	function zanAjax(commentId, rootUserId) {
		osg.ajax('zan/addZan', {
			'typeId': commentId,
			'rootUserId': rootUserId,
			'type': '100'
		}, function(data) {
			$(".comment_zan[comment_id='" + commentId + "'] i").attr('class', 'iconfont icon-dianzan_dianji');
			$(".comment_zan[comment_id='" + commentId + "'] span").text(data);
		}, {
			noload: true
		});
	}
	// 提交评论
	function submitComment() {
		$('#comment_content').blur();
		var c = $("#comment_content").val();
		if(c != '' && c.length > 0) {
			osg.ajax('comment/add', {
				'type': type,
				'typeId': typeId,
				'parentId': pid,
				'realContent': c
			}, function(data) {
				$("#comment_content").val('');
				if(ptr) {
					ptr.refresh(true);
				}
				findPage(1);
				osg.toast("发布成功！");
			});
		}
	}
	//评论相关结束
});