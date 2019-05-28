<template>
  <div>
    <!--for fullscreen loading-->
    <a v-loading.fullscreen.lock="doing"></a>

    <div class="row">
      <div :class="{'col-md-8':sidebar,'col-11':!sidebar}">
        <div class="row">
          <div class="col-md-9">
            <el-button type="primary"
                       @click="addCatalog()"
                       size="mini"
                       class="mb-3">添加分类
            </el-button>
          </div>
          <div class="col-md-3 text-right">
            <el-input @input="search" v-model="queryString" size="mini" placeholder="关键字" suffix-icon="el-icon-search"/>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div :class="{'col-8':sidebar,'col-12':!sidebar,'ml-auto':true,'mr-auto':true}">
        <el-table ref="catalogTable"
                  size="mini"
                  :data="finalCatalogs"
                  @sort-change="resortCatalogs"
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
                       :total="catalogs.length">
        </el-pagination>
      </div>

      <div class="col-4" v-if="sidebar">
        <card>
          <h5 slot="header"
              class="title">{{ isAddCatalog ? '添加' :'修改'}}分类</h5>

          <div class="row">
            <div class="col-md-10 ml-auto mr-auto">
              <el-form :model="activeCatalog"
                       ref="catalogForm"
                       :rules="catalogRules">
                <el-form-item prop="name"
                              label="名称">
                  <el-input v-model="activeCatalog.name"
                            @focus="alreadyExistField.name = false"
                            placeholder="名称"></el-input>
                </el-form-item>
                <el-button size="small"
                           class="mt-1"
                           @click="isAddCatalog ? submitForm('catalogForm','add') : submitForm('catalogForm','update') "
                           type="primary">{{isAddCatalog ? '添加' : '修改'}}
                </el-button>
              </el-form>
            </div>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
  import {AuthHeader} from '../service/auth'
  import {Contains, ExtractJson} from '../service/util'

  // for sort by id
  function catalogCompareByID(order) {
    if (order === 'ascending') {
      return function (catalogA, catalogB) {
        return catalogA.id - catalogB.id
      }
    } else {
      return function (catalogA, catalogB) {
        return catalogB.id - catalogA.id
      }
    }
  }

  // for sort by name
  function catalogCompareByName(order) {
    if (order === 'ascending') {
      return function (catalogA, catalogB) {
        return catalogA.name.localeCompare(catalogB.name);
      }
    } else {
      return function (catalogA, catalogB) {
        return catalogB.name.localeCompare(catalogA.name);
      }
    }
  }

  export default {
    data() {
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
        catalogs: [],
        searchedCatalogs: [],
        isAddCatalog: false,
        sortedCatalogs: [],
        filteredCatalogs: [],
        finalCatalogs: [],
        queryString: '',
        alreadyExistField: {
          name: false
        },
        currentPage: 1,
        pageSize: 15,
        sorter: {
          column: {},
          order: 'ascending',
          prop: '',
        },
        filter: {},
        sidebar: false,
        activeCatalog: null,
        doing: false,
        catalogRules: {
          name: [
            {required: true, message: '输入名称', trigger: 'blur'},
            {max: 50, message: '长度在不能超过50个字符', trigger: 'blur'},
            {validator: validateName, trigger: 'blur'}
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
      // when catalog change ,resort
      catalogs(val) {
        if (val !== this.searchedCatalogs) {
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
        url: this.$gbl.apiURL + '/catalogs',
        headers: AuthHeader(),
        params: {
          page: 1,
          page_size: 3000
        }
      })
        .then(response => {
          this.catalogs = response.data

          this.filterCatalogs()
          console.log('get catalog success')
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
            this.$gbl.alert('danger', '获取分类出错')
          }
        })
    },
    methods: {
      filterChange(filter) {
        this.filter = filter // save filter
        this.filteredCatalogs = [...this.searchedCatalogs]
        for (let key in filter) {
          this.filteredCatalogs = this.filteredCatalogs.filter(catalog => {
            if (filter[key].length > 0) {
              switch (key) {
                case 'tags':
                  return catalog[key].some(el => filter[key].includes(el.name)) // we should check name field of tag
                default:
                  return catalog[key].some(el => filter[key].includes(el))
              }
            }

            return true
          })
        }

        this.currentPage = 1 // change current page to first page when resort
        this.resortCatalogs(this.sorter)
      },
      showInfo(row) {
        this.sidebar = true
        this.activeCatalog = row
      },
      noShowInfo(row, column, event) {
        this.sidebar = false
      },
      handleCurrentChange(val) {
        this.currentPage = val
        this.filterCatalogs()
      },
      handleSizeChange(val) {
        this.pageSize = val
        this.filterCatalogs()
      },
      resortCatalogs(val) {
        let byID = catalogCompareByID(val.order)
        let byName = catalogCompareByName(val.order)
        this.sortedCatalogs = [...this.filteredCatalogs] // deep copy
        this.sorter = val // save sort config

        // if prop is empty, reset to catalog
        switch (val.prop) {
          case 'id':
            this.sortedCatalogs.sort(byID)
            break
          case 'name':
            this.sortedCatalogs.sort(byName)
            break
        }
        this.filterCatalogs()
      },
      filterCatalogs() {
        let from = (this.currentPage - 1) * this.pageSize
        let to = this.currentPage * this.pageSize
        this.finalCatalogs = this.sortedCatalogs.slice(from, to)
      },
      search(val) {
        this.searchedCatalogs = val ? this.catalogs.filter(catalog => {
          return catalog.name.toLowerCase().indexOf(val.toLowerCase()) === 0
        }) : [...this.catalogs]

        this.filterChange(this.filter)
      },
      clearFilter() {
        this.$refs.catalogTable.clearFilter();
        this.filterChange({})
      },
      addCatalog() {
        this.activeCatalog = {}
        this.isAddCatalog = true
        this.sidebar = true
      },
      submitForm(formName, operation) {
        this.$refs[formName].validate((valid) => {
            if (valid) {
              switch (operation) {
                case 'add':
                  this.createCatalog()
                  break
                case 'update':
                  this.updateCatalog()
              }
            } else {
              console.log('error submit!!')
            }
          }
        )
      },
      createCatalog() {
        this.$axios({
          url: this.$gbl.apiURL + '/catalogs',
          method: 'post',
          headers: AuthHeader(),
          data: {
            name: this.activeCatalog.name
          }
        })
          .then((response) => {
            console.log('create catalog successful!')
            let newCatalog = response.data
            this.catalogs.push(newCatalog)
            this.$gbl.alert('success', '添加分类成功')
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
                  this.$refs['catalogForm'].validate() // trigger validate
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
            this.$gbl.alert('danger', '添加分类出错')
          })
      },
      updateCatalog() {
        this.$axios({
          url: this.$gbl.apiURL + '/catalogs/' + this.activeCatalog.id,
          method: 'put',
          headers: AuthHeader(),
          data: {
            name: this.activeCatalog.name
          }
        })
          .then((response) => {
            console.log('update catalog successful!')
            let foundIndex = this.catalogs.findIndex(x => x.id === this.activeCatalog.id);
            this.catalogs[foundIndex] = this.activeCatalog
            this.$gbl.alert('success', '修改分类成功')
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
                  this.$refs['catalogForm'].validate() // trigger validate
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
            this.$gbl.alert('danger', '修改分类出错')
          })
      },
    },
  }
</script>
