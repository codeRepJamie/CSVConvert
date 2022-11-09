const express = require('express')
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const {parse} = require('csv-parse');
const app = express()

const createCSV = require('./createCSV')
const clearTmpFiles = require('./clearTmpFiles')
const upload = multer({dest: 'tmp/csv/', limits: {fieldSize: 10 * 1024 * 1024}})
const port = process.env.PORT || 3001;

app.get("/", (req, res) => res.sendFile(path.join(__dirname, '/index.html')));

app.post("/upload_files", upload.single('file'), function (req, res, next) {
  const file = req.file
  const data = fs.readFileSync(file.path)
  parse(data, (err, records) => {
    if (err) {
      console.error(err)
      fs.rmdirSync(path)
      return res.status(400).json({success: false, message: 'An error occurred'})
    }
    createCSV({records}).then((path) => {
      res.download(path, 'file.csv', () => {
        clearTmpFiles('tmp/csv/')
      })
    }).catch(err => {
      return res.status(400).json({success: false, message: 'An error occurred'})
    })
  })
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));