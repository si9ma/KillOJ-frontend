import Vue from "vue";
import VueRouter from "vue-router";
import RouterPrefetch from 'vue-router-prefetch'
import App from "./App";
import router from "./router/index";

import BlackDashboard from "./plugins/blackDashboard";
import i18n from "./i18n"
import store from './store'
import { library } from '@fortawesome/fontawesome-svg-core'

import { faCloudsmith,faGithub,faLastfm,
  faSuperpowers,faWeibo,faZhihu } from '@fortawesome/free-brands-svg-icons'
import { faCopy,faCalendarDay,faChartPie,faCode,faCubes,
  faEnvelope,faInfoCircle,faList,faPaw,faRedo,faTags,
  faThumbsDown,faThumbsUp,faTrophy,faUser,faUsers } from '@fortawesome/free-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import VueClipboard from 'vue-clipboard2'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

import VueCodemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'

// codemirror theme
import 'codemirror/theme/material.css'
import 'codemirror/theme/monokai.css'
import 'codemirror/theme/solarized.css'

// codemirror language
import 'codemirror/mode/go/go.js'
import 'codemirror/mode/clike/clike.js'

// codemirror keymap
import 'codemirror/keymap/emacs.js'
import 'codemirror/keymap/vim.js'
import 'codemirror/keymap/sublime.js'

import ECharts from 'vue-echarts'
import 'echarts/lib/chart/pie'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/toolbox'
import 'echarts/lib/component/tooltip'
import { CalendarHeatmap } from 'vue-calendar-heatmap'

Vue.component('calendarHeatmap', CalendarHeatmap)

Vue.use(VueCodemirror)

// mavon editor
Vue.use(mavonEditor)

Vue.use(VueClipboard)

// font awesome icon
library.add(faUsers,faUser,faTrophy,faThumbsUp,faThumbsUp,faCubes,faGithub,faList,faCalendarDay,
  faCloudsmith,faLastfm,faSuperpowers,faWeibo,faZhihu,faCode,faInfoCircle,faPaw,faRedo,faTags,faChartPie,
  faEnvelope,faThumbsDown,faCopy)

Vue.component('v-chart', ECharts)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.use(BlackDashboard);
Vue.use(VueRouter);
Vue.use(RouterPrefetch);

/* eslint-disable no-new */
new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount("#app");
