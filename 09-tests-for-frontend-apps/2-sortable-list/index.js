export default class SortableList {
    constructor ({
      items = [],
    } = {}) {
      this.items = items;
      this.dragSelector = 'sortable-list__item';
      this.dragParentSelector = 'sortable-list';
      this.dragCloneSelector = 'sortable-list__placeholder';
      this.render();
    }
  
    render () {
      const element = document.createElement('div');
      const items = this.getItems();
      element.append(items);
      this.element = element.firstElementChild;
  
      this.initEventListeners();
    }
  
    getItems() {
      const wrapper = document.createElement('ul');
      wrapper.classList.add(this.dragParentSelector);
      this.items.map(item => {
        item.classList.add(this.dragSelector);
        wrapper.append(item);
      });
      return wrapper;
    }
  
    cloneElement (srcNode) {
      const clone = document.createElement('div');
      clone.classList.add(this.dragCloneSelector);
      clone.style.width = srcNode.offsetWidth + 'px';
      clone.style.height = srcNode.offsetHeight + 'px';
  
      return clone;
    }
  
    dragItem = e => {
      const gap = 10;
      const drugElement = e.target.closest(`.${this.dragSelector}`);
      const clone = this.cloneElement(drugElement);
      const clientRect = drugElement.getBoundingClientRect();
  
      let shiftX = e.clientX - clientRect.left;
      let shiftY = e.clientY - clientRect.top;
  
      drugElement.style.left = clientRect.left + 'px';
      drugElement.style.top = clientRect.top + 'px';
      drugElement.style.width = drugElement.offsetWidth + 'px';
      drugElement.style.height = drugElement.offsetHeight + 'px';
      drugElement.style.position = 'fixed';
      drugElement.style.zIndex = 1000;
      drugElement.style.margin = 0;
  
      const move = e => {
        e.preventDefault();
        drugElement.style.left = e.clientX - shiftX + 'px';
        drugElement.style.top = e.clientY - shiftY + 'px';
  
        const distance = (e.clientY - shiftY) - clone.getBoundingClientRect().top;
        const cloneHeight = clone.offsetHeight + gap;
  
        if (distance > cloneHeight) {
          if (clone.nextSibling) {
            clone.nextSibling.after(clone);
          }
        }
  
        if (distance < -cloneHeight) {
          if (clone.previousSibling) {
            this.element.insertBefore(clone, clone.previousSibling);
          }
        }
      };
  
  
      const replaceClone = () => {
        clone.replaceWith(drugElement);
        drugElement.style = null;
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', replaceClone);
      };
  
      this.element.insertBefore(clone, drugElement);
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', replaceClone);
    }
  
    removeItem = e => {
      e.target.closest(`.${this.dragSelector}`).remove();
    }
  
    clickOnElement = e => {
  
      switch (true) {
      case (e.target.dataset.grabHandle !== undefined) :
        this.dragItem(e);
        break;
      case (e.target.dataset.deleteHandle !== undefined) :
        this.removeItem(e);
        break;
      }
    }
  
    initEventListeners() {
      this.element.addEventListener('pointerdown', this.clickOnElement);
    }
  
    remove () {
      if (this.element) {
        this.element.remove();
      }
    }
  
    destroy () {
      this.remove();
    }
  
  }