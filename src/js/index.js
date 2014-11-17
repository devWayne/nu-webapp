$(function() {

    var cancelBtn = $('.j-back'),
        updateBtn = $('.j-update');
    var eventId = httpUtils.getParam('eventId'),
        eventName = httpUtils.getParam('eventName'),
        cityid = httpUtils.getParam('cityid'),
        dpid = httpUtils.getParam('dpid'),
        version = httpUtils.getParam('version'),
        token = httpUtils.getParam('token'),
        appLatitude = httpUtils.getParam('latitude'),
        appLongitude = httpUtils.getParam('longitude'),
        couponRuleID = httpUtils.getParam('couponRuleID'),
        env = httpUtils.getParam('env');
    if (typeof(eventName) == undefined || eventName == '') {
        eventName = 'mfchwlzs';
    }
    if (typeof(couponRuleID) == undefined || couponRuleID == '') {
        couponRuleID = '102201';
    }
    if (typeof(env) == undefined || env == '') {
        env = 'product';
    }
    var params = "eventname=" + eventName + "&cityid=" + cityid + "&version=" + version + "&token=" + token + "&latitude=" + appLatitude + "&longitude=" + appLongitude + "&dpid=" + dpid + "&source=1";
    var loginParams = "eventname=" + eventName + "&cityid=" + cityid + "&version=" + version + "&token=*" + "&latitude=" + appLatitude + "&longitude=" + appLongitude + "&dpid=" + dpid + "&source=1";


    var mdomain = 'http://m.dianping.com';
    var eDomain = 'http://t.dianping.com';
    var userInfoUrl = 'http://mm.dianping.com/weixin/promotion/user-profile/jsonp?evt=mfchwl';
    var dealInfoUrl = 'http://evt.dianping.com/2601/json/' + cityid + '.json';

    if (env != 'product') {
        dealInfoUrl = 'http://evt.dianping.dp/1493/json/' + cityid + '.json';
        userInfoUrl = 'http://mm.51ping.com/weixin/promotion/user-profile/jsonp?evt=mfchwl';
        mdomain = 'http://m.51ping.com';
        eDomain = 'http://t.51ping.com';
    }
    var _utils = {

        showOverlay: function(clear, opts) {
            var overlay = $('<div id="J_overlay" style="position:absolute;left:0;top:0;background:#000;_filter:alpha(opacity=50);z-index:999;"></div>');

            if (!clear) {
                overlay.appendTo($('body')).css({
                    'width': $(window).width(),
                    'height': '1700px',
                    'opacity': 0.5
                });
            } else {
                $('#J_overlay').remove();
            }
        },
        centershow: function(divName) {
            var top = ($(window).height() - 140) / 2;
            var left = ($(window).width() - $(divName).css('width').substring(0, 3)) / 2;
            var scrollTop = $(window).scrollTop() || 0;
            var scrollLeft = $(window).scrollLeft() || 0;
            $(divName).css({
                position: 'absolute',
                'top': top + scrollTop,
                'left': left + scrollLeft
            }).show();
            //$('#_overlay_').show();
        }
    }

    var _g = new geo();
    var nList = 10,
        perList = 100;

    function getDealsInfo(data) {
        $.ajax({
            url: dealInfoUrl,
            //url: 'http://10.128.97.78:8000/test.json',
            type: 'GET',
            dataType: 'json',
            data: data,
            success: function(json) {
                listDeals(json.items[0], $('.detail-list-free'));
                $('.nav-bar-text').eq(0).text(json.items[0].name);
                if (json.items.length > 1) {
                    listDeals(json.items[1], $('.detail-list-lijian'));
                    $('.nav-bar-text').eq(1).text(json.items[1].name);
                } else {
                    $('.detail-list-lijian').hide();
                    $('.detail-list-lijian').next().hide();
                    $('.detail-list-lijian').prev().hide();
                }
                getUserInfo();
            }
        })
    }


    function listDeals(list, $list) {
        if (appLatitude && appLongitude) {
            $(list.dealGroups).each(function(idx, v) {
                v.imageUrl = v.imageUrl.replace('450c280', '120c90');
                if (v.geoLocations.length > 1 && appLatitude) {
                    v.value = [];
                    $(v.geoLocations).each(function(_idx, _v) {
                        v.value[_idx] = _g.value({
                            latitude: appLatitude,
                            longitude: appLongitude
                        }, v.geoLocations[_idx]);
                    })
                    v.sortValue = Math.min.apply(Math, v.value);
                    v.distance = _g.distance(v.sortValue);
                } else if (v.geoLocations[0] && appLatitude) {
                    v.sortValue = _g.value({
                        latitude: appLatitude,
                        longitude: appLongitude
                    }, v.geoLocations[0]);
                    v.distance = _g.distance(v.sortValue);
                } else if (v.geoLocations[0] == undefined || v.geoLocations[0] == "") {
                    v.sortValue = 0;
                }
                if (v.remain == 0) {
                    v.sortValue = -1;
                }
            })
            list.dealGroups.sort(function(a, b) {
                if (a.sortValue && b.sortValue) return a.sortValue - b.sortValue;
            })
            $list.append(Mustache.render(dealTpl.deal, list));
            if ($list.children().length > nList) {
                $list.children().each(function(idx, val) {
                    if ((idx + 1) > nList) {
                        $list.children().eq(idx).hide();
                    }
                });
            }
            else{
                $list.next().hide();
            }
            $list.next().on('click', function(e) {
                for (var i = nList; i < nList + perList; i++) {
                    $list.children().eq(i).show();
                };
                nList = nList + perList;
                if (nList > $list.children().length || nList == $list.children().length) {
                    $(this).hide();
                }
            })


        } else {
            $list.append(Mustache.render(dealTpl.deal, list));
            if ($list.children().length > nList) {
                $list.children().each(function(idx, val) {
                    if ((idx + 1) > nList) {
                        $list.children().eq(idx).hide();
                    }
                });
            }
            $list.next().on('click', function(e) {
                for (var i = nList; i < nList + perList; i++) {
                    $list.children().eq(i).show();
                };
                if (nList > $list.children().length || nList == $list.children().length) {
                    $(this).hide();
                }
                nList = nList + perList;
            })
        }

    }

    function getUserInfo() {

        var data = {};
        data.couponRuleID = couponRuleID;
        data.dpid = dpid;
        if ($.cookie('dper')) {
            data.dper = $.cookie('dper');
        } else {
            data.token = httpUtils.getParam('token');
        }

        $.ajax({
            async: false,
            url: userInfoUrl,
            type: "GET",
            dataType: 'jsonp',
            data: data,
            jsonp: 'jsonp',
            success: function(json) {
                if (json.success && json.realtime_tg_fresh == 0) {
                    $('.container.op-box').append('<img src="http://www.dpfile.com/mfchwl/img/lyhneww.png">')
                } else {
                    $('.buy-btn').hide();
                    $('.free-buy-btn').show();
                    $('.price strong').text('0');

                }
                setDirect(json);
            },
            error: function(json) {
                $('.buy-btn').hide();
                $('.free-buy-btn').show();
                $('.price strong').text('0');
                setDirect(json);
            }
        })
    };


    function setDirect(json) {

        $('.free-buy-item').on('click', function(e) {
            e.preventDefault();
            var dealId = $(e.target).parents('a').attr('data-tuandealid');
            var discountRuleId= $(e.target).parents('a').attr('data-discountruleid');
            var dealUrl = mdomain + "/tuan/eventdeal/" + dealId + '?' + params+'&ruleid='+discountRuleId;
            var loginDealUrl = mdomain + "/tuan/eventdeal/" + dealId + '?' + loginParams + +'&ruleid='+discountRuleId;
            var mDealUrl = mdomain + "/tuan/deal/" + dealId;
            var appUrl= "dianping://tuandeal?id="+ dealId;
            _hip.push(['mv', {
                module: '5_mfchwl_jw',
                action: 'click',
                campaignid: 2601,
                camp_step: 'home'
            }]);

            //status 1
            if (version.replace(/\./, "") < 68.5) {
                _utils.showOverlay(0);
                _utils.centershow('.popbox');
                return;
            }

            //status 2
            if (json.success == 0) {
                location.href = 'dianping://loginweb?url=' + encodeURIComponent(mdomain + '/login/app?version=' + version + '&logintype=m') + '&goto=' + encodeURIComponent('dianping://complexweb?url=' + encodeURIComponent(loginDealUrl));
                return;
            }

            //oldUser redirect to m.dianping.com site
            if (json.realtime_tg_fresh == 0) {
                location.href = appUrl;
                return;
            }

            //status 3
            if (json.integrity_score <= 0) {
                $.removeCookie('dper');
                location.href = 'dianping://loginweb?url=' + encodeURIComponent(mdomain + '/login/app?version=' + version + '&logintype=m') + '&goto=' + encodeURIComponent('dianping://complexweb?url=' + encodeURIComponent(loginDealUrl));
                return;
            }

            //status 4
            if (!json.mobile) {
                location.href = "dianping://modifyphone?goto=" + encodeURIComponent("dianping://complexweb?url=" + loginDealUrl) + '&url=' + encodeURIComponent(mdomain + "/account/modifyMobile?newtoken=!");
                return;
            }
            //status 5
            if (json.integrity_score > 9980) {
                DPApp.show_alert({
                    title: '提示',
                    message: '活动爆棚啦，放眼望去人山人海，先喝口茶歇歇吧～',
                    options: [],
                    cancel: '好的'
                }, function() {
                    location.href = "dianping://home";
                });
                return;
            }
            //status 6
            /*if (json.integrity_score > 5000 && json.integrity_score <= 9980 && json.up_sms == 1) {
             location.href = eDomain + "/lab/common/uploadSmsCheck?eventId=" + couponRuleID + "&token=" + token + "&bizType=2&callback=" + encodeURIComponent(dealUrl);
             return;
             }*/

            location.href = dealUrl;
        });
    }

    function init() {
        getDealsInfo();
        share.shareBtn();
        share.initShare();
        cancelBtn.on('click', function(e) {
            e.preventDefault();
            _utils.showOverlay(1);
            $('.popbox').hide();
        });
        updateBtn.on('click', function(e) {
            e.preventDefault();
            window.location.href = "http://m.dianping.com/download/synthesislink?redirect=3130&tag=external";
            return false;
        });

    }


    init();
});




    var callbacksCount = 1
    var callbacks = {}

	window.DPApp = {
		send_message: function (method, args, callback) {
			var hasCallback = callback && typeof callback == 'function'
			var callbackId = hasCallback ? callbacksCount++ : 0
			if (hasCallback) callbacks[callbackId] = callback


				args['callbackId'] = callbackId
				args = (typeof args === 'object') ? JSON.stringify(args) : args + ''
				var href = 'js://_?method=' + method + '&args=' + encodeURIComponent(args) + '&callbackId=' + callbackId
				var iframe = document.createElement("IFRAME")
				iframe.setAttribute('src', href)
				iframe.setAttribute("height", "1px")
				iframe.setAttribute("width", "1px")
				document.documentElement.appendChild(iframe)
				iframe.parentNode.removeChild(iframe)
				iframe = null
		},

		callback:function(callbackId, retValue) {
			try {
				var callback = callbacks[callbackId]
				if (!callback) return
					callback.apply(null, [retValue])
			} catch(e) {alert(e)}
		},
 
       		 show_alert:function(opts, callback) {
			DPApp.send_message('show_alert', opts, function(retValue) {
			(callback instanceof Function) && callback(retValue.select);
			});
		},

		send_sms:function(content, recipients) {
			DPApp.send_message('send_sms', {content: content, recipients: recipients});
		},

		open_web:function(modal, url) {
			DPApp.send_message('open_web', {modal: modal, url: url});
		},

		close_web:function(modal) {
			DPApp.send_message('close_web', {modal: modal});
		},
		  shareConfig:{
            		url: "http://t1.dpfile.com/t/html/app/events/zonefreeeating1017/index.html?" + (+new Date()),
            		image: "http://i1.s1.dpfile.com/pc/tgzt/5e6bd31183e7f5ea30ec611bddc9dfae(1600c550)/thumb.jpg",
           		 title: "大众点评豪掷10亿，请新用户免费吃喝玩乐",
           		 desc: "吃喝玩乐，通通不要钱，大众点评新用户专享!"
       		 }

	}




//(function($) {

function dpbox(type, options) {

	this.defaults = {
		width: 'auto',
		height: 'auto',
		overlay: 'false',
		type: 'Modal'
	}

	this.opts = $.extend(this.opts, this.defaults, options);

	this._create = function() {

		if (this.container) return;

		this.container = $('<div/>', {
			'class': 'dpbox'
		}).css('display', 'none').appendTo($('body'));


		this.header = $('<div/>', {
			'class': 'dpbox-header'
		}).appendTo(this.container);

		this.title = $('<div/>', {
			'class': 'dpbox-title'
		}).appendTo(this.header).css('display', 'inline');

		this.clzBtn = $('<div/>', {
			'class': 'dpbox-clzBtn'
		}).appendTo(this.header).html('X').css('display', 'inline').on('click', this.close.bind(this));

		this.content = $('<div/>', {
			'class': 'dpbox-content'
		}).css({
			width: this.opts.width,
			height: this.opts.height
		}).appendTo(this.container);


		this.setTitle(this.opts.title);
		this.setContent(this.opts.content);
		//this.show(this.container);
		if (this.opts.btn == "Confirm") {
			this.bottom = $('<div/>', {
				'class': 'dpbox-bottom'
			}).appendTo(this.container);
			this.setConfirmBtn();
		}
	};
	//this._create();

	if (!this.container) {
		this._create();
	}
}

dpbox.prototype.setContent = function(content) {
	if (content == null && !this.container) return;
	this.content.html(content);
}

dpbox.prototype.setTitle = function(title) {
	if (title == null && !this.container) return;
	this.title.html(title);
}
dpbox.prototype.setConfirmBtn = function() {
	var confirmBtn = "<div class='buttons'><a href='' class='bn-yel bn-sm'>确定</a><a href='' class='bn-ash bn-sm'>取消</a></div>"
	this.bottom.html(confirmBtn);
}

dpbox.prototype.open = function() {
	var open = function() {
		var top = ($(window).height() - $(this.container).height()) / 2;
		var left = ($(window).width() - $(this.container).width()) / 2;
		var scrollTop = $(document).scrollTop();
		var scrollLeft = $(document).scrollLeft();
		$(this.container).css({
			position: 'absolute',
			'top': top + scrollTop,
			'left': left + scrollLeft
		}).show();
	}.bind(this);

	if (!this.Opening) {
		this.Opening = !this.Opening;
		//Overlay
		if (this.opts.overlay) {
			this.overlay = $('<div style="background-color: rgb(0, 0, 0); border-top-width: 1px; border-top-style: solid; border-top-color: rgb(0, 0, 0); position: absolute; height: 1557px;width: 100%; left: 0px; top: 0px; opacity: 0.7; tp-a"></div>').appendTo($('body'));
		}
		open();
	} else {
		open();
	}
}

dpbox.prototype.close = function() {
	var close = function() {

	};
	if (this.Opening) {
		this.Opening = !this.Opening;
		if (this.opts.overlay) {
			this.overlay.css({
				display: 'none'
			});
		}
		this.container.css({
			display: 'none',
			//opacity: 0
		});

	} else {
		this.container.css({
			display: 'none',
			opacity: 0
		});
	}
	//close();
}

$.dpbox = function(type, options) {
	options || (options = {});
	return new dpbox(type, $.extend(options, $.fn.dpbox.defaults));
}



//})(jQuery)


	var geo = function() {
		}
	

	var proto = geo.prototype;

	proto.constructor = geo;


	proto.distance = function(distance) {

		if(distance>1){
			var _km=distance-distance%1;
			return '>'+_km.toString()+'km';
		}
		else{
			var _m=parseInt(distance*1000);
			return _m.toString()+'m';
		}

	}

	proto.value = function(geo1, geo2) {
		var deg2rad = Math.PI / 180;
		var rad2deg = 180 / Math.PI;
		var earthRad = 6371;
		var earthDia = earthRad * 2;

		var latCenterRad = geo1.latitude,
			lonCenterRad = geo1.longitude,
			latVals = geo2.latitude,
			lonVals = geo2.longitude;

		//计算经纬度
		var latRad = latVals * deg2rad;
		var lonRad = lonVals * deg2rad;

		//计算经纬度的差
		var diffX = latCenterRad * deg2rad - latRad;
		var diffY = lonCenterRad * deg2rad - lonRad;
		//计算正弦和余弦
		var hsinX = Math.sin(diffX * 0.5);
		var hsinY = Math.sin(diffY * 0.5);
		var latCenterRad_cos = Math.cos(latCenterRad * deg2rad);
		var h = hsinX * hsinX + (latCenterRad_cos * Math.cos(latRad) * hsinY * hsinY);

		return earthDia * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

	}

	proto.getLocation = function(successCb,errorCb) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				window.latitude=position.coords.latitude;
				window.longitude=position.coords.longitude;
				if (successCb && (successCb instanceof Function)) {
							successCb();
				}
			},
			function(){
				if (errorCb && (errorCb instanceof Function)) {
							errorCb();
				}
			});
		} else {
			console.log("Geolocation is not supported by this browser.");
		}
	}

//	module.exports = exports=geo;





	var httpUtils = {


		getParam:function(paramName) {
			var paramValue = "";
			isFound = false;
			if (window.location.search.indexOf("?") == 0 && window.location.search.indexOf("=") > 1) {
				arrSource = unescape(window.location.search).substring(1, window.location.search.length).split("&");
				i = 0;
				while (i < arrSource.length && !isFound) {
					if (arrSource[i].indexOf("=") > 0) {
						if (arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase()) {
							paramValue = arrSource[i].split("=")[1];
							isFound = true;
						}
					}
					i++;
				}
			}
			return paramValue;
		}
	}
//	module.exports = exports = httpUtils;

var lazyAttr = 'lazy-src';
var LazyLoad = function (images) {
    var els = images.get().filter(function(el){
        return !!$(el).attr(lazyAttr);
    }); //==> array
    var len = els.length;
    var action = function () {
        var currentTop = $(window).scrollTop() + window.innerHeight;
        for (var i = 0, l = els.length; i < l; i++) {
            var el = $(els[i]);
            if (!el.attr('src') && el.attr(lazyAttr)) {
                if (currentTop > $(el).offset().top) {
                    el.attr('src', el.attr(lazyAttr));
                    len--;
                }
            }
        }
        if (len <=0 ) {
            window.removeEventListener('scroll', action, false);
        }
    };
    window.addEventListener('load', action, false);
    window.addEventListener('scroll', action, false);
    action();
};


var share = {
	shareBtn: function() {
		var shareTipsEl = document.createElement("div");
		shareTipsEl.style.display = "none";
		shareTipsEl.innerHTML = '<div id="shareBox" class="share-tips"><i></i><p>点击右上角按钮分享给好友</p></div>';
		document.body.appendChild(shareTipsEl);

		shareTipsEl.addEventListener('click', function() {
			shareTipsEl.style.display = "none";
		})

		$("#J_guide_share").on("click", function(e) {
			e.preventDefault();
			shareTipsEl.style.display = "block";
		});
	},

	 initShare:function (){
        var iframe = document.createElement("iframe"),
            frameContainer = document.createElement("div"),
            shareConfig = "dpshare://_?content=" + encodeURIComponent(JSON.stringify(DPApp.shareConfig));

        frameContainer.setAttribute('style','display:none');
        frameContainer.appendChild(iframe);
        document.body.appendChild(frameContainer);
        iframe.setAttribute("src", shareConfig);
   	 }
}

//module.exports = share;

;var dealTpl = {

    'deal': '{{#dealGroups}}<a class="J_deal" data-tuandealid="{{id}}" data-discountRuleId="{{discountRuleId}}">\
	 <div class="item {{#hasPromo}}free-buy-item{{/hasPromo}} {{^hasPromo}}none-free-buy-item{{/hasPromo}}">\
            <div class="pic">\
                <img src="{{imageUrl}}">\
            </div>\
            <div class="info">\
                <h3>{{dealGroupShortName}}<span class="geo">{{distance}}</span></h3>\
                <h4>{{recommendReason}}</h4>\
                <div class="buy-box Fix">\
                    <div class="price-box f-l">\
                        <span class="price">¥<strong>{{price}}</strong></span>\
                        <span class="o-price">¥<strong>{{marketPrice}}</strong></span>\
                    </div>\
                        <span class="buy-btn f-r">去团购</span>\
			{{#hasPromo}}<span class="free-buy-btn f-r" style="display:none;">免费领</span>{{/hasPromo}}\
			{{^hasPromo}}<span class="free-buy-btn f-r sold-out" style="display:none;">抢光了</span>{{/hasPromo}}\
                </div>\
            </div>\
	  </div>\
        </a>{{/dealGroups}}'


}

//module.exports=dealTpl;

;(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(Zepto);
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (arguments.length > 1 && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setTime(+t + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {};

		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}

		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}));



/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false*/

;(function (global, factory) {
  if (typeof exports === "object" && exports) {
    factory(exports); // CommonJS
  } else if (typeof define === "function" && define.amd) {
    define(['exports'], factory); // AMD
  } else {
    factory(global.Mustache = {}); // <script>
  }
}(this, function (mustache) {

  var Object_toString = Object.prototype.toString;
  var isArray = Array.isArray || function (object) {
    return Object_toString.call(object) === '[object Array]';
  };

  function isFunction(object) {
    return typeof object === 'function';
  }

  function escapeRegExp(string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
  }

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var RegExp_test = RegExp.prototype.test;
  function testRegExp(re, string) {
    return RegExp_test.call(re, string);
  }

  var nonSpaceRe = /\S/;
  function isWhitespace(string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  /**
   * Breaks up the given `template` string into a tree of tokens. If the `tags`
   * argument is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
   * course, the default is to use mustaches (i.e. mustache.tags).
   *
   * A token is an array with at least 4 elements. The first element is the
   * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
   * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
   * all text that appears outside a symbol this element is "text".
   *
   * The second element of a token is its "value". For mustache tags this is
   * whatever else was inside the tag besides the opening symbol. For text tokens
   * this is the text itself.
   *
   * The third and fourth elements of the token are the start and end indices,
   * respectively, of the token in the original template.
   *
   * Tokens that are the root node of a subtree contain two more elements: 1) an
   * array of tokens in the subtree and 2) the index in the original template at
   * which the closing tag for that section begins.
   */
  function parseTemplate(template, tags) {
    if (!template)
      return [];

    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace() {
      if (hasTag && !nonSpace) {
        while (spaces.length)
          delete tokens[spaces.pop()];
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var openingTagRe, closingTagRe, closingCurlyRe;
    function compileTags(tags) {
      if (typeof tags === 'string')
        tags = tags.split(spaceRe, 2);

      if (!isArray(tags) || tags.length !== 2)
        throw new Error('Invalid tags: ' + tags);

      openingTagRe = new RegExp(escapeRegExp(tags[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + escapeRegExp(tags[1]));
      closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tags[1]));
    }

    compileTags(tags || mustache.tags);

    var scanner = new Scanner(template);

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(openingTagRe);

      if (value) {
        for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
          } else {
            nonSpace = true;
          }

          tokens.push([ 'text', chr, start, start + 1 ]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr === '\n')
            stripSpace();
        }
      }

      // Match the opening tag.
      if (!scanner.scan(openingTagRe))
        break;

      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(curlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }

      // Match the closing tag.
      if (!scanner.scan(closingTagRe))
        throw new Error('Unclosed tag at ' + scanner.pos);

      token = [ type, value, start, scanner.pos ];
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();

        if (!openSection)
          throw new Error('Unopened section "' + value + '" at ' + start);

        if (openSection[1] !== value)
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        compileTags(value);
      }
    }

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();

    if (openSection)
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

    return nestTokens(squashTokens(tokens));
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens(tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }

    return squashedTokens;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens(tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];

    var token, section;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      switch (token[0]) {
      case '#':
      case '^':
        collector.push(token);
        sections.push(token);
        collector = token[4] = [];
        break;
      case '/':
        section = sections.pop();
        section[5] = token[2];
        collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
        break;
      default:
        collector.push(token);
      }
    }

    return nestedTokens;
  }

  /**
   * A simple string scanner that is used by the template parser to find
   * tokens in template strings.
   */
  function Scanner(string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function () {
    return this.tail === "";
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function (re) {
    var match = this.tail.match(re);

    if (!match || match.index !== 0)
      return '';

    var string = match[0];

    this.tail = this.tail.substring(string.length);
    this.pos += string.length;

    return string;
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function (re) {
    var index = this.tail.search(re), match;

    switch (index) {
    case -1:
      match = this.tail;
      this.tail = "";
      break;
    case 0:
      match = "";
      break;
    default:
      match = this.tail.substring(0, index);
      this.tail = this.tail.substring(index);
    }

    this.pos += match.length;

    return match;
  };

  /**
   * Represents a rendering context by wrapping a view object and
   * maintaining a reference to the parent context.
   */
  function Context(view, parentContext) {
    this.view = view == null ? {} : view;
    this.cache = { '.': this.view };
    this.parent = parentContext;
  }

  /**
   * Creates a new context using the given view with this context
   * as the parent.
   */
  Context.prototype.push = function (view) {
    return new Context(view, this);
  };

  /**
   * Returns the value of the given name in this context, traversing
   * up the context hierarchy if the value is absent in this context's view.
   */
  Context.prototype.lookup = function (name) {
    var cache = this.cache;

    var value;
    if (name in cache) {
      value = cache[name];
    } else {
      var context = this, names, index;

      while (context) {
        if (name.indexOf('.') > 0) {
          value = context.view;
          names = name.split('.');
          index = 0;

          while (value != null && index < names.length)
            value = value[names[index++]];
        } else {
          value = context.view[name];
        }

        if (value != null)
          break;

        context = context.parent;
      }

      cache[name] = value;
    }

    if (isFunction(value))
      value = value.call(this.view);

    return value;
  };

  /**
   * A Writer knows how to take a stream of tokens and render them to a
   * string, given a context. It also maintains a cache of templates to
   * avoid the need to parse the same template twice.
   */
  function Writer() {
    this.cache = {};
  }

  /**
   * Clears all cached templates in this writer.
   */
  Writer.prototype.clearCache = function () {
    this.cache = {};
  };

  /**
   * Parses and caches the given `template` and returns the array of tokens
   * that is generated from the parse.
   */
  Writer.prototype.parse = function (template, tags) {
    var cache = this.cache;
    var tokens = cache[template];

    if (tokens == null)
      tokens = cache[template] = parseTemplate(template, tags);

    return tokens;
  };

  /**
   * High-level method that is used to render the given `template` with
   * the given `view`.
   *
   * The optional `partials` argument may be an object that contains the
   * names and templates of partials that are used in the template. It may
   * also be a function that is used to load partial templates on the fly
   * that takes a single argument: the name of the partial.
   */
  Writer.prototype.render = function (template, view, partials) {
    var tokens = this.parse(template);
    var context = (view instanceof Context) ? view : new Context(view);
    return this.renderTokens(tokens, context, partials, template);
  };

  /**
   * Low-level method that renders the given array of `tokens` using
   * the given `context` and `partials`.
   *
   * Note: The `originalTemplate` is only ever used to extract the portion
   * of the original template that was contained in a higher-order section.
   * If the template doesn't use higher-order sections, this argument may
   * be omitted.
   */
  Writer.prototype.renderTokens = function (tokens, context, partials, originalTemplate) {
    var buffer = '';

    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    var self = this;
    function subRender(template) {
      return self.render(template, context, partials);
    }

    var token, value;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      switch (token[0]) {
      case '#':
        value = context.lookup(token[1]);

        if (!value)
          continue;

        if (isArray(value)) {
          for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
            buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
          }
        } else if (typeof value === 'object' || typeof value === 'string') {
          buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
        } else if (isFunction(value)) {
          if (typeof originalTemplate !== 'string')
            throw new Error('Cannot use higher-order sections without the original template');

          // Extract the portion of the original template that the section contains.
          value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

          if (value != null)
            buffer += value;
        } else {
          buffer += this.renderTokens(token[4], context, partials, originalTemplate);
        }

        break;
      case '^':
        value = context.lookup(token[1]);

        // Use JavaScript's definition of falsy. Include empty arrays.
        // See https://github.com/janl/mustache.js/issues/186
        if (!value || (isArray(value) && value.length === 0))
          buffer += this.renderTokens(token[4], context, partials, originalTemplate);

        break;
      case '>':
        if (!partials)
          continue;

        value = isFunction(partials) ? partials(token[1]) : partials[token[1]];

        if (value != null)
          buffer += this.renderTokens(this.parse(value), context, partials, value);

        break;
      case '&':
        value = context.lookup(token[1]);

        if (value != null)
          buffer += value;

        break;
      case 'name':
        value = context.lookup(token[1]);

        if (value != null)
          buffer += mustache.escape(value);

        break;
      case 'text':
        buffer += token[1];
        break;
      }
    }

    return buffer;
  };

  mustache.name = "mustache.js";
  mustache.version = "0.8.1";
  mustache.tags = [ "{{", "}}" ];

  // All high-level mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates in the default writer.
   */
  mustache.clearCache = function () {
    return defaultWriter.clearCache();
  };

  /**
   * Parses and caches the given template in the default writer and returns the
   * array of tokens it contains. Doing this ahead of time avoids the need to
   * parse templates on the fly as they are rendered.
   */
  mustache.parse = function (template, tags) {
    return defaultWriter.parse(template, tags);
  };

  /**
   * Renders the `template` with the given `view` and `partials` using the
   * default writer.
   */
  mustache.render = function (template, view, partials) {
    return defaultWriter.render(template, view, partials);
  };

  // This is here for backwards compatibility with 0.4.x.
  mustache.to_html = function (template, view, partials, send) {
    var result = mustache.render(template, view, partials);

    if (isFunction(send)) {
      send(result);
    } else {
      return result;
    }
  };

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;

  // Export these mainly for testing, but also for advanced usage.
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

}));
