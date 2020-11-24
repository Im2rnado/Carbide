const fs = require('fs');
const { createCanvas, loadImage, registerFont } = require('canvas');

module.exports = {
	async genratateShop(content) {

		registerFont('./src/.fonts/BurbankBigCondensed-Black.otf', { family: 'Burbank Big Condensed Black' });

		let canvasHeight;
		let canvasWidth;
		// const rows = Math.min(content.length, Math.round(Math.sqrt(content.length)));
		canvasHeight = content.length;

		if (content.length < 10) {
			canvasWidth = 1040;
			canvasHeight = Math.ceil(canvasHeight / 3) * 255;
		}
		else if (content.length < 20) {
			canvasWidth = 1300;
			canvasHeight = Math.ceil(canvasHeight / 3) * 205;
		}
		else if (content.length < 30) {
			canvasWidth = 1560;
			canvasHeight = Math.ceil(canvasHeight / 3) * 175;
		}
		else if (content.length < 40) {
			canvasWidth = 1820;
			canvasHeight = Math.ceil(canvasHeight / 3) * 145;
		}
		else if (content.length < 50) {
			canvasWidth = 2080;
			canvasHeight = Math.ceil(canvasHeight / 3) * 120;
		}
		else {
			canvasWidth = 2340; canvasHeight = Math.ceil(canvasHeight / 3) * 110;
		}

		const canvas = createCanvas(canvasWidth, canvasHeight, 'png');
		const ctx = canvas.getContext('2d');

		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve) => {

			let featuredX = 0;
			let featuredY = 0;
			let rendered = 0;
			let renderedlen = 0;
			const background = await loadImage('./src/assets/background.png');
			ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			for(const itemStack in content) {
				const item = content[itemStack];

				const itemImg = await loadImage(`${item}background_full.v2.en.png`).catch((err) => { console.error(err); });

				ctx.drawImage(itemImg, featuredX, featuredY, 260, 260);

				featuredX = featuredX + 260;
				rendered = rendered + 1;
				if (content.length < 10) {renderedlen = 4;}
				else if (content.length < 20) {renderedlen = 5;}
				else if (content.length < 30) {renderedlen = 6;}
				else if (content.length < 40) {renderedlen = 7;}
				else if (content.length < 50) {renderedlen = 8;}
				else { renderedlen = 9; }
				if(rendered === renderedlen) {
					rendered = 0;
					featuredY = featuredY + 260;
					featuredX = 0;
				}

			}


			ctx.fillStyle = '#ffffff';
			ctx.font = '135px Burbank Big Cd Bk';
			ctx.textAlign = 'center';
			ctx.fillText('www.carbide.cf', canvas.width / 2, canvas.height - 80);

			const end = fs.createWriteStream('./src/final/shop.png');
			const stream = canvas.createPNGStream().pipe(end);
			stream.on('finish', () => {
				resolve('./src/final/shop.png');
			});

		}).catch((err) => {
			console.error(err);
		});
	},
};
