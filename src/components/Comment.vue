<template>
  <div class="comment-container">
    <mavon-editor :value="content"
                  v-model="content"
                  @change="showCommentBtn = true"
                  defaultOpen="preview"
                  placeholder="写下你的评论"
                  :toolbars="$gbl.mdtoolbars"
                  style="z-index: auto"></mavon-editor>

    <div class="row mt-2" v-if="showCommentBtn">
      <div class="col-12 text-right">
        <el-button type="info" size="mini" @click="showCommentBtn = false">取消</el-button>
        <el-button type="primary" size="mini" v-on:click="$emit('submit',{from_id: meID,to_id: 0,for_comment: 0,content: content});content = ''">发送</el-button>
      </div>
    </div>

    <div class="comment" v-if="item.for_comment === 0" :key="index" v-for="(item,index) in comments">
      <div class="info">
        <el-popover
          placement="bottom"
          trigger="hover">
          <div class="row">
            <div class="col-12" style="min-width: 20%">
              <user-card :user="item.from"/>
            </div>
          </div>
          <img slot="reference"  class="avatar" :src="item.from.avatar" width="36" height="36"/>
        </el-popover>
        <div class="right">
          <div class="name">{{item.from.name}}</div>
          <div class="date">{{item.from.created_at}}</div>
        </div>
      </div>
      <div class="comment-preview">
        <mavon-editor :value="item.content"
                      defaultOpen="preview"
                      :toolbarsFlag=false
                      :subfield=false
                      :boxShadow=false
                      style="z-index: auto"></mavon-editor>
      </div>
      <div class="control">
        <span class="comment-reply" @click="showCommentInput(item)">
          <i class="iconfont icon-comment"></i>
          <span>回复</span>
        </span>
      </div>
      <div class="reply">
        <div class="item" :key="index" v-if="reply.for_comment === item.id" v-for="(reply,index) in comments">
          <div class="reply-content">
            <span class="from-name">{{reply.from.name}}</span><span>: </span>
            <span class="to-name">@{{reply.to.name}}</span>
            <div class="comment-preview">
              <mavon-editor :value="item.content"
                            defaultOpen="preview"
                            :toolbarsFlag=false
                            :subfield=false
                            :boxShadow=false
                            style="z-index: auto"></mavon-editor>
            </div>
          </div>
          <div class="reply-bottom">
            <span>{{reply.created_at}}</span>
            <span class="reply-text" @click="showCommentInput(item, reply)">
              <i class="iconfont icon-comment"></i>
              <span>回复</span>
            </span>
          </div>
        </div>
        <div class="write-reply" @click="showCommentInput(item)">
          <i class="el-icon-edit"></i>
          <span class="add-comment">添加新评论</span>
        </div>
        <transition name="fade">
          <div class="input-wrapper" v-if="showCommentID === item.id">
            <mavon-editor :value="content"
                          v-model="content"
                          @change="showCommentBtn = true"
                          defaultOpen="preview"
                          placeholder="写下你的评论"
                          :toolbars="$gbl.mdtoolbars"
                          style="z-index: auto"></mavon-editor>

            <div class="btn-control">
              <el-button type="info" size="mini" @click="cancel">取消</el-button>
              <el-button type="primary" size="mini"
                         v-on:click="$emit('submit',{from_id:meID,to_id: showCommentUserID,for_comment: showCommentID,content: content});showCommentID = 0">发送</el-button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
  import UserCard from "../pages/Profile/UserCard";
  export default {
    name: 'comment',
    props: {
      comments: {
        type: Array,
        required: true
      },
      meID: {
        type: Number,
        required: true
      }
    },
    components: {UserCard},
    data() {
      return {
        content: '',
        showCommentBtn: false,
        showCommentID: 0,
        showCommentUserID: 0,
      }
    },
    computed: {},
    methods: {
      cancel() {
        this.showCommentID = 0
      },

      showCommentInput(item, reply) {
        if (reply) {
          this.content = "@" + reply.from.name + " "
          this.showCommentUserID = reply.from.id
        } else {
          this.content = ''
          this.showCommentUserID = item.from.id
        }
        this.showCommentID = item.id
      }
    },
  }
</script>

<style lang="scss">
  .comment-container {
    .markdown-body {
      min-height: 0 !important;
    }

    .v-note-panel {
      border: none !important;
    }

    .v-show-content {
      padding: 1px !important;
      background: transparent !important;

      p {
        margin: 1px !important;
      }
    }
  }

  .el-popover {
    padding: 0px !important;
    border: none !important;
  }

  .comment-preview {
    .markdown-body {
      background: transparent !important;
    }
  }
</style>

<style scoped lang="scss">

  $color-main: #409EFF;
  $color-success: #67C23A;
  $color-warning: #E6A23C;
  $color-danger: #F56C6C;
  $color-info: #909399;

  $text-main: #303133;
  $text-normal: #606266;
  $text-minor: #909399;
  $text-placeholder: #C0C4CC;
  $text-333: #333;

  $border-first: #DCDFE6;
  $border-second: #E4E7ED;
  $border-third: #EBEEF5;
  $border-fourth: #F2F6FC;

  $content-bg-color: #fff;

  .comment-container {
    padding: 10px 1px;
    box-sizing: border-box;

    .comment {
      display: flex;
      flex-direction: column;
      padding: 10px;
      border-bottom: 1px solid $border-fourth;

      .info {
        display: flex;
        align-items: center;

        .avatar {
          border-radius: 50%;
        }

        .right {
          display: flex;
          flex-direction: column;
          margin-left: 10px;

          .name {
            font-size: 16px;
            color: $text-main;
            margin-bottom: 5px;
            font-weight: 500;
          }

          .date {
            font-size: 12px;
            color: $text-minor;
          }
        }
      }

      .content {
        font-size: 16px;
        color: $text-main;
        line-height: 20px;
        padding: 10px 0;
      }

      .control {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: $text-minor;

        .like {
          display: flex;
          align-items: center;
          margin-right: 20px;
          cursor: pointer;

          &.active, &:hover {
            color: $color-main;
          }

          .iconfont {
            font-size: 14px;
            margin-right: 5px;
          }
        }

        .comment-reply {
          display: flex;
          align-items: center;
          cursor: pointer;

          &:hover {
            color: $text-333;
          }

          .iconfont {
            font-size: 16px;
            margin-right: 5px;
          }
        }

      }

      .reply {
        margin: 10px 0;
        border-left: 2px solid $border-first;

        .item {
          margin: 0 10px;
          padding: 10px 0;
          border-bottom: 1px dashed $border-third;

          .reply-content {
            display: flex;
            align-items: center;
            font-size: 14px;
            color: $text-main;

            .from-name {
              color: $color-main;
            }

            .to-name {
              color: $color-main;
              margin-left: 5px;
              margin-right: 5px;
            }
          }

          .reply-bottom {
            display: flex;
            align-items: center;
            margin-top: 6px;
            font-size: 12px;
            color: $text-minor;

            .reply-text {
              display: flex;
              align-items: center;
              margin-left: 10px;
              cursor: pointer;

              &:hover {
                color: $text-333;
              }

              .icon-comment {
                margin-right: 5px;
              }
            }
          }
        }

        .write-reply {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: $text-minor;
          padding: 10px;
          cursor: pointer;

          &:hover {
            color: $text-main;
          }

          .el-icon-edit {
            margin-right: 5px;
          }
        }

        .fade-enter-active, fade-leave-active {
          transition: opacity 0.5s;
        }

        .fade-enter, .fade-leave-to {
          opacity: 0;
        }

        .input-wrapper {
          padding: 10px;

          .gray-bg-input, .el-input__inner {
            /*background-color: #67C23A;*/
          }

          .btn-control {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            padding-top: 10px;

            .cancel {
              font-size: 16px;
              color: $text-normal;
              margin-right: 20px;
              cursor: pointer;

              &:hover {
                color: $text-333;
              }
            }

            .confirm {
              font-size: 16px;
            }
          }
        }
      }
    }
  }
</style>
