var express = require("express");
var router = express.Router();

// router.post('*', (req, res) => {
//     console.log('Received callback:', req.body);
//     res.status(200).send('OK');
// });
function openai(){
    const axios = require('axios');

    const openaiApiKey = '';
    const prompt = 'Once upon a time';
    const model = 'text-davinci-002';
    const temperature = 0.5;
    const maxTokens = 50;

    axios.post(
        'https://api.openai.com/v1/engines/' + model + '/completions',
        {
            prompt: prompt,
            temperature: temperature,
            max_tokens: maxTokens
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + openaiApiKey
            }
        }
    )
        .then(response => {
            console.log(response.data.choices[0].text);
        })
        .catch(error => {
            console.log(error);
        });
}

router.post('/send-message-cd', async (req, res) => {
    // 在这里编写将消息转发给接收者的逻辑
    // 这里只是一个示例，输出一条日志来表示接口已经被调用
    console.log(`Sending message from ${req}`);

//    const sender = req.body.sender;
//    const receiver = req.body.receiver;
//    const message = req.body.message;
//     console.log({sender,receiver,message})
    // 返回成功响应
    res.status(200).send('Message sent successfully!');
});


module.exports = router;