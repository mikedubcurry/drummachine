const eightOeight = get('.sample-808');
const kick = get('.sample-kick');
const hihat = get('.sample-hh');
const crash = get('.sample-crash');
const snare = get('.sample-snare');

const eightOeightVol = get('#eightOeight-gain');
const kickVol = get('#kick-gain');
const hihatVol = get('#highhat-gain');
const crashVol = get('#crash-gain');
const snareVol = get('#snare-gain');

const ctx = new AudioContext();

const eightOeightGain = ctx.createGain();
const kickGain = ctx.createGain();
const hihatGain = ctx.createGain();
const crashGain = ctx.createGain();
const snareGain = ctx.createGain();

watchVolChange(eightOeightVol, eightOeightGain);
watchVolChange(kickVol, kickGain);
watchVolChange(hihatVol, hihatGain);
watchVolChange(crashVol, crashGain);
watchVolChange(snareVol, snareGain);

function watchVolChange(control, gainNode) {
	control.addEventListener(
		'input',
		function () {
			console.log(this.value / 100);
			console.log(gainNode.gain.value);
			gainNode.gain.value = this.value / 100;
		},
		false
	);
}

async function getSamples(audioContext, filepaths) {
	return Promise.all(
		filepaths.map(async (filepath) => {
			const response = await fetch('samples/' + filepath);
			const arrayBuffer = await response.arrayBuffer();
			const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
			return audioBuffer;
		})
	);
}

async function setupSample(file) {
	const sample = await getSample(ctx, file);
	return sample;
}

const samples = ['808.wav', 'kick.wav', 'crash.wav', 'snare.wav', 'hihat.wav'];
// getSamples(ctx, samples).then((buffers) => {
// 	console.log(buffers);
// 	// document.body.addEventListener('click', () => {
// 	// 	playSample(ctx, buffers[0], eightOeightGain, 0);
// 	// });
// });

function playSample(audioCtx, audioBuffer, gainNode, time) {
	const sampleSource = audioCtx.createBufferSource();
	sampleSource.buffer = audioBuffer;
	sampleSource.connect(gainNode);
	gainNode.connect(audioCtx.destination);
	sampleSource.start(time);
	return sampleSource;
}

const lookahead = 25.0;
const scheduleAheadTime = 0.1;

let currentNote = 0;
let nextNoteTime = 0.0;

function nextNote() {
	const secondsPerBeat = 60.0 / tempo;
	nextNoteTime += secondsPerBeat;

	currentNote++;
	if (currentNote === 8) {
		currentNote = 0;
	}
}

const pads = getAll('.pads');
console.log(pads);
const notesInQueue = [];
let crashSample, hiHatSample, snareSample, kickSample, eightOeightSample;
function scheduleNote(beatNumber, time) {
	notesInQueue.push({ note: beatNumber, time });
	if (
		pads[0]
			.querySelectorAll('button')
			[beatNumber].getAttribute('aria-checked') === 'true'
	) {
		playSample(ctx, crashSample, crashGain, time);
	}
	if (
		pads[1]
			.querySelectorAll('button')
			[beatNumber].getAttribute('aria-checked') === 'true'
	) {
		playSample(ctx, hiHatSample, hihatGain, time);
	}
	if (
		pads[2]
			.querySelectorAll('button')
			[beatNumber].getAttribute('aria-checked') === 'true'
	) {
		playSample(ctx, snareSample, snareGain, time);
	}
	console.log(
		pads[3].querySelectorAll('button')[0].getAttribute('aria-checked')
	);
	if (
		pads[3]
			.querySelectorAll('button')
			[beatNumber].getAttribute('aria-checked') === 'true'
	) {
		console.log('should play kick');
		playSample(ctx, kickSample, kickGain, time);
	}
	if (
		pads[4]
			.querySelectorAll('button')
			[beatNumber].getAttribute('aria-checked') === 'true'
	) {
		playSample(ctx, eightOeightSample, eightOeightGain, time);
	}
}

function scheduler() {
	while (nextNoteTime < ctx.currentTime + scheduleAheadTime) {
		scheduleNote(currentNote, nextNoteTime);
		nextNote();
	}
	timerID = setTimeout(scheduler, lookahead);
}

let lastNoteDrawn = 7;

const idctrs = getAll('.idctr');

function draw() {
	let drawNote = lastNoteDrawn;
	let currentTime = ctx.currentTime;

	while (notesInQueue.length && notesInQueue[0].time < currentTime) {
		drawNote = notesInQueue[0].note;
		notesInQueue.splice(0, 1);
	}

	if (lastNoteDrawn != drawNote) {
		idctrs.forEach((el, i) => {
			idctrs[lastNoteDrawn].classList.remove('on');
			idctrs[drawNote].classList.add('on');
		});
		lastNoteDrawn = drawNote;
	}

	requestAnimationFrame(draw);
}

const playBtn = get('.play');
let playing = false;

function clickPlay(e) {
	playing = !playing;
	this.innerText = playing ? 'Stop' : 'Play';
	if (playing) {
		if (ctx.state === 'suspended') {
			ctx.resume();
		}

		currentNote = 0;
		nextNoteTime = ctx.currentTime;
		scheduler();
		requestAnimationFrame(draw);
		this.dataset.playing = 'true';
	} else {
		// stop();
		window.clearTimeout(timerID);
		this.dataset.playing = 'false';
	}
}

getSamples(ctx, samples).then((buffers) => {
	console.log(buffers);
	// '808.wav', 'kick.wav', 'crash.wav', 'snare.wav', 'hihat.wav'
	[eightOeightSample, kickSample, crashSample, snareSample, hiHatSample] =
		buffers;
	playBtn.addEventListener('click', function (e) {
		playing = !playing;
		this.innerText = playing ? 'Stop' : 'Play';
		if (playing) {
			if (ctx.state === 'suspended') {
				ctx.resume();
			}

			currentNote = 0;
			nextNoteTime = ctx.currentTime;
			scheduler();
			requestAnimationFrame(draw);
			this.dataset.playing = 'true';
		} else {
			// stop();
			window.clearTimeout(timerID);
			this.dataset.playing = 'false';
		}
	});
});
