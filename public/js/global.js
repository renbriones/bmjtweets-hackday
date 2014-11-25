/**
 * 
 */

pathname = "http://localhost:3000";


$(window).load(function (){
	tweetDisplay();
	embeddedTweetDisplay();
	switchDisplay()
});


function switchDisplay(){	
	
	$( "#toggle" ).click(function() {
		  //alert( "Handler for .click() called." );
		if($("#tweets").is(":visible"))
		{
			$("#tweets").hide();
			$("#embedded-tweets").show();
			$( "#toggle" ).text('Switch to table display');   
		}
		else
		{
			$("#tweets").show();
			$("#embedded-tweets").hide();
			$( "#toggle" ).text('Switch to embedded display');
		}
	});
}

//Display tweet table
function tweetDisplay(){	
	if($('div#tweets').length > 0){
		updateTweets();
		setInterval(function(){updateTweets();}, 1000);
	}
}

//Fill table with data
function updateTweets() {

    // Empty content string
    var tableContent = '';
    var filterLanguage = $("input#filterLang").val();
    

    // jQuery AJAX call for JSON
    $.getJSON( '/get-tweets', function( data ) {

    	// For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
        	if (!filterLanguage.trim() || filterLanguage == this.language) {
            	tableContent += '<tr>';
                tableContent += '<td>' + this.id + '</td>';
                tableContent += '<td>' + this.screenName + '</td>';
                tableContent += '<td>' + this.dateCreated + '</td>';
                tableContent += '<td>' + this.language + '</td>';
                tableContent += '<td>' + this.text + '</td>';
                tableContent += '</tr>';
        	}
        });

        // Inject the whole content string into our existing HTML table
        $('#tweets table tbody').html(tableContent);
    });
};

//Display embedded tweet
function embeddedTweetDisplay(){	
	//alert('here')
	if($('div#embedded-tweets').length > 0){
		updateEmbeddedTweets();
		//alert('here here')
		setInterval(function(){updateEmbeddedTweets();}, 10000);
	}
}

function updateEmbeddedTweets() {
	//alert('here here here')
    // Empty content string
    var content = '';
    var filterLanguage = $("input#filterLang").val();
    
    // jQuery AJAX call for JSON
    $.getJSON( '/get-tweets', function( data ) {

    	// For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
        	if (!filterLanguage.trim() || filterLanguage == this.language) {
	        	content += '<blockquote class="twitter-tweet">';
	        	content += this.text;
	        	content += '<a href="https://twitter.com/twitterapi/status/' + this.id +
	        	'" data-datetime="' + this.dateCreated + '">' + this.dateCreated + '</a>';
	        	content += '</blockquote>';
        	}
        });

        content += '<script src="//platform.twitter.com/widgets.js" charset="utf-8"></script>';
        
        // Inject the whole content string into our existing HTML table
        $('#embedded-tweets').html(content);
    });
};