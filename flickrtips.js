
var flickrTips = {
	fotoDiv: null,
	fotoImg: null,
	fotoImgArray: new Array,
	tilesX: 3,
	tilesY: 2,
	flickrRE: new RegExp("http://(www\\.)?flickr\\.com/photos/([^/]+)/([^/]+)(/([^/]+))?"),
	xmlhttp: null,
	fotos: new Object,

	processPageLinks: function() {
		var alist = document.getElementsByTagName("a");
		if (!alist || !alist.length) return false;
		
		for (var i=0; i<alist.length; i++)
		{
			var a = alist[i];

			if (!this.flickrRE.test(a.href)) continue;
			if (a.getElementsByTagName("img").length) continue;

			a.style.textDecoration="none";
			a.style.borderBottom = "1px dotted #ff0084";
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

		//var fotoLink = document.createElement("a");
		//fotoLink.href = "";

		this.fotoImg = document.createElement("img");
		this.fotoImg.id = "flickrTipsFoto";
		this.fotoImg.src = "";
		this.fotoImg.alt = "";

		var z=0;
		for (var y=0; y < this.tilesY; y++)
		for (var x=0; x < this.tilesX; x++)
		{
			this.fotoImgArray[z] = document.createElement("img");
			this.fotoImgArray[z].id = "flickrTipsFoto" + z;
			this.fotoImgArray[z].src = "";
			this.fotoImgArray[z].alt = "";

			if (x) this.fotoImgArray[z].style.borderLeft="1px solid white";
			if (y) this.fotoImgArray[z].style.borderTop="1px solid white";

			++z;
		}

		document.body.appendChild(this.fotoDiv);

		this.processPageLinks();
	},
	
	flickrResponse: function(e,key) {

		if (this.xmlhttp.readyState != 4) return;

		var temp = this.xmlhttp.responseText.split("\n");

		var result = new Array;

		for (var i=0; i<temp.length; i++)
		{
			if (temp[i].substr(0,4) != 'http')
				continue;

			result[result.length] = temp[i];
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

		if (!e) var e = window.event;

		if (!fotoPage && !this.href) return;
		if (!fotoPage) fotoPage=this.href;	

		flickrTips.fotoImg.src=flickrTips.blogurl + "/wp-content/plugins/flickrtips.unstable/spinnywheel.gif";
		flickrTips.fotoDiv.style.visibility='visible';

		if (!flickrTips.fotos[fotoPage])
		{
			var matches = flickrTips.flickrRE.exec(fotoPage);
		
			var userID=matches[2];
			var fotoID, type;
			
			switch(matches[3]) {
				case "sets":  case "collections":
					type=matches[3];
					fotoID=matches[5];
					break;

				default:
					type='photos';
					fotoID=matches[3];
					break;
			}

			flickrTips.xmlhttp.abort();
			flickrTips.xmlhttp.open("GET",flickrTips.blogurl + "/wp-content/plugins/flickrtips.unstable/ajaxgeturl.php?max=" + (flickrTips.tilesX*flickrTips.tilesY) + "&type=" + type + "&id=" + fotoID);
			flickrTips.xmlhttp.onreadystatechange=function() { flickrTips.flickrResponse(e,fotoPage); };
			flickrTips.xmlhttp.send("");

			return;
		}

		while (flickrTips.fotoDiv.hasChildNodes())
			flickrTips.fotoDiv.removeChild(flickrTips.fotoDiv.firstChild);

		if (typeof flickrTips.fotos[fotoPage] == "object" && flickrTips.fotos[fotoPage].length)
		{
			var f = flickrTips.fotos[fotoPage];
			for (var i=0; i < f.length; i++)
			{
				flickrTips.fotoImgArray[i].src = f[i];
				flickrTips.fotoDiv.appendChild(flickrTips.fotoImgArray[i]);
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

function flickrTips_updateBodyOnLoad() {
	if (typeof window.onload == "Function")
		window.onload = function() { window.onload(); flickrTips.init(); };
	else
		window.onload = function() { flickrTips.init(); };
};

