import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  
  {
    rules: {
      /* ==== JS 基础规则（宽松） ==== */
      'semi': ['error', 'never'], // 不要分号
      'quotes': ['error', 'single'], // 用单引号
      'no-unused-vars': 'warn', // 允许有未用变量，只给提示
      'no-console': 'off', // console.log 不报错（开发时很常用）
      'indent': ['error', 2], // 两格缩进

      /* ==== Vue 规则（宽松） ==== */
      'vue/html-self-closing': 'off', // 允许 <img /> 之类自闭合
      'vue/singleline-html-element-content-newline': 'off', // 标签内容不强制换行
      'vue/multiline-html-element-content-newline': 'off',
      'vue/max-attributes-per-line': 'off', // 一行多个属性也允许
      'vue/html-indent': ['error', 2], // 保持缩进整齐
      'vue/script-indent': 'off', 
      
      'vue/multi-word-component-names': 'off', // 组件名可以单词，比如 Hello.vue ✅
      'vue/require-default-prop': 'off', // prop 不一定要有默认值 ✅
      'vue/require-explicit-emits': 'off', // 不强制写 emits 声明 ✅
      'space-infix-ops': ['error', { int32Hint: false }] //变量和符号之间加上空格

      
    },
  },
])
