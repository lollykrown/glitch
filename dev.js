const express = require('express')
const bodyParser = require('body-parser');
const app = express();
const debug = require("debug")("app:dev");
const axios = require('axios');
var cors = require('cors')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Set up CORS
app.use(cors())

function climateConvert(inputCsv) {

  /* Split input string by `,` and clean up each item */
  const arrayCsv = inputCsv.split(',').map(s => s.replace(/"/gi, '').trim())

  const outputJson = [];

  /* Iterate through input csv at increments of 7, to capture entire CSV row per iteration */
  for (let i = 2; i < arrayCsv.length; i += 2) {

    /* Extract CSV data for current row, and assign to named variables */
    const [year, data] = arrayCsv.slice(i, i + 2)

    /* Populate structured JSON entry for this CSV row */
    outputJson.push({
        year,
        data
      });
  }

  return outputJson;
}
app.post('/api', (req, res) => {
  (async function get() {
    try {
      const {csv} = req.body
      debug(csv)
      

      
      if (!csv || Object.entries(csv).length === 0) {
        debug("a valid csv object is required")
        res.status(400).json({
          status: 'failed',
          success: false,
          data: { message: "A valid csv object is required" }
        });
        return;
      }

      const {url, select_fields} = csv;

      if (!url || !url.endsWith('.csv')) {
        debug("a valid csv url is required")
        res.status(400).json({
          success: false,
          data: { message: "a valid csv url is required" },
        });
        return;
      }

      // Make a request for the csv file through the link
      const response = await axios.get(url)
      const json = climateConvert(response.data);

      res.status(200).json({
        // "conversion_key":conversion_key,
        "json":json
      })

    } catch (err) {
      console.log(err.stack);
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })();

  })



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error');
});

port = process.env.PORT || 8000
app.listen(port, function () {
  console.log(`Listening on port ${port}...`)
}) 