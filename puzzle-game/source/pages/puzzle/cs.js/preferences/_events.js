/* eslint-disable indent */
/* eslint-disable no-param-reassign */

const icon = document.querySelector('.preferences-icon');
const [c1, c2, c3] = document.querySelectorAll('.preferences-icon circle');
      [c1, c2, c3].forEach((c) => {
        c.style.transform = 'translateY(0)';
      });

function* animationValue(min, max, direction = 1, current = 0) {
  while (true) {
    if (current <= min
     || current >= max) direction *= -1;
    current += direction; yield current;
  }
}

let interval = -1;
let frameReq = -1;
let mouseover = false;

const D = 2.5;
let g1 = animationValue(-77, 0, +D);
let g2 = animationValue(-77 / 2, +77 / 2, +D);
let g3 = animationValue(0, +77, -D);

function mouseLeaveHandler() {
  let [n1, n2, n3] = [g1, g2, g3].map((g) => g.next().value);

  function animation() {
    if (n1 !== 0) {
      n1 = g1.next().value;
      c1.style.transform = `translateY(${n1}px)`;
    } if (n2 !== 0) {
      n2 = g2.next().value;
      c2.style.transform = `translateY(${n2}px)`;
    } if (n3 !== 0) {
      n3 = g3.next().value;
      c3.style.transform = `translateY(${n3}px)`;
    }

    if (n1 === 0 && n2 === 0 && n3 === 0) {
      g1 = animationValue(-77, 0, +D);
      g2 = animationValue(-77 / 2, +77 / 2, +D);
      g3 = animationValue(0, +77, -D);
      mouseover = false; return;
    }

    requestAnimationFrame(animation);
  }

  if (!mouseover) requestAnimationFrame(animation);
  mouseover = false;

  clearInterval(interval);
  cancelAnimationFrame(frameReq);
}

function mouseEnterHandler() {
  if (mouseover) return; mouseover = true;
  if (icon.classList.contains('active')) return;
  interval = setTimeout(() => {
    function animation() {
      c1.style.transform = `translateY(${g1.next().value}px)`;
      c2.style.transform = `translateY(${g2.next().value}px)`;
      c3.style.transform = `translateY(${g3.next().value}px)`;
      if (icon.classList.contains('active')) {
        mouseLeaveHandler(); return;
      } frameReq = requestAnimationFrame(animation);
    }
    mouseover = false;
    requestAnimationFrame(animation);
  }, 200);
}

function clickHandler() {
  if (this.classList.contains('active')) {
    this.classList.remove('active');
    mouseEnterHandler();
    mouseover = false;
    mouseLeaveHandler();
    mouseover = true;
  } else this.classList.add('active');
}

icon.addEventListener('click', clickHandler);
icon.addEventListener('mouseenter', mouseEnterHandler);
icon.addEventListener('mouseleave', () => !icon.classList.contains('active') && mouseLeaveHandler());