// Cartesian coordinates.js

//中心を0としたX座標
function csX(x = 0) {
    //中心を計算
    let a = canvas.width / 2;
    //位置を返す
    return Number(x + a);
}

//中心を0としたY座標
function csY(y = 0) {
    //中心を計算
    let a = canvas.height / 2;
    //位置を返す
    return Number(a - y);
}

//ランダムな整数
function getRundomInt(n) {
    //ランダムな整数を返す
    return Math.floor(Math.random() * n) + 1;
}

//AからBへの角度
function getAngle(x1, y1, x2, y2) {
    let radian = Math.atan2(y2 - y1, x2 - x1);   // ラジアンで角度
    let degree = radian * (180 / Math.PI);       // 度に変換
    return degree;
}

//何歩か進む
//X座標
function getMoveX(x, r, s) {
    // 角度 r が度の場合はラジアンに変換
    let rad = r * (Math.PI / 180);
    // 新しい座標を計算
    return x + Math.cos(rad) * s;
}
//Y座標
function getMoveY(y, r, s) {
    // 角度 r が度の場合はラジアンに変換
    let rad = r * (Math.PI / 180);
    // 新しい座標を計算
    return y + Math.sin(rad) * s;
}

function normalizeAngleDiff(diff) {
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return diff;
}