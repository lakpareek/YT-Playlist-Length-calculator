import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const key = Your_API_KEY;

function isoTimeToSeconds(isoTime) {
  const durationRegex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  const match = isoTime.match(durationRegex);
  if (!match) {
    throw new Error("Invalid ISO time duration format.");
  }
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}
function secondsToHMS(seconds, formattedTime) {
  const hours = Math.floor(seconds / 3600).toFixed(0);
  const minutes = Math.floor((seconds % 3600) / 60).toFixed(0);
  const remainingSeconds = (seconds % 60).toFixed(0);
  formattedTime = `${hours} hours, ${minutes} mins, ${remainingSeconds} seconds`;
  return formattedTime;
}
app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get("/getPlaylistData", async (req, res) => {
  try {
    const vidIDs = [];
    let pID = "";
    const lenk = req.query.Link;
    for (let i = lenk.length - 1; i >= 0 && lenk[i] !== '='; i--) {
      pID = lenk[i] + pID;
    }
    const maxResultsPerPage = 50;
    let nextPageToken = null;
    let totalResults = 0;
    do {
      const result = await axios.get("https://www.googleapis.com/youtube/v3/playlistItems", {
        params: {
          key: "Your_API_KEY",
          part: "contentDetails",
          playlistId: pID,
          maxResults: maxResultsPerPage,
          pageToken: nextPageToken, 
        },
      });
      var playlistSize = result.data.pageInfo.totalResults;
      for (let i = 0; i < result.data.items.length; i++) {
        vidIDs.push(result.data.items[i].contentDetails.videoId);
      }
      
      nextPageToken = result.data.nextPageToken;
      totalResults = result.data.pageInfo.totalResults;
    } while (nextPageToken);
    
    var isoTime = await Promise.all(vidIDs.map(async (videoId) => {
      const response = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
        params: {
          key: "Your_API_KEY",
          id: videoId,
          part: "contentDetails",
        },
      });
      return response.data.items[0].contentDetails.duration;
    }));
    

    var answer = 0;
    for (var i = 0; i < isoTime.length; i++) {
      answer = answer + isoTimeToSeconds(isoTime[i]);
    }

    var ansAtTwo = answer / 2; 
    var ansAtDedh = answer/1.5;

    var Time1 = "";
    var Time2 = "";
    var Time3 = "";
    var Time4 = "";

    Time1 = secondsToHMS(answer, Time1);
    Time2 = secondsToHMS(ansAtDedh, Time2); 
    Time3 = secondsToHMS(ansAtTwo, Time3);

    var avgDur = answer/totalResults;
    Time4 = secondsToHMS(avgDur, Time3);
    res.render("index.ejs", { Time1, Time2, Time3, Time4, totalResults}); 
  } catch (error) {
    var errMess = "Link Not Valid, Please check it and try again";
    res.render("index.ejs", { errMess}); 
  }
});
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});