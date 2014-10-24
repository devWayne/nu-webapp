define(function(require, exports, module) {

	var $ = require('zepto'),
		Mustache = require('mustache'),
		cookie = require('cookie');

	var dealistTpl = require('dealTpl');

	var geo = require('geo'),
		share=require('share'),
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
        couponRuleID = httpUtils.getParam('couponRuleID');
        env = httpUtils.getParam('env');
	var params = "eventName=" + eventName + "&cityid=" + cityid + "&version=" + version + "&token=" + token + "&latitude=" + appLatitude + "&longitude=" + appLongitude + "&dpid=" + dpid + "&couponRuleID=" + couponRuleID;
	var loginParams = "eventName=" + eventName + "&cityid=" + cityid + "&version=" + version + "&token=*" + "&latitude=" + appLatitude + "&longitude=" + appLongitude + "&dpid=" + dpid + "&couponRuleID=" + couponRuleID;


	var mdomain='http://m.dianping.com';
	var eDomain='http://t.dianping.com';
    var userInfoUrl = 'http://mm.dianping.com/weixin/promotion/user-profile/jsonp';
    var dealInfoUrl = 'http://evt.dianping.com/mfchwl/json/'+cityid+'.json';

    if(env != 'product'){
        dealInfoUrl = 'http://evt.dianping.dp/mfchwlzs/json/'+cityid+'.json';
        userInfoUrl = 'http://mm.51ping.com/weixin/promotion/user-profile/jsonp';
        mdomain='http://m.51ping.com';
        eDomain='http://t.51ping.com';
    }
	var _g=new geo();
	var nList=1,perList=1;
	function getDealsInfo(data) {
		$.ajax({
			url: dealInfoUrl,
			type: 'GET',
			dataType: 'json',
			data: data,
			success: function(json) {
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
						if($('.item').length>nList){
							$('.item').each(function(idx,val){
								if((idx+1)>nList){
						 		 $('.item').eq(idx).hide();
								}
							});
						}
						$('.check-more').on('click',function(e){
							for(var i=nList;i<nList+perList;i++){
							 $('.item').eq(i).show();
							};
							if(nList>$('.item').length||nList==$('.item').length){
							$(this).hide();
							}
							nList=nList+perList;
						})


				}
				else{		
					$('.detail-list').append(Mustache.render(dealistTpl.deal, json));							
						if($('.item').length>nList){
							$('.item').each(function(idx,val){
								if((idx+1)>nList){
						 		 $('.item').eq(idx).hide();
								}
							});
						}
						$('.check-more').on('click',function(e){
							for(var i=nList;i<nList+perList;i++){
							 $('.item').eq(i).show();
							};
							if(nList>$('.item').length||nList==$('.item').length){
							$(this).hide();
							}
							nList=nList+perList;
						})
				}
				getUserInfo();

			}
		})
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
			if(json.success&&json.realtime_tg_fresh == 0){
                $('.container.op-box').append('<img src="http://t.dianping.com/events/m/mfchgds/lyhneww.png">')
			}
			else{
                $('.buy-btn').text('免费领');
                $('.price strong').text('0')
			}
				setDirect(json);		
			}
		})
	};

	
	function setDirect(json) {

		$('.item').on('click',function(e) {
			e.preventDefault();
			var dealId = $(e.target).parents('a').attr('data-tuandealid');

			var dealUrl = mdomain+"/tuan/eventdeal/" + dealId+ '?' + params;
			var loginDealUrl = mdomain+"/tuan/eventdeal/" + dealId+ '?' + loginParams;
			var mDealUrl = mdomain+"/tuan/deal/" + dealId;

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
			if (json.success == 0) {
				location.href = 'dianping://loginweb?url=' + encodeURIComponent(mdomain + '/login/app?version=' + version + '&logintype=m') + '&goto=' + encodeURIComponent('dianping://complexweb?url=' + encodeURIComponent(loginDealUrl));
                return;
			}

            //oldUser redirect to m.dianping.com site
            if(json.realtime_tg_fresh == 0){
                location.href = mDealUrl;
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
			if (json.integrity_score > 5000 && json.integrity_score <= 9980 && json.up_sms == 1) {
				location.href = eDomain + "/lab/common/uploadSmsCheck?eventId=" + couponRuleID + "&bizType=2&callback=" + encodeURIComponent(dealUrl);
                return;
			}
			
			location.href =dealUrl;
		});
	}

	exports.init = function() {
		getDealsInfo();
		share.shareBtn();
	}

});

