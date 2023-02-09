const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});



module.exports = {
    text: async (req, res, next) => {
        // console.log(process.env.OPENAI_API_KEY)
        // const openai = new OpenAIApi(configuration);
        // const response = await openai.listModels();
    }
};