<template>
  <nav class="navbar navbar-expand-lg navbar-absolute"
       :class="{'bg-white': showMenu, 'navbar-transparent': !showMenu}">
    <div class="container-fluid">
      <div class="navbar-wrapper">
        <div class="navbar-minimize d-inline"
             :class="{toggled: !$sidebar.showSidebar}">
          <button rel="tooltip"
                  @click="toggleSidebar"
                  data-original-title="Sidebar toggle"
                  data-placement="right"
                  class="minimize-sidebar btn btn-link btn-just-icon el-tooltip"
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
        <a href="/">
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
            <!-- <div class="search-bar input-group"
                 @click="searchModalVisible = true"> -->
            <!-- <input type="text" class="form-control" placeholder="Search...">
              <div class="input-group-addon"><i class="tim-icons icon-zoom-split"></i></div> -->
            <!-- <button class="btn btn-link"
                      id="search-button"
                      data-toggle="modal"
                      data-target="#searchModal">
                <i class="tim-icons icon-zoom-split"></i>
              </button> -->
            <!-- You can choose types of search input -->
            <!-- </div> -->
            <!-- <modal :show.sync="searchModalVisible"
                   class="modal-search"
                   id="searchModal"
                   :centered="false"
                   :show-close="true">
              <input slot="header"
                     v-model="searchQuery"
                     type="text"
                     class="form-control"
                     id="inlineFormInputGroup"
                     placeholder="SEARCH">
            </modal> -->
            <!-- <base-dropdown tag="li"
                           :menu-on-right="!$rtl.isRTL"
                           title-tag="a"
                           class="nav-item">
              <a slot="title"
                 href="#"
                 class="dropdown-toggle nav-link"
                 data-toggle="dropdown"
                 aria-expanded="true">
                <div class="notification d-none d-lg-block d-xl-block"></div>
                <i class="tim-icons icon-sound-wave"></i>
                <p class="d-lg-none">
                  New Notifications
                </p>
              </a>
              <li class="nav-link">
                <a href="#"
                   class="nav-item dropdown-item">Mike John responded to your email</a>
              </li>
              <li class="nav-link">
                <a href="#"
                   class="nav-item dropdown-item">You have 5 more tasks</a>
              </li>
              <li class="nav-link">
                <a href="#"
                   class="nav-item dropdown-item">Your friend Michael is in town</a>
              </li>
              <li class="nav-link">
                <a href="#"
                   class="nav-item dropdown-item">Another notification</a>
              </li>
              <li class="nav-link">
                <a href="#"
                   class="nav-item dropdown-item">Another one</a>
              </li>
            </base-dropdown> -->
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
                  <img src="img/anime3.png">
                </div>
                <b class="caret d-none d-lg-block d-xl-block"></b>
                <p class="d-lg-none">
                  Log out
                </p>
              </a>
              <li class="nav-link">
                <a href="/profile"
                   class="nav-item dropdown-item">Profile</a>
              </li>
              <li class="nav-link">
                <a href="#"
                   class="nav-item dropdown-item">Settings</a>
              </li>
              <li class="nav-link">
                <a @click="$theme.changeTheme()"
                   href="#"
                   class="nav-item dropdown-item">{{$theme.isDark ? '白色主题' : '黑色主题'}}</a>
              </li>

              <div class="dropdown-divider"></div>
              <li class="nav-link"
                  v-for="(color,key) in sidebarColors"
                  :key="key">
                <a href="#"
                   @click="$theme.changeSidebar(color.value)"
                   class="nav-item dropdown-item">{{color.name}}侧边栏</a>
              </li>

              <div class="dropdown-divider"></div>
              <li class="nav-link">
                <a href="#"
                   class="nav-item dropdown-item">Log out</a>
              </li>
            </base-dropdown>
          </ul>
        </div>
      </collapse-transition>
    </div>
  </nav>
</template>
<script>
import { CollapseTransition } from 'vue2-transitions';
import Modal from '@/components/Modal';

export default {
  components: {
    CollapseTransition,
    Modal
  },
  computed: {
    routeName () {
      const { name } = this.$route;
      return this.capitalizeFirstLetter(name);
    },
    isRTL () {
      return this.$rtl.isRTL;
    }
  },
  data () {
    return {
      activeNotifications: false,
      showMenu: false,
      searchModalVisible: false,
      searchQuery: '',
      sidebarColors: [
        { name: '蓝色', value: 'blue' },
        { name: '绿色', value: 'green' },
        { name: 'Vue', value: 'vue' },
        { name: '紫色', value: 'purple' },
      ]
    };
  },
  methods: {
    capitalizeFirstLetter (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    toggleNotificationDropDown () {
      this.activeNotifications = !this.activeNotifications;
    },
    closeDropDown () {
      this.activeNotifications = false;
    },
    toggleSidebar () {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    hideSidebar () {
      this.$sidebar.displaySidebar(false);
    },
    toggleMenu () {
      this.showMenu = !this.showMenu;
    }
  }
};
</script>
<style>
</style>
