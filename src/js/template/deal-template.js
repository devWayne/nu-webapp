define(function(require, exports, module) {

 var dealTpl={

 'deal':'{{#dealist}}<a class="item J_deal" data-tuandealid="{{id}}">\
            <div class="pic">\
                <img lazy-src="{{imgUrl}}">\
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
                </div>\
            </div>\
        </a>{{/dealist}}'


}

module.exports=dealTpl;

});
