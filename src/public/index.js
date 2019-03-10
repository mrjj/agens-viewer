import html from 'text-loader!./index.html';
import './style.less';

import { AgensViewerModel } from './js/main';
import * as ko from 'knockout';

const init = () => {
  let element = document.createElement('div');
  element.setAttribute('id', 'app');
  element.setAttribute('class', 'app');
  console.log(html);
  element.innerHTML = html;
  // return element;
  document.body.appendChild(element);
  ko.applyBindings(new AgensViewerModel(), element);
};

init();
