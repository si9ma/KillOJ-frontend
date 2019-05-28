<template>
  <card>
    <div slot="header">
      <font-awesome-icon :icon="['fas','calendar-day']"
                         size="sm"/>
      <span class="ml-2">提交日历</span>
    </div>
    <div class="row">
      <div class="col-8">
        <calendar-heatmap :range-color="['#ebedf0', '#c6e48b', '#7bc96e', '#449a3b', '#296027']" :values="contributes" :end-date="new Date().toJSON().slice(0,10)"/>
      </div>
      <div class="col-4">
        <div class="cb-stats-block">
            <span class="cb-stats-table">
                <span class="cb-stats-row">
                    <span class="cb-stats-label">一年提交数
                        <span class="cb-stats-count">{{oneYearTotal}}</span>
                        <span class="cb-stats-average">{{perDayOfYear}}</span> 每天
                    </span>
                    <span class="cb-stats-meta cb-stats-total-meta">
                        <span class="cb-stats-unit">提交</span>
                        <span class="cb-stats-date">{{oneYearDate}}</span>
                    </span>
                </span>
                <span class="cb-stats-row">
                    <span class="cb-stats-label">最忙的一天
                        <span class="cb-stats-count">{{busiestDayCnt}}</span>
                    </span>
                    <span class="cb-stats-meta">
                        <span class="cb-stats-unit">提交</span>
                        <span class="cb-stats-date">{{busiestDayDate}}</span>
                    </span>
                </span>
            </span>
        </div>
        <div class="cb-stats-block cb-stats-top">
            <span class="cb-stats-table">
                <span class="cb-stats-row">
                    <span class="cb-stats-label">最长连续提交
                        <span class="cb-stats-count">{{longestStreak}}</span>
                        <span class="cb-stats-average">&nbsp;</span>
                    </span>
                    <span class="cb-stats-meta cb-stats-total-meta">
                        <span class="cb-stats-unit">天</span>
                        <span class="cb-stats-date">{{longestStreakDate}}</span>
                    </span>
                </span>
                <span class="cb-stats-row">
                    <span class="cb-stats-label">当前连续提交
                        <span class="cb-stats-count">{{currentStreak}}</span>
                    </span>
                    <span class="cb-stats-meta">
                        <span class="cb-stats-unit">天</span>
                        <span class="cb-stats-date">{{currentStreakDate}}</span>
                    </span>
                </span>
            </span>
        </div>
      </div>
    </div>
  </card>
</template>

<script>
  import _ from 'lodash'

  export default {
    name: "ContributeBoard",
    props: {
      submits: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        contributes: [],
        busiestDayCnt: 0,
        oneYearTotal: 0,
        perDayOfYear: 0,
        oneYearDate: '',
        busiestDayDate: '',
        longestStreakDate: '',
        longestStreak: 0,
        currentStreak: 0,
        currentStreakDate: '',
      }
    },
    watch: {
      submits() {
        this.calculateContribute()
      }
    },
    created() {
      this.calculateContribute()
    },
    methods: {
      calculateContribute() {
        if (!this.submits || this.submits.length === 0) return

        let resultMap = new Map()
        this.submits.forEach(el => {
          let date = el.created_at.split('T')[0]
          if (resultMap.get(date)) {
            resultMap.set(date, resultMap.get(date) + 1)
          } else {
            resultMap.set(date, 1)
          }
        })

        let contributes = []
        resultMap.forEach((value, key) => {
          contributes.push({date: new Date(key),count: value})
          this.contributes.push({date: key, count: value})
        })

        contributes.sort((a,b) => {
          return a.date - b.date
        })

        let today = new Date()
        let oneYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1))

        let previousDay = new Date()
        let streakStartDay = oneYearAgo

        for(const day of contributes) {
          if (day.date < oneYearAgo) continue

          this.oneYearTotal += day.count

          if (day.count >= this.busiestDayCnt) {
            this.busiestDayCnt = day.count
            this.busiestDayDate = this.formatDate(true,day.date)
          }

          // calculate streak
          if (this.isPreviousDay(previousDay,day.date)) {
            this.currentStreak += 1
          }else {
            this.currentStreak = 1
            streakStartDay = day.date
          }

          if (this.currentStreak >= this.longestStreak) {
            this.longestStreak = this.currentStreak
            this.longestStreakDate = this.formatDate(true,streakStartDay,day.date)
          }

          this.currentStreakDate = this.formatDate(true,streakStartDay,day.date)
          previousDay = day.date
        }

        if (!this.isSameDay(contributes.slice(-1)[0].date,today)) {
          this.currentStreak = 0
          this.currentStreakDate = '当前没有连续提交'
        }

        let oneDay = 24*60*60*1000;
        this.oneYearDate = this.formatDate(false,oneYearAgo,today)
        this.perDayOfYear = (this.oneYearTotal / Math.round(Math.abs((today.getTime() - oneYearAgo.getTime())/(oneDay)))).toFixed(3)
      },
      isSameDay(d1,d2) {
        return d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();
      },
      isPreviousDay(d1, d2) {
        let tmpD = new Date(d2.getTime())
        tmpD.setDate(tmpD.getDate() - 1)
        return this.isSameDay(d1,tmpD)
      },
      formatDate(ignoreYear,from,to) {
        let res = (ignoreYear ? '' : from.getFullYear() + ' 年 ') +
          (from.getMonth() + 1) + ' 月 ' + from.getDate() + ' 日'
        if (to && to !== '') {
          res += ' - ' + ( ignoreYear ? '' : to.getFullYear() + ' 年 ' ) +
            (to.getMonth() + 1) + ' 月 ' + to.getDate() + ' 日'
        }

        return res
      }
    }
  }
</script>

<style>
  .vch__day__square:hover {
    stroke: none !important;
  }

  .cb-stats-block {
    position: absolute;
  }

  .cb-stats-top {
    top: 8px;
    right: 20px;
  }

  .cb-stats-table {
    display: table;
  }

  .cb-stats-row {
    display: table-row;
  }

  .cb-stats-label {
    display: table-cell;
    padding-bottom: 12px;
    font-size: 14px;
    color: rgb(119, 119, 119);
    text-align: right;
    vertical-align: bottom;
  }

  .cb-stats-count {
    display: block;
    font-size: 32px;
    font-weight: 600;
    line-height: 1;
    color: rgb(30, 104, 35);
  }

  .cb-stats-average {
    font-size: 12px;
    font-weight: bold;
    color: rgb(36, 41, 46);
  }

  .cb-stats-total-meta {
    vertical-align: middle !important;
  }

  .cb-stats-meta {
    display: table-cell;
    padding-bottom: 12px;
    padding-left: 8px;
    text-align: left;
    line-height: 1.2;
    vertical-align: bottom;
  }

  .cb-stats-unit {
    display: block;
    font-size: 14px;
  }

  .cb-stats-date {
    display: block;
    color: rgb(153, 153, 153);
    font-size: 12px;
  }

  .vch__month__label,.vch__day__label{
    fill: #999 !important;
  }

  .cb-stats-block {
    position: absolute;
  }
</style>
