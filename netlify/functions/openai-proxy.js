// Gemini API 대신 OpenAI API를 사용하기 위한 Netlify 서버리스 함수입니다.
// 이 파일을 사용하려면 반드시 Netlify 프로젝트에 OPENAI_API_KEY 환경 변수를 설정해야 합니다.

const fetch = require('node-fetch');

exports.handler = async function(event) {
    // POST 요청만 허용합니다.
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 클라이언트에서 보낸 요청 본문을 그대로 OpenAI로 전달합니다.
        const requestBody = JSON.parse(event.body);
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            throw new Error('OPENAI_API_KEY가 Netlify 환경 변수에 설정되지 않았습니다.');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody) // 프론트엔드에서 받은 model, messages 등을 그대로 전달
        });

        const data = await response.json();

        // OpenAI에서 받은 응답이 성공이 아닐 경우, 해당 내용을 그대로 클라이언트에 전달합니다.
        if (!response.ok) {
            console.error('OpenAI API Error:', data);
            return {
                statusCode: response.status,
                body: JSON.stringify(data)
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('Proxy Function Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: { message: error.message } })
        };
    }
};

