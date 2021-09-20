import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
    element;
    subElements = {};
  
    constructor() {
  
      this.range = this.currentRange;
  
      this.components = {
        rangePicker: new RangePicker(this.range),
        sortableTable: new SortableTable(header, {
          url: this.tableURL,
          isSortLocally: true,
          start: 0,
          end: 30
        }),
  
        ordersChart: new ColumnChart({
          label: 'Заказы',
          url: '/api/dashboard/orders',
          range: this.range
        }),
  
        salesChart: new ColumnChart({
          label: 'Продажи',
          formatHeading: data => `$${data}`,
          url: '/api/dashboard/sales',
          range: this.range
        }),
  
        customersChart: new ColumnChart({
          label: 'Клиенты',
          url: '/api/dashboard/customers',
          range: this.range
        })
      };
    }
  
    handleDateSelect = (event) => {
      this.range = event.detail;
      const {from, to} = this.range;
      this.updateCharts(from, to);
      this.updateTable(from, to);
    };
  
    async render() {
      this.element = document.createElement('div');
      this.element.className = `dashboard full-height flex-column`;
      this.element.innerHTML = `
        <div class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div class="dashboard__charts">
            <div class="dashboard__chart_orders" data-element="ordersChart"></div>
            <div class="dashboard__chart_sales" data-element="salesChart"></div>
            <div class="dashboard__chart_customers" data-element="customersChart"></div>
        </div>
        <h3 class="block-title">Лидеры продаж</h3>
        <div data-element="sortableTable"></div>
      `;
  
      this.setSubElements();
      this.renderComponents();
      this.initEventListeners();
  
      return this.element;
    }
  
    renderComponents() {
      for (const [key, value] of Object.entries(this.components)) {
        const container = this.subElements[key];
        if (container) {
          container.append(value.element);
        }
      }
    }
  
    updateCharts(from, to) {
      const {ordersChart, customersChart, salesChart} = this.components;
      [ordersChart, customersChart, salesChart].forEach(chart => chart.update(from, to));
    }
  
    async updateTable(from, to) {
      const {sortableTable} = this.components;
      sortableTable.url.searchParams.set('from', from.toISOString());
      sortableTable.url.searchParams.set('to', to.toISOString());
      const newData = await sortableTable.loadData();
      sortableTable.addRows(newData);
    }
  
    initEventListeners() {
      window.addEventListener('date-select', this.handleDateSelect);
    }
  
    removeEventListeners() {
      window.removeEventListener('date-select', this.handleDateSelect);
    }
  
    remove() {
      if (this.element) {
        this.element.remove();
      }
    }
  
    destroy() {
      this.remove();
      this.removeEventListeners();
      this.element = null;
      this.subElements = {};
      for (const component of Object.values(this.components)) {
        component.destroy();
      }
    }
  
    setSubElements() {
      const subs = this.element.querySelectorAll('[data-element]');
      [...subs].forEach(sub => {
        const key = sub.dataset.element;
        this.subElements[key] = sub;
      });
    }
  
    get currentRange() {
      const to = new Date();
      const from = new Date(to);
      from.setMonth(to.getMonth() - 1);
  
      return {from, to};
    }
  
    get tableURL() {
      const {from, to} = this.range;
      const url = new URL('/api/dashboard/bestsellers', BACKEND_URL);
      url.searchParams.set('from', from.toISOString());
      url.searchParams.set('to', to.toISOString());
      return url.toString();
    }
  }