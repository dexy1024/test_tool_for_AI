<template>
  <div class="distribution-page">
    <!-- 文件上传区域 -->
    <el-card class="upload-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>数据导入</span>
        </div>
      </template>
      
      <div class="upload-section">
        <el-upload
          ref="fileUploadRef"
          class="upload-demo"
          drag
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          accept=".xlsx,.xls,.csv"
          :limit="1"
        >
          <el-icon class="el-icon--upload"><document /></el-icon>
          <div class="el-upload__text">
            将Excel或CSV文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              <p>支持 .xlsx/.xls/.csv 格式</p>
              <p><strong>模板字段：</strong></p>
              <ul class="template-fields">
                <li><strong>图片链接</strong>（必填）</li>
                <li>阿里AI识别请求编码</li>
                <li>门店编码</li>
                <li>拜访id</li>
                <li>场景id</li>
                <li>项目id</li>
                <li>动作id</li>
                <li><strong>AI规则编码</strong>（必填）</li>
                <li><strong>AI规则名称</strong>（必填）</li>
              </ul>
            </div>
          </template>
        </el-upload>

        <!-- 文件解析结果提示 -->
        <div v-if="uploadedData.length > 0" class="upload-success-section">
          <el-alert
            title="文件解析成功"
            type="success"
            :closable="false"
            show-icon
          >
            <template #default>
              <div class="success-content">
                <p>成功解析文件，共 <strong>{{ uploadedData.length }}</strong> 条数据</p>
                <p v-if="validationErrors.length > 0" class="error-note">
                  发现 <strong>{{ validationErrors.length }}</strong> 条数据存在必填字段缺失，请检查
                </p>
              </div>
            </template>
          </el-alert>
        </div>

        <!-- 验证错误提示 -->
        <div v-if="validationErrors.length > 0" class="validation-errors">
          <el-alert
            title="数据验证错误"
            type="warning"
            :closable="false"
            show-icon
          >
            <template #default>
              <div class="error-list">
                <div v-for="(error, index) in validationErrors" :key="index" class="error-item">
                  第 {{ error.rowIndex + 1 }} 行：{{ error.message }}
                </div>
              </div>
            </template>
          </el-alert>
        </div>
      </div>

      <!-- 开始执行按钮 -->
      <div class="execute-button-container">
        <el-button
          type="primary"
          size="large"
          :loading="isExecuting"
          @click="startExecute"
          :disabled="!canExecute"
          class="execute-button"
        >
          <el-icon><caret-right /></el-icon>
          {{ isExecuting ? '执行中...' : '开始执行' }}
        </el-button>
      </div>
    </el-card>

    <!-- 执行结果表格 -->
    <el-card v-if="executionResults.length > 0" class="result-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>执行结果</span>
          <div class="header-actions">
            <el-tag type="info" size="small" style="margin-right: 10px;">
              共 {{ executionResults.length }} 条记录
            </el-tag>
            <el-button
              type="primary"
              size="small"
              :icon="Download"
              @click="exportToExcel"
            >
              导出Excel
            </el-button>
          </div>
        </div>
      </template>

      <el-table 
        :data="executionResults" 
        style="width: 100%" 
        stripe
        border
        max-height="600"
      >
        <el-table-column prop="图片链接" label="图片链接" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link :href="row['图片链接']" target="_blank" type="primary">
              {{ row['图片链接'] }}
            </el-link>
          </template>
        </el-table-column>
        
        <el-table-column prop="阿里AI识别请求编码" label="阿里AI识别请求编码" min-width="150" show-overflow-tooltip />
        
        <el-table-column prop="门店编码" label="门店编码" width="120" />
        
        <el-table-column prop="拜访id" label="拜访id" width="100" />
        
        <el-table-column prop="场景id" label="场景id" width="100" />
        
        <el-table-column prop="项目id" label="项目id" width="100" />
        
        <el-table-column prop="动作id" label="动作id" width="100" />
        
        <el-table-column prop="AI规则编码" label="AI规则编码" width="120" />
        
        <el-table-column prop="AI规则名称" label="AI规则名称" min-width="150" show-overflow-tooltip />
        
        <el-table-column prop="AI识别时间" label="AI识别时间" width="180" />
        
        <el-table-column prop="执行结果" label="执行结果" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row['执行结果'] === '成功' ? 'success' : 'danger'" size="small">
              {{ row['执行结果'] }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="不合格原因" label="不合格原因" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="{ 'error-text': row['不合格原因'] }">
              {{ row['不合格原因'] || '无' }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="人工判定" width="150" align="center">
          <template #default="{ row, $index }">
            <div v-if="row['人工判定']" class="judgment-display">
              <el-tag 
                :type="row['人工判定'] === '合格' ? 'success' : 'danger'" 
                size="small"
                style="margin-right: 8px;"
              >
                {{ row['人工判定'] }}
              </el-tag>
              <el-button
                type="text"
                size="small"
                @click="row['人工判定'] = ''"
              >
                修改
              </el-button>
            </div>
            <el-select
              v-else
              v-model="row['人工判定']"
              placeholder="请选择"
              size="small"
              style="width: 120px"
              @change="handleManualJudgmentChange(row, $index)"
            >
              <el-option label="合格" value="合格" />
              <el-option label="不合格" value="不合格" />
            </el-select>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="viewDetail(row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="数据详情"
      width="80%"
      class="detail-dialog"
    >
      <div v-if="currentDetail" class="detail-content">
        <!-- 图片展示区域 -->
        <div v-if="currentDetail['图片链接']" class="image-display-section">
          <div class="image-title">
            <el-icon><picture /></el-icon>
            <span>图片预览</span>
          </div>
          <div class="image-container">
            <el-image
              :src="currentDetail['图片链接']"
              fit="contain"
              class="detail-image"
              :preview-src-list="[currentDetail['图片链接']]"
              :preview-teleported="true"
              :lazy="true"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><picture-filled /></el-icon>
                  <p>图片加载失败</p>
                  <el-link :href="currentDetail['图片链接']" target="_blank" type="primary">
                    点击查看原图
                  </el-link>
                </div>
              </template>
            </el-image>
          </div>
          <div class="image-link">
            <el-link :href="currentDetail['图片链接']" target="_blank" type="primary" :underline="false">
              <el-icon><link /></el-icon>
              {{ currentDetail['图片链接'] }}
            </el-link>
          </div>
        </div>

        <!-- 数据信息区域 -->
        <div class="data-info-section">
          <div class="section-title">
            <el-icon><document /></el-icon>
            <span>数据信息</span>
          </div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="阿里AI识别请求编码">
              {{ currentDetail['阿里AI识别请求编码'] || '无' }}
            </el-descriptions-item>
            
            <el-descriptions-item label="门店编码">
              {{ currentDetail['门店编码'] || '无' }}
            </el-descriptions-item>
            
            <el-descriptions-item label="拜访id">
              {{ currentDetail['拜访id'] || '无' }}
            </el-descriptions-item>
            
            <el-descriptions-item label="场景id">
              {{ currentDetail['场景id'] || '无' }}
            </el-descriptions-item>
            
            <el-descriptions-item label="项目id">
              {{ currentDetail['项目id'] || '无' }}
            </el-descriptions-item>
            
            <el-descriptions-item label="动作id">
              {{ currentDetail['动作id'] || '无' }}
            </el-descriptions-item>
            
            <el-descriptions-item label="AI规则编码">
              {{ currentDetail['AI规则编码'] || '无' }}
            </el-descriptions-item>
            
            <el-descriptions-item label="AI规则名称">
              {{ currentDetail['AI规则名称'] || '无' }}
            </el-descriptions-item>
            
            <el-descriptions-item label="AI识别时间">
              {{ currentDetail['AI识别时间'] || '无' }}
            </el-descriptions-item>
            
            <el-descriptions-item label="执行结果">
              <el-tag :type="currentDetail['执行结果'] === '成功' ? 'success' : 'danger'" size="small">
                {{ currentDetail['执行结果'] || '无' }}
              </el-tag>
            </el-descriptions-item>
            
            <el-descriptions-item label="不合格原因" :span="2">
              <span :class="{ 'error-text': currentDetail['不合格原因'] }">
                {{ currentDetail['不合格原因'] || '无' }}
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, CaretRight, Picture, PictureFilled, Link, Download } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'

export default {
  name: 'DistributionPage',
  components: {
    Document,
    CaretRight,
    Picture,
    PictureFilled,
    Link,
    Download
  },
  setup() {
    const fileUploadRef = ref()
    const fileList = ref([])
    const uploadedData = ref([])
    const validationErrors = ref([])
    const isExecuting = ref(false)
    const executionResults = ref([])
    const detailDialogVisible = ref(false)
    const currentDetail = ref(null)

    // 必填字段
    const requiredFields = ['图片链接', 'AI规则编码', 'AI规则名称']

    // 验证数据
    const validateData = (data) => {
      const errors = []
      data.forEach((row, index) => {
        requiredFields.forEach(field => {
          if (!row[field] || (typeof row[field] === 'string' && row[field].trim() === '')) {
            errors.push({
              rowIndex: index,
              field,
              message: `缺少必填字段：${field}`
            })
          }
        })
      })
      return errors
    }

    // 处理文件变化
    const handleFileChange = (file) => {
      const fileType = file.name.split('.').pop().toLowerCase()
      
      if (!['xlsx', 'xls', 'csv'].includes(fileType)) {
        ElMessage.error('只能上传 Excel 或 CSV 文件!')
        fileUploadRef.value.clearFiles()
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          let workbook
          
          if (fileType === 'csv') {
            // 处理 CSV 文件 - 使用文本方式读取，xlsx 库会自动处理编码和分隔符
            const text = e.target.result
            workbook = XLSX.read(text, { 
              type: 'string',
              codepage: 65001 // UTF-8
            })
          } else {
            // 处理 Excel 文件
            const data = new Uint8Array(e.target.result)
            workbook = XLSX.read(data, { type: 'array' })
          }

          // 获取第一个工作表
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          
          // 转换为 JSON 格式
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
          
          if (jsonData.length === 0) {
            ElMessage.warning('文件为空，请检查文件内容')
            fileUploadRef.value.clearFiles()
            return
          }

          // 验证数据
          const errors = validateData(jsonData)
          validationErrors.value = errors

          if (errors.length > 0) {
            ElMessage.warning(`发现 ${errors.length} 条数据存在必填字段缺失`)
          }

          uploadedData.value = jsonData
          ElMessage.success(`成功解析文件，共 ${jsonData.length} 条数据`)
        } catch (error) {
          ElMessage.error('文件解析失败，请检查文件格式')
          console.error('文件解析错误:', error)
          fileUploadRef.value.clearFiles()
        }
      }

      reader.onerror = () => {
        ElMessage.error('文件读取失败')
        fileUploadRef.value.clearFiles()
      }

      // 根据文件类型选择读取方式
      if (fileType === 'csv') {
        reader.readAsText(file.raw, 'UTF-8')
      } else {
        reader.readAsArrayBuffer(file.raw)
      }
    }

    // 判断是否可以执行
    const canExecute = computed(() => {
      return uploadedData.value.length > 0 && validationErrors.value.length === 0
    })

    // 模拟执行识别
    const simulateRecognition = async (row, index) => {
      // 模拟识别延迟
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
      
      // 模拟识别结果（80% 成功，20% 失败）
      const isSuccess = Math.random() > 0.2
      const recognitionTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })

      return {
        ...row,
        'AI识别时间': recognitionTime,
        '执行结果': isSuccess ? '成功' : '失败',
        '不合格原因': isSuccess ? '' : '识别置信度低于阈值，请重新上传图片',
        '人工判定': '' // 初始化为空，等待用户判定
      }
    }

    // 处理人工判定变化
    const handleManualJudgmentChange = (row, index) => {
      const judgment = row['人工判定']
      if (judgment === '合格') {
        ElMessage.success(`第 ${index + 1} 条记录判定为：合格`)
      } else if (judgment === '不合格') {
        ElMessage.warning(`第 ${index + 1} 条记录判定为：不合格`)
      }
      console.log('人工判定结果:', {
        index: index + 1,
        judgment: judgment,
        row: row
      })
    }

    // 导出Excel
    const exportToExcel = () => {
      if (executionResults.value.length === 0) {
        ElMessage.warning('没有数据可导出')
        return
      }

      try {
        // 准备导出数据，包含所有字段
        const exportData = executionResults.value.map(row => {
          const exportRow = {}
          
          // 保留原始数据的所有字段
          Object.keys(row).forEach(key => {
            // 排除内部使用的字段
            if (key !== '_originalIndex' && key !== '_linkIndex') {
              exportRow[key] = row[key] || ''
            }
          })
          
          return exportRow
        })

        // 定义表头顺序
        const headers = [
          '图片链接',
          '阿里AI识别请求编码',
          '门店编码',
          '拜访id',
          '场景id',
          '项目id',
          '动作id',
          'AI规则编码',
          'AI规则名称',
          'AI识别时间',
          '执行结果',
          '不合格原因',
          '人工判定'
        ]

        // 添加其他可能存在的字段到表头
        const allKeys = new Set()
        exportData.forEach(row => {
          Object.keys(row).forEach(key => allKeys.add(key))
        })
        
        // 将其他字段追加到表头
        allKeys.forEach(key => {
          if (!headers.includes(key)) {
            headers.push(key)
          }
        })

        // 创建工作表数据
        const worksheetData = [
          headers, // 表头
          ...exportData.map(row => headers.map(header => row[header] || ''))
        ]

        // 创建工作表
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

        // 设置列宽
        const colWidths = headers.map(header => {
          if (header === '图片链接') return { wch: 40 }
          if (header === 'AI规则名称') return { wch: 20 }
          if (header === '不合格原因') return { wch: 30 }
          if (header === '人工判定') return { wch: 12 }
          if (header === 'AI识别时间') return { wch: 20 }
          return { wch: 15 }
        })
        worksheet['!cols'] = colWidths

        // 创建工作簿
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, '铺货识别结果')

        // 生成文件名（包含时间戳）
        const now = new Date()
        const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
        const fileName = `铺货识别结果_${timestamp}.xlsx`

        // 导出文件
        XLSX.writeFile(workbook, fileName)

        ElMessage.success(`成功导出 ${exportData.length} 条记录到 ${fileName}`)
      } catch (error) {
        ElMessage.error('导出失败，请重试')
        console.error('导出错误:', error)
      }
    }

    // 开始执行
    const startExecute = async () => {
      if (!canExecute.value) {
        ElMessage.warning('请先上传有效的文件数据')
        return
      }

      isExecuting.value = true
      executionResults.value = []

      try {
        // 逐条处理数据
        for (let i = 0; i < uploadedData.value.length; i++) {
          const row = uploadedData.value[i]
          const result = await simulateRecognition(row, i)
          executionResults.value.push(result)
          
          // 更新进度提示
          if ((i + 1) % 5 === 0 || i === uploadedData.value.length - 1) {
            ElMessage.info(`已处理 ${i + 1}/${uploadedData.value.length} 条数据`)
          }
        }

        const successCount = executionResults.value.filter(r => r['执行结果'] === '成功').length
        const failCount = executionResults.value.length - successCount

        ElMessage.success(
          `执行完成！成功：${successCount} 条，失败：${failCount} 条`
        )
      } catch (error) {
        ElMessage.error('执行失败，请重试')
        console.error('执行错误:', error)
      } finally {
        isExecuting.value = false
      }
    }

    // 查看详情
    const viewDetail = (row) => {
      currentDetail.value = row
      detailDialogVisible.value = true
    }

    return {
      fileUploadRef,
      fileList,
      uploadedData,
      validationErrors,
      isExecuting,
      executionResults,
      detailDialogVisible,
      currentDetail,
      handleFileChange,
      canExecute,
      startExecute,
      viewDetail,
      handleManualJudgmentChange,
      exportToExcel
    }
  }
}
</script>

<style scoped>
.distribution-page {
  padding: 20px;
}

.upload-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.upload-section {
  margin-bottom: 20px;
}

.upload-demo {
  width: 100%;
}

.el-upload__tip {
  margin-top: 10px;
  color: #606266;
  font-size: 14px;
}

.template-fields {
  margin: 10px 0;
  padding-left: 20px;
  line-height: 1.8;
}

.template-fields li {
  margin: 4px 0;
}

.upload-success-section {
  margin-top: 20px;
}

.success-content {
  line-height: 1.6;
}

.error-note {
  color: #e6a23c;
  margin-top: 8px;
}

.validation-errors {
  margin-top: 20px;
}

.error-list {
  max-height: 200px;
  overflow-y: auto;
}

.error-item {
  margin: 4px 0;
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
}

.error-item:last-child {
  border-bottom: none;
}

.execute-button-container {
  display: flex;
  justify-content: center;
  margin: 30px 0 10px;
}

.execute-button {
  font-size: 18px !important;
  font-weight: 600 !important;
  padding: 16px 32px !important;
  border-radius: 12px !important;
  min-width: 160px !important;
}

.result-card {
  margin-top: 20px;
}

.error-text {
  color: #f56c6c;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 600;
}

.detail-content {
  padding: 10px 0;
}

/* 图片展示区域 */
.image-display-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.image-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  max-height: 600px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-image {
  max-width: 100%;
  max-height: 560px;
  width: auto;
  height: auto;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.detail-image:hover {
  transform: scale(1.02);
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
}

.image-error .el-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.image-error p {
  margin: 10px 0;
  font-size: 14px;
}

.image-link {
  margin-top: 15px;
  text-align: center;
  padding: 10px;
  background: white;
  border-radius: 4px;
}

.image-link .el-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  word-break: break-all;
  font-size: 13px;
}

/* 数据信息区域 */
.data-info-section {
  margin-top: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.image-preview {
  text-align: center;
  margin-top: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.judgment-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
</style>
