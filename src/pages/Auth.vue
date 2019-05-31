<template>
  <div class="row">
    <div class="col-xs-11 col-sm-8 col-md-5 col-lg-3 col-ex-3 ml-auto mr-auto mt-5">

      <!-- login card -->
      <card>
        <div class="row">
          <div class="col-md-3 ml-auto mr-auto mt-2 mb-4">
            <img :src="$theme.isDark ? require('@/assets/image/logo-dark.png') :
            require('@/assets/image/logo-light.png')"/>
          </div>
        </div>

        <el-form :model="authForm"
                 v-loading.fullscreen.lock="authing"
                 ref="authForm"
                 :rules="authRules">

          <!-- login -->
          <div class="row"
               v-if="isLogin">
            <div class="col-md-11 ml-auto mr-auto">
              <el-form-item prop="nameOrEmail">
                <el-input v-model="authForm.nameOrEmail"
                          placeholder="用户名或邮箱"></el-input>
              </el-form-item>
            </div>
          </div>

          <!-- signup -->
          <div v-else>
            <div class="row">
              <div class="col-md-11 ml-auto mr-auto">
                <el-form-item prop="name">
                  <el-input v-model="authForm.name"
                            @focus="alreadyExistField.name=false"
                            placeholder="用户名"></el-input>
                </el-form-item>
              </div>
            </div>

            <div class="row">
              <div class="col-md-11 ml-auto mr-auto">
                <el-form-item prop="email">
                  <el-input v-model="authForm.email"
                            @focus="alreadyExistField.email=false"
                            placeholder="邮箱"></el-input>
                </el-form-item>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-11 ml-auto mr-auto">
              <el-form-item prop="password">
                <el-input v-model="authForm.password"
                          placeholder="密码"
                          show-password></el-input>
              </el-form-item>
            </div>
          </div>
          <div v-if="!isLogin" class="row">
            <div class="col-md-11 ml-auto mr-auto">
              <el-form-item prop="confirmPassword">
                <el-input v-model="authForm.confirmPassword"
                          placeholder="再次输入密码"
                          show-password></el-input>
              </el-form-item>
            </div>
          </div>

          <el-form-item size="large">
            <div class="col-md-11 pl-0 pr-0 ml-auto mr-auto">
              <el-button type="primary"
                         :loading="doing"
                         @click="submitForm('authForm')">{{operation()[0]}}
              </el-button>
            </div>
          </el-form-item>
        </el-form>

        <div class="row">
          <div class="col-md-11 ml-auto mr-auto">
            <p class="text-center">{{isLogin ? '还没有账号?' : '已有账号?'}}
              <el-link type="primary"
                       @click="isLogin= !isLogin"
                       :underline="false"> {{ operation()[1] }}
              </el-link>
            </p>
          </div>
        </div>

        <div class="row">
          <div class="col-md-11 ml-auto mr-auto">
            <p class="text-center">或 通过第三方认证登录</p>
          </div>
        </div>

        <div class="row">
          <div class="col-md-11 ml-auto mr-auto text-center mt-2">
            <a v-for="(icon,key) in thirdParts"
               :key="key"
               :href="icon.link">
              <font-awesome-icon :color="$theme.isDark ? 'white' : 'black'"
                                 :icon="icon.icon"
                                 size="lg"/>
            </a>
          </div>
        </div>
      </card>
    </div>
  </div>
</template>

<script>
  import join from 'lodash/join'
  import replace from 'lodash/replace'
  import {GetUserInfo} from '../service/user'
  import {Contains, ExtractJson} from '../service/util'

  export default {
    props: {
      HandleType: {
        type: String,
        default: "login",
        description: "handle type (signup or login or auth)"
      }
    },
    data() {
      let validatePass = (rule, value, callback) => {
        if (this.isLogin) {
          callback() // skip when login
        }

        if (value === '') {
          callback(new Error('再次输入密码'))
        } else if (value !== this.authForm.password) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      }

      let validateName = (rule, value, callback) => {
        // name shouldn't contains special character
        if (Contains(value, '!@#?')) {
          callback(new Error('用户名不能包含!@#?字符'))
        } else if (this.alreadyExistField.name) {
          callback(new Error('用户名已被占用'))
        } else {
          callback()
        }
      }

      let validateEmail = (rule, value, callback) => {
        // name shouldn't contains special character
        if (this.alreadyExistField.email) {
          callback(new Error('邮箱已经被注册'))
        } else {
          callback()
        }
      }

      return {
        authForm: {
          name: '',
          password: '',
          confirmPassword: '',
          github_id: '',
          github_name: ''
        },
        authRules: {
          nameOrEmail: [
            {required: true, message: '输入用户名或邮箱', trigger: 'blur'},
            {max: 100, message: '长度在不能超过100个字符', trigger: 'blur'}
          ],
          name: [
            {required: true, message: '输入用户名', trigger: 'blur'},
            {max: 100, message: '长度在不能超过100个字符', trigger: 'blur'},
            {validator: validateName, trigger: ['blur', 'change']}
          ],
          email: [
            {required: true, message: '输入邮箱', trigger: 'blur'},
            {max: 100, message: '长度在不能超过100个字符', trigger: 'blur'},
            {type: 'email', message: '输入正确的邮箱地址', trigger: ['blur', 'change']},
            {validator: validateEmail, trigger: ['blur', 'change']}
          ],
          password: [
            {required: true, message: '输入密码', trigger: 'blur'},
            {min: 6, max: 30, message: '密码长度在 6 到 30 个字符', trigger: 'blur'}
          ],
          confirmPassword: [
            {required: true, message: '再次输入密码', trigger: 'blur'},
            {min: 6, max: 30, message: '密码长度在 6 到 30 个字符', trigger: 'blur'},
            {validator: validatePass, trigger: 'blur'}
          ]
        },
        isLogin: true,
        doing: false,
        alreadyExistField: {
          email: false,
          name: false
        },
        thirdParts: [
          {icon: ['fab', 'github'], link: this.getAuthLink('github')}
        ],
        authing: false,
        binding: false
      }
    },
    created() {
      switch (this.HandleType) {
        case 'signup':
          this.isLogin = false
          break
        case 'auth':
          this.authing = true
          this.authCallback()
          return
      }

      if (this.$router.currentRoute.query.nocheck === undefined) {
        // check if user already login, only when user type url in address bar
        GetUserInfo().then(() => {
          this.$gbl.alert('success', '自动登录成功')
          this.$router.push(this.$router.currentRoute.query.redirect || '/')
        })
      }
    },
    methods: {
      operation() {
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
      getAuthLink(provider) {
        return join([this.$gbl.apiURL, 'auth3rd', provider], '/')
      },
      login() {
        this.$axios({
          url: this.$gbl.apiURL + '/login',
          method: 'post',
          data: {
            name: this.authForm.nameOrEmail,
            password: this.authForm.password,
            github_name: this.authForm.github_name,
            github_id: this.authForm.github_id
          }
        })
          .then((response) => {
            // save token
            console.log('login successful!')
            localStorage.setItem('jwt', JSON.stringify(response.data))
            GetUserInfo().then(() => {
              this.$gbl.alert('success', '登录成功')
              this.$router.push(this.$router.currentRoute.query.redirect || '/')
            })
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
            this.$gbl.alert('danger', '登录出现错误')
          })
      },
      authCallback() {
        // proxy to backend
        let baseURL = window.location.origin
        let fullURL = window.location.href
        this.$axios({
          url: replace(fullURL, baseURL, this.$gbl.apiURL),
          method: 'get'
        })
          .then((response) => {
            // save token
            console.log('login successful!')
            localStorage.setItem('jwt', JSON.stringify(response.data))
            GetUserInfo().then(() => {
              this.authing = false
              this.$gbl.alert('success', '认证成功')
              this.$router.push(this.$router.currentRoute.query.redirect || '/')
            })
          })
          .catch((error) => {
            // handle json response
            let json = ExtractJson(error.response)
            this.authing = false
            if (json) {
              switch (json.error.code) {
                case 40104:
                  this.authForm.github_id = json.error.extra.userID
                  this.authForm.github_name = json.error.extra.name
                  this.binding = true
                  this.$gbl.alert('warning', '你还未注册，请注册一个用户并绑定到该github账号')
                  return
                default:
                  console.log(json)
                  this.$gbl.alert('danger', json.error.message)
                  return
              }
            } else {
              console.log(error.response)
            }
            this.$gbl.alert('danger', '认证出现错误')
          })
      },
      signup() {
        this.$axios({
          url: this.$gbl.apiURL + '/signup',
          method: 'post',
          data: {
            name: this.authForm.name,
            password: this.authForm.password,
            email: this.authForm.email,
            github_name: this.authForm.github_name,
            github_user_id: this.authForm.github_id
          }
        })
          .then((response) => {
            console.log('signup successful!')
            this.isLogin = true // to login page
            this.authForm.nameOrEmail = this.authForm.email // use email to login
            this.$gbl.alert('success', '注册成功，请登录')
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
                  this.$refs['authForm'].validate() // trigger validate
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
            this.$gbl.alert('danger', '注册出现错误')
          })
      },
      submitForm(formName) {
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
