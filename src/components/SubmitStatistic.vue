<template>
  <v-chart style="width: 100%" :options="simple ? statisticOption : detailStatisticOption" :autoresize="true"/>
</template>

<script>
  export default {
    name: "submit-statistic",
    props: {
      simple: {
        type: Boolean
      },
      submits: {
        type: Array,
        required: true
      }
    },
    watch: {
      submits() {
        this.resetStatisticData() // recalculate
        this.calculateStatistic()
      }
    },
    created() {
      this.calculateStatistic()
    },
    methods: {
      calculateStatistic() {
        this.submits.forEach(el => {
          if (el.result === 0 ) {
            this.statisticOption.series[0].data[0].value += 1
            this.detailStatisticOption.series[0].data[0].value += 1
          }else {
            this.statisticOption.series[0].data[1].value += 1
            this.detailStatisticOption.series[0].data[1].value += 1
          }
          this.detailStatisticOption.series[1].data[el.result].value += 1
        })
      },
      resetStatisticData() {
        this.statisticOption.series[0].data.forEach(el => {
          el.value = 0
        })

        this.detailStatisticOption.series[0].data.forEach(el => {
          el.value = 0
        })

        this.detailStatisticOption.series[1].data.forEach(el => {
          el.value = 0
        })
      }
    },
    data() {
      return {
        statisticOption: {
          tooltip: {
            trigger: 'item',
            formatter: "{b}: {c} ({d}%)"
          },
          legend: {
            x: 'center',
            y: 'top',
            textStyle: {
              color: '#999'
            }
          },
          color: ['#56be6a', '#ea3e14'],
          series: [
            {
              type: 'pie',
              radius: '70%',
              center: ['50%', '50%'],
              data: [
                {name: 'Accepted', value: 0, selected: true},
                {name: 'Wrong', value: 0},
              ],
              label: {
                normal: {
                  position: 'inner'
                },
              },
            }
          ],
        },
        detailStatisticOption: {
          tooltip: {
            trigger: 'item',
            formatter: "{b}: {c} ({d}%)"
          },
          legend: {
            orient: 'vertical',
            x: 'left',
            textStyle: {
              color: '#999'
            }
          },
          color: ['#56be6a', '#ea3e14','#80848f','#f09306','#ec600d','#749f83','#2f4554','#ea3e14','#c23531'],
          series: [
            {
              type: 'pie',
              center: ['50%','50%'],
              selectedMode: 'single',
              radius: [0, '25%'],

              label: {
                normal: {
                  position: 'inner'
                }
              },
              labelLine: {
                normal: {
                  show: false
                }
              },
              data: [
                {name: 'Accepted', value: 0, selected: true},
                {name: 'Wrong', value: 0},
              ]
            },
            {
              type: 'pie',
              radius: ['35%', '65%'],
              center: ['50%','50%'],
              data: [
                {name: 'Accepted', value: 0,selected:true},
                {name: 'Judging', value: 0},
                {name: 'RuntimeError', value: 0},
                {name: 'CompileError', value: 0},
                {name: 'RunTimeOut', value: 0},
                {name: 'OOM', value: 0},
                {name: 'WrongAnswer', value: 0},
                {name: 'SystemError', value: 0},
              ]
            }
          ]
        }
      }
    }
  }
</script>

<style scoped>

</style>
