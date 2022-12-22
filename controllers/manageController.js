const Match = require('../models/Match');
const path = require('path')
const express = require('express');
const multer  = require('multer');
const upload = multer({ dest: path.join(__dirname, '../public/uploads/imgs')});
const mo = require("../models/managerClub");
const Club = require('../models/club')
const uploadImage = require('../models/uploadImage')
const rules = require('../models/rules');
const { title } = require('process');


class manageController{
    async index(req,res){
        const date = await Match.getDateNotFinish();
        const today = date[0];
        const nextday = date[1];
        await Match.updateMatchIsRunning()

        const match1 = await Match.getMatchByDate(today)
        const match2 = await Match.getMatchByDate(nextday)

        var user = req.session.user
        
        res.render('giaodienchinh',{user,today,match1,nextday,match2})
    }
    
    renderRClub(req, res){

        var user = req.session.user
        res.render('dangkygiaidau',{user})
    }

    renderCreateLeauge(req, res){
        var user = req.session.user
        res.render('taogiaidaumoi',{user})
    }
    async renderEditReg(req, res){

        const rule = await rules.getRulesFromDataBase();
        var user = req.session.user
        res.render('chinhsuaquydinh',{user,rule})
    }

    async updateRules(req, res){
        const data = req.body;
        var rule = {"minAge":data.minAge,"maxAge":data.maxAge,"minPlayer":data.minPlayer,"maxPlayer":data.maxPlayer,"score":[data.win,data.draw,data.lost],}
        console.log(data)
    }

    async uploadClub(req,res,next){
        // console.log(req.files)
        var user = req.session.user
        try{
        // console.log(req.file.destination);
        // if(req.file){
        //     return res.render('dangkygiaidau', { user,
        //         imgPath: '/uploads/logo/' + req.file.filename ,
        //         imgName: req.file.originalname
        //     });
        // }

        var rule = rules.getRulesFromDataBase();
        var temp = await mo.CSVFiletoJsonObject(req.files.danhsachcauthu[0].buffer.toString('utf8'))
        // var temp = await mo.CSVFiletoJsonObject(req.files.danhsachcauthu[0].path)
        var validedData = await mo.checkListPlayer(temp);
        var errors = [];
        var clb = req.body.tenclb;
        var sannha = req.body.sannha;
        var hlv = req.body.hlv;
        var success = false
        if (validedData.constrainForeignerPlayer == false){
            errors.push ("Số ngoại binh vượt quá số lượng cho phép")
            if(validedData.listPlayerInvalid.length !=0){
                for (let player of validedData.listPlayerInvalid){
                    errors.push("Thông tin cầu thủ "+ player.ten +" Không hợp lệ.");
                }
            }
            res.render('dangkygiaidau',{user, clb, sannha, hlv, errors})
        }
        else if (validedData.constrainNumOfPlayers == false){
            errors.push ("Tổng số cầu thủ đủ điều kiện đăng ký không hợp lệ (min: "+ rule.minPlayer +"; max: "+ rule.maxPlayer + ")")
            if(validedData.listPlayerInvalid.length !=0){
                for (let player of validedData.listPlayerInvalid){
                    errors.push("Thông tin cầu thủ "+ player.ten +" Không hợp lệ.");
                }
            }
            res.render('dangkygiaidau',{user, clb, sannha, hlv, errors})
        }

        else if (validedData.validListPlayer ==true){
            success = true
            var id = ""
            var logo = uploadImage(req.files.logo[0]);
            var name = req.body.tenclb;
            var stadium = req.body.sannha;
            var listPlayer = validedData.listPlayerValid
            var coach = req.body.hlv
            var captain = ""
            var club11 = new Club.constructor(id,logo,name, stadium, listPlayer,coach,captain)
            await Club.addClub(club11);
            res.render('dangkygiaidau',{user, clb, sannha, hlv, success})
        }

        }
        catch(err){
            console.log(err)
            res.render('dangkygiaidau',{user})
        }

    }



    async getCapNhaptiso(req, res){
        const Matchs = await Match.getMatchisRunning();
        var title = "CÁC TRẬN ĐANG DIỄN RA"
        var user = req.session.user
        res.render('ketquacactrandau', {user,AllMatchs: Matchs, title});
    }



    async postCapNhaptiso(req,res, next){
        let matchID = req.body.match;
        let typeGoal = req.body.loaibanthang.trim();
        let player = req.body.cauthughiban.trim();
        let time = req.body.thoigianghiban;
        let clb = req.body.clb;
        let report ="Bàn thắng: "+ player + " - " + typeGoal +" ("+ time +"')";
        
        await Match.updateMatchIsRunning()

        await Match.updateScoreInTime(matchID, clb, report);

        
        let match = await Match.findMatchByID(matchID);
        const club1 = await Club.getClubByName(match.club_1);
        const club2 = await Club.getClubByName(match.club_2);
        const rule = await rules.getRulesFromDataBase();
 
        var user = req.session.user
        res.render('capnhaptiso', {user, match, club1, club2, rule});
    }

    
}

module.exports = new manageController;