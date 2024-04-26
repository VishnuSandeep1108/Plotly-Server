const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer({dest: "./uploads"});
const cors = require("cors");
const fs = require("fs");
const path = require('path');
const xlsx = require("xlsx");

const app = express();
app.use(cors());

app.listen(8000, ()=>{console.log("Port 8000 Started");})

app.post("/saveFile",upload.single("files"),(req,res)=>{
    res.send(req.file.filename);
});

app.get("/extractData", (req,res)=>{
    const fileName = req.query.fileName;
    const iteration = req.query.iteration;
    const filePath = __dirname+`//uploads//${fileName}`;

    let plotData = [];
    let xData = [];
    let yData = [];

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const workSheet = workbook.Sheets[sheetName];
    const range = xlsx.utils.decode_range(workSheet['!ref']);

    let start = (50*iteration)+1;
    let end = Math.min(((50*iteration)+50),range.e.r);

    for(let i=start;i<=end;i++)
    {
        let firstCell = workSheet[xlsx.utils.encode_cell({ r: i, c: 0 })];
        if(firstCell)
        xData.push(firstCell.w);
        let secondCell = workSheet[xlsx.utils.encode_cell({ r: i, c: 1 })];
        if(secondCell)
        yData.push(secondCell.w);
    }

    plotData.push(xData);
    plotData.push(yData);
    if(end === range.e.r)
    plotData.push(true);
    else
    plotData.push(false);

    res.send(plotData);
})

app.get("/deleteFile",(req,res)=>{
    const {fileName} = req.query;

    const filePath=path.join(__dirname+`//uploads//${fileName}`);
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(`Error deleting file ${fileName}:`, err);
        } else {
            console.log(`File ${filePath} deleted successfully`);
            res.send("Delete Success");
        }
    });
})