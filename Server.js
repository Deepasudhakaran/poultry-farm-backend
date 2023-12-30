const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const {FarmModel,MortalityModel,EggModel,FeedModel,MedicineModel} =require('./models/Farm')
const bcrypt = require('bcrypt')
const jwt =require('jsonwebtoken')
const cookieParser = require('cookie-parser')
// const path =require('path')
// const multer = require('multer')
// const validator = require('validator'); 
 


const app= express()
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST","DELETE","PUT"],
  credentials:true
}))
app.use(express.json())
app.use(cookieParser())





async function createAdminUser() {
  const adminUsername = 'admin_123';
  const adminEmail = 'admin@gmail.com';
  const adminPassword = '12345678'; // Hash this password in production
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  try {
    // Find the admin user by username
    const existingAdmin = await FarmModel.findOne({ farmname: adminUsername });
    if (existingAdmin) {
      // If admin user exists, update the email and password
      existingAdmin.email = adminEmail;
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('Admin user updated successfully.');
    } else {
      // If admin user doesn't exist, create a new one
      await FarmModel.create({
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Admin user created successfully.');
    }
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
  }
}






mongoose.connect('mongodb://localhost:27017/farm',{
  useNewUrlParser: true ,
  useUnifiedTopology: true,
})
    createAdminUser()
    .then(() => console.log('connected to MongoDB'))
    .catch((err) => console.log(err));


const verifyUser = (req, res, next) =>{
  const token = req.cookies.token;
   if(!token){
    return res.json("the token is missing")
   } else {
    jwt.verify(token, "jwt-secret-key", (err, decoded) =>{
      if(err) {
        return res.json("the token is wrong")
      } else {
        req.email = decoded.email;
       next()
      }
    })

   }
}



app.get('/', verifyUser, (req, res) => {
    return res.json({email: req.email})
    
})


// // In the authenticateUser middleware

// const authenticateUser = (req, res, next) => {
//   const token = req.cookies.token;

//   if (!token) {
//     return res.status(401).json({ error: "Unauthorized: Token is missing" });
//   }

//   jwt.verify(token, "jwt-secret-key", (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ error: "Unauthorized: Invalid token" });
//     }

//     req.email = decoded.email;
//     req.role = decoded.role;
//     next();
//   });
// };



// const authorizeUser = (requiredRole) => {
//   return (req, res, next) => {
//     if (req.role !== requiredRole) {
//       return res.status(403).json({ error: "Forbidden: Insufficient privileges" });
//     }
//     next();
//   };
// };


// app.get('/protected-route', authenticateUser, (req, res) => {
//   return res.json({ message: "This is a protected route", email: req.email });
// });

// // Example: Applying authorization middleware to a route
// app.post('/admin-route', authenticateUser, authorizeUser('admin'), (req, res) => {
//   return res.json({ message: "This is an admin route", email: req.email });
// });














app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  // if (!validator.isEmail(email)) {
  //   return res.status(400).send('Invalid email format');
  // }
  bcrypt.hash(password, 10)
    .then(hash => {
      FarmModel.create({ username, email, password: hash, }) // Fixed: pass 'password' instead of 'confirmpassword'
        .then(user => res.json({ Status: "Success", role: user.role }))
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});



app.post('/login', (req, res) => {
  const { email, password } = req.body;

  FarmModel.findOne({ email: email })
    .then(user => {
      if (user) {
        bcrypt.compare(password, user.password, (err, response) => {
          if (err) {
            return res.status(500).json({ error: "Internal server error" });
          }
          if (response) {
            const token = jwt.sign({ email: user.email, role: user.role }, "jwt-secret-key", { expiresIn: '1d' });
            res.cookie('token', token);
            return res.json({ status: "Success", role: user.role });
          } else {
            return res.status(401).json({ error: "Incorrect password" });
          }
        });
      } else {
        return res.status(404).json({ error: "No record exists" });
      }
    })
    .catch(error => {
      console.error('Login error:', error);
    
      // Provide more details about the error in the response
      return res.status(401).json({ error: "Unauthorized: Invalid credentials", details: error.message });
    });
});

  


// -----mortality------

app.post('/mortality',verifyUser, async (req, res) => {
    try {
      const { date, selectedName, mortality } = req.body;
      const newUser = new MortalityModel({ date, selectedName, mortality });
      await newUser.save();
      res.status(201).json({ user: newUser }); // Include the saved user data in the response
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "internal server error" });
    }
  });
  


  app.get('/mortality',verifyUser, (req, res) => {
    MortalityModel.find()
    .then(musers => res.json(musers))
    .catch(err => res.json(err))
   });



   app.delete('/mortality/:id',verifyUser,  (req, res) => {
    const {id} = req.params;
    MortalityModel.findByIdAndDelete({_id: id})
    .then(musers => res.json(musers))
    .catch(err => res.json(err)) 
   });



  // ----egg----


  app.post('/egg', verifyUser, async (req, res) => {
    try {
      const { edate, enumber,broken, selectedName } = req.body;
      const newUser = new EggModel({edate, enumber,broken, selectedName});
      await newUser.save();
      res.status(201).json({ user: newUser }); // Include the saved user data in the response
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "internal server error" });
    }
  });
  


  app.get('/egg', verifyUser, (req, res) => {
    EggModel.find()
    .then(eusers => res.json(eusers))
    .catch(err => res.json(err))
   });



   app.delete('/egg/:id', verifyUser, (req, res) => {
    const {id} = req.params;
    EggModel.findByIdAndDelete({_id: id})
    .then(eusers => res.json(eusers))
    .catch(err => res.json(err))
   });

  //  ----feed-----



   app.post('/feed', verifyUser, async (req, res) => {
    try {
      const { selectedvalue, consume, receive, fdate } = req.body;
      const newUser = new FeedModel({selectedvalue, consume, receive, fdate});
      await newUser.save();
      res.status(201).json({ user: newUser }); // Include the saved user data in the response
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "internal server error" });
    }
  });
  


  app.get('/feed',verifyUser, (req, res) => {
    FeedModel.find()
    .then(fusers => res.json(fusers))
    .catch(err => res.json(err))
   });



   app.delete('/feed/:id', verifyUser, (req, res) => {
    const {id} = req.params;
    FeedModel.findByIdAndDelete({_id: id})
    .then(fusers => res.json(fusers))
    .catch(err => res.json(err))
   });

  

  //  ----medicine----


  app.post('/api/medicine', verifyUser, async (req, res) => {
    try {
      const { number, date, selectedmedicine } = req.body;
      const newUser = new MedicineModel({ number, date, selectedmedicine });
      await newUser.save();
      res.status(201).json({ user: newUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "internal server error" });
    }
  });
  
  app.get('/api/medicine',verifyUser, (req, res) => {
    MedicineModel.find()
    .then(musers => res.json(musers))
    .catch(err => res.json(err))
   });

 
// // Example: Allow only 'admin' users to access the delete route
// app.delete('/medicine/:id', authenticateUser, authorizeUser('admin'), (req, res) => {
//   const { id } = req.params;
//   MedicineModel.findByIdAndDelete({ _id: id })
//     .then(mdusers => res.json(mdusers))
//     .catch(err => res.json(err));
// });


  

// Example: Allow only 'admin' users to access the delete route
app.delete('/api/medicine/:id', verifyUser,  (req, res) => {
  const { id } = req.params;
  MedicineModel.findByIdAndDelete({ _id: id })
    .then(mdusers => res.json(mdusers))
    .catch(err => res.json(err));
});


// -----registered users----


app.get('/register',verifyUser, (req, res) => {
  FarmModel.find()
  .then(rusers => res.json(rusers))
  .catch(err => res.json(err))
 });



// --------logout-------

app.get('/logout',(req, res) =>{
  res.clearCookie('token');
  return res.json("Success")
})

  app.listen(8080 ,()=>{
    console.log("server Started")
  })