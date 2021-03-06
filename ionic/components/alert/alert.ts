import {Component, ElementRef, Renderer} from 'angular2/core';
import {NgClass, NgIf, NgFor} from 'angular2/common';

import {NavParams} from '../nav/nav-controller';
import {ViewController} from '../nav/view-controller';
import {Config} from '../../config/config';
import {Animation} from '../../animations/animation';
import {isDefined} from '../../util/util';


/**
 * @name Alert
 * @description
 * An Alert is a dialog that presents users with either information, or used
 * to receive information from the user using inputs. An alert appears on top
 * of the app's content, and must be manually dismissed by the user before
 * they can resume interaction with the app.
 *
 * An alert is created from an array of `buttons` and optionally an array of
 * `inputs`. Each button includes properties for its `text`, and optionally a
 * `handler`. If a handler returns `false` then the alert will not be dismissed.
 * An alert can also optionally have a `title`, `subTitle` and `body`.
 *
 * All buttons will show up in the order they have been added to the `buttons`
 * array, from left to right. Note: The right most button (the last one in the
 * array) is the main button.
 *
 * Alerts can also include inputs whos data can be passed back to the app.
 * Inputs can be used to prompt users for information.
 *
 * Its shorthand is to add all the alert's options from within the
 * `Alert.create(opts)` first argument. Otherwise the alert's
 * instance has methods to add options, such as `setTitle()` or `addButton()`.
 *
 * @usage
 * ```ts
 * constructor(nav: NavController) {
 *   this.nav = nav;
 * }
 *
 * presentAlert() {
 *   let alert = Alert.create({
 *     title: 'Low battery',
 *     subTitle: '10% of battery remaining',
 *     buttons: ['Dismiss']
 *   });
 *   this.nav.present(alert);
 * }
 *
 * presentConfirm() {
 *   let alert = Alert.create({
 *     title: 'Confirm purchase',
 *     body: 'Do you want to buy this book?',
 *     buttons: [
 *       {
 *         text: 'Cancel',
 *         handler: () => {
 *           console.log('Cancel clicked');
 *         }
 *       },
 *       {
 *         text: 'Buy',
 *         handler: () => {
 *           console.log('Buy clicked');
 *         }
 *       }
 *     ]
 *   });
 *   this.nav.present(alert);
 * }
 *
 * presentPrompt() {
 *   let alert = Alert.create({
 *     title: 'Login',
 *     inputs: [
 *       {
 *         name: 'username',
 *         placeholder: 'Username'
 *       },
 *       {
 *         name: 'password',
 *         placeholder: 'Password',
 *         type: 'password'
 *       }
 *     ],
 *     buttons: [
 *       {
 *         text: 'Cancel',
 *         handler: data => {
 *           console.log('Cancel clicked');
 *         }
 *       },
 *       {
 *         text: 'Login',
 *         handler: data => {
 *           if (User.isValid(data.username, data.password)) {
 *             // logged in!
 *           } else {
 *             // invalid login
 *             return false;
 *           }
 *         }
 *       }
 *     ]
 *   });
 *   this.nav.present(alert);
 * }
 * ```
 *
 */
export class Alert extends ViewController {

  constructor(opts={}) {
    opts.inputs = opts.inputs || [];
    opts.buttons = opts.buttons || [];

    super(AlertCmp, opts);
    this.viewType = 'alert';
  }

  /**
  * @private
  */
  getTransitionName(direction) {
    let key = (direction === 'back' ? 'alertLeave' : 'alertEnter');
    return this._nav && this._nav.config.get(key);
  }

  /**
   * @param {string} title Alert title
   */
  setTitle(title) {
    this.data.title = title;
  }

  /**
   * @param {string} subTitle Alert subtitle
   */
  setSubTitle(subTitle) {
    this.data.subTitle = subTitle;
  }

  /**
   * @param {string} body Alert body content
   */
  setBody(body) {
    this.data.body = body;
  }

  /**
   * @param {Object} input Alert input
   */
  addInput(input) {
    this.data.inputs.push(input);
  }

  /**
   * @param {Object} button Alert button
   */
  addButton(button) {
    this.data.buttons.push(button);
  }

  /**
   * @param {Object} opts Alert options
   */
  static create(opts={}) {
    return new Alert(opts);
  }

}

/**
* @private
*/
@Component({
  selector: 'ion-alert',
  template:
    '<div (click)="dismiss()" tappable disable-activated class="backdrop" role="presentation"></div>' +
    '<div class="alert-wrapper">' +
      '<div class="alert-head">' +
        '<h2 class="alert-title" *ngIf="d.title">{{d.title}}</h2>' +
        '<h3 class="alert-sub-title" *ngIf="d.subTitle">{{d.subTitle}}</h3>' +
      '</div>' +
      '<div class="alert-body" *ngIf="d.body">{{d.body}}</div>' +
      '<div class="alert-body alert-inputs" *ngIf="d.inputs.length">' +
        '<div class="alert-input-wrapper" *ngFor="#i of d.inputs">' +
          '<input [placeholder]="i.placeholder" [(ngModel)]="i.value" [type]="i.type" class="alert-input">' +
        '</div>' +
      '</div>' +
      '<div class="alert-buttons">' +
        '<button *ngFor="#b of d.buttons" (click)="click(b)" [ngClass]="b.cssClass" class="alert-button">' +
          '{{b.text}}' +
        '</button>' +
      '</div>' +
    '</div>',
  host: {
    'role': 'dialog'
  },
  directives: [NgClass, NgIf, NgFor]
})
class AlertCmp {

  constructor(
    private _viewCtrl: ViewController,
    private _elementRef: ElementRef,
    private _config: Config,
    params: NavParams,
    renderer: Renderer
  ) {
    this.d = params.data;
    if (this.d.cssClass) {
      renderer.setElementClass(_elementRef, this.d.cssClass, true);
    }
  }

  click(button) {
    let shouldDismiss = true;

    if (button.handler) {
      // a handler has been provided, execute it
      // pass the handler the values from the inputs
      if (button.handler(this.getValues()) === false) {
        // if the return value of the handler is false then do not dismiss
        shouldDismiss = false;
      }
    }

    if (shouldDismiss) {
      setTimeout(() => {
        this.dismiss();
      }, this._config.get('pageTransitionDelay'));
    }
  }

  dismiss() {
    this._viewCtrl.dismiss(this.getValues());
  }

  getValues() {
    let values = {};
    this.d.inputs.forEach(input => {
      values[input.name] = input.value;
    });
    return values;
  }

  onPageLoaded() {
    // normalize the data
    this.d.buttons = this.d.buttons.map(button => {
      if (typeof button === 'string') {
        return { text: button };
      }
      return button;
    });

    this.d.inputs = this.d.inputs.map((input, index) => {
      return {
        name: isDefined(input.name) ? input.name : index,
        placeholder: isDefined(input.placeholder) ? input.placeholder : '',
        type: input.type || 'text',
        value: isDefined(input.value) ? input.value : ''
      }
    });

    let self = this;
    self.keyUp = function(ev) {
      if (ev.keyCode === 13) {
        // enter
        console.debug('alert enter');
        let button = self.d.buttons[self.d.buttons.length - 1];
        self.click(button);

      } else if (ev.keyCode === 27) {
        console.debug('alert escape');
        self.dismiss();
      }
    };

    document.addEventListener('keyup', this.keyUp);
  }

  onPageDidEnter() {
    document.activeElement && document.activeElement.blur();
    if (this.d.inputs.length) {
      let firstInput = this._elementRef.nativeElement.querySelector('input');
      if (firstInput) {
        firstInput.focus();
      }
    }
  }

  onPageDidLeave() {
    document.removeEventListener('keyup', this.keyUp);
  }
}


/**
 * Animations for alerts
 */
class AlertPopIn extends Animation {
  constructor(enteringView, leavingView, opts) {
    super(null, opts);

    let ele = enteringView.pageRef().nativeElement;
    let backdrop = new Animation(ele.querySelector('.backdrop'));
    let wrapper = new Animation(ele.querySelector('.alert-wrapper'));

    wrapper.fromTo('opacity', '0.01', '1').fromTo('scale', '1.1', '1');
    backdrop.fromTo('opacity', '0.01', '0.3');

    this
      .easing('ease-in-out')
      .duration(200)
      .add(backdrop, wrapper);
  }
}
Animation.register('alert-pop-in', AlertPopIn);


class AlertPopOut extends Animation {
  constructor(enteringView, leavingView, opts) {
    super(null, opts);

    let ele = leavingView.pageRef().nativeElement;
    let backdrop = new Animation(ele.querySelector('.backdrop'));
    let wrapper = new Animation(ele.querySelector('.alert-wrapper'));

    wrapper.fromTo('opacity', '1', '0').fromTo('scale', '1', '0.9');
    backdrop.fromTo('opacity', '0.3', '0');

    this
      .easing('ease-in-out')
      .duration(200)
      .add(backdrop, wrapper);
  }
}
Animation.register('alert-pop-out', AlertPopOut);


class AlertMdPopIn extends Animation {
  constructor(enteringView, leavingView, opts) {
    super(null, opts);

    let ele = enteringView.pageRef().nativeElement;
    let backdrop = new Animation(ele.querySelector('.backdrop'));
    let wrapper = new Animation(ele.querySelector('.alert-wrapper'));

    wrapper.fromTo('opacity', '0.01', '1').fromTo('scale', '1.1', '1');
    backdrop.fromTo('opacity', '0.01', '0.5');

    this
      .easing('ease-in-out')
      .duration(200)
      .add(backdrop, wrapper);
  }
}
Animation.register('alert-md-pop-in', AlertMdPopIn);


class AlertMdPopOut extends Animation {
  constructor(enteringView, leavingView, opts) {
    super(null, opts);

    let ele = leavingView.pageRef().nativeElement;
    let backdrop = new Animation(ele.querySelector('.backdrop'));
    let wrapper = new Animation(ele.querySelector('.alert-wrapper'));

    wrapper.fromTo('opacity', '1', '0').fromTo('scale', '1', '0.9');
    backdrop.fromTo('opacity', '0.5', '0');

    this
      .easing('ease-in-out')
      .duration(200)
      .add(backdrop, wrapper);
  }
}
Animation.register('alert-md-pop-out', AlertMdPopOut);
