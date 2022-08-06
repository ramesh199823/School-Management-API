const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const user = require("./userModel");
const student = require("./studentModel");
const otpCreate = require('./otpModel')
const attendance = require("./attendanceModel");
const assignment = require('./assignmentModel')
const multer = require('multer')
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');
uuidv4();
const dotenv = require("dotenv");
const client = require('twilio')('ACc71279d73f17e821dbc560d7cec01889', '001d6ca7473d394fec8101cb2845ab9d');
dotenv.config({ path: "./config.env" });
app.use(cors());
app.use(bodyParser.urlencoded({limit:'50mb', extended: false }));
app.use(bodyParser.json({limit:'50mb'}));

app.listen(3000, () => {
  console.log("server is running");
});
app.post("/signUp", (req, res) => {
  bcrypt.genSalt(11, (e, salt) => {
    bcrypt.hash(req.body.password, salt).then(async (hash) => {
      req.body.password = hash;
      const data = new user(req.body);
      data.userId = Math.random();
      const value = await data.save();
      if (value) {
        res.send({
          message: "Success",
        });
      }else{
        res.send({
          message: "Failure",
        });
      }
    }).catch((err) =>{
      res.send({
        message:"Failure",
        body:err
      })
    });
  });
});
app.get("/allUsers", (req, res) => {
  console.log(process.env.Secret_key);
  user.find((err, rese) => {
    if (!err) {
      res.send({
        body: rese,
      });
    }
  });
});
// cron.schedule('*/10 * * * * * ', ()=>{
//     client.messages
//     .create({
//        body: 'Hi Alwa, I love you',
//        from: '+1 970 557 7882',
//        to: '+91 88256 78279'
//      })
//     .then(message => console.log(message.sid));
// })
app.post("/login", (req, res) => {
  user.findOne({ email: req.body.email }).then((resa) => {
    if (!resa) {
      return res.send({
        message: "Failure",
      });
    }
    bcrypt.compare(req.body.password, resa.password).then((resp) => {
      if (!resp) {
        return res.send({
          message: "Failure",
        });
      }
      const token = jwt.sign(resp, process.env.Secret_key);

      return res.status(200).header("auth-token", token).send({
        message: "Success",
        body: resa,
        Headers: token,
      });
    });
  });
});

app.post("/generateOtp", (req, res) => {
    let email = req.body.email
    user.findOne({ email: email }).then((resa) => {
        if (!resa) {
          return res.send({
            message: "Failure",
          });
        }
        let otp = Math.floor(Math.random()*90000) + 10000;
        let value = `Your otp is: ${otp}`
        const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "vemburamesh376@gmail.com",
          pass: "pnyzcxfderymqxvn",
       },
     });
      const mailOptions = {
        from: "vemburamesh376@gmail.com",
        to: email,
        subject: "One Time Password",
        html: value
      };
     transporter.sendMail(mailOptions,async (err, rese) => {
       if (err) {
        return res.send({
            message: "Failure",
          });
       } else {
         let value = {
             email: email,
             otp : otp,
             createdAt: new Date()
         }
         let data = await new otpCreate (value).save()
         if(data){
             res.send({
                 message: "success"
             })
         }
       }
     });
    })
       
  });

 const storage = multer.diskStorage({
   destination :(req, file, cb)=>{cb(null, '/upload')},
   fileName:(req,file,cb)=>{cb(null, file.originalname)}
  })
const upload = multer({storage: storage})

app.post("/addStudent", upload.single('file'), async (req, res) => {
  const data = new student(req.body);
  const value = await data.save();
  if (value) {
    res.send({
      message: "Success",
    });
  }
});
app.get('/otpVerify', (req,res )=>{
    let email = req.query.email
    let checkingOtp = req.query.otp
    otpCreate.findOne({ email: email }).then((resa) => {
        if (!resa) {
          return res.send({
            message: "error",
          });
        }
       if(resa.otp == checkingOtp){
           return res.send({
            message: "Success",
           })
       }else{
        return res.send({
            message: "Failure",
          });
       }
    })
})
app.put('/newPassword', (req, res)=>{
    let email = req.body.email
    user.findOne({ email: email }).then( async (resa) => {
        if (!resa) {
          return res.send({
            message: "Failure",
          });
        }
        bcrypt.genSalt(11, (e, salt) => {
            bcrypt.hash(req.body.password, salt).then(async (hash) => {
              req.body.password = hash;
              let data = await user.findOneAndUpdate({email:email}, { $set:{password: req.body.password} })
                if(data){
                  res.send({
                  message: "Success",
                })
               }
            })
        })
      
    })
})
app.get("/getStudents", async (req, res) => {
  if (req.query) {
    if (req.query.filter != "undefined" && req.query.filter != "") {
      let id = parseFloat(req.query.userId);
      let filterValue = req.query.filter;
      let studentDetails = await student
        .find({
          $and: [
            { userId: id },
            { userName: { $regex: filterValue, $options: "i" } },
          ],
        })
        .sort({ userName: 1 })
        .limit(req.query.limit)
        .skip(req.query.skip);
      if (studentDetails) {
        res.send({
          message: "Success",
          body: studentDetails,
        });
      }
    } else {
      let id = parseFloat(req.query.userId);
      let studentDetails = await student
        .find({ userId: id })
        .sort({ userName: 1 })
        .limit(req.query.limit)
        .skip(req.query.skip);
      if (studentDetails) {
        res.send({
          message: "Success",
          body: studentDetails,
        });
      }
    }
  }
});
app.get("/getAllStudents", async (req, res) => {
    if (req.query) {
      let id = parseFloat(req.query.userId);
      let studentDetails = await student.find({ userId: id }).sort({ userName: 1 });
      if (studentDetails) {
        res.send({
          message: "Success",
          body: studentDetails
        });
      }
    }
  })
app.get("/getStudentsCount", async (req, res) => {
  if (req.query) {
    let id = parseFloat(req.query.userId);
    let studentDetails = await student.find({ userId: id });
    if (studentDetails) {
      res.send({
        message: "Success",
        body: studentDetails.length,
      });
    }
  }
});
app.delete("/deleteStudent", async (req, res) => {
  let id = req.query._id;
  let data = await student.findByIdAndDelete(id);
  if (data) {
    res.send({
      message: "Deleted",
    });
  }
});
app.put("/updateStudent", async (req, res) => {
  let id = req.query._id;
  let data = await student.findByIdAndUpdate(id, req.body);
  if (data) {
    res.send({
      message: "Success",
    });
  }
});
app.put("/updateUser", async (req, res)=> { 
    let id = req.query._id;
   let data = await user.findOneAndUpdate({userId : id} , req.body)
   if(data){
    res.send({
        message: "Success",
        body: data
      }); 
   }
})
app.put("/addNewAttendanceDetails", async(req, res)=>{
    const data = new attendance(req.body)
    const value = await data.save();
    if(value){
      res.send({
          message: "Success",
        });
    }
       
  })
app.put("/addAttendanceDetails", async(req, res)=>{
  const value = await attendance.collection.insertMany(req.body);
  if(value){
    res.send({
        message: "Success",
      });
  }
     
})
app.get("/getAttendance", async (req, res) => {
    if (req.query) {
      let id = parseFloat(req.query.userId);
      let atendanceDetails = await attendance.find({ userId: id }).sort({ date: 1 });
      if (atendanceDetails) {
        res.send({
          message: "Success",
          body: atendanceDetails
        });
      }
    }
  });
app.get('/todayAttendanceDetails', async (req, res)=>{
    if(req.query){
        let id = parseFloat(req.query.userId);
        let date = req.query.date
        let atendanceDetails = await attendance.find({ $and : [{userId: id}, {date : date}] })
        if(atendanceDetails){
            res.send({
                message: "Success",
                body: atendanceDetails
              });
        }
    }
})
app.delete('/deleteStudentAttendace', async(req, res)=>{
    if(req.query){
        let rollNumber =parseInt(req.query.rollNumber);
        let data = await attendance.deleteMany({rollNumber : rollNumber})
        if(data){
            res.send({
                message: 'success'
            })
        }
    }
})
app.put('/updateAttendanceDetails', async (req, res)=>{
  if(req.query){
      let rollNumber = parseInt(req.query.rollNumber)
      let data = await attendance.updateMany({rollNumber : rollNumber},{ $set : {userName: req.body.userName , rollNumber:rollNumber}})
      if(data){
        res.send({
            message: 'success'
        })
      }
  }
})
app.post('/addAssignments', async(req, res)=>{
    let data = new assignment(req.body);
    let value = await data.save();
    if(value){
      res.send({
        message: 'Success'
      })
    }else{
      res.send({
        message: 'Failure'
      })
    }
})
app.get('/getAssignments', async (req, res)=>{
  let rollNumber = req.query.rollNumber
  let subject = req.query.subject
  let assignmentDetails = await assignment.find(  {$and:[{ rollNumber: rollNumber }, { subject :subject}]})
  if(assignmentDetails){
    res.send({
      message:"Success",
      body: assignmentDetails
    })
  }
})
app.get('/getAssignmentBySubject', async (req,res)=>{
  let subject = req.query.subject;
  let id = req.query.userId;
  let data = await assignment.find({ $and : [{subject: subject}, {userId : id}]})
  if(data){
    res.send({
      message:'Success',
      body: data
    })
  }
})
mongoose.connect("mongodb://localhost:27017/school-management", (err) => {
  if (!err) console.log("db connected");
  else console.log("Error");
});
