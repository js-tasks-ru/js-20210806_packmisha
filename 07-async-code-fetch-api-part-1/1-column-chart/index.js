import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;

  constructor({
    url = '',
    range = {
      from: new Date(),
      to: new Date(),
    },
    label = '',
    link = '',
    formatHeading = data => data,
  } = {}) {
    
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    
    this.render();
    this.update(this.range.from, this.range.to);
  }

  getUrl(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());
    return this.url;
  }

  async getData(from, to) {
    return await fetchJson(this.getUrl(from, to));
  } 

  getValue(data) {
    return data.reduce((acc, item) => acc + item, 0);
  }

  getColumns(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;
    return data
      .map(item => {
        const percent = (item / maxValue * 100).toFixed(0) + '%';
        const value = String(Math.floor(item * scale));
        return `
          <div style="--value: ${value}" data-tooltip=${percent}></div>
        `;
      })
    .join('');
  }

  getLink() {
    return this.link 
      ? `<a href=${this.link} class="column-chart__link">View all</a>`
      : '';
  }

  get template() {
    return `
      <div class="dashboard__chart_${this.label}">
        <div class="column-chart" style="--chart-height: ${this.chartHeight}">
          <div class="column-chart__title">
            Total ${this.label}
            ${this.getLink()}
          </div>
          <div class="column-chart__container">
            <div data-element="header" class="column-chart__header"></div>
            <div data-element="body" class="column-chart__chart"></div>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div'); 
    element.innerHTML = this.template;
    this.element = element.firstElementChild;   
    
    this.subElements = this.getSubElements(this.element);    
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;
      return acc;
    }, {});
  }

  async update(from, to) {
    this.element.classList.add('column-chart_loading');
    
    const data = await this.getData(from, to);
    const renderData = Object.values(data);
    
    const { header, body } = this.subElements;
    body.innerHTML = this.getColumns(renderData);
    header.textContent = this.formatHeading(
      this.getValue(renderData)
    );  
    
    this.element.classList.remove('column-chart_loading');
    
    this.range.from = from;
    this.range.to = to;

    return data;
  }

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}