var express = require('express');
var router = express.Router();

/* GET users listing. */

router.get("/test", (req, res, next) => {
  res.json({
    code: 200,
    msg: "访问成功 users",
  });
});
module.exports = router;
