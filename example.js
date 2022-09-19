const puppeteer = require("puppeteer");
const shadowselector = require("puppeteer-shadow-selector");

async function fetchData(asin, browser, page) {
  let resultData = {};
  const input = await shadowselector.$(
    page,
    `#ProductSearchInput > kat-input::shadow-dom(input)`
  );
  if (input) await input.type(asin);
  await page.click("#ProductSearchInput > kat-button")
  .catch(async (err) => await browser.close())
  ;
try{
  await page
    .waitForSelector(
      "#product-detail-left > table > tbody > tr:nth-child(2) > td:nth-child(2)",
      { timeout: 5000 }
    )
    .catch(async (err) => await browser.close())
  await page
    .waitForSelector(
      "#product-detail-right > table > tbody > tr:nth-child(2) > td:nth-child(5)",
      { timeout: 5000 }
    )
    .catch(async (err) => await browser.close())
  }catch(err){
    await browser.close();
  }

  var weight = await page
    .$eval(
      "#product-detail-left > table > tbody > tr:nth-child(2) > td:nth-child(2)",
      (el) => el.innerText
    )
    .catch((err) => (weight = ""));
  var dimensions = await page
    .$eval(
      "#product-detail-left > table > tbody > tr:nth-child(3) > td:nth-child(2)",
      (el) => el.innerText
    )
    .catch((err) => (dimensions = ""));
  var price = await page
    .$eval(
      "#product-detail-right > table > tbody > tr:nth-child(2) > td:nth-child(5)",
      (el) => el.innerText
    )
    .catch((err) => (price = ""));


    var title = await page
    .$eval(
      "#product-detail-left > table > thead > tr > td > kat-link",
      (el) => el.label
    )
    .catch((err) => (title = ""));


    var image = await page
    .$eval(
      "#product-detail-left > img",
      (el) => el.src
    )
    .catch((err) => (image = ""));

  [height, width, length] = dimensions
    .replaceAll(" ", "")
    .replaceAll("inches", "")
    .split("X");
  let priceArray = price.split("+");
  price = priceArray[0].replaceAll("$", "").replaceAll(" ", "");
  weight = weight.replaceAll(" pounds", "");

  await page.click("#ProductSearch > div > div:nth-child(2) > kat-button")
  .catch(async (err) => await browser.close())
  ;
  await page.screenshot({ path: "example.png" });
  await browser.close();
  resultData = {
    fetched:true,
    weight: weight,
    dimensions: { height: height, width: width, length: length },
    price: price,
    title:title,
    image:image
  };
  return resultData;
}

async function goToAsinPage(browser, page) {
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });
  await page.goto(
    "https://sellercentral.amazon.com/fba/profitabilitycalculator/index?ref=RC2&lang=en_US"
  );
  await page.waitForSelector(
    "#root > kat-modal > div > kat-button.spacing-top-small",
    { timeout: 5000 }
  );
  await page.screenshot({ path: "start.png" });
  await page.click("#root > kat-modal > div > kat-button.spacing-top-small");
  await page.waitForSelector(
    "#ProductSearch > kat-box > kat-button-group > kat-button:nth-child(1)",
    { timeout: 5000 }
  );
  await page.click(
    "#ProductSearch > kat-box > kat-button-group > kat-button:nth-child(1)"
  );
}

module.exports = { fetchData, goToAsinPage };
