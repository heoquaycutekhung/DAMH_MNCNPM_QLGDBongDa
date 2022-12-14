const { machineLearning } = require("firebase-admin");
const { accessSync } = require("fs");
const firebase = require("../config/database/config.js");
const database = firebase.database();
const Club = require("./club");
const Rule = require("./rules");
class Match {
  constructor(id,date,time,club_1,club_2, referee,stadium,status,goal_1,goal_1_bf,goal_2, goal_2_bf,timeRunning, rs,logo_1, logo_2, report = [[],[]] ) 
  {
    this.id = id;
    this.date = date;
    this.time = time;
    this.club_1 = club_1;
    this.club_2 = club_2;
    this.referee = referee;
    this.stadium = stadium;
    this.status = status;
    this.goal_1 = goal_1;
    this.goal_2 = goal_2;
    this.goal_1_bf = goal_1_bf;
    this.goal_2_bf =goal_2_bf;
    this.timeRunning = timeRunning;
    this.rs = rs;
    this.logo_1 =logo_1;
    this.logo_2 = logo_2;
    this.report = report
  }

  //dựa vào tên club => Lấy club => Tạo match => Add Match
  //

  async addMatch(match) {
    return await database.ref("matchs").child(match.id).set(match);
  }

    async setID() {
        const id = await database.ref("matchs").push().key;
        return this.id = id;
    }
    async getMatchByDate(date) {
        var match = [];
        await database.ref('matchs').once('value', (snapshot) => {
            var temp = snapshot.forEach((childSnapshot) => {
                if (childSnapshot.val().date.toString() == date) {
                    match.push(childSnapshot.val());
                }
            });
        });
        return match;
    }
    async getMatchByDateTime(date, time) {
        
        var match = [];
        await database.ref('matchs').once('value', (snapshot) => {
            var temp = snapshot.forEach((childSnapshot) => {
                if (childSnapshot.val().date.toString() == date && childSnapshot.val().time.toString() == time) {
                    match.add(childSnapshot.val());
                }
            });
        });
        return match;
    }

    async getAllDate(){
        
        var date =[];
        await database.ref('matchs').once('value', (snapshot) => {
            var temp = snapshot.forEach((childSnapshot) => {
                var dt = childSnapshot.val().date.toString();
                if (!date.includes(dt)) {
                    date.push(dt);
                }
            });
        });
        return date.sort((a,b) =>{
            var dateParts1 = a.split('/')
            var dateParts2 =  b.split('/')
            return (new Date(+dateParts1[2], dateParts1[1] - 1, +dateParts1[0])) - (new Date(+dateParts2[2], dateParts2[1] - 1, +dateParts2[0]) )})
    }

    async getDateNotFinish(){ //lay cac ngay mà có trận đấu đang diễn ra hoặc chưa diễn ra
        let date_ob = new Date();
        let curdate = ("0" + date_ob.getDate()).slice(-2) + '/' + ("0" + (date_ob.getMonth() + 1)).slice(-2) + '/' + date_ob.getFullYear();
        var date =[];
        await database.ref('matchs').once('value', (snapshot) => {
            var temp = snapshot.forEach((childSnapshot) => {
                var dt = childSnapshot.val().date.toString();
                if (!date.includes(dt) && (childSnapshot.val().status !='isFinished'||dt ==curdate)) {
                    date.push(dt);
                }
            });
        });
        return date.sort((a,b) =>{
            var dateParts1 = a.split('/')
            var dateParts2 =  b.split('/')
            return (new Date(+dateParts1[2], dateParts1[1] - 1, +dateParts1[0])) - (new Date(+dateParts2[2], dateParts2[1] - 1, +dateParts2[0]))})
        
    }
    async getMatchisFinished(){
      var match = [];
      await database.ref('matchs').once('value', (snapshot) => {
          var temp = snapshot.forEach((childSnapshot) => {
              if (childSnapshot.val().status.toString() == "isFinished" ) {
                  match.push(childSnapshot.val());
              }
          });
      });
      return match.sort((a,b)=>{
        var dateParts1 = a.date.split("/");
        var dateParts2 = b.date.split("/");
        if(a.date==b.date){
            var t1 = a.time.split(":");
            var t2 = b.time.split(":");
            var m1 = parseInt(t1[0]) * 60 + parseInt(t1[1]);
            var m2 = parseInt(t2[0]) * 60 + parseInt(t2[1]);
          return m2 - m1
        }

        return (
           new Date(+dateParts2[2], dateParts2[1] - 1, +dateParts2[0])-
           new Date(+dateParts1[2], dateParts1[1] - 1, +dateParts1[0])
           
        );
    })
  }
    
    async getMatchisRunning(){
        var match = [];
        await database.ref('matchs').once('value', (snapshot) => {
            var temp = snapshot.forEach((childSnapshot) => {
                if (childSnapshot.val().status.toString() == "isRunning" ) {
                    match.push(childSnapshot.val());
                }
            });
        });
        return match;
    }
    async getMatchisRunning_Finished(){
      var match = [];
      await database.ref('matchs').once('value', (snapshot) => {
          var temp = snapshot.forEach((childSnapshot) => {
              if (childSnapshot.val().status.toString() == "isRunning" ||childSnapshot.val().status.toString() == "isFinished"  ) {
                  match.push(childSnapshot.val());
              }
          });
      });
      return match.sort((a,b)=>{
        var dateParts1 = a.date.split("/");
        var dateParts2 = b.date.split("/");
        if(a.date==b.date){
            var t1 = a.time.split(":");
            var t2 = b.time.split(":");
            var m1 = parseInt(t1[0]) * 60 + parseInt(t1[1]);
            var m2 = parseInt(t2[0]) * 60 + parseInt(t2[1]);
          return m2 - m1
        }

        return (
           new Date(+dateParts2[2], dateParts2[1] - 1, +dateParts2[0])-
           new Date(+dateParts1[2], dateParts1[1] - 1, +dateParts1[0])
           
        );
    })
  }
    async updateMatchIsRunning() {
      let date_ob = new Date();
      let date =("0" + date_ob.getDate()).slice(-2) +"/" + ("0" + (date_ob.getMonth() + 1)).slice(-2) +"/" + date_ob.getFullYear();

      await database.ref("matchs").once("value", async (snapshot) => {
        var arr = [];
        snapshot.forEach(function (childsnap) {
          arr.push(childsnap.val());
        });
        await Promise.all(arr.map(async (childSnapshot) => {
            let hours = date_ob.getHours();
            let minutes = date_ob.getMinutes();

            var match = childSnapshot;
            var time = match.time;
            var t = time.split(":");
  
            var t1 = parseInt(t[0]) * 60 + parseInt(t[1]);
            var t2 = eval(hours) * 60 + eval(minutes);
  
            if (date == match.date) {
              if (t2 - t1 >= 0 && t2 - t1 <= 90) {
                if (match.status == "notRun") 
                    match.status = "isRunning";
                match.timeRunning = (t2 - t1).toString();
              } else if (t2 - t1 < 100 &&t2 - t1 > 90 &&match.status == "isRunning") {
                match.timeRunning = "90+";
                
              } else if (t2 - t1 > 100) {
                match.timeRunning = "FT";
                match.status = "isFinished";
              }

              //match = await this.updateScore(match);
              await database.ref("matchs").child(match.id).set(match);
            }
  
          })
        );
      });
    }
  
    async getMatchNotRun(){
      var match = [];
      await database.ref('matchs').once('value', (snapshot) => {
          var temp = snapshot.forEach((childSnapshot) => {
              if (childSnapshot.val().status.toString() == "notRun" ) {
                  match.push(childSnapshot.val());
              }
          });
      });
      return match.sort((a,b)=>{
          var dateParts1 = a.date.split("/");
          var dateParts2 = b.date.split("/");
          return (
             new Date(+dateParts2[2], dateParts2[1] - 1, +dateParts2[0])-
             new Date(+dateParts1[2], dateParts1[1] - 1, +dateParts1[0])
             
          );
      })
  }
    async updateScore(match) {
      const club1 = await Club.getClubByName(match.club_1);
      const club2 = await Club.getClubByName(match.club_2);

      const rule = await Rule.getRulesFromDataBase();
      
      const score  = rule.score;
      const win = score.win, draw= score.draw,lost = score.lost;
      var goal1 = match.goal_1; var goal2 = match.goal_2;
      club1.totalGoal = club1.totalGoal - match.goal_1_bf + match.goal_1;
      club1.goalDelta =  club1.goalDelta - (match.goal_1_bf - match.goal_2_bf) + (match.goal_1 - match.goal_2) 

      club2.totalGoal = club2.totalGoal - match.goal_2_bf + match.goal_2;
      club2.goalDelta =  club2.goalDelta - (match.goal_2_bf - match.goal_1_bf) + (match.goal_2 - match.goal_1) 

      match.goal_1_bf = match.goal_1; match.goal_2_bf = match.goal_2;
      var C1 = [0, 0, 0];var C2 = [0, 0, 0];
  
      if (goal1 > goal2) {
        if(match.rs == "N"){
          club1.score = club1.score + win; 
          club2.score = club2.score  + lost;
          C1[0]= 1;C2[2]= 1;
        } 
        else if (match.rs == "H") {
          club1.score = club1.score - draw + win; 
          club2.score = club2.score - draw + lost;
          C1[1] = -1; C2[1] = -1;
          C1[0] = 1; C2[2] = 1;
  
        } else if( match.rs == "L")
        {
          club1.score = club1.score -lost + win;
          club2.score = club2.score - win + lost;
  
          C1[2] = -1;C2[0] = -1;
          C1[0] = 1;C2[2] = 1;
        }
        match.rs = "W";
      } else if (goal1 == goal2) {
          if(match.rs == "N"){
            club1.score = club1.score +draw; 
            club2.score = club2.score  + draw;
            C1[1] = 1 ; C2[1] = 1;
          } 
          else if (match.rs == "W") {
            club1.score = club1.score - win + draw;
            club2.score = club2.score - lost+ draw;
    
            C1[0] = -1;C2[2] = -1;
            C1[1] = 1;C2[1] = 1;
    
          } else if (match.rs == "L") {
            club1.score = club1.score - lost + draw;
            club2.score = club2.score - win+ draw;
    
            C1[2] = -1; C2[0] = -1;
            C1[1] = 1;C2[1] = 1;
    
          }
    
        match.rs = "H";
      } else {
          if(match.rs == "N"){
            club1.score = club1.score +lost; 
            club2.score = club2.score  + win;
            C1[2] = 1;C2[0] = 1;
          } 
          else if (match.rs == "W") {
            club1.score = club1.score -win+lost;
            club2.score = club2.score -lost+ win;
    
            C1[0] = -1 ;C2[2] = -1;
            C1[2] = 1; C2[0] = 1;
    
    
          } else if (match.rs == "H") {
            club1.score = club1.score -draw + lost;
            club2.score = club2.score -draw + win;
    
            C1[1] = -1;C2[1] = -1;
            C1[2] = 1;C2[0] = 1;
    
          }
          match.rs = "L";
      }
  
      club1.win = club1.win + C1[0];club1.draw = club1.draw + C1[1]; club1.lost = club1.lost + C1[2];
      club2.win = club2.win + C2[0];club2.draw = club2.draw + C2[1];club2.lost = club2.lost + C2[2];
  
      club1.numberMatch = club1.win + club1.draw + club1.lost;
      club2.numberMatch = club2.win + club2.draw + club2.lost;

      await database.ref("clubs").child(club1.id).set(club1);
      await database.ref("clubs").child(club2.id).set(club2);
  
      return match;
    }
  

  async getFacingOf2Club(_club1,_club2){
    var count1 = 0, count2=0;
    await database.ref('matchs').once('value', (snapshot) => {
      var temp = snapshot.forEach((childSnapshot) => {

        if(childSnapshot.val().club_1.toString() == _club1 && childSnapshot.val().club_2.toString() == _club2){
          if(childSnapshot.val().goal_1 >childSnapshot.val().goal_2){
            count1 = count1 + 1;
          }else if(childSnapshot.val().goal_1 <childSnapshot.val().goal_2){
            count2 = count2 + 1;
          }else{

          }
        }else if(childSnapshot.val().club_2.toString() == _club1 && childSnapshot.val().club_1.toString() == _club2){
          if(childSnapshot.val().goal_2 >childSnapshot.val().goal_1){
            count1 = count1 + 1;
          }else if(childSnapshot.val().goal_2 <childSnapshot.val().goal_1){
            count2 = count2 + 1;
          }else{

          }
        }

      });
    });

    return [count1, count2];

  }
  async findMatchByID(id){
    let match = null;
    await database.ref('matchs').child(id).once('value', (snapshot) => {
      match = snapshot.val();
   });
   return match;
  }

  async updateScoreInTime(id, club,report){
    let match = null;
    await database.ref('matchs').child(id).once('value', (snapshot) => {
      match = snapshot.val();
   });

    if(match.report == undefined){
      match.report = [[],[]];
    }
    if (club.normalize() == match.club_1.normalize()){
      match.goal_1 = match.goal_1 + 1;
      if(match.report[0] == undefined){
        match.report[0] = [];
      }
      match.report[0].push(report);
    }
    else{
      match.goal_2 = match.goal_2 + 1;
      if(match.report[1] == undefined){
        match.report[1] = [];
      }
      match.report[1].push(report);
    }

    match = await this.updateScore(match);
    await database.ref("matchs").child(match.id).set(match);
  }

  //update
}

module.exports = new Match();
