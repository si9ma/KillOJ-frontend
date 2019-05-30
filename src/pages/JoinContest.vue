<template>
  <div>
    <!--for fullscreen loading-->
    <a v-loading.fullscreen.lock="doing"></a>

    <div class="row col-md-11 ml-auto mr-auto">
      <div class="col-md-4">
        <card>
          <h5 slot="header"
              class="title">比赛信息</h5>

          <div class="row">
            <div class="col-md-10 ml-auto mr-auto">
              <el-form :model="joinData"
                       ref="joinForm"
                       :rules="joinRules">
                <el-form-item label="比赛ID">
                  <el-input v-model="contest.id"
                            placeholder="比赛ID" disabled></el-input>
                </el-form-item>
                <el-form-item label="比赛名">
                  <el-input v-model="contest.name"
                            placeholder="比赛名" disabled></el-input>
                </el-form-item>
                <el-form-item v-if="contest.need_password" prop="password"
                              label="密码">
                  <el-input v-model="joinData.password"
                            placeholder="加入需填写密码"></el-input>
                </el-form-item>
                <el-button size="small"
                           class="mt-1"
                           @click="submitForm('joinForm')"
                           type="primary">加入
                </el-button>
              </el-form>
            </div>
          </div>
        </card>
      </div>

      <!-- user info -->
      <div class="col-md-6">
        <user-card :user="contest.owner"
                   title="Owner信息"></user-card>
      </div>
    </div>
  </div>
</template>

<script>
  import {AuthHeader, ExtractJson} from "../service";
  import UserCard from './Profile/UserCard'
  import join from "lodash/join";

  export default {
    name: "JoinContest",
    components: {
      UserCard
    },
    data() {
      return {
        contest: {},
        joinData: {
          password: '',
        },
        joinRules: {
          password: [
            {required: true, message: '输入密码', trigger: 'blur'},
            {max: 30, message: '长度在不能超过30个字符', trigger: 'blur'},
          ]
        },
        doing: false,
      }
    },
    computed: {
      mySelf() {
        return this.$store.state.userInfo
      }
    },
    created() {
      this.doing = true
      this.$axios({
        url: join([this.$gbl.apiURL, 'contests/join', this.$router.currentRoute.params.uuid], '/'),
        method: 'get',
        headers: AuthHeader()
      }).then(response => {
        this.contest = response.data
        if (this.contest.owner.id === this.mySelf.id) {
          this.$gbl.alert('warning', '你是该比赛的Owner，不允许进行加入比赛操作')
          this.doing = false
          this.$router.push('/contests')
        }

        this.doing = false
      }).catch(error => {
        this.doing = false

        // handle json response
        let json = ExtractJson(error.response)
        if (json) {
          console.log(json)
          this.$gbl.alert('danger', json.error.message)
        } else {
          console.log(error.response)
          this.$gbl.alert('danger', '获取比赛信息出错')
        }

        this.$router.push('/contests')
      })
    },
    methods: {
      join2Contest() {
        this.doing = true
        this.$axios({
          url: join([this.$gbl.apiURL, 'contests/join', this.$router.currentRoute.params.uuid], '/'),
          method: 'post',
          headers: AuthHeader(),
          data: {
            password: this.joinData.password
          }
        }).then(response => {
          this.doing = false
          this.$gbl.alert('success', '加入比赛成功')
          this.$router.push('/contests')
        }).catch(error => {
          this.doing = false

          // handle json response
          let json = ExtractJson(error.response)
          if (json) {
            // password wrong
            if (json.error.code === 40102){
              this.$gbl.alert('danger', '密码错误')
              return
            }
            console.log(json)
            this.$gbl.alert('danger', json.error.message)
          } else {
            console.log(error.response)
            this.$gbl.alert('danger', '加入比赛出错')
          }

          this.$router.push('/contests')
        })
      },
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.join2Contest()
          } else {
            console.log('error submit!!')
          }
        })
      },
    }
  }
</script>

<style scoped>

</style>
