
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
