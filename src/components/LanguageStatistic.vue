<template>
  <v-chart style="width: 100%" :options="languageStatisticOpt" :autoresize="true"/>
</template>

<script>
  export default {
    name: "language-statistic",
    props: {
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
          this.languageStatisticOpt.series[0].data[el.language].value += 1
        })
      },
      resetStatisticData() {
        this.languageStatisticOpt.series[0].data.forEach(el => {
          el.value = 0
        })
      }
    },
    data() {
      return {
        languageStatisticOpt: {
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
          series: [
            {
              type: 'pie',
              selectedMode: 'single',
              center: ['50%','50%'],
              radius: [0, '70%'],

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
                {name: 'C', value: 0,selected:true},
                {name: 'C++', value: 0},
                {name: 'Java', value: 0},
                {name: 'GoLang', value: 0},
              ]
            },
          ]
        }
      }
    }
  }
</script>

<style scoped>

</style>

