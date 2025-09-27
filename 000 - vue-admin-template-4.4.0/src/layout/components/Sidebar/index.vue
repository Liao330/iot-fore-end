<!-- 实现侧边栏菜单，包括菜单项、菜单项的激活状态、菜单背景颜色等。 -->
<!-- Logo 组件和 el-scrollbar 组件。
el-scrollbar 组件用于实现滚动条效果，内部包含了一个 el-menu 组件，用于实现菜单项的显示和交互。
el-menu 组件中使用了 v-for 指令遍历路由配置中的所有路由，并使用 SidebarItem 组件渲染菜单项。 -->
<template>
  <div :class="{ 'has-logo': showLogo }">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in routes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Logo from "./Logo";
import SidebarItem from "./SidebarItem";
import variables from "@/styles/variables.scss";

export default {
  data() {
    return {
      roleName: "", // 定义roleName属性
    };
  },
  created() {
    // 在这里获取用户信息，然后根据用户信息设置roleName的值
    this.roleName = localStorage.getItem("roleName"); // getUserRole()是获取用户角色的函数
  },
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters(["sidebar"]),
    routes() {
      // return this.$router.options.routes

      // 获取所有路由配置
      let routes = this.$router.options.routes;
      // 当前用户角色为普通用户时，过滤掉"实时状态"路由
      const roleName = this.roleName; // 获取用户角色信息
      console.info("角色名222", this.roleName);
      if (this.roleName === "普通用户") {
        routes = routes.filter(
          (route) => route.path !== "/real" && route.path !== "/info"
        );
      } else if (this.roleName === "监控员") {
        routes = routes.filter((route) => route.path !== "/info");
      } else if (this.roleName === "运维员") {
        routes.forEach((route) => {
          if (route.path === "/info") {
            route.children = route.children.filter(
              (child) => child.path !== "user"
            );
          }
        });
        console.info("过滤成功没", routes);
      }
      console.info("菜单", routes);
      return routes;
    },
    activeMenu() {
      const route = this.$route;
      const { meta, path } = route;
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu;
      }
      return path;
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo;
    },
    variables() {
      return variables;
    },
    isCollapse() {
      return !this.sidebar.opened;
    },
  },
};
</script>
