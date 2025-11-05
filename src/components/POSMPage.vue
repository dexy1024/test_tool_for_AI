<template>
  <div class="posm-page">
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
              <p><strong>说明：</strong>如果一行包含多个图片链接（用逗号、分号或换行分隔），将自动拆分为多行显示</p>
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
                <p>成功解析文件，共 <strong>{{ uploadedData.length }}</strong> 条原始数据</p>
                <p>拆分后共 <strong>{{ totalImageCount }}</strong> 个图片链接</p>
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
        
        <el-table-column label="图片缩略图" width="120" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row['图片链接']"
              :src="row['图片链接']"
              fit="cover"
              style="width: 80px; height: 80px; cursor: pointer; border-radius: 4px;"
              :preview-src-list="[row['图片链接']]"
              :preview-teleported="true"
              lazy
            >
              <template #error>
                <div class="image-error-placeholder">
                  <el-icon><picture /></el-icon>
                </div>
              </template>
            </el-image>
            <span v-else>无</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="POSM名称" label="POSM 名称" min-width="200" show-overflow-tooltip />
        
        <el-table-column label="人工判定" width="150" align="center" fixed="right">
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
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, CaretRight, Picture, Download } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'

export default {
  name: 'POSMPage',
  components: {
    Document,
    CaretRight,
    Picture,
    Download
  },
  setup() {
    const fileUploadRef = ref()
    const fileList = ref([])
    const uploadedData = ref([])
    const isExecuting = ref(false)
    const executionResults = ref([])

    // 计算总图片链接数量
    const totalImageCount = computed(() => {
      let count = 0
      uploadedData.value.forEach(row => {
        const imageLinks = extractImageLinks(row)
        count += imageLinks.length
      })
      return count
    })

    // 判断是否可以执行
    const canExecute = computed(() => {
      return uploadedData.value.length > 0
    })

    // 提取图片链接（支持多个分隔符：逗号、分号、换行）
    const extractImageLinks = (row) => {
      // 尝试从不同的字段名获取图片链接
      const imageLinkField = row['图片链接'] || row['图片'] || row['image'] || row['imageUrl'] || ''
      
      if (!imageLinkField) {
        return []
      }

      // 支持多种分隔符：逗号、分号、换行符、多个空格
      const links = imageLinkField
        .split(/[,;\n\r\s]+/)
        .map(link => link.trim())
        .filter(link => link && link.length > 0)

      return links
    }

    // 拆分数据：将一行中的多个图片链接拆分成多行
    const expandDataRows = (data) => {
      const expandedRows = []
      
      data.forEach((row, index) => {
        const imageLinks = extractImageLinks(row)
        
        if (imageLinks.length === 0) {
          // 如果没有图片链接，保留原始行
          expandedRows.push({
            ...row,
            _originalIndex: index
          })
        } else {
          // 为每个图片链接创建一行
          imageLinks.forEach((imageLink, linkIndex) => {
            expandedRows.push({
              ...row,
              '图片链接': imageLink,
              _originalIndex: index,
              _linkIndex: linkIndex
            })
          })
        }
      })
      
      return expandedRows
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
            // 处理 CSV 文件
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

          uploadedData.value = jsonData
          const totalImages = totalImageCount.value
          ElMessage.success(`成功解析文件，共 ${jsonData.length} 条原始数据，${totalImages} 个图片链接`)
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

    // 生成POSM名称列表
    const posmNames = [
      '海报-品牌宣传',
      '展架-产品展示',
      '横幅-促销活动',
      '立牌-价格标识',
      '贴纸-品牌标识',
      '展板-产品介绍',
      '吊旗-活动宣传',
      '展台-产品陈列',
      '灯箱-品牌展示',
      '标识牌-导引标识'
    ]

    // 模拟POSM识别
    const simulatePOSMRecognition = async (row, index) => {
      // 模拟识别延迟
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
      
      // 生成模拟数据 - 随机选择一个POSM名称
      const posmName = posmNames[Math.floor(Math.random() * posmNames.length)]
      
      return {
        ...row,
        'POSM名称': posmName,
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
      // 可以在这里保存判定结果到后端或本地存储
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

        // 定义表头顺序（可以根据需要调整）
        const headers = [
          '图片链接',
          'POSM名称',
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
          ...exportData.map(row => headers.map(header => row[header] || '')) // 数据行
        ]

        // 创建工作表
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

        // 设置列宽
        const colWidths = headers.map(header => {
          // 根据字段类型设置不同宽度
          if (header === '图片链接') return { wch: 40 }
          if (header === 'POSM名称') return { wch: 20 }
          if (header === '人工判定') return { wch: 12 }
          return { wch: 15 }
        })
        worksheet['!cols'] = colWidths

        // 创建工作簿
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'POSM识别结果')

        // 生成文件名（包含时间戳）
        const now = new Date()
        const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
        const fileName = `POSM识别结果_${timestamp}.xlsx`

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
        // 先拆分数据（将多个图片链接拆分成多行）
        const expandedData = expandDataRows(uploadedData.value)
        
        ElMessage.info(`开始处理 ${expandedData.length} 条记录`)

        // 逐条处理数据
        for (let i = 0; i < expandedData.length; i++) {
          const row = expandedData[i]
          const result = await simulatePOSMRecognition(row, i)
          executionResults.value.push(result)
          
          // 更新进度提示
          if ((i + 1) % 10 === 0 || i === expandedData.length - 1) {
            ElMessage.info(`已处理 ${i + 1}/${expandedData.length} 条数据`)
          }
        }

        ElMessage.success(
          `执行完成！共处理 ${executionResults.value.length} 条记录`
        )
      } catch (error) {
        ElMessage.error('执行失败，请重试')
        console.error('执行错误:', error)
      } finally {
        isExecuting.value = false
      }
    }

    return {
      fileUploadRef,
      fileList,
      uploadedData,
      totalImageCount,
      isExecuting,
      executionResults,
      handleFileChange,
      canExecute,
      startExecute,
      handleManualJudgmentChange,
      exportToExcel
    }
  }
}
</script>

<style scoped>
.posm-page {
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

.header-actions {
  display: flex;
  align-items: center;
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

.upload-success-section {
  margin-top: 20px;
}

.success-content {
  line-height: 1.6;
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

.image-error-placeholder {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 4px;
  color: #909399;
}

.image-error-placeholder .el-icon {
  font-size: 24px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 600;
}

.judgment-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
</style>
