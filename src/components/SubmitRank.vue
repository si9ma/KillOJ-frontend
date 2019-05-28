<template>
  <v-chart @click="xaxisClick" id="rankChart" style="width: 100%;height: 100%;min-height: 300px" :options="rankOption"/>
</template>

<script>
  export default {
    name: "submit-rank",
    props: {
      submits: {
        type: Array,
        required: true
      },
      top: {
        type: Number,
        default: 15
      }
    },
    created() {
      this.calculateRank()
    },
    watch: {
      submits() {
        this.calculateRank()
      }
    },
    methods: {
      calculateRank() {
        let submitGrp = this.groupBy(this.submits,'user_id')
        let calculatedData = []

        for(let id in submitGrp) {
          calculatedData.push(this.calculateUser(submitGrp[id]))
        }

        calculatedData.sort((a,b) => {
          return b.acPercent - a.acPercent
        })

        this.rankedResult = calculatedData.slice(0,this.top)

        // apply to chart
        this.rankOption.xAxis[0].data = this.rankedResult.map(i => i.user.name)
        this.rankOption.series[0].data = this.rankedResult.map(i => i.ac)
        this.rankOption.series[1].data = this.rankedResult.map(i => i.total)
        this.rankOption.series[2].data = this.rankedResult.map(i => i.acPercent)
        this.rankOption.series[3].data = this.rankedResult.map(i => i.successSubmitPct)
      },
      calculateUser(submits) {
        let resultMap = new Map()
        let successSubmitCnt = 0
        let result = {}

        // reduplicate
        for (let submit of submits) {
          if (submit.result === 0) {
            successSubmitCnt++
          }

          if (resultMap.has(submit.problem_id)) {
            if(submit.result === 0) resultMap.set(submit.problem_id,submit) // overwrite when success
          }else {
            resultMap.set(submit.problem_id,submit)
          }
        }

        result.total = resultMap.size
        result.ac = 0
        resultMap.forEach(value => {
          if (value.result === 0) {
            result.ac += 1
          }
        })
        result.acPercent = result.ac * 100 / result.total
        result.successSubmitPct = successSubmitCnt * 100 / submits.length
        result.user = submits[0].user
        result.problem = submits[0].problem

        return result
      },
      groupBy(xs, key) {
        return xs.reduce(function(rv, x) {
          (rv[x[key]] = rv[x[key]] || []).push(x);
          return rv;
        }, {});
      },
      xaxisClick(params) {
        if(params.componentType =="xAxis"){
          let index = Number(params.event.target.anid.split("_")[1])
          this.$router.push('/user/' + this.rankedResult[index].user.id)
        }
      }
    },
    data() {

      return {
        rankOption: {
          rankedResult: [],
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['AC', 'Total','AC率', '提交通过率'],
            textStyle: {
              color: '#999'
            }
          },
          toolbox: {
            show: true,
            feature: {
              dataView: {show: true, readOnly: false},
              magicType: {show: true, type: ['line', 'bar', 'stack']},
              restore: {show: true},
              saveAsImage: {show: true}
            },
            textStyle: {
              color: '#999'
            }
          },
          grid: {
            left: '2%',
            right: '2%',
            bottom: '3%',
            containLabel: true
          },
          calculable: true,
          xAxis: [
            {
              type: 'category',
              triggerEvent: true,
              data: [],
              axisLine: {
                show: false
              },
              axisLabel: {
                color: '#999'
              },
              splitLine: {
                show: false,
              },
              axisTick: {
                show: false
              },
            }
          ],
          yAxis: [
            {
              type: 'value',
              axisLine: {
                show: false,
              },
              axisTick: {
                show: false
              },
              splitLine: {
                show: false,
              },
              axisLabel: {
                color: '#999'
              },
            }
          ],
          series: [
            {
              name: 'AC',
              type: 'bar',
              data: []
            },
            {
              name: 'Total',
              type: 'bar',
              data: []
            },
            {
              name: 'AC率',
              type: 'bar',
              data: []
            },
            {
              name: '提交通过率',
              type: 'bar',
              data: []
            }
          ]
        }
      }
    }
  }
</script>

<style scoped>
</style>
