/**
 *  响应式缩放
 * @param {Object} doc document
 * @param {Object} win window
 */
(function(doc, win) {
	var docEl = doc.documentElement,
		resizeEvt = 'orientationchange' in win ? 'orientationchange' : 'resize',
		recalc = function() {
			var clientWidth = docEl.clientWidth;
			if(!clientWidth) return;
			if(clientWidth >= 768) {
				//适配pad
				docEl.style.fontSize = 17 * (clientWidth / 768) + 'px';
			} else {
				//适配手机
				docEl.style.fontSize = 17 * (clientWidth / 375) + 'px';
			}
		};
	if(!doc.addEventListener) return;
	win.addEventListener(resizeEvt, recalc, false);
	doc.addEventListener('DOMContentLoaded', recalc, false);
	recalc();
})(document, window);

var qiniuRoot = 'http://qiniu.gaokaobaike.cn/',
	tokenExpire = false;

// 生产服务器地址
var rootUri = 'http://www.gaokaobaike.cn/gkwiki/r/';
// 测试服务器地址

//var rootUri = 'http://test.gaokaobaike.cn/gkwiki/r/';
//var rootUri = 'http://192.168.0.179:8080/gkwiki/r/';
//var rootUri = 'http://192.168.1.188:8080/gkwiki/r/';

var mainTitleBarBackgroundColor = "#008FD3", // 主界面导航条和状态条颜色
	defaultTitleBarBackgroundColor = "#FFF", // 其他二级页面导航条和状态条颜色
	mainStatusBarStyle = 'light', // 主界面状态条风格(文字颜色)
	defaultStatusBarStyle = 'dark'; // 其他二级页面状态条风格(文字颜色)

//var rootUri = 'http://59.110.155.181/gkwiki/r/';

// 缓存相关key
var cacheKeys = {
	user: '_currentUser',
	settings: '_settings',
	newsSearch: "_news_search", //新闻搜索历史记录
	ajaxForce: '_ajaxForce', // 缓存的网络请求，[{url,data,forceid}]
	downloads: '_downloads', // 下载的文件信息，[{type,typeId,title,url,duration,size}]
	intmdownloads: '_intmdownloads', // 下载的文件信息，[{_id,url,filename,downloadedSize,id}]
	ajaxCache: '_ajaxCache', // ajax请求缓存，{key(url+data):data}
	playTime: '_playTime' // 音视频播放时间缓存, {key(mediaId):time}
};

/**
 * 演示程序当前的 “注册/登录” 等操作，是基于 “本地存储” 完成的
 * 当您要参考这个演示程序进行相关 app 的开发时，
 * 请注意将相关方法调整成 “基于服务端Service” 的实现。
 **/
(function(mui, owner) {

	// 是否debug模式
	var debug = true;
	// 计数器
	var counter = 1;

	// App事件机制实现
	var evtCallbacks = [];
	/**
	 * 注册事件监听 
	 * @param {Object} func
	 */
	owner.evtAddListener = function(func) {
		evtCallbacks.push(func);
	}
	/**
	 * 调用当前webview所有事件监听回调
	 * @param {Object} d
	 */
	owner.evtCallListener = function(d) {
		for(var i = 0; i < evtCallbacks.length; i++)
			evtCallbacks[i](d);
	}
	/**
	 * 触发所有webview的事件监听
	 * @param {Object} d
	 */
	owner.evtFireEvent = function(d) {
		var wvs = plus.webview.all();
		for(var i = 0; i < wvs.length; i++) {
			wvs[i].evalJS("if(osg) osg.evtCallListener('" + d + "')");
		}
	}

	/**
	 * 退出当前用户登陆
	 */
	owner.logout = function() {
		owner.currentUserSet(null);
		owner.set(cacheKeys.ajaxForce, null);
	}

	/**
	 * 获取用户设置存储
	 * 
	 * @return {Object} 用户设置存储对象
	 */
	owner.setting = function() {
		return owner.getObj(cacheKeys.settings) || {};
	};

	/**
	 * 获取用户设置某个key的值
	 * 
	 * @param {Object} key
	 * @return {String} 指定key的用户设置值
	 */
	owner.settingValue = function(key) {
		return owner.setting()[key];
	};

	/**
	 * 设置用户设置选项
	 * 
	 * @param {Object} key
	 * @param {Object} val
	 */
	owner.settingSet = function(key, val) {
		var s = owner.setting();
		s[key] = val;
		owner.set(cacheKeys.settings, s);
	};

	/*c
	 * 删除用户设置选项
	 * 
	 * @param {Object} key
	 */
	owner.settingRemove = function(key) {
		var s = owner.setting();
		delete s[key];
		owner.set(cacheKeys.settings, s);
	};

	/**
	 * 获取本地持久化存储数据，Object格式
	 * 
	 * @param {Object} key
	 * @return {Object} 根据key获取持久化存储value对象格式
	 */
	owner.getObj = function(key) {
		var s = owner.get(key);
		if(s)
			s = JSON.parse(s);
		return s;
	};

	/**
	 * 获取本地持久化存储数据，String格式
	 * 
	 * @param {Object} key
	 * @return {String} 根据key获取持久化存储value字符串格式
	 */
	owner.get = function(key) {
		return localStorage.getItem(key);
	};

	/**
	 * 设置本地持久化存储数据，Object类型值将转换为JSON格式字符串存储
	 * 
	 * @param {Object} key
	 * @param {Object} val
	 */
	owner.set = function(key, val) {
		if(!val)
			localStorage.removeItem(key);
		else {
			if(typeof val != 'string')
				val = JSON.stringify(val);
			try {
				localStorage.setItem(key, val);
			} catch(e) {
				//TODO handle the exception
			}
		}
	};

	/**
	 * 当前是否已登陆
	 */
	owner.isLogined = function() {
		var u = owner.currentUser();
		if(u && u._id)
			return true;
		else
			return false;
	};

	/**
	 * 获取当前登陆用户信息
	 * 
	 * @return {Object}
	 * @return {Object} 当前登录用户对象
	 **/
	owner.currentUser = function() {
		var u = owner.getObj(cacheKeys.user);
		if(u) {
			return u.user;
		}
		return u;
	};
	/**
	 * 获取当前登陆用户token信息
	 * 
	 * @return {Object}
	 * @return {Object} 当前登录用户token信息
	 **/
	owner.currentToken = function() {
		var u = owner.getObj(cacheKeys.user);
		if(u) {
			return u.token;
		}
		return u;
	};

	/**
	 * 持久化存储当前登录用户信息对象
	 * 
	 * @param {Object} u
	 */
	owner.currentUserSet = function(u) {
		return owner.set(cacheKeys.user, u);
	};

	owner.networkState = function() {
		var types = {};
		types[plus.networkinfo.CONNECTION_UNKNOW] = "unknown";
		types[plus.networkinfo.CONNECTION_NONE] = "none";
		types[plus.networkinfo.CONNECTION_ETHERNET] = "ethernet";
		types[plus.networkinfo.CONNECTION_WIFI] = "wifi";
		types[plus.networkinfo.CONNECTION_CELL2G] = "2g";
		types[plus.networkinfo.CONNECTION_CELL3G] = "3g";
		types[plus.networkinfo.CONNECTION_CELL4G] = "4g";
		return types[plus.networkinfo.getCurrentType()];
	};

	/**
	 * 网络连接api
	 * 
	 * @param {Object} url 网络请求的url，'~'开头则保留原始url
	 * @param {Object} data
	 * @param {Object} callback
	 * @param {Object} options
	 * 		-method 		GET or POST
	 * 		-noload 		是否不显示加载中
	 * 		-force 		是否提交失败时，下次应用激活时再次尝试提交(只缓存url和data)
	 * 		-forceid 	本次请求的id，force为true时自动生成，下次请求时根据id判断是否同一请求
	 * 		-cache 		是否缓存此请求的返回结果，下次网络不可用或后天出错时直接返回缓存数据
	 * 		-disableBtns[]  禁用按钮列表(JQuery对象)，数据请求时禁用，返回时启用
	 */
	owner.ajax = function(url, data, callback, options) {
		var options = options || {};
		var method = options.method,
			noload = options.noload,
			force = options.force,
			forceid = options.forceid,
			cache = options.cache,
			disableBtns = options.disableBtns;
		// 已登录用户添加token参数
		var ct = owner.currentToken();
		if(ct && ct.access_token) {
			if(!data) {
				data = {};
			}
			data.access_token = ct.access_token;
		}
		method = method || 'POST';

		if(force) { // 如果提交失败，下次应用激活时再次尝试提交，则缓存当前提交信息
			var af = owner.get(cacheKeys.ajaxForce);
			if(!af) {
				af = [];
			} else {
				af = JSON.parse(af);
			}
			var rd = Math.random() + '';
			forceid = rd.substring(2);
			af.push({
				url: url,
				data: data,
				forceid: forceid
			});
			owner.set(cacheKeys.ajaxForce, af);
		}

		if(!url.startsWith('~')) {
			if(url.startsWith('/'))
				url = url.substring(1);
			url = rootUri + url;
		} else {
			url = url.substring(1);
		}

		var d = '';
		if(data) {
			for(var v in data) {
				d += encodeURI(v) + '=' + encodeURI(data[v]) + '&';
			}
		}
		if(d.endsWith('&'))
			d = d.substring(0, d.length - 1);

		var isGood = false; // 网络质量是否好
		var state = owner.networkState();
		if('none' == state) {
			var ic = false;
			if(cache) {
				var ac = owner.getObj(cacheKeys.ajaxCache);
				if(ac) {
					var key = url + d;
					var acv = ac[key];
					if(acv) {
						doAjaxCallback(callback, acv);
						ic = true;
					}
				}
			}
			if(!ic && !noload)
				osg.alert("无网络连接！");
			if(!ic && callback) {
				try {
					doAjaxCallback(callback, null);
				} catch(e) {}
			}
			return;
		} else if('wifi' == state) {
			isGood = true;
		}

		//alert(plus.device.imei); //设备的国际移动设备身份码
		// plus.device.imsi //设备的国际移动用户识别码
		// plus.device.model //设备的型号
		// plus.device.vendor // 设备的生产厂商
		// plus.device.uuid // 设备的唯一标识
		//alert(plus.os.language); // 系统语言信息, zh_CN
		//alert(plus.os.version); // 系统版本信息, 6.0.1
		//alert(plus.os.name); // 系统的名称, Android
		//alert(plus.os.vendor); // 系统的供应商信息, Google

		var xhr = new plus.net.XMLHttpRequest();
		xhr.onreadystatechange = function() {
			switch(xhr.readyState) {
				case 0:
					//alert("xhr请求已初始化");
					break;
				case 1:
					//alert("xhr请求已打开");
					break;
				case 2:
					//alert("xhr请求已发送");
					break;
				case 3:
					//alert("xhr请求已响应");
					if(!noload)
						osg.unload();
					if(disableBtns) {
						for(var j = 0; j < disableBtns.length; j++)
							disableBtns[j].enable();
					}
					break;
				case 4:
					if(!noload)
						osg.unload();
					if(disableBtns) {
						for(var j = 0; j < disableBtns.length; j++)
							disableBtns[j].enable();
					}
					if(xhr.status == 200) {
						//{"access_token":"186e9d26-4bcb-480d-8d20-112b70fa1148","token_type":"bearer","refresh_token":"9b90388f-bb20-42ad-b6c6-eac7b34705a0","expires_in":2590430}
						var data = xhr.responseText;
						if(xhr.responseText)
							try {
								data = JSON.parse(xhr.responseText);
							} catch(e) { /*ignore it*/ }
						if(debug)
							console.log("xhr请求返回：" + xhr.responseText);
						if(data.fl == "error") {
							owner.alert(data.me);
							return;
						}
						if(cache) {
							var ac = owner.getObj(cacheKeys.ajaxCache);
							if(!ac)
								ac = {};
							var key = url + d;
							ac[key] = data;
							osg.set(cacheKeys.ajaxCache, ac);
						}
						if(forceid) {
							var af = owner.get(cacheKeys.ajaxForce);
							if(af) {
								af = JSON.parse(af);
								for(var i = 0; i < af.length; i++) {
									var afd = af[i];
									if(afd.forceid == forceid) {
										af.remove(afd);
										osg.set(cacheKeys.ajaxForce, af);
										break;
									}
								}
							}
						}
						if(data.message && !data.success) {
							owner.alert(data.message);
							return;
						}

						doAjaxCallback(callback, data);
					} else if(xhr.status == 400) {
						// 后台抛出BaseException或其他类型异常
						var tk = JSON.parse(xhr.responseText);
						owner.alert(tk.errorMessage);
					} else {
						if(xhr.status == 401) {
							var tk = JSON.parse(xhr.responseText);
							if(tk.errorCode == 1003) { // token会话过期处理
								if(!tokenExpire && owner.currentUser()) {
									tokenExpire = true;
									//注销账号
									owner.currentUserSet(null);
									owner.closeMe();
									plus.webview.getLaunchWebview().show("pop-in");
									console.log("token会话过期");
									owner.toast("会话过期，请重新登陆!");
								}
							} else
								owner.alert("未授权的请求！");
						} else {
							if(debug)
								console.log("xhr请求失败：" + xhr.readyState + "：http state:" + xhr.status);
							if(!noload)
								owner.alert("网络请求失败！");
						}
					}
					break;
				default:
					break;
			}
		}
		if(!noload)
			osg.loading();
		if(disableBtns) {
			for(var j = 0; j < disableBtns.length; j++)
				disableBtns[j].disable();
		}
		if('GET' == method) {
			if(url.indexOf('?') == -1)
				url += '?';
			else
				url += '&';
			url += d;

			if(debug)
				console.log("GET:" + url);
			xhr.open(method, url);
		} else {
			if(debug) {
				console.log("POST:" + url);
				console.log("POST data:" + d);
			}
			xhr.open(method, url);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
			xhr.send(d);
		}

		function doAjaxCallback(_cb, _acv) {
			if(_cb) {
				_cb(_acv);
				$(".ahref a").each(function() {
					var $t = $(this);
					if(!$t.data("aed")) {
						$t.data("aed", true);
						var h = $t.attr("href");
						if(h) {
							$t.data("href", h);
							$t.attr("href", "javascript:void(0);");
							$t.tap(function() {
								var hr = $(this).data("href");
								if(hr)
									owner.openWithTitle(hr, 'de', null, '');
							});
						}
					}
				});
			}
		}

		//Basic Auth:获取登陆token
		//xhr.open("GET", "http://47.93.194.99:9180/oauth/oauth/token?grant_type=password&username=admin&password=123456");
		//xhr.setRequestHeader('Authorization', 'Basic ZWhNb2JpbGVDbGllbnQ6ZWhNb2JpbGU=');
		//xhr.send();

		//body为json数据格式，尚未验证成功！
		//xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
		//xhr.send('{"phone":"18612980491","password":"123456"}');
	};

	/**
	 * 创建Webview对象，如果已经存在则不重新创建
	 * 
	 * @param {Object} url
	 * @param {Object} id
	 * @param {Object} extras
	 */
	owner.createWebview = function(url, id, extras) {
		id = id || url;
		extras = extras || {};
		var wvs = plus.webview.all(),
			wv;
		for(var i = 0; i < wvs.length; i++) {
			if(wvs[i].id == id) {
				wv = wvs[i];
				break;
			}
		}
		if(!wv)
			wv = plus.webview.create(url, id, extras);
		return wv;
	};

	/**
	 * 打开新窗口
	 * 
	 * @example osg.open('regist.html');
	 * 
	 * @param {Object} url
	 * @param {Object} extras 打开窗口传参
	 * @param {Object} callbacks show->loading->rendering->loaded->rendered--->hide->show
	 * @param {Object} options
	 * 		-id 				窗口唯一id，默认为url
	 * 		-noSwipeBack 	是否禁用右划关闭窗口，true为禁用侧滑返回，默认不禁用
	 * 		-styles			其它自定义样式
	 * 		-notChangeStatusBar	是否不改变状态栏样式，默认改变
	 */
	owner.open = function(url, extras, callbacks, options) {
		var options = options || {};
		var id = options.id || url;
		extras = extras || {};
		extras.notChangeStatusBar = options.notChangeStatusBar;
		var styles = options.styles || {};
		styles.popGesture = options.noSwipeBack ? 'none' : 'hide';
		styles.videoFullscreen = 'landscape'; //视频全屏播放时为横屏，适用于android系统
		//styles.softinputMode = 'adjustResize';
		//		var cu = owner.currentUser;
		//		if(cu && cu.token && cu.token.access_token) {
		//			if(url.indexOf('?') == -1)
		//				url += '?';
		//			else
		//				url += '&';
		//			url += "access_token=" + cu.token.access_token;
		//		}

		var wv = mui.openWindow({
			url: url,
			id: id,
			preload: true,
			extras: extras,
			show: {
				aniShow: 'pop-in',
				duration: 250
			},
			styles: styles,
			waiting: {
				autoShow: false
			}
		});
		if(callbacks) {
			if(callbacks.loading)
				wv.addEventListener("loading", callbacks.loading, false);
			if(callbacks.rendering)
				wv.addEventListener("rendering", callbacks.rendering, false);
			if(callbacks.rendered)
				wv.addEventListener("rendered", callbacks.rendered, false);
			if(callbacks.loaded)
				wv.addEventListener("loaded", callbacks.loaded, false);
			if(callbacks.show)
				wv.addEventListener("show", callbacks.show, false);
			if(callbacks.hide) {
				wv.addEventListener("hide", callbacks.hide, false);
			}
		}

		// 隐藏时彻底关闭打开窗口，避免缓存导致页面内容不刷新的问题
		wv.addEventListener("hide", function() {
			// 主界面跳转过来，则恢复状态条和状态条文字颜色
			var main = plus.webview.getTopWebview();
			if(main && main.id == plus.runtime.appid) {
				main.evalJS("plus.navigator.setStatusBarStyle('" + mainStatusBarStyle + "');plus.navigator.setStatusBarBackground('" + mainTitleBarBackgroundColor + "');");
			}
			wv.close();
		}, false);
		//wv.show();
		return wv;
	};

	/**
	 * 打开原生新窗口
	 * 
	 * @example osg.openWithTitle('regist.html');
	 * 
	 * @param {Object} url
	 * @param {Object} id
	 * @param {Object} extras
	 * @param {Object} callbacks loading->rendering->loaded->rendered->show--->hide->show
	 */
	owner.openWithTitle = function(url, id, extras, title, callbacks) {
		id = id || url;
		extras = extras || {};
		title = title || '';
		if(title && title.length > 10)
			title = title.substring(0, 10) + '...';
		var wv = mui.openWindow({
			url: url,
			id: id,
			extras: extras,
			styles: {
				popGesture: 'hide',
				titleNView: {
					autoBackButton: false,
					backgroundColor: '#fff',
					titleColor: '#231815',
					titleText: title,
					splitLine: { // 标题栏控件的底部分割线，类似borderBottom
						color: "#ececec", // 分割线颜色,默认值为"#CCCCCC"
						height: "1px" // 分割线高度,默认值为"2px"
					},
					buttons: [{
						color: '#231815',
						float: 'left',
						fontSize: '24px',
						fontSrc: '/resources/fonts/iconfont.ttf',
						text: '\ue60e',
						onclick: function(evt) {
							osg.closeMe();
						}
					}]
				}
			}
		});
		if(callbacks) {
			if(callbacks.loading)
				wv.addEventListener("loading", callbacks.loading, false);
			if(callbacks.rendering)
				wv.addEventListener("rendering", callbacks.rendering, false);
			if(callbacks.rendered)
				wv.addEventListener("rendered", callbacks.rendered, false);
			if(callbacks.loaded)
				wv.addEventListener("loaded", callbacks.loaded, false);
			if(callbacks.show)
				wv.addEventListener("show", callbacks.show, false);
			if(callbacks.hide)
				wv.addEventListener("hide", callbacks.hide, false);
		}
		// 隐藏时彻底关闭打开窗口，避免缓存导致页面内容不刷新的问题
		wv.addEventListener("hide", function() {
			wv.close();
		}, false);
		return wv;
	}

	/**
	 * 关闭当前窗口
	 */
	owner.closeMe = function() {
		var ws = plus.webview.getDisplayWebview();
		//var ws = plus.webview.currentWebview();
		plus.webview.close(ws[0]);
	};

	/**
	 * 获取传入页面参数
	 * 
	 * @param {Object} key
	 */
	owner.param = function(key) {
		var data = plus.webview.currentWebview();
		return data[key];
	};

	/**
	 * toast消息组件
	 * 
	 * @param {Object} msg
	 */
	owner.toast = function(msg) {
		plus.nativeUI.toast(msg);
	};

	/**
	 * alert提示框组件
	 * 
	 * @param {Object} msg
	 * @param {Object} callback
	 */
	owner.alert = function(msg, callback) {
		mui.alert(msg, "提示", function() {
			if(callback) callback();
		});
	};

	/**
	 * confirm确认框组件
	 * 
	 * @param {Object} msg
	 * @param {Object} callback
	 */
	owner.confirm = function(msg, callback, cancelCallback) {
		mui.confirm(msg, '确认', function(e) {
			if(e.index == 1 && callback) callback();
			if(e.index == 0 && cancelCallback) cancelCallback();
		});
	};
	/*自定义提示信息*/
	owner.customConfirm = function(msg, changInfo, callback, cancelCallback) {
		mui.confirm(msg, changInfo, function(e) {
			if(e.index == 1 && callback) callback();
			if(e.index == 0 && cancelCallback) cancelCallback();
		});
	};

	/**
	 * 显示加载中
	 * 
	 * @param {Object} msg
	 */
	owner.loading = function(msg) {
		if(!msg)
			msg = "加载中...";
		plus.nativeUI.showWaiting(msg);
	};
	/**
	 * 隐藏加载中
	 */
	owner.unload = function() {
		plus.nativeUI.closeWaiting();
	};

	var shares;
	/**
	 * 分享
	 * 
	 * @param {Object} title
	 * @param {Object} href
	 * @param {Object} logo
	 */
	owner.share = function(title, href, logo, content, what, kind, callback) {
		if(!shares) { // 首次初始化
			shares = {};
			plus.share.getServices(function(s) {
				if(s && s.length > 0) {
					for(var i = 0; i < s.length; i++) {
						var t = s[i];
						shares[t.id] = t;
					}
				}
				shareKind(what, kind);
			}, function() {
				console.log("获取分享服务列表失败");
			});

		} else {
			shareKind(what, kind);
		}
		//var ids = [{
		//id: "weixin",
		//ex: "WXSceneSession"
		//}, {
		//id: "weixin",
		//ex: "WXSceneTimeline"
		//}/*, {
		//}, {
		//id: "sinaweibo"
		//}, {
		//id: "tencentweibo"
		//}, {
		//id: "qq"
		//}*/],
		//bts = [{
		//title: "发送给微信好友"
		//}, {
		//title: "分享到微信朋友圈"
		//}/*, {
		//title: "分享到新浪微博"
		//}, {
		//title: "分享到腾讯微博"
		//}, {
		//title: "分享到QQ"
		//}*/];

		//		plus.nativeUI.actionSheet({
		//			cancel: "取消",
		//			buttons: bts
		//		}, function(e) {
		//			var i = e.index;
		//			if(i > 0) {
		//				var s_id = ids[i - 1].id;
		//				var share = shares[s_id];
		//				if(share.authenticated) {
		//					shareMessage(share, ids[i - 1].ex, title, href, logo, content, callback);
		//				} else {
		//					share.authorize(function() {
		//						shareMessage(share, ids[i - 1].ex, title, href, logo, content, callback);
		//					}, function(e) {
		//						console.log("认证授权失败：" + e.code + " - " + e.message);
		//					});
		//				}
		//			}
		//		});

		function shareKind(sId, ex) { //id是weixin   ex 是[朋友圈 或者 好友]
			var s_id = sId;
			console.log(s_id)
			var shareB = shares[s_id];
			console.log(shareB);
			if(shareB.authenticated) { //用于标识此分享是否已经授权认证过，true表示已完成授权认证；false表示未完成授权认证。
				shareMessage(shareB, ex, title, href, logo, content, callback);
			} else {
				shareB.authorize(function() { //分享认证成功回调
					shareMessage(shareB, ex, title, href, logo, content, callback);
				}, function(e) { //分享认证失败回调
					console.log("认证授权失败：" + e.code + " - " + e.message);
				});
			}
		}

		function shareMessage(share, ex, title, href, logo, content, callback) {
			var msg = {
				extra: {
					scene: ex
				}
			};
			if(!href.startsWith('http'))
				href = rootUri + href;
			msg.href = href;
			msg.title = title;
			if(!content)
				content = title;
			if(content.length > 30)
				content = content.substring(0, 30);
			msg.content = content;
			if(~share.id.indexOf('weibo')) {
				msg.content += "";
			}
			msg.thumbs = [logo];
			share.send(msg, function() {
				if(callback)
					callback();
			}, function(e) {
				console.log("分享到\"" + share.description + "\"失败: " + e.code + " - " + e.message);
			});
		}
		//		if(!href.startsWith('http'))
		//			href = rootUri + href;
		//		plus.share.sendWithSystem({
		//			content: title,
		//			href: href
		//		}, function() {
		//			if(debug)
		//				console.log('分享成功，title:' + title + ";href:" + href + ";logo:" + logo);
		//		}, function(e) {
		//			if(debug)
		//				console.log('分享失败：' + JSON.stringify(e));
		//		});
	}

	/**
	 * 表单数据校验
	 * 
	 * @param {Object} id
	 */
	owner.validate = function(id) {
		var v = true,
			msg;
		$("#" + id + " input,#" + id + " [required='required']").each(function(i, o) {
			var value = o.value,
				lb = o.getAttribute('label');
			if(!lb)
				lb = '';
			if(v && (o.required || $(o).attr('required')) && (!value || value.trim() == '')) {
				v = false;
				msg = "请输入" + lb;
			}
			if(v && o.getAttribute('mobile')) {
				if(value) {
					v = (value.length == 11 && /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(18[0-9]{1})|(19[0-9]{1}))+\d{8})$/
						.test(value));
					if(!v)
						msg = '请输入正确的手机号';
				}
			}
			if(v && o.getAttribute('minlength')) {
				var ml = parseInt(o.getAttribute('minlength'));
				if(value) {
					if(value.length < ml) {
						v = false;
						msg = lb + '长度不能少于' + ml;
					}
				}
			}
			if(v && o.getAttribute('maxlength')) {
				var ml = parseInt(o.getAttribute('maxlength'));
				if(value) {
					if(value.length > ml) {
						v = false;
						msg = lb + '长度不能大于' + ml;
					}
				}
			}
			if(v && o.getAttribute('min')) {
				var ml = parseInt(o.getAttribute('min'));
				if(value) {
					if(parseInt(value) < ml) {
						v = false;
						msg = lb + '需大于' + ml;
					}
				}
			}
			if(v && o.getAttribute('max')) {
				var ml = parseInt(o.getAttribute('max'));
				if(value) {
					if(parseInt(value) > ml) {
						v = false;
						msg = lb + '需小于' + ml;
					}
				}
			}
		});
		if(!v && msg)
			owner.toast(msg);
		return v;
	};

	/**
	 * id: 播放按钮元素id
	 * playing:是否播放中;
	 * p:player对象id;
	 * btnEle:按钮对象
	 * url:音频url
	 * pauseCallback:暂停回调函数
	 */
	owner.audioList = {}, c = 1;
	owner.audioPauseAll = function(leave) {
		for(var o in owner.audioList) {
			var v = owner.audioList[o];
			if(v.playing && v.p && (!leave || v.id != leave)) {
				v.playing = false;
				v.p.jPlayer("pause");
				if(v.pauseCallback)
					v.pauseCallback(v.btnEle, v.url, v.p);
			}
		}
	}

	/**
	 * 音频Audio播放组件
	 * 
	 * @param {Object} btnEle
	 * @param {Object} url
	 * @param {Object} playCallback
	 * @param {Object} pauseCallback
	 * @param {Object} successCallback
	 * @param {Object} progressCallback
	 */
	owner.audio = function(btnEle, url, playCallback, pauseCallback, successCallback, progressCallback) {
		var id = btnEle.id || btnEle.name;
		if(!id) {
			id = c;
			c++;
			btnEle.id = id;
		}
		var pcache = owner.audioList[id];
		if(!pcache) {
			pcache = {};
			pcache.playing = false;
			owner.audioList[id] = pcache;
		}
		pcache.id = id;
		pcache.btnEle = btnEle;
		pcache.url = url;
		pcache.pauseCallback = pauseCallback;

		if(!pcache.p) {
			$("body").append('<div id="jp_' + id + '"></div>');
			$("#jp_" + id).jPlayer({
				ready: function() {
					pcache.p = $("#jp_" + id);
					pcache.p.jPlayer("setMedia", {
						mp3: url // Defines the mp3 url
					});
				},
				ended: function() {
					// 播放完成
					if(successCallback)
						successCallback(btnEle, url, pcache.p);
					pcache.playing = false;
					var pt = owner.get(cacheKeys.playTime);
					if(pt)
						pt = JSON.parse(pt);
					else
						pt = {};
					var dt = $(pcache.btnEle).data("data");
					if(dt && pt[dt._id]) {
						pt[pcache.url] = undefined;
						owner.set(cacheKeys.playTime, pt);
					}
				},
				timeupdate: function() {
					var dr = pcache.p.data('jPlayer').status.duration,
						tm = pcache.p.data('jPlayer').status.currentTime;
					var pt = owner.get(cacheKeys.playTime);
					if(pt)
						pt = JSON.parse(pt);
					else
						pt = {};

					var dt = $(pcache.btnEle).data("data"),
						cbd = false;
					if(dt) {
						if(tm == 0) {
							if(pt[dt._id]) {
								tm = pt[dt._id];
								cbd = true;
							}
						} else {
							pt[dt._id] = tm;
							owner.set(cacheKeys.playTime, pt);
						}
					}
					if(!cbd && progressCallback)
						progressCallback(btnEle, url, pcache.p, dr, tm);
				},
				error: function(event) {
					if(pcache.p) {
						if(pauseCallback)
							pauseCallback(btnEle, url, pcache.p, true);
						pcache.playing = false;
						pcache.p.jPlayer("pause");
					}
					//owner.alert("播放错误:" + event.jPlayer.error.message);
				}
			});
		}
		btnEle.addEventListener('tap', function(event) {
			if(!pcache.p) {
				owner.alert("音频不可用，请稍后重试！");
				return;
			}
			if(!pcache.playing) {
				pcache.playing = true;
				owner.audioPauseAll(pcache.id); // 暂停其它音频
				// 是否有上次播放进度缓存
				var pt = owner.get(cacheKeys.playTime);
				if(pt)
					pt = JSON.parse(pt);
				else
					pt = {};
				var dt = $(pcache.btnEle).data("data");
				if(dt && pt[dt._id]) {
					// 如果断点续播出错，则直接调用播放
					try {
						pcache.p.jPlayer("play", pt[dt._id]);
					} catch(e) {
						pcache.p.jPlayer("play");
					}
				} else
					pcache.p.jPlayer("play");
				if(playCallback)
					playCallback(btnEle, url, pcache.p);
			} else {
				if(pcache.p) {
					if(pauseCallback)
						pauseCallback(btnEle, url, pcache.p);
					pcache.playing = false;
					pcache.p.jPlayer("pause");
				}
			}
			// 禁止事件传递到父节点
			event.stopPropagation();
			return false;
		});
	};

	/**
	 * 视频Video播放组件
	 * 
	 * @param {Object} btnEle
	 * @param {Object} url
	 * @param {Object} options
	 * 			- playCallback		播放回调，function(btnEle, url, p)
	 * 			- pauseCallback		暂停回调，function(btnEle, url, p)
	 * 			- successCallback	播放完成回调，function(btnEle, url, p)
	 * 			- progressCallback	播放进度回调，function(btnEle, url, p, duration, position)
	 */
	owner.video = function(btnEle, url, options) {
		var options = options || {};
		var id = btnEle.id || btnEle.name,
			cover = btnEle.getAttribute("videoCover") || 'http://www.jplayer.org/video/poster/Big_Buck_Bunny_Trailer_480x270.png',
			jpid = 'jp_' + id,
			jpContainer = $(btnEle).parent();

		var jpcid = jpContainer.attr('id');
		if(!jpcid) {
			jpcid = "jp_container_" + counter;
			jpContainer.attr('id', jpcid);
			counter++;
		}

		var playCallback = options.playCallback,
			pauseCallback = options.pauseCallback,
			successCallback = options.successCallback,
			progressCallback = options.progressCallback;
		if(!id) {
			id = c;
			c++;
			btnEle.id = id;
		}
		var pcache = owner.audioList[id];
		if(!pcache) {
			pcache = {};
			pcache.playing = false;
			owner.audioList[id] = pcache;
		}
		pcache.id = id;
		pcache.btnEle = btnEle;
		pcache.url = url;
		pcache.pauseCallback = pauseCallback;
		if($("#" + jpid).length == 0)
			jpContainer.prepend('<div id="' + jpid + '"></div>');
		// 非ios系统需要播放器控件
		var ios = mui.os.ios,
			iosBar = !ios,
			ctr = true;
		var iosVer = mui.os.version;
		if(iosVer) {
			var ver = parseInt(iosVer.split('.')[0]);
			//			if(ver < 11)
			//				ctr = false;
		}

		if(ctr)
			jpContainer.append('<div class="jp-gui jp-controll-div"><div class="icon iconfont jp-play" role="button" tabindex="0"></div><div class="jp-bottom-bar"><div class="jp-current-time" role="timer" aria-label="time">&nbsp;</div><div class="jp-progress"><div class="jp-seek-bar"><div class="jp-play-bar"><div class="jp-play-bar-dot"></div></div></div></div><div class="jp-bottom-bar-right"><div class="jp-duration" role="timer" aria-label="duration">&nbsp;</div><div class="jp-full-screen"><i class="icon iconfont icon-full-screen"></i></div></div></div></div>');
		if(!pcache.p) {
			$("#" + jpid).jPlayer({
				cssSelectorAncestor: "#" + jpcid,
				supplied: "webmv, ogv, m4v",
				size: {
					width: "100%",
					height: "100%"
				},
				fullScreen: false,
				fullWindow: false,
				useStateClassSkin: true,
				smoothPlayBar: true,
				volume: 1,
				muted: false,
				autohide: {
					restored: iosBar,
					full: true,
					hold: 2000
				},
				ready: function() {
					pcache.p = $("#" + jpid);
					pcache.p.jPlayer("setMedia", {
						m4v: url,
						poster: cover
					});
					// 自动播放
					//					if(ios)
					//						pcache.p.jPlayer("play");
					//					else
					setTimeout(function() {
						pcache.p.jPlayer("play");
					}, 1200);
				},
				play: function() {
					if(pcache.p) {
						owner.audioPauseAll(pcache.id); // 暂停其它音频
						if(playCallback)
							playCallback(btnEle, url, pcache.p);
						pcache.playing = true;
					}
				},
				pause: function() {
					if(pcache.p) {
						if(pauseCallback)
							pauseCallback(btnEle, url, pcache.p);
						pcache.playing = false;
					}
				},
				ended: function() {
					// 播放完成
					if(successCallback)
						successCallback(btnEle, url, pcache.p);
					pcache.playing = false;

					var pt = owner.get(cacheKeys.playTime);
					if(pt)
						pt = JSON.parse(pt);
					else
						pt = {};
					var dt = $(pcache.btnEle).data("data");
					if(dt && pt[dt._id]) {
						pt[pcache.url] = undefined;
						owner.set(cacheKeys.playTime, pt);
					}
				},
				timeupdate: function() {
					var dr = pcache.p.data('jPlayer').status.duration,
						tm = pcache.p.data('jPlayer').status.currentTime;
					var pt = owner.get(cacheKeys.playTime);
					if(pt)
						pt = JSON.parse(pt);
					else
						pt = {};

					var dt = $(pcache.btnEle).data("data"),
						cbd = false;
					if(dt) {
						if(tm == 0) {
							if(pt[dt._id]) {
								tm = pt[dt._id];
								cbd = true;
							}
						} else {
							pt[dt._id] = tm;
							owner.set(cacheKeys.playTime, pt);
						}
					}
					if(!cbd && progressCallback)
						progressCallback(btnEle, url, pcache.p, dr, tm);
				},
				error: function(event) {
					if(pcache.p) {
						if(pauseCallback)
							pauseCallback(btnEle, url, pcache.p, true);
						pcache.playing = false;
						pcache.p.jPlayer("pause");
					}
					//owner.alert("播放错误:" + event.jPlayer.error.message);
				},
				resize: function(event) {
					if(plus)
						if($(".jp-state-full-screen").length == 1) {
							if(!pcache._pw) {
								pcache._ow = $(".jp-state-full-screen").width();
								pcache._oh = $(".jp-state-full-screen").height();
							}
							$(".jp-state-full-screen").width(plus.screen.resolutionHeight).height(plus.screen.resolutionWidth);
						} else {
							$('.div_img').width(pcache._ow).height(pcache._oh);
						}
				}
			});
		}
		btnEle.addEventListener('tap', function(event) {
			if(!pcache.p) {
				owner.alert("视频不可用，请稍后重试！");
				return;
			}
			if(!pcache.playing) {
				// 是否有上次播放进度缓存
				var pt = owner.get(cacheKeys.playTime);
				if(pt)
					pt = JSON.parse(pt);
				else
					pt = {};
				var dt = $(pcache.btnEle).data("data");
				if(dt && pt[dt._id]) {
					pcache.p.jPlayer("play", pt[dt._id]);
				} else
					pcache.p.jPlayer("play");
			} else {
				if(pcache.p) {
					pcache.p.jPlayer("pause");
				}
			}
			// 禁止事件传递到父节点
			event.stopPropagation();
			return false;
		});
	};

	/**
	 * 文件上传
	 * 
	 * @param {Array[String] or String} fps 一个或多个文件(数组)路径
	 * @param {function} callback
	 * @param {Object} options
	 * 		isPrivate - 是否私有资源库
	 * 		style - 七牛存储样式
	 */
	owner.uploadFile = function(fps, callback, options) {
		if(!options) options = {};
		var isPrivate = options.isPrivate,
			style = options.style;
		var task = plus.uploader.createUpload(rootUri +
			'file/upload', {
				method: "POST"
			},
			function(data, status) {
				console.log(JSON.stringify(status) + ":" + data.responseText)
				osg.unload();
				var returnData = JSON.parse(data.responseText);
				if(returnData.data) {
					var fileIds = new Array();
					for(var i = 0; i < returnData.data.length; i++) {
						var url = '';
						var urlVal = '';
						if(isPrivate == 'true' || isPrivate == true) {
							var urlTmp = returnData.data[i];
							urlTmp = urlTmp.split('~');
							url = urlTmp[1];
							urlVal = urlTmp[0];
						} else {
							url = qiniuRoot + returnData.data[i] + '!' + style;
							urlVal = returnData.data[i];
						}
						fileIds.push(urlVal);
					}
					if(callback) {
						callback(fileIds);
					}
				} else {
					if(callback) {
						callback(new Array());
					}
				}
			}
		);
		if(!(fps instanceof Array))
			fps = [fps];
		for(var k = 0; k < fps.length; k++) {
			var f = fps[k];
			if(mui.os.ios && f.indexOf('file://') != 0)
				f = 'file://' + f;
			task.addFile(f, {
				key: "myfile"
			});
		}
		//task.addData("access_token", osg.currentToken().access_token);
		task.setRequestHeader("isPrivate", isPrivate);
		task.setRequestHeader("style", style);
		osg.loading();
		task.start();
	}

	/**
	 * 录像视频
	 * 
	 * @param {Object} callback 视频选择后的回调
	 */
	owner.pickVideoFromCamera = function(callback) {
		var cmr = plus.camera.getCamera();
		cmr.startVideoCapture(function(path) {
			var fp = path;
			console.log("fp:" + fp); //如：fp:file:///storage/emulated/0/Pictures/Screenshots/Screenshot_2017-03-11-11-45-40.jpeg
			//plus.io.resolveLocalFileSystemURL 通过URL参数获取目录对象或文件对象
			//url 要操作文件或目录的URL地址
			plus.io.resolveLocalFileSystemURL(fp, function(entry) { //成功回调
				// 可通过entry对象操作test.html文件 
				entry.file(function(file) {
					addFile(file.fullPath);
				});

			});

			function addFile(f) {
				if(mui.os.ios && f.indexOf('file://') != 0)
					f = 'file://' + f;
				if(callback) {
					callback(f);
				}
			};
		}, function(e) {
			mui.toast('取消了选择');
		}, {
			filename: '_doc/camera/',
			index: 1
		});
	}

	/**
	 * 从相册选择视频
	 * 
	 * @param {Object} callback 视频选择后的回调
	 */
	owner.pickVideoFromGallery = function(callback) {
		plus.gallery.pick(
			function(path) {
				if(callback)
					callback(path);
			},
			function(e) {
				mui.toast('取消了选择');
			}, {
				multiple: false,
				filter: "video",
				system: false
			}
		);
	};

	/**
	 * 拍照选择图片
	 * 
	 * @param {Object} callback 图片选择回调
	 */
	owner.pickImageFromCamera = function(callback) { //outSet('开始拍照：');
		var cmr = plus.camera.getCamera();
		cmr.captureImage(function(path) { //图片路径 
			//遍历上传的图片
			var fp = path;
			console.log("fp:" + fp); //如：fp:file:///storage/emulated/0/Pictures/Screenshots/Screenshot_2017-03-11-11-45-40.jpeg
			//plus.io.resolveLocalFileSystemURL 通过URL参数获取目录对象或文件对象
			//url 要操作文件或目录的URL地址
			osg.compressImage(fp, callback);
		}, function(e) {
			mui.toast('取消了选择');
		}, {
			filename: '_doc/camera/',
			index: 1,
		});
	}

	/**
	 * 从相册选择图片
	 * 
	 * @param {Object} maxNum 总共最大上传几个
	 * @param {Object} callback 图片选择回调
	 */
	owner.pickImageFromGallery = function(maxNum, callback) {
		plus.gallery.pick(
			function(paths) {
				for(var k = 0; k < paths.files.length; k++) {
					var fp = paths.files[k];
					osg.compressImage(fp, callback);
				}
			},
			function(e) {
				mui.toast('取消了选择');
			}, {
				multiple: true,
				maximum: maxNum,
				filter: "image",
				system: false
			}
		);
	};

	owner.compressImage = function(fp, callback) {
		var sizeLimit = 600;
		sizeLimit = sizeLimit * 1024; // kb转换为字节数
		plus.io.resolveLocalFileSystemURL(fp, function(entry) { //成功回调
			// 可通过entry对象操作test.html文件 
			entry.file(function(file) {
				console.log('原始文件字节数：' + file.size);
				if(file.size > sizeLimit) { //1048576) {
					var fp = file.fullPath, //fullpath  目录操作对象的完整路径，文件系统的绝对路径
						nfp;
					var sc = sizeLimit / file.size,
						w = (sc + (1 - sc) * 0.7) * 100 + '%';
					if(!mui.os.ios) // android按照100%压缩，一般也是到500kb左右
						w = '100%';
					var rd = Math.random() + '';
					rd = rd.substring(2);
					if(mui.os.ios) {
						if(!fp.indexOf('file://') == 0)
							fp = 'file://' + fp;
						var dix = fp.lastIndexOf('.'),
							idx = fp.lastIndexOf('/'),
							nfp;
						nfp = fp.substring(0, idx) + '/' + rd + fp.substring(dix);
					} else {
						//convertLocalFileSystemURL 将本地URL路径转换成平台绝对路径
						nfp = plus.io.convertLocalFileSystemURL('_documents/' + rd + fp.substring(dix));
					}
					//图片压缩转换 
					//options 图片压缩转换的参数
					//图片压缩转换操作成功回调，操作成功时调用。
					//图片压缩转换操作失败回调，操作失败时调用。
					plus.zip.compressImage({
							src: fp,
							dst: nfp,
							width: w
						},
						function(event) { //图片压缩转换操作成功回调，操作成功时调用。
							//resolveLocalFileSystemURL通过URL参数获取目录对象或文件对象
							plus.io.resolveLocalFileSystemURL(event.target, function(entry) { //成功回调
								entry.file(function(file) {
									console.log('压缩后字节数:' + file.size + ';压缩比：' + w + "；地址:" + event.target);
								});
							});
							addFile(event.target);
						},
						function(error) { //图片压缩转换操作失败回调，操作失败时调用。
							addFile(fp);
							console.log('压缩失败:' + JSON.stringify(error));
						});
				} else {
					addFile(file.fullPath);
				}
			});
		});

		function addFile(f) {
			console.log(f);
			if(callback) {
				callback(f);
			}
		};
	}

	/**
	 * 文件下载api
	 * 
	 * @param {Object} url 下载文件地址
	 * @param {Object} callback 下载成功回调
	 * @param {Object} silent 是否静默模式下载文件，不显示下载信息
	 */
	owner.download = function(url, callback, silent) {
		var dtask = plus.downloader.createDownload(url, {}, function(d, status) {
			if(!silent)
				owner.unload();
			// 下载完成
			if(status == 200) {
				if(callback)
					callback(d.filename);
			} else {
				if(!silent)
					owner.toast("下载失败:" + status);
			}
		});
		dtask.addEventListener("statechanged", function(task, status) {
			if(!dtask) {
				return;
			}
			switch(task.state) {
				case 1: // 开始
					break;
				case 2: // 已连接到服务器
					if(!silent) {
						owner.loading('下载中');
						mui('body').progressbar({
							progress: 0
						}).show();
					}
					break;
				case 3: // 已接收到数据
					if(!silent) {
						var progress = parseInt(task.downloadedSize / task.totalSize * 100);
						mui('body').progressbar().setProgress(progress);
					}
					break;
				case 4: // 下载完成
					if(!silent) {
						owner.unload();
						mui('body').progressbar().hide();
						owner.toast("下载完成！");
					}
					break;
			}
		});
		dtask.start();
	};
}(mui, window.osg = {}));

(function(mui, doc) {
	mui.plusReady(function() {
		/**页面字体大小控制方法**/
		if(window.localStorage.getItem("new_Font")) {
			var localFont = window.localStorage.getItem("new_Font")
			$("html").css("font-size", localFont + "px");
		}
		plus.screen.lockOrientation('portrait-primary');

		// 主界面采用深背景浅文字，非主界面则相反(除fram嵌入页面 - tab-webview-subpage)
		var cid = plus.webview.currentWebview().id;
		if(cid.indexOf('tab-webview-subpage') == -1) {
			if(plus.runtime.appid != cid) {
				if('true' != osg.param('notChangeStatusBar') && !osg.param('notChangeStatusBar')) {
					// 设置系统状态栏文字为黑色
					plus.navigator.setStatusBarStyle(defaultStatusBarStyle);
					// 设置系统状态栏背景颜色
					plus.navigator.setStatusBarBackground(defaultTitleBarBackgroundColor);
				}
			} else { // 主窗口
				if('true' != osg.param('notChangeStatusBar') && !osg.param('notChangeStatusBar')) {
					// 设置系统状态栏文字为白色
					plus.navigator.setStatusBarStyle(mainStatusBarStyle);
					// 设置系统状态栏背景颜色
					plus.navigator.setStatusBarBackground(mainTitleBarBackgroundColor);
				}
			}
		}

		mui.init({
			swipeBack: false //启用右滑关闭功能
		});

		var oback = mui.back;
		mui.back = function(event) {
			// 暂停全部音频播放
			osg.audioPauseAll();
			// var cWebview = plus.webview.currentWebview();
			// 加这个导致重复关闭窗口了 plus.webview.close(cWebview);
			oback();
		};
	});
}(mui, document));

// Array扩展contains函数
Array.prototype.contains = function(val) {
	for(var i = 0; i < this.length; i++) {
		if(this[i] == val) {
			return true;
		}
	}
	return false;
};

if(typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function(prefix) {
		return this.slice(0, prefix.length) === prefix;
	};
}

if(typeof String.prototype.endsWith != 'function') {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}

Array.prototype.remove = function(b) {
	var a = this.indexOf(b);
	if(a >= 0) {
		this.splice(a, 1);
		return true;
	}
	return false;
};

Array.prototype.removeAt = function(i) {
	return this.splice(i, 1);
};

Array.prototype.insert = function(index, item) {
	this.splice(index, 0, item);
};

var newFont = 0;
try {
	document.getElementById("big").addEventListener("tap", function() {
		window.localStorage.removeItem("new_Font");
		newFont = 19;
		console.log(newFont)
		$("html").css("font-size", newFont + 'px');
		window.localStorage.setItem("new_Font", newFont);
	})
	document.getElementById("mid").addEventListener("tap", function() {
		window.localStorage.removeItem("new_Font");
		newFont = 17;
		console.log(newFont)
		$("html").css("font-size", newFont + 'px');
		window.localStorage.setItem("new_Font", newFont);
	})
	document.getElementById("small").addEventListener("tap", function() {
		window.localStorage.removeItem("new_Font");
		newFont = 15;
		$("html").css("font-size", newFont + 'px');
		window.localStorage.setItem("new_Font", newFont);
	})
} catch(e) {}

(function($) {
	$.fn.tap = function(func) {
		this.each(function() {
			if(func) {
				this.addEventListener("tap", func);
			} else
				$(this).click();
		});
	};
	$.fn.datepicker = function(options) {
		var $t = $(this);
		options = $.extend({
			"type": "date",
			"beginYear": 1990,
			"endYear": 2020
		}, options);
		$t.tap(function() {
			var _self = this;
			if($(this).hasClass('disabled'))
				return;
			if(_self.picker) {
				_self.picker.show(function(rs) {
					$t.text(rs.text);
					$t.val(rs.text);
					_self.picker.dispose();
					_self.picker = null;
				});
			} else {
				options.value = $t.text();
				_self.picker = new mui.DtPicker(options);
				_self.picker.show(function(rs) {
					$t.text(rs.text);
					$t.val(rs.text);
					_self.picker.dispose();
					_self.picker = null;
				});
			}
		});
	};
	$.fn.disable = function() {
		this.each(function(i) {
			$(this).find(':input,:checkbox,:radio,button,span').add(this).each(function() {
				var id = this.id,
					t = $(this);
				switch(this.tagName.toLowerCase()) {
					case 'span':
						t.addClass('disabled');
						break;
					case 'button':
					case 'textarea':
					case 'select':
					case 'input':
						this.disabled = true;
						break;
				}
			});
		});
	};
	$.fn.enable = function() {
		this.each(function(i) {
			$(this).find(':input,:checkbox,:radio,button,span').add(this).each(function() {
				var id = this.id,
					t = $(this);
				switch(this.tagName.toLowerCase()) {
					case 'span':
						t.removeClass('disabled', '');
						break;
					case 'button':
					case 'textarea':
					case 'select':
					case 'input':
						this.disabled = null;
						break;
				}
			});
		});
	};
})(jQuery);

function myFunc(func, preScroll) {
	$()
		.ready(
			function() {
				// 参考自：http://ask.dcloud.net.cn/article/422
				var immersed = 0;
				var ms = (/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
				if(ms && ms.length >= 3) { // 当前环境为沉浸式状态栏模式
					immersed = parseFloat(ms[2]); // 获取状态栏的高度
				}

				mui.init();
				mui.plusReady(function() {
					if(mui.os.ios) {
						var web = plus.ios.currentWebview();
						var scr = plus.ios.getAttribute(web, "scrollView");
						plus.ios.setAttribute(scr, "contentInsetAdjustmentBehavior", "0");
					}
					var cid = plus.webview.currentWebview().id;
					if(immersed > 0) {
						//if(mui.os.ios && plus.display.resolutionHeight > 750) //iphoneX 768、iphone8 plus 716
						//	immersed += 10;
						var t = $('header');
						t.css('padding-top', immersed + 'px');
						var tn = t.next(),
							td = t.siblings('.dock');
						if(tn.attr('top') != 'true')
							//if(cid.indexOf('tab-webview-subpage') == -1)
							if(!tn.hasClass('mui-content'))
								tn.css('margin-top', (immersed + 44) + 'px');
							else {
								tn.children().css('margin-top', immersed + 'px');
							}
						if(td.attr('top') != 'true')
							//if(cid.indexOf('tab-webview-subpage') == -1)
							if(!td.hasClass('mui-content'))
								td.css('margin-top', (immersed + 44) + 'px');
							else {
								td.children().css('margin-top', immersed + 'px');
							}
					}

					if(preScroll)
						mui('.mui-scroll-wrapper').scroll({
							//indicators: true
						});

					func();

					if(!preScroll)
						mui('.mui-scroll-wrapper').scroll({
							//indicators: true
						});

				});
			});
}

var idCardNoUtil = {

	provinceAndCitys: {
		11: "北京",
		12: "天津",
		13: "河北",
		14: "山西",
		15: "内蒙古",
		21: "辽宁",
		22: "吉林",
		23: "黑龙江",
		31: "上海",
		32: "江苏",
		33: "浙江",
		34: "安徽",
		35: "福建",
		36: "江西",
		37: "山东",
		41: "河南",
		42: "湖北",
		43: "湖南",
		44: "广东",
		45: "广西",
		46: "海南",
		50: "重庆",
		51: "四川",
		52: "贵州",
		53: "云南",
		54: "西藏",
		61: "陕西",
		62: "甘肃",
		63: "青海",
		64: "宁夏",
		65: "新疆",
		71: "台湾",
		81: "香港",
		82: "澳门",
		91: "国外"
	},
	powers: ["7", "9", "10", "5", "8", "4", "2", "1", "6", "3", "7", "9",
		"10", "5", "8", "4", "2"
	],
	parityBit: ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"],
	genders: {
		male: "男",
		female: "女"
	},
	checkAddressCode: function(addressCode) {
		var check = /^[1-9]\d{5}$/.test(addressCode);
		if(!check)
			return false;
		if(idCardNoUtil.provinceAndCitys[parseInt(addressCode.substring(0, 2))]) {
			return true;
		} else {
			return false;
		}
	},
	checkBirthDayCode: function(birDayCode) {
		var check = /^[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))$/
			.test(birDayCode);
		if(!check)
			return false;
		var yyyy = parseInt(birDayCode.substring(0, 4), 10);
		var mm = parseInt(birDayCode.substring(4, 6), 10);
		var dd = parseInt(birDayCode.substring(6), 10);
		var xdata = new Date(yyyy, mm - 1, dd);
		if(xdata > new Date()) {
			return false; // 生日不能大于当前日期
		} else if((xdata.getFullYear() == yyyy) &&
			(xdata.getMonth() == mm - 1) && (xdata.getDate() == dd)) {
			return true;
		} else {
			return false;
		}
	},
	getParityBit: function(idCardNo) {
		var id17 = idCardNo.substring(0, 17);

		var power = 0;
		for(var i = 0; i < 17; i++) {
			power += parseInt(id17.charAt(i), 10) *
				parseInt(idCardNoUtil.powers[i]);
		}

		var mod = power % 11;
		return idCardNoUtil.parityBit[mod];
	},
	checkParityBit: function(idCardNo) {
		var parityBit = idCardNo.charAt(17).toUpperCase();
		if(idCardNoUtil.getParityBit(idCardNo) == parityBit) {
			return true;
		} else {
			return false;
		}
	},
	checkIdCardNo: function(idCardNo) {
		// 15位和18位身份证号码的基本校验
		var check = /^\d{15}|(\d{17}(\d|x|X))$/.test(idCardNo);
		if(!check)
			return false;
		// 判断长度为15位或18位
		if(idCardNo.length == 15) {
			return idCardNoUtil.check15IdCardNo(idCardNo);
		} else if(idCardNo.length == 18) {
			return idCardNoUtil.check18IdCardNo(idCardNo);
		} else {
			return false;
		}
	},

	// 校验15位的身份证号码
	check15IdCardNo: function(idCardNo) {
		// 15位身份证号码的基本校验
		var check = /^[1-9]\d{7}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}$/
			.test(idCardNo);
		if(!check)
			return false;
		// 校验地址码
		var addressCode = idCardNo.substring(0, 6);
		check = idCardNoUtil.checkAddressCode(addressCode);
		if(!check)
			return false;
		var birDayCode = '19' + idCardNo.substring(6, 12);
		// 校验日期码
		return idCardNoUtil.checkBirthDayCode(birDayCode);
	},

	// 校验18位的身份证号码
	check18IdCardNo: function(idCardNo) {
		// 18位身份证号码的基本格式校验
		var check = /^[1-9]\d{5}[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}(\d|x|X)$/
			.test(idCardNo);
		if(!check)
			return false;
		// 校验地址码
		var addressCode = idCardNo.substring(0, 6);
		check = idCardNoUtil.checkAddressCode(addressCode);
		if(!check)
			return false;
		// 校验日期码
		var birDayCode = idCardNo.substring(6, 14);
		check = idCardNoUtil.checkBirthDayCode(birDayCode);
		if(!check)
			return false;
		// 验证校检码
		return idCardNoUtil.checkParityBit(idCardNo);
	},

	formateDateCN: function(day) {
		var yyyy = day.substring(0, 4);
		var mm = day.substring(4, 6);
		var dd = day.substring(6);
		return yyyy + '-' + mm + '-' + dd;
	},

	// 获取信息
	getIdCardInfo: function(idCardNo) {
		var idCardInfo = {
			gender: "", // 性别
			birthday: "" // 出生日期(yyyy-mm-dd)
		};
		if(idCardNo.length == 15) {
			var aday = '19' + idCardNo.substring(6, 12);
			idCardInfo.birthday = idCardNoUtil.formateDateCN(aday);
			if(parseInt(idCardNo.charAt(14)) % 2 == 0) {
				idCardInfo.gender = idCardNoUtil.genders.female;
			} else {
				idCardInfo.gender = idCardNoUtil.genders.male;
			}
		} else if(idCardNo.length == 18) {
			var aday = idCardNo.substring(6, 14);
			idCardInfo.birthday = idCardNoUtil.formateDateCN(aday);
			if(parseInt(idCardNo.charAt(16)) % 2 == 0) {
				idCardInfo.gender = idCardNoUtil.genders.female;
			} else {
				idCardInfo.gender = idCardNoUtil.genders.male;
			}

		}
		return idCardInfo;
	},
	getId15: function(idCardNo) {
		if(idCardNo.length == 15) {
			return idCardNo;
		} else if(idCardNo.length == 18) {
			return idCardNo.substring(0, 6) + idCardNo.substring(8, 17);
		} else {
			return null;
		}
	},
	getId18: function(idCardNo) {
		if(idCardNo.length == 15) {
			var id17 = idCardNo.substring(0, 6) + '19' + idCardNo.substring(6);
			var parityBit = idCardNoUtil.getParityBit(id17);
			return id17 + parityBit;
		} else if(idCardNo.length == 18) {
			return idCardNo;
		} else {
			return null;
		}
	}
};