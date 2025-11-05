#!/bin/bash
# GitHub Pages 部署推送脚本

cd "$(dirname "$0")"

echo "════════════════════════════════════════════════"
echo "  推送代码到 GitHub"
echo "════════════════════════════════════════════════"
echo ""

# 使用 token 推送（请替换 YOUR_TOKEN 为你的 Personal Access Token）
# 如果设置了环境变量 GITHUB_TOKEN，会自动使用
if [ -z "$GITHUB_TOKEN" ]; then
    echo "请设置环境变量 GITHUB_TOKEN 或修改脚本中的 token"
    exit 1
fi
git push https://${GITHUB_TOKEN}@github.com/dexy1024/test_tool_for_AI.git main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功！"
    echo ""
    echo "下一步："
    echo "1. 访问：https://github.com/dexy1024/test_tool_for_AI/settings/pages"
    echo "2. 在 'Source' 中选择 'GitHub Actions'"
    echo "3. 保存设置"
    echo "4. 等待部署完成，访问：https://dexy1024.github.io/test_tool_for_AI/"
else
    echo ""
    echo "❌ 推送失败，请检查网络连接"
    echo ""
    echo "可以尝试："
    echo "1. 检查网络连接"
    echo "2. 使用 GitHub Desktop 推送"
    echo "3. 或手动在 GitHub 网页上传文件"
fi

