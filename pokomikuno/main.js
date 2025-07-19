// main.js

/*--------------------------------------------------------------------------*/
//読み込まれたら初期化
window.onload = async function () {
    checkOrientation();
    // スマホなら画面回転イベントも有効にする
    if (isMobile()) {
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);
    }
    //canvasの初期化
    canvasReset();
    clear();
    //その他の初期化
    reset();
    //クリックまで待つ
    await waitForTouchUp();
    bgm = 'title';
    sound('assets/sounds/bgm/title.mp3', 'loop', 0.3);
    //ゲームメインを呼び出す
    gameMain();
}
/*--------------------------------------------------------------------------*/

console.time("処理時間");

/*--------------------------------------------------------------------------*/
//ゲームメイン
function gameMain() {
    //スタートしてから数秒間タッチをできなくする（誤タップ防止）
    if (DontTouch) {
        touchDown = false;
        touchUp = false;
    }
    //モバイル版なら横向きにするよう誘導
    if (isMobile()) checkOrientation();
    if (!isMobile() || window.innerWidth > window.innerHeight) {
        //canvasをクリア
        clear();
        //ゲームを進める
        step();
        //描画
        Render();
        //タッチ後の処理
        touchUp = false;
        //タッチ後の処理
        touchUp2 = true;
        //キーの処理
        keyJustPressed = {};
    }
    //再びゲームを呼び出す
    requestAnimationFrame(gameMain);
}
/*--------------------------------------------------------------------------*/

console.timeEnd("処理時間");  // 処理時間: 50ms（例）

/*--------------------------------------------------------------------------*/
let DontTouch;

//初期化
function reset() {
    //タッチの初期化
    touchReset();
    //パドルの初期化
    paddleReset();
    //ポコの初期化
    pokoReset();
    //ミクノの初期化
    mikunoReset();
    //その他の初期化
    stage = 'title';
    titleMode = 'home';
    DontTouch = true;
    effect = [];
    //スタートしてから数秒後にタッチを許可
    setTimeout(() => {
        DontTouch = false;
    }, 900);
    //あらかじめランダムにポコを発射しておく
    for (let i = 0; i < 10; i++) {
        makeNewPoko(myPoko[getRundomInt(myPoko.length) - 1], csX(0) - wakuWidth / 2 + getRundomInt(wakuWidth), csY(-400) - getRundomInt(900), getRundomInt(180) - 180, false);
    }
}
/*--------------------------------------------------------------------------*/
//ゲームを進める
function step() {
    if (!isStop) {
        //お金エフェクトの処理
        effectStep();
        //パドルの動作
        paddleStep();
        //ポコの動作
        pokoStep();
        //ミクノとポコの移動
        if (moved + move > 70) {    // 70 を越えそうなら
            move = 70 - moved;        // ちょうど残り分だけ動かす
        }
        moved += move;
        move -= 0.1;
        //ミクノの処理
        mikunoStep();
    }
}

/*--------------------------------------------------------------------------*/
//描画
function Render() {
    //背景を描画
    bgRender();
    //ミクノを描画
    mikunoRender();
    //パドル等を描画
    backRender();
    //ポコを描画
    pokoRender();
    //UI等を描画
    uiRender();
    if (isFade) {
        //キャンバスを取得
        const ctx = canvas.getContext('2d');
        //線を描く
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.beginPath();
        ctx.fillRect(0, 0, screenSizeW, screenSizeH);
        ctx.restore();
    }
    damageAreaRender();
}
/*--------------------------------------------------------------------------*/


function isMobile() {
    // ユーザーエージェント判定（シンプル版）
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 'ontouchstart' in window;
}

function checkOrientation() {
    //もしパソコンなら処理を終了
    if (!isMobile()) {
        document.getElementById('landscapeContent').style.display = 'block';
        document.getElementById('rotateWarning').style.display = 'none';
        return;
    }
    //「横向きにしてね」と告知
    const isLandscape = window.innerWidth > window.innerHeight;
    document.getElementById('landscapeContent').style.display = isLandscape ? 'block' : 'none';
    document.getElementById('rotateWarning').style.display = isLandscape ? 'none' : 'flex';
}
/*--------------------------------------------------------------------------*/