import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "@/mobile/flexible"; // 适配
import "@/assets/styles/reset.css"; // 初始化样式

import { Tabbar, TabbarItem } from "vant";
import { NavBar } from "vant";
import { Col, Row, Image as VanImage } from "vant";
import { Cell, Icon } from "vant";
import { Search, List } from "vant";

Vue.use(Tabbar);
Vue.use(TabbarItem);
Vue.use(NavBar);
Vue.use(Cell);
Vue.use(Col);
Vue.use(Icon);
Vue.use(Row);
Vue.use(VanImage);
Vue.use(Search)
Vue.use(List)

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
