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
    var params = "eventName=" + eventName + "&cityid=" + cityid + "&version=" + version + "&token=" + token + "&latitude=" + appLatitude + "&longitude=" + appLongitude + "&dpid=" + dpid + "&couponRuleID=" + couponRuleID + "&source=1";
    var loginParams = "eventName=" + eventName + "&cityid=" + cityid + "&version=" + version + "&token=*" + "&latitude=" + appLatitude + "&longitude=" + appLongitude + "&dpid=" + dpid + "&couponRuleID=" + couponRuleID + "&source=1";


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
            var dealUrl = mdomain + "/tuan/eventdeal/" + dealId + '?' + params+'&discountRuleId='+discountRuleId;
            var loginDealUrl = mdomain + "/tuan/eventdeal/" + dealId + '?' + loginParams;
            var mDealUrl = mdomain + "/tuan/deal/" + dealId;
            var appUrl= "dianping://tuandeal?id="+ dealId;
            _hip.push(['mv', {
                module: '5_mfchwl_jw',
                action: 'click',
                campaignid: 1303,
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
