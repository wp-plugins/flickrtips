
var flickrTips = {
	fotoDiv: null,
	fotoImg: null,
	flickrRE: new RegExp("http://(www\\.)?flickr\\.com/photos/([^/]+)/(\\d+)/"),
	xmlhttp: null,
	fotos: new Object,

	init: function() {

		if (window.XMLHttpRequest)
			this.xmlhttp = new XMLHttpRequest;
		else if (window.ActiveXObject)
			this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		else
			return;

		this.fotoDiv = document.createElement("div");
		this.fotoDiv.id = "flickrTipsDiv";
		this.fotoDiv.style.position = "absolute";
		this.fotoDiv.style.left="0px";
		this.fotoDiv.style.top="200px";
		this.fotoDiv.style.visibility= "hidden";
		this.fotoDiv.style.border= "1px solid black";
		this.fotoDiv.style.padding= "3px";
		this.fotoDiv.style.backgroundColor= "white";

		//var fotoLink = document.createElement("a");
		//fotoLink.href = "";

		this.fotoImg = document.createElement("img");
		this.fotoImg.id = "flickrTipsFoto";
		this.fotoImg.src = "";
		this.fotoImg.alt = "";
		//fotoImg.style.border="0";

		//fotoLink.appendChild(fotoImg);
		//fotoDiv.appendChild(fotoLink);
		this.fotoDiv.appendChild(this.fotoImg);
		document.getElementById('page').appendChild(this.fotoDiv);

		var alist = document.getElementsByTagName("a");
		if (!alist || !alist.length) return false;
		
		for (var i=0; i<alist.length; i++)
		{
			var a = alist[i];

			if (!this.flickrRE.test(a.href)) continue;
			if (a.getElementsByTagName("img").length) continue;

			a.onmouseover = this.show;			
			a.onmouseout = this.hide;
			a.onmousemove = this.move;
		}
	},
	
	flickrResponse: function(e,key) {

		if (this.xmlhttp.readyState != 4) return;

		flickrTips.fotos[key] = this.xmlhttp.responseText;
		if (flickrTips.fotoDiv.style.visibility != "hidden") flickrTips.show(e,key);
		
	},

	move: function(e) {

		if (!e) e=window.event; 

		var x,y;

		var isOpera = (navigator.userAgent.indexOf('Opera') != -1);
		var isIE = (!isOpera && navigator.userAgent.indexOf('MSIE') != -1);

		if (e.pageX) { x=e.pageX; y=e.pageY; }
		else if (e.clientX) { 
			x = e.clientX;
			y = e.clientY;

			if (isIE) {
				x += document.body.scrollLeft;
				y += document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
			}
		}

		flickrTips.fotoDiv.style.left = (x+10) + "px";
		flickrTips.fotoDiv.style.top = (y+10) + "px";
	},
	
	show: function(e,fotoPage) {

		if (!e) var e = window.event;

		if (!fotoPage && !this.href) return;
		if (!fotoPage) fotoPage=this.href;	

		flickrTips.fotoImg.src=flickrTips.blogurl + "/wp-content/plugins/flickrtips/spinnywheel.gif";
		flickrTips.fotoDiv.style.visibility='visible';

		if (!flickrTips.fotos[fotoPage])
		{
			var matches = flickrTips.flickrRE.exec(fotoPage);
		
			var userID=matches[2];
			var fotoID=matches[3];

			flickrTips.xmlhttp.abort();
			flickrTips.xmlhttp.open("GET",flickrTips.blogurl + "/wp-content/plugins/flickrtips/ajaxgeturl.php?id=" + fotoID);
			flickrTips.xmlhttp.onreadystatechange=function() { flickrTips.flickrResponse(e,fotoPage); };
			flickrTips.xmlhttp.send("");

			return;
		}

		flickrTips.fotoImg.src=flickrTips.fotos[fotoPage];
	},
	
	hide: function(e) {
		flickrTips.fotoDiv.style.visibility="hidden";
	}

};

function flickrTips_updateBodyOnLoad() {
	if (typeof window.onload == "Function")
		window.onload = function() { window.onload(); flickrTips.init(); };
	else
		window.onload = function() { flickrTips.init(); };
};

