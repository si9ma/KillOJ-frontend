<template>
  <div>
    <!-- for fullscreen loading -->
    <a v-loading.fullscreen.lock="doing"></a>

    <div id="problem-content" :class="$theme.isDark ? 'dark-content' : 'light-content'">
      <div class="row">
        <div :class="{'col-md-10':!isAdd && !isEdit,'col-md-12':isAdd || isEdit}">
          <el-form ref="problemForm" :model="problem" :rules="problemRules">
            <card>
              <div slot="header" class="mb-2">
                <div class="row">
                  <div :class="{'col-md-10': !isAdd, 'col-md-12':isAdd}">
                    <div v-if="isAdd || isEdit">
                      <div class="row">
                        <div class="col-md-3">
                          <el-form-item prop="name" label="试题名称">
                            <el-input @focus="alreadyExistField.name = false" size="small" v-model="problem.name" placeholder="试题名称"/>
                          </el-form-item>
                        </div>
                        <div class="col-md-3">
                          <el-form-item prop="catalog_id" label="分类">
                            <el-select size="small" style="width: 100%"
                                       v-model.number="problem.catalog_id"
                                       filterable
                                       placeholder="请选择分类">
                              <el-option
                                v-for="item in catalogs"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                              </el-option>
                            </el-select>
                          </el-form-item>
                        </div>
                        <div class="col-md-6">
                          <el-form-item size="small" style="margin-top: 10px" prop="tags" label="标签">
                            <el-select size="small" style="width: 100%"
                                       v-model="problem.tags"
                                       value-key="id"
                                       multiple
                                       allow-create
                                       filterable
                                       default-first-option
                                       placeholder="请选择标签">
                              <el-option
                                v-for="item in tags"
                                :key="item.id"
                                :label="item.name"
                                :value="item">
                              </el-option>
                            </el-select>
                          </el-form-item>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-1">
                          <el-form-item prop="belong_type" label="上传到">
                            <el-select size="small" style="width: 100%"
                                       v-model="problem.belong_type"
                                       @change="changeBelongType"
                                       filterable
                                       placeholder="请选择">
                              <el-option
                                v-for="item in belong_types"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                              </el-option>
                            </el-select>
                          </el-form-item>
                        </div>
                        <div class="col-md-2" v-if="problem.belong_type">
                          <el-form-item prop="belong_to_id" :label="problem.belong_type === 1 ? '分组' : '比赛'">
                            <el-select size="small" style="width: 100%"
                                       v-model="problem.belong_to_id"
                                       filterable
                                       default-first-option
                                       placeholder="请选择">
                              <el-option
                                v-for="item in belongToIDs"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                              </el-option>
                            </el-select>
                          </el-form-item>
                        </div>
                        <div class="col-md-2">
                          <el-form-item prop="difficulty" label="难度">
                            <el-select size="small" style="width: 100%"
                                       v-model="problem.difficulty"
                                       filterable
                                       default-first-option
                                       placeholder="请选择">
                              <el-option
                                v-for="item in difficulties"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                              </el-option>
                            </el-select>
                          </el-form-item>
                        </div>
                        <div class="col-md-2">
                          <el-form-item prop="source" label="来源">
                            <el-input size="small" v-model="problem.source" placeholder="题目来源"/>
                          </el-form-item>
                        </div>
                      </div>
                    </div>
                    <div v-else>
                      <div class="row ml-1">
                        <b>{{problem.name}}</b>
                        <div class="col-md-1 col-1 text-right">
                          <a @click="up" :style="{color: attitude === 1 ? '#5baeff' : ($theme.isDark ? 'white' : 'black'),cursor: 'pointer'}">
                            <font-awesome-icon class="ml-3"
                                               :icon="['fas','thumbs-up']" size="sm"/>
                            {{problem.up_vote_users.length}}</a>
                        </div>
                        <div class="col-md-1 col-1 text-left">
                          <a @click="down" :style="{color: attitude === -1 ? '#5baeff' : ($theme.isDark ? 'white' : 'black'),cursor: 'pointer'}">
                            <font-awesome-icon class="ml-3"
                                               :icon="['fas','thumbs-down']" size="sm"/>
                            {{problem.down_vote_users.length}}</a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-2" v-if="!isAdd && problem.owner_id === mySelf.id">
                    <div class="text-right">
                      <el-switch
                        size="mini"
                        v-model="isEdit"
                        @change="prepare4Edit()"
                        active-text="编辑"
                        inactive-text="做题">
                      </el-switch>
                    </div>
                  </div>
                </div>
              </div>
            </card>

            <!--            limit      -->
            <card v-if="isAdd || isEdit">
              <div v-if="index % 2 === 0" class="row" v-for="(limit,index) in problem.limit" :key="index">
                <div class="col-3">
                  <el-form-item
                    :prop="'limit.' + index + '.time_limit'"
                    :rules="problemRules.time_limit" :label="languages[index].name + '时间限制(ms)'">
                    <el-input size="small" v-model.number="limit.time_limit" type="number" placeholder="时间限制(ms)"/>
                  </el-form-item>
                </div>
                <div class="col-3">
                  <el-form-item
                    :prop="'limit.' + index + '.memory_limit'"
                    :rules="problemRules.memory_limit" :label="languages[index].name + '内存限制(KB)'">
                    <el-input size="small" v-model.number="limit.memory_limit" type="number" placeholder="内存限制(KB）"/>
                  </el-form-item>
                </div>
                <div v-if="index + 1 < problem.limit.length" class="col-3">
                  <el-form-item
                    :prop="'limit.' + (index + 1) + '.time_limit'"
                    :rules="problemRules.time_limit" :label="languages[index+1].name + '时间限制(ms)'">
                    <el-input size="small" v-model.number="problem.limit[index+1].time_limit" type="number" placeholder="时间限制(ms)"/>
                  </el-form-item>
                </div>
                <div v-if="index + 1 < problem.limit.length" class="col-3">
                  <el-form-item
                    :prop="'limit.' + (index + 1) + '.memory_limit'"
                    :rules="problemRules.memory_limit" :label="languages[index+1].name + '内存限制(KB)'">
                    <el-input size="small" v-model.number="problem.limit[index+1].memory_limit" type="number" placeholder="内存限制(KB）"/>
                  </el-form-item>
                </div>
              </div>
            </card>
            <card body-classes="compact-card-body">
              <h5 slot="header"><b>描述</b></h5>
              <mavon-editor :value="problem.desc"
                            v-model="problem.desc"
                            defaultOpen="preview"
                            :toolbarsFlag="isAdd || isEdit"
                            :subfield="isAdd || isEdit"
                            :boxShadow="isAdd || isEdit"
                            placeholder="试题描述"
                            :toolbars="$gbl.mdtoolbars"
                            style="z-index: auto"></mavon-editor>
            </card>
            <card body-classes="compact-card-body">
              <h5 slot="header"><b>输入</b></h5>
              <mavon-editor :value="problem.input"
                            v-model="problem.input"
                            defaultOpen="preview"
                            placeholder="输入描述"
                            :toolbarsFlag="isAdd || isEdit"
                            :subfield="isAdd || isEdit"
                            :boxShadow="isAdd || isEdit"
                            :toolbars="$gbl.mdtoolbars"
                            style="z-index: auto"></mavon-editor>
            </card>
            <card body-classes="compact-card-body">
              <h5 slot="header"><b>输出</b></h5>
              <mavon-editor :value="problem.output"
                            v-model="problem.output"
                            placeholder="输出描述"
                            defaultOpen="preview"
                            :toolbarsFlag="isAdd || isEdit"
                            :subfield="isAdd || isEdit"
                            :boxShadow="isAdd || isEdit"
                            :toolbars="$gbl.mdtoolbars"
                            style="z-index: auto"></mavon-editor>
            </card>
            <card body-classes="compact-card-body">
              <h5 slot="header"><b>提示</b></h5>
              <mavon-editor :value="problem.hint"
                            v-model="problem.hint"
                            placeholder="提示"
                            defaultOpen="preview"
                            :toolbarsFlag="isAdd || isEdit"
                            :subfield="isAdd || isEdit"
                            :boxShadow="isAdd || isEdit"
                            :toolbars="$gbl.mdtoolbars"
                            style="z-index: auto"></mavon-editor>
            </card>
            <card body-classes="compact-card-body">
              <div class="row" slot="header">
                <div class="col-md-9 col-sm-7 col-6" @click="isSampleCollapse = !isSampleCollapse">
                  <h5 slot="header"><b>样例</b></h5>
                </div>
                <div class="col-md-3 col-sm-5 col-6 text-right">
                  <el-button v-if="isAdd || isEdit" type="primary" size="mini"
                             @click="problem.samples.push({input:'',output:'',delete_it:false});isSampleCollapse = true">
                    添加样例
                  </el-button>
                  <i :class="{'el-icon-arrow-down':isSampleCollapse,'el-icon-arrow-right':!isSampleCollapse,'ml-2':true}"
                     @click="isSampleCollapse = !isSampleCollapse"/>
                </div>
              </div>
              <split-panel v-for="(sample,index) in problem.samples"
                           :key="index"
                           left-placeholder="输入"
                           right-placeholder="输出"
                           :preview="!isEdit && !isAdd"
                           v-if="!sample.delete_it && isSampleCollapse"
                           :title="'样例'+ (index + 1)"
                           @close="$event.delete_it = true"
                           left-key="input"
                           right-key="output"
                           v-model="problem.samples[index]"/>
            </card>
            <card v-if="isAdd || isEdit" body-classes="compact-card-body">
              <div class="row" slot="header">
                <div class="col-md-9 col-sm-5 col-6" @click="isTestCaseCollapse = !isTestCaseCollapse">
                  <h5 slot="header"><b>测试用例</b></h5>
                </div>
                <div class="col-md-3 col-sm-5 col-6 text-right">
                  <el-button v-if="isAdd || isEdit" type="primary" size="mini"
                             @click="problem.test_cases.push({input_data:'',expected_output:'',delete_it:false});isTestCaseCollapse = true">
                    添加测试用例
                  </el-button>
                  <i :class="{'el-icon-arrow-down':isTestCaseCollapse,'el-icon-arrow-right':!isTestCaseCollapse,'ml-2':true}"
                     @click="isTestCaseCollapse = !isTestCaseCollapse"/>
                </div>
              </div>
              <split-panel v-for="(test_case,index) in problem.test_cases"
                           :key="index"
                           left-placeholder="输入"
                           right-placeholder="输出"
                           :preview="!isEdit && !isAdd"
                           v-if="!test_case.delete_it && isTestCaseCollapse"
                           :title="'样例'+ (index + 1)"
                           @close="$event.delete_it = true"
                           left-key="input_data"
                           right-key="expected_output"
                           v-model="problem.test_cases[index]"/>
            </card>
          </el-form>
          <card v-if="!isAdd && !isEdit" body-classes="compact-card-body">
            <div slot="header">
              <div class="row pb-2 pt-2">
                <div class="col-6">
                  <p style="display: inline">语言: </p>
                  <el-select size="mini"
                             v-model="language"
                             @change="changeLang"
                             filterable
                             default-first-option
                             placeholder="语言">
                    <el-option
                      v-for="item in languages"
                      :key="item.key"
                      :label="item.name"
                      :value="item">
                    </el-option>
                  </el-select>
                </div>
                <div class="col-6 text-right">
                  <p style="display: inline;">主题: </p>
                  <el-select size="mini"
                             v-model="cmOptions.theme"
                             filterable
                             default-first-option
                             placeholder="主题">
                    <el-option
                      v-for="item in themes"
                      :key="item.value"
                      :label="item.name"
                      :value="item.value">
                    </el-option>
                  </el-select>

                  <p style="display:inline;" class="ml-2">KeyMap: </p>
                  <el-select size="mini"
                             v-model="cmOptions.keyMap"
                             filterable
                             default-first-option
                             placeholder="KeyMap">
                    <el-option
                      v-for="item in keymaps"
                      :key="item.value"
                      :label="item.name"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </div>
              </div>
            </div>
            <codemirror v-model="code" :options="cmOptions"></codemirror>
          </card>

          <el-button type="primary"
                     size="mini"
                     :disabled="judging"
                     @click="submit()">
            提 交
          </el-button>

          <!--    only when user has success submit    -->
          <div class="row" v-if="this.lastSuccessSubmit && !isEdit && !isAdd">
            <div class="col-12">
              <comment :comments="problem.comments" :meID="mySelf.id" @submit="submitComment"/>
            </div>
          </div>
        </div>
        <div class="col-md-2 mt-1" v-if="!isEdit && !isAdd">
          <card>
            <div slot="header">
              <h5 style="display: inline">信息</h5>
              <font-awesome-icon size="sm" class="ml-1" :color="$theme.isDark ? 'white' : 'black'" :icon="['fas','info-circle']"/>
            </div>
            <div class="row">
              <div class="col-md-6 col-6">
                <p>ID</p>
                <p>时间限制</p>
                <p>内存限制</p>
                <p>分类</p>
                <p>难度</p>
                <p v-if="problem.source !== ''">来源</p>
              </div>
              <div class="col-md-6 col-6">
                <p>{{problem.id}}</p>
                <p>{{problem.time_limit}}MS</p>
                <p>{{problem.memory_limit}}KB</p>
                <p>
                  <el-tag size="mini" style="cursor: pointer"
                          @click="filterBy('catalog',problem.catalog.id)"
                          type="primary">{{problem.catalog.name}}
                  </el-tag>
                </p>
                <p>
                  <el-tag size="mini" style="cursor: pointer"
                          @click="filterBy('difficulty',problem.difficulty)"
                          type="primary">{{difficulties[problem.difficulty].name}}
                  </el-tag>
                </p>
                <p v-if="problem.source !== ''">{{problem.source}}</p>
              </div>
            </div>
          </card>
          <card v-if="problem.tags.length !== 0">
            <div slot="header">
              <font-awesome-icon :icon="['fas','tags']"
                                 size="sm"/>
              <span class="ml-2">标签</span>
            </div>

            <el-tag style="cursor: pointer"
                    @click="filterBy('tags',tag.id)"
                    class="ml-1 mr-1 mt-1 mb-1" size="small" v-for="(tag,index) in problem.tags"
                    :key="index">
              {{tag.name}}
            </el-tag>
          </card>

          <card>
            <div slot="header">
              <div class="row">
                <div class="col-6">
                  <h5 style="display: inline">统计</h5>
                  <font-awesome-icon size="sm" class="ml-1" :color="$theme.isDark ? 'white' : 'black'" :icon="['fas','chart-pie']"/>
                </div>
                <div class="col-6 text-right">
                  <font-awesome-icon @click="showStatisticDetail = true" style="cursor: pointer;" size="sm" class="ml-1" :color="$theme.isDark ? 'white' : 'black'" :icon="['fas','info-circle']"/>
                </div>
              </div>
            </div>
            <div class="row text-center" id="problem-statistic">
              <submit-statistic :submits="submits" :simple="true"/>
            </div>
          </card>

          <!-- user info -->
          <user-card v-if="problem.owner"
                     :user="problem.owner"
                     title="Owner信息"></user-card>

          <!--         last submit      -->
          <div class="fail-submit">
            <card v-if="lastSubmit">
              <div slot="header">
                <div class="row">
                  <font-awesome-icon size="sm" class="ml-1" :color="$theme.isDark ? 'white' : 'black'" :icon="['fab','lastfm']"/>
                  <span class="ml-2">最近一次提交</span>
                </div>
              </div>

              <div class="row">
                <div class="col-12 text-center">
                  <h5 :style="{color: lastSubmit.result !== 0 ? '#f56c6c' : '#67c23a'}">{{results[lastSubmit.result]}}</h5>
                </div>
              </div>

              <div class="row">
                <div class="col-6 text-right">
                  <p>语言</p>
                </div>
                <div class="col-6">
                  <el-tag size="mini" type="primary">
                    {{languages[lastSubmit.language].name}}
                  </el-tag>
                </div>
              </div>

              <div class="row">
                <div class="col-6 text-right">
                  <p>运行时间</p>
                </div>
                <div class="col-6">
                  <p>{{lastSubmit.run_time}}MS</p>
                </div>
              </div>

              <div class="row">
                <div class="col-6 text-right">
                  <p>占用内存</p>
                </div>
                <div class="col-6">
                  <p>{{lastSubmit.memory_usage}}KB</p>
                </div>
              </div>

              <div class="row mt-2">
                <div class="col-12 text-center">
                  <el-button @click="loadSubmit(lastSubmit)" size="mini" type="primary">
                    加载
                  </el-button>
                </div>
              </div>

            </card>
          </div>

          <div class="success-submit">
            <card v-if="lastSuccessSubmit">
              <div slot="header">
                <font-awesome-icon size="sm" class="ml-1" :color="$theme.isDark ? 'white' : 'black'" :icon="['fab','lastfm']"/>
                <span class="ml-2">最近一次成功提交</span>
              </div>

              <div class="row">
                <div class="col-12 text-center">
                  <h5 :style="{color: lastSuccessSubmit.result !== 0 ? '#f56c6c' : '#67c23a'}">{{results[lastSuccessSubmit.result]}}</h5>
                </div>
              </div>

              <div class="row">
                <div class="col-6 text-right">
                  <p>语言</p>
                </div>
                <div class="col-6">
                  <el-tag size="mini" type="primary">
                    {{languages[lastSuccessSubmit.language].name}}
                  </el-tag>
                </div>
              </div>

              <div class="row">
                <div class="col-6 text-right">
                  <p>运行时间</p>
                </div>
                <div class="col-6">
                  <p>{{lastSuccessSubmit.run_time}}MS</p>
                </div>
              </div>

              <div class="row">
                <div class="col-6 text-right">
                  <p>占用内存</p>
                </div>
                <div class="col-6">
                  <p>{{lastSuccessSubmit.memory_usage}}KB</p>
                </div>
              </div>

              <div class="row mt-2">
                <div class="col-12 text-center">
                  <el-button @click="loadSubmit(lastSuccessSubmit)" size="mini" type="primary">
                    加载
                  </el-button>
                </div>
              </div>

            </card>
          </div>
        </div>
      </div>
    </div>

    <el-dialog :visible.sync="showStatisticDetail" width="40%">
      <div class="row">
          <submit-statistic :submits="submits"/>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="showResult" :width="isError ? '30%' : '20%'" center>
      <h4 slot="title" :style="{color: isError ? '#f56c6c' : '#67c23a' }">{{judgeResult.status && judgeResult.status.msg}}</h4>
      <div class="row">
        <div class="col-12 text-center">
          <h5 :style="{color: isError ? '#f56c6c' : '#67c23a' }">{{judgeResult.message}}</h5>
        </div>
      </div>
      <!--      only when wrong answer or Accepted      -->
      <div v-if="judgeResult.status && (judgeResult.status.code === 0 || judgeResult.status.code === 6)" class="row">
        <div class="col-12 text-center">
          <h4>{{judgeResult.success_test_case * 100 / judgeResult.test_case_num}} %</h4>
        </div>
      </div>
      <div v-if="judgeResult.runtime" class="row">
        <div class="col-6 text-right">
          <p>运行时间</p>
        </div>
        <div class="col-6">
          <p>{{judgeResult.runtime}}MS</p>
        </div>
      </div>
      <div v-if="judgeResult.memory" class="row">
        <div class="col-6 text-right">
          <p>占用内存</p>
        </div>
        <div class="col-6">
          <p>{{judgeResult.memory}}KB</p>
        </div>
      </div>
      <div v-if="isError && judgeResult.stderr" class="row">
        <pre class="ml-3 mr-3" style="background:#f4f4f4;color: #f56c6c; max-height: 200px;width: 100%">{{judgeResult.stderr}}</pre>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="showResult = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {AuthHeader, Contains, ExtractJson, GetAllSubmit} from "../service";
  import UserCard from './Profile/UserCard'
  import {SplitPanel} from "@/components";
  import {Comment} from "@/components";
  import join from "lodash/join";
  import remove from "lodash/remove";
  import SubmitStatistic from "../components/SubmitStatistic";

  export default {
    name: "problem",
    components: {
      SubmitStatistic,
      SplitPanel,
      UserCard,
      Comment
    },
    props: {
      problemID: {
        type: Number,
        default: 0,
        description: 'problem id ,0 for add new problem'
      }
    },
    data() {
      let validateName = (rule, value, callback) => {
        // name shouldn't contains special character
        if (Contains(value, '!@#?')) {
          callback(new Error('试题名不能包含!@#?字符'))
        } else if (this.alreadyExistField.name) {
          callback(new Error('试题名已被占用'))
        } else {
          callback()
        }
      };

      return {
        value: '',
        content: {
          left: '',
          right: '',
          show: true,
        },
        submits: [],
        isSampleCollapse: true,
        isTestCaseCollapse: true,
        judging: false,
        isAdd: this.problemID === 0, // 0 for add new problem
        isError: true,
        templates: [],
        isEdit: false,
        showResult: false,
        catalogs: [],
        contests: [],
        alreadyPull4Edit: false,
        judgeResult: {},
        groups: [],
        lastSubmit: null,
        lastSuccessSubmit: null,
        showStatisticDetail: false,
        belongToIDs: [],
        alreadyExistField: {
          name: false
        },
        tags: [],
        code: '',
        codeMap: new Map(),
        doing: false,
        problem: {
          belong_to_id: null,
          belong_type: 0,
          catalog: {
            id: null,
            name: ''
          },
          limit: [
            {time_limit: 100, memory_limit: 100}, // index 0 => c
            {time_limit: 100, memory_limit: 100}, // index 1 => c++
            {time_limit: 100, memory_limit: 100}, // index 2 => java
            {time_limit: 100, memory_limit: 100}, // index 3 => go
          ],
          catalog_id: null,
          comments: [],
          desc: '',
          difficulty: 0,
          down_vote_users: [],
          hint: '',
          id: null,
          input: '',
          test_cases: [],
          memory_limit: 200,
          name: "新问题",
          output: '',
          owner_id: null,
          samples: [],
          source: '',
          tags: [],
          time_limit: 200,
          up_vote_users: []
        },
        previousTagMap: new Map(),
        attitude: 0,
        problemRules: {
          name: [
            {required: true, message: '请输入试题名称', trigger: 'blur'},
            {max: 100, message: '不能超过100个字符', trigger: 'blur'},
            {validator: validateName, trigger: 'blur'}
          ],
          catalog_id: [
            {required: true, type: 'number', message: '请选择分类', trigger: 'blur'}
          ],
          time_limit: [
            {required: true, type: 'number', message: '请输入时间限制', trigger: 'blur'},
            {min: 100, max: 180000, type: 'number', message: '100 ~ 180000', trigger: 'blur'}
          ],
          memory_limit: [
            {required: true, type: 'number', message: '请输入内存限制', trigger: 'blur'},
            {min: 100, max: 204800, type: 'number', message: '100 ~ 204800', trigger: 'blur'}
          ],
          source: [
            {max: 80, message: '最多不能超过80个字符', trigger: 'blur'}
          ]
        },
        belong_types: [
          {id: 0, name: '公开'},
          {id: 1, name: '分组'},
          {id: 2, name: '比赛'},
        ],
        results: ["Accepted", "Juding", "RuntimeError", "CompileError", "RunTimeOut", "OOM", "WrongAnswer", "SystemError"],
        difficulties: [
          {id: 0, name: '简单'},
          {id: 1, name: '中等'},
          {id: 2, name: '难'},
        ],
        keymaps: [
          {name: 'Sublime', value: 'sublime'},
          {name: 'Vim', value: 'vim'},
          {name: 'Emacs', value: 'emacs'},
          {name: 'Default', value: 'default'},
        ],
        themes: [
          {name: 'Monokai', value: 'monokai'},
          {name: 'Material', value: 'material'},
          {name: 'Solarized Dark', value: 'solarized dark'},
          {name: 'Solarized Light', value: 'solarized light'},
        ],
        previousLanguage: {key: 3, name: 'Go', value: 'text/x-go'}, // init value should same as language
        language: {key: 3, name: 'Go', value: 'text/x-go'},
        languages: [
          {key: 0, name: 'C', value: 'text/x-csrc'},
          {key: 1, name: 'C++', value: 'text/x-c++src'},
          {key: 2, name: 'Java', value: 'text/x-java'},
          {key: 3, name: 'Go', value: 'text/x-go'},
        ],
        cmOptions: {
          tabSize: 4,
          styleActiveLine: true,
          lineNumbers: true,
          smartIndent: true,
          line: true,
          mode: 'text/x-go',
          theme: 'material',
          keyMap: 'vim'
        },
        commentData: [
          {
            id: 1,
            date: '2018-07-05 08:30',
            from: {
              id: 1,
              name: 'test',
              avatar_url: 'https://avatars0.githubusercontent.com/u/24809310?s=400&u=a74f74fe94f1bc8b4eecf05f585573491b2417f1&v=4',
            },
            for_comment: 0,
            content: 'test',
          },
          {
            id: 2,
            date: '2018-07-05 08:30',
            from: {
              id: 2,
              name: 'test1',
              avatar_url: 'https://avatars0.githubusercontent.com/u/24809310?s=400&u=a74f74fe94f1bc8b4eecf05f585573491b2417f1&v=4',
            },
            to: {
              id: 1,
              name: 'test',
              avatar_url: 'https://avatars0.githubusercontent.com/u/24809310?s=400&u=a74f74fe94f1bc8b4eecf05f585573491b2417f1&v=4',
            },
            for_comment: 1,
            content: 'test',
          }
        ],

      }
    },
    computed: {
      mySelf() {
        return this.$store.state.userInfo
      },
    },
    created() {
      if (this.problemID === 0) {
        this.pullData4Edit()
      } else {
        this.pullData().then(() => {
          for (let i = 0; i < this.problem.up_vote_users.length; i++) {
            if (this.problem.up_vote_users[i].id === this.mySelf.id) {
              this.attitude = 1
              return
            }
          }
          for (let i = 0; i < this.problem.down_vote_users.length; i++) {
            if (this.problem.down_vote_users[i].id === this.mySelf.id) {
              this.attitude = -1
              return
            }
          }
        }).then(() => {
          let loadCodeFrom = this.$router.currentRoute.query.load_from
          if (loadCodeFrom) {
            this.$axios({
              url: this.$gbl.apiURL + '/submits/' + loadCodeFrom,
              headers: AuthHeader()
            }).then(response => {
              this.loadSubmit(response.data)
              this.$gbl.alert('success','加载代码成功')
            }).catch(error => {
              let json = ExtractJson(error.response)
              if (json) {
                console.log(json)
                this.$gbl.alert('danger',json.error.message)
              } else {
                console.log(error)
                this.$gbl.alert('danger','加载代码出错')
              }
            })
          }
        })
      }
    },
    methods: {
      pullData4Edit() {
        this.doing = true
        this.alreadyPull4Edit = true

        const catalogsPromise = this.$axios({
          method: 'get',
          url: this.$gbl.apiURL + '/catalogs',
          params: {
            page: 1,
            page_size: 3000
          }
        })
          .then(response => {
            this.catalogs = response.data
            console.log('get catalogs success')
          })
          .catch(error => {
            // handle json response
            let json = ExtractJson(error.response)
            if (json) {
              console.log(json)
              this.$gbl.alert('danger', json.error.message)
              return
            } else {
              console.log(error.response)
            }
            this.$gbl.alert('danger', '获取分类出错')
          })

        const tagsPromise = this.$axios({
          method: 'get',
          url: this.$gbl.apiURL + '/tags',
          params: {
            page: 1,
            page_size: 3000
          }
        })
          .then(response => {
            this.tags = response.data
            console.log('get tags success')
          })
          .catch(error => {
            // handle json response
            let json = ExtractJson(error.response)
            if (json) {
              console.log(json)
              this.$gbl.alert('danger', json.error.message)
              return
            } else {
              console.log(error.response)
            }
            this.$gbl.alert('danger', '获取标签出错')
          })

        Promise.all([tagsPromise, catalogsPromise]).then(() => this.doing = false).catch(() => this.doing = false)
      },
      pullData() {
        return new Promise((resolve, reject) => {
          this.doing = true

          const problemPromise = this.$axios({
            method: 'get',
            url: this.$gbl.apiURL + '/problems/problem/' + this.problemID,
            headers: AuthHeader(),
          })
            .then(response => {
              this.doing = false
              this.problem = response.data

              // init limit value
              this.problem.time_limit = this.problem.limit[this.language.key].time_limit
              this.problem.memory_limit = this.problem.limit[this.language.key].memory_limit

              // backup tag
              this.previousTagMap = new Map(this.problem.tags.map(tag => {
                tag.delete_it = true
                return [tag.id, tag]
              }));

              console.log('get problem success')
            })
            .catch(error => {
              this.doing = false

              // handle json response
              let json = ExtractJson(error.response)
              if (json) {
                console.log(json)
                this.$gbl.alert('danger', json.error.message)
                return
              } else {
                console.log(error)
                this.$gbl.alert('danger', '获取试题出错')
              }
            })


          const templatesPromise = this.$axios({
            method: 'get',
            url: this.$gbl.apiURL + '/templates',
            params: {
              page: 1,
              page_size: 3000
            }
          })
            .then(response => {
              this.templates = response.data
              this.codeMap = new Map(this.templates.map(temp => [temp.language, temp.template]))
              this.code = this.codeMap.get(this.language.key)
              console.log('get templates success')
            })
            .catch(error => {
              // handle json response
              let json = ExtractJson(error.response)
              if (json) {
                console.log(json)
                this.$gbl.alert('danger', json.error.message)
                return
              } else {
                console.log(error.response)
              }
              this.$gbl.alert('danger', '获取代码模板出错')
            })

          GetAllSubmit('problem',this.problemID,false).then(submits => {
            this.submits = submits
          })

          let lastSubmitPromise = this.getLastSubmit(false).then(response => {
            this.lastSubmit = response.data
            if (this.lastSubmit.result === 0) { // success
              this.lastSuccessSubmit = response.data
              this.lastSubmit = null
            }else {
              this.getLastSubmit(true).then(resp => {
                this.lastSuccessSubmit = resp.data
              })
            }
          })

          Promise.all([problemPromise, templatesPromise,lastSubmitPromise]).then((response) => resolve(response)).catch(error => reject(error))
        })
      },
      getLastSubmit(success) {
        return new Promise((resolve,reject) => {
          this.$axios({
            method: 'get',
            url: join([this.$gbl.apiURL, 'problems/problem', this.problemID, 'lastsubmit'], '/'),
            headers: AuthHeader(),
            params: {
              success: success,
            }
          })
            .then(response => {
              resolve(response)
            })
            .catch(error => {
              // handle json response
              let json = ExtractJson(error.response)
              if (json) {
                switch (json.error.code) {
                  case 40401:
                    break
                  default:
                    console.log(json)
                    this.$gbl.alert('danger', json.error.message)
                }
              } else {
                console.log(error.response)
                this.$gbl.alert('danger', '获取最近提交出错')
              }
              reject(error)
            })
        })
      },
      getGroups() {
        return new Promise((resolve, reject) => {
          if (this.groups.length !== 0) return resolve(this.groups)

          // get all my groups
          this.$axios({
            method: 'get',
            url: this.$gbl.apiURL + '/groups',
            headers: AuthHeader(),
            params: {
              page: 1,
              page_size: 3000
            }
          })
            .then(response => {
              this.groups = response.data
              console.log('get groups success')
              return resolve(this.groups)
            })
            .catch(error => {
              // handle json response
              let json = ExtractJson(error.response)
              if (json) {
                console.log(json)
                this.$gbl.alert('danger', json.error.message)
                return
              } else {
                console.log(error.response)
                this.$gbl.alert('danger', '获取分组出错')
              }
              return reject(error)
            })
        })
      },
      getContests() {
        return new Promise((resolve, reject) => {
          console.log(this.contests)
          if (this.contests.length !== 0) return resolve(this.contests)

          // get all my contests
          this.$axios({
            method: 'get',
            url: this.$gbl.apiURL + '/contests',
            headers: AuthHeader(),
            params: {
              page: 1,
              page_size: 3000
            }
          })
            .then(response => {
              this.contests = response.data
              console.log('get contests success')
              return resolve(this.contests)
            })
            .catch(error => {
              // handle json response
              let json = ExtractJson(error.response)
              if (json) {
                console.log(json)
                this.$gbl.alert('danger', json.error.message)
                return
              } else {
                console.log(error.response)
                this.$gbl.alert('danger', '获取比赛出错')
              }
              return reject(error)
            })
        })
      },
      changeBelongType(val) {
        switch (val) {
          case 0:
            this.belongToIDs = []
            break
          case 1: // group
            this.getGroups().then(response => {
              this.belongToIDs = response
            })
            break
          case 2:
            this.getContests().then(response => {
              this.belongToIDs = response
            })
            break
        }
      },
      filterProblem() {
        // filter unavailable samples => delete_it is true, but id is empty
        remove(this.problem.samples, el => {
          return el.delete_it && !el.id
        })

        // filter unavailable test cases => delete_it is true, but id is empty
        remove(this.problem.test_cases, el => {
          return el.delete_it && !el.id
        })

        // convert all string to tag struct
        for (let i = 0; i < this.problem.tags.length; i++) {
          let tag = this.problem.tags[i]
          if (typeof tag === 'string' || tag instanceof String) {
            this.problem.tags[i] = {name: tag}
          }
        }
      },
      submitForm(formName, operation) {
        this.filterProblem() // remove unavailable test case and sample

        this.$refs[formName].validate((valid) => {
            if (valid) {
              valid = this.customValidate()
              if (valid) {
                switch (operation) {
                  case 'add':
                    this.addProblem()
                    return
                  case 'update':
                    this.updateProblem()
                    return;
                }
              }
            }

            console.log('error submit')
          }
        )
      },
      customValidate() {
        if (this.problem.desc === '') {
          this.$gbl.alert('danger', '请填写试题描述')
          return false
        }
        if (this.problem.input === '') {
          this.$gbl.alert('danger', '请填写试题输入描述')
          return false
        }
        if (this.problem.output === '') {
          this.$gbl.alert('danger', '请填写试题输出描述')
          return false
        }

        if (this.problem.test_cases.length === 0) {
          this.$gbl.alert('danger', '至少需要一个测试用例')
          return false
        }

        // check empty sample
        for (let i = 0; i < this.problem.samples.length; i++) {
          let sample = this.problem.samples[i]
          if (!sample.delete_it &&
            (sample.input === '' || sample.output === '')) {
            this.$gbl.alert('danger', '请完整填写样例输入输出')
            return false
          }
        }

        // check empty test case
        for (let i = 0; i < this.problem.test_cases.length; i++) {
          let testcase = this.problem.test_cases[i]
          if (!testcase.delete_it &&
            (testcase.input_data === '' || testcase.expected_output === '')) {
            this.$gbl.alert('danger', '请完整填写测试用例输入输出')
            return false
          }
        }

        return true
      },
      addProblem() {
        this.doing = true
        this.$axios({
          url: this.$gbl.apiURL + '/problems',
          method: 'post',
          headers: AuthHeader(),
          data: {
            ...this.problem
          }
        }).then((response) => {
          this.problem.id = response.data.id
          this.$router.push('/problems/' + this.problem.id) // refresh
          this.$gbl.alert('success', '添加题目成功')
        }).catch(error => {
          this.doing = false
          let json = ExtractJson(error.response)
          if (json) {
            switch (json.error.code) {
              case 40003: // something already exist
                for (let field in json.error.extra) {
                  this.alreadyExistField[field] = true
                }
                this.$refs['problemForm'].validate() // trigger validate
                this.$gbl.alert('warning', 'something wrong')
                return
              default:
                console.log(json)
                this.$gbl.alert('danger', json.error.message)
                return
            }
          } else {
            console.log(error)
            this.$gbl.alert('danger', '添加题目错误')
          }
        })
      },
      updateProblem() {
        let submitProblem = JSON.parse(JSON.stringify(this.problem))
        for (const val of submitProblem.tags) {
          if (this.previousTagMap.has(val.id)) {
            val.delete_it = false // already in tags
            this.previousTagMap.set(val.id, val)
          }
        }

        // push all deleted item to tags
        this.previousTagMap.forEach((value) => {
          if (value.delete_it) {
            submitProblem.tags.push(value)
          }
        })

        this.doing = true
        this.$axios({
          url: this.$gbl.apiURL + '/problems/problem/' + this.problemID,
          method: 'put',
          headers: AuthHeader(),
          data: {
            ...submitProblem
          }
        }).then(() => {
          this.doing = false
          this.isEdit = false

          // // reassign previous tag map
          // this.previousTagMap = new Map(this.problem.tags.map(tag => {
          //   tag.delete_it = true
          //   return [tag.id, tag]
          // }));

          // repull data after update
          this.pullData()
          this.pullData4Edit()

          this.$gbl.alert('success', '修改题目成功')
        }).catch(error => {
          this.doing = false
          let json = ExtractJson(error.response)
          if (json) {
            console.log(json)
            this.$gbl.alert('danger', json.error.message)
          } else {
            console.log(error)
            this.$gbl.alert('danger', '修改题目错误')
          }
        })
      },
      filterBy(by, val) {
        let filter = {}
        filter[by] = [val]
        let query = {
          filter: JSON.stringify(filter)
        }
        this.$router.push({path: '/problems', query: query})
      },
      up() {
        let attitude = this.attitude
        if (this.attitude === 1) {
          this.resetVote()
          return
        }

        this.attitude = 1
        this.vote().then(() => {
          remove(this.problem.down_vote_users, el => {
            return el.id === this.mySelf.id
          })
          this.problem.up_vote_users.push({id: this.mySelf.id})
        }).catch(() => {
          this.attitude = attitude
        })
      },
      resetVote() {
        this.attitude = 0
        let attitude = this.attitude

        this.vote().then(() => {
          for (let i = 0; i < this.problem.down_vote_users.length; i++) {
            if (this.problem.down_vote_users[i].id === this.mySelf.id) {
              this.$delete(this.problem.down_vote_users, i)
            }
          }

          for (let i = 0; i < this.problem.up_vote_users.length; i++) {
            if (this.problem.up_vote_users[i].id === this.mySelf.id) {
              this.$delete(this.problem.up_vote_users, i)
            }
          }
        }).catch(() => {
          // fallback
          this.attitude = attitude
        })
      },
      down() {
        let attitude = this.attitude
        if (this.attitude === -1) {
          this.resetVote()
          return
        }

        this.attitude = -1
        this.vote().then(() => {
          remove(this.problem.up_vote_users, el => {
            return el.id === this.mySelf.id
          })
          this.problem.down_vote_users.push({id: this.mySelf.id})
        }).catch(() => {
          this.attitude = attitude
        })
      },
      vote() {
        return new Promise((resolve, reject) => {
          this.$axios({
            url: join([this.$gbl.apiURL, 'problems/problem', this.problem.id, 'vote'], '/'),
            method: 'post',
            headers: AuthHeader(),
            data: {
              attitude: this.attitude,
            }
          }).then((response) => {
            resolve(response)
          }).catch(error => {
            let json = ExtractJson(error.response)
            if (json) {
              this.$gbl.alert('danger', json.error.message)
            } else {
              this.$gbl.alert('danger', '出现错误')
            }
            reject(error)
          })
        })
      },
      prepare4Edit() {
        if (this.isEdit && !this.alreadyPull4Edit) {
          this.pullData4Edit()
        }
      },
      changeLang(newVal) {
        this.cmOptions.mode = newVal.value
        this.codeMap.set(this.previousLanguage.key, this.code)
        this.previousLanguage = newVal
        this.code = this.codeMap.get(newVal.key)

        // change limit value
        this.problem.time_limit = this.problem.limit[newVal.key].time_limit
        this.problem.memory_limit = this.problem.limit[newVal.key].memory_limit
      },
      submit() {
        if (this.isAdd) {
          this.submitForm('problemForm', 'add')
        } else if (this.isEdit) {
          this.submitForm('problemForm', 'update')
        } else {
          this.submitAnswer()
        }
      },
      reloadLastSubmit() {
        this.getLastSubmit(false).then(response => {
          this.lastSubmit = response.data
          if (this.lastSubmit.result === 0) { // success
            this.lastSuccessSubmit = response.data
            this.lastSubmit = null
          }else {
            this.getLastSubmit(true).then(resp => {
              this.lastSuccessSubmit = resp.data
            })
          }
        })
      },
      submitAnswer() {
        if (this.code === '') {
          this.$gbl.alert('danger', '请输入你的答案')
        }

        this.$axios({
          url: join([this.$gbl.apiURL, 'problems/problem', this.problem.id, 'submit'], '/'),
          method: 'post',
          headers: AuthHeader(),
          data: {
            source_code: this.code,
            language: this.language.key,
          }
        }).then(() => {
          this.judging = true
          this.$gbl.alert('info', '提交成功，请等待判题')
          this.pullResult()
        }).catch(error => {
          let json = ExtractJson(error.response)
          if (json) {
            this.$gbl.alert('danger', json.error.message)
            console.log(json)
          } else {
            console.log(error)
            this.$gbl.alert('danger', '提交出现错误')
          }
          this.reloadLastSubmit()
        })
      },
      pullResult() {
        let pulling = false
        let i = setInterval(() => {
          if (pulling) return
          pulling = true

          this.$axios({
            url: join([this.$gbl.apiURL, 'problems/problem', this.problem.id, 'result'], '/'),
            method: 'get',
            headers: AuthHeader()
          }).then(response => {
            this.judgeResult = response.data
            this.isError = this.judgeResult.status.code !== 0
            this.showResult = true
            this.judging = false
            clearInterval(i)
            this.reloadLastSubmit()
          }).catch(error => {
            pulling = false
            let json = ExtractJson(error.response)
            if (json) {
              switch (json.error.code) {
                case 40009: // judging
                  console.log('judging have not complete')
                  break
                default:
                  this.$gbl.alert('danger', json.error.message)
                  this.judging = false
                  console.log(json)
              }
            } else {
              this.judging = false
              console.log(error)
            }
          })
        }, 2000)
      },
      loadSubmit(submit) {
        if (submit.language !== this.language.key) {
          this.cmOptions.mode = this.languages[submit.language].value
          this.codeMap.set(this.previousLanguage.key, this.code)
          this.previousLanguage = this.languages[submit.language]

          // change limit value
          this.problem.time_limit = this.problem.limit[submit.language].time_limit
          this.problem.memory_limit = this.problem.limit[submit.language].memory_limit
        }

        this.code = submit.source_code
      },
      submitComment(val) {
        this.$axios({
          url: join([this.$gbl.apiURL,'problems/problem',this.problemID,'comment'],'/'),
          method: 'post',
          headers: AuthHeader(),
          data: {
            ...val
          }
        }).then(response => {
          this.problem.comments.push(response.data)
        }).catch(error => {
          let json = ExtractJson(error.response)
          if (json) {
            this.$gbl.alert('danger',json.error.message)
            console.log(json)
          }else {
            this.$gbl.alert('danger','评论出错')
            console.log(error)
          }
        })
      }
    }
  }
</script>

<style>
  .compact-card-body {
    padding: 0 !important;
  }
</style>

<style lang="scss">
  .CodeMirror pre {
    color: inherit !important;
  }

  #problem-statistic {
    .echarts {
      width: 100%;
      height: 100%;
      min-height: 200px;
    }
  }

  #problem-content {
    .markdown-body {
      min-height: 0;
    }

    .v-note-panel {
      border: none;
    }

    .v-show-content {
      padding: 8px 10px 15px 10px
    }
  }

  .el-dialog__body {
    padding: 1px 20px !important;
  }

  .dark-content {
    .v-show-content {
      background: #27293d !important;

      pre {
        background: #1e1f2f
      }
    }
  }

  .success-submit {
    .card {
      border-left: 5px solid #67c23a;
    }
  }

  .fail-submit {
    .card {
      border-left: 5px solid #f56c6c;
    }
  }
</style>
