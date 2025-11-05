// Mock数据配置
export const mockData = {
  // 场景选项
  sceneOptions: [
    { label: '端架', value: 'end_shelf' },
    { label: '货架', value: 'shelf' },
    { label: '挂架', value: 'hanging_rack' },
    { label: '落地架', value: 'floor_stand' },
    { label: '展示架', value: 'display_stand' },
    { label: '促销架', value: 'promotion_stand' },
    { label: '堆箱', value: 'stack_box' }
  ],

  // 规则编码选项
  ruleOptions: [
    { label: '001', value: 'rule_001' },
    { label: '002', value: 'rule_002' },
    { label: '003', value: 'rule_003' },
    { label: '004', value: 'rule_004' },
    { label: '005', value: 'rule_005' }
  ],

  // 输出项编码选项
  outputOptions: [
    { label: '001', value: 'output_001' },
    { label: '002', value: 'output_002' },
    { label: '003', value: 'output_003' },
    { label: '004', value: 'output_004' }
  ],

  // SKU名称库
  skuNames: {
    normal: [
      '可口可乐', '百事可乐', '雪碧', '芬达', '美年达', 
      '七喜', '红牛', '脉动', '娃哈哈', '康师傅冰红茶',
      '统一绿茶', '农夫山泉', '怡宝', '康师傅绿茶'
    ],
    stackBox: [
      '堆箱商品A', '堆箱商品B', '堆箱商品C', '堆箱商品D',
      '堆箱商品E', '堆箱商品F', '堆箱商品G', '堆箱商品H'
    ]
  },

  // 识别结果原因库
  reasons: {
    qualified: [
      '商品摆放整齐，符合规范',
      '价格标签清晰可见',
      '商品无破损，状态良好',
      '陈列位置正确',
      '商品分类准确',
      '库存充足，陈列合理',
      '标识清晰，易于识别',
      '摆放稳固，无安全隐患'
    ],
    unqualified: [
      '商品摆放不整齐',
      '价格标签模糊不清',
      '商品有破损',
      '陈列位置错误',
      '商品分类混乱',
      '库存不足，需要补货',
      '标识缺失或错误',
      '摆放不稳，存在安全隐患',
      '堆箱高度超标，影响美观',
      '堆箱标识模糊，分类混乱',
      '堆箱间距过小，影响操作',
      '堆箱稳定性差，存在倾斜'
    ],
    stackBoxQualified: [
      '堆箱摆放整齐，高度符合规范',
      '堆箱稳定性良好，无倾斜',
      '堆箱标识清晰，分类正确',
      '堆箱间距合理，便于取货',
      '堆箱高度适中，美观整洁',
      '堆箱结构稳定，安全可靠'
    ],
    stackBoxUnqualified: [
      '堆箱摆放不整齐，存在安全隐患',
      '堆箱高度超标，影响美观',
      '堆箱标识模糊，分类混乱',
      '堆箱间距过小，影响操作',
      '堆箱稳定性差，存在倾斜',
      '堆箱结构不稳定，存在倒塌风险'
    ]
  },

  // 图片链接库（用于模拟Excel解析）
  sampleImageLinks: [
    'https://picsum.photos/400/300?random=1',
    'https://picsum.photos/400/300?random=2',
    'https://picsum.photos/400/300?random=3',
    'https://picsum.photos/400/300?random=4',
    'https://picsum.photos/400/300?random=5',
    'https://picsum.photos/400/300?random=6',
    'https://picsum.photos/400/300?random=7',
    'https://picsum.photos/400/300?random=8',
    'https://picsum.photos/400/300?random=9',
    'https://picsum.photos/400/300?random=10',
    'https://picsum.photos/400/300?random=11',
    'https://picsum.photos/400/300?random=12'
  ]
}

// 生成随机SKU列表（用于多个SKU的场景）
export function generateSkuList(isStackBox = false) {
  const skuPool = isStackBox ? mockData.skuNames.stackBox : mockData.skuNames.normal
  const count = Math.floor(Math.random() * 3) + 1 // 1-3个SKU
  const selectedSkus = []
  const usedIndices = new Set()

  for (let i = 0; i < count && selectedSkus.length < skuPool.length; i++) {
    let index
    do {
      index = Math.floor(Math.random() * skuPool.length)
    } while (usedIndices.has(index))
    
    usedIndices.add(index)
    selectedSkus.push({
      name: skuPool[index],
      quantity: Math.floor(Math.random() * 10) + 1
    })
  }

  return selectedSkus
}

// 生成单个SKU信息
export function generateSingleSku(isStackBox = false) {
  const skuPool = isStackBox ? mockData.skuNames.stackBox : mockData.skuNames.normal
  const randomSku = skuPool[Math.floor(Math.random() * skuPool.length)]
  
  return {
    name: randomSku,
    quantity: isStackBox 
      ? Math.floor(Math.random() * 20) + 5  // 堆箱数量更多
      : Math.floor(Math.random() * 10) + 1  // 普通场景数量
  }
}

// 生成识别结果原因
export function generateReason(isQualified, isStackBox = false) {
  const reasonPool = isStackBox
    ? (isQualified ? mockData.reasons.stackBoxQualified : mockData.reasons.stackBoxUnqualified)
    : (isQualified ? mockData.reasons.qualified : mockData.reasons.unqualified)
  
  return reasonPool[Math.floor(Math.random() * reasonPool.length)]
}

// 生成模拟识别结果
export function generateRecognitionResult(imageUrl, index, isStackBox = false, groupImages = null) {
  const isQualified = Math.random() > (isStackBox ? 0.2 : 0.3) // 堆箱80%合格，其他70%合格
  
  // 决定是单个SKU还是多个SKU
  const useMultipleSkus = Math.random() > 0.5
  
  let skuInfo
  if (useMultipleSkus) {
    skuInfo = {
      skuList: generateSkuList(isStackBox)
    }
  } else {
    const singleSku = generateSingleSku(isStackBox)
    skuInfo = {
      skuName: singleSku.name,
      quantity: singleSku.quantity
    }
  }

  const result = {
    id: index + 1,
    original: imageUrl,
    thumbnail: imageUrl,
    isQualified,
    reason: generateReason(isQualified, isStackBox),
    ...skuInfo
  }

  // 如果是堆箱场景且有组图，添加组图信息
  if (isStackBox && groupImages && groupImages.length > 1) {
    result.groupImages = groupImages
    result.groupSize = groupImages.length
  }

  return result
}

