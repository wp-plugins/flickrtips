
var flickrTips = {
	fotoDiv: null,
	tilesX: 3,
	tilesY: 2,
	intervals: {},
	flickrRE: new RegExp("http://(www\\.)?flickr\\.com/photos/([^/]+)/(sets|tags|\\d+)(/([^/]+))?"),
	plainImageRE: /\.(jpg|gif|png)(\?.*)?$/i,
	xmlhttp: null,
	fotos: new Object,

	addLoadEvent: function() {
		if (typeof window.onload == "function")
		{
			var temp = window.onload;
			window.onload = function() { temp(); flickrTips.init(); };
		}
		else
			window.onload = function() { flickrTips.init(); };
	},

	processPageLinks: function() {
		var alist = document.getElementsByTagName("a");
		if (!alist || !alist.length) return false;
		
		for (var i=0; i<alist.length; i++)
		{
			var a = alist[i];

			var isFlickr=this.flickrRE.test(a.href);
			var isPlain=this.plainImageRE.test(a.href);

			if (!isFlickr && !isPlain) continue;

			if (a.getElementsByTagName("img").length) continue;

			var linecolor = "";
			if (isFlickr) linecolor = "ff0084";
			else if (isPlain) linecolor = "0000ff";

			a.style.textDecoration="none";
			a.style.borderBottom = "1px dotted #" + linecolor;
			a.onmouseover = this.show;			
			a.onmouseout = this.hide;
			a.onmousemove = this.move;
		}
	},

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

		this.fotos['spinner'] = document.createElement("img");
		this.fotos['spinner'].src = flickrTips.wpurl + "/wp-content/plugins/flickrtips/spinnywheel.gif";

		document.body.appendChild(this.fotoDiv);

		this.processPageLinks();
	},
	
	loadScaledImage: function() {

		if (typeof this.width == 'undefined')
		{
			if (flickrTips.intervals[this.src])
			{
				window.clearInterval(flickrTips.intervals[this.src]);
				flickrTips.intervals[this.src] = null;
			}

			return;
		}

		var w = this.width;
		var h = this.height;

		if (!w || !h) return;

		while (w > 256 || h > 256)
		{
			w /= 2;
			h /= 2;
		}

		this.style.width = w + "px";
		this.style.height = h + "px";

		flickrTips.fotos[this.src] = new Array(this);

		if (flickrTips.intervals[this.src])
		{
			window.clearInterval(flickrTips.intervals[this.src])
			flickrTips.intervals[this.src] = null;
		}

		if (flickrTips.fotoDiv.style.visibility != "hidden") flickrTips.show(null,this.src);

	},
	
	loadPlainImage: function(e,fotoPage) {

		var temp = document.createElement('img');
		temp.src = fotoPage;
		temp.loadScaled = flickrTips.loadScaledImage;

		//scale image when it's loaded.  unfortunately different browsers calculate load status differently

		if (flickrTips.intervals[fotoPage]) return;

		flickrTips.intervals[fotoPage] = window.setInterval(function() { temp.loadScaled(); }, 250);

	},
	
	flickrRequest: function(e,fotoPage) {

		var matches = flickrTips.flickrRE.exec(fotoPage);
	
		var userID=matches[2];
		var fotoID, type;
		
		switch(matches[3]) {
			case "sets":  case "collections":  case "tags":
				type=matches[3];
				fotoID=matches[5];
				break;

			default:
				type='photos';
				fotoID=matches[3];
				break;
		}

		var flickrReq = {
			max: flickrTips.tilesX*flickrTips.tilesY,
			type: type,
			id: fotoID,
			user: userID
		};


		var flickrPost = "";
		var first=true;
		for (var i in flickrReq)
		{
			if (first) first = false;
			else flickrPost += "&";
			
			flickrPost += i + "=" + encodeURIComponent(flickrReq[i]);
		}

		flickrTips.xmlhttp.abort();
		flickrTips.xmlhttp.open("GET",flickrTips.wpurl + "/wp-content/plugins/flickrtips/ajaxgeturl.php?" + flickrPost);
		//flickrTips.xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded; charset=UTF-8");
		flickrTips.xmlhttp.onreadystatechange=function() { flickrTips.flickrResponse(e,fotoPage); };
		flickrTips.xmlhttp.send(flickrPost);

		return;
	},
	
	flickrResponse: function(e,key) {

		if (this.xmlhttp.readyState != 4) return;

		var temp = this.xmlhttp.responseText.split("\n");

		var result = new Array;

		var i=0;
		for (var y=0; y < flickrTips.tilesY; y++)
		for (var x=0; x < flickrTips.tilesX; x++)
		{
			if (temp[i].substr(0,4) != 'http')
				continue;

			var j = result.length;

			result[j] = document.createElement("img");
			result[j].src = temp[i];
			if (x) result[j].style.borderLeft = "1px solid white";
			if (y) result[j].style.borderTop = "1px solid white";

			if (++i >= temp.length) break;
		}

		flickrTips.fotos[key] = result;

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

		if (!e && window.event) e = window.event;

		if (!fotoPage && !this.href) return;
		if (!fotoPage) fotoPage=this.href;	

		while (flickrTips.fotoDiv.hasChildNodes())
			flickrTips.fotoDiv.removeChild(flickrTips.fotoDiv.firstChild);

		flickrTips.fotoDiv.style.visibility='visible';

		if (typeof flickrTips.fotos[fotoPage] == 'undefined' || !flickrTips.fotos[fotoPage])
		{
			flickrTips.fotoDiv.appendChild(flickrTips.fotos['spinner']);

			if (flickrTips.flickrRE.test(fotoPage)) return flickrTips.flickrRequest(e,fotoPage);
			if (flickrTips.plainImageRE.test(fotoPage)) return flickrTips.loadPlainImage(e,fotoPage);
		}

		if (typeof flickrTips.fotos[fotoPage] == "object" && flickrTips.fotos[fotoPage].length)
		{
			var f = flickrTips.fotos[fotoPage];
			for (var i=0; i < f.length; i++)
			{
				//flickrTips.fotoImg[i] = f[i];
				flickrTips.fotoDiv.appendChild(f[i]);
				if (i % flickrTips.tilesX == flickrTips.tilesX - 1)
					flickrTips.fotoDiv.appendChild(document.createElement('br'));
			}
		}
		else
			flickrTips.hide();
	},
	
	hide: function(e) {
		flickrTips.fotoDiv.style.visibility="hidden";
	}

};



