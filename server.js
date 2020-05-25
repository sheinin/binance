const fetch = require("node-fetch");
const http = require('http');
const url = require('url')
const port = 3001
const hurl = 'https://www.binance.com/exchange-api/v1/public/asset-service/product/get-products'

const requestListener = function (req, res) {
  try {
    fetch(decodeURIComponent(url.parse(req.url,true).search.replace(/^\?/, '')), {
        method: "GET",
        crossDomain:true
      })
        .then(response => response.text())
        .then(data => {
          res.setHeader('Access-Control-Allow-Origin', '*');
	        res.setHeader('Access-Control-Request-Method', '*');
          res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.writeHead(200);
          res.end(data);
      })
  } catch(e) {}
}

http.createServer(requestListener).listen(port)