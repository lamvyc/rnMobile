#!/bin/bash

echo "========================================="
echo "签到模块测试"
echo "========================================="
echo ""

API_URL="http://localhost:5210"
PHONE="13900140000"

# 步骤1: 发送验证码
echo "步骤1: 发送验证码"
echo "-----------------------------------------"
curl -s -X POST "$API_URL/auth/send-code" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\"}"
echo ""
echo ""

echo "等待5秒后从Redis获取验证码..."
sleep 5

# 从Redis获取验证码
CODE=$(redis-cli GET "sms:code:$PHONE" 2>/dev/null)
if [ -z "$CODE" ]; then
  echo "❌ 无法从Redis获取验证码"
  echo "请从后端控制台日志中复制验证码，格式如："
  echo "[开发环境] 验证码: 123456 (手机号: $PHONE)"
  exit 1
fi
echo "✅ 验证码: $CODE"
echo ""

# 步骤2: 登录获取Token
echo "步骤2: 登录获取Token"
echo "-----------------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"code\":\"$CODE\"}")
echo "$LOGIN_RESPONSE"
echo ""

# 提取Token (简单方式)
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败"
  exit 1
fi
echo "✅ Token已获取"
echo ""

# 步骤3: 查询签到状态（首次）
echo "步骤3: 查询签到状态（首次）"
echo "-----------------------------------------"
curl -s -X GET "$API_URL/checkin/status" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

# 步骤4: 执行签到
echo "步骤4: 执行签到"
echo "-----------------------------------------"
curl -s -X POST "$API_URL/checkin" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
echo ""
echo ""

# 步骤5: 再次查询签到状态
echo "步骤5: 再次查询签到状态"
echo "-----------------------------------------"
curl -s -X GET "$API_URL/checkin/status" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

# 步骤6: 尝试重复签到（应该失败）
echo "步骤6: 尝试重复签到（应返回错误）"
echo "-----------------------------------------"
curl -s -X POST "$API_URL/checkin" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
echo ""
echo ""

# 步骤7: 查询签到历史
echo "步骤7: 查询签到历史"
echo "-----------------------------------------"
curl -s -X GET "$API_URL/checkin/history" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

# 步骤8: 验证数据库
echo "步骤8: 验证数据库"
echo "-----------------------------------------"
echo "Users表:"
psql -d pingan_dev -t -c "SELECT phone, to_char(last_checkin_at, 'YYYY-MM-DD HH24:MI:SS') FROM users WHERE phone='$PHONE';" 2>/dev/null
echo ""
echo "Checkins表:"
psql -d pingan_dev -t -c "SELECT checkin_date, to_char(checkin_time, 'HH24:MI:SS') FROM checkins WHERE user_id = (SELECT id FROM users WHERE phone='$PHONE');" 2>/dev/null
echo ""

echo "========================================="
echo "✅ 测试完成！"
echo "========================================="