// Initialize app
var myApp = new Framework7();
 
// If we need to use custom DOM library, let's save it to $$ variable:
var $ = Dom7;
 
// Add view
var mainView = myApp.addView('.view-main', {
  // Because we want to use dynamic navbar, we need to enable it for this view:
  dynamicNavbar: true
});


function triggerSignIn(){
  $(document).trigger('signin');
}

function triggerSignOut(){
  $(document).trigger('signout');
}

function isSignedIn() {
  return true;
}

(function(){

  function addLocation(location) {
    var html = cLocationTemplate({
      'id' : location.id,
      'imageUrl' : location.logo_url
    });

    $('#locationsWrapper').append(html);
  }

  function verifyCode(code, locationId, userToken) {
    
    function onSuccess(){
      myApp.hidePreloader();
    }

    function onFail(){
      myApp.hidePreloader();
    }

    myApp.showPreloader(__n["modalEnterCodeBusy"]);


    $.ajax({
      url: host + apis['verify_code'],
      dataType: 'json',
      method: 'POST',
      data: {
        'location_id' : locationId,
        'code' : code
      },
      success: onSuccess,
      error: onFail
    });
  }

  function refreshEvents(){
    $('.location').on('click', function() {
        var locationId = $(this).attr('location-id');
        var userToken = "TODO";

        myApp.prompt(__n['modalEnterCodeMessage'], __n['modalEnterCodeTitle'], function (value) {
          // verify todays code here.
          verifyCode(value, locationId, userToken);
        });
    });
  }

  function refreshProperties(){
    $.getJSON(host + endPoint, null, function(result) {
      // need to implement caching of properties.
      lp = result['loyalty_programs'][programName];

      if (lp === undefined) {
        throw "Loyalty program does not exist";
      }

      var lp = result['loyalty_programs'][programName];
      lp['details']['locations'].forEach(function(location){
        addLocation(location);
        apis = lp['details']['endpoints'];
      });

      refreshEvents();

    }, 'json');


  }

  function onSignInClicked(e){

    // Display Buttons 
    var buttons = [
      [
        {
          'text' : __n['btnActionSignIn'],
          'onClick' : showSignIn
        },
        {
          'text': __n['btnActionCreateAccount']
        }
      ], 
      [
        {
          'text': __n['btnActionCancel']
        }
      ]
    ];

    myApp.actions(buttons);

  }

  function showSignIn(e){
    myApp.modalLogin('', __n['modalLoginTitle'], processSignIn);
  }

  function onSignInSuccess(e) {
    // Good Signin - 
    // Update the toolbar callback.
    window.location = 'toolbar://login/signin/success';
  }

  function processSignIn(username, password){
    console.log(username, password);
    onSignInSuccess();
  }

  // Get the json 
  var host = 'http://twinpines.lvh.me:3000';
  var endPoint = '/api/v2/twinpines/loyalty_programs.json';
  var programName = 'dining-passport';
  var apis = null;

  try{
    refreshProperties();
  } catch (ex) {
    // handle failures here.
  }


  var locationTemplate = $('script#locationTemplate').html();
  var cLocationTemplate = Template7.compile(locationTemplate);

  // Attach sign in handler
  $(document).on('signin', onSignInClicked);

  $('#signIn').on('click', triggerSignIn);

})();