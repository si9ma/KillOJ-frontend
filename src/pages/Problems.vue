<template>
  <div>
    <!--for fullscreen loading-->
    <a v-loading.fullscreen.lock="doing"></a>

    <!--manage problems-->
    <!--    @click="addProblem"-->
    <div class="row">
      <div class="col-md-9">
        <div class="row">
          <div class="col-md-9">
            <el-button type="primary"
                       @click="$router.push('/problems/0')"
                       size="mini"
                       class="mb-3">添加试题
            </el-button>
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
      <div class="col-md-9">
        <el-table ref="problemTable"
                  size="mini"
                  :data="finalProblems"
                  @sort-change="resortProblems"
                  @filter-change="filterChange"
                  :header-cell-style="$theme.tableTheme"
                  :cell-style="$theme.tableTheme"
                  style="width: 100%">
          <el-table-column prop="id"
                           class-name="pl-5"
                           label="试题ID"
                           sortable>
          </el-table-column>
          <el-table-column prop="name"
                           label="名称"
                           sortable>
            <template slot-scope="scope">
              <el-link type="primary" :underline="false" @click="toProblem(scope.row)">
                {{scope.row.name}}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column prop="belongTo"
                           label="属于"
                           column-key="belongTo">
            <template slot-scope="scope">
              <el-tag style="cursor: pointer" @click="filterChange(getBelongToChange(scope.row))" size="small" class="ml-1 mr-1">
                <font-awesome-icon v-if="getBelongToIcon(scope.row)" :icon="getBelongToIcon(scope.row)" size="sm"/>
                {{getBelongToText(scope.row)}}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="difficulty"
                           label="难度"
                           column-key="difficulty"
                           width="100"
                           :filters="[{ text: '简单', value: 0 },{text:'中等',value:1},{text:'难',value:2}]">
            <template slot-scope="scope">
              <el-tag style="cursor: pointer" @click="filterChange({difficulty:[scope.row.difficulty]})" size="small">
                {{difficultyFilter[scope.row.difficulty].text}}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="catalog"
                           label="分类"
                           width="100"
                           column-key="catalog"
                           :filters="catalogFilter">
            <template slot-scope="scope">
              <el-tag style="cursor: pointer" @click="filterChange({catalog:[scope.row.catalog.id]})" size="small" class="ml-1 mr-1">
                {{scope.row.catalog.name}}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="tags"
                           label="标签"
                           header-align="center"
                           column-key="tags"
                           width="150"
                           :filters="tagFilter"
                           filter-placement="bottom-end">
            <template slot-scope="scope">
              <el-tag style="cursor: pointer" @click="filterChange({tags:[tag.id]})"
                      size="small" class="mr-1" v-for="(tag,index) in scope.row.tags"
                      :key="index">
                {{tag.name}}
              </el-tag>
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
                       :total="problems.length">
        </el-pagination>
      </div>
      <div class="col-md-3 ml-auto mr-auto">
        <card>
          <div slot="header">
            <font-awesome-icon :icon="['fas','cubes']"
                               size="sm"/>
            <span class="ml-2">分类</span>
          </div>

          <el-tag style="cursor: pointer" @click="filterChange({catalog:[catalog.id]})"
                  class="ml-1 mr-1 mt-1 mb-1" size="small" v-for="(catalog,index) in catalogs"
                  :key="index">
            {{catalog.name}}
          </el-tag>
        </card>

        <card>
          <div slot="header">
            <font-awesome-icon :icon="['fas','tags']"
                               size="sm"/>
            <span class="ml-2">标签</span>
          </div>

          <el-tag style="cursor: pointer" @click="filterChange({tags:[tag.id]})"
                  class="ml-1 mr-1 mt-1 mb-1" size="small" v-for="(tag,index) in tags"
                  :key="index">
            {{tag.name}}
          </el-tag>
        </card>

        <card>
          <div slot="header">
            <font-awesome-icon :icon="['fas','users']"
                               size="sm"/>
            <span class="ml-2">分组</span>
          </div>

          <el-tag style="cursor: pointer" @click="filterChange({belong_to:[{belong_type: 1,belong_to_id: group.id}]})"
                  class="ml-1 mr-1 mt-1 mb-1" size="small" v-for="(group,index) in groups"
                  :key="index">
            {{group.name}}
          </el-tag>
        </card>

        <card>
          <div slot="header">
            <font-awesome-icon :icon="['fas','trophy']"
                               size="sm"/>
            <span class="ml-2">比赛</span>
          </div>

          <el-tag style="cursor: pointer" @click="filterChange({belong_to:[{belong_type: 2,belong_to_id: contest.id}]})"
                  class="ml-1 mr-1 mt-1 mb-1" size="small" v-for="(contest,index) in contests"
                  :key="index">
            {{contest.name}}
          </el-tag>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
  import {AuthHeader} from '../service/auth'
  import {ExtractJson} from '../service/util'
  import {Contains} from '../service/util'
  import {GetAllCatalogs, GetAllContests, GetAllGroups, GetAllProblems, GetAllTags} from "../service";

  // for sort by id
  function problemCompareByID(order) {
    if (order === 'ascending') {
      return function (problemA, problemB) {
        return problemA.id - problemB.id
      }
    } else {
      return function (problemA, problemB) {
        return problemB.id - problemA.id
      }
    }
  }

  // for sort by name
  function problemCompareByName(order) {
    if (order === 'ascending') {
      return function (problemA, problemB) {
        return problemA.name.localeCompare(problemB.name);
      }
    } else {
      return function (problemA, problemB) {
        return problemB.name.localeCompare(problemA.name);
      }
    }
  }

  export default {
    name: 'Problem',
    data() {
      let validateName = (rule, value, callback) => {
        // name shouldn't contains special character
        if (Contains(value, '!@#?')) {
          callback(new Error('试题名不能包含!@#?字符'))
        } else if (this.alreadyExistField.name) {
          callback(new Error('试题名已被占用'))
        } else {
          callback()
        }
      };

      return {
        problems: [],
        tags: [],
        catalogs: [],
        groups: [],
        contests: [],
        searchedProblems: [],
        filteredProblems: [],
        sortedProblems: [],
        finalProblems: [],
        currentPage: 1,
        groupsMap: new Map(),
        contestsMap: new Map(),
        pageSize: 15,
        queryString: '',
        difficultyFilter: [
          {text: '简单', value: 0},
          {text: '中等', value: 1},
          {text: '难', value: 2}
        ],
        sorter: {
          column: {},
          order: 'ascending',
          prop: '',
        },
        filter: {},
        activeProblem: null,
        doing: false,
      }
    },
    computed: {
      mySelf() {
        return this.$store.state.userInfo
      },
      catalogFilter() {
        let filters = []
        this.catalogs.forEach(catalog => {
          filters.push({text: catalog.name, value: catalog.id})
        })
        return filters
      },
      tagFilter() {
        let filters = []
        this.tags.forEach(tag => {
          filters.push({text: tag.name, value: tag.id})
        })
        return filters
      }
    },
    watch: {
      problems(val) {
        if (this.searchedProblems !== val) {
          this.search('')
        }
      }
    },
    created() {
      let filter = this.$router.currentRoute.query.filter
      if (filter) {
        this.filter = JSON.parse(filter)
        console.log(this.filter)
      }

      GetAllGroups().then(groups => {
        this.groups = groups
        this.groupsMap = new Map(this.groups.map(i => [i.id,i]))
        console.log('get groups success')
      }).then(() => {
        GetAllContests().then(contests => {
          this.contests = contests
          this.contestsMap = new Map(this.contests.map(i => [i.id, i]))
          console.log('get contests success')
        })
      }).then(() => {
        GetAllProblems().then(problems => {
          this.problems = problems

          this.problems.forEach(el => {
            if (el.owner_id === this.mySelf.id) {
              el.tags.push({id: -1, name: 'Owner'})
            }
          })

          this.filterProblems()
          console.log('get problems success')
        })
      })

      GetAllTags().then(tags => {
        this.tags = tags
        console.log('get tags success')
      })

      GetAllCatalogs().then(catalogs => {
        this.catalogs = catalogs
        console.log('get catalogs success')
      })
    },
    methods: {
      filterChange(filter) {
        this.filter = filter // save filter
        this.filteredProblems = [...this.searchedProblems]
        for (let key in filter) {
          this.filteredProblems = this.filteredProblems.filter(problem => {
            if (filter[key].length > 0) {
              switch (key) {
                case 'tags':
                  return problem[key].some(el => filter[key].includes(el.id)) // we should check id field of tag
                case 'catalog':
                  return filter[key].includes(problem.catalog.id) // we should check id field of catalog
                case 'belong_to':
                  for (let st of filter[key]) {
                    if (st.belong_type === problem.belong_type && st.belong_to_id === problem.belong_to_id) {
                      return true
                    }
                  }
                  return false
                default:
                  return filter[key].includes(problem.difficulty)
              }
            }

            return true
          })
        }

        this.resortProblems(this.sorter)
      },
      handleCurrentChange(val) {
        console.log('current change', val)
        this.currentPage = val
        this.filterProblems()
      },
      handleSizeChange(val) {
        console.log('page size change', val)
        this.pageSize = val
        this.filterProblems()
      },
      resortProblems(val) {
        let byID = problemCompareByID(val.order)
        let byName = problemCompareByName(val.order)
        this.sortedProblems = [...this.filteredProblems] // deep copy
        this.sorter = val // save sort config

        // if prop is empty, reset to problems
        switch (val.prop) {
          case 'id':
            this.sortedProblems.sort(byID)
            break
          case 'name':
            this.sortedProblems.sort(byName)
            break
        }
        this.currentPage = 1 // change current page to first page when resort
        this.filterProblems()
      },
      filterProblems() {
        let from = (this.currentPage - 1) * this.pageSize
        let to = this.currentPage * this.pageSize
        this.finalProblems = this.sortedProblems.slice(from, to)
      },
      clearFilter() {
        this.$refs.problemTable.clearFilter();
        this.filterChange({})
      },
      search(val) {
        this.searchedProblems = val ? this.problems.filter(problem => {
          return problem.name.toLowerCase().indexOf(val.toLowerCase()) === 0
        }) : [...this.problems]

        this.filterChange(this.filter)
      },
      toProblem(row) {
        this.$router.push('/problems/' + row.id)
      },
      getBelongToIcon(row) {
        if (row.belong_type === 1) {
          return ['fas','users']
        } else if (row.belong_type === 2) {
          return ['fas','trophy']
        }

        return null
      },
      getBelongToText(row) {
        let belong_type = row.belong_type
        let belong_id = row.belong_to_id
        return belong_type === 0 ? 'Public' : (belong_type === 1 ? this.groupsMap.get(belong_id).name : this.contestsMap.get(belong_id).name)
      },
      getBelongToChange(row) {
        let belong_type = row.belong_type
        let belong_id = row.belong_to_id
        return {belong_to:[{belong_type:belong_type,belong_to_id:belong_id}]}
      }
    }
  }
</script>
