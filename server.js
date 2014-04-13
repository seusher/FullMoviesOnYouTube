var http = require("http");
var url = require("url");
var requestApi = require("request");


	function onRequest(request, response) {

		var hostname = url.parse(request.url).host;
		//console.log("Host for " + hostname + " received.");
		
		var queryString = url.parse(request.url, true).query;
		var afterToken = queryString["after"];
		
		response.writeHead(200, {"Content-Type": "text/html"});
		
		var requestUrl = "http://www.reddit.com/r/fullmoviesonyoutube.json";
	
	    if (afterToken != undefined)
		{
			requestUrl += "?after=" + afterToken;
		}
		
		//console.log(requestUrl);
		requestApi(requestUrl, function(error, localResponse, body) {
			var out = JSON.parse(body);
			
			var nextAfter = out["data"]["after"];
			
			var body = "<html><head><style>table{border:1px solid black;word-wrap: break-word;}td{max-width:700px}h1{color:green;font-size:40px}.bg { background-color: #E0E0E0 ; width: 100%; height: 100%; display: block; font-size:40px}</style></head><body><table border=1><tr>"
			for(var i in out["data"]["children"])
			{				
				if (i > 0 && i % 2 == 0)
				{
					body += "</tr><tr>";
				}
				
				body += "<td>";
				body += "<h1>"+ out["data"]["children"][i]["data"]["media"]["oembed"]["title"] + "</h1><p/>"
				body += "<img src=\""+ out["data"]["children"][i]["data"]["media"]["oembed"]["thumbnail_url"] + "\"/><p/>"
				body += out["data"]["children"][i]["data"]["media"]["oembed"]["description"] + "<p/>"
				body += "<span class=\"bg\" ><a href=\""+ out["data"]["children"][i]["data"]["media"]["oembed"]["url"] + "\">Link</a></span><p/>"
				body += "</td>";
			}
			body += "</tr></table>"
			
			if (afterToken != "null")
			{
				body += "<span class=\"bg\" ><a href = \"/?after=" + nextAfter + "\">Next</a></span>";
			}
			
			body += "</body></html>"
			
			response.write(body);
			response.end();
		});
	}
	
	var port = process.env.PORT || 80;
	http.createServer(onRequest).listen(port);
	//console.log("Server has started.");
