var http = require("http");
var url = require("url");
var requestApi = require("request");
var async = require("async");


	function onRequest(request, response) {
		
		console.log("In OnRequest");
		console.log(request.url);
		
		if (request.url === '/undefined') {
			response.writeHead(200, {'Content-Type': 'image/x-icon'});
			response.end();
			return;
		  }
		
		var queryString = url.parse(request.url, true).query;
		var service = queryString.service;
		var afterToken = queryString.after;
		
		response.writeHead(200, {"Content-Type": "text/html"});
		
		var requestUrl = "";
		
		if (service == "vimeo")
		{
			requestUrl = "http://www.reddit.com/r/Fullmoviesonvimeo.json";
		}
		else if (service == "youtube")
		{
			requestUrl = "http://www.reddit.com/r/Fullmoviesonyoutube.json";
		}
			
        if (afterToken !== undefined)
		{
			requestUrl += "?after=" + afterToken;
		}
		
		console.log(requestUrl);
		if (requestUrl === undefined)
		{
			console.log("undefined url");
		}
		
		requestApi(requestUrl, function(error, localResponse, body1) {
		
			if (error)
			{
				console.log(error);
				console.log(body1);
			}
			
			var out = JSON.parse(body1);
			
			var nextAfter = out.data.after;
			
			var body = "<html><head><style>table{border:1px solid black;word-wrap: break-word;}td{max-width:700px}h1{color:green;font-size:40px}.bg { background-color: #E0E0E0 ; width: 100%; height: 100%; display: block; font-size:40px}</style></head><body><table border=1><tr>";

			var urlList = [];
			for(var i in out.data.children)
			{				
				var title = out.data.children[i].data.title;
				
				var openingParenLocation = title.indexOf("(") - 1;
				var processedTitle = title.substring(0, openingParenLocation);

				var imdbUrl = "http://www.omdbapi.com/?customId=" + i + "&t=" + processedTitle;
				
				urlList[i] = imdbUrl;
			}
			
			var fun = function(url2, callback){
									//console.log("Url2: " + url2);
									if (url2 === undefined)
									{
										callback(null, "");
									}
									
									requestApi(url2, function(rottenError, rottenResponse, rottenBody) {
										
										var year = "";
										var rating = "";
										var plot = "";
										
										var out1 = ""
										try
										{
											out1 = JSON.parse(rottenBody);
											year = out1.Year;
											rating = out1.imdbRating;
											plot = out1.Plot;
										}
										catch (err)
										{
											year = "N/A";
											rating = "N/A";
											plot = "N/A";
										}
										
										if (plot === undefined || plot == "N/A")
										{
											if (service == "youtube")
											{
												plot = out.data.children[i].data.media.oembed.description;
											}
										}
										
										if (year === undefined)
										{
											year = "N/A";
										}
										
										if (rating === undefined)
										{
											rating = "N/A";
										}
										
										var urlString = rottenResponse.req.res.request.uri.href;
										
										var rottenQuery = url.parse(urlString, true).query;
										var customId = parseInt(rottenQuery.customId, 10);
								
										var redditTitle = "";
										
				
										redditTitle = out.data.children[customId].data.title;
										
										
										var rottenBody = "";
										rottenBody += "<td>";
										rottenBody += "<h1>"+ redditTitle + "</h1><p/>";
										
										if (service == "youtube")
										{
											if (out.data.children[customId].data.media)
											{
											rottenBody += "<img src=\""+ out.data.children[customId].data.media.oembed.thumbnail_url + "\"/><p/>";
											}
											rottenBody += plot + "<p/>";
											rottenBody += "<b>Year:</b> " + year + "  <b>Audience Rating:</b> " + rating +  "<p/>";
											rottenBody += "<span class=\"bg\" ><a href=\""+ out.data.children[customId].data.url + "\">Link</a></span><p/>";
										}
										else if (service == "vimeo")
										{
											var poster = out1.Poster;
											
											if (poster === undefined || poster == "N/A")
											{
												poster = "http://ia.media-imdb.com/images/M/MV5BMTYyNjY3Nzg4MV5BMl5BanBnXkFtZTcwMzYxMzczMw@@._V1_SX300.jpg";
											}
											rottenBody += "<img src=\"" + poster + "\"/><p/>";
											rottenBody += plot + "<p/>";
											rottenBody += "<b>Year:</b> " + year + "  <b>Audience Rating:</b> " + rating +  "<p/>";
											rottenBody += "<span class=\"bg\" ><a href=\""+ out.data.children[customId].data.url + "\">Link</a></span><p/>";
										}
										
										rottenBody += "</td>";
										
										callback(null, rottenBody);
									});
					};
					
			async.map(urlList, fun,
	
				function(err, results){

					console.log("In map");
					for(var i in results)
					{
                        if (i > 0 && i % 2 === 0)
						{
							body += "</tr><tr>";
						}

						body += results[i];
					}
					
					body += "</tr></table>";
			
					if (afterToken != "null")
					{
						body += "<span class=\"bg\" ><a href = \"/?service=" + service + "&" + "after=" + nextAfter + "\">Next</a></span>";
					}
					
					body += "</body></html>";
					
					response.write(body);
					response.end();
				});


		});
	}
	
	var port = process.env.PORT || 80;
	http.createServer(onRequest).listen(port);
