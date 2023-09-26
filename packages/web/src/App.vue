<script lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { defineComponent } from 'vue'
import { ElConfigProvider } from 'element-plus'
export default defineComponent({
  components: {
    ElConfigProvider,
    RouterView
  },
  data(){
    return {
      locale: zhCn
    }
  }
})
</script>

<template>
  <el-config-provider :locale="locale">
    <header>
    </header>
    <RouterView />
  </el-config-provider>
</template>

<style scoped>
</style>
