<template>
  <div id="app">
    <el-container>
      <el-header class="header">
        <h1>图像识别系统测试平台</h1>
      </el-header>
      
      <el-main class="main-content">
        <el-tabs v-model="activeTab" type="card" class="main-tabs">
          <el-tab-pane label="陈列" name="display">
            <DisplayPage />
          </el-tab-pane>
          <el-tab-pane label="铺货" name="distribution">
            <DistributionPage />
          </el-tab-pane>
          <el-tab-pane label="价格" name="price">
            <PricePage />
          </el-tab-pane>
          <el-tab-pane label="POSM" name="posm">
            <POSMPage />
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref } from 'vue'
import DisplayPage from './components/DisplayPage.vue'
import DistributionPage from './components/DistributionPage.vue'
import PricePage from './components/PricePage.vue'
import POSMPage from './components/POSMPage.vue'

export default {
  name: 'App',
  components: {
    DisplayPage,
    DistributionPage,
    PricePage,
    POSMPage
  },
  setup() {
    const activeTab = ref('display')

    return {
      activeTab
    }
  }
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.main-content {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.main-tabs {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
