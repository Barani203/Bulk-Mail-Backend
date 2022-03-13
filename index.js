const express = require("express");
let nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const creds = require("./credential.json");
const cors = require("cors");
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const URL ="mongodb+srv://Bulkmailtool:bulkmailtool@cluster0.cy8ue.mongodb.net?retryWrites=true&w=majority";
let app = express();
app.use(
  cors({
    origin: "*",
  })
);

const path = require("path");
const { getMaxListeners } = require("process");
app.use("/public", express.static(path.join(__dirname, "public")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: creds.auth.user,
    pass: creds.auth.pass,
  },
});

app.post("/mail", async (req, res, next) => {
  console.log(req.body.email);
  var email = req.body.email;
  var message = req.body.message;
  var subject = req.body.subject;
  var name = req.body.name;
  
  try {
    let connection = await MongoClient.connect(URL);
    let db = connection.db("Bulk_Mail_Tool");
    await db.collection("Mails").insertOne(req.body);
    connection.close();
    res.json({ message: "Mail Added" });
  } catch (error) {
    console.log(error);
  }

  const mailOptions = {
    from: name,
    to: email,
    subject: subject,
    html: `<br /> ${message}`,
  };

  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      res.json({
        status: "err",
      });
      console.log(err);
    } else {
      res.json({
        status: "Success",
      });
      console.log("Email Sent" + data.response);
    }
  });
});

transporter.verify(function (err, success) {
  if (err) {
    console.log(err);
  } else {
    console.log("Server is Ready to Take the Emails");
  }
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => console.info("Server has Started", PORT));
