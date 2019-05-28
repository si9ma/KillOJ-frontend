<template>
  <submit-list :submits="submits">
    <template slot="option">
      <div class="row">
        <div class="col-12 text-right">
          <el-select @change="changeSubmitOption" size="mini" v-model="submitOption" placeholder="请选择排行维度">
            <el-option-group
              v-for="option in submitOptions"
              v-if="option.items.length !== 0"
              :key="option.label"
              :label="option.label">
              <el-option
                v-for="item in option.items"
                :key="item.value"
                :label="item.label"
                :value="item">
              </el-option>
            </el-option-group>
          </el-select>
        </div>
      </div>
    </template>
  </submit-list>
</template>

<script>
  import SubmitList from "../components/SubmitList";
  import {GetAllContests, GetAllGroups, GetAllSubmit} from "../service";
  export default {
    name: "submits",
    components: {SubmitList},
    data() {
      return {
        submits: [],
        submitOption: {label:'Me',value:'0:0'},
        submitOptions: [
          {label: 'Me',items: [{label:'Me',value:'0:0'}]},
          {label: '分组',items: []},
          {label: '比赛',items: []},
        ],
        by:'me'
      }
    },
    computed: {
      mySelf () {
        return this.$store.state.userInfo
      }
    },
    created() {
      GetAllGroups().then(groups => {
        groups.forEach(el => {
          // must be owner
          if (el.owner_id === this.mySelf.id) {
            this.submitOptions[1].items.push({label: el.name,value: '1:' + el.id})
          }
        })
      })

      GetAllContests().then(contests => {
        contests.forEach(el => {
          // must be owner
          if (el.owner_id === this.mySelf.id) {
            this.submitOptions[2].items.push({label: el.name,value: '2:' + el.id})
          }
        })
      })

      this.changeSubmitOption()
    },
    methods: {
      changeSubmitOption() {
        let option = this.submitOption.value.split(':')
        let of = ''
        let id = 1

        switch (option[0]) {
          case '0':
            this.by = 'me'
            of = 'me'
            break
          case '1':
            this.by = 'group'
            of = 'group'
            id = Number(option[1])
            break
          case '2':
            this.by = 'contest'
            of = 'contest'
            id = Number(option[1])
        }

        GetAllSubmit(of,id,true).then(submits => {
          this.submits = submits
        })
      },
    }
  }
</script>

<style scoped>

</style>
