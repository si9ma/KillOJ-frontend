<template>
  <card type="user">
    <h5 slot="header"
        v-if="title"
        class="title">{{title}}</h5>

    <p class="card-text">
    </p>
    <div class="author">
      <div class="block block-one"></div>
      <div class="block block-two"></div>
      <div class="block block-three"></div>
      <div class="block block-four"></div>
      <a href="#" @click="$router.push('/user/' + user.id)">
        <img class="avatar"
            :src="user.avatar ? user.avatar : '/img/anime3.png'"
            alt="...">
        <h5 class="title">{{user.name}}</h5>
      </a>
    </div>
    <p v-if="user.organization" class="card-description text-center">
      {{user.organization}}({{user.no_in_organization}})
    </p>
    <p class="card-description text-center">
      {{user.signature || '这个人有点懒，什么都没留下'}}
    </p>
    <div slot="footer"
        class="button-container">
      <a v-for="(social,key) in socials"
        :key="key"
        :href="social.link"
        target="_blank"
        v-if="social.show">
        <base-button icon
                    round>
          <font-awesome-icon :icon="social.icon"
                            size="lg" />
        </base-button>
      </a>
    </div>
  </card>
</template>
<script>
  import join from 'lodash/join'
export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {};
      }
    },
    title: {
      type: String,
      default: () => {
        return null;
      }
    }
  },
  computed: {
    socials () {
      return [
        { provider: 'github', icon: ['fab', 'github'], link: join(['https://github.com', this.user.github_name], '/'), show: this.user.github_name },
        { provider: 'zhihu', icon: ['fab', 'zhihu'], link: join(['https://www.zhihu.com/people', this.user.zhihu_name], '/'), show: this.user.zhihu_name },
        { provider: 'weibo', icon: ['fab', 'weibo'], link: join(['https://weibo.com', this.user.weibo_name], '/'), show: this.user.weibo_name },
        { provider: 'email', icon: ['fas', 'envelope'], link: "mailto:" + this.user.email,show: this.user.email },
        { provider: 'site', icon: ['fab', 'superpowers'], link: this.user.site,show: this.user.site },
      ]
    }
  }
}
</script>
<style>
</style>
