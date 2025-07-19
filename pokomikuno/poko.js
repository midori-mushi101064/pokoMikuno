
/*--------------------------------------------------------------------------*/
//ポコのサイズ
const pokoSize = 50;
//ポコのクラス
class Poko {
    constructor(Num, x, y, r, size, step, dontChangeAngle = false, firstShot = false) {
        this.Num = Num;
        this.x = x;
        this.y = y;
        this.r = r;
        this.size = size;
        this.date = { firstShot: firstShot, boost: 0, changeAngle: !dontChangeAngle };
        this.removeFlag = false;
        this.imgAngle = 0;
        this.step = step;
    }
    //当たっているか判定
    testHit(hitX, hitY, hitWidth, hitHeight, rMin = 0.6, rMax = 1.4) {
        const x = this.x;
        const y = this.y;
        const size = (this.size / 2) * 0.7;

        const left = x - size;
        const right = x + size;
        const top = y - size;
        const bottom = y + size;

        const hitLeft = hitX - hitWidth / 2;
        const hitRight = hitX + hitWidth / 2;
        const hitTop = hitY - hitHeight / 2;
        const hitBottom = hitY + hitHeight / 2;

        const touchInWidth = hitLeft < right && hitRight > left;
        const touchInHeight = hitBottom > top && hitTop < bottom;

        const dx = x - hitX;
        const dy = y - hitY;

        // 斜めかどうかを判定（比が1に近い）
        const ratio = Math.abs(dx / dy);
        const isDiagonal = ratio > rMin && ratio < rMax; // おおよそ45度付近ならtrue


        if (touchInWidth && touchInHeight) {
            return [true, dx, dy, isDiagonal];
        }
        return [false];
    }
    //ポコをいい感じに反射
    reflection(WorH) {
        if (this.Num == 2 && this.date.kaitenn <= 0) {
            this.date.kaitenn = 90;
            return;
        }
        if (WorH == 'W') {
            this.r = 180 - this.r;
            this.move(1);
        }
        if (WorH == 'H') {
            this.r *= -1;
            this.move(1);
        }
    }
    //ブロックの当たり判定と反射
    blockReflection(hitX, hitY, hitWidth, hitHeight) {
        const hit = this.testHit(hitX, hitY, hitWidth, hitHeight, 0.9, 2);
        if (hit[0]) {
            while (this.testHit(hitX, hitY, hitWidth, hitHeight)[0]) {
                this.move(-1);
            }
            if (hit[3]) {
                if (this.Num == 2 && this.date.kaitenn <= 0) {
                    this.date.kaitenn = 90;
                    return;
                }
                // パドルとの横距離によって角度を調整（左で当たると左に反射）
                const offset = (this.x - hitX) / (hitWidth / 2);
                if (this.y < hitY) {
                    this.r = 270 + offset * 50; // 例えば真上270° ± 最大60°
                    this.r = (this.r + 360) % 360;
                }
                else {
                    this.r = 90 + offset * -50; // 例えば真上270° ± 最大60°
                    this.r = (this.r + 360) % 360;
                }
            }
            else if (Math.abs(hit[1]) > Math.abs(hit[2])) {
                this.reflection('W');
            }
            else {
                this.reflection('H');
            }
            return true;
        }
        return;
    }
    //壁の当たり判定
    wall() {
        const w = wakuWidth / 2;
        const s = (this.size / 2) * 0.7;
        if (this.x + s >= csX() + w) {
            this.reflection('W');
            while (this.x + s >= csX() + w) {
                this.x -= 1;
            }
            return 'right';
        }
        if (this.x - s <= csX() - w) {
            this.reflection('W');
            while (this.x - s <= csX() - w) {
                this.x += 1;
            }
            return 'left';
        }
        if (this.y - s <= 0) {
            this.reflection('H');
            while (this.y - s <= 0) {
                this.y += 1;
            }
            return 'top';
        }
        if (this.y + s >= screenSizeH) {
            this.reflection('H');
            while (this.y + s >= screenSizeH) {
                this.y -= 1;
            }
            return 'bottom';
        }
        return;
    }
    //向いてる方向に移動
    move(s = this.step + this.date.boost, r = this.r) {
        this.x = getMoveX(this.x, r, s);
        this.y = getMoveY(this.y, r, s);
    }
    //ポコの描画
    render() {
        this.r = (this.r + 360) % 360;
        if (this.date.changeAngle) {
            imgCR(this.getSrc(), this.x, this.y, this.size, this.size, this.r + this.imgAngle);
        }
        else {
            imgCR(this.getSrc(), this.x, this.y, this.size, this.size, -90 + this.imgAngle);
        }
        //imgC('assets/images/mikuno/シンプルミクノ.png', this.x, this.y, this.size * 0.7, this.size * 0.7);
    }
    //ポコを消去
    remove() {
        this.removeFlag = true;
        volumeSound('assets/sounds/fall.mp3', 'start');
    }
    //ポコの画像を取得
    getSrc() {
        return pokoList[this.Num].src;
    }
    //ポコの攻撃力を取得
    getAtk() {
        return pokoList[this.Num].atk;
    }
    atk(atk = this.getAtk(), w = this.size * 1.1, h = this.size * 1.1) {
        const d = { x: this.x, y: this.y, w: w, h: h, damage: atk };
        damageArea.push(d);
    }
    mikunoHitCheck() {
        for (let i = 0; i < stageMikuno.length; i++) {
            const m = stageMikuno[i];
            if (!m.removeFlag) {
                const MikunoHit = this.testHit(m.x, m.y, m.w, m.h, 0.9, 2)[0];
                if (MikunoHit) return true;
            }
        }
        return;
    }
    mikunoReflaction() {
        for (let i = 0; i < stageMikuno.length; i++) {
            const m = stageMikuno[i];
            if (!m.removeFlag) {
                const mikunoReflaction = this.blockReflection(m.x, m.y, m.w, m.h);
                if (mikunoReflaction) return true;
            }
        }
        return;
    }
}
/*--------------------------------------------------------------------------*/
//所持ポコや盤面上のポコ
let myPoko;
let stagePoko;
let chargePoko;
let isStop;
let nextPoko;
//ポコの初期化
function pokoReset() {
    myPoko = [0, 1, 2, 3, 5, 6];
    stagePoko = [];
    chargePoko = [];
    isStop = false;
    nextPoko = myPoko[getRundomInt(myPoko.length) - 1];
}
/*--------------------------------------------------------------------------*/
//ポコのリスト
const pokoList = [
    { src: 'assets/images/poko/ポコ.png', step: 3, atk: 1, dontChangeAngle: true },
    { src: 'assets/images/poko/りんご.png', step: 2, atk: 0.25 },
    { src: 'assets/images/poko/90度ポコ.png', step: 5, atk: 1 },
    { src: 'assets/images/poko/ボム.png', step: 1.5, atk: 0 },
    { src: 'assets/images/poko/ボム2.png', step: 0, atk: 3 },
    { src: 'assets/images/poko/イノシシ.png', step: 4, atk: 5 },
    { src: 'assets/images/poko/ブーメラン.png', step: 4, atk: 3, dontChangeAngle: true },
]
/*--------------------------------------------------------------------------*/
//ポコを盤面に追加
function makeNewPoko(Num, x, y, r, firstShot = true, size = pokoSize) {
    volumeSound('assets/sounds/shot.mp3', 'start');
    stagePoko.push(new Poko(Num, x, y, r, size, pokoList[Num].step, pokoList[Num].dontChangeAngle, firstShot));
}
//ポコをチャージ
function pokoCharge() {
    chargePoko.push({ Num: nextPoko, size: 0 });
    nextPoko = myPoko[getRundomInt(myPoko.length) - 1];
}
/*--------------------------------------------------------------------------*/
//ポコを描画
function pokoRender() {
    for (let i = 0; i < stagePoko.length; i++) {
        stagePoko[i].render();
    }
    for (let i = chargePoko.length - 1; i >= 0; i--) {
        const c = (chargePoko.length == 0) ? [{ size: 0 }] : chargePoko;
        const p = pokoList[chargePoko[i].Num];
        const s = c[0].size;
        if (p.dontChangeAngle && chargePoko[i].Num !== 6) {
            imgCR(p.src, paddleX, paddleY - (pokoSize + s) * 0.8, pokoSize + s, pokoSize + s, -90);
        }
        else {
            imgCR(p.src, paddleX, paddleY - (pokoSize + s) * 0.8, pokoSize + s, pokoSize + s, angle);
        }
    }
}
/*--------------------------------------------------------------------------*/

//枠の広さ
const wakuWidth = 700;
//攻撃エリア
let damageArea;
//ポコの処理
function pokoStep() {
    damageArea = [];
    //ポコの数だけ繰り返す
    for (let i = 0; i < stagePoko.length; i++) {
        //ポコのデータを取得
        const p = stagePoko[i];
        let isStep = true;
        //削除状態じゃないなら
        if (!p.removeFlag) {
            //ミクノに当たったか
            const isMikunoHit = p.mikunoHitCheck() && move <= 0;
            if (p.mikunoHitCheck() && move > 0) {
                p.y += move;
                isStep = false;
            }
            //90度ポコの処理
            if (p.Num == 2) {
                if (p.date.kaitenn > 0) {
                    if (p.date.kaitenn == 90) p.atk();
                    p.date.kaitenn -= 2;
                    p.r += 2;
                    isStep = false;
                }
                else {
                    p.date.kaitenn = 0;
                }
            }
            //動作するなら
            if (isStep) {
                //ブースト状態か
                p.date.boost = (p.date.boost > 0) ? p.date.boost - 0.1 : 0;
                //移動
                p.move();
                //壁とパドルの当たり判定
                const wallReflection = p.wall();
                const paddleReflaction = p.blockReflection(paddleX, paddleY, paddleW, 10);
                if (paddleReflaction || (wallReflection && wallReflection !== 'bottom')) {
                    volumeSound('assets/sounds/waku.mp3', 'start');
                }
                if (wallReflection == 'bottom') {
                    p.remove();
                    p.reflection('H');
                }
                if (p.date.firstShot) {
                    switch (p.Num) {
                        case 5:
                            volumeSound('assets/sounds/poko/イノシシ1.mp3', 'start', 0.8);
                            break;
                        case 6:
                            volumeSound('assets/sounds/poko/ブーメラン.mp3', 'start', 0.5);
                            break;
                        default:
                            break;
                    }
                }
                //ポコの動作
                switch (p.Num) {
                    case 1:
                        if (isMikunoHit) {
                            p.date.atkInterval += 1;
                            p.step = 0;
                            if (p.date.atkInterval > 30) {
                                p.atk();
                                p.date.atkInterval = 0;
                                p.imgAngle += 180;
                                volumeSound('assets/sounds/poko/りんご.mp3', 'start', 0.6);
                            }
                        }
                        else {
                            p.date.atkInterval = 30;
                            p.step = 2;
                            p.imgAngle = 0;
                        }
                        break;
                    case 2:
                        if (wallReflection || paddleReflaction || isMikunoHit) {
                            volumeSound('assets/sounds/poko/90度ポコ.mp3', 'start', 0.2);
                        }
                        if (isMikunoHit) {
                            p.mikunoReflaction();
                        }
                        break;
                    case 5:
                        if (wallReflection) {
                            p.remove();
                            p.move(-5);
                            p.wall();
                        }
                        if (isMikunoHit) {
                            p.date.atkInterval += 1;
                            p.step = 2;
                            if (p.date.atkInterval > 20) {
                                p.atk(p.getAtk() * 0.2);
                                volumeSound('assets/sounds/poko/イノシシ2.mp3', 'start', 0.7);
                                p.date.atkInterval = 0;
                            }
                        }
                        else {
                            p.date.atkInterval = 20;
                            p.step = 4;
                        }
                        break;
                    case 6:
                        if (paddleReflaction) {
                            chargePoko.push({ Num: 6, size: 0 });
                            stagePoko.splice(i, 1);
                        }
                        p.imgAngle += 5;
                        if (isMikunoHit) {
                            p.atk();
                            volumeSound('assets/sounds/hit.mp3', 'start');
                            p.mikunoReflaction();
                        }
                        break;
                    default:
                        if (isMikunoHit) {
                            p.atk();
                            volumeSound('assets/sounds/hit.mp3', 'start');
                            p.mikunoReflaction();
                        }
                        break;
                }
            }
        }
        else {
            p.size *= 0.9;
            if (p.size <= 1) {
                stagePoko.splice(i, 1);
            }
        }
        if (p.date.firstShot) p.date.firstShot = false;
    }
}
/*--------------------------------------------------------------------------*/