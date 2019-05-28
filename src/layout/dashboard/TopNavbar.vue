<template>
  <nav class="navbar navbar-expand-lg navbar-absolute"
       :class="{'bg-white': showMenu, 'navbar-transparent': !showMenu}">
    <div class="container-fluid">
      <div class="navbar-wrapper">
        <div class="navbar-minimize d-inline"
             :class="{toggled: $sidebar.showSidebar}">
          <button @click="toggleSidebar"
                  class="minimize-sidebar btn btn-link"
                  tabindex="0">
            <i class="tim-icons icon-align-center visible-on-sidebar-regular"></i>
            <i class="tim-icons icon-bullet-list-67 visible-on-sidebar-mini"></i>
          </button>
        </div>
        <div class="navbar-toggle d-inline"
             :class="{toggled: $sidebar.showSidebar}">
          <button type="button"
                  class="navbar-toggler"
                  aria-label="Navbar toggle button"
                  @click="toggleSidebar">
            <span class="navbar-toggler-bar bar1"></span>
            <span class="navbar-toggler-bar bar2"></span>
            <span class="navbar-toggler-bar bar3"></span>
          </button>
        </div>
        <a href="#"
           @click="$router.push('/')">
          <p class="mt-auto mb-auto"
             :color="$theme.isDark ? 'white' : 'dark'">
            {{routeName}}</p>
        </a>
      </div>
      <button class="navbar-toggler"
              type="button"
              @click="toggleMenu"
              data-toggle="collapse"
              data-target="#navigation"
              aria-controls="navigation-index"
              aria-label="Toggle navigation">
        <span class="navbar-toggler-bar navbar-kebab"></span>
        <span class="navbar-toggler-bar navbar-kebab"></span>
        <span class="navbar-toggler-bar navbar-kebab"></span>
      </button>

      <collapse-transition>
        <div class="collapse navbar-collapse show"
             v-show="showMenu">
          <ul class="navbar-nav"
              :class="$rtl.isRTL ? 'mr-auto' : 'ml-auto'">
            <base-dropdown tag="li"
                           :menu-on-right="!$rtl.isRTL"
                           title-tag="a"
                           class="nav-item"
                           menu-classes="dropdown-navbar">
              <a slot="title"
                 href="#"
                 class="dropdown-toggle nav-link"
                 data-toggle="dropdown"
                 aria-expanded="true">
                <div class="photo">
                  <img :src="user && user.avatar ? user.avatar : '/img/anime3.png'">
                </div>
                <b class="caret d-none d-lg-block d-xl-block"></b>
                <p class="d-lg-none">
                  Log out
                </p>
              </a>
              <li class="nav-link">
                <a href="#"
                   @click="user ? $router.push('/profile') : $router.push({path:'/login',query:{nocheck: '1'}})"
                   class="nav-item dropdown-item">{{user ? user.name : '登录'}}</a>
              </li>
              <li class="nav-link">
                <a @click="$theme.changeTheme()"
                   href="#"
                   class="nav-item dropdown-item">{{$theme.isDark ? '白色主题' : '黑色主题'}}</a>
              </li>


              <li class="nav-link">
                <a href="#"
                   class="nav-item dropdown-item">侧边栏
                <el-select @change="$theme.changeSidebar(sidebarColor)" :class="sidebarColor" size="mini" v-model="sidebarColor">
                  <el-option
                    v-for="item in sidebarColors"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value">
                  </el-option>
                </el-select>
                </a>
              </li>

              <li class="nav-link">
                <a href="#"
                   @click="$rtl.isRTL ? $rtl.disableRTL() : $rtl.enableRTL()"
                   class="nav-item dropdown-item">切换页面方向</a>
              </li>
              <div v-if="user">

                <div class="dropdown-divider"></div>
                <li class="nav-link">
                  <a href="#"
                     @click="logout()"
                     class="nav-item dropdown-item">Log out</a>
                </li>
              </div>
            </base-dropdown>
          </ul>
        </div>
      </collapse-transition>
    </div>
  </nav>
</template>
<script>
  import {CollapseTransition} from 'vue2-transitions';
  import Modal from '@/components/Modal';
  import _ from 'lodash'
  import {AuthHeader} from '@/service/auth'

  export default {
    components: {
      CollapseTransition,
      Modal
    },
    computed: {
      routeName() {
        const {name} = this.$route;
        return this.capitalizeFirstLetter(name);
      },
      isRTL() {
        return this.$rtl.isRTL;
      },
      user() {
        let user = this.$store.state.userInfo
        if (!_.isEmpty(user)) {
          return user
        }

        return null
      }
    },
    created() {
      this.sidebarColor = this.$theme.sidebarBG
    },
    data() {
      return {
        activeNotifications: false,
        showMenu: false,
        searchModalVisible: false,
        searchQuery: '',
        sidebarColor: 'blue',
        sidebarColors: [
          {name: '蓝色', value: 'blue'},
          {name: '绿色', value: 'green'},
          {name: 'Vue', value: 'vue'},
          {name: '紫色', value: 'purple'},
        ]
      };
    },
    methods: {
      capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      },
      toggleNotificationDropDown() {
        this.activeNotifications = !this.activeNotifications;
      },
      closeDropDown() {
        this.activeNotifications = false;
      },
      toggleSidebar() {
        this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
      },
      hideSidebar() {
        this.$sidebar.displaySidebar(false);
      },
      toggleMenu() {
        this.showMenu = !this.showMenu;
      },
      logout() {
        // logout api
        this.$axios({
          url: this.$gbl.apiURL + '/logout',
          method: 'get',
          headers: AuthHeader()
        })
          .then((response) => {
            // save token
            console.log('logout successful!')
          })
          .catch((error) => {
            console.log('logout successful!')
            console.log(error)
          })
        this.$store.commit('updateUserInfo', {})
        localStorage.setItem('jwt', '{}') // clear jwt
        this.$gbl.alert('success', '退出登录成功')
        this.$router.push({path: '/login', query: {nocheck: '1'}})
      }
    }
  };
</script>
<style lang="scss">
  @import '@/assets/sass/black-dashboard/custom/_variables.scss';

  .nav-link {
    .el-input__inner {
      border: none;
      background: transparent;
      padding: 0px;
    }
    
    .vue {
      .el-input__inner {
        color: $vue-states;
      }
    }

    .blue {
      .el-input__inner {
        color: $info-states;
      }
    }

    .green {
      .el-input__inner {
        color: $success;
      }
    }

    .purple {
      .el-input__inner {
        color: $purple;
      }
    }

    .el-input__suffix {
      display: none;
    }
  }
</style>
