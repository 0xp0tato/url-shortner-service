const { nanoid } = require("nanoid");
const { Urls } = require("../models/urls");

async function handleGenerateShortUrl(url) {
  const shortUrl = nanoid(8);
  const result = await Urls.create({
    originalUrl: url,
    shortUrl,
  });

  return result;
}

async function handleCheckIfUrlExists(url) {
  const result = await Urls.findOne({
    where: {
      originalUrl: url,
    },
  });

  return result;
}

async function handleCheckIfShortUrlExists(url) {
  const result = await Urls.findOne({
    where: {
      shortUrl: url,
    },
  });

  return result;
}

module.exports = {
  handleGenerateShortUrl,
  handleCheckIfUrlExists,
  handleCheckIfShortUrlExists,
};
