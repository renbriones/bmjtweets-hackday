/**
 * 
 */
var express = require('express');
var amqp = require('amqp');
var router = express.Router();

var app = express();

//create connection
app.connectionStatus = 'No server connection';
var connection = amqp.createConnection({host: 'bream.internal.bmjgroup.com'});

//create fixed array to hold tweet data
var Tweet = function(created, id, screen_name, language, text) {  
    this.dateCreated = created;
	this.id = id;
    this.screenName = screen_name;
    this.language = language;
    this.text = text;  
};  
  
var FixedQueueModule = require('./FixedQueue.js');
var tweets = new FixedQueueModule.FixedQueue( 50, []);
var tweetsId = new FixedQueueModule.FixedQueue( 50, []);

//add test data
router.init = function() {  
    tweets.unshift(new Tweet("xxxx",'459344600629776384', 'palmerlee', 'en', 'blah'));  
    tweets.unshift(new Tweet("xxxx", '459344537719037952', 'plumber', 'ja', 'blah blah'));  
    tweets.unshift(new Tweet("xxxx", '133640144317198338', 'smith', 'zh', 'zh blah blah'));  
}  


connection.on('ready', function(){
	app.connectionStatus = 'Connected';
	connection.exchange('bmj-tweets', {type: 'fanout',
								 autoDelete: false}, function(exchange){
									 
		//bmj-tweets
		connection.queue('tmp-' + Math.random(), {exclusive: true},
						 function(queue){
			queue.bind('bmj-tweets', '');
			console.log(' [*] Waiting for bmj-tweets. To exit press CTRL+C')

			//queue.subscribe({ack: true}, function(msg){
			queue.subscribe(function(msg){
				var msgStr = msg.data.toString('utf-8');
				console.log("Receiving [x] [%s] ", msgStr);
				
				var obj = JSON.parse(msgStr);
				
				var created = obj.created_at;
				var id = obj.id;
				var text = obj.text;
				var user = obj.user.screen_name;
				var language = obj.lang;
				
				//add check so it wont get duplicated
				if (tweetsId.indexOf(id) < 0)
				{
					tweetsId.unshift(id);
					tweets.unshift(new Tweet(created, id, user, language, text));
				}
				console.log(" [x] [%s] [%s] [%s] [%s]", id, user, language, text);
				console.log("===============bmj-tweets=============================");

				//q.shift();
			});
		});
				
	});
});		

/* GET home page. */
router.get('/', function(req, res){
	res.render('index.jade',
	    {
	      title: 'Welcome to RabbitMQ, Node/Express, Jade, JQuery, HTML Kickstart',
	      connectionStatus: app.connectionStatus,
	      tweets: tweets
	    });
});

/* GET embedded tweets page. */
router.get('/embedded-tweets', function(req, res){
	res.render('embedded-tweets.jade',
	    {
	      title: 'Embedded Tweets',
	      tweets: tweets
	    });
});

router.get('/animation', function(req, res){
	res.render('animation.jade',
	    {
	      title: 'Animation'
	    });
});

//Rest calls
router.get('/get-tweets', function(req, res){
	//router.init();  
	res.json(tweets);
});


////wordpress
router.get('/aberdeen-grades', function(req, res){
	var request = require("request");
	var jsonObject  = ""
	request("https://public-api.wordpress.com/rest/v1/sites/psylocke86.wordpress.com/posts/slug:univ1-application-process", function(error, response, body) {
		res.render('wordpress.jade',
			    {
			      title: 'Aberdeen University',	  
			      pageContent: JSON.parse(body).content
			    });
	});
});

router.get('/aberdeen-interviews', function(req, res){
	var request = require("request");
	var jsonObject  = ""
	request("https://public-api.wordpress.com/rest/v1/sites/psylocke86.wordpress.com/posts/slug:univ1-interviews", function(error, response, body) {
		res.render('wordpress.jade',
			    {
			      title: 'Aberdeen University',	  
			      pageContent: JSON.parse(body).content
			    });
	});
});

module.exports = router;
