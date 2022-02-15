<template>
  <div style="20px">
    <template v-for="(item, index) in msgList">
      <el-steps direction="vertical" :active="index + 1">
        <template>
          <el-step :title="index + 1 + ''" :description="item"></el-step>
        </template>
      </el-steps>
    </template>
  </div>
</template>

<script>
export default {
  name: "Log",
  props: ["msgList"],
};
</script>

<style></style>
