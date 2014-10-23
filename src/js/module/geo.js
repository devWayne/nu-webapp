define(function(require, exports, module) {

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

	module.exports = exports=geo;
});


