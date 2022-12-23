const express = require('express')
const router = express.Router()
const manageController = require('../controllers/manageController')
const {notAdmin, isAdmin} = require('../middlewares/home')
const path = require('path')
// const multer = require('../config/multer')
var multer = require('multer')
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });



router.get('/update-match', notAdmin, manageController.getCapNhaptiso);
router.get('/register-club',notAdmin, manageController.renderRClub);
router.get('/create-league',notAdmin,manageController.renderCreateLeauge);
router.get('/edit-regulations',notAdmin, manageController.renderEditReg);
router.get('/create-schedule', notAdmin, manageController.getCreateSchedule);
router.post('/edit-regulations', manageController.updateRules);

router.post('/register-club',upload.fields([{name: "logo"}, {name: "danhsachcauthu"}]), manageController.uploadClub);
router.post('/update-match', notAdmin, manageController.postCapNhaptiso);
router.post('/create-schedule', notAdmin, manageController.postCreateSchedule);
router.get('/',notAdmin, manageController.index)



module.exports = router;