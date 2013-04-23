var _FB;
var logLink
var outLink



var zoomFactor = 1;
var xPan = 0.0; // top left corner
var yPan = 0.0; // top left corner


window.fbAsyncInit = function() 
{
  // init the FB JS SDK
  FB.init({
    appId      : '489785564410684',                        // App ID from the app dashboard
    channelUrl : 'http://friendnet.herokuapp.com/channel.html', // Channel file for x-domain comms
    status     : true,                                 // Check Facebook Login status
    xfbml      : true                                  // Look for social plugins on the page
  });

  _FB = FB;
  logLink = document.getElementById("l1");
  outLink = document.getElementById("lOut")

  logLink.addEventListener("click", fbLogin, false);
  
  window.addEventListener('keydown', function(event){
   console.log("CharCode value: "+event.keyCode);
/*
W CharCode value: 87 fbload.js:23
A CharCode value: 65 fbload.js:23
S CharCode value: 83 fbload.js:23
D CharCode value: 68 fbload.js:23
O CharCode value: 79 fbload.js:23
L CharCode value: 76 
*/
    switch(event.keyCode)
    {
      case 87:
        yPan += -0.1;
        break;
      case 65:
        xPan += -0.1;
        break;
      case 83:
        yPan += 0.1;
        break;
      case 68:
        xPan += 0.1;
        break;
      case 79:
        zoomFactor += 0.1;
        break;
      case 76:
        zoomFactor += -0.1;
        break;
    }
  }, false);
  
  // Additional initialization code such as adding Event Listeners goes here


  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      logLink.innerHTML = 'Begin';
      outLink.innerHTML = 'Log Out';
      logLink.addEventListener("click", fbLogin, false);
      outLink.addEventListener("click", logOut, false);
    } else if (response.status === 'not_authorized'){
      // not_authorized
    } else {
      logLink.addEventListener("click", fbLogin, false);
    }
  });
};

// Load the SDK asynchronously
(function(d, s, id)
{
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "//connect.facebook.net/en_US/all.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));