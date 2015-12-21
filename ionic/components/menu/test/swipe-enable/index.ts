import {App, IonicApp, Page, NavController} from 'ionic/ionic';


@Page({
  templateUrl: 'page1.html'
})
class Page1 {
  constructor(app: IonicApp) {
    this.app = app;
    this.disableSwipeMenu();
  }
  disableSwipeMenu() {
    this.app.getComponent('menu1').swipeEnable(false);
  }
}


@App({
  templateUrl: 'main.html'
})
class E2EApp {
  constructor(app: IonicApp) {
    this.app = app;
    this.rootPage = Page1;
  }
}
