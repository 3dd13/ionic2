import {Component, ElementRef, Renderer, Input, HostListener, Optional} from 'angular2/core';
import {NgControl} from 'angular2/common';

import {Form} from '../../util/form';
import {Config} from '../../config/config';
import {pointerCoord} from '../../util/dom';


/**
 * @name Toggle
 * @description
 * A toggle technically is the same thing as an HTML checkbox input, except it looks different and is easier to use on a touch device. Ionic prefers to wrap the checkbox input with the `<label>` in order to make the entire toggle easy to tap or drag.
 * Togglees can also have colors assigned to them, by adding any color attribute to them.
 *
 * See the [Angular 2 Docs](https://angular.io/docs/js/latest/api/forms/) for more info on forms and input.
 * @property {any} [value] - the inital value of the toggle
 * @property {boolean} [checked] - whether the toggle it toggled or not
 * @property {boolean} [disabled] - whether the toggle is disabled or not
 * @property {string} [id] - a unique ID for a toggle
 * @usage
 * ```html
 * <!-- Create a single toggle -->
 *  <ion-toggle checked="true">
 *    Pineapple
 *  </ion-toggle>
 *
 * <!-- Create a list of togglees -->
 *  <ion-list>
 *
 *    <ion-toggle checked="true">
 *      Apple
 *    </ion-toggle>
 *
 *     <ion-toggle checked="false">
 *       Banana
 *     </ion-toggle>
 *
 *     <ion-toggle disabled="true">
 *       Cherry
 *     </ion-toggle>
 *
 *  </ion-list>
 * ```
 * @demo /docs/v2/demos/toggle/
 * @see {@link /docs/v2/components#toggle Toggle Component Docs}
 */
@Component({
  selector: 'ion-toggle,ion-switch',
  host: {
    'role': 'checkbox',
    'class': 'item',
    'tappable': '',
    'tabindex': 0,
    '[attr.aria-disabled]': 'disabled',
    '(touchstart)': 'pointerDown($event)',
    '(mousedown)': 'pointerDown($event)',
    '(touchend)': 'pointerUp($event)',
    '(mouseup)': 'pointerUp($event)'
  },
  template:
    '<ng-content select="[item-left]"></ng-content>' +
    '<div class="item-inner">' +
      '<ion-item-content id="{{labelId}}">' +
        '<ng-content></ng-content>' +
      '</ion-item-content>' +
      '<div class="toggle-media" [class.toggle-activated]="isActivated" disable-activated>' +
        '<div class="toggle-icon"></div>' +
      '</div>' +
    `</div>`
})
export class Toggle {
  @Input() value: string = '';
  @Input() public checked: any = false;
  @Input() disabled: boolean = false;
  @Input() id: string;

  constructor(
    private _form: Form,
    private _elementRef: ElementRef,
    private _renderer: Renderer,
    config: Config,
    @Optional() ngControl: NgControl
  ) {
    // deprecated warning
    if (_elementRef.nativeElement.tagName == 'ION-SWITCH') {
      console.warn('<ion-switch> has been renamed to <ion-toggle>, please update your HTML');
    }

    _form.register(this);

    this.lastTouch = 0;
    this.mode = config.get('mode');

    this.onChange = (_) => {};
    this.onTouched = (_) => {};

    if (ngControl) {
      ngControl.valueAccessor = this;
    }

    let self = this;
    function pointerMove(ev) {
      let currentX = pointerCoord(ev).x;

      if (self.checked) {
        if (currentX + 15 < self.startX) {
          self.toggle();
          self.startX = currentX;
        }
      } else if (currentX - 15 > self.startX) {
        self.toggle();
        self.startX = currentX;
      }
    }

    function pointerOut(ev) {
      if (ev.currentTarget === ev.target) {
        self.pointerUp(ev);
      }
    }

    let toggleEle = _elementRef.nativeElement.querySelector('.toggle-media');

    this.addMoveListener = function() {
      toggleEle.addEventListener('touchmove', pointerMove);
      toggleEle.addEventListener('mousemove', pointerMove);
      _elementRef.nativeElement.addEventListener('mouseout', pointerOut);
    };

    this.removeMoveListener = function() {
      toggleEle.removeEventListener('touchmove', pointerMove);
      toggleEle.removeEventListener('mousemove', pointerMove);
      _elementRef.nativeElement.removeEventListener('mouseout', pointerOut);
    };
  }

  /**
   * @private
   */
  ngOnInit() {
    if (!this.id) {
      this.id = 'tgl-' + this._form.nextId();
      this._renderer.setElementAttribute(this._elementRef, 'id', this.id);
    }

    this.labelId = 'lbl-' + this.id;
    this._renderer.setElementAttribute(this._elementRef, 'aria-labelledby', this.labelId);
  }

  /**
   * Toggle the checked state of this toggle.
   */
  toggle() {
    this.checked = !this.checked;
  }

  get checked() {
    return !!this._checked;
  }

  set checked(val) {
    this._checked = !!val;
    this._renderer.setElementAttribute(this._elementRef, 'aria-checked', this._checked);
    this.onChange(this._checked);
  }

  /**
   * @private
   */
  writeValue(value) {
    this.checked = value;
  }

  /**
   * @private
   */
  pointerDown(ev) {
    if (/touch/.test(ev.type)) {
      this.lastTouch = Date.now();
    }

    if (this.isDisabled(ev)) return;

    this.startX = pointerCoord(ev).x;

    this.removeMoveListener();
    this.addMoveListener();

    this.isActivated = true;
  }

  /**
   * @private
   */
  pointerUp(ev) {
    if (this.isDisabled(ev)) return;

    let endX = pointerCoord(ev).x;

    if (this.checked) {
      if (this.startX + 4 > endX) {
        this.toggle(ev);
      }
    } else if (this.startX - 4 < endX) {
      this.toggle(ev);
    }

    this.removeMoveListener();
    this.isActivated = false;
  }

  /**
   * @private
   */
  registerOnChange(fn) { this.onChange = fn; }

  /**
   * @private
   */
  registerOnTouched(fn) { this.onTouched = fn; }

  /**
   * @private
   */
  ngOnDestroy() {
    this.removeMoveListener();
    this.toggleEle = this.addMoveListener = this.removeMoveListener = null;
    this.form.deregister(this);
  }

  /**
   * @private
   */
  isDisabled(ev) {
    return (this.lastTouch + 999 > Date.now() && /mouse/.test(ev.type)) || (this.mode == 'ios' && ev.target.tagName == 'ION-TOGGLE');
  }

  /**
   * @private
   */
  initFocus() {

  }
}
