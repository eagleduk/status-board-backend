require("dotenv").config();
const express = require("express");
const cors = require("cors");
const notion = require("@notionhq/client");

const app = express();

const port = process.env.BACKEND_PORT;

app.use(cors());

app.get("/schedules", async (req, res) => {
  const client = new notion.Client({
    auth: process.env.NOTION_API_KEY,
    notionVersion: "2022-06-28",
  });

  client.databases
    .query({
      database_id: "7399d5faac7b4ff3b4dc64a0eb40bf81",
      sorts: [
        {
          property: "date",
          direction: "ascending",
        },
        {
          property: "time",
          direction: "ascending",
        },
      ],
    })
    .then((response) => {
      const result = {};
      let latestCount = 0;

      response.results.forEach(({ id, properties }) => {
        const key = properties.date.date.start;
        let latest = false;
        if (latestCount === 0 && new Date(key).getTime() > Date.now()) {
          latestCount = 1;
          latest = true;
        }
        const obj = {
          id: id,
          latest: latest,
          date: properties.date.date.start,
          isHome: properties.home.checkbox,
          hour: properties.hour.number,
          time: properties.time.number,
          location: properties.location.rich_text.length
            ? properties.location.rich_text[0].text.content
            : null,
          team: properties.team.rich_text.length
            ? properties.team.rich_text[0].text.content
            : null,
          title: properties.title.title.length
            ? properties.title.title[0].text.content
            : null,
          place: properties.place.rich_text.length
            ? properties.place.rich_text[0].text.content
            : null,
        };
        result[key] = result[key] ? [...result[key], obj] : [obj];
      });

      res.status(200).send(result);
    })
    .catch((err) => res.status(err.status).send(err.message));
});

app.listen(port);
