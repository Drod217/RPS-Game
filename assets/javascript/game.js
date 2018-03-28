// Initialize Firebase
var config = {
  apiKey: "AIzaSyA1RrSy-PLubGUtSEUfmunlikqbrU8ezY8",
  authDomain: "rps1-d4893.firebaseapp.com",
  databaseURL: "https://rps1-d4893.firebaseio.com",
  projectId: "rps1-d4893",
  storageBucket: "rps1-d4893.appspot.com",
  messagingSenderId: "850250463968"
};
firebase.initializeApp(config);

//make variables
var player = "";
var icewins = 0;
var icelevel = 1;
var firewins = 0;
var firelevel = 1;
var draws = 0;
var fnolight = true;
var inolight = true;
var fchoice = "nada";
var ichoice = "nada";
var message = "";
var database = firebase.database();

// database.ref("/moves").set({
//   ilight : true,
//   flight: true,
//   firemove: "none",
//   icemove: "none",
// });

database.ref("/firechat").set({
  chat: "Are you there?"
});

database.ref("/icechat").set({
  chat: "No"
});



$(document).ready(function(){

//when the side is chosen
$(".pick").on("click",function(){
  var pickedChoice = $(this).attr("id");

  //if value of the button was fire, then player = fire
  if (pickedChoice === "fire") {
    player = "fire";
  }
  // else player = ice
  else{
    player = "ice";
  }

  //hide display1 and show display2
  $(".display1").hide();
  $(".display2").show();


});

// when a move is clicked
$(document).on("click",".move",function(database){
console.log("working" + "Player: " + player + "nolight: " + fnolight);

//if player is fire only and there is no green light
if ((player === "fire") && (fnolight)){

  console.log("isfiya");

  //log value of the button
    fchoice = $(this).attr("id");
    console.log("The choice is: " + fchoice);

    //change nolight to false
    fnolight = false;


    //store the move in the firebase in /firemove
    // Save the new price in Firebase
      firebase.database().ref("/moves").set({
      firemove: fchoice,
      icemove: ichoice,
      flight : false,
      ilight: inolight
    });

    console.log("possibly just changed data");
}

//if player is ice and there is no green light
else if ((player === "ice") && (inolight)){

  //when pick a move set
  ichoice = $(this).attr("id");
  console.log("The choice is: " + ichoice);

    //change no light to false
    inolight = false;
    $(".ilight").css("background-color", "green");

    //store the move in the firebase in /icemove
      firebase.database().ref("/moves").set({
      icemove: ichoice,
      firemove: fchoice,
      ilight : false,
      flight: fnolight
    });

  }
//else the green light is on
else{

  //alert that it is taken
  alert("Someone is currently playing, when the light is not green you may play.");
}
});

//whenever the database for fire move changes
database.ref("/moves").on("value", function(snapshot) {

    fnolight = snapshot.val().flight; //if someone else already put in something
    inolight = snapshot.val().ilight;
    fchoice = snapshot.val().firemove;
    ichoice = snapshot.val().icemove;

    //if fnolight is false, put the green light thing on
    if (fnolight === false){
      $(".flight").css("background-color", "green");
    }
    else if ((snapshot.val().ilight === true) && (snapshot.val().flight === true)){
      $(".flight").css("background-color", "transparent");
    }

    //same for inolight
    if (inolight === false){
      $(".ilight").css("background-color", "green");
    }
    else if ((snapshot.val().ilight === true) && (snapshot.val().flight === true)){
      $(".ilight").css("background-color", "transparent");
    }


    //if the child of icemove exists and also ilight is false
    if ((snapshot.val().ilight === false) && (snapshot.val().flight === false)){
      // display the pictures of both the moves
      displayMove(fchoice, ichoice);

      setTimeout(reload, 10000);

      //decide winner (pass in the moves)
      var winner = playGame(fchoice, ichoice);



      //update draws, levels, and stars
      updateScore(winner);

      //set the inolight and fnolight to true
      firebase.database().ref("/moves").set({
      icemove: ichoice,
      firemove: fchoice,
      flight : true,
      ilight: true
    });

    }
    });

//for the chat whenever, the send button gets sent
$(document).on("click",".hell",function(){
    message = $("input").val();
    //if its fire then save in firechat
    if (player === "fire"){
      database.ref("/firechat").set({
        chat: message
      });
    }

    // else if its ice, then save in icechat
    else{
      database.ref("/icechat").set({
        chat: message
      });
    }
});

//when fire chat changes
database.ref("/firechat").on("value", function(snapshot) {
  message = snapshot.val().chat;

  var pic = "<img src = './assets/images/rickavatar.jpeg'id ='r' >";

  //make div with avatar on left
  var m = $("<pclass = 'favatar'> </p>");
  $(m).append(pic);
  $(m).append(message);

  $(".panel-body").append(m);


});

//when ice chat changes
database.ref("/icechat").on("value", function(snapshot) {
  message = snapshot.val().chat;

  var pic = "<img src = './assets/images/Mortyavatar.png' id ='m' >";

  //make div with avatar on left
  var m = $("<p class = 'iavatar'> </p>");
  $(m).append(message);
  $(m).append(pic);

  $(".panel-body").append(m);


});

//function to display the pictures
function displayMove(fmove, imove){

  //for fireman

    //if fmove is rock append to html
    if (fmove === "rock"){
      $(".fhands").empty();
      $(".fhands").append("<img src = './assets/images/Rick.jpg' id ='h'>");
      $(".fhands").append("<img src = './assets/images/rickhand.jpg' id ='h'>");
    }
    //else if f move is paper append paper hand to html
    else if (fmove === "paper") {
      $(".fhands").empty();
      $(".fhands").append("<img src = './assets/images/Rick.jpg' id ='h'>");
      $(".fhands").append("<img src = './assets/images/rickhand.jpg' id ='h'>");

    }
    //else, append scissors hand to html
    else {
      $(".fhands").empty();
      $(".fhands").append("<img src = './assets/images/Rick.jpg' id ='h'>");
      $(".fhands").append("<img src = './assets/images/rickhand.jpg' id ='h'>");
    }

  //for imove

    //if imove is rock append rockhand to html
    if (imove === "rock"){
      $(".ihands").empty();
      $(".ihands").prepend("<img src = './assets/images/Mortyhand.jpg' id ='h'>");
      $(".ihands").append("<img src = './assets/images/Morty.jpg' id ='h'>");
    }
    //else if imove is paper append paper hand to html
    else if (imove === "paper"){
      $(".ihands").empty();
      $(".ihands").prepend("<img src = './assets/images/Mortyhand.jpg' id ='h'>");
      $(".ihands").append("<img src = './assets/images/Morty.jpg' id = 'iqueen' style = 'float :right;' >");
    }
    //else , append scissor hand to html
    else{
      $(".ihands").empty();
      $(".ihands").prepend("<img src = './assets/images/Mortyhand.jpg' id ='h'>");
      $(".ihands").append("<img src = './assets/images/Morty.jpg' id = 'iqueen' style = 'float :right;' >");
    }
}

//function to play game
function playGame(fchoice,ichoice){

    //fire winning combinations
    if (((fchoice === "scissors") && (ichoice ==="paper")) || (fchoice === "rock") && (ichoice ==="scissors") || (fchoice === "paper") && (ichoice ==="rock")){
      $(".fhands").empty();
      $(".fhands").append("<img src = './assets/images/Rick.jpg' id ='h'>");
      $(".fhands").append("<img src = './assets/images/ricky.gif' id ='h'>");
      firewins++;
      return "firelord";
    }

    //ice winning combinations
    else if (((ichoice === "scissors") && (fchoice ==="paper")) || (ichoice === "rock") && (fchoice ==="scissors") || (ichoice === "paper") && (fchoice ==="rock")){
      $(".ihands").empty();
      $(".ihands").append("<img src = './assets/images/Morty.jpg' id = 'iqueen' style = 'float :right;' >");
      $(".ihands").prepend("<img src = './assets/images/m.gif' id ='iqueen'>");
      icewins++;
      return "icequeen";
    }

    //else it is a draw
    else{
      alert("DRAW");
      draws++;
      return "draw";
    }

}

//function to update stars, levels, and draws
function updateScore(winner){

  //if winner is firelord
 if (winner === "firelord"){

    //if firewins is 10, up the level, and reset firewins
    if (firewins === 5){
      firelevel++;
      $(".flevel").html("Level: " + firelevel);
      firewins = 0;
    }
    //else
    else{

      
      $(".fstars").html("");

      //for the number of wins, append a star
      for (var i = 0; i < firewins; i++){
        $(".fstars").append("<img src = './assets/images/winner.png' id ='w'>");
      }
    }
  }

 
 else if (winner === "icequeen"){

    
    if (icewins === 5){
      icelevel++;
      $(".ilevel").html("Level: " + icelevel);
      icewins = 0;
    }
    //else
    else{

      
      $(".istars").html("");

      //for the number of wins, append a star
      for (var k = 0; k < icewins; k++){
        $(".istars").append("<img src = './assets/images/winner.png' id ='w'>");
      }
    }
  }

  //else it's a draw
   $(".draws").html("Draws: " + draws);
}

function reload() {
  console.log("hello");
}

});
