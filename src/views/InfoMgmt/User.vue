<!-- 资料管理下拉框的用户管理 -->
<template>
  <div class="wrapper">
    <!-- 搜索栏 -->
    <el-card>
      <el-row class="search">
        <el-col :span="6">
          <div class="company">
            <span class="demonstration" style="white-space: nowrap"
              >所属总公司</span
            >
            <el-select
              v-model="companyIds"
              multiple
              collapse-tags
              placeholder="请选择公司"
              class="full-width"
            >
              <!-- v-model="companyIds"是将:value即value: item.companyId,绑定给了companyId，
                后端要用companyIds去查询,查询条件companyIds要跟后端对应上 -->
              <el-option
                v-for="item in company"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="username">
            <span class="demonstration" style="white-space: nowrap"
              >用户名</span
            >
            <el-input
              v-model="username"
              placeholder="请输入用户名"
              clearable
              class="full-width"
            ></el-input>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="role">
            <span class="demonstration" style="white-space: nowrap"
              >角色名</span
            >
            <el-select
              v-model="roleName"
              collapse-tags
              placeholder="请选择角色名"
              clearable
              class="full-width"
            >
              <el-option
                v-for="item in role"
                :key="item.value"
                :label="item.label"
                :value="item.label"
              >
              </el-option>
            </el-select>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="state">
            <span class="demonstration" style="white-space: nowrap"
              >登录状态</span
            >
            <el-select
              v-model="loginStatus"
              clearable
              placeholder="请选择"
              class="full-width"
            >
              <el-option
                v-for="item in status"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <div class="time">
            <span class="demonstration">创建时间</span>
            <el-date-picker
              v-model="createdAt"
              type="daterange"
              unlink-panels="true"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
            >
            </el-date-picker>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="button-wrapper">
            <el-button
              type="primary"
              round
              @click="query"
              size="small"
              icon="el-icon-search"
              >查询</el-button
            >
            <el-button
              type="primary"
              plain
              @click="openEditUI(null)"
              size="small"
              >添加</el-button
            >
            <el-button type="primary" plain @click="moreDelete()" size="small"
              >批量删除</el-button
            >
            <el-button
              type="primary"
              plain
              @click="exportExcelSelect()"
              size="small"
              >查询导出</el-button
            >
          </div>
        </el-col>
      </el-row>
    </el-card>
    <!-- 结果列表 -->
    <el-card>
      <el-table
        id="out-table"
        ref="multipleTable"
        :data="userList"
        border="true"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :row-key="getRowKeys"
        class="el-table"
      >
        <!-- 表头数据 userList是数据 columns是列名数组-->
        <el-table-column type="selection" width="50" :reserve-selection="true">
        </el-table-column>
        <el-table-column
          v-for="(col, index) in columns"
          :key="index"
          :label="col.label"
          :prop="col.prop"
          :width="col.width"
          show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column label="登录状态" width="80">
          <template slot-scope="scope">
            <div class="button-status">
              <el-tag v-if="scope.row.loginStatus === 1" type="success"
                >在线</el-tag
              >
              <el-tag v-else type="info">离线</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90" fixed="right">
          <template slot-scope="scope">
            <div class="button-container">
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                circle="true"
                @click="openEditUI(scope.row)"
              ></el-button>
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                circle
                @click="handleDelete(scope.row)"
              ></el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 点击修改按钮弹出的对话框，dialogVisible变量控制对话框是否显示 -->
      <!-- 添加用户和修改用户，使用同一个对话框 -->
      <el-dialog
        :title="title"
        :visible="dialogVisible"
        @close="dialogVisible = false"
        width="50%"
        center
      >
        <div class="form-box">
          <el-form
            ref="userForm"
            :model="userForm"
            :rules="rules"
            label-width="80px"
          >
            <el-row>
              <!-- 用户名 -->
              <el-col :xl="20" :lg="20" :md="12" :sm="24" :xs="24">
                <el-form-item
                  label="用户名"
                  prop="username"
                  label-width="130px"
                >
                  <el-input
                    type="input"
                    v-model="userForm.username"
                    class="full-width"
                    placeholder="请输入3-30个字符的用户名"
                  ></el-input>
                </el-form-item>
              </el-col>
              <!-- 密码 -->
              <el-col :xl="20" :lg="20" :md="12" :sm="24" :xs="24">
                <!-- 修改操作时，不显示密码 -->
                <el-form-item
                  label="密码"
                  prop="password"
                  label-width="130px"
                  v-if="userForm.userId == null || userForm.userId == undefined"
                >
                  <el-input
                    type="password"
                    v-model="userForm.password"
                    class="full-width"
                  ></el-input>
                </el-form-item>
              </el-col>
              <!-- 所属总公司 -->
              <el-col :xl="20" :lg="20" :md="12" :sm="24" :xs="24">
                <el-form-item
                  label="所属总公司"
                  prop="companyId"
                  label-width="130px"
                >
                  <el-select
                    v-model="userForm.companyId"
                    collapse-tags
                    placeholder="请选择公司"
                    @change="handleCompany"
                    class="full-width"
                  >
                    <el-option
                      v-for="item in company"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <!-- 角色名 -->
              <el-col :xl="20" :lg="20" :md="12" :sm="24" :xs="24">
                <el-form-item
                  label="角色名"
                  prop="roleName"
                  label-width="130px"
                >
                  <el-select
                    v-model="userForm.roleName"
                    collapse-tags
                    placeholder="请选择角色名"
                    class="full-width"
                  >
                    <el-option
                      v-for="item in role"
                      :key="item.value"
                      :label="item.label"
                      :value="item.label"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <!-- 性别 -->
              <el-col :xl="20" :lg="20" :md="12" :sm="24" :xs="24">
                <el-form-item label="性别" prop="gender" label-width="130px">
                  <el-select v-model="userForm.gender" class="full-width">
                    <el-option key="nan" label="男" value="男"></el-option>
                    <el-option key="woman" label="女" value="女"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <!-- 手机号 -->
              <el-col :xl="20" :lg="20" :md="12" :sm="24" :xs="24">
                <el-form-item
                  label="手机号"
                  prop="phoneNumber"
                  label-width="130px"
                >
                  <el-input
                    v-model="userForm.phoneNumber"
                    class="full-width"
                    placeholder="11位数字的手机号，以1开头，第二位是3-9之间的数字。"
                  ></el-input>
                </el-form-item>
              </el-col>
              <!-- 邮箱 -->
              <el-col :xl="20" :lg="20" :md="12" :sm="24" :xs="24">
                <el-form-item label="邮箱" prop="email" label-width="130px">
                  <el-input
                    v-model="userForm.email"
                    class="full-width"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div class="btns clear-fix">
            <div>
              <el-button type="primary" @click="submitUser">确定</el-button>
              <el-button @click="cleanFrom">重置</el-button>
            </div>
          </div>
        </div>
      </el-dialog>
    </el-card>
    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
        class="pagination-right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="searchModel.pageNo"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="searchModel.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import {
  getUserList,
  updateUser,
  addUser,
  deleteUser,
  moreDelete,
  exportUser,
} from "@/api/user.js";
import { getCompany } from "@/api/company.js";
import { getRole } from "@/api/role.js";
import htmlToExcel from "@/utils/htmlToExcel";
import FileSaver from "file-saver";
export default {
  data() {
    return {
      props: { multiple: true },
      //所属总公司
      company: [],
      companyIds: "",
      //用户名
      username: "",
      userId: "",
      //角色名
      role: [],
      roleName: "",
      roleId: "",
      //登录状态
      loginStatus: "",
      status: [
        {
          value: "1",
          label: "在线",
        },
        {
          value: "0",
          label: "离线",
        },
      ],
      value: "",
      //创建时间
      createdAt: "",
      //最后登录时间
      lastLogin: "",
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      value1: "",
      value2: "",
      // 表格列表
      userList: [],
      // 表头数据
      columns: [
        {
          label: "用户名",
          prop: "username",
          width: "100",
        },
        {
          label: "所属总公司",
          prop: "companyName",
          width: "150",
        },
        {
          label: "角色名称",
          prop: "roleName",
          width: "100",
        },
        {
          label: "性别",
          prop: "gender",
          width: "70",
        },
        {
          label: "手机号",
          prop: "phoneNumber",
          width: "120",
        },
        {
          label: "邮箱",
          prop: "email",
          width: "180",
        },
        // {
        //   label: "登录状态",
        //   prop: "loginStatus",
        //   width: "100",
        // },
        {
          label: "创建时间",
          prop: "newCreatedAt",
          width: "160",
        },
        {
          label: "最后登录时间",
          prop: "lastLogin",
          width: "160",
        },
      ],
      //多选选中的数据
      multipleSelection: [],
      //列表数据总数
      total: 0,
      // 查询条件集合
      searchModel: {
        //页码
        pageNo: 1,
        //每页条数
        pageSize: 10,
      },
      //对话框，修改，添加用户
      //title: 对话框标题《添加用户》或者是《用户管理-修改》
      title: "",
      //修改添加用户对话框绑定数据
      userForm: {
        userId: "",
        username: "",
        password: "",
        companyId: "",
        roleName: "",
        gender: "",
        phoneNumber: "",
        email: "",
      },
      //对话框数据规则
      rules: {
        username: [
          { required: true, message: "必须填写用户名", trigger: "blur" },
          {
            min: 3,
            max: 30,
            message: "长度在 3 到 30 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "必须填写密码", trigger: "blur" },
          {
            min: 6,
            max: 16,
            message: "长度在 6 到 16 个字符",
            trigger: "blur",
          },
        ],
        companyId: [
          { required: true, message: "必须填写公司名", trigger: "blur" },
        ],
        gender: [{ required: false, message: "必须填写性别", trigger: "blur" }],
        roleName: [
          { required: true, message: "必须填写角色名", trigger: "blur" },
        ],
        phoneNumber: [
          { required: false, message: "必须填写手机号", trigger: "blur" },
          {
            pattern: /^1[3-9]\d{9}$/,
            message: "手机号格式不正确",
            trigger: "blur",
          },
        ],
        email: [
          { required: false, message: "必须填写邮箱", trigger: "blur" },
          { type: "email", message: "邮箱格式不正确", trigger: "blur" },
        ],
      },
      dialogVisible: false, //是否显示对话框
    };
  },
  methods: {
    // 获取登录用户id
    get() {
      this.userId = localStorage.getItem("userId");
      this.roleId = localStorage.getItem("roleId");
      this.searchModel.userId = this.userId;
      this.getCompany();
      this.getRole();
      this.getUserList();
    },
    // 所属总公司信息请求
    async getCompany() {
      let res = await getCompany(this.userId);
      if (res.code === 20000) {
        this.company = res.data.map((item) => {
          return {
            value: item.companyId,
            label: item.companyName,
          };
        });
      }
    },
    //所有角色名的信息请求
    async getRole() {
      let res = await getRole();
      if (res.code === 20000) {
        if (this.roleId == 5) {
          this.role = res.data.map((item) => {
            return {
              value: item.roleId,
              label: item.roleName,
            };
          });
        } else {
          this.role = res.data
            .filter((item) => item.roleName !== "超级管理员") // 过滤掉超级管理员
            .map((item) => {
              return {
                value: item.roleId,
                label: item.roleName,
              };
            });
        }
      }
    },
    //转换登录状态
    getLoginStatus(str) {
      return str === 1 ? "在线" : "离线";
    },

    // 转换时间格式给后端
    ChangeCreatedAt(date) {
      const startDate = new Date(date[0]);
      const endDate = new Date(date[1]);

      // 获取起始时间的ISO格式字符串并添加本地时区偏移量
      const startISOString = new Date(
        startDate.getTime() - startDate.getTimezoneOffset() * 60000
      ).toISOString();

      // 获取结束时间的ISO格式字符串并添加本地时区偏移量
      const endISOString = new Date(
        endDate.getTime() - endDate.getTimezoneOffset() * 60000 + 86399999
      ).toISOString();

      return [startISOString, endISOString];
    },
    // 转换创建时间,最后登录时间，再显示在列表里
    getTime(date) {
      let dateNow = new Date(date);
      function convert(data) {
        return data < 10 ? "0" + data : data;
      }
      let year = dateNow.getFullYear();
      let month = convert(dateNow.getMonth() + 1);
      let day = convert(dateNow.getDate());

      let hours = convert(dateNow.getHours());
      let minutes = convert(dateNow.getMinutes());
      let seconds = convert(dateNow.getSeconds());
      let dateStr =
        year +
        "-" +
        month +
        "-" +
        day +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds;
      return dateStr;
    },
    // 模糊搜索按钮
    async query() {
      this.searchModel.companyIds = this.companyIds;
      this.searchModel.username = this.username;
      this.searchModel.roleName = this.roleName;
      this.searchModel.loginStatus = this.loginStatus;
      this.searchModel.pageNo = 1;
     // console.log(this.searchModel);
      // 判断如果 createdAt 为空，则将其设置为 null
      if (!this.createdAt) {
        this.searchModel.createdAt = null;
      } else {
        this.searchModel.createdAt = this.ChangeCreatedAt(this.createdAt);
      }
      // console.log("查询按钮，查询条件");
      // console.log(this.searchModel);
      await this.getUserList();
      // this.searchModel.companyIds = null
      // this.searchModel.username=null
      // this.searchModel.roleName=null
      // this.searchModel.loginStatus=null
      // this.searchModel.createdAt=null
    },
    //获取用户列表数据
    async getUserList() {
      // console.log("能到");
      let res = await getUserList(this.searchModel);
      console.log("选择的条件参数");
      console.log(this.searchModel);
      // console.log("用户条件查询响应过来的数据列表");
      // console.log(res.data);
      //20000代表成功，rows是后端返回的总条数
      if (res.code === 20000) {
        // console.log("数据列表接收前");
        // console.log(this.userList);
        this.userList = res.data.records.map((item) => {
          if (item.createdAt != null) {
            // 在这里保存原始格式的createdAt当作请求参数，
            // 设置一个新变量newCreatedAt存储显示在列表上的时间格式，newCreatedAt当作显示数据
            item.newCreatedAt = item.createdAt;
          }
          if (item.lastLogin != null) {
            item.lastLogin = this.getTime(item.lastLogin);
          }
          return item;
        });
        // 转换userList.createdAt格式
        this.userList.forEach((item) => {
          if (item.newCreatedAt != null) {
            item.newCreatedAt = this.getTime(item.newCreatedAt);
          }
        });
        // console.log("响应数据2");
        // console.log(res);
        // console.log("数据列表赋值后");
        // console.log(this.userList);
        this.total = res.data.total;
      }
    },
    //点击添加,修改，打开对话框
    openEditUI(row) {
      if (row == null) {
        this.title = "添加用户";
        this.cleanForm(); // 清空表单数据
        this.dialogVisible = true;
      } else {
        this.title = "修改用户";
        this.dialogVisible = true;
        console.log("修改", row);
        // console.log("表单数据", this.userForm);
        //数据回显
        this.$nextTick(() => {
          this.userForm.userId = row.userId;
          this.userForm.username = row.username;
          // this.userForm.password = row.password;
          //改不了密码，获取用户列表时没有获取密码，row不带密码，可以考虑用userId去请求用户数据再赋值给userForm，就可以改密码
          this.userForm.companyId = row.companyName;
          this.userForm.roleName = row.roleName;
          this.userForm.gender = row.gender;
          this.userForm.phoneNumber = row.phoneNumber;
          this.userForm.email = row.email;
        });
        console.log("表单", this.userForm);
      }
    },
    //修改与添加用户，，对话框的提交用户内容方法
    async submitUser() {
      //触发表单验证
      this.$refs.userForm.validate(async (valid) => {
        if (valid) {
          //提交请求给后台
          try {
            let res;
            // console.info("看有没有id数据");
            // console.info(this.userForm);
            if (this.userForm.userId) {
              console.info("aaa",this.userForm);
              // 如果存在id，说明是修改操作
              res = await updateUser(this.userForm);
              if (res.code === 20000) {
                // 清空表单
                this.cleanFrom();
                // 关闭对话框
                this.dialogVisible = false;
                // 刷新用户列表
                this.getUserList();
                // 显示成功消息提示
                this.$message({
                  message: "修改成功",
                  type: "success", // 这里是消息提示的类型，success 表示操作成功
                  duration: 2000, // 显示时间毫秒数，默认3000
                });
              } else {
                // 如果有错误，也可以用 message 弹出来提示错误
                this.$message({
                  message: res.message || "修改失败，请稍后重试", // 使用接口返回的错误信息或默认错误信息
                  type: "error", // 错误类型
                  duration: 2000,
                });
              }
            } else {
              // 否则是添加用户操作
              res = await addUser(this.userForm);
              if (res.code === 20000) {
                // 清空表单
                this.cleanFrom();
                // 关闭对话框
                this.dialogVisible = false;
                // 刷新用户列表
                this.getUserList();
                // 显示成功消息提示
                this.$message({
                  message: "添加成功",
                  type: "success", // 这里是消息提示的类型，success 表示操作成功
                  duration: 2000, // 显示时间毫秒数，默认3000
                });
              } else {
                // 如果有错误，也可以用 message 弹出来提示错误
                this.$message({
                  message: res.message || "添加失败，请稍后重试", // 使用接口返回的错误信息或默认错误信息
                  type: "error", // 错误类型
                  duration: 2000,
                });
              }
            }
          } catch (error) {
            console.error(error);
            this.$message.error("请求错误，请稍后重试");
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    //对话框的重置按钮方法
    cleanFrom() {
      this.$refs["userForm"].resetFields();
    },
    //单个用户删除按钮
    async handleDelete(row) {
      // 删除操作
      // console.log("删除", row);
      //注意用反引号`您确定删除用户 ${row.username} ?`
      if (row.userId == this.userId) {
        this.$message({
          type: "warning",
          message: "不能删除自己",
          duration: 1000,
        });
        return;
      }
      this.$confirm(`您确定删除用户：${row.username} ?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          deleteUser(row.userId).then((response) => {
            this.$message({
              type: "success",
              message: "删除成功",
              duration: 2000,
            });
            this.getUserList();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
            duration: 2000,
          });
        });
    },
    //多选处理，val：当前选中的行
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    //批量删除
    async moreDelete() {
      // console.log("批量删除");
      if (this.multipleSelection.length === 0) {
        this.$message({
          type: "warning",
          message: "请选择要删除的用户",
          duration: 2000,
        });
        return;
      }
      this.$confirm("确定删除吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          moreDelete(this.multipleSelection).then((response) => {
            this.$message({
              type: "success",
              message: "删除成功",
              duration: 2000,
            });
            // 从用户列表中移除已删除的用户
            for (let i = 0; i < this.userList.length; i++) {
              for (let j = 0; j < this.multipleSelection.length; j++) {
                if (this.userList[i].id === this.multipleSelection[j].id) {
                  this.userList.splice(i, 1);
                  i--;
                  break;
                }
              }
            }
            // 重置多选框和已选用户列表
            this.multipleSelection = [];
            // 重新获取用户列表数据
            this.getUserList();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
            duration: 2000,
          });
        });
    },
    //查询导出,记得导入exportUser和FileSaver
    async exportExcelSelect() {
      console.info("导出",this.searchModel)
      const result = await exportUser(this.searchModel); // 导出所有的员工接口
      // console.info("导出", result);
      if (result) {
        FileSaver.saveAs(result, "用户管理.xlsx"); // 下载文件
      }
    },

    //每页数据
    handleSizeChange(pageSize) {
      //每页的数据数
      this.searchModel.pageSize = pageSize;
      this.getUserList();
    },
    //当前页
    handleCurrentChange(pageNo) {
      //当前页
      this.searchModel.pageNo = pageNo;
      this.getUserList();
    },
    //多选，记录选中的行id，跨页选中的行
    getRowKeys(row) {
      return row.userId;
    },
    handleCompany(value) {},
  },
  // 挂载函数，直接应用的
  mounted() {
    this.get();
  },
};
</script>

<style>
.wrapper {
  width: 100%;
}
.search {
  background-color: #fff;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between; /* 将子元素水平分布到两端 */
}

.demonstration {
  margin-right: 10px;
}
.company,
.username,
.role,
.state,
.time {
  display: flex;
  align-items: center;
  flex-flow: 1;
  margin-right: 20px;
}

.button-wrapper {
  flex-flow: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: 20px;
}
.button-container {
  display: flex;
  align-items: center;
}
.el-button {
  width: 80px;
}
.el-card {
  margin-bottom: 10px;
}
.el-pagination {
  margin-top: 10px;
}
.el-card__body {
  padding: 10px !important;
}

.pagination-container {
  text-align: center;
}

.pagination-right {
  display: inline-block;
}

/* 修改对话框中的样式 */
.btns {
  text-align: center;
}
</style>
