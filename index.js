const express=require("express")
const app=express()

const mongoose=require("mongoose")

const Owner=mongoose.model("Owner",new mongoose.Schema({
    username:String,
    hash:String,
    email:String,
    meter:Number,//meterID
    signupDate:Date
}))

const Meter=mongoose.model("Meter",new mongoose.Schema({
    "where":{ //location of the meter
        "community":String,
        "town":String,
        "state":String,
        "country":String
    },
    "owner":String,//username of the owner
    "ID":Number,//not to be confused with mongodb id, assumes all meters across providers have different ids
    //maybe include list of radio modules that cover this meter
}))

const AMREntry=mongoose.model("AMREntry",new mongoose.Schema({
    "Time":Date, //comes in as "2020-03-28T11:48:11.721448-04:00"
    "Offset":Number,
    "Length":Number,
    "Type":String,
    "Message":{
        "ID":Number,
        "Type":Number,//should be 5 or 7 or something
        "TamperPhy":Number,
        "TamperEnc":Number,
        "Consumption":Number,//kwh?5304698
        "ChecksumVal":Number
    },
    "radioModule":{
        "name":String,
        "owner":String, //username of owner
        "id":String,
        "where":{ //location of the radio module, not the meter
            "community":String,
            "town":String,
            "state":String,
            "country":String
        }
    }
}))
//get listings

//submit meter data
app.get("/submitAmrJson",function(req,res){
    //TODO add authentication to this endpoint to make sure the node sending the data is "valid". maybe some kind of signature from the server
    //{"Time":"2020-03-28T11:48:11.721448-04:00","Offset":0,"Length":0,"Type":"SCM","Message":{"ID":51276197,"Type":5,"TamperPhy":3,"TamperEnc":1,"Consumption":5304698,"ChecksumVal":38044}}

    //new Date("2020-03-28T11:48:11.721448-04:00")

    //rebuild shape of json to prevent random crap from getting put into mongo
    new AMREntry({}).save() //possible that the same transmission is caught by two radio modules!
})

//hackathon version only goes town, community, meter
app.get("/meters/:country/:state/:town/",function(req,res){
    res.send(req.params)
})

app.get("/meters/:country/:state/:town/:community/",function(req,res){
    res.send(req.params)
})
app.get("/meters/:country/:state/:town/:community/:meter/",function(req,res){
    res.send(req.params)
})

app.get("/getspecificLimesting")

let listen=app.listen(9090,()=>{console.log(listen.address().port)})