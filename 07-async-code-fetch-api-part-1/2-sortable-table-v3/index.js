import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements;
  quantityRows = 10;
  isLoading = false;

  handlerEvent = {
    pointerdownFieldHeader: async event => {
      const target = event.target.closest('div[data-sortable]');
      if (!target) return; 
  
      const field = target.dataset.id;  
        
      if (this.sorted.id !== field) {
        const cell = this.subElements.header.querySelector(`[data-id=${this.sorted.id}]`);
        cell.removeAttribute('data-order');
        this.sorted.id = field;
      }

      target.dataset.order = target.dataset.order === "asc"
        ? "desc" : "asc";
      const newOrder = target.dataset.order;
     
      if (this.isSortLocally) {
        this.sortOnClient(field, newOrder);
      } else {
        this.sortOnServer(field, newOrder);
      }
    },
    scroll: async event => {
      const { bottom } = this.element.getBoundingClientRect();

      if (bottom < document.documentElement.clientHeight 
          && !this.isLoading 
          && !this.isSortLocally) {
        
        this.start = this.end;
        this.end = this.start + this.quantityRows;
  
        this.loading = true;
  
        const data = await this.loadData();
        this.addInfinityRows(data);
  
        this.loading = false;
      }
    },
  }

  constructor(
    headerConfig = [], {
      url = '',
      data = [],
      sorted = {
        id: headerConfig.find(item => item.sortable).id,
        order: 'asc'
      },
      isSortLocally = false,
      start = 0,
      end = 15,
    } = {}) {

    this.config = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.url = new URL(url, BACKEND_URL);
    this.start = start;
    this.end = end;

    this.render();
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    
    this.data = await this.loadData();  
    this.subElements.body.innerHTML = this.getBodyRows(this.data);

    this.subElements.header.querySelector(`[data-id=${this.sorted.id}]`)
    .dataset.order = this.sorted.order;
    
    this.initListener();
  }
  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, item) => {
      acc[item.dataset.element] = item;
      return acc;
    }, {});
  }

  async loadData(
    field = this.sorted.id,
    order = this.sorted.order,
    start = this.start,
    end = this.end
  ) {
    this.subElements.loading.style.display = 'grid';
    const data = await fetchJson(this.getUrl(field, order, start, end));
    this.subElements.loading.style.display = 'none';
    return data;
  }
  getUrl(field, order, start, end) {
    this.url.searchParams.set('_embed', 'subcategory.category');
    this.url.searchParams.set('_sort', field);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);
    return this.url;
  }

  addInfinityRows(data) {
    this.data = [...this.data, ...data];
    this.subElements.body.insertAdjacentHTML('beforeend', this.getBodyRows(data));
  }

  initListener() {
    this.subElements.header.addEventListener(
      'pointerdown', 
      this.handlerEvent.pointerdownFieldHeader,
    );
    document.addEventListener(
      'scroll',
      this.handlerEvent.scroll,
    ); 
  }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
  sortOnClient (field, order) {
    this.data = this.sort(field, order);
    this.subElements.body.innerHTML = this.getBodyRows(this.data);
  }
  sort(field, order) {
    const arr = [...this.data];
    const { sortType } = this.config.find(item => item.id === field);
    const directions = {
      'asc': 1,
      'desc': -1,
    };
    const direction = directions[order];
    
    return arr.sort(this.getCompareFunction(field, sortType, direction));
  }
  getCompareFunction(field, sortType, direction) {
    const compareFunctions = {
      'string': (obj1, obj2) => {
        return direction * obj1[field].localeCompare(obj2[field], ['ru', 'en']);
      },
      'number': (obj1, obj2) => {
        return direction * (obj1[field] - obj2[field]);
      },
    };
    return compareFunctions[sortType];
  }

  async sortOnServer (field, order) {
    this.data = await this.loadData(field, order);  
    this.subElements.body.innerHTML = this.getBodyRows(this.data); 
  }

  getHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getHeaderRow()}
      </div>
    `;
  }
  getHeaderRow() {
    return this.config.map(item => {
      return this.getHeaderCell(item);
    })
    .join('');
  }
  getHeaderCell(obj) {
    const isSortable = obj.sortable ? "data-sortable = true" : "";
    return `
      <div class="sortable-table__cell" data-id=${obj.id} ${isSortable}>
        <span>${obj.id}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `;
  }

  getBody(data = this.data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getBodyRows(data)}
      </div>
    `;
  }
  getBodyRows(data) {
    return data.map(item => `
      <a href="/products/${item.id}" class="sortable-table__row">
        ${this.getBodyRow(item)}
      </a>`
    ).join('');
  }
  getBodyRow(obj) {
    return this.config.map(item => {
      if (item.template) {
        return item.template(obj[item.id]);
      }
      return this.getBodyCell(obj[item.id]);
    })
    .join('');
  }
  getBodyCell(data) {
    return `
      <div class="sortable-table__cell">${data}</div>
    `;
  }

  get template() {
    return `
      <div class="sortable-table">
        ${this.getHeader()}
        ${this.getBody()}
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          No products
        </div>
      </div>
    `;
  }

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    document.removeEventListener('scroll', this.handlerEvent.scroll); 
  }
}