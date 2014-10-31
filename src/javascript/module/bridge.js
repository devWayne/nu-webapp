


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



