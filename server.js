var express = require("express");
// 解析token
var expressJwt = require("express-jwt");
// 路由
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

const url = require("url");
const fs = require("fs");
const path = require("path");
const packageJSON = require('./package.json')
const exec = require('child_process').exec
const config = require('./utils/config.json')

/**
 * Construct the server of NCM API.
 *
 * @param {ModuleDefinition[]} [moduleDefs] Customized module definitions [advanced]
 * @returns {Promise<import("express").Express>} The server instance.
 */
async function consturctServer(moduleDefs) {
  const app = express();
  // app.set("trust proxy", true);

  /**
   * CORS & Preflight request
   */
  app.use((req, res, next) => {
    if (req.path !== "/" && !req.path.includes(".")) {
      res.set({
        // "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": req.headers.origin || "*",
        "Access-Control-Allow-Headers": "authorization", //"X-Requested-With,Content-Type",
        "Access-Control-Allow-Methods": "PUT,POST,GET,DELETE,OPTIONS",
        "Content-Type": "application/json; charset=utf-8",
      });
    }
    req.method === "OPTIONS" ? res.status(204).end() : next();
  });

  /**
   * Cookie Parser
   */

  /**
   * 正文分析器和文件上载
   */
  // app.use(express.json());
  // app.use(express.urlencoded({ extended: false }));

  // app.use(fileUpload());

  /**
   * 设置静态文件目录 static
   */
  app.use(express.static(path.join(__dirname, "public")));

  /**
   * Cache
   */
  // app.use(cache("2 minutes", (_, res) => res.statusCode === 200));

  /**
   * JWT
   */
  const { SECRET_KEY } = config;
  app.use(
    expressJwt({
      secret: SECRET_KEY,
      algorithms: ["HS256"], //指定解析密文的算法
    }).unless({ path: ["/login","/menu/query","/home", "/test", "/users/test", "/favicon.ico"] })
  );

  app.use("/", indexRouter);
  app.use("/users", usersRouter);

  app.use((err, req, res, next) => {
    // 未经授权的错误
    if (err.name === "UnauthorizedError") {
      res.status(401).send({ msg: "不合法的请求" });
    }
    res.status(500).send("Internal Serverless Error");
    next();
  });
  return app;
}
/**
 * Serve the NCM API.
 * @param {NcmApiOptions} options
 * @returns {Promise<import('express').Express & ExpressExtension>}
 */
async function serveNcmApi(options) {
  const port = Number(options.port || process.env.PORT || "8081");
  const host = options.host || process.env.HOST || "";

  //   const checkVersionSubmission =
  //     options.checkVersion &&
  //     checkVersion().then(({ npmVersion, ourVersion, status }) => {
  //       if (status == VERSION_CHECK_RESULT.NOT_LATEST) {
  //         console.log(
  //           `最新版本: ${npmVersion}, 当前版本: ${ourVersion}, 请及时更新`
  //         );
  //       }
  //     });
  const constructServerSubmission = consturctServer(options.moduleDefs);

  const [app] = await Promise.all([
    // checkVersionSubmission,
    constructServerSubmission,
  ]);

  /** @type {import('express').Express & ExpressExtension} */
  const appExt = app;
  appExt.server = app.listen(port, host, () => {
    console.log(`server running @ http://${host ? host : "localhost"}:${port}`);
  });

  return appExt;
}

module.exports = {
  serveNcmApi,
};
