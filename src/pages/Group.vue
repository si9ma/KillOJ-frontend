<template>
  <div>
    <!--for fullscreen loading-->
    <a v-loading.fullscreen.lock="doing"></a>

    <!--manage groups-->
    <div class="row">
      <div class="col-md-12">
        <el-button type="primary"
                   @click="addGroup"
                   size="small"
                   class="mb-3">添加分组
        </el-button>
      </div>
    </div>
    <div class="row">
      <div :class="{'col-md-8':sidebar,'col-md-12':!sidebar,'ml-auto':true,'mr-auto':true}">
        <el-table ref="groupTable"
                  :data="finalGroups"
                  @sort-change="resortGroups"
                  @header-click="noShowInfo"
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
            <template slot-scope="scope">
              <el-link type="primary" :underline="false" @click="showInfo(scope.row)">
                {{scope.row.name}}
              </el-link>
            </template>
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
                       :total="groups.length">
        </el-pagination>
      </div>
      <div v-if="sidebar"
           class="col-md-4">

        <!--        add or update  -->
        <card v-if="activeGroup.owner && activeGroup.owner.id === mySelf.id || isAddGroup">
          <h5 slot="header"
              class="title">{{ isAddGroup ? '添加' :'修改'}}分组</h5>

          <div class="row">
            <div class="col-md-10 ml-auto mr-auto">
              <el-form :model="activeGroup"
                       ref="groupForm"
                       :rules="groupRules">
                <el-form-item prop="name"
                              label="名称">
                  <el-input v-model="activeGroup.name"
                            @focus="alreadyExistField.name = false"
                            placeholder="名称"></el-input>
                </el-form-item>
                <el-button size="small"
                           class="mt-1"
                           @click="isAddGroup ? submitForm('groupForm','add') : submitForm('groupForm','update') "
                           type="primary">{{isAddGroup ? '添加' : '修改'}}
                </el-button>
              </el-form>
            </div>
          </div>
        </card>

        <!-- invite -->
        <card v-if="activeGroup.owner && activeGroup.owner.id === mySelf.id">
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
        <user-card v-if="activeGroup.owner && activeGroup.owner.id !== mySelf.id"
                   :user="activeGroup.owner"
                   title="Owner信息"></user-card>
      </div>
    </div>
  </div>
</template>

<script>
  import UserCard from './Profile/UserCard'
  import {AuthHeader} from '../service/auth'
  import {ExtractJson} from '../service/util'
  import {Contains} from '../service/util'

  // for sort by id
  function groupCompareByID(order) {
    if (order === 'ascending') {
      return function (groupA, groupB) {
        return groupA.id - groupB.id
      }
    } else {
      return function (groupA, groupB) {
        return groupB.id - groupA.id
      }
    }
  }

  // for sort by name
  function groupCompareByName(order) {
    if (order === 'ascending') {
      return function (groupA, groupB) {
        return groupA.name.localeCompare(groupB.name);
      }
    } else {
      return function (groupA, groupB) {
        return groupB.name.localeCompare(groupA.name);
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
          callback(new Error('分组名不能包含!@#?字符'))
        } else if (this.alreadyExistField.name) {
          callback(new Error('分组名已被占用'))
        } else {
          callback()
        }
      };

      return {
        groups: [],
        sortedGroups: [],
        filteredGroups: [],
        finalGroups: [],
        currentPage: 1,
        pageSize: 10,
        sorter: {
          column: {},
          order: 'ascending',
          prop: '',
        },
        filter: {},
        sidebar: false,
        isAddGroup: false,
        activeGroup: null,
        doing: false,
        inviteURL: '',
        inviteData: {
          password: '',
          timeout: 60,
        },
        alreadyExistField: {
          name: false
        },
        groupRules: {
          name: [
            {required: true, message: '输入名称', trigger: 'blur'},
            {max: 50, message: '长度在不能超过50个字符', trigger: 'blur'},
            {validator: validateName, trigger: 'blur'}
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
      // when groups change ,resort
      groups(val) {
        if (val !== this.filteredGroups) {
          this.filterChange(this.filter)
        }
      }
    },
    created() {
      this.doing = true
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

          // add tag to each group
          this.groups.forEach(el => {
            if (el.owner.id === this.mySelf.id) {
              el.tags = [{name: 'Owner'}]
            } else {
              el.tags = []
            }
          })

          this.filterGroups()
          console.log('get groups success')
          this.doing = false
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
          }
          this.$gbl.alert('danger', '获取分组出错')
        })
    },
    methods: {
      filterChange(filter) {
        this.filter = filter // save filter
        this.filteredGroups = [...this.groups]
        for (let key in filter) {
          this.filteredGroups = this.filteredGroups.filter(group => {
            if (filter[key].length > 0) {
              switch (key) {
                case 'tags':
                  return group[key].some(el => filter[key].includes(el.name)) // we should check name field of tag
                default:
                  return group[key].some(el => filter[key].includes(el))
              }
            }

            return true
          })
        }

        this.resortGroups(this.sorter)
      },
      showInfo(row) {
        this.sidebar = true
        this.isAddGroup = false
        this.activeGroup = row
        this.getInviteInfo()
      },
      noShowInfo(row, column, event) {
        this.sidebar = false
      },
      addGroup() {
        this.activeGroup = {}
        this.isAddGroup = true
        this.sidebar = true
      },
      submitForm(formName, operation) {
        this.$refs[formName].validate((valid) => {
            if (valid) {
              switch (formName) {
                case 'groupForm':
                  // group form
                  switch (operation) {
                    case 'add':
                      this.createGroup()
                      break
                    case 'update':
                      this.updateGroup()
                  }
                  break

                case 'inviteForm':
                  // invite form
                  this.invite2Group()
              }
            } else {
              console.log('error submit!!')
            }
          }
        )
      },
      createGroup() {
        this.$axios({
          url: this.$gbl.apiURL + '/groups',
          method: 'post',
          headers: AuthHeader(),
          data: {
            name: this.activeGroup.name
          }
        })
          .then((response) => {
            console.log('create group successful!')
            let newGroup = response.data
            newGroup.owner = this.$store.state.userInfo // important, we need as info of myself
            newGroup.tags = [{name: "Owner"}] // add owner tag
            this.groups.push(newGroup)
            this.$gbl.alert('success', '添加分组成功')
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
                  this.$refs['groupForm'].validate() // trigger validate
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
            this.$gbl.alert('danger', '添加分组出错')
          })
      },
      updateGroup() {
        this.$axios({
          url: this.$gbl.apiURL + '/groups/group/' + this.activeGroup.id,
          method: 'put',
          headers: AuthHeader(),
          data: {
            name: this.activeGroup.name
          }
        })
          .then((response) => {
            console.log('update group successful!')
            let foundIndex = this.groups.findIndex(x => x.id === this.activeGroup.id);
            this.groups[foundIndex] = this.activeGroup
            this.$gbl.alert('success', '修改分组成功')
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
                  this.$refs['groupForm'].validate() // trigger validate
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
            this.$gbl.alert('danger', '修改分组出错')
          })
      },
      invite2Group() {
        this.$axios({
          url: _.join([this.$gbl.apiURL, '/groups/group', this.activeGroup.id, 'invite'], '/'),
          method: 'post',
          headers: AuthHeader(),
          data: {
            password: this.inviteData.password,
            timeout: this.inviteData.timeout * 60, // convert to second
          }
        })
          .then((response) => {
            console.log('invite group successful!')
            this.inviteURL = _.join([window.location.origin, 'groups/join', response.data.id], '/')
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
          url: _.join([this.$gbl.apiURL, 'groups/group', this.activeGroup.id, 'invite'], '/'),
          method: 'get',
          headers: AuthHeader(),
        })
          .then((response) => {
            console.log('get invite info successful!')
            this.inviteURL = _.join([window.location.origin, 'groups/join', response.data.id], '/')
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
        this.currentPage = val
        this.filterGroups()
      },
      handleSizeChange(val) {
        this.pageSize = val
        this.filterGroups()
      },
      resortGroups(val) {
        let byID = groupCompareByID(val.order)
        let byName = groupCompareByName(val.order)
        this.sortedGroups = [...this.filteredGroups] // deep copy
        this.sorter = val // save sort config

        // if prop is empty, reset to groups
        switch (val.prop) {
          case 'id':
            this.sortedGroups.sort(byID)
            break
          case 'name':
            this.sortedGroups.sort(byName)
            break
        }
        this.filterGroups()
      },
      filterGroups() {
        let from = (this.currentPage - 1) * this.pageSize
        let to = this.currentPage * this.pageSize
        this.finalGroups = this.sortedGroups.slice(from, to)
      }
    }
  }
</script>
