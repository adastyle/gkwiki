/*
 * jQuery Json Form Submit Plugin @requires jQuery v1.1 or later, json plugin
 * and form plugin @author Andy
 */
(function($) {
	/**
	 * jsonSubmit() provides a mechanism for submitting an HTML form using json
	 * data package, json data can be grouped by domain.
	 * 
	 * jsonSubmit accepts a single option object argument, the following
	 * attributes are supported:
	 * 
	 * domains: Identifies the domain(s) in current forms. The value is an array
	 * that contains ids of the domain elements. default value: null, this form
	 * will be treated as one domain egridFilter: EGrid data filter function.
	 * egridFilterRemoved: If filter removed records in Egrid get data.
	 * 
	 * beforeSubmit: Callback method to be invoked before the form is submitted.
	 * default value: null
	 */
	var showMask = null;
	$.fn.jsonSubmit = function(options) {
		showMask && showMask();
		var iframeId = '_js_frm' + new Date().getTime();
		var settings = {
			validate : false,
			ajax : false
		};
		options = $.extend(settings, options);
		// 开始遮罩
		// try{if(getCtpTop() &&
		// getCtpTop().startProc)getCtpTop().startProc();}catch(e){}
		var jsonObj = this.formobj(options);
		if (options.paramObj) {
			if ($.isArray(jsonObj)) {
				jsonObj = {};
			}
			for ( var name in options.paramObj) {
				jsonObj[name] = options.paramObj[name];
			}
		}
		var action = options.action || this.attr("action");
		if (!options.debug && (action == null || $.trim(action) == "")) {
			alert("you don't set action attribute!");
			hideMask && hideMask();
			return;
		}
		if (options.validate && $._isInValid(jsonObj)) {
			hideMask && hideMask();
			return;
		}
		if (options.beforeSubmit
				&& options.beforeSubmit(jsonObj, this, options) === false) {
			hideMask && hideMask();
			return;
		}
		var jsonStr = $.toJSON(jsonObj);
		if (options.ajax == true) {
			$.ajax({
				async : false,
				type : "post",
				url : action,
				data : {
					_json_params : jsonStr
				},
				error : function() {
					alert("error，form submit fail!");
				},
				success : function(json) {
					if (typeof options.callback == 'function') {
						options.callback(json);
					}
				}
			});
		} else {
			var targetWindow = window;
			if (options.targetWindow) {
				targetWindow = options.targetWindow;
			}
			var jsonForm = $(
					'<form method="post" action="'
							+ action
							+ '"><input type="hidden" id="_json_params" name="_json_params" value=""/></form>',
					targetWindow.document);
			$(targetWindow.document.body).append(jsonForm);
			targetWindow = null;
			if (typeof options.callback == 'function') {
				var tempIframe = $('<iframe id="' + iframeId + '" name="'
						+ iframeId + '" style="display:none;"></iframe>',
						jsonForm[0].ownerDocument);
				$("body", jsonForm[0].ownerDocument).append(tempIframe);
				tempIframe.load(function() {
					// 取消遮罩
					// try{if(getCtpTop() &&
					// getCtpTop().endProc)getCtpTop().endProc();}catch(e){}
					var response = $(this).contents().find("body").html();
					response = response.replace(/<embed[^<>]*>/, "");
					if (response && response.trim().startsWith('<pre>')) {
						response = response.trim();
						response = response.substr(5, response.length - 11);
						;
					}
					options.callback(response);
					$(this).remove();
				});
				tempIframe = null;
				jsonForm.attr('target', iframeId);
			} else if (options.target) {
				jsonForm.attr('target', options.target);
			}
			jsonForm.find("#_json_params").val(jsonStr);
			if (options.debug) {
				alert("JSON data format:\n" + jsonStr);
			}
			// $.confirmClose(false);
			if (action)
				jsonForm.submit();

			jsonForm.remove();
			jsonForm = null;
		}
		try {
			hideMask && hideMask();
		} catch (e) {
		}
	};

	$.fn.formobj = function(options) {
		if (this[0] == null)
			return {};
		var settings = {
			gridFilter : null,
			validate : false,
			errorIcon : false,
			errorAlert : true,
			errorBg : false,
			includeDisabled : true
		};
		options = $.extend(settings, options);
		var domains = options.domains;
		if (domains && domains.length > 0) {
			var domainsObj = {};
			if ($("#attachmentArea").length > 0) {
				var e1 = $("<div></div>");
				e1.attr("id", "attachmentInputs");
				e1.attr("style", "display:none;");
				e1.attr("isGrid", "true");
				this.append(e1);
				saveAttachment();
				domains.push("attachmentInputs");
			}
			for (var i = 0; i < domains.length; i++) {
				var domainId = domains[i], $domain = domainId == this
						.attr("id") ? this : $("#" + domainId, this), val;
				var nd = $("." + domainId), n = nd.length;
				if (n > 0 && options.matchClass) {
					val = [];
					var ds = [];
					for (var j = 0; j < domains.length; j++) {
						if (j != i)
							ds.push(domains[j]);
					}
					nd.each(function(i) {
						$domain = $(this);
						var vv = $.jsonDomain($domain, options);
						if (options.validate && $._isInValid(vv)
								&& !$._isInValid(val))
							$._invalidObj(val);
						val.push(vv);
						for (var k = 0; k < ds.length; k++) {
							var vd = $.jsonDomain($("#" + ds[k], $domain),
									options);
							if (options.validate && $._isInValid(vd)
									&& !$._isInValid(val))
								$._invalidObj(val);
							vv[ds[k]] = vd;
						}
					});
					if (options.isGrid)
						domainsObj = val;
					else if (val.length == 1)
						domainsObj = val[0];
					break;
				} else {
					val = $.jsonDomain($domain, options);
					domainsObj[domainId] = val;
					if (options.validate && $._isInValid(val)
							&& !$._isInValid(domainsObj))
						$._invalidObj(domainsObj);
				}
			}
			return domainsObj;
		} else {
			return $.jsonDomain(this, options);
		}
	};

	$.jsonDomain = function(e, options) {
		options = options || {};
		var a = [], obj = null, gf = options.gridFilter, isgrid = e
				.attr("isGrid") ? e.attr("isGrid") : false, vl = true, rt, ex = [], ds = options.domains, idb = options.includeDisabled;
		if (ds) {
			for (var i = 0; i < ds.length; i++) {
				var v = ds[i];
				if (e[0] && v != e[0].id && $("#" + v, e).length > 0)
					ex.push(v);
			}
		}
		$("*", e)
				.add(e)
				.filter(
						function(idx) {
							// if too much options, the program will die. so
							// return when the
							// tag name is option
							if (!this.id && !this.name) {
								return false;
							}
							for (var i = 0; i < ex.length; i++) {
								var v = ex[i];
								if ($(this).parents("#" + v).length > 0)
									return false;
							}
							var el = this, t = el.tagName.toLowerCase(), n = el.id ? el.id
									: el.name;
							if (t && n && (idb || !el.disabled) && !el.ignore) {
								switch (t) {
								case "table":
									if (el.grid && el.p.datas) {
										var ds = el.p.datas.rows;
										$(ds).each(
												function(i) {
													if (gf
															&& !gf(ds[i], $(
																	"tbody tr",
																	$(el)).get(
																	i)))
														return;
													a.push(ds[i]);
												});
										isgrid = true;
									}
									break;
								case "input":
									var tp = el.type;
									if (tp == "button" || tp == "reset"
											|| tp == "submit" || tp == "image"
											|| n == "_json_params"
											|| $(el).attr("suggest"))
										break;
								case "textarea":
									if (t == "textarea") {
										var cmp = $(el).attr('comp');
										if (cmp
												&& $.parseJSON('{' + cmp + '}').type == "editor") {
											$(el).val($(el).getEditorContent());
											break;
										}
									}
								case "select":
									if (obj && n in obj) {
										if (el.type != 'radio') {
											obj = {};
											a.push(obj);
										}
									}
									if (!obj) {
										obj = new Object();
										a.push(obj);
									}
									var tp = el.type;
									if (tp && tp == "radio") {
										if (el.checked) {
											obj[el.name] = el.value;
										}
									} else {
										var v = $.fieldValue(el, true, idb);
										if (!obj[n])
											obj[n] = v;
									}
								}
							}
							return false;
						});
		if (options.validate) {
			vl = $(e).validate({
				errorIcon : options.errorIcon,
				errorAlert : options.errorAlert,
				errorBg : options.errorBg
			});
		}
		if (a.length == 1 && !isgrid) {
			rt = a[0];
		} else {
			if (gf) {
				var aa = [];
				for (var i = 0; i < a.length; i++) {
					if (!gf(a[i]))
						continue;
					aa.push(a[i]);
				}
				a = aa;
			}
			rt = a;
		}
		if (!vl)
			$._invalidObj(rt);
		return rt;
	};

})(jQuery);