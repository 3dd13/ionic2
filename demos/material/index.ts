import {Component, Directive} from 'angular2/core';

import {App, ActionSheet, IonicApp, IonicView, Register} from 'ionic/ionic';

@IonicView({
  template: '<ion-navbar *navbar primary>' +
    '<ion-title>Heading</ion-title>' +
    '<button menuToggle="menu">' +
      '<icon menu></icon>' +
    '</button>' +
    '<ion-buttons end>' +
      '<button><ion-icon md="ion-android-search" ios="ion-ios-search-strong"></i></button>' +
      '<button (click)="showMoreMenu()"><i class="icon ion-android-more-vertical"></i></button>' +
    '</ion-buttons>' +
  '</ion-navbar>' +
  '<ion-content>' +
    `
    <button md-ripple>Cleeek</button>
    <ion-list>
      <ion-item>
        <h3>All Genres</h3>
        <h4>Jan 17 2015</h4>
      </ion-item>
      <ion-item>
        Alternative
      </ion-item>
      <ion-item>
        Blues
      </ion-item>
    </ion-list>

    <div padding>
      <ion-card>
        <ion-card-header>
          New Post
        </ion-card-header>
        <div class="card-content">
          Keep close to Nature's heart... and break clear away, once in awhile, and climb a mountain or spend a week in the woods. Wash your spirit clean.
        </div>
        <img src="http://ionic-io-assets.s3.amazonaws.com/images/p4.png">
        <ion-item>
          Posted 5 days ago
        </ion-item>
      </ion-card>
    </div>

    ` +
  '</ion-content>'
})
export class FirstPage {
  constructor(app: IonicApp, actionSheet: ActionSheet) {
    this.app = app;
    this.actionSheet = actionSheet;
  }
  showMoreMenu() {
    this.actionSheet.open({
      buttons: [
        { icon: 'ion-android-share-alt', text: 'Share' },
        { icon: 'ion-arrow-move', text: 'Move' }
      ],
      destructiveText: 'Delete',
      titleText: 'Modify your album',
      cancelText: 'Cancel',
      cancel: function() {
        console.log('Canceled');
      },
      destructiveButtonClicked: () => {
        console.log('Destructive clicked');
      },
      buttonClicked: function(index) {
        console.log('Button clicked', index);
        if(index == 1) { return false; }
        return true;
      }
    }).then(actionSheetRef => {
      this.actionSheetRef = actionSheetRef;
    });

  }
}

@App({
  template: `<link href='http://fonts.googleapis.com/css?family=Roboto:400,300,700,500' rel='stylesheet' type='text/css'>
    <ion-menu id="menu" side="left" [content]="content">
      <ion-toolbar primary><ion-title>Menu</ion-title></ion-toolbar>
      <ion-list>
        <ion-item>Your Profile</ion-item>
        <ion-item>Playlists</ion-item>
        <ion-item>Artists</ion-item>
      </ion-list>
    </ion-menu>
    <ion-nav #content></ion-nav>`,
  routes: [
    {
      path: '/first',
      component: FirstPage,
      root: true
    }
  ]
})
class MyApp {
  constructor() {
  }
}
