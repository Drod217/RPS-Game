var config = {
    apiKey: "AIzaSyA1RrSy-PLubGUtSEUfmunlikqbrU8ezY8",
    authDomain: "rps1-d4893.firebaseapp.com",
    databaseURL: "https://rps1-d4893.firebaseio.com",
    projectId: "rps1-d4893",
    storageBucket: "rps1-d4893.appspot.com",
    messagingSenderId: "850250463968"
  };
  firebase.initializeApp(config);
  var database = firebase.database();

  var pOne = {
    choice: "",
    losses: 0,
    name: "",
    wins: 0
  };

  var pTwo = {
    choice: "",
    losses: 0,
    name: "",
    wins: 0
  };

  var nameInput = 0;
  var pId = "";
  var pOneActive = 0;
  var pTwoActive = 0;
  var won = "";
  var games = 1;

  $("#submit-name").on("click", function(event){
    event.preventDefault();
    var isConnected;
    if(nameInput === 0) {
      var name = $("#player-name").val().trim();
      if(pOneActive === 1 && pTwoActive === 1) {
        alert("Sorry, there are already two players.");
      }
      else if(pOneActive === 0) {
        isConnected = database.ref("players/pOne");
        $("#pOne").text(name);
        $("#pOne-statistics").removeClass("opacity-zero");
        $("#pOne-wins").text(pOne.wins);
        $("#pOne-losses").text(pOne.losses);
        nameInput = 1;
        pOneActive = 1;
        pId = "pOne";
        database.ref("players/pOne").set({
          name: name,
          losses: pOne.losses,
          wins: pOne.wins
        });
        isConnected.onDisconnect().remove();
      }
      else {
        isConnected = database.ref("players/pTwo");
        nameInput = 1;
        pTwoActive = 1;
        pId = "pTwo";
        $("#pTwo").text(name);
        $("#pTwo-statistics").removeClass("opacity-zero");
        $("#pOne-wins").text(pOne.wins);
        $("#pOne-losses").text(pOne.losses);
        database.ref("players/pTwo").set({
          name: name,
          losses: pTwo.losses,
          wins: pTwo.wins
        });
        isConnected.onDisconnect().remove();
      }
    }
    $("#player-name").val("");
  }); 

database.ref("/players").on("value", function(snapshot){
  if(snapshot.hasChild("pOne")) {
    pOneActive = 1;
    pOne.name = snapshot.val().pOne.name;
    pOne.losses = parseInt(snapshot.val().pOne.losses);
    pOne.wins = parseInt(snapshot.val().pOne.wins);
    pOne.choice = snapshot.val().pOne.choice;
    $("#pOne-wins").text(pOne.wins);
    $("#pOne-losses").text(pOne.losses);
    $("#pOne-statistics").removeClass("opacity-zero");
    $("#pOne").text(pOne.name);
  }

  if(snapshot.hasChild("pTwo")) {
    pTwoActive = 1;
    pTwo.name = snapshot.val().pTwo.name;
    pTwo.losses = parseInt(snapshot.val().pTwo.losses);
    pTwo.wins = parseInt(snapshot.val().pTwo.wins);
    pTwo.choice = snapshot.val().pTwo.choice;
    $("#pTwo-wins").text(pTwo.wins);
    $("#pTwo-losses").text(pTwo.losses);
    $("#pTwo-statistics").removeClass("opacity-zero");
    $("#pTwo").text(pTwo.name);
  }

  if(pTwoActive === 1 && pOneActive === 0)
    $("#winner").text("Waiting for Player One");
}, function(errorObject){
  console.log("The read failed: " + errorObject.code);
});

database.ref("/players").on("child_removed", function(snapshot){
  if(snapshot.key === "pTwo") {
    pTwoActive = 0;
    $("#pTwo-losses").empty();
    $("#pTwo-wins").empty();
    $("#pTwo").text("Waiting!");
    $("#pTwo-statistics").addClass("opacity-zero");
    $("#options-one").addClass("opacity-zero");
    pTwo.losses = 0;
    pTwo.wins = 0;
    pTwo.name = "";
    pOne.choice = "";
    pTwo.choice = "";
    database.ref("players/pOne").update({
      "choice": null
    });
    $("#winner").text("Waiting for Player Two");
  }
  else if(snapshot.key === "pOne") {
    pOneActive = 0;
    $("#pOne-losses").empty();
    $("#pOne-wins").empty();
    $("#pOne").text("Waiting!");
    $("#pOne-statistics").addClass("opacity-zero");
    $("#options-two").addClass("opacity-zero");
    pOne.losses = 0;
    pOne.wins = 0;
    pOne.name = "";
    pTwo.choice = "";
    pOne.choice = "";
    database.ref("players/pTwo").update({
      "choice": null
    });
    $("#winner").text("Waiting for Player One");
  }
  $(".option-one").unbind("click");
  $(".option-two").unbind("click");
  $("#chat").empty();
  database.ref().child("messages").remove();
  database.ref().child("won").remove();
  database.ref().child("games").remove();
  games = 1;
});

database.ref("/players").on("child_added", function(snapshot){
  if(snapshot.key === "pOne")
    pOne.name = snapshot.val().name;
  if(snapshot.key === "pOne" && pTwoActive === 0)
    $("#winner").text("Waiting for Player Two");
  if((snapshot.key === "pOne" && pTwoActive === 1) || (snapshot.key === "pTwo" && pOneActive === 1)) {
    if(pId === "pOne")
      $("#winner").text("Choose an item");
    else if (pId === "pTwo")
      $("#winner").text("Waiting for " + pOne.name + " to choose");
    startRPSOne(); 
  }
});

database.ref("players/pOne").on("child_added", function(snapshot){
  if(pOne.choice !== "") {
    if(pId === "pOne")
      $("#winner").text("Waiting for " + pTwo.name + " to choose");
    if(pId === "pTwo")
      $("#winner").text("Choose an item");
    startRPSTwo();
  }
});

database.ref("players/pTwo").on("child_added", function(snapshot){
  if(pTwo.choice !== "") {
    evaluateResult();
  }
});

database.ref("players/pTwo").on("child_removed", function(snapshot){
  pOne.choice = "";
  pTwo.choice = "";
  startRPSOne();
});

database.ref("/won").on("value", function(snapshot){
  if(pOne.name !== "" && pTwo.name !== "") {
    won = snapshot.val();
  }
});

database.ref("/games").on("value", function(snapshot){
  if(pOne.name !== "" && pTwo.name !== "") {
    games = parseInt(snapshot.val());
    $("#winner").text(won + " wins");
    setTimeout(function(){
      if(pId === "pOne")
        $("#winner").text("Choose an item");
      if(pId === "pTwo")
        $("#winner").text("Waiting for " + pOne.name + " to choose");
    }, 2000);
  }
});

function startRPSOne(){
  if(pId === "pOne") {
    $("#options-one").removeClass("opacity-zero");
    $(".option-one").on("click", function(){
      $(".option-one").unbind("click");
      pOne.choice = $(this).text();
      database.ref("players/pOne").update({
        choice: pOne.choice
      });
    });
  }
}

function startRPSTwo(){
  if(pId === "pOne")
    $("#options-one").addClass("opacity-zero");
  else if(pId === "pTwo") {
    $("#options-two").removeClass("opacity-zero");
    $(".option-two").on("click", function(){
      $(".option-two").unbind("click");
      $("#options-two").addClass("opacity-zero");
      pTwo.choice = $(this).text();
      database.ref("players/pTwo").update({
        choice: pTwo.choice
      });
    });
  }
}

function evaluateResult(){
  if(pId === "pTwo") {
    if(pOne.choice === "Rock" && pTwo.choice === "Scissors") {
      pOne.wins++;
      pTwo.losses++;
      won = pOne.name;
    }
    else if(pOne.choice === "Rock" && pTwo.choice === "Paper") {
      pOne.losses++;
      pTwo.wins++;
      won = pTwo.name;
    }
    else if(pOne.choice === "Paper" && pTwo.choice === "Rock") {
      pOne.wins++;
      pTwo.losses++;
      won = pOne.name;
    }
    else if(pOne.choice === "Paper" && pTwo.choice === "Scissors") {
      pOne.losses++;
      pTwo.wins++;
      won = pTwo.name;
    }
    else if(pOne.choice === "Scissors" && pTwo.choice === "Paper") {
      pOne.wins++;
      pTwo.losses++;
      won = pOne.name;
    }
    else if(pOne.choice === "Scissors" && pTwo.choice === "Rock") {
      pOne.losses++;
      pTwo.wins++;
      won = pTwo.name;
    }

    database.ref("/players").update({
      "pOne/wins": pOne.wins,
      "pOne/losses": pOne.losses,
      "pTwo/wins": pTwo.wins,
      "pTwo/losses": pTwo.losses
    });

    if(pOne.choice === pTwo.choice)
      won = "Nobody";

    database.ref().update({
      won: won,
      games: games++
    });

    database.ref("/players").update({
      "pOne/choice": null,
      "pTwo/choice": null
    });
  }
}

$("#submit-message").on("click", function() {
  event.preventDefault();
  if(pId === "")
    alert("Must be an active player to send chat message");
  else if(pOneActive === 0 || pTwoActive === 0)
    alert("Must have an opponent to send chat message");
  else {
    var text = $("#message").val().trim();
    database.ref("/messages").push({
      text: text,
      id: pId,
      time: firebase.database.ServerValue.TIMESTAMP
    })
  }
  $("#message").val("");
});

database.ref("/messages").orderByChild("time").limitToLast(1).on("child_added", function(snapshot){
  var p = $("<p>");
  var player = snapshot.val().id;
  var name;
  if(player === "pOne") {
    name = pOne.name;
    p.addClass("grey");
  }
  else {
    name = pTwo.name;
    p.addClass("db");
  }
  var span = $("<span>").text(name + ": " + snapshot.val().text);
  p.append(span);
  $("#chat").append(p);
  $("#chat").stop().animate({ scrollTop: $("#chat")[0].scrollHeight}, 1000);
});