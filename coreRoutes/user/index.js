var express = require('express');
var router = express.Router();
const {create} =  require('../../controllers/user')

const route = "usr"

router.get('/',  create);



module.exports = router;
