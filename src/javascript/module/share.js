var DPApp = {
        shareConfig:{
            url: "http://t1.dpfile.com/t/html/app/events/zonefreeeating1017/index.html?" + (+new Date()),
            image: "http://i1.s1.dpfile.com/pc/tgzt/5e6bd31183e7f5ea30ec611bddc9dfae(1600c550)/thumb.jpg",
            title: "大众点评豪掷10亿，请新用户免费吃喝玩乐",
            desc: "吃喝玩乐，通通不要钱，大众点评新用户专享!"
        }
    };


var share = {
	shareBtn: function() {
		var shareTipsEl = document.createElement("div");
		shareTipsEl.style.display = "none";
		shareTipsEl.innerHTML = '<div id="shareBox" class="share-tips"><i></i><p>点击右上角按钮分享给好友</p></div>';
		document.body.appendChild(shareTipsEl);

		shareTipsEl.addEventListener('click', function() {
			shareTipsEl.style.display = "none";
		})

		$("#J_guide_share").on("click", function(e) {
			e.preventDefault();
			shareTipsEl.style.display = "block";
		});
	},

	 initShare:function (){
        var iframe = document.createElement("iframe"),
            frameContainer = document.createElement("div"),
            shareConfig = "dpshare://_?content=" + encodeURIComponent(JSON.stringify(DPApp.shareConfig));

        frameContainer.setAttribute('style','display:none');
        frameContainer.appendChild(iframe);
        document.body.appendChild(frameContainer);
        iframe.setAttribute("src", shareConfig);
   	 }
}

//module.exports = share;
