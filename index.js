const buttons = getAll('.beat');

for (let btn of buttons) {
	btn.addEventListener('click', clickBeat);
}

// const playBtn = get('.play');
// let playing = false;
// playBtn.addEventListener('click', clickPlay);

// function tempSequence() {
// 	let idctrs = getAll('.idctr');
// 	let b = 0;
// 	const i = setInterval(() => {
// 		if (b === 8) {
// 			idctrs[b - 1].classList.toggle('on');
// 			b = 0;
// 		}
// 		idctrs[b].classList.toggle('on');
// 		if (b > 0) idctrs[b - 1].classList.toggle('on');
// 		b++;
// 	}, 500);

// 	return () => {
// 		idctrs.forEach((idctr) => {
// 			idctr.classList.remove('on');
// 		});
// 		clearInterval(i);
// 	};
// }

const tempoControl = get('#tempo');
tempoControl.addEventListener('input', tempoChange);

let timerID;

let tempo = 120;

function tempoChange(e) {
	const tempoVal = get('.tempo-val');
	tempo = Number(e.target.value);
	tempoVal.innerText = e.target.value / 2;
}

function clickBeat(e) {
	this.classList.toggle('off');
	this.classList.toggle('on');
	if (this.getAttribute('aria-checked') === 'false') {
		this.setAttribute('aria-checked', 'true');
	} else {
		this.setAttribute('aria-checked', 'false');
	}
}

function get(selector) {
	return document.querySelector(selector);
}

function getAll(selector) {
	return document.querySelectorAll(selector);
}
