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
