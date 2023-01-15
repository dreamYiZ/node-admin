/*
 * @Description: 
 */
const DefaultConfig = {
  production: process.env.NODE_ENV === "production", // 环境配置
  SECRET_KEY: "7040575a-5ff5-4398-a410-d9c7b010f6e8" // 密钥
};
// console.log(process.env,"环境变量")

module.exports = DefaultConfig
