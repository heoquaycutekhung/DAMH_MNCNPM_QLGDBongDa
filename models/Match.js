const firebase = require('../config/database/config.js');
const database = firebase.database();
const Club = require('./club')

class Match { 
    constructor(id, date, time, club_1, club_2, referee, stadium, status, goal_1, goal_2, timeRunning,rs) {
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
        this.timeRunning = timeRunning;
        this.rs = rs ;
    }

    //dựa vào tên club => Lấy club => Tạo match => Add Match
    //

    async addMatch(match) {
        await this.setID();
        return await database.ref("matchs").child(club.id).set(club);
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
                    match.push(childSnapshot.val());
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
        return date.sort((a,b)=>Date.parse(a)-Date.parse(b));
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
        return date.sort((a,b)=>Date.parse(a)-Date.parse(b));
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
    async updateMatchIsRunning() {
        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2) + '/' + ("0" + (date_ob.getMonth() + 1)).slice(-2) + '/' + date_ob.getFullYear();

        await database.ref('matchs').once('value', async(snapshot) => {

            var arr=[]
            snapshot.forEach(function(childsnap){
                arr.push(childsnap.val());
            });
            await Promise.all(arr.map(async (childSnapshot) => {

                let hours = date_ob.getHours();
                let minutes = date_ob.getMinutes();

                var match = childSnapshot;
                var time = match.time;
                var t = time.split(':');
  
                var t1 = eval(t[0]) * 60 + eval(t[1]);
                var t2 = eval(hours) * 60 + eval(minutes);
               
                if(date == match.date){
                    if( t2- t1 >= 0 && t2 -t1 <= 90 ){
                        if(match.status == "notRun")
                            match.status = "isRunning"


                        match.timeRunning = (t2-t1).toString()
                    }else if (t2 -t1<100 && t2 -t1 > 90 && match.status == "isRunning"){

                        match.timeRunning ="90+"

                    }else if (t2 -t1 > 100 ){

                        match.timeRunning ="FT";
                        match.status = "isFinished";
                    }

                    match = await this.updateScore(match)
                    await database.ref("matchs").child(match.id).set(match);
                }
            }))

        })
    }

    async updateScore(match){
        
        const club1 = await Club.getClubByName(match.club_1)
        const club2 = await Club.getClubByName(match.club_2)

        var goal1 = match.goal_1;
        var goal2 = match.goal_2

        var C1 = [0,0,0]
        var C2 = [0,0,0]

        if(goal1 > goal2){

          

            if(match.rs == 'H'){
                club1.score = club1.score + 2
                club2.score = club2.score - 1

                C1[1] = -1; C2[1] = -1;
                C1[0] = 1 ; C2[2] = 1;
            }
            else(match.rs == 'L')
            {
                club1.score = club1.score + 3
                club2.score = club2.score - 3

                C1[2] = -1 ; C2[0] = -1;
                C1[0] = 1 ; C2[2] = 1;
            }
            match.rs = 'W' 

        }else if(goal1 == goal2){
            
           
            if(match.rs == 'W'){
                club1.score = club1.score - 2
                club2.score = club2.score + 1

                C1[0] = -1; C2[2] = -1;
                C1[1] = 1; C2[1] = 1;

            }else if(match.rs == 'L'){
                club1.score = club1.score +1
                club2.score = club2.score -2

                C1[0] = -1; C2[2] = -1;
                C1[1] = 1; C2[1] = 1;
            }
            match.rs = 'H'
            
        }else{
          
            if(match.rs == 'W'){
                club1.score = club1.score - 3
                club2.score = club2.score + 3
                
                C1[0] = -1; C2[2] = -1;
                C1[2] = 1; C2[0] = 1

            }else if(match.rs == 'H'){
                club1.score = club1.score -2
                club2.score = club2.score +2

                C1[1] = -1; C2[1] = -1;
                C1[2] = 1; C2[0] = 1
            }
            match.rs = 'L'
        }

        club1.win = club1.win + C1[0]; club1.draw = club1.draw + C1[1]; club1.lost = club1.lost + C1[2]
        club2.win = club2.win + C2[0]; club2.draw = club2.draw + C2[1]; club2.lost = club2.lost + C2[2]

        club1.numberMatch = club1.win + club1.draw +club1.lost
        club2.numberMatch = club2.win + club2.draw +club2.lost

         await database.ref("clubs").child(club1.id).set(club1);
         await database.ref("clubs").child(club2.id).set(club2);
         return match;
    }
    

}

module.exports = new Match;