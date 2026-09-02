import { startServer } from '@opentiny/genui-sdk-server'

startServer({
    port: 3100,
    baseURL: 'https://api.deepseek.com',
    apiKey: '请用你自己的apikey',
    maxAttempts: 10,
})