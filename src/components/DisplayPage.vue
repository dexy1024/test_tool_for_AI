<template>
  <div class="display-page">
    <!-- 配置区域 -->
    <el-card class="config-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>测试配置</span>
        </div>
      </template>
      
      <el-form :model="configForm" label-width="120px" class="config-form">
        <!-- 场景选择 -->
        <el-form-item label="选择场景" required>
          <div class="scene-selection">
            <div class="scene-options">
              <div
                v-for="scene in sceneOptions"
                :key="scene.value"
                :class="['scene-card', { 'active': configForm.scene === scene.value }]"
                @click="selectScene(scene.value)"
              >
                <div class="scene-label">{{ scene.label }}</div>
              </div>
            </div>
            <div v-if="configForm.scene" class="selected-scene">
              <el-tag type="primary" size="default">
                <el-icon><check /></el-icon>
                已选择：{{ getSceneLabel(configForm.scene) }}
              </el-tag>
            </div>
          </div>
        </el-form-item>

        <!-- 规则编码选择 -->
        <el-form-item label="规则编码" required>
          <div class="rule-selection">
            <div class="rule-options">
              <div
                v-for="rule in ruleOptions"
                :key="rule.value"
                :class="['rule-card', { 'active': configForm.ruleCode === rule.value }]"
                @click="selectRule(rule.value)"
              >
                <div class="rule-label">{{ rule.label }}</div>
              </div>
            </div>
            <div v-if="configForm.ruleCode" class="selected-rule">
              <el-tag type="primary" size="default">
                <el-icon><check /></el-icon>
                已选择：{{ getRuleLabel(configForm.ruleCode) }}
              </el-tag>
            </div>
          </div>
        </el-form-item>

        <!-- 输出项编码选择 -->
        <el-form-item label="输出项编码" required>
          <div class="output-selection">
            <div class="output-options">
              <div
                v-for="output in outputOptions"
                :key="output.value"
                :class="['output-card', { 'active': configForm.outputCode === output.value }]"
                @click="selectOutput(output.value)"
              >
                <div class="output-label">{{ output.label }}</div>
              </div>
            </div>
            <div v-if="configForm.outputCode" class="selected-output">
              <el-tag type="primary" size="default">
                <el-icon><check /></el-icon>
                已选择：{{ getOutputLabel(configForm.outputCode) }}
              </el-tag>
            </div>
          </div>
        </el-form-item>

        <!-- 上传图片链接Excel -->
        <el-form-item label="上传图片链接" required>
          <el-upload
            ref="excelUploadRef"
            class="upload-demo"
            drag
            :action="uploadAction"
            :before-upload="beforeExcelUpload"
            :on-success="handleExcelUploadSuccess"
            :on-error="handleExcelUploadError"
            :file-list="excelFileList"
            accept=".xlsx,.xls"
          >
            <el-icon class="el-icon--upload"><document /></el-icon>
            <div class="el-upload__text">
              将Excel文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 .xlsx/.xls 格式，Excel中需包含图片链接地址列
                <br>
                <span class="stack-box-note">堆箱场景下，需要上传一组图片</span>
              </div>
            </template>
            
            <!-- 堆箱场景备注 -->
            <div v-if="configForm.scene === 'stack_box'" class="scene-note">
              <el-alert
                title="堆箱场景说明"
                type="info"
                :closable="false"
                show-icon
              >
                <template #default>
                  <div class="note-content">
                    <p><strong>堆箱场景需要上传一组图片：</strong></p>
                    <ul>
                      <li>请确保Excel中包含多张图片链接</li>
                      <li>图片应展示堆箱的不同角度和细节</li>
                      <li>建议包含正面、侧面、顶部等视角</li>
                      <li>每组图片将作为一个整体进行识别分析</li>
                    </ul>
                  </div>
                </template>
              </el-alert>
            </div>
          </el-upload>
          
          <!-- 文件上传成功提示 -->
          <div v-if="imageLinks.length > 0" class="upload-success-section">
            <el-alert
              title="文件上传成功"
              type="success"
              :closable="false"
              show-icon
            >
              <template #default>
                <div class="success-content">
                  <p>Excel文件已成功上传并解析</p>
                  <p>共提取到 <strong>{{ imageLinks.length }}</strong> 个图片链接</p>
                </div>
              </template>
            </el-alert>
          </div>
        </el-form-item>

        <!-- 回调地址配置 -->
        <el-form-item label="回调地址" required>
          <el-input
            v-model="configForm.callbackUrl"
            placeholder="请输入回调地址"
            type="url"
          />
        </el-form-item>

        <!-- 开始识别按钮 -->
        <el-form-item>
          <div class="recognition-button-container">
            <el-button
              type="primary"
              size="large"
              :loading="isRecognizing"
              @click="startRecognition"
              :disabled="!canStartRecognition"
              class="recognition-button"
            >
              <el-icon><camera /></el-icon>
              {{ isRecognizing ? '识别中...' : '开始识别' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 识别结果表格 -->
    <el-card v-if="recognitionResults.length > 0" class="result-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>识别结果</span>
          <el-tag type="info" size="small">
            共 {{ recognitionResults.length }} 张图片
          </el-tag>
        </div>
      </template>

      <el-table :data="recognitionResults" style="width: 100%" stripe>
        <el-table-column label="图片" width="120" align="center">
          <template #default="{ row }">
            <el-image
              :src="row.thumbnail"
              :preview-src-list="[row.original]"
              fit="cover"
              style="width: 80px; height: 80px; cursor: pointer;"
              :preview-teleported="true"
            />
          </template>
        </el-table-column>

        <el-table-column label="是否合格" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isQualified ? 'success' : 'danger'" size="small">
              {{ row.isQualified ? '合格' : '不合格' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="原因" min-width="200">
          <template #default="{ row }">
            <div class="reason-text">
              {{ row.reason || '无' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="SKU信息" min-width="200">
          <template #default="{ row }">
            <div class="sku-info">
              <div v-if="Array.isArray(row.skuList) && row.skuList.length > 0" class="sku-list">
                <div 
                  v-for="(sku, index) in row.skuList" 
                  :key="index" 
                  class="sku-item"
                >
                  <span class="sku-name">{{ sku.name }}</span>
                  <el-tag type="info" size="small" class="sku-quantity">
                    {{ sku.quantity }}
                  </el-tag>
                </div>
              </div>
              <div v-else class="single-sku">
                <span class="sku-name">{{ row.skuName || '未识别' }}</span>
                <el-tag type="info" size="small" class="sku-quantity">
                  {{ row.quantity || 0 }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row, $index }">
            <el-button
              type="primary"
              size="small"
              @click="viewImage(row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 图片查看对话框 -->
    <el-dialog
      v-model="imageDialogVisible"
      :title="currentImageInfo?.isGroup ? '堆箱组图详情' : '图片详情'"
      width="80%"
      :before-close="handleImageDialogClose"
    >
      <div class="image-dialog-content">
        <!-- 堆箱场景：组图显示 -->
        <div v-if="currentImageInfo?.isGroup" class="group-images">
          <div class="group-images-title">
            <el-icon><picture /></el-icon>
            堆箱组图 ({{ currentImageInfo.groupImages.length }} 张)
          </div>
          <div class="group-images-grid">
            <div
              v-for="(imageUrl, index) in currentImageInfo.groupImages"
              :key="index"
              class="group-image-item"
              @click="currentImageUrl = imageUrl"
              :class="{ active: currentImageUrl === imageUrl }"
            >
              <el-image
                :src="imageUrl"
                fit="cover"
                style="width: 100%; height: 120px; border-radius: 4px;"
              />
              <div class="image-index">图 {{ index + 1 }}</div>
            </div>
          </div>
          <div class="main-image">
            <el-image
              :src="currentImageUrl"
              fit="contain"
              style="width: 100%; max-height: 400px;"
            />
          </div>
        </div>
        
        <!-- 其他场景：单图显示 -->
        <div v-else>
          <el-image
            :src="currentImageUrl"
            fit="contain"
            style="width: 100%; max-height: 600px;"
          />
        </div>
        
        <div v-if="currentImageInfo" class="image-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="是否合格">
              <el-tag :type="currentImageInfo.isQualified ? 'success' : 'danger'">
                {{ currentImageInfo.isQualified ? '合格' : '不合格' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="SKU名称">
              {{ currentImageInfo.skuName || '未识别' }}
            </el-descriptions-item>
            <el-descriptions-item label="数量">
              {{ currentImageInfo.quantity || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="原因" :span="2">
              {{ currentImageInfo.reason || '无' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="currentImageInfo.isGroup" label="组图数量" :span="2">
              {{ currentImageInfo.groupImages.length }} 张图片
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { mockService } from '../mock/service.js'

export default {
  name: 'DisplayPage',
  setup() {
    const configForm = reactive({
      scene: '',
      ruleCode: '',
      outputCode: '',
      callbackUrl: 'http://127.0.0.1:7001/index/callback'
    })

    const sceneOptions = mockService.getSceneOptions()
    const ruleOptions = mockService.getRuleOptions()
    const outputOptions = mockService.getOutputOptions()

    const excelUploadRef = ref()
    const excelFileList = ref([])
    const imageLinks = ref([])
    const uploadAction = '#'

    const isRecognizing = ref(false)
    const recognitionResults = ref([])

    const imageDialogVisible = ref(false)
    const currentImageUrl = ref('')
    const currentImageInfo = ref(null)

    const canStartRecognition = computed(() => {
      return configForm.scene && 
             configForm.ruleCode && 
             configForm.outputCode && 
             configForm.callbackUrl && 
             imageLinks.value.length > 0
    })

    const beforeExcelUpload = (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                     file.type === 'application/vnd.ms-excel' ||
                     file.name.endsWith('.xlsx') || 
                     file.name.endsWith('.xls')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isExcel) {
        ElMessage.error('只能上传Excel文件!')
        return false
      }
      if (!isLt5M) {
        ElMessage.error('文件大小不能超过 5MB!')
        return false
      }
      return true
    }

    const handleExcelUploadSuccess = async (response, file, fileList) => {
      try {
        const result = await mockService.uploadExcel(file)
        if (result.success) {
          ElMessage.success(`${file.name} 上传成功`)
          imageLinks.value = result.data.imageLinks
          ElMessage.success(`成功解析Excel文件，提取到 ${result.data.count} 个图片链接`)
        } else {
          ElMessage.error(result.message || '解析失败')
        }
      } catch (error) {
        ElMessage.error('文件解析失败，请重试')
        console.error('Excel解析错误:', error)
      }
    }

    const handleExcelUploadError = (error, file, fileList) => {
      ElMessage.error(`${file.name} 上传失败`)
    }

    const startRecognition = async () => {
      if (!canStartRecognition.value) {
        ElMessage.warning('请完成所有必填项')
        return
      }

      isRecognizing.value = true
      recognitionResults.value = []

      try {
        const result = await mockService.recognizeImages({
          scene: configForm.scene,
          ruleCode: configForm.ruleCode,
          outputCode: configForm.outputCode,
          imageLinks: imageLinks.value,
          callbackUrl: configForm.callbackUrl
        })
        
        if (result.success) {
          recognitionResults.value = result.data
          ElMessage.success(`识别完成，共识别 ${result.data.length} 张图片`)
        } else {
          ElMessage.error(result.message || '识别失败')
        }
      } catch (error) {
        ElMessage.error('识别失败，请重试')
        console.error('识别错误:', error)
      } finally {
        isRecognizing.value = false
      }
    }

    const viewImage = (row) => {
      if (row.groupImages && row.groupImages.length > 1) {
        currentImageUrl.value = row.groupImages[0]
        currentImageInfo.value = {
          ...row,
          isGroup: true,
          groupImages: row.groupImages
        }
      } else {
        currentImageUrl.value = row.original
        currentImageInfo.value = row
      }
      imageDialogVisible.value = true
    }

    const handleImageDialogClose = () => {
      imageDialogVisible.value = false
      currentImageUrl.value = ''
      currentImageInfo.value = null
    }

    const selectScene = (sceneValue) => {
      configForm.scene = sceneValue
    }

    const getSceneLabel = (sceneValue) => {
      const scene = sceneOptions.find(s => s.value === sceneValue)
      return scene ? scene.label : ''
    }

    const selectRule = (ruleValue) => {
      configForm.ruleCode = ruleValue
    }

    const getRuleLabel = (ruleValue) => {
      const rule = ruleOptions.find(r => r.value === ruleValue)
      return rule ? rule.label : ''
    }

    const selectOutput = (outputValue) => {
      configForm.outputCode = outputValue
    }

    const getOutputLabel = (outputValue) => {
      const output = outputOptions.find(o => o.value === outputValue)
      return output ? output.label : ''
    }

    return {
      configForm,
      sceneOptions,
      ruleOptions,
      outputOptions,
      excelUploadRef,
      excelFileList,
      imageLinks,
      uploadAction,
      isRecognizing,
      recognitionResults,
      canStartRecognition,
      beforeExcelUpload,
      handleExcelUploadSuccess,
      handleExcelUploadError,
      startRecognition,
      viewImage,
      imageDialogVisible,
      currentImageUrl,
      currentImageInfo,
      handleImageDialogClose,
      selectScene,
      getSceneLabel,
      selectRule,
      getRuleLabel,
      selectOutput,
      getOutputLabel
    }
  }
}
</script>

<style scoped>
.display-page {
  padding: 20px;
}

.config-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.config-form {
  max-width: 800px;
}

.upload-demo {
  width: 100%;
}

.result-card {
  margin-top: 20px;
}

.reason-text {
  word-break: break-word;
  line-height: 1.4;
}

.sku-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sku-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sku-item, .single-sku {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.sku-name {
  font-weight: 500;
  color: #409eff;
  font-size: 13px;
}

.sku-quantity {
  margin-left: 8px;
  font-size: 11px;
}

.image-dialog-content {
  text-align: center;
}

.image-info {
  margin-top: 20px;
  text-align: left;
}

.scene-selection, .rule-selection, .output-selection {
  width: 100%;
}

.scene-options, .rule-options, .output-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.rule-options, .output-options {
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 12px;
}

.scene-card, .rule-card, .output-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafafa;
  min-height: 20px;
}

.scene-card:hover, .rule-card:hover, .output-card:hover {
  border-color: #409eff;
  background: #f0f9ff;
  color: #409eff;
}

.scene-card.active, .rule-card.active, .output-card.active {
  border-color: #409eff;
  background: #409eff;
  color: white;
}

.scene-label, .rule-label, .output-label {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  line-height: 1.4;
}

.scene-label {
  font-size: 16px;
}

.selected-scene, .selected-rule, .selected-output {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.recognition-button-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.recognition-button {
  font-size: 18px !important;
  font-weight: 600 !important;
  padding: 16px 32px !important;
  border-radius: 12px !important;
  min-width: 160px !important;
}

.group-images {
  margin-bottom: 20px;
}

.group-images-title {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  color: #409eff;
  font-size: 16px;
}

.group-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.group-image-item {
  position: relative;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.group-image-item:hover {
  border-color: #409eff;
  transform: translateY(-2px);
}

.group-image-item.active {
  border-color: #409eff;
}

.image-index {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  text-align: center;
  padding: 4px;
  font-size: 12px;
}

.main-image {
  text-align: center;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}
</style>

