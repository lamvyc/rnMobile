// API 配置
// 开发环境：本机 IP 地址（模拟器使用 localhost，真机需改为本机局域网 IP）
const DEV_API_URL = 'http://localhost:3000';
const PROD_API_URL = 'https://your-production-domain.com'; // 上线前替换

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const API_TIMEOUT = 10000; // 10秒超时

export const APP_NAME = '称平安';
