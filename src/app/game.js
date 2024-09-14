import { timestamp, bound } from './helpers';
import {
	DIRECTIONS,
	MAP,
	TILE,
	GRAVITY,
	MAXDX,
	MAXDY,
	ACCEL,
	FRICTION,
	IMPULSE,
	KEY,
	step,
	canvas,
	ctx,
	width,
	height,
	assets,
	font,
} from './constants';
import { startGame } from './main';

var player = {},
	cells = [],
	win = false,
	gameOver = false;

var t2p = (t) => {
		return t * TILE;
	},
	p2t = (p) => {
		return Math.floor(p / TILE);
	},
	cellAvailable = (x, y) => {
		return tcell(p2t(x), p2t(y));
	},
	tcell = (tx, ty, notRend = true) => {
		var cell = cells[tx + ty * MAP.tw];
		return cell;
	};

function onkey(ev, key, down) {
	switch (key) {
		case KEY.SPACE:
			if (!down) changePlayerDirection();
			ev.preventDefault();
			return false;
	}
}

function update(dt) {
	updatePlayer(dt);
}

function changePlayerDirection() {
	const orientation = (player.orientation + 1) % 4;
	player.orientation = DIRECTIONS[orientation];
}

function updatePlayer(dt) {
	updatePlayer4ways();
}

function updatePlayer4ways() {
	var accel = player.accel;

	checkPlayerPositions(player);

	player.ddx = 0;
	player.ddy = 0;

	if (player.orientation === 3) {
		player.ddy = 0;
		player.dy = 0;
		player.ddx = player.ddx - accel;
	}

	if (player.orientation === 1) {
		player.ddy = 0;
		player.dy = 0;
		player.ddx = player.ddx + accel;
	}

	if (player.orientation === 0) {
		player.ddx = 0;
		player.dx = 0;
		player.ddy = player.ddy - accel;
	}

	if (player.orientation === 2) {
		player.ddx = 0;
		player.dx = 0;
		player.ddy = player.ddy + accel;
	}

	player.x = player.x + dt * player.dx;
	player.y = player.y + dt * player.dy;
	player.dx = bound(player.dx + dt * player.ddx, -player.maxdx, player.maxdx);
	player.dy = bound(player.dy + dt * player.ddy, -player.maxdy, player.maxdy);

	var tx = p2t(player.x),
		ty = p2t(player.y),
		nx = player.x % TILE,
		ny = player.y % TILE,
		cell = tcell(tx, ty),
		cellright = tcell(tx + 1, ty),
		celldown = tcell(tx, ty + 1),
		celldiag = tcell(tx + 1, ty + 1);

	if (player.dy > 0) {
		if ((celldown && !cell) || (celldiag && !cellright && nx)) {
			player.y = t2p(ty);
			player.dy = 0;
			player.orientation = 0;
			ny = 0;
		}
	} else if (player.dy < 0) {
		if ((cell && !celldown) || (cellright && !celldiag && nx)) {
			player.y = t2p(ty + 1);
			player.orientation = 2;
			cell = celldown;
			cellright = celldiag;
			ny = 0;
		}
	}

	if (player.dx > 0) {
		if ((cellright && !cell) || (celldiag && !celldown && ny)) {
			player.x = t2p(tx);
			player.orientation = 3;
		}
	} else if (player.dx < 0) {
		if ((cell && !cellright) || (celldown && !celldiag && ny)) {
			player.x = t2p(tx + 1);
			player.orientation = 1;
		}
	}
}

function checkPlayerPositions(entity) {
	if (Math.round(entity.x) >= TILE * (MAP.tw - 1)) {
		if (cellAvailable(0, entity.y) === 0 && cellAvailable(1, entity.y) === 0) {
			entity.x = 0.5;
		} else {
			entity.x = TILE * (MAP.tw - 1) - 0.5;
		}
	} else if (Math.round(entity.x) <= 0) {
		if (
			cellAvailable(TILE * (MAP.tw - 1), entity.y) === 0 &&
			cellAvailable(TILE * (MAP.tw - 1) - 1, entity.y) === 0
		) {
			entity.x = TILE * (MAP.tw - 1) - 0.5;
		} else {
			entity.x = 0.5;
		}
	} else if (Math.round(entity.y) >= TILE * (MAP.th - 1)) {
		startGame();
		if (cellAvailable(entity.x, 0) === 0 && cellAvailable(entity.x, 1) === 0) {
			entity.y = 0.5;
		} else {
			entity.y = TILE * (MAP.th - 1) - 0.5;
		}
	} else if (Math.round(entity.y) <= 0) {
		player.orientation = 2;
		if (
			cellAvailable(entity.x, TILE * (MAP.th - 1)) === 0 &&
			cellAvailable(entity.x, TILE * (MAP.th - 1) - 1) === 0
		) {
			entity.y = TILE * (MAP.th - 1) - 0.5;
		} else {
			entity.y = 0.5;
		}
	}
}

function render(ctx, frame, dt) {
	// console.log(frame);
	ctx.clearRect(0, 0, width, height);
	renderMap(ctx);
	renderPlayer(ctx, dt);
}

function renderMap(ctx) {
	// console.log('renderMap');
	for (var y = 0; y < MAP.th; y++) {
		for (var x = 0; x < MAP.tw; x++) {
			var cell = tcell(x, y, false);
			if (cell === 0) {
				ctx.drawImage(assets, 0, 0, TILE, TILE, x * TILE, y * TILE, TILE, TILE);
			} else if (cell) {
				ctx.drawImage(assets, (cell - 1) * TILE, 0, TILE, TILE, x * TILE, y * TILE, TILE, TILE);
			}
		}
	}
}

function renderPlayer(ctx, dt) {
	var or = player.orientation === 'right' ? 12 : 11;
	ctx.drawImage(assets, or * TILE, 0, TILE, TILE, player.x, player.y, TILE, TILE);
}

function setup(map) {
	console.log('setup');
	player = {};
	cells = [];
	win = false;
	gameOver = false;

	var data = map.layers[0].data,
		objects = map.layers[1].objects;

	for (var n = 0; n < objects.length; n++) {
		var obj = objects[n];
		var entity = setupEntity(obj);

		switch (obj.type) {
			case 'player':
				player = entity;
				break;
		}
	}

	cells = data;
}

function setupEntity(obj) {
	if (!obj.properties) obj.properties = {};

	var entity = {
		x: obj.x,
		y: obj.y,
		dx: 0,
		dy: 0,
		gravity: TILE * (obj.properties.gravity || GRAVITY),
		maxdx: TILE * (obj.properties.maxdx || MAXDX),
		maxdy: TILE * (obj.properties.maxdy || MAXDY),
		impulse: TILE * (obj.properties.impulse || IMPULSE),
		player: obj.type == 'player',
		left: obj.properties.left,
		right: obj.properties.right,
		color: obj.properties.color,
		type: obj.properties.type,
		orientation: 2,
		start: {
			x: obj.x,
			y: obj.y,
		},
	};

	entity.accel = entity.maxdx / (obj.properties.accel || ACCEL);
	entity.friction = entity.maxdx / (obj.properties.friction || FRICTION);

	return entity;
}

var counter = 0,
	dt = 0,
	now,
	last = timestamp();

function frame() {
	now = timestamp();
	dt = dt + Math.min(1, (now - last) / 1000);
	while (dt > step) {
		dt = dt - step;
		update(step);
	}
	if (!win && !gameOver) render(ctx, counter, dt);

	last = now;
	counter++;
	requestAnimationFrame(frame, canvas);
}

export { setup, frame, onkey };
