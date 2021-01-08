const express = require('express')
const bodyParser = require('body-parser');
const app = express();
const debug = require("debug")("app:root");
const axios = require('axios');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const convertToJson = (inputCsv) => {

  /* Split input string by `,` and clean up each item */
  const arrayCsv = inputCsv.split(',').map(s => s.replace(/"/gi, '').trim())

  const outputJson = [];

  /* Iterate through input csv at increments of 7, to capture entire CSV row per iteration */
  for (let i = 7; i < arrayCsv.length; i += 7) {

    /* Extract CSV data for current row, and assign to named variables */
    const [firstName, lastName, age, dob, mobile, email, matricNumber] = arrayCsv.slice(i, i + 7)

    /* Populate structured JSON entry for this CSV row */
    outputJson.push({
        firstName,
        lastName,
        age,
        dob,
        mobile,
        email,
        matricNumber
      });
  }

  return outputJson;
}
const generateRandomString = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
app.post('/api', (req, res) => {
  (async function post() {
    try {
      const {csv} = req.body
      
      if (!csv || Object.entries(csv).length === 0) {
        // debug("a valid csv object is required")
        res.status(400).json({
          success: false,
          message: "A valid csv object is required"
        });
        return;
      }

      const {url, select_fields} = csv;

      // debug(url, select_fields)

      if (!url || !url.endsWith('.csv')) {
        // debug("a valid csv url is required")
        res.status(400).json({
          success: false,
          message: "a valid csv url is required"
        });
        return;
      }

      // Make a request for the csv file through the url in the csv object 
      const response = await axios.get(url)

      // debug('response',response.status);


      if (response.status !== 200) {
        res.status(400).json({
          success: false,
          message: "Something went wrong. Please check if the url is valid"
        });
        return;
      }

      const sampleJson =`"First Name", "Last Name", "Age", "DOB", "Mobile", "Email", "MatricNumber",
      "kayode", "agboola","35","1988/6/2", "07034750495","joe_kayu@yahoo.com","189234649",
      "seun", "adewale","31","1887/6/2", "09027133532","sewen@yahoo.com","457645866",
      "stanley", "agidiogun","44","1992/6/2", "09027156562","stan@gmail.com","98236e866",
      "ayomide", "ilori","23","2003/3/2", "09027089332","ayo@gmail.com","986645866"`;

      const json = convertToJson(response.data).map(({firstName, lastName, age}) => {
        return {'First Name':firstName, 'Last Name':lastName, 'Age': age}
      })

      const conversion_key = generateRandomString()
      // debug(conversion_key)
      // debug(json)

      res.status(200).json({
          "conversion_key":conversion_key,
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