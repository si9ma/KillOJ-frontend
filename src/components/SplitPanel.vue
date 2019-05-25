<template>
  <card body-classes="compact-card-body" header-classes="shadow-header" class="mt-1">
    <div class="row" slot="header">
      <div v-if="title" class="col-md-6 col-sm-6 col-6">
        <h5>{{title}}</h5>
      </div>
      <div class="col-md-6 col-sm-6 col-6 text-right">
        <el-tooltip v-if="preview" class="item" :effect="$theme.isDark ? 'light':'dark'" content="复制输入" placement="left">
          <a v-clipboard:copy="value[leftKey]"
             v-clipboard:success="onCopy"
             v-clipboard:error="onError">
            <font-awesome-icon style="cursor:pointer"
                               :color="$theme.isDark ? 'white' : 'black'"
                               :icon="['fa','copy']"
                               size="sm"/>
          </a>
        </el-tooltip>
        <a v-else style="cursor: pointer" v-on:click="$emit('close',value);$emit('input',value)">
          <i class="el-icon-close"></i>
        </a>
      </div>
    </div>
    <div class="row split-panel">
      <div class="col-md-6 col-sm-6 col-6" style="border-right: 7px solid rgb(229, 229, 229)">
        <pre class="pl-2" v-if="preview">{{value[leftKey]}}</pre>
        <el-input v-else v-bind:value="value[leftKey]" type="textarea"
                  :placeholder="leftPlaceholder"
                  :autosize="{ minRows: 2, maxRows: 7}"
                  v-on:input="value[leftKey] = $event;$emit('input', value)"/>
      </div>
      <div class="col-md-6 col-sm-6 col-6">
        <pre class="pl-2" v-if="preview">{{value[rightKey]}}</pre>
        <el-input v-else @onkeyup="auto_grow(this)" v-bind:value="value[rightKey]" type="textarea"
                  :placeholder="rightPlaceholder"
                  :autosize="{ minRows: 2, maxRows: 7}"
                  v-on:input="value[rightKey] = $event;$emit('input', value)"/>
      </div>
    </div>
  </card>
</template>

<script>
  export default {
    name: "split-panel",
    props: {
      title: {
        type: String,
        description: 'title',
      },
      leftKey: {},
      rightKey: {},
      value: {},
      leftPlaceholder: {},
      rightPlaceholder: {},
      preview: {
        type: Boolean,
      },
    },
    methods: {
      auto_grow(el) {
        el.style.height = "5px";
        el.style.height = (el.scrollHeight) + "px";
      },
      onCopy: function () {
        this.$gbl.alert('success', '复制成功')
      },
      onError: function () {
        this.$gbl.alert('danger', '复制失败')
      },
    },
  }
</script>

<style lang="scss">
  .compact-card-body {
    padding: 0 !important;
  }

  .shadow-header {
    box-shadow: 0 1px 20px 0px rgba(0, 0, 0, 0.1) !important;
    z-index: 100;
  }

  .split-panel {
    .el-textarea__inner {
      border: none !important;
      border-radius: 0 !important;
    }
  }
</style>
