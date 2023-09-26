<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import {
  ColdDrink, KnifeFork
} from '@element-plus/icons-vue'
import { ref } from 'vue'

const route = useRoute()
</script>
<template>
  <el-row class="container">
    <el-menu
        :default-active="route.path"
        class="side-menu"
        active-text-color="#ffd04b"
        background-color="#545c64"
        text-color="#fff"
        router
    >
      <el-menu-item index="/control">
        <el-icon>
          <KnifeFork/>
        </el-icon>
        <template #title>工作台</template>
      </el-menu-item>
      <el-menu-item index="/bangumi">
        <el-icon>
          <ColdDrink/>
        </el-icon>
        <template #title>番剧管理</template>
      </el-menu-item>
    </el-menu>
    <div class="router-view">
      <RouterView/>
    </div>
  </el-row>
</template>

<style lang="scss" scoped>
.container {
  height: 100%;
  flex-wrap: nowrap;
}

.side-menu {
  width: 200px;
  height: 100%;
  position: relative;

  .status {
    white-space: nowrap;
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    color: #ececec;
  }
}

.router-view {
  flex-grow: 1;
  background: var(--el-bg-color-page);
  padding: 20px;
}
</style>
