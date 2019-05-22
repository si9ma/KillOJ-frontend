<template>
  <div>
    <!--for fullscreen loading-->
    <a v-loading.fullscreen.lock="doing"></a>

    <div class="row">
      <div class="col-md-12">
        <el-button type="primary"
                   @click="addContest"
                   size="small"
                   class="mb-3">添加比赛
        </el-button>
      </div>
    </div>

    <!--manage contests-->
    <div class="row">
      <div :class="{'col-md-8':sidebar,'col-md-11':!sidebar,'ml-auto':true,'mr-auto':true}">
        <el-table ref="contestTable"
                  :data="finalContests"
                  @sort-change="resortContests"
                  @header-click="noShowInfo"
                  @row-click="showInfo"
                  @filter-change="filterChange"
                  :header-cell-style="$theme.tableTheme"
                  :cell-style="$theme.tableTheme"
                  style="width: 100%">
          <el-table-column prop="id"
                           class-name="pl-5"
                           label="ID"
                           sortable>
          </el-table-column>
          <el-table-column prop="name"
                           label="名称"
                           sortable>
          </el-table-column>
          <el-table-column prop="tags"
                           label="标签"
                           width="100"
                           column-key="tags"
                           :filters="[{ text: 'Owner', value: 'Owner' }]"
                           filter-placement="bottom-end">
            <template slot-scope="scope">
              <el-tag size="small" v-for="(tag,index) in scope.row.tags"
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
                       :total="contests.length">
        </el-pagination>
      </div>
      <div v-if="sidebar"
           class="col-md-4">

        <!--        add or update  -->
        <card v-if="activeContest.owner && activeContest.owner.id === mySelf.id || isAddContest">
          <h5 slot="header"
              class="title">{{ isAddContest ? '添加' :'修改'}}比赛</h5>

          <div class="row">
            <div class="col-md-10 ml-auto mr-auto">
              <el-form :model="activeContest"
                       ref="contestForm"
                       :rules="contestRules">
                <el-form-item prop="name"
                              label="名称">
                  <el-input v-model="activeContest.name"
                            @focus="alreadyExistField.name = false"
                            placeholder="名称"></el-input>
                </el-form-item>
                <el-form-item prop="contestDate" label="比赛日期">
                  <el-date-picker
                    style="width:100%"
                    v-model="activeContest.contestDate"
                    align="center"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期">
                  </el-date-picker>
                </el-form-item>
                <el-button size="small"
                           class="mt-1"
                           @click="isAddContest ? submitForm('contestForm','add') : submitForm('contestForm','update') "
                           type="primary">{{isAddContest ? '添加' : '修改'}}
                </el-button>
              </el-form>
            </div>
          </div>
        </card>

        <!-- invite -->
        <card v-if="activeContest.owner && activeContest.owner.id === mySelf.id">
          <h5 slot="header"
              class="title">邀请加入</h5>

          <div class="row">
            <div class="col-md-10 ml-auto mr-auto">
              <el-form v-if="inviteURL === ''"
                       ref="inviteForm"
                       :model="inviteData"
                       :rules="inviteRules">
                <el-form-item prop="password"
                              label="加入密码">
                  <el-input v-model="inviteData.password"
                            placeholder="不填写表示不需要密码"></el-input>
                </el-form-item>
                <el-form-item label="可直接加入的分组">
                  <el-select
                    style="width: 100%;"
                    v-model="inviteData.allow_groups"
                    multiple
                    filterable
                    default-first-option
                    placeholder="可以直接加入的分组">
                    <el-option
                      v-for="item in groups"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item prop="timeout"
                              label="有效期(分钟)">
                  <el-input type="number"
                            v-model.number="inviteData.timeout"
                            placeholder="不填写则为60分钟"></el-input>
                </el-form-item>
                <el-button size="small"
                           class="mt-1"
                           @click="submitForm('inviteForm','')"
                           type="primary">邀请
                </el-button>
              </el-form>
              <div v-else
                   class="mb-3">
                <a v-clipboard:copy="inviteURL"
                   v-clipboard:success="onCopy"
                   v-clipboard:error="onError">
                  <el-input type="text"
                            v-model="inviteURL"
                            disabled
                            size="small">
                    <font-awesome-icon style="cursor:pointer"
                                       slot="append"
                                       :icon="['fa','copy']"
                                       size="lg"/>
                  </el-input>
                </a>
              </div>
            </div>
          </div>
        </card>

        <!-- user info -->
        <user-card v-if="activeContest.owner && activeContest.owner.id !== mySelf.id"
                   :user="activeContest.owner"
                   title="Owner信息"></user-card>
      </div>
    </div>
  </div>
</template>

<script>
  import UserCard from './Profile/UserCard'
  import {AuthHeader} from '../service/auth'
  import {AfterDays, ExtractJson} from '../service/util'
  import {Contains} from '../service/util'

  // for sort by id
  function contestCompareByID(order) {
    if (order === 'ascending') {
      return function (contestA, contestB) {
        return contestA.id - contestB.id
      }
    } else {
      return function (contestA, contestB) {
        return contestB.id - contestA.id
      }
    }
  }

  // for sort by name
  function contestCompareByName(order) {
    if (order === 'ascending') {
      return function (contestA, contestB) {
        return contestA.name.localeCompare(contestB.name);
      }
    } else {
      return function (contestA, contestB) {
        return contestB.name.localeCompare(contestA.name);
      }
    }
  }

  export default {
    components: {
      UserCard
    },
    data: function () {
      let validateName = (rule, value, callback) => {
        // name shouldn't contains special character
        if (Contains(value, '!@#?')) {
          callback(new Error('比赛名不能包含!@#?字符'))
        } else if (this.alreadyExistField.name) {
          callback(new Error('比赛名已被占用'))
        } else {
          callback()
        }
      };

      let validateDate = (rule, value, callback) => {
        let now = new Date()
        if (!value || value.length !== 2) {
          callback(new Error('请选择开始结束日期'))
        } else if (+value[1] <= +value[0]) {
          callback(new Error('结束时间必须大于开始时间'))
        } else if (+value[0] < +now) {
          callback(new Error('开始时间必须晚于当前时间'))
        } else {
          callback()
        }
      };

      return {
        contests: [],
        groups: [],
        sortedContests: [],
        filteredContests: [],
        finalContests: [],
        currentPage: 1,
        pageSize: 10,
        sorter: {
          column: {},
          order: 'ascending',
          prop: '',
        },
        filter: {},
        sidebar: false,
        isAddContest: false,
        activeContest: {
          name: '',
          contestDate: []
        },
        doing: false,
        inviteURL: '',
        inviteData: {
          password: '',
          timeout: 60,
          allow_groups: [],
        },
        alreadyExistField: {
          name: false
        },
        contestRules: {
          name: [
            {required: true, message: '输入名称', trigger: 'blur'},
            {max: 50, message: '长度在不能超过50个字符', trigger: 'blur'},
            {validator: validateName, trigger: 'blur'}
          ],
          contestDate: [
            {validator: validateDate, trigger: 'blur'}
          ],
        },
        inviteRules: {
          password: [
            {max: 30, message: '长度在不能超过30个字符', trigger: 'blur'},
          ],
          timeout: [
            {min: 60, max: 43200, type: 'number', message: '60 ~ 43200分钟', trigger: 'blur'}
          ],
        },
      }
    },
    computed: {
      mySelf() {
        return this.$store.state.userInfo
      }
    },
    watch: {
      // when contests change ,resort
      contests(val) {
        if (val !== this.filteredContests) {
          this.filterChange(this.filter)
        }
      }
    },
    created() {
      this.doing = true

      // get all my contests
      this.$axios({
        method: 'get',
        url: this.$gbl.apiURL + '/contests',
        headers: AuthHeader(),
        params: {
          page: 1,
          page_size: 3000
        }
      })
        .then(response => {
          this.contests = response.data

          // add tag to each contest
          this.contests.forEach(el => {
            if (el.owner.id === this.mySelf.id) {
              el.tags = [{name: 'Owner'}]
            } else {
              el.tags = []
            }
          })

          this.filterContests()
          console.log('get contests success')
          this.$gbl.alert('success', '获取比赛成功')
        })
        .catch(error => {

          // handle json response
          let json = ExtractJson(error.response)
          if (json) {
            console.log(json)
            this.$gbl.alert('danger', json.error.message)
            return
          } else {
            console.log(error.response)
          }
          this.$gbl.alert('danger', '获取比赛出错')
        })

      // get all my groups
      this.$axios({
        method: 'get',
        url: this.$gbl.apiURL + '/groups',
        headers: AuthHeader(),
        params: {
          page: 1,
          page_size: 3000
        }
      })
        .then(response => {
          this.groups = response.data
          console.log('get groups success')
          this.doing = false
          this.$gbl.alert('success', '获取分组成功')
        })
        .catch(error => {
          this.doing = false

          // handle json response
          let json = ExtractJson(error.response)
          if (json) {
            console.log(json)
            this.$gbl.alert('danger', json.error.message)
            return
          } else {
            console.log(error.response)
            this.$gbl.alert('danger', '获取分组出错')
          }
        })
    },
    methods: {
      filterChange(filter) {
        this.filter = filter // save filter
        this.filteredContests = [...this.contests]
        for (let key in filter) {
          this.filteredContests = this.filteredContests.filter(contest => {
            if (filter[key].length > 0) {
              switch (key) {
                case 'tags':
                  return contest[key].some(el => filter[key].includes(el.name)) // we should check name field of tag
                default:
                  return contest[key].some(el => filter[key].includes(el))
              }
            }

            return true
          })
        }

        this.resortContests(this.sorter)
      },
      showInfo(row, column, event) {
        this.sidebar = true
        this.isAddContest = false
        row.contestDate = [row.start_time, row.end_time]
        this.activeContest = row
        this.getInviteInfo()
      },
      noShowInfo(row, column, event) {
        this.sidebar = false
      },
      addContest() {
        this.activeContest = {}
        this.isAddContest = true
        this.sidebar = true
        this.activeContest = {
          contestDate: [Date.now(), AfterDays(7)], // set default date
        }
      },
      submitForm(formName, operation) {
        this.$refs[formName].validate((valid) => {
            if (valid) {
              switch (formName) {
                case 'contestForm':
                  // contest form
                  switch (operation) {
                    case 'add':
                      this.createContest()
                      break
                    case 'update':
                      this.updateContest()
                  }
                  break

                case 'inviteForm':
                  // invite form
                  this.invite2Contest()
              }
            } else {
              console.log('error submit!!')
            }
          }
        )
      },
      createContest() {
        this.$axios({
          url: this.$gbl.apiURL + '/contests',
          method: 'post',
          headers: AuthHeader(),
          data: {
            name: this.activeContest.name,
            start_time: this.activeContest.contestDate[0],
            end_time: this.activeContest.contestDate[1],
          }
        })
          .then((response) => {
            console.log('create contest successful!')
            let newContest = response.data
            newContest.owner = this.$store.state.userInfo // important, we need as info of myself
            newContest.tags = [{name: "Owner"}] // add owner tag

            this.contests.push(newContest)
            this.$gbl.alert('success', '添加比赛成功')
          })
          .catch((error) => {
            // handle json response
            let json = ExtractJson(error.response)
            if (json) {
              switch (json.error.code) {
                case 40003: // something already exist
                  for (let field in json.error.extra) {
                    this.alreadyExistField[field] = true
                  }
                  this.$refs['contestForm'].validate() // trigger validate
                  this.$gbl.alert('warning', 'something wrong')
                  return
                default:
                  console.log(json)
                  this.$gbl.alert('danger', json.error.message)
                  return
              }
            } else {
              console.log(error.response)
            }
            this.$gbl.alert('danger', '添加比赛出错')
          })
      },
      updateContest() {
        this.$axios({
          url: this.$gbl.apiURL + '/contests/contest/' + this.activeContest.id,
          method: 'put',
          headers: AuthHeader(),
          data: {
            name: this.activeContest.name,
            start_time: this.activeContest.contestDate[0],
            end_time: this.activeContest.contestDate[1]
          }
        })
          .then((response) => {
            console.log('update contest successful!')
            let foundIndex = this.contests.findIndex(x => x.id == this.activeContest.id);
            this.contests[foundIndex] = this.activeContest
            this.$gbl.alert('success', '修改比赛成功')
          })
          .catch((error) => {
            console.log(error.response)
            // handle json response
            let json = ExtractJson(error.response)
            if (json) {
              switch (json.error.code) {
                case 40003: // something already exist
                  for (let field in json.error.extra) {
                    this.alreadyExistField[field] = true
                  }
                  this.$refs['contestForm'].validate() // trigger validate
                  this.$gbl.alert('warning', 'something wrong')
                  return
                default:
                  console.log(json)
                  this.$gbl.alert('danger', json.error.message)
                  return
              }
            } else {
              console.log(error.response)
            }
            this.$gbl.alert('danger', '修改比赛出错')
          })
      },
      invite2Contest() {
        this.$axios({
          url: _.join([this.$gbl.apiURL, '/contests/contest', this.activeContest.id, 'invite'], '/'),
          method: 'post',
          headers: AuthHeader(),
          data: {
            password: this.inviteData.password,
            timeout: this.inviteData.timeout * 60, // convert to second
            allow_groups: this.inviteData.allow_groups,
          }
        })
          .then((response) => {
            console.log('invite contest successful!')
            this.inviteURL = _.join([window.location.origin, 'contests/join', response.data.id], '/')
            this.$gbl.alert('success', '邀请成功')
          })
          .catch((error) => {
            // handle json response
            let json = ExtractJson(error.response)
            if (json) {
              console.log(json)
              this.$gbl.alert('danger', json.error.message)
              return
            } else {
              console.log(error.response)
            }
            this.$gbl.alert('danger', '邀请出错')
          })

      },
      getInviteInfo() {
        this.doing = true
        this.$axios({
          url: _.join([this.$gbl.apiURL, '/contests/contest', this.activeContest.id, 'invite'], '/'),
          method: 'get',
          headers: AuthHeader(),
        })
          .then((response) => {
            console.log('get invite info successful!')
            this.inviteURL = _.join([window.location.origin, 'contests/join', response.data.id], '/')
            this.$gbl.alert('success', '获取邀请信息成功')
            this.doing = false
          })
          .catch((error) => {
            this.doing = false
            // handle json response
            let json = ExtractJson(error.response)
            if (json) {
              console.log(json)
              this.inviteURL = ''
              return
            } else {
              console.log(error.response)
            }
            this.$gbl.alert('danger', '获取邀请信息错误')
          })

      },
      onCopy: function () {
        this.$gbl.alert('success', '复制成功')
      },
      onError: function () {
        this.$gbl.alert('danger', '复制失败')
      },
      handleCurrentChange(val) {
        console.log('current change', val)
        this.currentPage = val
        this.filterContests()
      },
      handleSizeChange(val) {
        console.log('page size change', val)
        this.pageSize = val
        this.filterContests()
      },
      resortContests(val) {
        let byID = contestCompareByID(val.order)
        let byName = contestCompareByName(val.order)
        this.sortedContests = [...this.filteredContests] // deep copy
        this.sorter = val // save sort config

        // if prop is empty, reset to contests
        switch (val.prop) {
          case 'id':
            this.sortedContests.sort(byID)
            break
          case 'name':
            this.sortedContests.sort(byName)
            break
        }
        this.filterContests()
      },
      filterContests() {
        let from = (this.currentPage - 1) * this.pageSize
        let to = this.currentPage * this.pageSize
        this.finalContests = this.sortedContests.slice(from, to)
      }
    }
  }
</script>
