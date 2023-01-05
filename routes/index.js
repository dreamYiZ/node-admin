var express = require("express");
var router = express.Router();
// 文件数据库
var lowdb = require("lowdb");
var FileSync = require("lowdb/adapters/FileSync");
const menu = new FileSync("./db/menu.json");
// 菜单表
const db_menu = lowdb(menu);
const { login } = require("../api/user");

/* GET home page. */
router.get('/home', function(req, res, next) {
  res.json({
    code: 200,
    msg: "home",
  });
  next();
});

router.get("/test", (req, res, next) => {
  res.json({
    code: 200,
    msg: "访问成功 home",
  });
  next();
});

/* GET 登录 */
router.get("/login", login);

/* GET 返回菜单列表 */
router.get("/menu/query", async (req, res, next) => {
  res.json(db_menu.get("menu").value());
});

module.exports = router;
