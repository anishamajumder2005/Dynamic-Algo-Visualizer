let arr = [];
let valueRange = 100;
let numBars = 20;
let speed = 50;
let sorting = false;

const arrayContainer = document.getElementById('sorting-array');
const valueRangeSlider = document.getElementById('value-range-slider');
const numberSlider = document.getElementById('number-slider');
const speedSlider = document.getElementById('speed-slider');
const algoSelect = document.getElementById('algo-select');
const randomizeBtn = document.getElementById('sort-randomize');
const visualizeBtn = document.getElementById('sort-visualize');

function randomizeArray() {
  arr = Array.from({length: numBars}, () => Math.floor(Math.random() * valueRange) + 10);
  renderArray();
}

function renderArray(highlighted = []) {
  arrayContainer.innerHTML = '';
  arr.forEach((val, idx) => {
    const bar = document.createElement('div');
    bar.style.height = `${val}px`;
    bar.style.width = `${Math.floor(600/numBars)}px`;
    bar.style.background = highlighted.includes(idx) ? 'red' : 'black';
    bar.style.borderRadius = '4px 4px 0 0';
    arrayContainer.appendChild(bar);
  });
}

valueRangeSlider.oninput = function() {
  valueRange = +this.value;
  randomizeArray();
};
numberSlider.oninput = function() {
  numBars = +this.value;
  randomizeArray();
};
randomizeBtn.onclick = randomizeArray;

// Sorting algorithms (simple versions)
async function bubbleSort() {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      renderArray([j, j+1]);
      await sleep();
      if (arr[j] > arr[j+1]) {
        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
        renderArray([j, j+1]);
        await sleep();
      }
    }
  }
  renderArray();
}

async function selectionSort() {
  for (let i = 0; i < arr.length; i++) {
    let minIdx = i;
    for (let j = i+1; j < arr.length; j++) {
      renderArray([minIdx, j]);
      await sleep();
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    renderArray([i, minIdx]);
    await sleep();
  }
  renderArray();
}

async function insertionSort() {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j+1] = arr[j];
      renderArray([j, j+1]);
      await sleep();
      j--;
    }
    arr[j+1] = key;
    renderArray([j+1]);
    await sleep();
  }
  renderArray();
}

async function quickSortHelper(l, r) {
  if (l >= r) return;
  let pivot = arr[r];
  let i = l;
  for (let j = l; j < r; j++) {
    renderArray([j, r]);
    await sleep();
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[r]] = [arr[r], arr[i]];
  renderArray([i]);
  await sleep();
  await quickSortHelper(l, i-1);
  await quickSortHelper(i+1, r);
}
async function quickSort() {
  await quickSortHelper(0, arr.length-1);
  renderArray();
}

async function mergeSortHelper(l, r) {
  if (l >= r) return;
  const m = Math.floor((l + r) / 2);
  await mergeSortHelper(l, m);
  await mergeSortHelper(m + 1, r);
  await merge(l, m, r);
}

async function merge(l, m, r) {
  let left = arr.slice(l, m + 1);
  let right = arr.slice(m + 1, r + 1);
  let i = 0, j = 0, k = l;
  while (i < left.length && j < right.length) {
    arr[k] = (left[i] <= right[j]) ? left[i++] : right[j++];
    renderArray([k]);
    await sleep();
    k++;
  }
  while (i < left.length) {
    arr[k] = left[i++];
    renderArray([k]);
    await sleep();
    k++;
  }
  while (j < right.length) {
    arr[k] = right[j++];
    renderArray([k]);
    await sleep();
    k++;
  }
}

async function mergeSort() {
  await mergeSortHelper(0, arr.length - 1);
  renderArray();
}

function sleep() {
  return new Promise(res => setTimeout(res, 101 - speed));
}

visualizeBtn.onclick = async function() {
  if (sorting) return;
  sorting = true;
  switch(algoSelect.value) {
    case 'bubble': await bubbleSort(); break;
    case 'selection': await selectionSort(); break;
    case 'insertion': await insertionSort(); break;
    case 'merge': await mergeSort(); break;
    case 'quick': await quickSort(); break;
    
  }
  sorting = false;
};

speedSlider.oninput = function() {
  speed = +this.value;
};

window.addEventListener('DOMContentLoaded', randomizeArray);