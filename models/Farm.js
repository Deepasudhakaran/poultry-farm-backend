const mongoose = require('mongoose');

const FarmSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: "user"
  }
});
const mortalitySchema = new mongoose.Schema({
  date: String,
  selectedName: String,
  mortality: String
  
});

const EggSchema = new mongoose.Schema({
  edate:String,
   enumber: String,
   broken: String,
   selectedName: String
});

const FeedSchema = new mongoose.Schema({
  selectedvalue: String, 
  consume: String,
  receive: String, 
  fdate: String
})

const MedicineSchema = new mongoose.Schema({
  number:Number,
   date:String,
    selectedmedicine:String
})

const FarmModel = mongoose.model('users', FarmSchema);
const MortalityModel = mongoose.model('mortality', mortalitySchema);
const EggModel = mongoose.model('eggs', EggSchema);
const FeedModel = mongoose.model('feeds',FeedSchema);
const MedicineModel =mongoose.model('medicine',MedicineSchema)
module.exports ={FarmModel,MortalityModel,EggModel,FeedModel,MedicineModel };