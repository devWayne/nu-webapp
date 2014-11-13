
 var dealTpl={

 'deal':'{{#dealGroups}}<a class="J_deal" data-tuandealid="{{id}}">\
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
			{{#hasPromo}}<span class="free-buy-btn f-r" data-discountRuleId="{{discountRuleId}}" style="display:none;">免费领</span>{{/hasPromo}}\
			{{^hasPromo}}<span class="free-buy-btn f-r sold-out" style="display:none;">抢光了</span>{{/hasPromo}}\
                </div>\
            </div>\
	  </div>\
        </a>{{/dealGroups}}'


}

//module.exports=dealTpl;

