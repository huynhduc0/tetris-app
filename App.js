import React from 'react';
import { StyleSheet, Text, View, Dimensions, Button } from 'react-native';
import Canvas from 'react-native-canvas';
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function App() {
	createmaxtrix = (w, h) => {
		const maxtrix = [];
		while (h--) {
			maxtrix.push(new Array(w).fill(0));
		}
		return maxtrix;
	};

	this.state = {
		arena: {maxtrix:this.createmaxtrix(12, 20)},
		player: {
			pos: { x: 0, y: 0 },
			maxtrix: null,
			score: 0,
			name:"THDUC",
		},
	};
	context = null;

	const { arena, player } = this.state;
	const colors = [null, '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'];
	const ws= null;
	emit = (data) =>{
		const msg = JSON.stringify(data);
		console.log(`message sending: ${msg}..`);
		this.ws.send(msg);
	}
	
	stateEmit = (fragement,key) =>{
		let ahihi = (fragement ==="player")?player:arena;
		let	dt  = {type:"state-update",fragement:fragement,state:[key,ahihi[key]]};
		const msg = JSON.stringify(dt);
		console.log(`message sending: ${msg}..`);
		this.ws.send(msg);
	}
	
	drawmaxtrix = (maxtrix, offset) => {
		this.context.fillStyle = '#00F';
		maxtrix.forEach((row, y) => {
			row.forEach((value, x) => {
				if (value !== 0) {
					this.context.fillStyle = colors[value];
					this.context.fillRect(x + offset.x, y + offset.y, 1, 1);
				}
			});
		});
	};

	merge = (arena, player) => {
		player.maxtrix.forEach((row, y) => {
			row.forEach((value, x) => {
				if (value !== 0) {
					arena.maxtrix[y + player.pos.y][x + player.pos.x] = value;
				}
			});
		});
		this.stateEmit('arena','maxtrix');
	};
	rotate = (maxtrix, dir) => {
		for (let y = 0; y < maxtrix.length; ++y) {
			for (let x = 0; x < y; ++x) {
				[maxtrix[x][y], maxtrix[y][x]] = [maxtrix[y][x], maxtrix[x][y]];
			}
		}

		if (dir > 0) {
			maxtrix.forEach(row => row.reverse());
		} else {
			maxtrix.reverse();
		}
		this.stateEmit('player','maxtrix');
	};
	createPiece = type => {
		if (type === 'I') {
			return [
				[0, 1, 0, 0],
				[0, 1, 0, 0],
				[0, 1, 0, 0],
				[0, 1, 0, 0],
			];
		} else if (type === 'L') {
			return [
				[0, 2, 0],
				[0, 2, 0],
				[0, 2, 2],
			];
		} else if (type === 'J') {
			return [
				[0, 3, 0],
				[0, 3, 0],
				[3, 3, 0],
			];
		} else if (type === 'O') {
			return [
				[4, 4],
				[4, 4],
			];
		} else if (type === 'Z') {
			return [
				[5, 5, 0],
				[0, 5, 5],
				[0, 0, 0],
			];
		} else if (type === 'S') {
			return [
				[0, 6, 6],
				[6, 6, 0],
				[0, 0, 0],
			];
		} else if (type === 'T') {
			return [
				[0, 7, 0],
				[7, 7, 7],
				[0, 0, 0],
			];
		}
	};

	arenaSweep = () => {
		let rowCount = 1;
		outer: for (let y = arena.maxtrix.length - 1; y > 0; --y) {
			for (let x = 0; x < arena.maxtrix[y].length; ++x) {
				if (arena.maxtrix[y][x] === 0) {
					continue outer;
				}
			}

			const row = arena.maxtrix.splice(y, 1)[0].fill(0);
			arena.maxtrix.unshift(row);
			++y;

			player.score += rowCount * 10;
			rowCount *= 2;
			this.stateEmit('arena','maxtrix');
		}
	};
	collide = (arena, player) => {
		const m = player.maxtrix;
		const o = player.pos;
		for (let y = 0; y < m.length; ++y) {
			for (let x = 0; x < m[y].length; ++x) {
				if (m[y][x] !== 0 && (arena.maxtrix[y + o.y] && arena.maxtrix[y + o.y][x + o.x]) !== 0) {
					return true;
				}
			}
		}
		return false;
	};

	 playerDrop = ()=> {
		player.pos.y++;
		dropCounter = 0;
		if (collide(arena, player)) {
			player.pos.y--;
			merge(arena, player);
			playerReset();
			arenaSweep();
			//  updateScore();
		}
		 this.stateEmit('player','pos');	
  }
  _onPressButton =()=> {
    alert('You tapped the button!')
  }

	playerMove = (offset) => {
		player.pos.x += offset;
		if (collide(arena, player)) {
			player.pos.x -= offset;
		}
		//this.stateEmit('player','maxtrix');
		this.stateEmit('player','pos');

	}
	playerReset = () => {
		const pieces = 'TJLOSZI';
		let index = Math.floor(Math.random() * pieces.length - 1) + 1;
		//  alert(index)
		player.maxtrix = this.createPiece(pieces[index]);

		// alert(pieces.length * Math.random());
		player.pos.y = 0;
		player.pos.x = ((arena.maxtrix[0].length / 2) | 0) - ((player.maxtrix[0].length / 2) | 0);
		if (this.collide(arena, player)) {
			arena.maxtrix.forEach(row => row.fill(0));
			player.score = 0;
			//updateScore();
		}
		
		this.stateEmit('player','maxtrix');
		this.stateEmit('player','pos');
	};
	 playerRotate = (dir)=> {
		const pos = player.pos.x;
		let offset = 1;
		this.rotate(player.maxtrix, dir);
		while (this.collide(arena, player)) {
			player.pos.x += offset;
			offset = -(offset + (offset > 0 ? 1 : -1));
			if (offset > player.maxtrix[0].length) {
				this.rotate(player.maxtrix, -dir);
				player.pos.x = pos;
				return;
			}
		}
	}
	let dropCounter = 0;
	let dropInterval = 1000;

	let lastTime = 0;
	update = (time = 0) => {
		const deltaTime = time - lastTime;

		dropCounter += deltaTime;
		if (dropCounter > dropInterval) {
			playerDrop();
		}

		lastTime = time;
		this.draw();
		requestAnimationFrame(this.update);
	};
	draw = () => {
		// this.context = canvas.getContext('2d');
		this.context.fillStyle = '#000';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		drawmaxtrix(arena.maxtrix, { x: 0, y: 0 });
		drawmaxtrix(player.maxtrix, player.pos);
	};
	initDT = () =>{
		const pieces = 'TJLOSZI';
		let index = Math.floor(Math.random() * pieces.length - 1) + 1;
		//  alert(index)
		player.maxtrix = this.createPiece(pieces[index]);

		// alert(pieces.length * Math.random());
		player.pos.y = 0;
		player.pos.x = ((arena.maxtrix[0].length / 2) | 0) - ((player.maxtrix[0].length / 2) | 0);
	}
	handleCanvas = canvas => {
    
		canvas.width = SCREEN_WIDTH-120;
		canvas.height = SCREEN_HEIGHT-240;
		this.context = canvas.getContext('2d');
		this.context.scale(20, 20);
		this.canvas = canvas;
		// this.playerReset();
		initDT();
		this.ws = new WebSocket('ws://192.168.1.12:6969');
		
		this.ws.onopen = () => {
		// connection opened
		
		let data = {
					type:"create-session",
					state:this.state
				};
		data = {
			type:"join-session",
			"id":"ahihii",
			state:this.state
		};
		this.emit(data); // send a message
		this.update();
		};

		//drawmaxtrix(player.maxtrix, player.pos);
		// this.draw();
	};

	return (
		<View style={styles.container}>
			<Canvas ref={this.handleCanvas} />
		
      <Button title="Lên" onPress={()=>{this.playerRotate(-1)}} >
      </Button>
      <Button title="Xuống" onPress={()=>{this.playerDrop()}}>
      </Button>
      <Button title="Trái" onPress={()=>{this.playerMove(-1)}} >
      </Button>
      <Button title="Phải" onPress={()=>{this.playerMove(1)}}>
      </Button>
		</View>

	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
