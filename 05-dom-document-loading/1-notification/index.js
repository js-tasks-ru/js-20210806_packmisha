export default class NotificationMessage {
  static isActive;
  body = document.body;

  constructor(str = "", { duration = 0, type = "" } = {}) {
    this.str = str;
    this.duration = duration;
    this.durationSec = duration / 1000;
    this.type = type;

    this.render();
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = `
      <div class="notification ${this.type}" style="--value:${this.durationSec}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">${this.str}</div>
        </div>
      </div>
    `;
    this.element = element.firstElementChild;
  }

  show(body = this.body) {
    if (NotificationMessage.isActive) {
      NotificationMessage.isActive.remove();
    }

    body.append(this.element);

    this.timeout = setTimeout(() => {
      this.remove();
    }, this.duration);

    NotificationMessage.isActive = this.element;
  }

  remove() {
    clearTimeout(this.timeout);
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
