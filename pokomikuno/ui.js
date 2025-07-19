
function backRender() {
    wallRender();
    paddleRender();
}

function bgRender() {
    imgC(`assets/images/bg/${stage}.png`, csX(), csY(), screenSizeW, screenSizeH);
    if (stage !== 'title') {
        //キャンバスを取得
        const ctx = canvas.getContext('2d');
        //線を描く
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.52)";
        ctx.beginPath();
        ctx.fillRect(csX(0) - wakuWidth * 1.5, csY(0) - screenSizeH / 2, wakuWidth, screenSizeH);
        ctx.fillRect(csX(0) + wakuWidth * 0.5, csY(0) - screenSizeH / 2, wakuWidth, screenSizeH);
        ctx.restore();
    }
}


function wallRender() {
    //キャンバスを取得
    const ctx = canvas.getContext('2d');
    const w = wakuWidth / 2 + 5;
    const x = csX();
    //線を描く
    ctx.save();
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#a8e4f0";
    ctx.beginPath();
    ctx.moveTo(x - w, 0);
    ctx.lineTo(x - w, screenSizeH);
    ctx.moveTo(x + w, 0);
    ctx.lineTo(x + w, screenSizeH);
    ctx.stroke();
    ctx.restore();
}

function paddleRender() {
    //キャンバスを取得
    const ctx = canvas.getContext('2d');
    //線を描く
    ctx.save();
    ctx.lineWidth = 10;
    ctx.strokeStyle = "black";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(paddleX - paddleW / 2, paddleY);
    ctx.lineTo(paddleX + paddleW / 2, paddleY);
    ctx.stroke();
    ctx.restore();
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function uiRender() {
    arrow();
    imgC('assets/images/time.png', 120, 1120, 160, 180);
    imgCR(pokoList[nextPoko].src, 300, 820, 300, 300, -90);
    const t = time % 1 === 0 ? time.toFixed(1) : time.toString();
    text(230, 1100, String(t), 150, 'rgb(102, 147, 255)', 'HG創英角ﾎﾟｯﾌﾟ体', 'left');
    if (stage !== 'title') {
        modeChangeButton();
        moneyBag();
        //エフェクトの描画
        effectRender();
    }
    else {
        if (titleMode == 'modeChange') {
            //キャンバスを取得
            const ctx = canvas.getContext('2d');
            //線を描く
            ctx.save();
            ctx.fillStyle = "rgba(255, 255, 255, 0.77)";
            ctx.beginPath();
            ctx.fillRect(0, 0, screenSizeW, screenSizeH);
            ctx.restore();
        }

        titleButton();
    }
}

function modeChangeButton() {
    const i = (touchMode == 'move') ? 'angle' : 'move';
    const n = (touchMode == 'move') ? 1 : -1;
    const l = 300;
    imgC(`assets/images/${i}No.png`, l - 30 * n, 450 - 20 * n, 280, 280);
    imgC(`assets/images/${touchMode}.png`, l + 30 * n, 450 + 20 * n, 280, 280);
    if (touchUp && checkClick(l, 450, 300, 400) || keyJustPress('c')) {
        touchMode = (touchMode == 'move') ? 'angle' : 'move';
        sound("assets/sounds/changeMode.mp3", 'start');
    }
}

function moneyBag() {
    imgC('assets/images/moneyBag.png', csX(-850), csY(500), 150, 200);
    text(450, csY(500), String(money), 140 / (((String(money).length - 3) * 0.2) + 1), 'black', 'HG創英角ﾎﾟｯﾌﾟ体', 'right');
}

function arrow() {
    //キャンバスを取得
    const ctx = canvas.getContext('2d');
    const p = (chargePoko.length == 0) ? 0 : Math.max(...chargePoko.map(obj => obj.size));
    const s = p + pokoSize;
    const a = (s / pokoSize);
    //線を描く
    ctx.save();
    ctx.lineWidth = 10 * a;
    ctx.strokeStyle = "black";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(getMoveX(paddleX, angle - 25 * -a, 30 * a), getMoveY(paddleY - s * 0.8, angle - 25 * -a, 30 * a));
    ctx.lineTo(getMoveX(paddleX, angle, 40 * a), getMoveY(paddleY - s * 0.8, angle, 40 * a));
    ctx.lineTo(getMoveX(paddleX, angle + 25 * -a, 30 * a), getMoveY(paddleY - s * 0.8, angle + 25 * -a, 30 * a));
    ctx.stroke();
    ctx.restore();
}

const modeList = [
    { img: 'りんご', backPack: [1, 0, 0, 0], text: '追加効果なし', date: [0, 0, 0, 0] },
    { img: 'ポコ', backPack: [1, 0, 0, 0, 0], text: 'ポコ +1個', date: [0, 0, 0, 0] },
    { img: '90度ポコ', backPack: [1, 0, 0, 0, 0], text: '開始時のお金 -10', date: [-10, 0, 0, 0] },
    { img: 'イノシシ', backPack: [1, 0, 0, 0, 0], text: 'ミクノの移動間隔 -1秒', date: [-10, -1, 0, 0] },
    { img: 'ボム', backPack: [1, 0, 0, 0, 0], text: 'ミクノの攻撃力 +5', date: [-10, -1, 5, 0] },
    { img: 'ブーメラン', backPack: [1, 0, 0, 0, 0], text: 'ポコのチャージ時間 +2秒', date: [-10, -1, 5, 2] },
]

let sin;

function titleButton() {
    if (titleMode == 'home') {
        soundVolume = 0.5;
        imgC('assets/images/button/start.png', csX(), csY(), 480, 150);
        if (checkClick(csX(), csY(), 480, 150) && touchUp) {
            sound('assets/sounds/arrow.mp3', 'start');
            titleMode = 'modeChange';
            page = 0;
            sin = [0, 0, 0, 0];
        }
        imgC('assets/images/button/option.png', csX(), csY(-270), 480, 150);
        if (checkClick(csX(), csY(-270), 480, 150) && touchUp) {
            sound('assets/sounds/arrow.mp3', 'start');
            titleMode = 'option';
        }
    }
    if (titleMode == 'modeChange') {
        soundVolume = 0.1;
        const mode = modeList[page];
        imgCR('assets/images/button/arrow.png', csX(-600), csY(-500), 120, 200, 0);
        imgCR('assets/images/button/arrow.png', csX(600), csY(-500), 120, 200, 180);
        imgC('assets/images/button/start.png', csX(), csY(-500), 600, 200);
        // 四角の描画（位置 x, y, 幅, 高さ, 丸みの半径）
        drawRoundedRect(csX(-780), csY(480), 250, 250, 20, false, null, true, "rgb(160, 228, 255)", 20);
        imgC('assets/images/button/home.png', csX(-780), csY(480), 220, 220);

        imgC('assets/images/moneyBag.png', csX(-850), csY(200), 200, 250);
        text(csX(-750), csY(200), String(100 + mode.date[0]), 150, 'black', 'HG創英角ﾎﾟｯﾌﾟ体', 'left');

        imgCR(pokoList[0].src, csX(-850), csY(-50), 180, 180, -90);
        imgC('assets/images/time2.png', csX(-780), csY(-80), 100, 120);
        text(csX(-750), csY(-30), String(12 + mode.date[3]) + '秒', 150, 'black', 'HG創英角ﾎﾟｯﾌﾟ体', 'left');


        imgCR(mikunoList[0].src, csX(500), csY(200), 160, 160, -90);
        imgC('assets/images/time2.png', csX(580), csY(170), 100, 120);
        text(csX(650), csY(220), String(5 + mode.date[1]) + '秒', 150, 'black', 'HG創英角ﾎﾟｯﾌﾟ体', 'left');

        if (!isStop) {
            if (checkClick(csX(-600), csY(), 600, screenSizeH) && touchUp) {
                if (page > 0) {
                    page--;
                }
                sound('assets/sounds/arrow.mp3', 'start');
            }
            if (checkClick(csX(600), csY(), 600, screenSizeH) && touchUp) {
                if (page < modeList.length - 1) {
                    page++;
                }
                sound('assets/sounds/arrow.mp3', 'start');
            }
            if (checkClick(csX(), csY(-500), 600, 300) && touchUp) {
                sound('any', 'stop');
                sound('assets/sounds/start.mp3', 'start', 0.5);
                isStop = true;
                fade('out', () => {
                    gameStart(mode.backPack, mode.date);
                });
                timer('stop');
                mikunoTimer('stop');
            }
            if (checkClick(csX(-780), csY(480), 400, 400) && touchUp) {
                titleMode = 'home';
            }
            sin[0] += 0.04;
            sin[1] += 0.02;
            sin[2] += 0.04;
            sin[3] += 0.03;
        }
        imgCR(`assets/images/poko/${mode.img}.png`, csX(), csY(150) + Math.sin(sin[0]) * 30, 400, 400, Math.sin(sin[1]) * 45 - 90);
        imgC(`assets/images/dess.png`, csX(-80), 120, 150, 200);
        text(csX(50), 100, String(page + 1), 180, 'rgb(236, 124, 59)', 'HG創英角ﾎﾟｯﾌﾟ体', 'left');
        text(csX(-300), csY(-150) + Math.sin(sin[2]) * 10, '持ちポコ', 70, 'black', 'HG創英角ﾎﾟｯﾌﾟ体', 'center');
        for (let i = 0; i < mode.backPack.length; i++) {
            const n = mode.backPack[i];
            imgCR(pokoList[n].src, csX(-80) + 100 * i, csY(-150) + Math.sin(sin[2]) * 10, 80, 80, Math.sin(sin[3]) * 10 - 90);
        }
        text(csX(), csY(-250) + Math.sin(sin[2]) * 10, mode.text, 70, 'black', 'HG創英角ﾎﾟｯﾌﾟ体', 'center');
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function checkClick(x, y, w, h) {

    const W = w / 2;
    const H = h / 2;

    const left = x - W;
    const right = x + W;
    const top = y - H;
    const bottom = y + H;

    return left <= touchX && touchX <= right && top <= touchY && touchY <= bottom;
}

let alpha = 0;

let Fade;

let isFade = false;

function fade(type, f = (() => { })) {
    if (type == 'out') {
        Fade = setInterval(() => {
            if (alpha < 1) {
                alpha += 0.01;
                isFade = true;
            }
            else {
                clearInterval(Fade);
                alpha = 1;
                f();
            }
        }, 10);
    }
    if (type == 'in') {
        Fade = setInterval(() => {
            if (alpha > 0) {
                alpha -= 0.01;
            }
            else {
                clearInterval(Fade);
                alpha = 0;
                isFade = false;
                f();
            }
        }, 10);
    }
}