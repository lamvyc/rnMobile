// API 配置
// 模拟器调试：使用 localhost
// const DEV_API_URL = 'http://localhost:5210';
// 真机调试：使用 Mac 局域网 IP（运行 `ipconfig getifaddr en0` 获取）
const DEV_API_URL = 'http://172.18.85.201:5210';
const PROD_API_URL = 'https://your-production-domain.com'; // 上线前替换

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const API_TIMEOUT = 10000; // 10秒超时

export const APP_NAME = '称平安';
