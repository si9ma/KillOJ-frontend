<template>
  <div>
    <!--for fullscreen loading-->
    <a v-loading.fullscreen.lock="doing"></a>

    <div class="row">
      <div :class="{'col-md-8':sidebar,'col-11':!sidebar}">
        <div class="row">
          <div class="col-md-9">
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
        <el-table ref="userTable"
                  :data="finalUsers"
                  @sort-change="resortUsers"
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
          <el-table-column prop="organization"
                           label="组织">
          </el-table-column>
          <el-table-column prop="no_in_organization"
                           label="组织内ID">
          </el-table-column>
          <el-table-column prop="tags"
                           label="标签"
                           width="200"
                           column-key="tags"
                           :filters="[{ text: 'Maintainer', value: 'Maintainer' },{text: 'Me' ,value: 'Me'}]"
                           filter-placement="bottom-end">
            <template slot-scope="scope">
              <el-tag style="cursor: pointer;" @click="filterChange({tags:[tag.name]})" size="small" v-for="(tag,index) in scope.row.tags"
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
                       :total="users.length">
        </el-pagination>
      </div>

      <div class="col-4" v-if="sidebar">
        <card v-if="activeUser.role !== 0">
          <h5 slot="header">操作</h5>
          <el-button size="mini" type="primary" @click="updateMaintainer()">{{activeUser.role === 1 ? '取消该用户的维护权限' : '将该用户设置为维护人员'}}</el-button>
        </card>
        <!-- user info -->
        <user-card v-if="activeUser" :user="activeUser" title="用户信息"></user-card>
      </div>
    </div>
  </div>
</template>

<script>
  import UserCard from './Profile/UserCard'
  import {AuthHeader} from '../service/auth'
  import {ExtractJson} from '../service/util'

  // for sort by id
  function userCompareByID(order) {
    if (order === 'ascending') {
      return function (userA, userB) {
        return userA.id - userB.id
      }
    } else {
      return function (userA, userB) {
        return userB.id - userA.id
      }
    }
  }

  // for sort by name
  function userCompareByName(order) {
    if (order === 'ascending') {
      return function (userA, userB) {
        return userA.name.localeCompare(userB.name);
      }
    } else {
      return function (userA, userB) {
        return userB.name.localeCompare(userA.name);
      }
    }
  }

  export default {
    components: {
      UserCard
    },
    data() {
      return {
        users: [],
        searchedUsers: [],
        sortedUsers: [],
        filteredUsers: [],
        finalUsers: [],
        queryString: '',
        currentPage: 1,
        pageSize: 10,
        sorter: {
          column: {},
          order: 'ascending',
          prop: '',
        },
        filter: {},
        sidebar: false,
        activeUser: null,
        doing: false,
      }
    },
    computed: {
      mySelf() {
        return this.$store.state.userInfo
      }
    },
    watch: {
      // when user change ,resort
      users(val) {
        if (val !== this.searchedUsers) {
          this.search('')
        }
      }
    },
    created() {
      if (this.mySelf.role !== 0) {
        this.$gbl.alert('danger','您没有权限访问当前页面')
        this.$router.push('/') // go home
      }

      this.doing = true
      this.$axios({
        method: 'get',
        url: this.$gbl.apiURL + '/users',
        headers: AuthHeader(),
        params: {
          page: 1,
          page_size: 3000
        }
      })
        .then(response => {
          this.users = response.data

          // add tag to each user
          this.users.forEach(el => {
            if (el.role === 1) {
              el.tags = [{name: 'Maintainer'}]
            }else if (el.id === this.mySelf.id) {
              el.tags = [{name: 'Me'}]
            } else {
              el.tags = []
            }
          })

          this.filterUsers()
          console.log('get user success')
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
            console.log(error)
            this.$gbl.alert('danger', '获取用户出错')
          }
        })
    },
    methods: {
      filterChange(filter) {
        this.filter = filter // save filter
        this.filteredUsers = [...this.searchedUsers]
        for (let key in filter) {
          this.filteredUsers = this.filteredUsers.filter(user => {
            if (filter[key].length > 0) {
              switch (key) {
                case 'tags':
                  return user[key].some(el => filter[key].includes(el.name)) // we should check name field of tag
                default:
                  return user[key].some(el => filter[key].includes(el))
              }
            }

            return true
          })
        }

        this.currentPage = 1 // change current page to first page when resort
        this.resortUsers(this.sorter)
      },
      showInfo(row) {
        this.sidebar = true
        this.activeUser = row
      },
      noShowInfo(row, column, event) {
        this.sidebar = false
      },
      handleCurrentChange(val) {
        this.currentPage = val
        this.filterUsers()
      },
      handleSizeChange(val) {
        this.pageSize = val
        this.filterUsers()
      },
      resortUsers(val) {
        let byID = userCompareByID(val.order)
        let byName = userCompareByName(val.order)
        this.sortedUsers = [...this.filteredUsers] // deep copy
        this.sorter = val // save sort config

        // if prop is empty, reset to user
        switch (val.prop) {
          case 'id':
            this.sortedUsers.sort(byID)
            break
          case 'name':
            this.sortedUsers.sort(byName)
            break
        }
        this.filterUsers()
      },
      filterUsers() {
        let from = (this.currentPage - 1) * this.pageSize
        let to = this.currentPage * this.pageSize
        this.finalUsers = this.sortedUsers.slice(from, to)
      },
      search(val) {
        this.searchedUsers = val ? this.users.filter(user => {
          return user.name.toLowerCase().indexOf(val.toLowerCase()) === 0
        }) : [...this.users]

        this.filterChange(this.filter)
      },
      clearFilter() {
        this.$refs.userTable.clearFilter();
        this.filterChange({})
      },
      updateMaintainer() {
        let role = this.activeUser.role === 1 ? 2 : 1
        this.$axios({
          url: this.$gbl.apiURL + '/admin/maintainers/' + this.activeUser.id,
          method: 'put',
          headers: AuthHeader(),
          data: {
            role
          }
        }).then(() => {
          let foundIndex = this.users.findIndex(x => x.id === this.activeUser.id);
          this.users[foundIndex].role = role
          if (role === 1) {
            this.users[foundIndex].tags = [{name:'Maintainer'}]
          }else {
            this.users[foundIndex].tags = []
          }

          this.$gbl.alert('success','设置成功')
          console.log('update maintainer success')
        }).catch(error => {
          let json = ExtractJson(error.response)
          if (json) {
            this.$gbl.alert('danger',json.error.message)
            console.log(json)
          }else {
            this.$gbl.alert('danger','设置出错')
            console.log(error)
          }
        })
      }
    },
  }
</script>

