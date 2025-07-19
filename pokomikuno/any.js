/*--------------------------------------------------------------------------*/
//パドル
let paddleX;
let paddleY;
let paddleW;
let paddleSpeed;
let arrowSpeed;
let angle;
let touchMode;
//タイトル画面での動作
let titleMove;
let titleTouchX;
let titleTouchAngle;
let titleWait;
let titleMode;
//ポコの発射クールダウン
let time;
let timeMax;
//タッチ可能にするまでの時間
let clickTime;
//難易度選択
let page;
let gameMode;
//所持金
let money;
//タイマー
let Timer;
/*--------------------------------------------------------------------------*/
//ポコの発射クールダウンの処理
function timer(type = 'start') {
    //タイマーを開始
    if (type == 'start') {
        //0.1秒ごとにカウント
        Timer = setInterval(() => {
            time -= 0.1;
            time = Math.round(time * 100) / 100;
        }, 100);
    }
    //タイマーを停止
    if (type == 'stop') {
        clearInterval(Timer);
    }
}
/*--------------------------------------------------------------------------*/
//パドルの初期化
function paddleReset() {
    //パドルの変数等
    paddleX = csX();
    paddleY = csY(-540);
    paddleW = 50;
    paddleSpeed = 0.05;
    arrowSpeed = 0.03;
    angle = -90;
    touchMode = 'move';
    //タイトルの変数等
    titleMove = 0;
    titleTouchX = csX();
    titleTouchAngle = -90;
    titleWait = 0;
    time = 1;
    timeMax = 3;
    clickTime = 0;
    //タイマーを開始
    timer();
}
/*--------------------------------------------------------------------------*/
//パドルの処理
function paddleStep() {
    //ポコのチャージ
    if (time <= 0) {
        time = timeMax;
        pokoCharge();
    }
    //ポコのサイズを決める
    const p = (chargePoko.length == 0) ? [{ size: 0 }] : chargePoko;
    const s = p[0].size + pokoSize;
    //ゲーム中の処理
    if (stage !== 'title') {
        //移動モード
        if (touchMode == 'move') {
            paddleX += (touchX - paddleX) * paddleSpeed;
        }
        //角度変更モード
        else {
            const a = getAngle(paddleX, paddleY - s / 2, touchX, touchY);
            const n = (chargePoko.length == 0) ? 0 : chargePoko[0].Num;
            if (n == 2) {
                let diff = a;
                while (diff > 180) diff -= 360;
                while (diff < -180) diff += 360;
                angle = diff;
            }
            else {
                let diff = a - angle;
                while (diff > 180) diff -= 360;
                while (diff < -180) diff += 360;
                angle += (diff) * arrowSpeed;
            }
        }
        const n = (chargePoko.length == 0) ? 0 : chargePoko[0].Num;
        if (n == 2) {
            angle = Math.floor(angle / 45) * 45;
        }
        //ポコを発射（長押しなら連射）
        if ((touchUp || (touchDown && clickTime >= 80)) && !checkClick(300, 1000, 400, 400)) {
            shot();
        }
    }
    //タイトル画面の処理
    else {
        //変数の処理
        titleMove++;
        paddleX += (titleTouchX - paddleX) * paddleSpeed;
        angle += (titleTouchAngle - angle) * arrowSpeed;
        //数秒ごとに動作
        if (titleMove >= titleWait) {
            //変数の処理
            titleTouchX = csX(0) + (getRundomInt(wakuWidth) - wakuWidth / 2);
            titleMove = 0;
            titleWait = getRundomInt(150) + 50;
            //少し遅れて角度を変える
            setTimeout(() => {
                const n = (chargePoko.length == 0) ? 0 : chargePoko[0].Num;
                if (n == 5) {
                    titleTouchAngle = -90 + (getRundomInt(30) - 15);
                }
                else {
                    titleTouchAngle = -90 + (getRundomInt(180) - 90);
                }
            }, 200); // 単位はミリ秒（ms）
            //さらに遅れてポコを発射
            setTimeout(() => {
                shot();
            }, 1000); // 単位はミリ秒（ms）
        }
    }
    //枠の当たり判定
    if (paddleX + paddleW / 2 >= csX(wakuWidth / 2)) {
        paddleX = csX(wakuWidth / 2) - paddleW / 2;
    }
    if (paddleX - paddleW / 2 <= csX(wakuWidth / -2)) {
        paddleX = csX(wakuWidth / -2) + paddleW / 2;
    }
    //長押しの処理
    if (touchDown && chargePoko.length !== 0) {
        clickTime++;
    }
    else {
        clickTime = 0;
    }
}
/*--------------------------------------------------------------------------*/
//ステージ
let stage;
//BGM
let bgm;
//BGMを変更する
function bgmChange(bgmName, volume = 1) {
    if (bgm == bgmName) return;
    sound(`assets/sounds/bgm/${bgm}.mp3`, 'stop');
    sound(`assets/sounds/bgm/${bgmName}.mp3`, 'loop', volume);
    bgm = bgmName;
}
/*--------------------------------------------------------------------------*/
//ポコの発射
function shot() {
    const p = (chargePoko.length == 0) ? [{ size: 0 }] : chargePoko;
    const s = p[0].size + pokoSize;
    //ポコがチャージされていないなら音をならす
    if (chargePoko.length == 0) {
        volumeSound('assets/sounds/noCharge.mp3', 'start');
    }
    //ポコがチャージされているなら盤面に追加
    else {
        volumeSound('assets/sounds/shot.mp3', 'start');
        makeNewPoko(chargePoko[0].Num, paddleX, paddleY - s * 0.8, angle, s);
        stagePoko[stagePoko.length - 1].date.boost = 5;
        chargePoko.splice(0, 1);
    }
}
/*--------------------------------------------------------------------------*/
//お金の処理
let effect;
function effectStep() {
    for (let i = 0; i < effect.length; i++) {
        const e = effect[i];
        switch (e.type) {
            case 'money':
                if (e.x > csX(-850)) {
                    if (e.move > 0) {
                        e.x = getMoveX(e.x, e.angle, e.speed);
                        e.y = getMoveY(e.y, e.angle, e.speed);
                        e.speed *= 0.8;
                        e.alpha += 0.4;
                    }
                    else if (e.move < -20) {
                        if (e.alpha > 1) e.alpha = 0.7;
                        e.angle = getAngle(e.x, e.y, csX(-850), csY(500));
                        e.x = getMoveX(e.x, e.angle, 20);
                        e.y = getMoveY(e.y, e.angle, 20);
                    }
                    e.move--;
                }
                else {
                    e.alpha -= 0.1;
                    if (e.alpha < 0) {
                        effect.splice(i, 1);
                        money++;
                    }
                }
                break;
            case 'boom':
        }
    }
}

function effectRender() {
    for (let i = 0; i < effect.length; i++) {
        const e = effect[i];
        imgC('assets/images/effect/money.png', e.x, e.y, 20, 20, e.alpha);
    }
}
function makeNewMoneyEffect(x, y, n = 1) {
    for (let i = 0; i < n; i++) {
        const m = { type: 'money', x: x, y: y, angle: getRundomInt(360), move: 20, alpha: 0, speed: 10 };
        effect.push(m);
    }
}
/*--------------------------------------------------------------------------*/
//ゲームスタートの処理
function gameStart(backPack, date, f = (() => { })) {
    //盤面を初期化
    stagePoko = [];
    stageMikuno = [];
    //ステージやBGMを変更
    stage = 'forest';
    bgmChange('forest', 0.4);
    //その他の変数も変える
    moneyEffect = [];
    chargePoko = [];
    isStop = false;
    time = 3;
    nextPoko = myPoko[0];
    money = 100 + date[0];
    mikunoIntervalTimeMax = 5 + date[1];
    mikunoIntervalTime = mikunoIntervalTimeMax;
    timeMax = 12 + date[3];
    myPoko = backPack;
    paddleX = csX();
    paddleY = csY(-540);
    angle = -90;
    touchMode = 'move';
    nextPoko = myPoko[0];
    soundVolume = 1;
    //タイマーをスタートさせてフェードイン
    timer();
    mikunoTimer();
    mikunoMove();
    fade('in');
}
/*--------------------------------------------------------------------------*/
function damageAreaRender() {
    for (let i = 0; i < damageArea.length; i++) {
        const d = damageArea[i];
        //キャンバスを取得
        const ctx = canvas.getContext('2d');
        //線を描く
        ctx.save();
        ctx.fillStyle = "rgba(255, 87, 87, 0.57)";
        ctx.beginPath();
        ctx.fillRect(d.x - d.w / 2, d.y - d.h / 2, d.w, d.h);
        ctx.restore();
    }
}
/*--------------------------------------------------------------------------*/
let soundVolume = 1;
function volumeSound(src, type, volume = 1) {
    sound(src, type, volume * soundVolume);
}
/*--------------------------------------------------------------------------*/