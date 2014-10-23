define(function(require, exports, module) {

	var $ = require('zepto'),
		Mustache = require('mustache'),
		cookie = require('cookie');

	var dealistTpl = require('dealTpl');

	var geo = require('geo'),
		httpUtils = require('httpUtils');
	require('bridge');

	var eventId = httpUtils.getParam('eventId'),
		eventName = httpUtils.getParam('eventName'),
		cityid = httpUtils.getParam('cityid'),
		dpid = httpUtils.getParam('dpid'),
		version = httpUtils.getParam('version'),
		token = httpUtils.getParam('token'),
		appLatitude = httpUtils.getParam('latitude'),
		appLongitude = httpUtils.getParam('longitude');
	var params = "eventName=" + eventName + "&cityid=" + cityid + "&version=" + version + "&token=" + token + "&latitude=" + appLatitude + "&longitude=" + appLongitude;

	var mdomain='http://m.51ping.com';

	function getDealsInfo(data) {
		$.ajax({
			url: 'http://evt.dianping.dp/mfchwlzs/json/1.json',
			type: 'GET',
			dataType: 'json',
			data: data,
			success: function(json) {
				var _g=new geo();
				if(appLatitude&&appLongitude){
						$(json.dealist).each(function(idx, v) {
							if (v.geoLocations.length>1 &&appLatitude){
							v.value=[];
							$(v.geoLocations).each(function(_idx,_v){
								v.value[_idx]= _g.value({
									latitude: appLatitude,
									longitude: appLongitude
								}, v.geoLocations[_idx]);
							})
							v.minValue=Math.min.apply(Math,v.value);
								v.distance=_g.distance(v.minValue);
							}
							else if(v.geoLocations[0] &&appLatitude) {
								v.minValue = _g.value({
									latitude:appLatitude,
									longitude:appLongitude
								}, v.geoLocations[0]);
								v.distance=_g.distance(v.minValue);
							}
						})
						json.dealist.sort(function(a, b) {
							if (a.minValue && b.minValue)return a.minValue - b.minValue;
							if(!a.minValue)return 1;
							if(!b.minValue)return -1;
						})
						$('.detail-list').append(Mustache.render(dealistTpl.deal, json));	
				}
				else{
					
					_g.getLocation(	function() {
						$(json.dealist).each(function(idx, v) {
							if (v.geoLocations.length>1 &&window.latitude){
							v.value=[];
							$(v.geoLocations).each(function(_idx,_v){
								v.value[_idx]= _g.value({
									latitude: window.latitude,
									longitude: window.longitude
								}, v.geoLocations[_idx]);
							})
							v.minValue=Math.min.apply(Math,v.value);
								v.distance=_g.distance(v.minValue);
							}
							else if(v.geoLocations[0] &&window.latitude) {
								v.minValue = _g.value({
									latitude:window.latitude,
									longitude:window.longitude
								}, v.geoLocations[0]);
								v.distance=_g.distance(v.minValue);
							}
						})
						json.dealist.sort(function(a, b) {
							if (a.minValue && b.minValue)return a.minValue - b.minValue;
							if(!a.minValue)return 1;
							if(!b.minValue)return -1;
						})
						$('.detail-list').append(Mustache.render(dealistTpl.deal, json));
					})
				}
			}
		})
	}

	function getUserInfo() {

		var data = {};
		if ($.cookie('dper')) {
			data.dper = $.cookie('dper');
		} else {
			data.token = httpUtils.getParam('token');
		}

		$.ajax({
			async: false,
			url: 'http://mm.51ping.com/weixin/promotion/user-profile/jsonp',
			type: "GET",
			dataType: 'jsonp',
			data: data,
			jsonp: 'jsonp',
			success: function(json) {
				setDirect(json);
			}
		})
	};

	
	function setDirect(json) {

		$(document).on('click','.item',function(e) {
			e.preventDefault();
			var dealId = $(e.target).parents('a').attr('data-tuandealid');

			var dealUrl = mdomain+"/tuan/eventdeal/" + dealId+ '?' + params;
			//status 1
			if (version.replace(/\./, "") < 68.5) {
				DPApp.show_alert({
					title: '客户端版本过低',
					message: '请下载最新版客户端！',
					options: [],
					cancel: '返回'
				}, function() {
				location.href = "http://m.dianping.com/download/synthesislink?redirect=3197&tag=external";
				});
				return;
			}
			//status 2
			if (!json.success) {
				location.href = 'dianping://loginweb?url=' + encodeURIComponent(mdomain + '/login/app?version=' + version + '&logintype=m') + '&goto=' + encodeURIComponent('dianping://complexweb?url=' + encodeURIComponent(dealUrl));
			}
			//status 3
			if (json.integrity_score < 0) {
				location.href = 'dianping://loginweb?url=' + encodeURIComponent(mdomain + '/login/app?version=' + version + '&logintype=m') + '&goto=' + encodeURIComponent('dianping://complexweb?url=' + encodeURIComponent(dealUrl));
			}

			//status 4
			if (!json.mobile) {
				location.href = "dianping://modifyphone?goto=" + encodeURIComponent("dianping://complexweb?url=" + dealUrl) + '&url=' + encodeURIComponent(mdomain + "/account/modifyMobile?newtoken=!");
			}
			//status 5
			if (json.integrity_score > 9980) {
				DPApp.show_alert({
					title: '活动太火爆',
					message: '前方有些拥挤，请稍后再试！',
					options: [],
					cancel: '返回'
				}, function() {
					location.href = "dianping://home";
				});
				return;
			}
			//status 6
			if (json.integrity_score > 5000 && json.integrity_score < 9980) {
				location.href = "/lab/common/uploadSmsCheck?eventId=" + eventId + "&bizType=2&callback=" + encodeURIComponent(dealUrl);
			}
			
			location.href =dealUrl;
			

		});
	}




	exports.init = function() {
		getDealsInfo();
		getUserInfo();

	}

});

