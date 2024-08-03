require("dotenv").config();
const express = require("express");
const { handleConnectToDB } = require("./db/connect");
const {
  handleGenerateShortUrl,
  handleCheckIfUrlExists,
  handleCheckIfShortUrlExists,
} = require("./db/services/handleGenerateShortUrl");
const path = require("path");
const cors = require("cors");

const promClient = require("prom-client"); //Prometheus for Metric Collection

const collectDefaultMetrics = promClient.collectDefaultMetrics;

collectDefaultMetrics({ register: promClient.register });

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const port = process.env.SERVER_PORT;
const host = process.env.SERVER_HOST;

handleConnectToDB();

app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", promClient.register.contentType);
  return res.send(await promClient.register.metrics());
});

app.post("/", async (req, res) => {
  const { url } = req.body;
  if (!url) res.send(400, { message: "No Url Provided" });

  const urlRegex =
    /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g;

  if (!urlRegex.test(url)) return res.send(400, { message: "Invalid Url" });

  try {
    const existedUrl = await handleCheckIfUrlExists(url);
    let shortUrl;
    if (existedUrl) {
      shortUrl = `${host}/${existedUrl.shortUrl}`;
      return res.status(200).send({
        message: "Short Url already existed",
        shortUrl: shortUrl,
      });
    }

    const generatedUrl = await handleGenerateShortUrl(url);

    if (generatedUrl) {
      shortUrl = `${host}/${generatedUrl.shortUrl}`;
      return res.status(201).send({
        message: "Short Url created successfully",
        shortUrl: shortUrl,
      });
    }
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
