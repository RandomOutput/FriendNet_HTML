var _FB;
var logLink
var outLink


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