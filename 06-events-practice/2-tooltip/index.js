class Tooltip {
  static isActive;

  pointerOver = (event) => {
    const element = event.target.closest("[data-tooltip]");

    if (element) {
      this.render(event.target.dataset.tooltip);

      document.addEventListener("pointermove", this.pointerMove);
    }
  };

  pointerOut = () => {
    if (this.element) {
      this.destroy();
      document.removeEventListener("pointermove", this.pointerMove);
    }
  };

  pointerMove = (event) => {
    const left = event.clientX + 10;
    const top = event.clientY + 10;

    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  };

  constructor() {
    if (Tooltip.isActive) {
      return Tooltip.isActive;
    }
    Tooltip.isActive = this;
  }

  render(text) {
    this.element = document.createElement("div");
    this.element.className = "tooltip";
    this.element.innerHTML = text;

    document.body.append(this.element);
  }

  initialize() {
    document.addEventListener("pointerover", this.pointerOver);
    document.addEventListener("pointerout", this.pointerOut);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

export default Tooltip;
