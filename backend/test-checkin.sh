#!/bin/bash

echo "========================================="
echo "签到模块测试脚本"
echo "========================================="
echo ""

# 设置变量
API_URL="http://localhost:5210"
PHONE="13900139999"

echo "步骤1: 发送验证码"
echo "-----------------------------------------"
SEND_CODE_RESPONSE=$(curl -s -X POST "$API_URL/auth/send-code" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\"}")
echo "响应: $SEND_CODE_RESPONSE"
echo ""

echo "请从后端控制台复制验证码，然后输入："
read -p "验证码: " CODE
echo ""

echo "步骤2: 登录获取Token"
echo "-----------------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"code\":\"$CODE\"}")
echo "响应: $LOGIN_RESPONSE"
echo ""

# 提取Token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败，无法获取Token"
  exit 1
fi
echo "✅ Token获取成功"
echo ""

echo "步骤3: 查询签到状态（首次）"
echo "-----------------------------------------"
STATUS_RESPONSE=$(curl -s -X GET "$API_URL/checkin/status" \
  -H "Authorization: Bearer $TOKEN")
echo "响应: $STATUS_RESPONSE"
echo ""

echo "步骤4: 执行签到"
echo "-----------------------------------------"
CHECKIN_RESPONSE=$(curl -s -X POST "$API_URL/checkin" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
echo "响应: $CHECKIN_RESPONSE"
echo ""

echo "步骤5: 再次查询签到状态"
echo "-----------------------------------------"
STATUS_RESPONSE2=$(curl -s -X GET "$API_URL/checkin/status" \
  -H "Authorization: Bearer $TOKEN")
echo "响应: $STATUS_RESPONSE2"
echo ""

echo "步骤6: 尝试重复签到（应该失败）"
echo "-----------------------------------------"
CHECKIN_RESPONSE2=$(curl -s -X POST "$API_URL/checkin" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
echo "响应: $CHECKIN_RESPONSE2"
echo ""

echo "步骤7: 查询签到历史"
echo "-----------------------------------------"
HISTORY_RESPONSE=$(curl -s -X GET "$API_URL/checkin/history" \
  -H "Authorization: Bearer $TOKEN")
echo "响应: $HISTORY_RESPONSE"
echo ""

echo "步骤8: 验证数据库记录"
echo "-----------------------------------------"
echo "查询users表的lastCheckinAt字段:"
psql -d pingan_dev -c "SELECT id, phone, nickname, last_checkin_at FROM users WHERE phone='$PHONE';"
echo ""
echo "查询checkins表:"
psql -d pingan_dev -c "SELECT id, user_id, checkin_date, checkin_time FROM checkins ORDER BY checkin_time DESC LIMIT 5;"
echo ""

echo "========================================="
echo "测试完成！"
echo "========================================="