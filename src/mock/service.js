// Mock服务层 - 模拟所有API调用
import { mockData, generateRecognitionResult } from './data.js'

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const mockService = {
  // 模拟Excel文件上传和解析
  async uploadExcel(file) {
    // 模拟上传延迟
    await delay(500 + Math.random() * 1000)
    
    // 模拟解析Excel文件，返回图片链接列表
    // 在实际项目中，这里会解析Excel文件并提取图片链接
    const linkCount = Math.floor(Math.random() * 8) + 4 // 4-12个链接
    const imageLinks = mockData.sampleImageLinks.slice(0, linkCount)
    
    return {
      success: true,
      message: `Excel文件解析成功`,
      data: {
        imageLinks,
        count: imageLinks.length
      }
    }
  },

  // 模拟识别接口
  async recognizeImages(params) {
    const { scene, ruleCode, outputCode, imageLinks, callbackUrl } = params
    
    // 模拟识别处理延迟（每次识别都有延迟）
    const results = []
    const isStackBox = scene === 'stack_box'
    
    if (isStackBox) {
      // 堆箱场景：将图片分组处理（每3张一组）
      const groupSize = 3
      const groups = []
      for (let i = 0; i < imageLinks.length; i += groupSize) {
        groups.push(imageLinks.slice(i, i + groupSize))
      }
      
      for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
        const group = groups[groupIndex]
        
        // 模拟识别延迟（堆箱识别时间更长）
        await delay(2000 + Math.random() * 3000)
        
        const result = generateRecognitionResult(
          group[0], // 使用第一张图片作为代表
          groupIndex,
          true, // 是堆箱场景
          group // 传入组图
        )
        
        results.push(result)
      }
    } else {
      // 其他场景：单张图片处理
      for (let i = 0; i < imageLinks.length; i++) {
        const imageUrl = imageLinks[i]
        
        // 模拟识别延迟
        await delay(1000 + Math.random() * 2000)
        
        const result = generateRecognitionResult(
          imageUrl,
          i,
          false // 不是堆箱场景
        )
        
        results.push(result)
      }
    }
    
    // 模拟回调（在实际项目中会调用callbackUrl）
    console.log('模拟回调到:', callbackUrl, {
      scene,
      ruleCode,
      outputCode,
      resultsCount: results.length
    })
    
    return {
      success: true,
      message: '识别完成',
      data: results
    }
  },

  // 获取场景选项
  getSceneOptions() {
    return mockData.sceneOptions
  },

  // 获取规则选项
  getRuleOptions() {
    return mockData.ruleOptions
  },

  // 获取输出项选项
  getOutputOptions() {
    return mockData.outputOptions
  }
}

