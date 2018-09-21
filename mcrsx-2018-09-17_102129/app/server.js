var express = require('express');
var app = express();

//app.use(express.static('public'));


var bodyParser = require('body-parser');
app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({ extended: false }));

///mongodb
var ObjectId = require('mongodb').ObjectID;
var mongo = require('mongodb').MongoClient;
var mongourl =  'mongodb://ihtiaz:1234@ds259117.mlab.com:59117/imongo';

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});


/******************************************/

app.get('/payslip/generate',function(req,res){
	res.sendFile( process.cwd() +'/views/payslip.html' );
});


///login
app.get('/login',function(req,res){
	res.sendFile( process.cwd() +'/views/login.html' );
});

///g2
app.get('/g2/profile',function(req,res){
	res.sendFile( process.cwd() +'/views/g2profile.html' );
});

app.get('/g2/settings',function(req,res){
	res.sendFile( process.cwd() +'/views/g2settings.html' );
});


///Advisor
app.get('/advisor/profile',function(req,res){
	res.sendFile( process.cwd() +'/views/adProfile.html');
});

app.get('/advisor/notification',function(req,res){
	res.sendFile( process.cwd() +'/views/adNotification.html');
});

app.get('/advisor/settings',function(req,res){
	res.sendFile( process.cwd() +'/views/adSettings.html');
});

app.get('/advisor/students',function(req,res){
	res.sendFile( process.cwd() +'/views/adStudents.html');
});

app.get('/advisor/sign',function(req,res){
	res.sendFile( process.cwd() +'/views/advisorsign.html');
});


///Student

app.get('/student/profile',function(req,res){
	res.sendFile( process.cwd() +'/views/stprofile.html');
});

app.get('/student/registration',function(req,res){
	res.sendFile( process.cwd() +'/views/stuForm.html');
});

app.get('/student/notification',function(req,res){
	res.sendFile( process.cwd() +'/views/stNotification.html');
});

app.get('/student/settings',function(req,res){
	res.sendFile( process.cwd() +'/views/stSettings.html');
});

///head
app.get('/head/profile',function(req,res){
	res.sendFile( process.cwd() +'/views/hdProfile.html');
});

app.get('/head/notification',function(req,res){
	res.sendFile( process.cwd() +'/views/hdNotification.html');
});

app.get('/head/settings',function(req,res){
	res.sendFile( process.cwd() +'/views/hdSettings.html');
});

app.get('/head/students',function(req,res){
	res.sendFile( process.cwd() +'/views/hdStudents.html');
});

app.get('/head/sign',function(req,res){
	res.sendFile( process.cwd() +'/views/headsign.html');
});

///////////////////



// registration form page
app.post('/student/registration',function(req,res) {
	//res.sendFile(process.cwd() + '/views/index.html');

	///courselist_4-1 table theke fetch korbo data
  var table = 'courselist_' + req.body.lvl+ '-' + req.body.term;
  console.log(table);
	mongo.connect(mongourl, function(err,db){
		var collection = db.collection(table);
		collection.find(  { "availability" : "true" } ).toArray( function(er,documents){
			if(er) console.log(er)
			res.send((documents));
		});
	});
  //res.sendFile(process.cwd() + '/views/regform.html');
});

// registration form fillup
app.post('/student/registration/formfillup',function(req,res) {
  
  var id = req.query.id;
  console.log('id is ' + id);
	mongo.connect(mongourl, function(err,db){
		var collection = db.collection('students');
		collection.find(  { sid : id} ).toArray( function(er,documents){
			if(er) console.log(er)
      console.log(documents);
			res.send((documents));
		});
	});
});

app.post('/updateregform',function(req,res){
  console.log('here is id updateregform ');
	console.log(req.query.id);
	var id  = req.query.id;
	mongo.connect(mongourl,function(err,db){
		var collection = db.collection('st_info');
    console.log(req.body);
    var obj = req.body;
    obj.result = JSON.parse(obj.result);
    obj.courses = JSON.parse(obj.courses);
    console.log(obj);
    var col = db.collection('progress_st_form');
    col.update({st_id: id}, {st_id: id, form_submit: true, advisor_approval: false, payment: false, head_approval: false, advisor: obj.advisor}, {upsert: true});
    collection.update(
       { sid: id }, obj, { upsert: true },
        function(){
        //res.send('success');
		   }
    
    );
    col = db.collection('advisor_notify');
    var tmp = {
      "st_id": id,
      "st_name": obj.name,
      "type": "form",
      "advisor": obj.advisor,
      "seen": false
    }
    col.update({st_id: id}, tmp, {upsert: true}),
      function(){
      console.log("we did it, notified");
        res.send('success');
      }
		
	});
});

///student registration progress
app.post('/student/registration/progress',function(req,res) {
	
  var id = req.query.id;
  console.log("id = " + id);
	mongo.connect(mongourl, function(err,db){
		var collection = db.collection('progress_st_form');
    // collection.update({ "advisor": id }, { $set: {"seen": true} }, { upsert: true });
		collection.find(  {"st_id" : id} ).toArray( function(er,documents){
      if (er) console.log(er);
      console.log(documents);
      res.send(documents);
    });
	});
});

app.post('/student/profile',function(req,res) {
	
  var id = req.query.id;
  console.log("id = " + id);
	mongo.connect(mongourl, function(err,db){
		var collection = db.collection('progress_st_form');
		collection.find(  { "st_id" : id } ).toArray( function(er,documents){
			//if(er) console.log(er);
      var col = db.collection('students');
      col.find({"sid": id}).toArray(function(error, doc2){
        if (error) console.log(error);
        var ret = [];
        ret.push(documents[0]);
        ret.push(doc2[0]);
        res.send(ret);
      });
		});
	});
});

//student badge notification profile
app.post('/student/profile/badge',function(req,res) {
	
  var id = req.query.id;
  console.log("id = " + id);
	mongo.connect(mongourl, function(err,db){
		var collection = db.collection('student_notify');
		collection.find(  {"sid" : id, "seen": false} ).toArray( function(er,documents){
      if (er) console.log(er);
      console.log(documents);
      res.send(documents);
    });
	});
});

///student notifications
app.post('/student/notification',function(req,res) {
	
  var id = req.query.id;
  console.log("id = " + id);
	mongo.connect(mongourl, function(err,db){
		var collection = db.collection('student_notify');
    // collection.update({ "advisor": id }, { $set: {"seen": true} }, { upsert: true });
		collection.find(  {"sid" : id} ).toArray( function(er,documents){
      if (er) console.log(er);
      console.log(documents);
      res.send(documents);
    });
	});
});

///student notification seen
app.post('/student/notification/seen',function(req,res) {
	
  var id = req.query.id;
  console.log("seen id = " + id);
	mongo.connect(mongourl, function(err,db){
    console.log('seen mongo');
		var col = db.collection('student_notify');
    // col.find(  {"advisor" : id, "seen": false} ).toArray( function(er,documents){
    //   if (er) console.log(er);
    //   console.log("seen + \n");
    //   console.log(documents);
    //   //res.send(documents);
    // });
    col.update({ "sid": id }, { $set: {seen: true} }, {multi: true}, { upsert: true })

      console.log('student database seen updated');
      res.send('success');
    
	});
});

///student registration payment
app.post('/student/registration/payslip',function(req,res) {
	
  var id = req.query.id;
  var ok = req.body;
  console.log('ok in payslip');
  console.log(ok);
  console.log("seen id = " + id);
	mongo.connect(mongourl, function(err,db){
    console.log('seen mongo');
		var coll = db.collection('progress_st_form');
    var col = db.collection('advisor_notify');
    var tmp = {
      "st_id": id,
      "st_name": ok.name,
      "type": "payslip",
      "advisor": ok.advisor,
      "seen": false
    }
    console.log("tmp in payslip");
    console.log(tmp);
    col.update({$and:[{st_id: id}, {type:"payslip"}]}, tmp, {upsert: true}),
      

    coll.update({ "st_id": id }, { $set: {payment: true} }, {multi: true}, { upsert: true })

      console.log('progress_st_form updated');
      res.send('success');
    
	});
});



///G2 courses get
app.post('/g2/profile',function(req,res) {
	//res.sendFile(process.cwd() + '/views/index.html');
  
  var id = req.query.id;
  console.log("id = " + id);
	///courselist_4-1 table theke fetch korbo data
	mongo.connect(mongourl, function(err,db){
		var collection = db.collection('courselist_4-1');
		collection.find({}).toArray( function(er,documents){
			if(er) console.log(er);
      var col = db.collection('g2s');
      col.find({"username": id}).toArray(function(error, doc2){
        if (error) console.log(error);
        var ret = documents;
        console.log(doc2);
        //ret.push(documents[0]);
        ret.push(doc2[0]);
        res.send(ret);
      });
		});
	});
  //res.sendFile(process.cwd() + '/views/regform.html');
});

///g2 fetch course all term
app.post('/g2/fetch',function(req,res) {
	//res.sendFile(process.cwd() + '/views/index.html');

	///courselist_4-1 table theke fetch korbo data
  var table = 'courselist_' + req.body.lvl+ '-' + req.body.term;
  console.log(table);
	mongo.connect(mongourl, function(err,db){
		var collection = db.collection(table);
		collection.find(  {} ).toArray( function(er,documents){
			if(er) console.log(er)
			res.send((documents));
		});
	});
  //res.sendFile(process.cwd() + '/views/regform.html');
});


///advisor profile
app.post('/advisor/profile',function(req,res) {
	
  var id = req.query.id;
  console.log("id = " + id);
	mongo.connect(mongourl, function(err,db){
		var collection = db.collection('advisors');
		collection.find(  { "username" : id } ).toArray( function(er,documents){
      if (er) console.log(er);
      res.send(documents);
		});
	});
});

///advisor progress
app.post('/advisor/profile/progress',function(req,res) {
	
  var id = req.query.id;
  console.log("student id = " + id);
  
	mongo.connect(mongourl, function(err,db){
		var collection = db.collection('progress_st_form');
		collection.find(  { "st_id" : id } ).toArray( function(er,documents){
      if (er) console.log(er);
      res.send(documents);
		});
	});
});

///student reg progress
app.post('/student/reg/progress',function(req,res) {
	
  var id = req.query.id;
  console.log("student id = " + id);
  
	mongo.connect(mongourl, function(err,db){
		var collection = db.collection('progress_st_form');
		collection.find(  { "st_id" : id } ).toArray( function(er,documents){
      if (er) console.log(er);
      res.send(documents);
		});
	});
});

///advisor progress 2
app.post('/advisor/profile/progress2',function(req,res) {
	
  var id = req.query.id;
  console.log("advisor id = " + id);
  
	mongo.connect(mongourl, function(err,db){
		var collection = db.collection('progress_st_form');
		collection.find(  { "advisor" : id } ).toArray( function(er,documents){
      if (er) console.log(er);
      res.send(documents);
		});
	});
});

//advisor badge notification profile
app.post('/advisor/profile/badge',function(req,res) {
	
  var id = req.query.id;
  console.log("id = " + id);
	mongo.connect(mongourl, function(err,db){
		var collection = db.collection('advisor_notify');
		collection.find(  {"advisor" : id, "seen": false} ).toArray( function(er,documents){
      if (er) console.log(er);
      console.log(documents);
      res.send(documents);
    });
	});
});

///ad notification
app.post('/advisor/notification',function(req,res) {
	
  var id = req.query.id;
  console.log("id = " + id);
	mongo.connect(mongourl, function(err,db){
		var collection = db.collection('advisor_notify');
    // collection.update({ "advisor": id }, { $set: {"seen": true} }, { upsert: true });
		collection.find(  {"advisor" : id} ).toArray( function(er,documents){
      if (er) console.log(er);
      console.log(documents);
      res.send(documents);
    });
	});
});


///advisor notification seen
app.post('/advisor/notification/seen',function(req,res) {
	
  var id = req.query.id;
  console.log("seen id = " + id);
	mongo.connect(mongourl, function(err,db){
    console.log('seen mongo');
		var col = db.collection('advisor_notify');
    // col.find(  {"advisor" : id, "seen": false} ).toArray( function(er,documents){
    //   if (er) console.log(er);
    //   console.log("seen + \n");
    //   console.log(documents);
    //   //res.send(documents);
    // });
    col.update({ "advisor": id }, { $set: {seen: true} }, {multi: true}, { upsert: true })

      console.log('database seen updated');
      res.send('success');
    
	});
});

///advisor sign
app.post('/advisor/sign',function(req,res) {
	
  var id = req.query.id;
  console.log("id = " + id);
	mongo.connect(mongourl, function(err,db){
		var collection = db.collection('st_info');
		collection.find(  { "sid" : id } ).toArray( function(er,documents){
      if (er) console.log(er);
      res.send(documents);
		});
	});
});

app.post('/g2/profile/updatecourse',function(req,res){
  console.log('g2update here');
	//console.log(req.query.id);
	var id  = req.query.id;
  
	mongo.connect(mongourl,function(err,db){
		var collection = db.collection('courselist_' + id);
    //console.log(JSON.Stringify(req.body));
    var cur = req.body;
    Object.keys(req.body).forEach(function(key){ cur = key; })
    cur = JSON.parse(cur);
    console.log(cur);
    
    
 
    for (var i=0; i<cur.length; i++){
      var x = cur[i];
        collection.update(
       { code: x }, { $set: {availability: "true"} }, { upsert: true },
        
    
      );
    }
    res.send('success');
   
    
    
		
	});
});

///logsubmit
app.post('/logsubmit',function(req,res) {
  console.log("logsubmit server");
   console.log(JSON.stringify(req.body));
   //res.send(req.body);
	mongo.connect(mongourl, function(err,db){
		var collection = db.collection('users');
    var obj = req.body;
		collection.find({"username" : obj.username}).toArray( function(er,documents){
			if(er) console.log(er)
			res.send((documents));
		});
	});
});

app.post('/signverdict',function(req,res) {
	
  var id = req.query.id;
  console.log("id = " + id);
  var tmp = req.body;
	mongo.connect(mongourl, function(err,db){
    if (tmp.verdict == "accept"){
      tmp.done= false;
      var coll = db.collection('progress_st_form');
      var dec = {};
      dec.st_id = id;
      dec.form_submit = true;
      dec.advisor_approval = true;
      dec.payment = false;
      dec.head_approval = false;
      dec.advisor = req.advisor;
      coll.update({st_id: id}, dec, {upsert: true}),
        function(){
        console.log("1st success");
      }
      tmp.seen = false;
      coll = db.collection('head_notify');
      coll.update({st_id: id}, tmp, {upsert: true}),
      function(){
      console.log("we did it, notified");
        res.send('success');
      }
    }
		var col = db.collection('student_notify');
    tmp.seen = false;
    tmp.type = "advisor";
    console.log('Notifying student by advisor');
    console.log(tmp);
		col.update({sid: id, type: "advisor"}, tmp, {upsert: true}),
      function(){
      console.log("we did it, notified");
        res.send('success');
      }
	
	});
});


///head
///ad notification
app.post('/head/notification',function(req,res) {
	
  var id = req.query.id;
  console.log("id = " + id);
	mongo.connect(mongourl, function(err,db){
		var collection = db.collection('head_notify');
		collection.find(  {} ).toArray( function(er,documents){
      if (er) console.log(er);
      console.log(documents);
      res.send(documents);
    });
	});
});

app.post('/headsignverdict',function(req,res) {
	
  var id = req.query.id;
  console.log("id = " + id);
  var tmp = req.body;
  tmp.done= false;
	mongo.connect(mongourl, function(err,db){
    if (tmp.verdict == "accept"){
      tmp.done= true;
      var coll = db.collection('progress_st_form');
      var dec = {};
      dec.st_id = id;
      dec.form_submit = true;
      dec.advisor_approval = true;
      dec.payment = true;
      dec.head_approval = true;
      dec.advisor = tmp.advisor;
      coll.update({st_id: id}, dec, {upsert: true}),
        function(){
        console.log("1st success");
      }
    }
    tmp.remarks = "Congratulations! Your course registration is complete.";
    if (tmp.verdict == "decline") tmp.remarks = "Your registration form was declined";
    tmp.seen = false;
		var col = db.collection('student_notify');
		col.update({sid: id}, tmp, {upsert: true}),
      function(){
      console.log("we did it, notified");
        res.send('success');
      }
	
	});
});

//head badge notification profile
app.post('/head/profile/badge',function(req,res) {
	
  //var id = req.query.id;
  //console.log("id = " + id);
	mongo.connect(mongourl, function(err,db){
		var collection = db.collection('head_notify');
		collection.find(  {"seen": false} ).toArray( function(er,documents){
      if (er) console.log(er);
      console.log(documents);
      res.send(documents);
    });
	});
});

//head profile progress
app.post('/head/profile/progress',function(req,res) {
	
  //var id = req.query.id;
  //console.log("id = " + id);
	mongo.connect(mongourl, function(err,db){
		var collection = db.collection('students');
		collection.find( {} ).toArray( function(er,documents){
      var col = db.collection('progress_st_form');
      col.find(  {head_approval: true} ).toArray( function(er3,doc){
        if (er3) console.log(er3);
        console.log(doc);
        var ret = {
          done: doc.length,
          total: documents.length
        }
        res.send(ret);
      });
      // if (er) console.log(er);
      // console.log(documents);
      // res.send(documents);
    });
	});
});

///head notification seen
app.post('/head/notification/seen',function(req,res) {
	
	mongo.connect(mongourl, function(err,db){
    console.log('seen mongo');
		var col = db.collection('head_notify');

    col.update({}, { $set: {seen: true} }, {multi: true}, { upsert: true })

      console.log('head_notify database seen updated');
      res.send('success');
    
	});
});

var tfsub = {
  "CSE-401" : ["System Analysis, Design and Development", 3.0],
  "CSE-402" : ["System Analysis, Design and Development Sessional", 1.5]
}


var fsub = {
  "CSE-401" : ["System Analysis, Design and Development", 3.0],
  "CSE-402" : ["System Analysis, Design and Development Sessional", 1.5],
  "CSE-403" : ["Artificial Intelligence", 3.0],
  "CSE-404" : ["Artificial Intelligence Sessional", 0.75],
  "CSE-406" : ["Computer Interfacing Sessional", 0.75],           
  "CSE-407" : ["Applied Statistics and Queuing Theory", 3.0],
  "CSE-405" : ["Computer Interfacing", 3.0],
  "CSE-421" : ["Graph Theory", 3.0],
  "CSE-427" : ["Digital Image Processing", 3.0],

  "CSE-311" : ["Numerical Analysis", 3.0],
  "CSE-315" : ["Digital System Design", 3.0],
  "CSE-317" : ["Data Communication", 3.0],
  "CSE-319" : ["Software Engineering", 3.0],


  "CSE-301" : ["Database Management System", 3.0],
  "CSE-303" : ["Compiler", 3.0],
  "CSE-304" : ["Compiler Sessional", 0.75],
  "CSE-308" : ["Operating System Sessional", 0.75],


  "CSE-213" : ["Computer Architecture", 3.0],
  "CSE-215" : ["Algorithms", 3.0],
  "CSE-216" : ["Algorithms Sessional", 3.0],
  "CSE-217" : ["Theory of Computation", 3.0],


  "CSE-201" : ["Digital Logic Design", 3.0],
  "CSE-202" : ["Digital Logic Design Sessional", 1.5],
  "CSE-203" : ["Data Structures", 3.0],
  "CSE-204" : ["Data Structures Sessional", 1.5],


}


