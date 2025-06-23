let arr = [];
let arrDuo = [];
let valueRange = 100;
let numBars = 20;
let speed = 50;
let sorting = false;
let duoMode = false;

const arrayContainer = document.getElementById("sorting-array");
const arrayContainerDuo = document.getElementById("sorting-array-duo");
const valueRangeSlider = document.getElementById("value-range-slider");
const numberSlider = document.getElementById("number-slider");
const speedSlider = document.getElementById("speed-slider");
const algoSelect = document.getElementById("algo-select");
const randomizeBtn = document.getElementById("sort-randomize");
const visualizeBtn = document.getElementById("sort-visualize");
const duoSwitch = document.getElementById("duo-switch");
const duoAlgoDiv = document.getElementById("duo-algo-div");
const duoAlgoSelect = document.getElementById("duo-algo-select");
const algoLabels = document.getElementById("algo-labels");
const algoLabel1 = document.getElementById("algo-label-1");
const algoLabels2 = document.getElementById("algo-labels-2");
const algoLabel2 = document.getElementById("algo-label-2");
const duoDivider = document.getElementById("duo-divider");

function updateAlgoLabels() {
  algoLabel1.textContent = algoSelect.options[algoSelect.selectedIndex].text;
  algoLabel2.textContent =
    duoAlgoSelect.options[duoAlgoSelect.selectedIndex].text;
}

algoSelect.onchange = function () {
  if (duoMode) updateAlgoLabels();
};
duoAlgoSelect.onchange = function () {
  if (duoMode) updateAlgoLabels();
};

duoSwitch.onchange = function () {
  duoMode = this.checked;
  arrayContainerDuo.style.display = duoMode ? "flex" : "none";
  duoAlgoDiv.style.display = duoMode ? "block" : "none";
  duoDivider.style.display = duoMode ? "block" : "none";
  algoLabels.style.display = duoMode ? "flex" : "flex";
  algoLabels2.style.display = duoMode ? "flex" : "none"; // <-- FIXED: show/hide the container
  if (duoMode) {
    arrDuo = [...arr];
    renderArrayDuo();
    updateAlgoLabels();
  }
};
function randomizeArray() {
  arr = Array.from(
    { length: numBars },
    () => Math.floor(Math.random() * valueRange) + 10
  );
  arrDuo = [...arr];
  renderArray();
  if (duoMode) renderArrayDuo();
}
function renderArray(highlighted = [], sortedIdx = []) {
  arrayContainer.innerHTML = "";
  arr.forEach((val, idx) => {
    const bar = document.createElement("div");
    bar.className = "sort-bar";
    bar.style.height = `${val}px`;
    // No need to set width here; it's fixed in CSS
    if (highlighted.includes(idx)) bar.classList.add("active");
    if (sortedIdx.includes(idx)) bar.classList.add("sorted");
    arrayContainer.appendChild(bar);
  });
}

function renderArrayDuo(highlighted = [], sortedIdx = []) {
  arrayContainerDuo.innerHTML = "";
  arrDuo.forEach((val, idx) => {
    const bar = document.createElement("div");
    bar.className = "sort-bar";
    bar.style.height = `${val}px`;
    if (highlighted.includes(idx)) bar.classList.add("active");
    if (sortedIdx.includes(idx)) bar.classList.add("sorted");
    arrayContainerDuo.appendChild(bar);
  });
}

valueRangeSlider.oninput = function () {
  valueRange = +this.value;
  randomizeArray();
};
numberSlider.oninput = function () {
  numBars = +this.value;
  randomizeArray();
};
randomizeBtn.onclick = randomizeArray;

async function bubbleSort(arr, render) {
  let sorted = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      render([j, j + 1], sorted);
      await sleep();
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        render([j, j + 1], sorted);
        await sleep();
      }
    }
    sorted.unshift(arr.length - i - 1); // Mark as sorted
    render([], sorted);
  }
  // Mark all as sorted at the end
  render(
    [],
    Array.from({ length: arr.length }, (_, i) => i)
  );
}

async function selectionSort(arr, render) {
  let sorted = [];
  for (let i = 0; i < arr.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      render([minIdx, j], sorted);
      await sleep();
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    sorted.push(i);
    render([i, minIdx], sorted);
    await sleep();
  }
  render(
    [],
    Array.from({ length: arr.length }, (_, i) => i)
  );
}

async function insertionSort(arr, render) {
  let sorted = [];
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      render([j, j + 1], sorted);
      await sleep();
      j--;
    }
    arr[j + 1] = key;
    sorted = Array.from({ length: i + 1 }, (_, idx) => idx);
    render([j + 1], sorted);
    await sleep();
  }
  render(
    [],
    Array.from({ length: arr.length }, (_, i) => i)
  );
}

async function quickSortHelper(arr, l, r, render, sorted) {
  if (l >= r) return;
  let pivot = arr[r];
  let i = l;
  for (let j = l; j < r; j++) {
    render([j, r], sorted);
    await sleep();
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      render([i, j], sorted);
      await sleep();
      i++;
    }
  }
  [arr[i], arr[r]] = [arr[r], arr[i]];
  sorted.push(i);
  render([i], sorted);
  await sleep();
  await quickSortHelper(arr, l, i - 1, render, sorted);
  await quickSortHelper(arr, i + 1, r, render, sorted);
}
async function quickSort(arr, render) {
  let sorted = [];
  await quickSortHelper(arr, 0, arr.length - 1, render, sorted);
  render(
    [],
    Array.from({ length: arr.length }, (_, i) => i)
  );
}

async function mergeSortHelper(arr, l, r, render, sorted) {
  if (l >= r) return;
  const m = Math.floor((l + r) / 2);
  await mergeSortHelper(arr, l, m, render, sorted);
  await mergeSortHelper(arr, m + 1, r, render, sorted);
  await merge(arr, l, m, r, render, sorted);
}

async function merge(arr, l, m, r, render, sorted) {
  let left = arr.slice(l, m + 1);
  let right = arr.slice(m + 1, r + 1);
  let i = 0,
    j = 0,
    k = l;
  while (i < left.length && j < right.length) {
    arr[k] = left[i] <= right[j] ? left[i++] : right[j++];
    sorted = [];
    render([k], sorted);
    await sleep();
    k++;
  }
  while (i < left.length) {
    arr[k] = left[i++];
    sorted = [];
    render([k], sorted);
    await sleep();
    k++;
  }
  while (j < right.length) {
    arr[k] = right[j++];
    sorted = [];
    render([k], sorted);
    await sleep();
    k++;
  }
}

async function mergeSort(arr, render) {
  let sorted = [];
  await mergeSortHelper(arr, 0, arr.length - 1, render, sorted);
  render(
    [],
    Array.from({ length: arr.length }, (_, i) => i)
  );
}

function sleep() {
  // speed: 1 (slowest) to 100 (fastest)
  // At slowest: 600ms, at fastest: 10ms

  const delay = 760 - 7.5 * speed;
  return new Promise((res) => setTimeout(res, delay));
}

visualizeBtn.onclick = async function () {
  if (sorting) return;
  sorting = true;
  numberSlider.disabled = true;
  valueRangeSlider.disabled = true;
  randomizeBtn.disabled = true;
  algoSelect.disabled = true;
  duoSwitch.disabled = true;
  if (duoMode) duoAlgoSelect.disabled = true;

  if (!duoMode) {
    switch (algoSelect.value) {
      case "bubble":
        await bubbleSort(arr, renderArray);
        break;
      case "selection":
        await selectionSort(arr, renderArray);
        break;
      case "insertion":
        await insertionSort(arr, renderArray);
        break;
      case "merge":
        await mergeSort(arr, renderArray);
        break;
      case "quick":
        await quickSort(arr, renderArray);
        break;
    }
  } else {
    arr = [...arrDuo];
    arrDuo = [...arr];
    let p1 = (async () => {
      switch (algoSelect.value) {
        case "bubble":
          await bubbleSort(arr, renderArray);
          break;
        case "selection":
          await selectionSort(arr, renderArray);
          break;
        case "insertion":
          await insertionSort(arr, renderArray);
          break;
        case "merge":
          await mergeSort(arr, renderArray);
          break;
        case "quick":
          await quickSort(arr, renderArray);
          break;
      }
    })();
    let p2 = (async () => {
      switch (duoAlgoSelect.value) {
        case "bubble":
          await bubbleSort(arrDuo, renderArrayDuo);
          break;
        case "selection":
          await selectionSort(arrDuo, renderArrayDuo);
          break;
        case "insertion":
          await insertionSort(arrDuo, renderArrayDuo);
          break;
        case "merge":
          await mergeSort(arrDuo, renderArrayDuo);
          break;
        case "quick":
          await quickSort(arrDuo, renderArrayDuo);
          break;
      }
    })();
    await Promise.all([p1, p2]);
  }

  sorting = false;
  numberSlider.disabled = false;
  valueRangeSlider.disabled = false;
  randomizeBtn.disabled = false;
  algoSelect.disabled = false;
  duoSwitch.disabled = false;
  if (duoMode) duoAlgoSelect.disabled = false;
};
speedSlider.oninput = function () {
  speed = +this.value;
};

window.addEventListener("DOMContentLoaded", randomizeArray);
