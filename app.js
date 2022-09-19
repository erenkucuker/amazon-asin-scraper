const express = require("express");
const app = express();
const port = 3000;
const fetcher = require("./example");
const puppeteer = require("puppeteer");
const mysql = require("mysql");
const dotenv = require('dotenv');

var browser;
var page;
var connection;

app.get("/asin/:asin/reqid/:reqId", async (req, res) => {
  connection.connect();
  browser = await puppeteer.launch({ headless: false });
  page = await browser.newPage();
  data = { fetched: false };
  fetcher.goToAsinPage(browser, page);

  try {
    data = await fetcher.fetchData(req.params.asin, browser, page);
  } catch (err) {
    console.log(err);
  }

  dbData = {
    request_id: req.params.reqId,
    sku: req.params.asin,
    buying_price: data.price,
    weight: data.weight,
    width: data.dimensions.width,
    height: data.dimensions.height,
    length: data.dimensions.length,
    product_image: data.image,
    product_name: data.title,
  };

  connection.query(
    "INSERT INTO `amazon_requests` SET ?",
    dbData,
    (err, results, fields) => {
      if (err) throw err;
    }
  );
  connection.end();
  return res.json(data);
});

app.listen(port, async () => {
  dotenv.config();
  console.log(`Example app listening on port ${port}`);
  connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });
});
