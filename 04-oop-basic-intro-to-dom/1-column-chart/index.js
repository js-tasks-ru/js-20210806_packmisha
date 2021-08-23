export default class ColumnChart {
  chartHeight = 50;

  constructor({
    data = [],
    label = "",
    link = "",
    value = 0,
    formatHeading = (data) => data,
  } = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = formatHeading(value);

    this.render();
  }

  render() {
    const element = document.createElement("div");
    const header = this.formatHeading
      ? this.formatHeading(this.value)
      : this.value;

    element.innerHTML = `
    <div class="column-chart" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
            Total ${this.label}
            <a href="/${this.link}" class="column-chart__link">View all</a>
        </div>
        <div class="column-chart__container">
            <div data-element="header" class="column-chart__header">${header}</div>
            <div data-element="body" class="column-chart__chart">
            </div>
        </div>
    </div>`;

    this.element = element.firstElementChild;
    this.update();
  }

  update() {
    if (!this.data.length) {
      this.element.classList.add("column-chart_loading");
      return;
    }

    const dataBody = this.element.querySelector(".column-chart__chart");

    const dataArr = this.getColumnProps(this.data);
    dataArr.forEach((element) => {
      const column = document.createElement("div");
      column.setAttribute("style", "--value: " + element.value);
      column.setAttribute("data-tooltip", element.percent);

      dataBody.append(column);
    });
  }

  getColumnProps(arr) {
    const maxValue = Math.max(...arr);
    const scale = this.chartHeight / maxValue;

    return arr.map((item) => ({
      percent: ((item / maxValue) * 100).toFixed(0) + "%",
      value: Math.floor(item * scale) + "",
    }));
  }

  remove() {
    this.element.remove();
  }
  destroy() {
    this.remove();
  }
}
