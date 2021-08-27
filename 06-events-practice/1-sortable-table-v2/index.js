export default class SortableTable {
  sortOnClick = (event) => {
    const column = event.target.closest("[data-sortable='true']")
    
    if (column) {
      const {id, order} = column.dataset;
      const sortedData = this.sortData(id, order);

      if (column.dataset.order == "asc") {
        column.dataset.order = "desc"
      } else {
        column.dataset.order = "asc"
      }

      column.append(this.subElements.arrow)
      //Работает, но почему работает, понять не могу))
      //Подскажите, почему когда я вставляю стрелку при помощи append,
      //не происходит так, что вставляется больше одной стрелки
      //И что убирает стрелку из колонки, когда я нажимаю на другую колонку?

      this.subElements.body.innerHTML = this.getBody(sortedData)
    }
  }

  constructor(
    headersConfig,
    {
      data = [],
      sorted = {
        id: headerConfig.find((item) => item.sortable).id,
        order: "asc",
      },
    } = {}
  ) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;

    this.render()
  }

  render() {
    const sortedData = this.sortData(this.sorted.id, this.sorted.order);

    const elem = document.createElement("div");
    elem.innerHTML = this.getTemplate(sortedData);
    this.element = elem.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.getEventListeners();
  }

  getTemplate(sortedData) {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          ${this.getHeader()}
          ${this.getBody(sortedData)}
      
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
      
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getHeaderCell(this.headersConfig)}
      </div>
    `;
  }

  getHeaderCell(headersConfig) {
    return headersConfig.map((header) => {
      const order = this.sorted.id === header.id ? this.sorted.order : "";
      const arrow = order ? this.getHeaderArrow() : "";

      return `
        <div
          class="sortable-table__cell"
          data-id="${header.id}"
          data-sortable="${header.sortable}"
          data-order="${order}"
        >
          <span>${header.title}</span>
          ${arrow}
        </div>
      `;
    }).join("");
  }

  getHeaderArrow() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `
  }

  getBody(sortedData) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getBodyRow(sortedData)}
      </div>
    `
  }

  getBodyRow(sortedData) {
    return sortedData.map(product => {
      return `
        <a href="/products/${product.id}" class="sortable-table__row">
          ${this.getBodyCell(product)}
        </a>
    `
    }).join("")
  }

  getBodyCell(product) {
    return this.headersConfig.map(header => {
      if (header.template) {
        return header.template(product.images)
      }
      return `
        <div class="sortable-table__cell">${product[header.id]}</div>
      `
    }).join("")
  }

  getSubElements(element) {
    let result = {};
    const elements = element.querySelectorAll("[data-element]")
    elements.forEach(subElement => {
      const name = subElement.dataset.element;
      result[name] = subElement;
    })
    return result;
  }

  sortData(id, order) {
    const arr = [...this.data];
    const column = this.headersConfig.find(item => item.id === id);
    const sortType = column.sortType;
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[id] - b[id]);
      case 'string':
        return direction * a[id].localeCompare(b[id], 'ru');
      }
    });
  }

  getEventListeners() {
    this.subElements.header.addEventListener("pointerdown", this.sortOnClick)
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}