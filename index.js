const express=require("express")
const app=express()

const mongoose=require("mongoose")
mongoose.connect("mongodb://localhost/contest")

const User=mongoose.model("User",new mongoose.Schema({
    username:String,
    hash:String,
    email:String,
    meter:Number,//meterID
    signupDate:Date
}))

const Meter=mongoose.model("Meter",new mongoose.Schema({
    "where":{ //location of the meter
        "community":String,//name of the radio module
        "town":String,
        "state":String,
        "country":String
    },
    "owner":String,//username of the owner
    "ID":Number,//not to be confused with mongodb id, assumes all meters across providers have different ids
    //maybe include list of radio modules that cover this meter
}))

const AMREntry=mongoose.model("AMREntry",new mongoose.Schema({
    "Time":Number, //comes in as "2020-03-28T11:48:11.721448-04:00"
    "Offset":Number,
    "Length":Number,
    "Type":String, //should be SCM
    "Message":{
        "ID":Number,
        "Type":Number,//should be 5 or 7 or something
        "TamperPhy":Number,
        "TamperEnc":Number,
        "Consumption":Number,//kwh?5304698
        "ChecksumVal":Number //message structure varies based on the power meter, this may need adjustment in the future
    },
    "radioModule":{
        "name":String,
        "owner":String, //username of owner
        "id":String,
        "where":{ //location of the radio module, not the meter
            "town":String,
            "state":String,
            "country":String
        }
    }
}))
//get listings

app.post("/login",function(req,res){
    res.signedCookies()
}) //send back a token or a cookie? We'll do both

app.post("/register",function(req,res){

})

app.post("/claimMeter",function(req,res){

})

//submit meter data
app.get("/submitAmrJSON",function(req,res){
    //TODO add authentication to this endpoint to make sure the node sending the data is "valid". maybe some kind of signature from the server
    //{"Time":"2020-03-28T11:48:11.721448-04:00","Offset":0,"Length":0,"Type":"SCM","Message":{"ID":51276197,"Type":5,"TamperPhy":3,"TamperEnc":1,"Consumption":5304698,"ChecksumVal":38044}}

    //new Date("2020-03-28T11:48:11.721448-04:00")

    //rebuild shape of json to prevent random crap from getting put into mongo, make sure to flatten
    let og=JSON.parse(req.query.json)
    new AMREntry({
        Time:new Date(og["Time"]).getTime(),
        Offset:og["Offset"],
        Length:og["Length"],
        Type:og["Type"],
        Message:{
            ID:og["Message"]["ID"],
            Type:og["Message"]["Type"], 
            TamperPhy:og["Message"]["TamperPhy"],
            TamperEnc:og["Message"]["TamperEnc"],
            Consumption:og["Message"]["Consumption"],
            ChecksumVal:og["Message"]["ChecksumVal"]
        },
        radioModule:{
            name:req.query.name,
            owner:req.query.owner,
            id:req.query.id,
            where:{
                town:req.query.town,
                state:req.query.state,
                country:req.query.country
            }
        }
    }).save() //possible that the same transmission is caught by two radio modules!
    res.send("Thanks")
    //search for Meters to see if we have a record of the meter's location
})

app.get("/dump",function(req,res){
    AMREntry.find({},function(e,am){res.send(am)})
})

/**
 * 
 * @param {Array} entries - just two entries
 * @param {*} period 
 */
function getRunningAverage(entries,period)
{
    ((entries[1].Consumption-entries[0].Consumption)/(entries[1].Time-entries[0].Time))*1800*1000
}
/*
-time of last reported entry (last updated)
-current cumulative reading
-half-hour running average
*/

//hackathon version only goes town, community, meter
app.get("/meters/:country/:state/:town/",function(req,res){
    res.send(req.params)
})

app.get("/meters/:country/:state/:town/:community/", function(req,res){
    AMREntry.find({
            "radioModule.name":req.params.community,//community is defined for what the reciever can recieve
            "radioModule.where.town":req.params.town,
            "radioModule.where.state":req.params.state,
            "radioModule.where.country":req.params.country
    },null, {sort:"-Time"},function(e,objs){
        res.send(objs)
    })
})

app.get("/meters/:country/:state/:town/:community/:meter/",function(req,res){
    res.send(req.params)
})

app.get("/getspecificLimesting")

let listen=app.listen(9090,()=>{console.log(listen.address().port)})