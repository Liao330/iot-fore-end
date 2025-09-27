<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <!-- <span class="title">公司名</span> -->
          <!-- 顶部导航的图片链接是在用户信息请求成功后通过Vuex存储在avatar中。
            使用了<img :src="avatar" class="user-avatar">来显示用户头像，
            这个:src绑定的值就是从Vuex中获取的avatar链接。
            当用户信息请求成功后，avatar中存储的图片链接会被展示在顶部导航的用户头像位置。 -->
          <img :src="avatar" class="user-avatar">
          <!-- <img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar"> -->
          <span class="user-name">{{ userInfo.username }}</span>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <el-dropdown-item>
            <span style="display:block;" @click="logout">退出登录</span>
          </el-dropdown-item> 
        </el-dropdown-menu> 
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { getInfo,logout } from '@/api/user'

export default {
  data() {
    return {
      userInfo: {} // 初始化为空对象,用于存储用户信息
    };
  },
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'username'
    ]),
    avatar() {
      return this.$store.getters.avatar;
    },
    username(){
      return this.$store.getters.username;
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    //用户信息请求
    async getInfo() {
      const token = this.$store.state.user.token;
      let res = await getInfo(token);
      console.log(res.data.avatar);
      if (res.code === 20000) {
        this.userInfo = res.data; // 将用户信息赋值给userInfo
        console.log("用户信息：");
        console.log(this.userInfo);
        this.$store.commit('user/SET_AVATAR', res.data.avatar);
      }
    },
    //退出登录
    async logout() {
      console.log('执行了退出登录方法')
      //退出登录业务逻辑
      let res = await logout(this.userInfo);
      if (res.code === 20000) {
        this.$message({
          message: "退出登录成功",
          type: "success",
        });
        console.log('准备执行 logout action 方法')
        this.$store.dispatch('user/logout')
      }
      // 注销时删除所有tagview标签页导航
      await this.$store.dispatch('tagsView/delAllViews')
      sessionStorage.removeItem('tabViews')

    },
  },
  async mounted() {
    await this.getInfo();
    this.$store.commit('SET_NAME', this.userInfo.username);
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        // position: relative;
        display: flex; // 使用Flexbox布局
        align-items: center; // 垂直居中

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          margin-right: 8px; // 添加右边距
        }
        .user-name {
          display: inline-block;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          // position: absolute;
          // right: -20px;
          // top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
