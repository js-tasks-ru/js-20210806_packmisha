export default class SortableTable {
  element;
  
  constructor(headerConfig = [], {data = []}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render()
  }  
  
  template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
    
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.tableHeader()}
          </div>
      
          <div data-element="body" class="sortable-table__body">
            ${this.tableRow()}
          </div>
      
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
      
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
          </div>
    
        </div>
      </div>
    `
  }

  tableHeader() {
    return this.headerConfig.map(column => {
      return `
          <div class="sortable-table__cell" data-id="${column.id}" data-sortable="${column.sortable}" data-order="${column.order || ""}">
            <span>${column.title}</span>
            <span data-element="arrow" class="sortable-table__sort-arrow">
              <span class="sort-arrow"></span>
            </span>
          </div>
      `
    }).join("")
  }
  tableRow() {
    return this.data.map(product => {
      return `
        <a href="/products/${product.id}" class="sortable-table__row">
          ${this.tableRowCell(product)}
        </a>
      `
    }).join("")
  }
  tableRowCell(product) {
    return this.headerConfig.map(column => {
      if (column.template) {
        return column.template(product.images)
      }
      return `
        <div class="sortable-table__cell">${product[column.id]}</div>
      `
    }).join("")
  }

  sort(fieldValue, orderValue) {
    const directions = {
      "asc" : 1,
      "desc": -1
    }
    const direction = directions[orderValue];

    this.headerConfig.map(column => {
      column.order = "";
      if (column.id === fieldValue) {
        column.order = orderValue;
        debugger
        this.sortData(direction, fieldValue)
      }
    })

    this.subElements.header.innerHTML = this.tableHeader();
    this.subElements.body.innerHTML = this.tableRow();
  }

  sortData(direction, fieldValue) {
    this.headerConfig.map(column => {
      if (fieldValue === column.id) {
        switch(column.sortType) {
          case "string":
            this.data.sort((a, b) => {
              return (
                direction * a[fieldValue].localeCompare(b[fieldValue], ["ru", "en"], {caseFirst: "upper"})
              );
            });
          break;
          case "number":
            this.data.sort((a, b) => {
              return direction * (a[fieldValue] - b[fieldValue]);
            });
          break;
        }
      }
    })
  }

  getSubElements(element) {
    const result = {

    };
    const elements = element.querySelectorAll("[data-element]");
    for (const element of elements) {
      const name = element.dataset.element
      result[name] = element; 
    }
    return result;
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.template();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(element)  }


  remove() {
    if (this.element) {
      this.element.remove()
    }
  }

  destroy() {
    this.remove();
    this.headerConfig = [];
    this.data = [];
  }
}
