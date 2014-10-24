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
