let dataController = function() {
	let data

	data = {
		difficulty: "hard",
		colors: [],
		correctIdx: null,
		clicked: [],
		won: null,
	};

	return {
		newGame: function() {
			let numBoxes;
			// Clear necessary data
			data.colors = [];
			data.correctIdx = null;
			// Set number of boxes with difficulty
			if (data.difficulty == "easy") {
				numBoxes = 3;
			} else {
				numBoxes = 6;
			}
			// Generate colors
			for (let i=0; i < numBoxes; i++) {
				let color = [];
				for (let j=0; j < 3; j++) {
					color[j] = Math.floor(Math.random()*(255+1));
				}
				data.colors[i] = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
			}
			// Choose correct color index
			data.correctIdx = Math.floor(Math.random()*numBoxes);
			// Set won to false
			data.won = false;
		},
		getColors: function() {
			return data.colors;
		},
		getCorrectIdx: function() {
			return data.correctIdx;
		},
		difficulty: function(val) {
			if (val === undefined) {
				return data.difficulty;
			} else if (val === "easy" || val === "hard") {
				data.difficulty = val;
			} else {
				console.log(`Invalid setting of difficulty: ${val}`);
			}
		},
		hasWon: function(val) {
			if (val === undefined) {
				return data.won;
			} else if (typeof(val) === "boolean") {
				data.won = val;
			} else {
				console.log(`Non boolean value passed to hasWon(): ${val}`);
			}
		},
	}
}

let uiController = function() {
  let domObjs;
	domObjs = {
		correctColor: document.querySelector('section.top h1'),
    boxRow: document.querySelector('section.main div.row'),
		colorBoxes: [],
		leftButton: document.querySelector('div.left'),
		header: document.querySelector('section.top'),
		middleText: document.querySelector('div.middle'),
		difficultyBox: document.querySelector('div.right'),
		easyBtn: document.querySelector('div.easy'),
		hardBtn: document.querySelector('div.hard'),
	};

	// const defaultBgColor = getComputedStyle(domObjs.header).backgroundColor;
	// const defaultTextColor = getComputedStyle(domObjs.header).color;

	function initializeBoxes(numBoxes) {
		// Remove existing boxes from domObjs
		domObjs.colorBoxes = [];
		// Remove existing boxes from HTML
		domObjs.boxRow.innerHTML = "";
		// For each box
		for (let i=0; i < numBoxes; i++) {
			// Insert a box
			domObjs.boxRow.insertAdjacentHTML('beforeend',`<div class="colorbox" id="id${i}"></div>`)
			// Find colorBox object.  Note: May not need this
			let obj = document.querySelector(`#id${i}`);
			// update domObjs
			domObjs.colorBoxes.push(obj);
		}
	}

	function newColorsAndDisplay(colors) {
		// Gives boxes new colors and makes them visible again
		domObjs.colorBoxes.forEach( function(cur, i) {
			cur.style.background = colors[i];
			cur.style.display = "";
		});
	}

	return {
		newGame: function(colors, correctIdx) {
			// Display correct colors in heading
			domObjs.correctColor.textContent = colors[correctIdx];
			// Fill color boxes with new colors and reset visibility.
			// id corresponds to index.
			// Note: This must match the order colors were generated in dataInit.
			// This might be error prone in dataInit changes.
			newColorsAndDisplay(colors);
			// Update left button text
      domObjs.leftButton.textContent = 'NEW COLORS';
			// Display default header color
			// domObjs.header.style.background = defaultBgColor;
			domObjs.header.style.background = ""; 
			// Clear middle text
			domObjs.middleText.textContent = "";
		},
		initializeBoxes: initializeBoxes,
		initToggleButtons: function() {
			// Initialize inline style on hardBtn for toggling
			domObjs.hardBtn.classList.toggle("inverted");
		},
		tryAgainDisplay: function(target) {
			// Hide clicked square
			target.style.display = "none";
			// Display middle text "Try again"
			domObjs.middleText.textContent = "Try again";
		},
		wonDisplay: function(correctColor) {
			// Middle text display "correct"
			domObjs.middleText.textContent = "Correct!";
			// Change header color to correct color
			domObjs.header.style.background = correctColor;
			// Change colorBoxes color to correct color
			// Could make other colorBoxes visible again here.
			domObjs.colorBoxes.forEach( function(cur) {
				cur.style.background = correctColor;
			});
			// Change Left button text
			domObjs.leftButton.textContent = "PLAY AGAIN";
		},
		toggleSwitch: function() {
			// // Toggle each button's color and background color
			// [domObjs.easyBtn, domObjs.hardBtn].forEach( cur => {
			// // If no inline style, apply inverted style.  Otherwise, clear inline style
			// if (cur.style.color == "") {
			// [cur.style.background, cur.style.color] = [defaultTextColor, defaultBgColor];
			// } else {
			// [cur.style.background, cur.style.color] = ["",""];
			// }
			// });
			domObjs.easyBtn.classList.toggle("inverted");
			domObjs.hardBtn.classList.toggle("inverted");
		},
		getDomObjs: function() {
			return {
				boxRow: domObjs.boxRow,
				leftButton: domObjs.leftButton,
				difficultyBox: domObjs.difficultyBox,
			}
		},
	}
};

let controller = function(dataCtrl, uiCtrl) {
	let domObjs
	domObjs = uiCtrl.getDomObjs();
	
	// Click colorBox event
	domObjs.boxRow.addEventListener('click', function(event) {
		// Do nothing if already won (game is over), or not clicked a colorbox
		if (dataCtrl.hasWon() || !(event.target.className == "colorbox")) {
			return;
		}
		// Check if it was the correct box
		if (event.target.id == `id${dataCtrl.getCorrectIdx()}`) {
			dataCtrl.hasWon(true);
			uiCtrl.wonDisplay(dataCtrl.getColors()[dataCtrl.getCorrectIdx()]);
		} else {
			// dataCtrl.updateClicked()  // May not need this
			uiCtrl.tryAgainDisplay(event.target);
		}
	});
	
	// Click left button event
	domObjs.leftButton.addEventListener('click', newGame);

	// Click toggleDifficulty event
	domObjs.difficultyBox.addEventListener('click', function(event) {
		// Extract btnType from first class name
		let btnType = event.target.classList[0];
		// Only do something if button wasn't current difficulty
		if (btnType !== dataCtrl.difficulty()) {
			// Change difficulty in data
			dataCtrl.difficulty(btnType);
			// Show button toggle in ui
			uiCtrl.toggleSwitch();
			// Start new game
			newGameToggle();
		}
	});

	function init() {
		// Follow during first loading of the game
		// Create new game in data
		dataCtrl.newGame();
		// Initialize colorBoxes to correct number of boxes in ui
		uiCtrl.initializeBoxes(dataCtrl.getColors().length);
		// Initialize toggle buttons
    uiCtrl.initToggleButtons();
		// Create new game in ui
		uiCtrl.newGame(dataCtrl.getColors(), dataCtrl.getCorrectIdx());
	}
	function newGame() {
		// Follow after pressing left button for new game
		dataCtrl.newGame();
		uiCtrl.newGame(dataCtrl.getColors(), dataCtrl.getCorrectIdx());
	}
	function newGameToggle() {
		// Follow when creating new game after difficulty toggle
		// Create new game in data
		dataCtrl.newGame();
		// Initialize colorBoxes to correct number of boxes in ui
		uiCtrl.initializeBoxes(dataCtrl.getColors().length);
		// Create new game in ui
		uiCtrl.newGame(dataCtrl.getColors(), dataCtrl.getCorrectIdx());
	}

	return {
		initGame: init,
		uiCtrl: uiCtrl,
		dataCtrl: dataCtrl,
	}
};

let ctrl = controller(dataController(), uiController());

ctrl.initGame();
