<template>
  <div>
    <!--for fullscreen loading-->
    <a v-loading.fullscreen.lock="doing"></a>

    <div class="row">
      <div class="col-12">
        <div class="row">
          <div class="col-md-9">
            <slot name="option"></slot>
          </div>
          <div class="col-md-2">
            <el-input @input="search" v-model="queryString" size="mini" placeholder="关键字" suffix-icon="el-icon-search">
            </el-input>
          </div>
          <div class="col-md-1">
            <div class="text-center">
              <el-tooltip class="item" :effect="$theme.isDark ? 'light':'dark'" content="清除所有筛选条件" placement="top-start">
                <el-button type="primary"
                           @click="clearFilter()"
                           size="mini"
                           class="mb-3">
                  <font-awesome-icon :icon="['fas','redo']"
                                     size="sm"/>
                </el-button>
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div :class="{'col-8':sidebar,'col-12':!sidebar,'ml-auto':true,'mr-auto':true}">
        <el-table ref="submitTable"
                  size="mini"
                  :data="finalSubmits"
                  @sort-change="resortSubmits"
                  @header-click="noShowInfo"
                  @filter-change="filterChange"
                  :header-cell-style="$theme.tableTheme"
                  :cell-style="cellStyle"
                  style="width: 100%">
          <el-table-column prop="id"
                           class-name="pl-5"
                           label="试题ID"
                           sortable>
            <template slot-scope="scope">
              <div style="border-left: 3px solid #1d8cf8">
              </div>
              <span>{{scope.row.problem.id}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="user"
                           class-name="pl-5"
                           sortable
                           label="提交者">
            <template slot-scope="scope">
              <el-popover
                placement="bottom"
                trigger="hover">
                <div class="row">
                  <div class="col-12" style="min-width: 20%">
                    <user-card :user="scope.row.user"/>
                  </div>
                </div>
                <el-link @click="$router.push('/user/' + scope.row.user_id)" slot="reference" type="primary" :underline="false">
                  {{scope.row.user.name}}
                </el-link>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column prop="name"
                           label="试题名称"
                           sortable>
            <template slot-scope="scope">
              <el-link slot="reference" type="primary" :underline="false">
                {{scope.row.problem.name}}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column prop="language"
                           :filters="languageFilter"
                           column-key="language"
                           filter-placement="bottom-end"
                           label="语言">
            <template slot-scope="scope">
              <el-tag style="cursor: pointer" @click="filterChange({language: [scope.row.language]})"
                      size="mini" type="primary" :color="languages[scope.row.language].color">
                <span style="color: white">
                {{languages[scope.row.language].name}}
                </span>
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="result"
                           :filters="resultFilter"
                           column-key="result"
                           filter-placement="bottom-end"
                           label="结果">
            <template slot-scope="scope">
              <el-tag style="cursor: pointer" @click="filterChange({result: [scope.row.result]})" size="mini" type="primary" :color="colors[scope.row.result]">
                <span style="color: white">
                {{results[scope.row.result]}}
                </span>
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="run_time"
                           sortable
                           label="使用时间">
          </el-table-column>
          <el-table-column prop="memory_usage"
                           sortable
                           label="占用内存">
          </el-table-column>
          <el-table-column prop="created_at"
                           sortable
                           label="提交日期">
            <template slot-scope="scope">
              <span>
                {{formatDate(scope.row.created_at)}}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="代码" width="50px">
            <template slot-scope="scope">
              <font-awesome-icon @click="showCode(scope.row)" :color="$theme.isDark ? 'white' : 'black'" style="cursor:pointer"
                                 :icon="['fas','code']"
                                 size="sm"/>
            </template>
          </el-table-column>
        </el-table>

        <!-- page -->
        <el-pagination class="mt-1"
                       @size-change="handleSizeChange"
                       background
                       @current-change="handleCurrentChange"
                       :current-page="currentPage"
                       :page-sizes="[5, 10, 15, 20,25,30,35,40]"
                       :page-size="10"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="submits.length">
        </el-pagination>
      </div>
      <div v-if="sidebar" class="col-4">
        <card body-classes="compact-card-body">
          <div slot="header" class="row mb-3">
            <div class="col-6">
              <font-awesome-icon :icon="['fas','code']"
                                 size="sm"/>
              <span class="ml-2">源码</span>
            </div>
            <div class="col-6 text-right">
              <el-tooltip class="item" :effect="$theme.isDark ? 'light':'dark'" content="加载代码" placement="top-start">
                <font-awesome-icon class="mr-4" @click="$router.push({path:'/problems/' + activeSubmit.problem.id,query: {load_from: activeSubmit.id}})"
                                   style="cursor: pointer" :color="$theme.isDark ? 'white' : 'black'" size="sm" :icon="['fab','cloudsmith']"/>
              </el-tooltip>
              <el-tooltip class="item" :effect="$theme.isDark ? 'light':'dark'" content="复制" placement="top-start">
                <a v-clipboard:copy="activeSubmit.source_code"
                   v-clipboard:success="onCopy"
                   v-clipboard:error="onError">
                  <font-awesome-icon style="cursor: pointer" :color="$theme.isDark ? 'white' : 'black'" size="sm" :icon="['fa','copy']"/>
                </a>
              </el-tooltip>
            </div>
          </div>
          <codemirror disable v-model="activeSubmit.source_code" :options="codeMirrorOpt"></codemirror>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash'

  // for sort by id
  import UserCard from "../pages/Profile/UserCard";
  function submitCompareByProblemID(order) {
    if (order === 'ascending') {
      return function (submitA, submitB) {
        return submitA.problem.id - submitB.problem.id
      }
    } else {
      return function (submitA, submitB) {
        return submitB.problem.id - submitA.problem.id
      }
    }
  }

  // for sort by name
  function submitCompareByProblemName(order) {
    if (order === 'ascending') {
      return function (submitA, submitB) {
        return submitA.problem.name.localeCompare(submitB.problem.name);
      }
    } else {
      return function (submitA, submitB) {
        return submitB.problem.name.localeCompare(submitA.problem.name);
      }
    }
  }

  function submitCompareByTime(order) {
    if (order === 'ascending') {
      return function (submitA, submitB) {
        return submitA.run_time - submitB.run_time
      }
    } else {
      return function (submitA, submitB) {
        return submitB.run_time - submitA.run_time
      }
    }
  }

  function submitCompareByMemory(order) {
    if (order === 'ascending') {
      return function (submitA, submitB) {
        return submitA.memory_usage - submitB.memory_usage
      }
    } else {
      return function (submitA, submitB) {
        return submitB.memory_usage - submitA.memory_usage
      }
    }
  }

  function submitCompareByCommiter(order) {
    if (order === 'ascending') {
      return function (submitA, submitB) {
        return submitB.user.name.localeCompare(submitA.user.name);
      }
    } else {
      return function (submitA, submitB) {
        return submitB.problem.user.localeCompare(submitA.user.name);
      }
    }
  }

  function submitCompareByDate(order) {
    if (order === 'ascending') {
      return function (submitA, submitB) {
        return new Date(submitB.created_at) - new Date(submitA.created_at)
      }
    } else {
      return function (submitA, submitB) {
        return new Date(submitA.created_at) - new Date(submitB.created_at)
      }
    }
  }

  export default {
    components: {UserCard},
    props: {
      submits: {
        type:Array,
        required: true
      }
    },
    data() {
      return {
        searchedSubmits: [],
        sortedSubmits: [],
        filteredSubmits: [],
        finalSubmits: [],
        queryString: '',
        currentPage: 1,
        colors: ['#56be6a','#80848f','#f09306','#ec600d','#749f83','#2f4554','#ea3e14','#c23531'],
        results: ["Accepted", "Juding", "RuntimeError", "CompileError", "RunTimeOut", "OOM", "WrongAnswer", "SystemError"],
        pageSize: 15,
        sorter: {
          column: {},
          order: 'ascending',
          prop: '',
        },
        filter: {},
        sidebar: false,
        activeSubmit: null,
        doing: false,
        languages: [
          {key: 0,color:'#c23531', name: 'C', value: 'text/x-csrc'},
          {key: 1, color: '#2f4554', name: 'C++', value: 'text/x-c++src'},
          {key: 2, color: '#60a0a8', name: 'Java', value: 'text/x-java'},
          {key: 3, color: '#d48265', name: 'Go', value: 'text/x-go'},
        ],
        codeMirrorOpt: {
          tabSize: 4,
          readOnly: true,
          styleActiveLine: true,
          lineNumbers: true,
          smartIndent: true,
          line: true,
          mode: 'x-text/go',
          theme: 'material',
        }
      }
    },
    computed: {
      resultFilter() {
        let res = []
        for (let i=0;i<this.results.length;i++) {
          res.push({text:this.results[i],value:i})
        }

        return res
      },
      languageFilter() {
        let res = []
        for (let i=0;i<this.languages.length;i++) {
          res.push({text:this.languages[i].name,value:i})
        }

        return res
      }
    },
    watch: {
      // when submit change ,resort
      submits(val) {
        if (val !== this.searchedSubmits) {
          this.search('')
        }
      }
    },
    methods: {
      filterChange(filter) {
        this.filter = filter // save filter
        this.filteredSubmits = [...this.searchedSubmits]
        for (let key in filter) {
          this.filteredSubmits = this.filteredSubmits.filter(submit => {
            if (filter[key].length > 0) {
              switch (key) {
                case 'result':
                  return filter[key].includes(submit.result)
                case 'language':
                  return filter[key].includes(submit.language)
                default:
                  return submit[key].some(el => filter[key].includes(el))
              }
            }

            return true
          })
        }

        this.currentPage = 1 // change current page to first page when resort
        this.resortSubmits(this.sorter)
      },
      showCode(row) {
        this.sidebar = true
        this.codeMirrorOpt.mode = this.languages[row.language].value
        this.activeSubmit = row
      },
      noShowInfo(row, column, event) {
        this.sidebar = false
      },
      handleCurrentChange(val) {
        this.currentPage = val
        this.filterSubmits()
      },
      handleSizeChange(val) {
        this.pageSize = val
        this.filterSubmits()
      },
      formatDate(date) {
        let res = _.replace(date,'T',' ')
        res = _.replace(res,'Z','')

        return res
      },
      resortSubmits(val) {
        let byID = submitCompareByProblemID(val.order)
        let byName = submitCompareByProblemName(val.order)
        let byTime = submitCompareByTime(val.order)
        let byMem = submitCompareByMemory(val.order)
        let byCommiter = submitCompareByCommiter(val.order)
        let byDate = submitCompareByDate(val.order)

        this.sortedSubmits = [...this.filteredSubmits] // deep copy
        this.sorter = val // save sort config

        // if prop is empty, reset to submit
        switch (val.prop) {
          case 'id':
            this.sortedSubmits.sort(byID)
            break
          case 'name':
            this.sortedSubmits.sort(byName)
            break
          case 'run_time':
            this.sortedSubmits.sort(byTime)
            break
          case 'memory_usage':
            this.sortedSubmits.sort(byMem)
            break
          case 'user':
            this.sortedSubmits.sort(byCommiter)
            break
          case 'created_at':
            this.sortedSubmits.sort(byDate)
            break
        }
        this.filterSubmits()
      },
      filterSubmits() {
        let from = (this.currentPage - 1) * this.pageSize
        let to = this.currentPage * this.pageSize
        this.finalSubmits = this.sortedSubmits.slice(from, to)
      },
      search(val) {
        this.searchedSubmits = val ? this.submits.filter(submit => {
          return submit.problem.name.toLowerCase().indexOf(val.toLowerCase()) === 0
        }) : [...this.submits]

        this.filterChange(this.filter)
      },
      clearFilter() {
        this.$refs.submitTable.clearFilter();
        this.filterChange({})
      },
      cellStyle(arg) {
        let style = this.$theme.tableTheme(arg)
        style['border-color'] = 'transparent'
        style['border-top'] = '2px solid' + (this.$theme.isDark ? '#1e1e2d' : '#f5f6fa')
        style['border-bottom'] = '2px solid' + (this.$theme.isDark ? '#1e1e2d' : '#f5f6fa')

        return style
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
  .el-tag {
    border: none !important;
  }
  .compact-card-body {
    padding: 0 !important;
  }
</style>
