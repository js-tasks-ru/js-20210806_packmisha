import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};
  
  defaultData = {
    title: '',
    description: '',
    subcategory: '',
    images: [],
    price: 0,
    discount: 0,
    quantity: 0,
    status: 1,
  };

  onSubmit = event => {
    event.preventDefault();
    this.save();
  };

  onUploadImage = () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <input type="file" name="image" accept="image/*">
    `;
    const imageInput = wrapper.firstElementChild;
    document.body.appendChild(imageInput);
    imageInput.click();

    imageInput.onchange = async () => {
      const [file] = imageInput.files;
      if (!file) return ;
      
      const formData = new FormData();
      formData.append('image', file);
      
      const result = await fetchJson('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: formData,
        referrer: ''
      });

      const { imageListContainer } = this.subElements;
      imageListContainer.append(this.getImage(result.data.link, file.name));
    };

    imageInput.remove();
  };

  constructor (productId) {
    this.productId = productId;
  }

  async render () {
    const [categoriesData, [productData]] = await Promise.all([
      this.getCategories(),
      this.productId ? this.getProductData() : [this.defaultData]
    ]);

    this.formData = productData;
    this.categories = categoriesData;

    const element = document.createElement('div');
    element.innerHTML = this.formData.id 
      ? this.template
      : this.template404;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    
    this.initEventListeners();
    this.setFormData();

    return this.element;
  }

  async save() {
    const productDataSave = this.getFormData();

    const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
      method: this.productId ? 'PATCH' : 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productDataSave),
      referrer: ''
    });

    this.dispatchEvent(result.id);
  }

  getFormData() {
    const { productForm, imageListContainer } = this.subElements;
    const excludedFields = ['images'];
    const fields = Object.keys(this.defaultData)
      .filter(item => !excludedFields.includes(item));
    
    const productDataSave = {};
    for (const field of fields) {
      productDataSave[field] = productForm.querySelector(`[name = ${field}]`).value;
    }

    const imagesList = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    productDataSave.id = this.productId;
    productDataSave.images = [...imagesList].map(image => {
      return {
        url: image.src,
        source: image.alt
      };
    });

    return productDataSave;
  }

  setFormData () {
    const { productForm } = this.subElements;
    const excludedFields = ['images'];
    const fields = Object.keys(this.defaultData).filter(item => !excludedFields.includes(item));

    fields.forEach(item => {
      const element = productForm.querySelector(`[name = ${item}]`);
      element.value = this.formData[item] || this.defaultData[item];
    });
  }
 
  initEventListeners() {
    const { productForm, uploadImage, imageListContainer } = this.subElements;

    productForm.addEventListener('submit', this.onSubmit);
    uploadImage.addEventListener('pointerdown', this.onUploadImage);

    imageListContainer.addEventListener('click', event => {
      if ('deleteHandle' in event.target.dataset) {
        event.target.closest('li').remove();
      }
    });
  }

  dispatchEvent (id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, item) => {
      acc[item.dataset.element] = item;
      return acc;
    }, {});
  }

  async getCategories() {
    const path = 'api/rest/categories';
    const url = new URL(path, BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
    return await fetchJson(url);
  }

  getSelect() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<select class="form-control" id="subcategory" name="subcategory"></select>`;

    const select = wrapper.firstElementChild;

    for (const category of this.categories) {
      for (const child of category.subcategories) {
        select.append(new Option(`${category.title} > ${child.title}`, child.id));
      }
    }

    return select.outerHTML;
  }

  async getProductData() {
    const path = 'api/rest/products';
    const url = new URL(path, BACKEND_URL);
    url.searchParams.set('id', this.productId);
    return await fetchJson(url);
  }

  renderImagesList(images = this.formData.images) {
    return images.map(image => {
      return this.getImage(image.url, image.source);
    }).join('');
  }
  getImage(url, name) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value=${url}>
        <input type="hidden" name="source" value=${name}>
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img 
            class="sortable-table__cell-img" 
            alt=${name} 
            src=${url}>
        <span>${name}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;
  }

  get template() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required 
                id="title"  
                name="title" 
                class="form-control"
                value = ""
                placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required
              class="form-control" 
              id="description"
              name="description"
              data-element="productDescription" 
              placeholder="Описание"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
              <ul class="sortable-list">
                ${this.renderImagesList()}    
              </ul>
            </div>
            <button type="button" data-element="uploadImage" class="button-primary-outline">
              <span>Загрузить</span>
            </button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
              ${this.getSelect()}
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required 
                type="number" 
                id="price"
                name="price"
                value = ""
                class="form-control" 
                placeholder="Цена">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required
                type="number"
                id="discount"
                name="discount" 
                value = ""
                class="form-control" 
                placeholder="Скидка">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required 
              type="number" 
              class="form-control" 
              value = ""
              id="quantity"
              name="quantity" 
              placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status" id="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              ${this.productId ? "Сохранить товар" : "Добавить товар"}
            </button>
          </div>
    </form>
  </div>
    `;
  }

  get template404() {
    return `<div>
    <h1 class="page-title">Товар не найден</h1>
    <p>Возможно товар был удален или перемещен</p>
  </div>`;
  }

  remove() {
    this.element.remove();
  }
  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}