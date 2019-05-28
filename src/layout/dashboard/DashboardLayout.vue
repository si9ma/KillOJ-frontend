<template>
  <div class="wrapper">
    <side-bar title="KillOJ" :backgroundColor="$theme.sidebarBG">
      <template slot="links">
        <sidebar-link to="/dashboard" name="Dashboard" :fwicon="['fas','chart-pie']"/>
        <sidebar-link to="/problems" name="题目" :fwicon="['fas','list']"/>
        <sidebar-link to="/groups" name="分组" :fwicon="['fas','users']"/>
        <sidebar-link to="/contests" name="比赛" :fwicon="['fas','trophy']"/>
        <sidebar-link to="/submits" name="提交" :fwicon="['fab','lastfm']"/>
        <sidebar-link v-if="mySelf && mySelf.role === 0" to="/catalogs" name="分类" :fwicon="['fas','paw']"/>
        <sidebar-link v-if="mySelf && mySelf.role === 0 || mySelf.role === 1" to="/users" name="用户" :fwicon="['fas','user']"/>
      </template>
    </side-bar>
    <div class="main-panel">
      <top-navbar></top-navbar>

      <dashboard-content @click.native="toggleSidebar">

      </dashboard-content>

      <content-footer></content-footer>
    </div>
  </div>
</template>
<style lang="scss">
</style>
<script>
  import TopNavbar from "./TopNavbar.vue";
  import ContentFooter from "./ContentFooter.vue";
  import DashboardContent from "./Content.vue";
  import MobileMenu from "./MobileMenu";

  export default {
    components: {
      TopNavbar,
      ContentFooter,
      DashboardContent,
      MobileMenu
    },
    computed: {
      mySelf() {
        return this.$store.state.userInfo
      }
    },
    methods: {
      toggleSidebar() {
        if (this.$sidebar.showSidebar) {
          this.$sidebar.displaySidebar(false);
        }
      },
    }
  };
</script>
