const block_size = 80;
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var p1x;
var p1y;
var p2x;
var p2y;

const tankUp = new Image();
tankUp.src = "img/up_tank.png";
const tankDown = new Image();
tankDown.src = "img/down_tank.png";
const tankLeft = new Image();
tankLeft.src = "img/left_tank.png";
const tankRight = new Image();
tankRight.src = "img/right_tank.png";

const tank2Up = new Image();
tank2Up.src = "img/up_tank2.png";
const tank2Down = new Image();
tank2Down.src = "img/down_tank2.png";
const tank2Left = new Image();
tank2Left.src = "img/left_tank2.png";
const tank2Right = new Image();
tank2Right.src = "img/right_tank2.png";


var tank_img = tankUp;
var tank2_img = tank2Down;

var p1_pressed = null;
var p2_pressed = null;
var game_interval;
const wall1 = new Image();
wall1.src = "img/wall.png";
const grass = new Image();
grass.src = "img/grass.png"
const water = new Image();
water.src = "img/water.png";
var images = [
	tankUp, tankDown, tankLeft, tankRight, 
	tank2Up, tank2Down, tank2Left, tank2Right,
	wall1, grass, water
];
var game_map=[
	[0,0,0,0,0,2,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,3,4,0,0,0,0,5,5,0],
	[4,3,0,4,0,0,0,0,0,0],
	[4,3,5,3,4,3,3,0,3,0],
	[4,0,0,0,0,4,0,0,3,0],
	[4,0,0,0,0,3,3,0,3,0],
	[0,0,0,0,0,0,3,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,1,0,0,0,0,0],
];
var bullet_map = game_map.map(function (x){
	return new Array(x.length).fill(0);
});

Promise.all(images.map(img => {
    if (img.complete)
        return Promise.resolve(img.naturalHeight !== 0);
    return new Promise(resolve => {
        img.addEventListener('load', () => resolve(true));
        img.addEventListener('error', () => resolve(false));
    });
})).then(results => {
    if (results.every(res => res))
		game_interval = setInterval(() => drawLevel(), 80);
    else
        alert('Ошибка загрузки изображений');
});



document.addEventListener('keydown', function (event){
	if (event.code == "ArrowUp" || event.code == "ArrowDown" || 
		event.code == "ArrowLeft" || event.code == "ArrowRight" ||event.code == "Enter")
	{
		p1_pressed = event.code;
	}
	if (event.code == "KeyW" || event.code == "KeyD" || 
		event.code == "KeyS" || event.code == "KeyA" ||event.code == "Space")
	{
		p2_pressed = event.code;
	}
});

function drawLevel()
{
	context.clearRect(0, 0, canvas.width, canvas.height);
	var bullet_map_next = bullet_map.map(function (x) {return new Array(x.length).fill(0) });

	moveP1();
	moveP2();
	for (var i = 0; i < game_map.length; i++){
		for (var j = 0; j < game_map.length; j++) {
			if (game_map[i][j] === 1){
				drawImage(tank_img, j * block_size, i * block_size);
				p1x = j;
				p1y = i;
			}
			if (game_map[i][j] === 2) 
			{
				drawImage(tank2_img, j * block_size, i * block_size);
				p2x =j;
				p2y =i;
			}
			if (game_map[i][j] ===3)
			{
				drawImage(wall1, j * block_size, i * block_size);
			}
			if (game_map[i][j] === 4)
			{
				drawImage(grass, j * block_size, i * block_size)
			}
			if (game_map[i][j] === 5)
			{
				drawImage(water, j * block_size, i * block_size)
			}
			if (bullet_map[i][j] != 0)
			{
				let bul = bullet_map[i][j];
				let ii;
				let jj;
				switch (game_map[i][j]){
					case 1:	newPos(1);
						break;
					case 2: newPos(2);
						break;
					case 3: bullet_map_next[i][j] = 0;
						break;
					case 4: game_map[i][j] = 0;
						break;
					default: 
						if ((bul === 1)&&(i > 0)) {
							ii=i-1;
							jj=j;
						}
						if ((bul === 2)&&(j < game_map.length -1)) {
							ii=i;
							jj=j+1;
						}
						if ((bul === 3)&&(i < game_map.length -1)) {
							ii=i+1;
							jj=j;
						}
						if ((bul === 4)&&(j > 0)) {
							ii=i;
							jj=j-1;
						}
						if (ii === undefined)
							break;
						if((bullet_map[ii][jj] === 1 && bullet_map[i][j] === 3)||
						(bullet_map[ii][jj] === 2 && bullet_map[i][j] === 4)||
						(bullet_map[ii][jj] === 3 && bullet_map[i][j] === 1)||
						(bullet_map[ii][jj] === 4 && bullet_map[i][j] === 2))
								bullet_map[ii][jj] =0;// устроить ВЗРЫВ
							else 
								if (bullet_map_next[ii][jj] != 0)
									bullet_map_next[ii][jj] =0 //EXPLOSIONS	
								else bullet_map_next[ii][jj] = bul;
						break;
						
				}
				{
					var centerX = j*block_size + block_size /2;
					var centerY = i*block_size + block_size /2;
					context.fillStyle = "white";
					context.fillRect(centerX -5, centerY -5 , 10,10);
				}
			}
		}
	}
	bullet_map = bullet_map_next.slice();
}
function logmap(map)
{
	for(var i=0;i<map.length;i++)
		console.log(map[i]);
	console.log("\n");
}
function drawImage(source, x, y)
{
	context.drawImage(source, x, y, block_size, block_size);
};

function moveP1()
{
	if (p1_pressed == "ArrowUp") {
		if (tank_img != tankUp)
			tank_img = tankUp;
		else
			if(p1y > 0)
			if (game_map[p1y - 1][p1x] === 0) {

				game_map[p1y][p1x] = 0;
				game_map[p1y - 1][p1x] = 1;
			}
	}
	if (p1_pressed == "ArrowDown") {
		if (tank_img != tankDown)
			tank_img = tankDown;
		else
		if(p1y < game_map.length - 1)
			if (game_map[p1y + 1][p1x] === 0) {
				game_map[p1y][p1x] = 0;
				game_map[p1y + 1][p1x] = 1;
			}
	}
	if (p1_pressed == "ArrowLeft" ){
		if (tank_img != tankLeft)
			tank_img = tankLeft;
		else
		if(p1x > 0)
			if (game_map[p1y][p1x - 1] === 0) {
				game_map[p1y][p1x] = 0;
				game_map[p1y][p1x - 1] = 1;
			}
	}
	if (p1_pressed == "ArrowRight") {
		if (tank_img != tankRight)
			tank_img = tankRight;
		else
		if(p1x < game_map.length - 1)
			if (game_map[p1y][p1x + 1] === 0) {
				game_map[p1y][p1x] = 0;
				game_map[p1y][p1x + 1] = 1;
			}
	}
	if (p1_pressed == "Enter")
	{
		switch(tank_img){
			case tankUp: 
				if(p1y>0)
					bullet_map[p1y-1][p1x] = 1;
			break;
			case tankDown: 
				if(p1y<game_map.length - 1)
					bullet_map[p1y+1][p1x] = 3;
			break;
			case tankLeft: 
				if(p1x>0)
					bullet_map[p1y][p1x-1] = 4;
			break;
			case tankRight: 
				if(p1x<game_map.length - 1)
					bullet_map[p1y][p1x+1] = 2;
			break;
		}
	}
	p1_pressed = null;
}

function moveP2()
{
	if (p2_pressed == "KeyW") {
		if (tank2_img != tank2Up)
			tank2_img = tank2Up;
		else
			if(p2y > 0)
			if (game_map[p2y - 1][p2x] === 0) {

				game_map[p2y][p2x] = 0;
				game_map[p2y - 1][p2x] = 2;
			}
	}
	if (p2_pressed == "KeyS") {
		if (tank2_img != tank2Down)
			tank2_img = tank2Down;
		else
		if(p2y < game_map.length - 1)
			if (game_map[p2y + 1][p2x] === 0) {
				game_map[p2y][p2x] = 0;
				game_map[p2y + 1][p2x] = 2;
			}
	}
	if (p2_pressed == "KeyA" ){
		if (tank2_img != tank2Left)
			tank2_img = tank2Left;
		else
		if(p2x > 0)
			if (game_map[p2y][p2x - 1] === 0) {
				game_map[p2y][p2x] = 0;
				game_map[p2y][p2x - 1] = 2;
			}
	}
	if (p2_pressed == "KeyD") {
		if (tank2_img != tank2Right)
			tank2_img = tank2Right;
		else
		if(p2x < game_map.length - 1)
			if (game_map[p2y][p2x + 1] === 0) {
				game_map[p2y][p2x] = 0;
				game_map[p2y][p2x + 1] = 2;
			}
	}
	if (p2_pressed == "Space")
	{
		switch(tank2_img){
			case tank2Up: 
				if(p2y>0)
					bullet_map[p2y-1][p2x] = 1;
			break;
			case tank2Down: 
				if(p2y<game_map.length - 1)
					bullet_map[p2y+1][p2x] = 3;
			break;
			case tank2Left: 
				if(p2x>0)
					bullet_map[p2y][p2x-1] = 4;
			break;
			case tank2Right: 
				if(p2x<game_map.length - 1)
					bullet_map[p2y][p2x+1] = 2;
			break;
		}
	}
	p2_pressed = null;
}

function newPos(player)
{
	var x = Math.floor(Math.random() * game_map.length);
	var y = Math.floor(Math.random() * game_map.length);
	while (game_map[x][y]!=0 || bullet_map[x][y]!=0)
	{
		x = Math.floor(Math.random() * game_map.length);
		y = Math.floor(Math.random() * game_map.length);
	}
	if (player === 1)
		game_map[p1y][p1x] =0;
	else game_map[p2y][p2x] =0;
	game_map[x][y] = player;
}