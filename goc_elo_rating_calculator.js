// This code is used to calculate the ELO-Rating for our GoC.

var month = Utilities.formatDate(new Date(), "CEST", "M");
var year_yy = Utilities.formatDate(new Date(), "CEST", "yy");
var year_yyyy = Utilities.formatDate(new Date(), "CEST", "y");
var quarter_num = 0;
var quarter = "";
var playerA_rating = 0;
var playerB_rating = 0;
var playerC_rating = 0;
var playerD_rating = 0;
var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("GoC");
var i = 0;
var lastLineChecked = sheet.getRange(3, 29, 1).getValue();
var lastLine = sheet.getRange(4, 29, 1).getValue();
var lastEloLine = sheet.getRange(5, 29, 1).getValue();
var seasonStart = sheet.getRange(6, 29, 1).getValue();

// Get quarter of year and write it to A10
function setSeason() {
  if (month == 1 && month <= 3) {
    quarter = "Q1'" + year_yy + " Rating →";
    quarter_num = 1;
  } else if (month == 4 && month <= 6) {
    quarter = "Q2'" + year_yy + " Rating →";
    quarter_num = 2;
  } else if (month == 7 && month <= 9) {
    quarter = "Q3'" + year_yy + " Rating →";
    quarter_num = 3;
  } else if (month == 10 && month <= 12) {
    quarter = "Q4'" + year_yy + " Rating →";
    quarter_num = 4;
  }
  
  sheet.getRange(10, 1, 1).setValue(quarter);
}


function startSeason() {
  // Find start of season and fill in tables
  var season_start_date = new Date(year_yyyy, month - 1, 1);
  var date_of_table = new Date();
  var cell_date_range = 0;
  // Set seasonStart to 1
  sheet.getRange(6, 29, 1).setValue(1);
  
  for (i = 340; i <= lastLine; i++) {
    cell_date_range = sheet.getRange(i, 1, 1);
    date_of_table = cell_date_range.getValue();

    if (date_of_table >= season_start_date) {
      sheet.getRange(i, 28, 1).setValue(1500);
      sheet.getRange(i, 29, 1).setValue(1500);
      sheet.getRange(i, 30, 1).setValue(1500);
      sheet.getRange(i, 31, 1).setValue(1500);
      break;
    }
   }
}

function checkWinIntegrity() {
  findLastLine();
  var tempVal1, tempVal2, tempVal3, tempVal4;

  for (; lastLineChecked < lastLine; lastLineChecked++) {
    
    tempVal1 = parseInt(sheet.getRange(lastLineChecked, 23, 1).getValue());
    if (tempVal1 == -1) {
    tempVal1 = 0;
    }
    
    tempVal2 = parseInt(sheet.getRange(lastLineChecked, 24, 1).getValue());
    if (tempVal2 == -1) {
    tempVal2 = 0;
    }

    tempVal3 = parseInt(sheet.getRange(lastLineChecked, 25, 1).getValue());
    if (tempVal3 == -1) {
    tempVal3 = 0;
    }
    
    tempVal4 = parseInt(sheet.getRange(lastLineChecked, 26, 1).getValue());
    if (tempVal4 == -1) {
    tempVal4 = 0;
    }
    
    if (tempVal1 + tempVal2 + tempVal3 + tempVal4 == 1) {
      continue;
    } else {
      sheet.getRange(10, 1, 1).setValue("Integrity error in line " + lastLineChecked);
    }
  }
  sheet.getRange(3, 29, 1).setValue(lastLineChecked);
}
  
function findLastLine() {
  var Avals = sheet.getRange("A1:A").getValues();
  var lastLine = Avals.filter(String).length;
  sheet.getRange(4, 29, 1).setValue(lastLine + 2);
}

function calcElo() {
  checkWinIntegrity();
  var playerA_game = 23, playerB_game = 24, playerC_game = 25, playerD_game = 26;
  var playerA_elo = 28, playerB_elo = 29, playerC_elo = 30, playerD_elo = 31;
  var playerA_val = 0, playerB_val = 0, playerC_val = 0, playerD_val = 0;
  var player1 = 0;
  var player1_game = 0;
  var player2 = 0;
  var player2_game = 0;
  var player1_chance = 0.0;
  var player2_chance = 0.0;
  var player1_elo = 0.0;
  var player2_elo = 0.0;
  var player1_win = 0.0;
  var player2_win = 0.0;
  
  for (; lastEloLine <= lastLine; lastEloLine++) {
    seasonStart = sheet.getRange(6, 29, 1).getValue();
    player1 = 0;
    player2 = 0;
    player1_game = 0;
    player2_game = 0;
    player1_chance = 0.0;
    player2_chance = 0.0;
    player1_elo = 0.0;
    player2_elo = 0.0;
    player1_win = 0.0;
    player2_win = 0.0;
    playerA_val = 0, playerB_val = 0, playerC_val = 0, playerD_val = 0;
    
    // playerA
    // Get value from column 23-26. -1 (not played), 1 (won), 0 (lost)
    playerA_val = sheet.getRange(lastEloLine, playerA_game, 1).getValue();
    // If playerA hasn't played in this match...
    if (playerA_val == -1) {
      // ... and if the season has just begun...
      if (seasonStart == 1) {
        // ... set elo-rating to 1500 (default season starting value).
        sheet.getRange(lastEloLine, playerA_elo, 1).setValue(1500);
      } else {
        // If season has already started and playerA hasn't played in this match, use his previous rating as actual rating.
        sheet.getRange(lastEloLine, playerA_elo, 1).setValue(sheet.getRange(lastEloLine - 1, playerA_elo, 1).getValue());
      }
      // If playerA has played a match (i.e. having a 0 or 1)...
    } else if (playerA_val >= 0) {
      // ... and if player1 has the number 23 or bigger set... (meaning someone else is already player1)
      if (player1 >= 23) {
        // ... then set playerA as player2. This also sets the following:
        // Set player2 to the field with playerAs elo-rating of this match.
        player2 = playerA_elo;
        // Set the player2_game-variable to the column 23 for playerA. Probably not needed.
        player2_game = playerA_game;
        // Set the player2_win-variable to the column where we can read if playerA has won (1) or lost (0) the game.
        player2_win = playerA_val;
      } else {
        // If player1-variable is not set yet, then playerA will be the player1.
        player1 = playerA_elo;
        player1_game = playerA_game;
        player1_win = playerA_val;
      }
    }
    
    // playerB
    playerB_val = sheet.getRange(lastEloLine, playerB_game, 1).getValue();
    if (playerB_val == -1) {
      if (seasonStart == 1) {
        sheet.getRange(lastEloLine, playerB_elo, 1).setValue(1500);
      } else {
        sheet.getRange(lastEloLine, playerB_elo, 1).setValue(sheet.getRange(lastEloLine - 1, playerB_elo, 1).getValue());
      }
    } else if (playerB_val >= 0) {
      if (player1 >= 23) {
        player2 = playerB_elo;
        player2_game = playerB_game;
        player2_win = playerB_val;
      } else {
        player1 = playerB_elo;
        player1_game = playerB_game;
        player1_win = playerB_val;
      }
    }
    
    // playerC
    playerC_val = sheet.getRange(lastEloLine, playerC_game, 1).getValue();
    if (playerC_val == -1) {
      if (seasonStart == 1) {
        sheet.getRange(lastEloLine, playerC_elo, 1).setValue(1500);
      } else {
        sheet.getRange(lastEloLine, playerC_elo, 1).setValue(sheet.getRange(lastEloLine - 1, playerC_elo, 1).getValue());
      }
    } else if (playerC_val >= 0) {
      if (player1 >= 23) {
        player2 = playerC_elo;
        player2_game = playerC_game;
        player2_win = playerC_val;
      } else {
        player1 = playerC_elo;
        player1_game = playerC_game;
        player1_win = playerC_val;
      }
    }
    
    // playerD
    playerD_val = sheet.getRange(lastEloLine, playerD_game, 1).getValue();
    if (playerD_val == -1) {
      if (seasonStart == 1) {
        sheet.getRange(lastEloLine, playerD_elo, 1).setValue(1500);
      } else {
        sheet.getRange(lastEloLine, playerD_elo, 1).setValue(sheet.getRange(lastEloLine - 1, playerD_elo, 1).getValue());
      }
    } else if (playerD_val >= 0) {
      if (player1 >= 23) {
        player2 = playerD_elo;
        player2_game = playerD_game;
        player2_win = playerD_val;
      } else {
        player1 = playerD_elo;
        player1_game = playerD_game;
        player1_win = playerD_val;
      }
    }
    
    // If the seasonStart-field is set to 1, the season has just begun.
    if (seasonStart == 1) {
      // So set the default rating of 1500 to both players who had a match right now.
      player1_elo = 1500;
      player2_elo = 1500;
    } else {
      // If season has already begun and games were played, fetch the elo-rating from the field above this row.
      player1_elo = sheet.getRange(lastEloLine - 1, player1, 1).getValue();
      player2_elo = sheet.getRange(lastEloLine - 1, player2, 1).getValue();
    }
    
    // Here we calculate the win-chance of each player by this formula:
    // 1 / ( 1 + 10 ^ (player2-rating - player1-rating) / 400 )
    player1_chance = 1 / (1 + Math.pow( 10, (player2_elo - player1_elo) / 400 ) );
    player2_chance = 1 / (1 + Math.pow( 10, (player1_elo - player2_elo) / 400 ) );
    
    // When the win-chance is known, we can calulate the actual elo-rating:
    // elo-rating = previous-rating + 32 * (0 or 1 - chance-to-win)
    player1_elo = player1_elo + 32 * (player1_win - player1_chance);
    player2_elo = player2_elo + 32 * (player2_win - player2_chance);
  
    // Now write the rating of the two players who played in their respective fields.
    // To know which field this is, the player1 and player2 variables were set previously.
    sheet.getRange(lastEloLine, player1, 1).setValue(player1_elo);
    sheet.getRange(lastEloLine, player2, 1).setValue(player2_elo);
    
    // Set seasonStart to 0, because after the first game, the season has begun.
    sheet.getRange(6, 29, 1).setValue(0);
    
    // END OF FOR-LOOP.
  }
    // Set lastEloLine to the last line which was written in. The next loop will start
    // after this line and not from the beginning.
    sheet.getRange(5, 29, 1).setValue(lastEloLine);
  
  // Write ratings to summary board
  sheet.getRange("B10").setValue(sheet.getRange(lastEloLine - 1, playerA_elo, 1).getValue());
  sheet.getRange("C10").setValue(sheet.getRange(lastEloLine - 1, playerB_elo, 1).getValue());
  sheet.getRange("D10").setValue(sheet.getRange(lastEloLine - 1, playerC_elo, 1).getValue());
  sheet.getRange("E10").setValue(sheet.getRange(lastEloLine - 1, playerD_elo, 1).getValue());
}
