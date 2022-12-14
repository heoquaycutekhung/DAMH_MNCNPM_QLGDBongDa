const { findMatchByID } = require('../models/Match');
const Match = require('../models/Match')
const controllerManager = require('./manageController')
const Club = require('../models/club')
const rules = require('../models/rules')

class resultController{
    async index(req,res){
        const matchs = await Match.getMatchisRunning_Finished();
        const title = "KẾT QUẢ";
        var user = req.session.user
        res.render('ketquacactrandau', {user,AllMatchs: matchs, title});
    }
    async renderResultDetail(req, res, next){
        
        await Match.updateMatchIsRunning()
        let id = req.params.id;
        let match = await Match.findMatchByID(id);
        var user = req.session.user
        const club1 = await Club.getClubByName(match.club_1);
        const club2 = await Club.getClubByName(match.club_2);
        const rule = await rules.getRulesFromDataBase();

        if (match.rs == "N"){
            match.rs = true;
        }
        else{
            match.rs= false;
        }
        res.render('capnhaptiso', {user, match, club1, club2, rule});
    }
}

module.exports = new resultController;