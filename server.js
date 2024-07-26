require("dotenv").config();
const express = require("express");
const { handleConnectToDB } = require("./db/connect");
const {
  handleGenerateShortUrl,
  handleCheckIfUrlExists,
  handleCheckIfShortUrlExists,
} = require("./db/services/handleGenerateShortUrl");

const promClient = require("prom-client"); //Prometheus for Metric Collection

const collectDefaultMetrics = promClient.collectDefaultMetrics;

collectDefaultMetrics({ register: promClient.register });

const app = express();
app.use(express.json());

const port = process.env.SERVER_PORT;

handleConnectToDB();

app.get("/", (req, res) => {
  return res.send("Hello World!");
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", promClient.register.contentType);
  return res.send(await promClient.register.metrics());
});

app.post("/", async (req, res) => {
  const { url } = req.body;
  if (!url) res.send(400, "No Url Provided");

  try {
    const existedUrl = await handleCheckIfUrlExists(url);
    if (existedUrl)
      return res.status(200).send({
        message: "Short Url already existed",
        shortUrl: existedUrl.shortUrl,
      });

    const generatedUrl = await handleGenerateShortUrl(url);

    if (generatedUrl)
      return res.status(201).send({
        message: "Short Url created successfully",
        shortUrl: generatedUrl.shortUrl,
      });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      message: "An Error Occoured, Please try again later",
    });
  }
});

app.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;
  try {
    const existedUrl = await handleCheckIfShortUrlExists(shortUrl);
    if (existedUrl) return res.redirect(existedUrl.originalUrl);
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      message: "An Error Occoured, Please try again later",
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
