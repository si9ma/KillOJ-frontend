<template>
  <div class="row">
    <div :class="{'col-md-8':sidebar,'col-md-11':!sidebar,'ml-auto':true,'mr-auto':true}">
      <el-button type="primary"
                 @click="addGroup"
                 size="small"
                 class="mb-3">添加分组</el-button>
      <el-table ref="groupTable"
                :data="filteredGroups"
                @sort-change="resortGroups"
                @header-click="noShowInfo"
                @row-click="showInfo"
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
        <el-table-column prop="tag"
                         label="标签"
                         width="100"
                         :filters="[{ text: 'Owner', value: 'Owner' }]"
                         :filter-method="filterTag"
                         filter-placement="bottom-end">
          <template slot-scope="scope">
            <el-tag size="small" v-if="scope.row.owner.id === mySelf.id">
              Owner</el-tag>
          </template>
        </el-table-column>
      </el-table>
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
                         type="primary">{{isAddGroup ? '添加' : '修改'}}</el-button>
            </el-form>
          </div>
        </div>
      </card>
      <a v-loading.fullscreen.lock="doing"></a>
      <card v-if="activeGroup.owner && activeGroup.owner.id === mySelf.id">
        <h5 slot="header"
            class="title">邀请加入</h5>

        <div class="row">
          <div class="col-md-10 ml-auto mr-auto">
            <el-form v-if="inviteURL === ''"
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
                         @click="invite2Group()"
                         type="primary">邀请</el-button>
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
                                     size="lg" />
                </el-input>
              </a>
            </div>
          </div>
        </div>
      </card>
      <user-card v-if="activeGroup.owner && activeGroup.owner.id !== mySelf.id"
                 :user="activeGroup.owner"
                 title="Owner信息"></user-card>
    </div>
  </div>
</template>

<script>
  import UserCard from './Profile/UserCard'
  import { AuthHeader } from '@/service/auth'
  import { ExtractJson } from '@/service/util'
  import { Contains } from '@/service/util'

  function groupCompareByID (order) {
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

  function groupCompareByName (order) {
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
    data () {
      let validateName = (rule, value, callback) => {
        // name shouldn't contains special character
        if (Contains(value, '!@#?')) {
          callback(new Error('分组名不能包含!@#?字符'))
        } else if (this.alreadyExistField.name) {
          callback(new Error('分组名已被占用'))
        } else {
          callback()
        }
      }

      return {
        groups: [],
        sortedGroups: [],
        filteredGroups: [],
        currentPage: 1,
        pageSize: 10,
        filter: {
          column: {},
          order: 'ascending',
          prop: '',
        },
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
            { required: true, message: '输入名称', trigger: 'blur' },
            { max: 50, message: '长度在不能超过50个字符', trigger: 'blur' },
            { validator: validateName, trigger: 'blur' }
          ],
        },
        inviteRules: {
          password: [
            { max: 30, message: '长度在不能超过30个字符', trigger: 'blur' },
            { validator: validateName, trigger: 'blur' }
          ],
          timeout: [
            { min: 60, max: 43200, type: 'number', message: '60 ~ 43200分钟', trigger: 'blur' }
          ],
        },
      }
    },
    computed: {
      mySelf () {
        return this.$store.state.userInfo
      }
    },
    watch: {
      // when groups change ,resort
      groups (val) {
        if (val != this.sortedGroups) {
          this.resortGroups(this.filter)
        }
      }
    },
    created () {
      this.doing = true
      this.$axios({
        method: 'get',
        url: this.$gbl.apiURL + '/groups',
        headers: AuthHeader(),
        params: {
          page: 1,
          page_size: 30
        }
      })
        .then(response => {
          this.groups = response.data
          this.filterGroups()
          console.log('get groups success')
          this.doing = false
          this.$gbl.alert('success', '获取分组成功')
        })
        .catch(function (error) {
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
      filterTag (value, row) {
        return row.owner.id === this.mySelf.id
      },
      filterHandler (value, row, column) {
        const property = column['property'];
        return row[property] === value;
      },
      showInfo (row, column, event) {
        this.sidebar = true
        this.isAddGroup = false
        this.activeGroup = row
        this.getInviteInfo()
      },
      noShowInfo (row, column, event) {
        this.sidebar = false
      },
      addGroup () {
        this.activeGroup = {}
        this.isAddGroup = true
        this.sidebar = true
      },
      submitForm (formName, operation) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            switch (operation) {
              case 'add':
                this.createGroup()
                break
              case 'update':
                this.updateGroup()
            }
          } else {
            console.log('error submit!!')
          }
        })
      },
      createGroup () {
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
      updateGroup () {
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
            let foundIndex = this.groups.findIndex(x => x.id == this.activeGroup.id);
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
      invite2Group () {
        this.$axios({
          url: _.join([this.$gbl.apiURL, '/groups/group', this.activeGroup.id, 'invite'], '/'),
          method: 'post',
          headers: AuthHeader(),
          data: {
            password: this.inviteData.password,
            timeout: this.inviteData.timeout * 60, // convert to s
          }
        })
          .then((response) => {
            console.log('invite group successful!')
            this.inviteURL = _.join([window.location.origin, '/groups/group', response.data.group_id, response.data.id], '/')
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
      getInviteInfo () {
        this.doing = true
        this.$axios({
          url: _.join([this.$gbl.apiURL, '/groups/group', this.activeGroup.id, 'invite'], '/'),
          method: 'get',
          headers: AuthHeader(),
        })
          .then((response) => {
            console.log('get invite info successful!')
            this.inviteURL = _.join([window.location.origin, '/groups/group', response.data.group_id, response.data.id], '/')
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
      onCopy: function (e) {
        this.$gbl.alert('success', '复制成功')
      },
      onError: function (e) {
        this.$gbl.alert('danger', '复制失败')
      },
      handleCurrentChange (val) {
        console.log('current change', val)
        this.currentPage = val
        this.filterGroups()
      },
      handleSizeChange (val) {
        console.log('page size change', val)
        this.pageSize = val
        this.filterGroups()
      },
      resortGroups (val) {
        let byID = groupCompareByID(val.order)
        let byName = groupCompareByName(val.order)
        this.sortedGroups = [...this.groups] // deep copy
        this.filter = val // save sort config

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
      filterGroups () {
        let from = (this.currentPage - 1) * this.pageSize
        let to = this.currentPage * this.pageSize
        this.filteredGroups = this.sortedGroups.slice(from, to)
      }
    }
  }
</script>
