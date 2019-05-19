<template>
  <v-container fill-height>
    <v-layout row
              wrap
              justify-center>
      <v-flex xs11
              sm8
              md5
              lg3
              ex3>
        <v-card :style="{'margin-top':'30%'}">

          <v-card-title class="justify-center">
            <img :src="require('@/assets/logo.png')"
                 class="logo-sm" />
          </v-card-title>

          <v-card-text>
            <!-- signupAndLogin -->
            <el-form :model="signupAndLoginForm"
                     v-loading.fullscreen.lock="authing"
                     ref="signupAndLoginForm"
                     :rules="signupAndLoginRules">

              <!-- login -->
              <div v-if="isLogin">
                <el-form-item prop="nameOrEmail">
                  <el-input v-model="signupAndLoginForm.nameOrEmail"
                            placeholder="用户名或邮箱"></el-input>
                </el-form-item>
              </div>

              <!-- signup -->
              <div v-else>
                <el-form-item prop="name">
                  <el-input v-model="signupAndLoginForm.name"
                            @focus="alreadyExistField.name=false"
                            placeholder="用户名"></el-input>
                </el-form-item>
                <el-form-item prop="email">
                  <el-input v-model="signupAndLoginForm.email"
                            @focus="alreadyExistField.email=false"
                            placeholder="邮箱"></el-input>
                </el-form-item>
              </div>

              <el-form-item prop="password">
                <el-input v-model="signupAndLoginForm.password"
                          placeholder="密码"
                          show-password></el-input>
              </el-form-item>
              <el-form-item prop="confirmPassword">
                <el-input v-model="signupAndLoginForm.confirmPassword"
                          placeholder="再次输入密码"
                          show-password></el-input>
              </el-form-item>

              <!-- alert -->
              <v-alert :value="showAlert"
                       :color="alertType"
                       :icon="alertIcons[alertType]"
                       transition="scale-transition"
                       dismissible>
                {{alertMessage}}
              </v-alert>
              <el-form-item size="large">
                <el-button type="primary"
                           :loading="doing"
                           @click="submitForm('signupAndLoginForm')">{{operation()[0]}}</el-button>
              </el-form-item>
            </el-form>

            <v-layout justify-center>
              <p>{{isLogin ? '还没有账号?' : '已有账号?'}}
                <el-link type="primary"
                         @click="isLogin= !isLogin"
                         :underline="false"> {{ operation()[1] }}</el-link>
              </p>
            </v-layout>

            <v-layout justify-center>
              <p>或 通过第三方认证登录</p>
            </v-layout>

            <v-layout justify-center>
              <v-btn v-for="(icon,key) in thirdParts"
                     :key="key"
                     class="mx-3"
                     dark
                     :href="icon.link"
                     icon>
                <v-icon color="black"
                        size="20px">{{ icon.icon }}</v-icon>
              </v-btn>
            </v-layout>
          </v-card-text>

        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from 'axios'
import _ from 'lodash'
import { GetUserInfo } from '../../service'
import { Contains, ExtractJson } from '../../service/util'

export default {
  props: ['HandleType'],
  data () {
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('再次输入密码'))
      } else if (value !== this.signupAndLoginForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }

    var validateName = (rule, value, callback) => {
      // name shouldn't contains special character
      if (Contains(value, '!@#?')) {
        callback(new Error('用户名不能包含!@#?字符'))
      } else if (this.alreadyExistField.name) {
        callback(new Error('用户名已被占用'))
      } else {
        callback()
      }
    }

    var validateEmail = (rule, value, callback) => {
      // name shouldn't contains special character
      if (this.alreadyExistField.email) {
        callback(new Error('邮箱已经被注册'))
      } else {
        callback()
      }
    }

    return {
      signupAndLoginForm: {
        name: '',
        password: '',
        confirmPassword: '',
        github_id: '',
        github_name: ''
      },
      signupAndLoginRules: {
        nameOrEmail: [
          { required: true, message: '输入用户名或邮箱', trigger: 'blur' },
          { max: 100, message: '长度在不能超过100个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '输入用户名', trigger: 'blur' },
          { max: 100, message: '长度在不能超过100个字符', trigger: 'blur' },
          { validator: validateName, trigger: ['blur', 'change'] }
        ],
        email: [
          { required: true, message: '输入邮箱', trigger: 'blur' },
          { max: 100, message: '长度在不能超过100个字符', trigger: 'blur' },
          { type: 'email', message: '输入正确的邮箱地址', trigger: ['blur', 'change'] },
          { validator: validateEmail, trigger: ['blur', 'change'] }
        ],
        password: [
          { required: true, message: '输入密码', trigger: 'blur' },
          { min: 6, max: 30, message: '密码长度在 6 到 30 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '再次输入密码', trigger: 'blur' },
          { min: 6, max: 30, message: '密码长度在 6 到 30 个字符', trigger: 'blur' },
          { validator: validatePass, trigger: 'blur' }
        ]
      },
      isLogin: true,
      doing: false,
      alreadyExistField: {
        email: false,
        name: false
      },
      alertMessage: '',
      showAlert: false,
      alertType: 'success',
      alertIcons: {
        success: 'check_circle',
        info: 'info',
        warning: 'priority_high',
        error: 'warning'
      },
      thirdParts: [
        { icon: 'fab fa-github', link: this.getAuthLink('github') }
      ],
      authing: false,
      binding: false
    }
  },
  created () {
    switch (this.HandleType) {
      case 'signup':
        this.isLogin = false
        break
      case 'auth':
        this.authing = true
        this.authCallback()
        return
    }

    // chek if user already login
    var user = GetUserInfo(this)
    if (user) {
      this.$router.push('/') // go home
    }
  },
  methods: {
    operation () {
      if (this.binding && this.isLogin) {
        return ['登录并绑定', '注册并绑定']
      } else if (this.binding && !this.isLogin) {
        return ['注册并绑定', '登录并绑定']
      } else if (!this.binding && this.isLogin) {
        return ['登录', '注册']
      } else {
        return ['注册', '登录']
      }
    },
    getAuthLink (provider) {
      return _.join([process.env.API_URL, 'auth3rd', provider], '/')
    },
    login () {
      axios({
        url: process.env.API_URL + '/login',
        method: 'post',
        data: {
          name: this.signupAndLoginForm.nameOrEmail,
          password: this.signupAndLoginForm.password,
          github_name: this.signupAndLoginForm.github_name,
          github_id: this.signupAndLoginForm.github_id
        }
      })
        .then((response) => {
          // save token
          console.log('login successful!')
          localStorage.setItem('jwt', JSON.stringify(response.data))
          GetUserInfo(this)
          this.$router.push('/')
        })
        .catch((error) => {
          // handle json response
          var json = ExtractJson(error.response)
          if (json) {
            console.log(json)
            this.toggleAlert('error', json.error.message)
            return
          } else {
            console.log(error.response)
          }
          this.toggleAlert('error', '出现错误')
        })
    },
    async authCallback () {
      // proxy to backend
      var baseURL = window.location.origin
      var fullURL = window.location.href
      axios({
        url: _.replace(fullURL, baseURL, process.env.API_URL),
        method: 'get'
      })
        .then((response) => {
          // save token
          console.log('login successful!')
          localStorage.setItem('jwt', JSON.stringify(response.data))
          GetUserInfo(this)
          this.$router.push('/')
          this.authing = false
        })
        .catch((error) => {
          // handle json response
          var json = ExtractJson(error.response)
          this.authing = false
          if (json) {
            switch (json.error.code) {
              case 40104:
                this.signupAndLoginForm.github_id = json.error.extra.userID
                this.signupAndLoginForm.github_name = json.error.extra.name
                this.binding = true
                this.toggleAlert('warning', '你还未注册，请注册一个用户并绑定到该github账号')
                return
              default:
                console.log(json)
                this.toggleAlert('error', json.error.message)
                return
            }
          } else {
            console.log(error.response)
          }
          this.toggleAlert('error', '认证出现错误')
        })
    },
    signup () {
      axios({
        url: process.env.API_URL + '/signup',
        method: 'post',
        data: {
          name: this.signupAndLoginForm.name,
          password: this.signupAndLoginForm.password,
          email: this.signupAndLoginForm.email,
          github_name: this.signupAndLoginForm.github_name,
          github_user_id: this.signupAndLoginForm.github_id
        }
      })
        .then((response) => {
          console.log('signup successful!')
          this.isLogin = true // to login page
          this.signupAndLoginForm.nameOrEmail = this.signupAndLoginForm.email // use email to login
          this.toggleAlert('success', '注册成功，请登录')
        })
        .catch((error) => {
          // handle json response
          var json = ExtractJson(error.response)
          if (json) {
            switch (json.error.code) {
              case 40003: // something already exist
                for (var field in json.error.extra) {
                  this.alreadyExistField[field] = true
                }
                this.$refs['signupAndLoginForm'].validate() // trigger validate
                this.toggleAlert('warning', 'something wrong')
                return
              default:
                console.log(json)
            }
          } else {
            console.log(error.response)
          }
          this.toggleAlert('error', '出现错误')
        })
    },
    toggleAlert (type, msg) {
      this.showAlert = true
      this.alertType = type
      this.alertMessage = msg
    },
    submitForm (formName) {
      this.showAlert = false // clear alert
      this.$refs[formName].validate((valid) => {
        this.doing = true // loading
        if (valid) {
          if (this.isLogin) {
            this.login()
          } else {
            this.signup()
          }
        } else {
          console.log('error submit!!')
        }
        this.doing = false
      })
    }
  }
}
</script>

<style>
.el-form-item__content .el-button--primary {
  background-color: #3e5159;
  border-color: #3e5159;
  width: 100%;
}

/* override alert */
.v-alert {
  padding: 10px;
  border: none;
}
</style>
