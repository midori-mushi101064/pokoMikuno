
/*--------------------------------------------------------------------------*/
//ミクノのクラス
class Mikuno {
    constructor(Num, x, y, w, h) {
        this.Num = Num;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.hpMax = mikunoList[this.Num].hp * hpLevel;
        this.hp = this.hpMax;
        this.removeFlag = false;
        this.alphaChange = 0;
        this.date = {};
    }
    //ミクノを描画
    render() {
        //キャンバスを取得
        const ctx = canvas.getContext('2d');
        //線を描く
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${1 + this.alphaChange})`;
        ctx.beginPath();
        ctx.fillRect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
        ctx.restore();
        let alpha = (this.removeFlag) ? 1 : (this.hp / this.hpMax);
        alpha *= (this.alphaChange + 1);
        if (this.alphaChange == 0) alpha += 0.1;
        if (alpha < 0) alpha = 0;

        imgC(mikunoList[this.Num].src, this.x, this.y, this.w, this.h, alpha);
    }
    //ミクノを消去
    remove() {
        this.removeFlag = true;
        volumeSound('assets/sounds/break.mp3', 'start');
    }
}
/*--------------------------------------------------------------------------*/

//ミクノの全体的なHPの倍率
let hpLevel;
//盤面上のミクノ
let stageMikuno;
//出現するミクノの種類
let myMikuno;
//ミクノの移動間隔
let mikunoInterval;
let mikunoIntervalTime;
/*--------------------------------------------------------------------------*/
//ミクノの移動クールダウンの処理
function mikunoTimer(type = 'start') {
    //タイマーを開始
    if (type == 'start') {
        //0.1秒ごとにカウント
        mikunoIntervalTime = mikunoIntervalTimeMax;
        mikunoInterval = setInterval(() => {
            mikunoIntervalTime -= 0.1;
            mikunoIntervalTime = Math.round(mikunoIntervalTime * 100) / 100;
        }, 100);
    }
    //タイマーを停止
    if (type == 'stop') {
        clearInterval(mikunoInterval);
    }
}
/*--------------------------------------------------------------------------*/
//ミクノの初期化
function mikunoReset() {
    hpLevel = 1;
    stageMikuno = [];
    myMikuno = [10, 3, 2, 1, 1, 0];
    mikunoIntervalTimeMax = 5;
    mikunoTimer();
    mikunoMove();
}
/*--------------------------------------------------------------------------*/
//ミクノのリスト
const mikunoList = [
    { src: 'assets/images/mikuno/シンプルミクノ.png', hp: 1 },
    { src: 'assets/images/mikuno/カチカチミクノ.png', hp: 2 },
    { src: 'assets/images/mikuno/コチコチミクノ.png', hp: 3 },
    { src: 'assets/images/mikuno/スケスケミクノ.png', hp: 2 },
    { src: 'assets/images/mikuno/ボックスミクノ.png', hp: 0 },
    { src: 'assets/images/mikuno/ボスボックスミクノ.png', hp: 0 },
];
/*--------------------------------------------------------------------------*/
//ミクノを描画
function mikunoRender() {
    for (let i = 0; i < stageMikuno.length; i++) {
        stageMikuno[i].render();
    }
}
/*--------------------------------------------------------------------------*/
//ミクノの処理
function mikunoStep() {
    if (mikunoIntervalTime <= 0) mikunoMove();
    for (let i = 0; i < stageMikuno.length; i++) {
        const m = stageMikuno[i];
        if (!m.removeFlag) {
            if (m.Num == 3) {
                if (m.hp !== m.hpMax && m.alphaChange > -0.95) m.alphaChange -= 0.02;
            }
            if (move > 0) {
                m.y += move;
            }
            else {
                if ((m.y - 35) % 70 !== 0) {
                    m.y = Math.floor(m.y / 70) * 70 + 35;
                }
            }
            //攻撃判定
            if (m.y > 0) {
                for (let i = 0; i < damageArea.length; i++) {
                    //攻撃の範囲内かをチェック
                    const d = damageArea[i];
                    const left = m.x - m.w / 2;
                    const right = m.x + m.w / 2;
                    const top = m.y - m.h / 2;
                    const bottom = m.y + m.h / 2;

                    const hitLeft = d.x - d.w / 2;
                    const hitRight = d.x + d.w / 2;
                    const hitTop = d.y - d.h / 2;
                    const hitBottom = d.y + d.h / 2;

                    const touchInWidth = hitLeft < right && hitRight > left;
                    const touchInHeight = hitBottom > top && hitTop < bottom;
                    //範囲内ならダメージを食らう
                    if (touchInWidth && touchInHeight) {
                        m.hp -= d.damage;
                    }
                }
            }
            if ((m.hp <= 0 && !m.hpMax == 0) || m.hp < 0) {
                m.removeFlag = true;
                if (stage !== 'title') {
                    makeNewMoneyEffect(m.x, m.y, hpLevel * 2);
                    sound('assets/sounds/money.mp3', 'start', 0.8);
                }
                volumeSound('assets/sounds/break.mp3', 'start');
            }
        }
        else {
            m.w *= 0.9;
            m.h *= 0.9;
            if (m.w <= 1) {
                stageMikuno.splice(i, 1);
            }
        }
    }
}
let makedNum;
//ミクノの移動
function mikunoMove() {
    move = 5;
    moved = 0;
    let makeNum = 1;
    makedNum = [];
    mikunoIntervalTime = mikunoIntervalTimeMax;
    for (let i = 1; i <= 10; i++) {
        if (getRundomInt(3) == 1) {
            makeNum++;
        }
    }
    for (let i = 1; i <= makeNum; i++) {
        makeNewMikuno();
    }
}
/*--------------------------------------------------------------------------*/
//横幅が70の時、横一列に並べれるミクノの数は10個
//ミクノを盤面に追加
function makeNewMikuno(num = 'no', x = getRundomInt(wakuWidth / 70) - 1, w = 70, h = 70) {
    let n = 0;
    for (let i = 0; i < myMikuno.length; i++) {
        const r = myMikuno[i];
        if (getRundomInt(100) <= r * 10) {
            n = i;
        }
    }
    if (num !== 'no') n = num;
    for (let i = 0; makedNum.includes(x) && i <= 100; i++) {
        x = getRundomInt(wakuWidth / 70) - 1;
    }
    makedNum.push(x);
    const setX = (csX() - wakuWidth / 2) + 35 + x * w;
    const m = new Mikuno(n, setX, -35, w + 2.5, h + 2.5);
    stageMikuno.push(m);
}
/*--------------------------------------------------------------------------*/