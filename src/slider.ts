// console.log("slider.ts loading...");

type SliderOptions = {
  loop?: boolean;           // пока false — класс лечит края
  dots?: boolean;           // показывать точки
  initialIndex?: number;    // стартовый индекс
};

export class Slider {
  private root: HTMLElement;
  private viewport: HTMLElement;
  private track: HTMLElement;
  private slides: HTMLElement[];
  private btnPrev: HTMLButtonElement | null;
  private btnNext: HTMLButtonElement | null;
  private dotsWrap: HTMLElement | null;
  private index = 0;
  private observer?: ResizeObserver;
  private ticking = false;

  constructor(root: HTMLElement, opts: SliderOptions = {}) {
    this.root = root;
    this.viewport = root.querySelector<HTMLElement>('[class$="__viewport"]')!;
    this.track = root.querySelector<HTMLElement>('[class$="__track"]')!;
    this.slides = Array.from(root.querySelectorAll<HTMLElement>('[class$="__slide"]'));
    this.btnPrev = root.querySelector<HTMLButtonElement>('[data-slider-prev]');
    this.btnNext = root.querySelector<HTMLButtonElement>('[data-slider-next]');
    this.dotsWrap = opts.dots !== false ? root.querySelector<HTMLElement>('[data-slider-dots]') : null;

    // Стартовый индекс
    this.index = Math.min(Math.max(opts.initialIndex ?? 0, 0), this.maxIndex());

    // Привязка обработчиков
    this.bind();

    // Инициализация
    this.scrollToIndex(this.index, false);
    this.updateButtons();
    this.renderDots();
    this.updateActiveDot();

    // Resize оповещения (пересчёт позиций)
    this.observer = new ResizeObserver(() => this.scrollToIndex(this.index, false));
    this.observer.observe(this.viewport);
  }

  private bind() {
    this.btnPrev?.addEventListener('click', () => this.prev());
    this.btnNext?.addEventListener('click', () => this.next());

    // Клавиатура на фокусе viewport
    this.viewport.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); this.next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); this.prev(); }
    });

    // Трек скролл — обновляем активный индекс (throttle через rAF)
    this.viewport.addEventListener('scroll', () => {
      if (this.ticking) return;
      this.ticking = true;
      requestAnimationFrame(() => {
        this.index = this.nearestIndex();
        this.updateButtons();
        this.updateActiveDot();
        this.ticking = false;
      });
    });
  }

  private slideOffsetLeft(i: number): number {
    return this.slides[i].offsetLeft;
  }

  private scrollToIndex(i: number, smooth = true) {
    const left = this.slideOffsetLeft(i);
    this.viewport.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
  }

  private nearestIndex(): number {
    const scrollLeft = this.viewport.scrollLeft;
    // Находим ближайший слайд по offsetLeft
    let nearest = 0;
    let minDelta = Infinity;
    for (let i = 0; i < this.slides.length; i++) {
      const delta = Math.abs(this.slides[i].offsetLeft - scrollLeft);
      if (delta < minDelta) { minDelta = delta; nearest = i; }
    }
    return nearest;
  }

  private slidesPerView(): number {
    // Оценка видимых карточек: ширина viewport / ширина первого слайда
    const slideWidth = this.slides[0].getBoundingClientRect().width;
    const vw = this.viewport.getBoundingClientRect().width;
    return Math.max(1, Math.round(vw / slideWidth));
  }

  private maxIndex(): number {
    const spv = this.slidesPerView();
    return Math.max(0, this.slides.length - spv);
  }

  private updateButtons() {
    const max = this.maxIndex();
    if (this.btnPrev) this.btnPrev.disabled = this.index <= 0;
    if (this.btnNext) this.btnNext.disabled = this.index >= max;
  }

  private renderDots() {
    if (!this.dotsWrap) return;
    this.dotsWrap.innerHTML = '';
    const count = this.slides.length;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider__dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        this.index = Math.min(i, this.maxIndex());
        this.scrollToIndex(this.index);
        this.updateButtons();
        this.updateActiveDot();
      });
      this.dotsWrap.appendChild(dot);
    }
  }

  private updateActiveDot() {
    if (!this.dotsWrap) return;
    const dots = Array.from(this.dotsWrap.children) as HTMLElement[];
    dots.forEach((d, i) => d.classList.toggle('slider__dot--active', i === this.index));
  }

  public next() {
    this.index = Math.min(this.index + 1, this.maxIndex());
    this.scrollToIndex(this.index);
    this.updateButtons();
    this.updateActiveDot();
  }

  public prev() {
    this.index = Math.max(this.index - 1, 0);
    this.scrollToIndex(this.index);
    this.updateButtons();
    this.updateActiveDot();
  }

  public destroy() {
    this.observer?.disconnect();
  }
}
