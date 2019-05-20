<template>
  <card>
    <h5 slot="header"
        class="title">编辑信息</h5>

    <el-form :model="user"
            :rules="profileRules"
            ref="profileForm">
      <div class="row">
        <div class="col-md-6">
          <el-form-item label="用户名"
                        prop="name">
            <el-input v-model="user.name"
                      @focus="alreadyExistField.name=false"
                      placeholder="用户名"></el-input>
          </el-form-item>
        </div>
        <div class="col-md-6">
          <el-form-item label="邮箱"
                        @focus="alreadyExistField.email=false"
                        prop="email">
            <el-input v-model="user.email"
                      placeholder="邮箱"></el-input>
          </el-form-item>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <el-form-item label="密码"
                        prop="password">
            <el-input v-model="user.password"
                      placeholder="密码"
                      show-password></el-input>
          </el-form-item>
        </div>
        <div class="col-md-6">
          <el-form-item label="密码确认"
                        prop="confirmPassword">
            <el-input v-model="user.confirmPassword"
                      placeholder="密码确认"
                      show-password></el-input>
          </el-form-item>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <el-form-item label="组织"
                        prop="organization">
            <el-input v-model="user.organization"
                      placeholder="组织"></el-input>
          </el-form-item>
        </div>
        <div class="col-md-6">
          <el-form-item label="组织内ID"
                        @focus="alreadyExistField.no_in_organization=false"
                        prop="no_in_organization">
            <el-input v-model="user.no_in_organization"
                      placeholder="组织内ID"></el-input>
          </el-form-item>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <el-form-item label="网站"
                        prop="site">
            <el-input v-model="user.site"
                      placeholder="网站"></el-input>
          </el-form-item>
        </div>
        <div class="col-md-6">
          <el-form-item label="头像地址"
                        prop="site">
            <el-input v-model="user.avatar"
                      placeholder="头像地址"></el-input>
          </el-form-item>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <el-form-item label="知乎用户名"
                        prop="zhihu_name">
            <el-input v-model="user.zhihu_name"
                      placeholder="知乎用户名"></el-input>
          </el-form-item>
        </div>
        <div class="col-md-6">
          <el-form-item label="微博用户名"
                        prop="weibo_name">
            <el-input v-model="user.weibo_name"
                      placeholder="微博用户名"></el-input>
          </el-form-item>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <el-form-item label="关于我"
                        prop="signature">
            <el-input type="textarea"
                      rows="4"
                      v-model="user.signature"
                      placeholder="关于我"></el-input>
          </el-form-item>
        </div>
      </div>
    </el-form>
    <div class="row col-md-12 ml-auto mr-auto">
      <el-button slot="footer"
                type="primary"
                size="small"
                @click="submitForm('profileForm')"
                fill>保存</el-button>
    </div>
  </card>
</template>
<script>
import { Contains } from '@/service/util'
import { AuthHeader } from '@/service/auth'
import { ExtractJson } from '@/service/util'

export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data () {
    var validatePass = (rule, value, callback) => {
      if (value !== this.user.password) {
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

    var validateNoInOrganization = (rule, value, callback) => {
      // name shouldn't contains special character
      if (this.alreadyExistField.no_in_organization) {
        callback(new Error(value + ' 已经在 ' + this.user.organization + ' 中'))
      } else {
        callback()
      }
    }

    return {
      profileRules: {
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
          { min: 6, max: 30, message: '密码长度在 6 到 30 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { min: 6, max: 30, message: '密码长度在 6 到 30 个字符', trigger: 'blur' },
          { validator: validatePass, trigger: 'blur' }
        ],
        zhihu_name: [
          { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
        ],
        avatar: [
          { max: 600, message: '长度不能超过600个字符', trigger: 'blur' }
        ],
        weibo_name: [
          { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
        ],
        site: [
          { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
        ],
        signature: [
          { max: 800, message: '长度不能超过800个字符', trigger: 'blur' }
        ],
        organization: [
          { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
        ],
        no_in_organization: [
          { max: 30, message: '长度不能超过30个字符', trigger: 'blur' },
          { validator: validateNoInOrganization, trigger: 'blur' }
        ]
      },
      alreadyExistField: {
        email: false,
        name: false
      },
    };
  },
  methods: {
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        this.doing = true // loading
        if (valid) {
          this.updateInfo()
        } else {
          console.log('error submit!!')
        }
        this.doing = false
      })
    },
    updateInfo () {
      this.$axios({
        url: this.$gbl.apiURL + '/profile',
        method: 'put',
        headers: AuthHeader(),
        data: {
          ...this.user
        }
      })
        .then((response) => {
          console.log('update successful!')
          this.$gbl.alert('success', '更新信息成功')
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
                this.$refs['profileForm'].validate() // trigger validate
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
          this.$gbl.alert('danger', '更新出现错误')
        })
    },

  }
}
</script>
<style>
</style>
