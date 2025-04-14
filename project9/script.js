const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const toolBtns = document.querySelectorAll('button');
const sizeSlider = document.getElementById('sizePicker');
const colorBTN = document.getElementById('colorPicker');
const clearBtn = document.getElementById('clearCanvas');
const saveBtn = document.getElementById('saveBtn');

let isDrawing = false;
let brushWidth = 5;
let selectedTool = 'pencil';
let selectedColor = '#000000';

window.addEventListener('load', () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

const startDraw = (e) => {
  isDrawing = true;
  ctx.beginPath();
  ctx.lineWidth = brushWidth;

  ctx.strokeStyle = (selectedTool === 'eraser') ? '#FFFFFF' : selectedColor;

  ctx.moveTo(e.offsetX, e.offsetY);
};

const drawing = (e) => {
  if (!isDrawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
};

toolBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    selectedTool = btn.id;
    console.log('Ferramenta selecionada:', selectedTool);
  });
});

colorBTN.addEventListener('change', () => {
  selectedColor = colorBTN.value;
  console.log('Cor selecionada:', selectedColor);
});

sizeSlider.addEventListener('change', () => {
  brushWidth = sizeSlider.value;
});

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', drawing);
canvas.addEventListener('mouseup', () => {
  isDrawing = false;
});

clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#FFFFFF'; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

saveBtn.addEventListener('click', () => {
    const link = document.createElement('a')
    link.download = 'minha_Arte.png'
    link.hrefcanvas.toDataURL(); 
    link.click();
    console.log('jbddhg')
});
