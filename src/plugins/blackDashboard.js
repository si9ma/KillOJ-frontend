import SideBar from "@/components/SidebarPlugin";
import Notify from "@/components/NotificationPlugin";
import GlobalComponents from "./globalComponents";
import GlobalDirectives from "./globalDirectives";
import RTLPlugin from "./RTLPlugin";
import Theme from "./theme";
import Global from "./global";
import Axios from "./axios";

//css assets
import "@/assets/sass/black-dashboard.scss";
import "@/assets/css/nucleo-icons.css";
import "@/assets/demo/demo.css";

export default {
  install(Vue) {
    Vue.use(GlobalComponents);
    Vue.use(GlobalDirectives);
    Vue.use(SideBar);
    Vue.use(Notify);
    Vue.use(RTLPlugin);
    Vue.use(Theme);
    Vue.use(Global);
    Vue.use(Axios);
  }
}
