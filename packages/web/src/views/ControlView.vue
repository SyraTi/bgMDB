<script setup lang="ts">
import {
  ArrowRight,
  CaretBottom,
  CaretTop,
  Warning,
} from '@element-plus/icons-vue'
</script>
<template>
  <div class="control-container">
    <el-row :gutter="16">
      <el-col :span="8">
        <div class="statistic-card">
          <el-statistic :value="98500">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                订阅番剧总量
              </div>
            </template>
          </el-statistic>
          <div class="statistic-footer">
            <div class="footer-item">
              <span>比上月</span>
              <span class="green">
              24%
              <el-icon>
                <CaretTop />
              </el-icon>
            </span>
            </div>
            <div class="footer-item">
              <el-icon :size="14">
                <ArrowRight />
              </el-icon>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="statistic-card">
          <el-statistic :value="72000" title="New transactions today">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                本季度新增订阅
              </div>
            </template>
          </el-statistic>
          <div class="statistic-footer">
            <div class="footer-item">
              <span>比上个季度</span>
              <span class="green">
              16%
              <el-icon>
                <CaretTop />
              </el-icon>
            </span>
            </div>
            <div class="footer-item">
              <el-icon :size="14">
                <ArrowRight />
              </el-icon>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="statistic-card">
          <el-statistic :value="693700">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                今日下载集数
              </div>
            </template>
          </el-statistic>
          <div class="statistic-footer">
            <div class="footer-item">
              <span>比昨日</span>
              <span class="red">
              12%
              <el-icon>
                <CaretBottom />
              </el-icon>
            </span>
            </div>
            <div class="footer-item">
              <el-icon :size="14">
                <ArrowRight />
              </el-icon>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>

:global(h2#card-usage ~ .example .example-showcase) {
  background-color: var(--el-fill-color) !important;
}

.el-statistic {
  --el-statistic-content-font-size: 28px;
}

.statistic-card {
  height: 100%;
  padding: 20px;
  border-radius: 4px;
  background-color: var(--el-bg-color-overlay);
}

.statistic-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 16px;
}

.statistic-footer .footer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistic-footer .footer-item span:last-child {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

.green {
  color: var(--el-color-success);
}
.red {
  color: var(--el-color-error);
}
</style>
