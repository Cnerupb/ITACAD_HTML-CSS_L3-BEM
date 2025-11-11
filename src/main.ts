import '../src/styles/main.scss';
import './slider';

import { Slider } from './slider';

document.addEventListener('DOMContentLoaded', () => {
  // можно несколько слайдеров, поэтому querySelectorAll
  document.querySelectorAll<HTMLElement>('[data-slider]').forEach((el) => {
    new Slider(el, { dots: true, initialIndex: 0 });
  });
});
