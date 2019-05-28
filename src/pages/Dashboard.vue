<template>
  <div>

    <div class="row">
      <div class="col-12">
        <card type="chart">
          <template slot="header">
            <div class="row">
              <div class="col-sm-6" :class="isRTL ? 'text-right' : 'text-left'">
                <h5 class="card-category">排行</h5>
                <h5 v-if="rankBy === 'all'" class="card-title">总排行</h5>
                <h5 v-else class="card-title">{{rankOption.label}}
                  <font-awesome-icon size="sm"
                                     :color="$theme.isDark ? 'white' : 'black'"
                                     :icon="rankBy === 'group' ? ['fas','users'] : ['fas','trophy']"/>
                </h5>
              </div>
              <div class="col-sm-6 text-right">
                <el-select @change="changeRankOption" size="mini" v-model="rankOption" placeholder="请选择排行维度">
                  <el-option-group
                    v-for="option in rankOptions"
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

          <div>
            <submit-rank style="max-height: 400px" :top="15" :submits="rankSubmits"/>
          </div>
        </card>
      </div>
    </div>
    <div class="row">
      <div class="col-12 ml-auto mr-auto mb-1 mt-1">
        <contribute-board :submits="contributeSubmits"/>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-6" :class="{'text-right': isRTL}">
        <card type="chart">
          <template slot="header">
            <div class="row">
              <div class="col-sm-6" :class="isRTL ? 'text-right' : 'text-left'">
                <h5 class="card-category">提交统计</h5>
                <h3 class="card-title"><i class="tim-icons icon-bell-55 text-primary "></i>{{statisticSubmits.length}}</h3>
              </div>
              <div class="col-sm-6">
                <div class="btn-group btn-group-toggle"
                     :class="isRTL ? 'float-left' : 'float-right'"
                     data-toggle="buttons">
                  <label v-for="option in ['Me','All']"
                         :key="option"
                         class="btn btn-sm btn-primary btn-simple"
                         :class="{active: currentSubmitStatistic === option}">
                    <input type="radio"
                           @click="changeSubmits(option)"
                           name="options" autocomplete="off"
                           :checked="currentSubmitStatistic === option">
                    {{option}}
                  </label>
                </div>
              </div>
            </div>
          </template>
          <submit-statistic :submits="statisticSubmits"/>
        </card>
      </div>
      <div class="col-lg-6" :class="{'text-right': isRTL}">
        <card type="chart">
          <template slot="header">
            <div class="row">
              <div class="col-sm-6" :class="isRTL ? 'text-right' : 'text-left'">
                <h5 class="card-category">语言统计</h5>
                <h3 class="card-title"><i class="tim-icons icon-bell-55 text-primary "></i>{{languageCnt}}</h3>
              </div>
              <div class="col-sm-6">
                <div class="btn-group btn-group-toggle"
                     :class="isRTL ? 'float-left' : 'float-right'"
                     data-toggle="buttons">
                  <label v-for="option in ['Me','All']"
                         :key="option"
                         class="btn btn-sm btn-primary btn-simple"
                         :class="{active: currentLanguageStatistic === option}">
                    <input type="radio"
                           @click="changeLanguageSubmits(option)"
                           name="options" autocomplete="off"
                           :checked="currentLanguageStatistic === option">
                    {{option}}
                  </label>
                </div>
              </div>
            </div>
          </template>
          <div>
            <language-statistic :submits="languageStatisticSubmits"/>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>
<script>
  import {GetAllContests, GetAllGroups, GetAllSubmit} from "../service";
  import SubmitStatistic from "../components/SubmitStatistic";
  import SubmitRank from "../components/SubmitRank";
  import LanguageStatistic from "../components/LanguageStatistic";
  import ContributeBoard from "../components/ContributeBoard";

  export default {
    components: {
      ContributeBoard,
      LanguageStatistic,
      SubmitRank,
      SubmitStatistic,
    },
    data() {
      return {
        statisticSubmits: [],
        contributeSubmits: [],
        languageStatisticSubmits: [],
        languageCnt: 0,
        rankSubmits: [],
        rankBy: 'all',
        currentSubmitStatistic: 'Me',
        currentLanguageStatistic: 'Me',
        rankOption: {label:'All',value:'0:0'},
        rankOptions: [
          {label: 'All',items: [{label:'All',value:'0:0'}]},
          {label: '分组',items: []},
          {label: '比赛',items: []},
        ]
      }
    },
    created() {
      GetAllGroups().then(groups => {
        this.rankOptions[1].items = groups.map(i => {
          return {label: i.name, value: '1:' + i.id}
        })
      })

      GetAllContests().then(contests => {
        this.rankOptions[2].items = contests.map(i => {
          return {label: i.name, value: '2:' + i.id}
        })
      })

      GetAllSubmit('',1,false).then(submits => {
        this.contributeSubmits = submits
      })

      this.changeRankOption()
      this.changeLanguageSubmits(this.currentLanguageStatistic)
      this.changeSubmits(this.currentSubmitStatistic)
    },
    computed: {
      enableRTL() {
        return this.$route.query.enableRTL;
      },
      isRTL() {
        return this.$rtl.isRTL;
      },
    },
    watch: {
      languageStatisticSubmits() {
        let resultMap = new Map()
        this.languageStatisticSubmits.forEach(el => {
          resultMap.set(el.language,1)
        })

        this.languageCnt = resultMap.size
      }
    },
    methods: {
      changeRankOption() {
        let option = this.rankOption.value.split(':')
        let of = ''
        let id = 1

        switch (option[0]) {
          case '0':
            this.rankBy = 'all'
            break
          case '1':
            this.rankBy = 'group'
            of = 'group'
            id = Number(option[1])
            break
          case '2':
            this.rankBy = 'contest'
            of = 'contest'
            id = Number(option[1])
        }

        GetAllSubmit(of,id,true).then(submits => {
          this.rankSubmits = submits
        })
      },
      changeSubmits(option) {
        switch (option) {
          case 'Me':
            this.currentSubmitStatistic = 'Me'
            GetAllSubmit('me',1,false).then(submits => {
              this.statisticSubmits = submits
            })
            break
          case 'All':
            this.currentSubmitStatistic = 'All'
            GetAllSubmit('',0,false).then(submits => {
              this.statisticSubmits = submits
            })
        }
      },
      changeLanguageSubmits(option) {
        switch (option) {
          case 'Me':
            this.currentLanguageStatistic = 'Me'
            GetAllSubmit('me',1,false).then(submits => {
              this.languageStatisticSubmits = submits
            })
            break
          case 'All':
            this.currentLanguageStatistic = 'All'
            GetAllSubmit('',0,false).then(submits => {
              this.languageStatisticSubmits = submits
            })
        }
      },
    },
  };
</script>
<style>
</style>
