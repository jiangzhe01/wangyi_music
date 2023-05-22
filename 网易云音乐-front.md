# 网易云音乐-front

> 后端接口: https://github.com/Binaryify/NeteaseCloudMusicApi
>
> 克隆后端项目: git clone https://github.com/Binaryify/NeteaseCloudMusicApi.git

## 前置知识

### 初始化项目

- 初始化工程 (vue create front)
- 下载所需第三方包 axios vant@2 
- 下载Vant自动按需引入插件 babel-plugin-import
-  在babel.config.js配置 – 看Vant文档
- 引入提前准备好的reset.css, flexible.js 到 main.js使用

### 需求分析

根据需求, 创建路由所需要的5个页面的组件

- Layout(布局, 顶部导航和底部导航) > 二级路由 Home 和 Search
- Play

创建需要的views下的页面组件4个

views/Layout/index.vue  - 负责布局(上下导航 - 中间二级路由切换首页和搜索页面)

```
// views/Layout/index.vue

/* 中间内容区域 - 容器样式(留好上下导航所占位置) */
.main {
  padding-top: 46px;
  padding-bottom: 50px;
}
```

views/Home/index.vue - 标题和歌名样式

```
// views/Home/index.vue

/* 标题 */
.title {
  padding: 0.266667rem 0.24rem;
  margin: 0 0 0.24rem 0;
  background-color: #eee;
  color: #333;
  font-size: 15px;
}
/* 推荐歌单 - 歌名 */
.song_name {
  font-size: 0.346667rem;
  padding: 0 0.08rem;
  margin-bottom: 0.266667rem;
  word-break: break-all;
  text-overflow: ellipsis;
  display: -webkit-box; /** 对象作为伸缩盒子模型显示 **/
  -webkit-box-orient: vertical; /** 设置或检索伸缩盒对象的子元素的排列方式 **/
  -webkit-line-clamp: 2; /** 显示的行数 **/
  overflow: hidden; /** 隐藏超出的内容 **/
}
```

views/Search/index.vue

```
// views/Search/index.vue

/* 搜索容器的样式 */
.search_wrap {
  padding: 0.266667rem;
}

/*热门搜索文字标题样式 */
.hot_title {
  font-size: 0.32rem;
  color: #666;
}

/* 热搜词_容器 */
.hot_name_wrap {
  margin: 0.266667rem 0;
}

/* 热搜词_样式 */
.hot_item {
  display: inline-block;
  height: 0.853333rem;
  margin-right: 0.213333rem;
  margin-bottom: 0.213333rem;
  padding: 0 0.373333rem;
  font-size: 0.373333rem;
  line-height: 0.853333rem;
  color: #333;
  border-color: #d3d4da;
  border-radius: 0.853333rem;
  border: 1px solid #d3d4da;
}
```

views/Play/index.vue

```
// views/Play/index.vue

<template>
  <div class="play">
    <!-- 模糊背景(靠样式设置), 固定定位 -->
    <div
      class="song-bg"
      :style="`background-image: url(${
        songInfo && songInfo.al && songInfo.al.picUrl
      }?imageView&thumbnail=360y360&quality=75&tostatic=0);`"
    ></div>
    <!-- 播放页头部导航 -->
    <div class="header">
      <van-icon
        name="arrow-left"
        size="20"
        class="left-incon"
        @click="$router.back()"
      />
    </div>
    <!-- 留声机 - 容器 -->
    <div class="song-wrapper">
      <!-- 留声机本身(靠css动画做旋转) -->
      <div
        class="song-turn ani"
        :style="`animation-play-state:${playState ? 'running' : 'paused'}`"
      >
        <div class="song-img">
          <!-- &&写法是为了防止报错, 有字段再继续往下访问属性 -->
          <img
            style="width: 100%"
            :src="`${
              songInfo && songInfo.al && songInfo.al.picUrl
            }?imageView&thumbnail=360y360&quality=75&tostatic=0`"
            alt=""
          />
        </div>
      </div>
      <!-- 播放按钮 -->
      <div class="start-box" @click="audioStart">
        <span class="song-start" v-show="!playState"></span>
      </div>
      <!-- 播放歌词容器 -->
      <div class="song-msg">
        <!-- 歌曲名 -->
        <h2 class="m-song-h2">
          <span class="m-song-sname"
            >{{ songInfo.name }}-{{
              songInfo && songInfo.ar && songInfo.ar[0].name
            }}</span
          >
        </h2>
        <!-- 歌词部分-随着时间切换展示一句歌词 -->
        <div class="lrcContent">
          <p class="lrc">{{ curLyric }}</p>
        </div>
      </div>
      <!-- 留声机 - 唱臂 -->
      <div class="needle" :style="`transform: rotate(${needleDeg});`"></div>
    </div>
    <!-- 播放音乐真正的标签
      看接口文档: 音乐地址需要带id去获取(但是有的歌曲可能404)
      https://binaryify.github.io/NeteaseCloudMusicApi/#/?id=%e8%8e%b7%e5%8f%96%e9%9f%b3%e4%b9%90-url
     -->
    <audio
      ref="audio"
      preload="true"
      :src="`https://music.163.com/song/media/outer/url?id=${id}.mp3`"
    ></audio>
  </div>
</template>

<script>
import { Icon } from "vant";
export default {
  components: {
    [Icon.name]: Icon,
  },
  name: "play",
  data() {
    return {
      playState: false, // 音乐播放状态(true暂停, false播放)
      id: this.$route.query.id, // 上一页传过来的音乐id
      songInfo: {}, // 歌曲信息
      lyric: {}, // 歌词枚举对象(需要在js拿到歌词写代码处理后, 按照格式保存到这个对象)
      curLyric: "", // 当前显示哪句歌词
      lastLy: "", // 记录当前播放歌词
    };
  },
  computed: {
    needleDeg() {
      // 留声机-唱臂的位置属性
      return this.playState ? "-7deg" : "-38deg";
    },
  },
  methods: {
    async getSong() {
      // 获取歌曲详情, 和歌词方法
    },
    _formatLyr(lyricStr) {},
    audioStart() {
      // 播放按钮 - 点击事件
    },
    showLyric() {},
  },
  mounted() {
    this.getSong();
    this.showLyric();
    console.log(this.$route.query.id);
  },
};
</script>

<style scoped>
.header {
  height: 50px;
}
.play {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}
.song-bg {
  background-color: #161824;
  background-position: 50%;
  background-repeat: no-repeat;
  background-size: auto 100%;
  transform: scale(1.5);
  transform-origin: center;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 100%;
  overflow: hidden;
  z-index: 1;
  opacity: 1;
  filter: blur(25px); /*模糊背景 */
}
.song-bg::before {
  /*纯白色的图片做背景, 歌词白色看不到了, 在背景前加入一个黑色半透明蒙层解决 */
  content: " ";
  background: rgba(0, 0, 0, 0.5);
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}
.song-wrapper {
  position: fixed;
  width: 247px;
  height: 247px;
  left: 50%;
  top: 50px;
  transform: translateX(-50%);
  z-index: 10001;
}
.song-turn {
  width: 100%;
  height: 100%;
  background: url("./img/bg.png") no-repeat;
  background-size: 100%;
}
.start-box {
  position: absolute;
  width: 156px;
  height: 156px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
}
.song-start {
  width: 56px;
  height: 56px;
  background: url("./img/start.png");
  background-size: 100%;
}
.needle {
  position: absolute;
  transform-origin: left top;
  background: url("./img/needle-ab.png") no-repeat;
  background-size: contain;
  width: 73px;
  height: 118px;
  top: -40px;
  left: 112px;
  transition: all 0.6s;
}
.song-img {
  width: 154px;
  height: 154px;
  position: absolute;
  left: 50%;
  top: 50%;
  overflow: hidden;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
.m-song-h2 {
  margin-top: 20px;
  text-align: center;
  font-size: 18px;
  color: #fefefe;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.lrcContent {
  margin-top: 50px;
}
.lrc {
  font-size: 14px;
  color: #fff;
  text-align: center;
}
.left-incon {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 24px;
  z-index: 10001;
  color: #fff;
}
.ani {
  animation: turn 5s linear infinite;
}
@keyframes turn {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}
</style>

```

## 路由

router/index.js - 准备路由 - 以及默认显示Layout, 然后Layout默认显示二级路由的首页

```
// router/index.js

// 路由-相关模块
import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '@/views/Layout'
import Home from '@/views/Home'
import Search from '@/views/Search'
import Play from '@/views/Play'

Vue.use(VueRouter)
const routes = [
    {
        path: '/',
        redirect: '/layout'
    },
    {
        path: '/layout',
        component: Layout,
        redirect: '/layout/home',
        children: [
            {
                path: 'home',
                component: Home,
                meta: { // meta保存路由对象额外信息的
                    title: "首页"
                }
            },
            {
                path: 'search',
                component: Search,
                meta: {
                    title: "搜索"
                }
            }
        ]
    },
    {
        path: '/play',
        component: Play
    }
]

const router = new VueRouter({
    routes
})

export default router
```

main.js - 引入路由对象, 注册到new Vue中

```
// main.js

import router from '@/router'

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
```

App.vue中留好router-view显示路由页面

```
// App.vue

<template>
  <div>
    <router-view></router-view>
  </div>
</template>
```

## Tabbar组件

1. 注册Tabbar组件, 在main.js中

   ```
   // main.js
   
   import { Tabbar, TabbarItem  } from 'vant';
   Vue.use(Tabbar);
   Vue.use(TabbarItem);
   ```

2. 在Layout.vue中使用

   ```
   // views/Layout/Layout.vue
   
   <template>
     <div>
       <div class="main">
         <!-- 二级路由-挂载点 -->
         <router-view></router-view>
       </div>
       // 标签栏支持路由模式，用于搭配 vue-router 使用。路由模式下会匹配页面路径和标签的 to 属性，并自动选中对应的标签。
       <van-tabbar route>
         <van-tabbar-item replace to="/layout/home" icon="home-o">首页</van-tabbar-item>
         <van-tabbar-item replace to="/layout/search" icon="search">搜索</van-tabbar-item>
       </van-tabbar>
     </div>
   </template>
   
   <script>
   export default {
   }
   </script>
   
   <style scoped>
   /* 中间内容区域 - 容器样式(留好上下导航所占位置) */
   .main {
     padding-top: 46px;
     padding-bottom: 50px;
   }
   </style>
   ```

## NavBar导航组件

1. main.js - 注册NavBar组件

   ```
   // main.js
   
   import { NavBar } from 'vant';
   Vue.use(NavBar);
   ```

2. 在Layout.vue页面引入navbar组件

   ```
   // views/Layout/Layout.vue
   
   <van-nav-bar title="首页" fixed />
   
   <div class="main">
     <!-- 二级路由-挂载点 -->
     <router-view></router-view>
   </div>
   ```

3. 根据路由动态显示标题内容-根据路由router/index.js中设置的元数据

   ```
   <van-nav-bar :title="首页" fixed />
   
   export default {
     name: "index",
     data() {
       return {
         activeTitle: this.$route.meta.title
       };
     },
     watch: {
       $route: {
         handler() {
           this.activeTitle = this.$route.meta.title
         }
       }
     },
     ...
   }
   ```

## 网络请求封装

> 在本地我们所有到的请求都是get方式, 至于服务器去请求网易云的资源是使用(put, post, get...)什么方式, 我们并不需要关心

1. 封装utils/request.js - 基于axios进行二次封装 - 设置基础地址

   ```
   // utils/request.js
   
   // 网络请求 - 二次封装
   import axios from 'axios'
   axios.defaults.baseURL = "http://localhost:3000"
   export default axios
   ```

2. 封装src/api/Home.js

   ```
   // src/api/Home.js
   
   // 文件名-尽量和模块页面文件名统一(方便查找)
   import request from '@/utils/request'
   
   // 首页 - 推荐歌单
   export const recommendMusic = params => request({
       url: '/personalized',
       params
       // 将来外面可能传入params的值 {limit: 20}
   })
   ```

3. 在src/api/index.js - 统一导出接口供外部使用

   ```
   // src/api/index.js
   
   // api文件夹下 各个请求模块js, 都统一来到index.js再向外导出
   import {recommendMusic} from './Home'
   
   export const recommendMusicAPI = recommendMusic // 请求推荐歌单的方法导出
   ```

## 首页

### 推荐歌单

1. 布局采用van-row和van-col 

   布局文档https://vant-contrib.gitee.io/vant/#/zh-CN/col

2. 使用vant内置的图片组件来显示图片

3. 在main.js注册使用的组件

   ```
   // main.js
   
   import { Col, Row, Image as VanImage } from 'vant';
   
   Vue.use(Col);
   Vue.use(Row);
   Vue.use(VanImage);
   ```

4. 在api/home.js下定义推荐歌单的接口方法

   ```
   // api/home.js
   
   // 首页 - 推荐歌单
   export const recommendMusic = params => request({
       url: '/personalized',
       params
       // 将来外面可能传入params的值 {limit: 20}
   })
   ```

5. 在src/api/index.js - 统一导出接口供外部使用

   ```
   // api/index.js
   
   import {recommendMusic} from './Home'
   
   export const recommendMusicAPI = recommendMusic // 请求推荐歌单的方法导出
   ```

6. 把数据请求回来, 用van-image和p标签展示推荐歌单和歌单名字

   ```
   // views/Home/Home.vue
   
   <template>
     <div>
       <p class="title">推荐歌单</p>
       <van-row gutter="6">
         <van-col span="8" v-for="obj in reList" :key="obj.id">
           <van-image width="100%" height="3rem" fit="cover" :src="obj.picUrl" />
           <p class="song_name">{{ obj.name }}</p>
         </van-col>
       </van-row>
     </div>
   </template>
   
   <script>
   import { recommendMusicAPI } from "@/api/index.js";
   
   export default {
     name: "index",
     data() {
       return {
         reList: [],
       };
     },
     async created() {
       const res = await recommendMusicAPI({
         limit: 6,
       });
       console.log(res);
       this.reList = res.data.result;
     },
     components: {},
     mounted() {},
     methods: {},
   };
   </script>
   
   <style lang="scss" scoped>
   /* 标题 */
   .title {
     padding: 0.266667rem 0.24rem;
     margin: 0 0 0.24rem 0;
     background-color: #eee;
     color: #333;
     font-size: 15px;
   }
   /* 推荐歌单 - 歌名 */
   .song_name {
     font-size: 0.346667rem;
     padding: 0 0.08rem;
     margin-bottom: 0.266667rem;
     word-break: break-all;
     text-overflow: ellipsis;
     display: -webkit-box; /** 对象作为伸缩盒子模型显示 **/
     -webkit-box-orient: vertical; /** 设置或检索伸缩盒对象的子元素的排列方式 **/
     -webkit-line-clamp: 2; /** 显示的行数 **/
     overflow: hidden; /** 隐藏超出的内容 **/
   }
   </style>
   
   ```

### 最新音乐

1. 引入van-cell使用 - 注册组件main.js中

   ```
   // main.js
   
   import {Cell, Icon} from 'vant';
   
   Vue.use(Cell);
   Vue.use(Icon)
   ```

2. 定义接口请求方法 

   ```
   // api/Home.js
   
   // 首页 - 推荐最新音乐
   export const newMusic = params => request({
       url: "/personalized/newsong",
       params
   })
   ```

3. 在src/api/index.js - 统一导出接口供外部使用

   ```
   // api/index.js
   
   import {recommendMusic, newMusic} from './Home'
   
   export const newMusicAPI = newMusic // 首页 - 最新音乐
   
   ```

4. 列表数据铺设 - 插入自定义标签

   ```
   // views/Home/Home.vue
   
   <template>
     <div>
       <p class="title">推荐歌单</p>
       <van-row gutter="6">
         <van-col span="8" v-for="obj in reList" :key="obj.id">
           <van-image width="100%" height="3rem" fit="cover" :src="obj.picUrl" />
           <p class="song_name">{{ obj.name }}</p>
         </van-col>
       </van-row>
       <p class="title">最新音乐</p>
       <van-cell
         center
         v-for="obj in songList"
         :key="obj.id"
         :title="obj.name"
         :label="obj.song.artists[0].name + ' - ' + obj.name"
       >
         <template #right-icon>
           <van-icon name="play-circle-o" size="0.6rem" />
         </template>
       </van-cell>
     </div>
   </template>
   
   <script>
   import { recommendMusicAPI, newMusicAPI } from "@/api";
   
   export default {
     name: "index",
     data() {
       return {
         reList: [], // 推荐歌单数据
         songList: [], // 最新音乐数据
       };
     },
     async created() {
       const res = await recommendMusicAPI({
         limit: 6,
       });
       console.log(res);
       this.reList = res.data.result;
   
       const res2 = await newMusicAPI({
         limit: 20,
       });
       console.log(res2);
       this.songList = res2.data.result;
     },
     components: {},
     mounted() {},
     methods: {},
   };
   </script>
   
   <style lang="scss" scoped>
   /* 标题 */
   .title {
     padding: 0.266667rem 0.24rem;
     margin: 0 0 0.24rem 0;
     background-color: #eee;
     color: #333;
     font-size: 15px;
   }
   /* 推荐歌单 - 歌名 */
   .song_name {
     font-size: 0.346667rem;
     padding: 0 0.08rem;
     margin-bottom: 0.266667rem;
     word-break: break-all;
     text-overflow: ellipsis;
     display: -webkit-box; /** 对象作为伸缩盒子模型显示 **/
     -webkit-box-orient: vertical; /** 设置或检索伸缩盒对象的子元素的排列方式 **/
     -webkit-line-clamp: 2; /** 显示的行数 **/
     overflow: hidden; /** 隐藏超出的内容 **/
   }
   </style>
   
   ```


## 搜索

### 搜索页面

1. 注册van-search组件

   ```
   // main.js
   
   import { Search } from "vant";
   Vue.use(Search)
   
   ```

2. 准备搜索界面标签

   ```
   // views/Search/index.vue
   
   <template>
     <div>
       <van-search shape="round" placeholder="请输入搜索关键词" />
       <!-- 搜索下容器 -->
       <div class="search_wrap">
         <!-- 标题 -->
         <p class="hot_title">热门搜索</p>
         <!-- 热搜关键词容器 -->
         <div class="hot_name_wrap">
           <!-- 每个搜索关键词 -->
           <span class="hot_item">热搜关键字</span>
         </div>
       </div>
     </div>
   </template>
   <script>
   export default {};
   </script>
   
   <style scoped>
   /* 搜索容器的样式 */
   .search_wrap {
     padding: 0.266667rem;
   }
   
   /*热门搜索文字标题样式 */
   .hot_title {
     font-size: 0.32rem;
     color: #666;
   }
   
   /* 热搜词_容器 */
   .hot_name_wrap {
     margin: 0.266667rem 0;
   }
   
   /* 热搜词_样式 */
   .hot_item {
     display: inline-block;
     height: 0.853333rem;
     margin-right: 0.213333rem;
     margin-bottom: 0.213333rem;
     padding: 0 0.373333rem;
     font-size: 0.373333rem;
     line-height: 0.853333rem;
     color: #333;
     border-color: #d3d4da;
     border-radius: 0.853333rem;
     border: 1px solid #d3d4da;
   }
   
   /* 给单元格设置底部边框 */
   .van-cell {
     border-bottom: 1px solid lightgray;
   }
   </style>
   
   ```

3. api/Search.js - 定义热门搜索接口方法和搜索结果方法

   ```
   // api/Seearch.js
   
   // 搜索模块
   import request from '@/utils/request'
   
   // 热搜关键字
   export const hotSearch = params => request({
       url: '/search/hot',
       params
   })
   
   // 搜索结果
   export const searchResultList = params => request({
       url: '/cloudsearch',
       params
   })
   ```

4. api/index.js - 导入使用并统一导出

   ```
   // api/index.js
   
   // 统一出口
   // 你也可以在逻辑页面里.vue中直接引入@/api/Home下的网络请求工具方法
   // 为什么: 我们可以把api所有的方法都统一到一处. 
   
   import {recommendMusic, hotMusic} from '@/api/Home'
   import {hotSearch, searchResult} from '@/api/Search'
   
   
   export const recommendMusicAPI = recommendMusic // 把网络请求方法拿过来 导出
   export const hotMusicAPI = hotMusic // 把获取最新音乐的, 网络请求方法导出
   
   export const hotSearchAPI = hotSearch // 热搜
   export const searchResultAPI = searchResult // 搜索结果
   ```

5. created中请求接口-拿到热搜关键词列表

   ```
   // views/Search/index.vue
   
   <template>
     <div>
       <van-search shape="round" placeholder="请输入搜索关键词" />
       <!-- 搜索下容器 -->
       <div class="search_wrap">
         <!-- 标题 -->
         <p class="hot_title">热门搜索</p>
         <!-- 热搜关键词容器 -->
         <div class="hot_name_wrap">
           <!-- 每个搜索关键词 -->
           <span class="hot_item" v-for="(obj, index) in hotArr" :key="index">{{
             obj.first
           }}</span>
         </div>
       </div>
     </div>
   </template>
   <script>
   import { hotSearchAPI } from "@/api";
   export default {
     data() {
       return {
         hotArr: [],
       };
     },
     async created() {
       const res = await hotSearchAPI();
       console.log(res);
       this.hotArr = res.data.result.hots;
     },
   };
   </script>
   
   ```

6. 点击热词填充到输入框

   ```
   // views/Search/index.vue
   
   <template>
     <div>
       <van-search shape="round" v-model="value" placeholder="请输入搜索关键词" />
       <!-- 搜索下容器 -->
       <div class="search_wrap">
         <!-- 标题 -->
         <p class="hot_title">热门搜索</p>
         <!-- 热搜关键词容器 -->
         <div class="hot_name_wrap">
           <!-- 每个搜索关键词 -->
           <span class="hot_item" v-for="(obj, index) in hotArr" :key="index" @click="fn(obj.first)">{{
             obj.first
           }}</span>
         </div>
       </div>
     </div>
   </template>
   <script>
   import { hotSearchAPI } from "@/api";
   export default {
     data() {
       return {
         value: "",
         hotArr: [],
       };
     },
     async created() {
       const res = await hotSearchAPI();
       console.log(res);
       this.hotArr = res.data.result.hots;
     },
   
     methods: {
       async fn(val) {
         // 点击热搜关键词
         this.value = val; // 选中的关键词显示到搜索框
       },
     },
   };
   </script>
   ```

### 点击热词-搜索结果

1. 点击 - 获取搜索结果 - 循环铺设页面

   ```
   // views/Search/index.vue
   
   <template>
     <div>
       <van-search shape="round" v-model="value" placeholder="请输入搜索关键词" />
       <!-- 搜索下容器 -->
       <div class="search_wrap">
         <!-- 标题 -->
         <p class="hot_title">热门搜索</p>
         <!-- 热搜关键词容器 -->
         <div class="hot_name_wrap">
           <!-- 每个搜索关键词 -->
           <span
             class="hot_item"
             @click="fn(obj.first)"
             v-for="(obj, index) in hotArr"
             :key="index"
             >{{ obj.first }}</span
           >
         </div>
       </div>
       <!-- 搜索结果 -->
       <div class="search_wrap">
         <!-- 标题 -->
         <p class="hot_title">最佳匹配</p>
         <van-cell
           center
           v-for="obj in resultList"
           :key="obj.id"
           :title="obj.name"
           :label="obj.ar[0].name + ' - ' + obj.name"
         >
           <template #right-icon>
             <van-icon name="play-circle-o" size="0.6rem" />
           </template>
         </van-cell>
       </div>
     </div>
   </template>
   <script>
   import { hotSearchAPI, searchResultListAPI } from "@/api";
   export default {
     data() {
       return {
         value: "",
         hotArr: [],
         resultList: [],
       };
     },
     async created() {
       const res = await hotSearchAPI();
       console.log(res);
       this.hotArr = res.data.result.hots;
     },
   
     methods: {
       async fn(val) {
         // 点击热搜关键词
         this.value = val; // 选中的关键词显示到搜索框
         const res = await this.getListFn();
         console.log(res);
         this.resultList = res.data.result.songs;
       },
       async getListFn() {
         return await searchResultListAPI({
           keywords: this.value,
           limit: 20,
         }); // 把搜索结果return出去
         // (难点):
         // async修饰的函数 -> 默认返回一个全新Promise对象
         // 这个Promise对象的结果就是async函数内return的值
         // 拿到getListFn的返回值用await提取结果
       },
     },
   };
   </script>
   
   ```

2. 互斥显示, 热搜关键词和搜索结果列表

   ```
   // views/Search/index.vue
   
   <!-- 搜索下容器 -->
       <div class="search_wrap" v-if="resultList.length == 0">
         <!-- 标题 -->
         <p class="hot_title">热门搜索</p>
         <!-- 热搜关键词容器 -->
         <div class="hot_name_wrap">
           <!-- 每个搜索关键词 -->
           <span
             class="hot_item"
             @click="fn(obj.first)"
             v-for="(obj, index) in hotArr"
             :key="index"
             >{{ obj.first }}</span
           >
         </div>
       </div>
       <!-- 搜索结果 -->
       <div class="search_wrap" v-else>
         <!-- 标题 -->
         <p class="hot_title">最佳匹配</p>
         <van-cell
           center
           v-for="obj in resultList"
           :key="obj.id"
           :title="obj.name"
           :label="obj.ar[0].name + ' - ' + obj.name"
         >
           <template #right-icon>
             <van-icon name="play-circle-o" size="0.6rem" />
           </template>
         </van-cell>
       </div>
   ```

### 输入框-搜索结果

1. 绑定@input事件在van-search上

   ```
   // views/Search/index.vue
   
   <van-search shape="round" v-model="value" placeholder="请输入搜索关键词" @input="inputFn"/>
   ```

2. 实现输入框改变 - 获取搜索结果铺设

   ```
   // views/Search/index.vue
   
   async inputFn() {
       // 输入框值改变
       if (this.value.length === 0) {
           // 搜索关键词如果没有, 就把搜索结果清空阻止网络请求发送(提前return)
           this.resultList = [];
           return;
       }
       const res = await this.getListFn();
       console.log(res);
       // 如果搜索结果响应数据没有songs字段-无数据
       if (res.data.result.songs === undefined) {
           this.resultList = [];
           return;
       }
       this.resultList = res.data.result.songs;
   },
   ```

### 搜索结果-加载更多

1. 注册van-list组件

   ```
   // main.js
   
   import { Search, List } from "vant";
   
   Vue.use(List)
   ```

2. 设置van-list组件实现相应的属性和方法, 让page++去请求下页数据

   ```
   // views/Search/index.vue
   
   <van-list
     v-model="loading"
     :finished="finished"
     finished-text="没有更多了"
     @load="onLoad"
   >
     <van-cell
       center
       v-for="obj in resultList"
       :key="obj.id"
       :title="obj.name"
       :label="obj.ar[0].name + ' - ' + obj.name"
     >
       <template #right-icon>
         <van-icon name="play-circle-o" size="0.6rem" />
       </template>
     </van-cell>
   </van-list>
   
   export default {
     data() {
       return {
         value: "",
         hotArr: [], // 热搜关键字
         resultList: [], // 搜索结果
         loading: false, // 加载中 (状态) - 只有为false, 才能触底后自动触发onload方法
         finished: false, // 未加载全部 (如果设置为true, 底部就不会再次执行onload, 代表全部加载完成)
         page: 1, // 当前搜索结果的页码
       };
     },
     // ...省略其他
     methods: {
       async getListFn() {
         return await searchResultListAPI({
           keywords: this.value,
           limit: 20,
           offset: (this.page - 1) * 20, // 固定公式
         }); // 把搜索结果return出去
         // (难点):
         // async修饰的函数 -> 默认返回一个全新Promise对象
         // 这个Promise对象的结果就是async函数内return的值
         // 拿到getListFn的返回值用await提取结果
       },
       async onLoad() {
         // 触底事件(要加载下一页的数据咯), 内部会自动把loading改为true
         this.page++;
         const res = await this.getListFn();
         
         this.resultList = [...this.resultList, ...res.data.result.songs];
         this.loading = false; // 数据加载完毕-保证下一次还能触发onload
       },
     },
   };
   ```

3. 无数据/只有一页数据, finished为true

   ```
   // views/Search/index.vue
   
   methods: {
     async fn(val) {
       // 点击热搜关键词
       this.finished = false
       this.value = val; // 选中的关键词显示到搜索框
       const res = await this.getListFn();
       this.resultList = res.data.result.songs;
       this.loading = false
     },
     async getListFn() {
       return await searchResultListAPI({
         keywords: this.value,
         limit: 20,
         offset: (this.page - 1) * 20, // 固定公式
       }); // 把搜索结果return出去
       // (难点):
       // async修饰的函数 -> 默认返回一个全新Promise对象
       // 这个Promise对象的结果就是async函数内return的值
       // 拿到getListFn的返回值用await提取结果
     },
     async onLoad() {
       // 触底事件(要加载下一页的数据咯), 内部会自动把loading改为true
       this.page++;
       const res = await this.getListFn();
       if (res.data.result.songs === undefined) {
         // 没有更多数据了
         this.finished = true; // 全部加载完成(list不会在触发onload方法)
         this.loading = false; // 本次加载完成
         return;
       }
       this.resultList = [...this.resultList, ...res.data.result.songs];
       this.loading = false; // 数据加载完毕-保证下一次还能触发onload
       console.log(res);
       // this.finished = true
     },
     async inputFn() {
       this.finished = false
       // 输入框值改变
       if (this.value.length === 0) {
         // 搜索关键词如果没有, 就把搜索结果清空阻止网络请求发送(提前return)
         this.resultList = [];
         return;
       }
       const res = await this.getListFn();
       // 如果搜索结果响应数据没有songs字段-无数据
       if (res.data.result.songs === undefined) {
         this.resultList = [];
         return;
       }
       // 如果搜索结果响应数据没有songs字段-无数据
       if (res.data.result.songs === undefined) {
         this.resultList = [];
         return;
       }
       this.resultList = res.data.result.songs;
       this.loading = false
     },
   }
   ```

### 输入框-防抖

防止输入框输入后快速删除, 而网络请求异步耗时 – 数据回来后还是铺设到页面上

添加定时器

```
// views/Search/index.vue

async inputFn() {
    // 目标: 输入框改变-逻辑代码-慢点执行
    // 解决: 防抖
    // 概念: 计时n秒, 最后执行一次, 如果再次触发, 重新计时
    // 效果: 用户在n秒内不触发这个事件了, 才会开始执行逻辑代码
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(async () => {
        this.finished = false; // 输入框关键字改变-可能有新数据(不一定加载完成了)
        // 输入框值改变
        if (this.value.length === 0) {
            // 搜索关键词如果没有, 就把搜索结果清空阻止网络请求发送(提前return)
            this.resultList = [];
            return;
        }
        const res = await this.getListFn();
        console.log(res);
        // 如果搜索结果响应数据没有songs字段-无数据
        if (res.data.result.songs === undefined) {
            this.resultList = [];
            return;
        }
        this.resultList = res.data.result.songs;
        this.loading = false;
    }, 900);
},
```

### 页码bug修复

加载更多时, page已经往后计数了. 重新获取时, page从第一页获取的

修改this.page

```
// views/Search/index.vue

async fn(val) {
  // 点击热搜关键词
  this.page = 1;
  this.finished = false;
  this.value = val; // 选中的关键词显示到搜索框
  const res = await this.getListFn();
  this.resultList = res.data.result.songs;
  this.loading = false;
},
async inputFn() {
  // 目标: 输入框改变-逻辑代码-慢点执行
  // 解决: 防抖
  // 概念: 计时n秒, 最后执行一次, 如果再次触发, 重新计时
  // 效果: 用户在n秒内不触发这个事件了, 才会开始执行逻辑代码
  if (this.timer) clearTimeout(this.timer);
  this.timer = setTimeout(async () => {
    this.page = 1;
    this.finished = false; // 输入框关键字改变-可能有新数据(不一定加载完成了)
    // 输入框值改变
    if (this.value.length === 0) {
      // 搜索关键词如果没有, 就把搜索结果清空阻止网络请求发送(提前return)
      this.resultList = [];
      return;
    }
    const res = await this.getListFn();
    console.log(res);
    // 如果搜索结果响应数据没有songs字段-无数据
    if (res.data.result.songs === undefined) {
      this.resultList = [];
      return;
    }
    this.resultList = res.data.result.songs;
    this.loading = false;
  }, 900);
}
```

## SongItem封装

1. 创建src/components/SongItem.vue

   ```
   // src/components/SongItem.vue
   
   <template>
     <van-cell center :title="name" :label="author + ' - ' + name">
       <template #right-icon>
         <van-icon name="play-circle-o" size="0.6rem"/>
       </template>
     </van-cell>
   </template>
   
   <script>
   export default {
     props: {
       name: String, // 歌名
       author: String, // 歌手
       id: Number, // 歌曲id (标记这首歌曲-为将来跳转播放页做准备)
     }
   };
   </script>
   
   <style scoped>
   /* 给单元格设置底部边框 */
   .van-cell {
     border-bottom: 1px solid lightgray;
   }
   </style>
   ```

2. Home/index.vue - 重构

   ```
   // views/Home/index.vue
   
   <SongItemVue v-for="obj in songList"
       :key="obj.id"
       :name="obj.name"
       :author="obj.song.artists[0].name"
       :id="obj.id"
   ></SongItemVue>
   
   <script>
   import SongItemVue from "../../components/SongItem.vue";
   
   </script>
   ```

3. Search/index.vue - 重构

   ```
   <SongItemVue
             v-for="obj in resultList"
             :key="obj.id"
             :name="obj.name"
             :author="obj.ar[0].name"
             :id="obj.id"
   ></SongItemVue>
   
   <script>
   import SongItemVue from "../../components/SongItem.vue";
   
   </script>
   ```

## 播放音乐

1. 组件SongItem里 – 点击事件

   ```
   // components/SongItem.vue
   
   <van-icon name="play-circle-o" size="0.6rem" @click="playFn" />
   
   <script>
   export default {
   
     methods: {
       playFn() {
         this.$router.push({
           path: "/play",
           query: {
             id: this.id, // 歌曲id, 通过路由跳转传递过去
           },
         });
       },
     },
   };
   </script>
   
   <style scoped>
   /* 给单元格设置底部边框 */
   .van-cell {
     border-bottom: 1px solid lightgray;
   }
   </style>
   
   ```

2. api/Play.js  – 接口方法

   ```
   // api/Play.js
   
   import request from '../utils/request'
   
   // 播放页 - 获取歌曲详情
   export const getSongById = (id) => request({
     url: `/song/detail?ids=${id}`,
     method: "GET"
   })
   
   // 播放页 - 获取歌词
   export const getLyricById = (id) => request({
     url: `/lyric?id=${id}`,
     method: "GET"
   })
   
   
   ```

3. api/index.js - 导入使用并统一导出

   ```
   // api/index.js
   
   import {getSongById, getLyricById} from './Play'
   
   export const getSongByIdAPI = getSongById // 歌曲 - 播放地址
   export const getLyricByIdAPI = getLyricById // 歌曲 - 歌词数据
   ```

4. Play页面

   ```
   // views/Play/index.vue
   
   <template>
     <div class="play">
       <!-- 模糊背景(靠样式设置), 固定定位 -->
       <div
         class="song-bg"
         :style="`background-image: url(${
           songInfo && songInfo.al && songInfo.al.picUrl
         }?imageView&thumbnail=360y360&quality=75&tostatic=0);`"
       ></div>
       <!-- 播放页头部导航 -->
       <div class="header">
         <van-icon
           name="arrow-left"
           size="20"
           class="left-incon"
           @click="$router.back()"
         />
       </div>
       <!-- 留声机 - 容器 -->
       <div class="song-wrapper">
         <!-- 留声机本身(靠css动画做旋转) -->
         <div
           class="song-turn ani"
           :style="`animation-play-state:${playState ? 'running' : 'paused'}`"
         >
           <div class="song-img">
             <!-- &&写法是为了防止报错, 有字段再继续往下访问属性 -->
             <img
               style="width: 100%"
               :src="`${
                 songInfo && songInfo.al && songInfo.al.picUrl
               }?imageView&thumbnail=360y360&quality=75&tostatic=0`"
               alt=""
             />
           </div>
         </div>
         <!-- 播放按钮 -->
         <div class="start-box" @click="audioStart">
           <span class="song-start" v-show="!playState"></span>
         </div>
         <!-- 播放歌词容器 -->
         <div class="song-msg">
           <!-- 歌曲名 -->
           <h2 class="m-song-h2">
             <span class="m-song-sname"
               >{{ songInfo.name }}-{{
                 songInfo && songInfo.ar && songInfo.ar[0].name
               }}</span
             >
           </h2>
           <!-- 歌词部分-随着时间切换展示一句歌词 -->
           <div class="lrcContent">
             <p class="lrc">{{ curLyric }}</p>
           </div>
         </div>
         <!-- 留声机 - 唱臂 -->
         <div class="needle" :style="`transform: rotate(${needleDeg});`"></div>
       </div>
       <!-- 播放音乐真正的标签
         看接口文档: 音乐地址需要带id去获取(但是有的歌曲可能404)
         https://binaryify.github.io/NeteaseCloudMusicApi/#/?id=%e8%8e%b7%e5%8f%96%e9%9f%b3%e4%b9%90-url
        -->
       <audio
         ref="audio"
         preload="true"
         :src="`https://music.163.com/song/media/outer/url?id=${id}.mp3`"
       ></audio>
     </div>
   </template>
   
   <script>
   // 获取歌曲详情和 歌曲的歌词接口
   import { getSongByIdAPI, getLyricByIdAPI } from '@/api'
   import { Icon } from 'vant'
   export default {
     components: {
       [Icon.name]: Icon,
     },
     name: 'play',
     data() {
       return {
         playState: false, // 音乐播放状态(true暂停, false播放)
         id: this.$route.query.id, // 上一页传过来的音乐id
         songInfo: {}, // 歌曲信息
         lyric: {}, // 歌词枚举对象(需要在js拿到歌词写代码处理后, 按照格式保存到这个对象)
         curLyric: '', // 当前显示哪句歌词
         lastLy: '' // 记录当前播放歌词
       }
     },
     computed: {
       needleDeg() { // 留声机-唱臂的位置属性
         return this.playState ? '-7deg' : '-38deg'
       }
     },
     methods: {
       async getSong() { // 获取歌曲详情, 和歌词方法
         const res = await getSongByIdAPI(this.id)
         this.songInfo = res.data.songs[0]
         // 获取-并调用_formatLyr方法, 处理歌词
         const lyrContent = await getLyricByIdAPI(this.id)
         const lyricStr = lyrContent.data.lrc.lyric
         this.lyric = this._formatLyr(lyricStr)
         // 初始化完毕先显示零秒歌词
         this.curLyric = this.lyric[0]
       },
       _formatLyr(lyricStr) {
         // 可以看network观察歌词数据是一个大字符串, 进行拆分.
         let reg = /\[.+?\]/g //
         let timeArr = lyricStr.match(reg) // 匹配所有[]字符串以及里面的一切内容, 返回数组
         console.log(timeArr); // ["[00:00.000]", "[00:01.000]", ......]
         let contentArr = lyricStr.split(/\[.+?\]/).slice(1) // 按照[]拆分歌词字符串, 返回一个数组(下标为0位置元素不要,后面的留下所以截取)
         console.log(contentArr);
         let lyricObj = {} // 保存歌词的对象, key是秒, value是显示的歌词
         timeArr.forEach((item, index) => {
           // 拆分[00:00.000]这个格式字符串, 把分钟数字取出, 转换成秒
           let ms = item.split(':')[0].split('')[2] * 60
           // 拆分[00:00.000]这个格式字符串, 把十位的秒拿出来, 如果是0, 去拿下一位数字, 否则直接用2位的值
           let ss = item.split(':')[1].split('.')[0].split('')[0] === '0' ? item.split(':')[1].split('.')[0].split('')[1] : item.split(':')[1].split('.')[0]
           // 秒数作为key, 对应歌词作为value
           lyricObj[ms + Number(ss)] = contentArr[index]
         })
         // 返回得到的歌词对象(可以打印看看)
         console.log(lyricObj);
         return lyricObj
       },
       audioStart() { // 播放按钮 - 点击事件
         if (!this.playState) { // 如果状态为false
           this.$refs.audio.play() // 调用audio标签的内置方法play可以继续播放声音
         } else {
           this.$refs.audio.pause() // 暂停audio的播放
         }
         this.playState = !this.playState // 点击设置对立状态
       },
       showLyric() {
         // 监听播放audio进度, 切换歌词显示
         this.$refs.audio.addEventListener('timeupdate', () => {
           let curTime = Math.floor(this.$refs.audio.currentTime)
           // 避免空白出现
           if (this.lyric[curTime]) {
             this.curLyric = this.lyric[curTime]
             this.lastLy = this.curLyric
           } else {
             this.curLyric = this.lastLy
           }
         })
       }
     },
     mounted() {
       this.getSong()
       this.showLyric()
       console.log(this.$route.query.id);
     }
   }
   </script>
   
   <style scoped>
   .header {
     height: 50px;
   }
   .play {
     position: fixed;
     top: 0;
     left: 0;
     right: 0;
     bottom: 0;
     z-index: 1000;
   }
   .song-bg {
     background-color: #161824;
     background-position: 50%;
     background-repeat: no-repeat;
     background-size: auto 100%;
     transform: scale(1.5);
     transform-origin: center;
     position: fixed;
     left: 0;
     right: 0;
     top: 0;
     height: 100%;
     overflow: hidden;
     z-index: 1;
     opacity: 1;
     filter: blur(25px); /*模糊背景 */
   }
   .song-bg::before{ /*纯白色的图片做背景, 歌词白色看不到了, 在背景前加入一个黑色半透明蒙层解决 */
     content: " ";
     background: rgba(0, 0, 0, 0.5);
     position: absolute;
     left: 0;
     top: 0;
     right: 0;
     bottom:0;
   }
   .song-wrapper {
     position: fixed;
     width: 247px;
     height: 247px;
     left: 50%;
     top: 50px;
     transform: translateX(-50%);
     z-index: 10001;
   }
   .song-turn {
     width: 100%;
     height: 100%;
     background: url("./img/bg.png") no-repeat;
     background-size: 100%;
   }
   .start-box {
     position: absolute;
     width: 156px;
     height: 156px;
     position: absolute;
     left: 50%;
     top: 50%;
     transform: translate(-50%, -50%);
     display: flex;
     justify-content: center;
     align-items: center;
   }
   .song-start {
     width: 56px;
     height: 56px;
     background: url("./img/start.png");
     background-size: 100%;
   }
   .needle {
     position: absolute;
     transform-origin: left top;
     background: url("./img/needle-ab.png") no-repeat;
     background-size: contain;
     width: 73px;
     height: 118px;
     top: -40px;
     left: 112px;
     transition: all 0.6s;
   }
   .song-img {
     width: 154px;
     height: 154px;
     position: absolute;
     left: 50%;
     top: 50%;
     overflow: hidden;
     border-radius: 50%;
     transform: translate(-50%, -50%);
   }
   .m-song-h2 {
     margin-top: 20px;
     text-align: center;
     font-size: 18px;
     color: #fefefe;
     overflow: hidden;
     white-space: nowrap;
     text-overflow: ellipsis;
   }
   .lrcContent {
     margin-top: 50px;
   }
   .lrc {
     font-size: 14px;
     color: #fff;
     text-align: center;
   }
   .left-incon {
     position: absolute;
     top: 10px;
     left: 10px;
     font-size: 24px;
     z-index: 10001;
     color: #fff;
   }
   .ani {
     animation: turn 5s linear infinite;
   }
   @keyframes turn {
     0% {
       -webkit-transform: rotate(0deg);
     }
     100% {
       -webkit-transform: rotate(360deg);
     }
   }
   </style>
   
   ```

## vant适配

1. 下载postcss和==postcss-pxtorem@5.1.1==

   postcss作用: 是对css代码做降级处理

   postcss-pxtorem: 自动把所有代码里的css样式的px, 自动转rem

2. 新建src/postcss.config.js

   ```
   // src/postcss.config.js
   
   module.exports = {
     plugins: {
       'postcss-pxtorem': {
         // 能够把所有元素的px单位转成Rem
         // rootValue: 转换px的基准值。
         // 例如一个元素宽是75px，则换成rem之后就是2rem。
         rootValue: 37.5,
         propList: ['*']
       }
     }
   }
   ```

   

