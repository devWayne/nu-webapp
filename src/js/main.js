define(function(require, exports, module) {

var $ = require('zepto'),
	Mustache = require('mustache');

var dealistTpl = require('dealTpl');


exports.init = function() {
	main();
}

function main(){
	getDealsInfo();
}


function getDealsInfo(){
	$.ajax({
		url:'http://evt.dianping.dp/mfchwlzs/json/1.json',
		type:'GET',
		dataType:'json',
		success:function(json){
			$('.detail-list').append(Mustache.render(dealistTpl.deal,json));	
		}
	})
}

});