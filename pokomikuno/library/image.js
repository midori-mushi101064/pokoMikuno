// image.js

let images = []; // 画像を格納する配列

function makeImage(img) {
    // 画像が配列にない場合、新たに画像を作成
    if (images.indexOf(img) == -1) {
        // 画像を作成
        let image = new Image();
        // 画像のパスを指定
        image.src = img;
        // 画像を配列に追加
        images.push(img);
        // 画像を配列に追加
        images[img] = image;
    }
}


// 左上を原点として画像を描画
function img(img, x, y, w, h) {
    // X座標とY座標を数値に変換
    x = Number(x);
    y = Number(y);
    // 横幅と縦幅を数値に変換
    w = Number(w);
    h = Number(h);
    // canvas要素を取得
    const ctx = canvas.getContext('2d');
    // 画像が配列にない場合、新たに画像を作成
    makeImage(img);
    // 画像を canvas に描画
    ctx.drawImage(images[img], x, y, w, h);
}

// 中心を原点として画像を描画（透明度付き）
function imgC(img, x, y, w, h, alpha = 1) {
    // -------- 数値変換 --------
    x = Number(x);
    y = Number(y);
    w = Number(w);
    h = Number(h);

    // -------- 画像準備 --------
    const ctx = canvas.getContext('2d');
    makeImage(img);           // 画像キャッシュ

    // -------- 描画 --------
    const a = x - w / 2;
    const b = y - h / 2;

    ctx.save();               // ★ 現在の設定を退避
    ctx.globalAlpha = alpha;  // ★ 透明度 (0.0〜1.0)
    ctx.drawImage(images[img], a, b, w, h);
    ctx.restore();            // ★ 設定を元に戻す
}

// 左上を原点として回転できる画像を描画
function imgR(img, x, y, w, h, r) {
    // X座標とY座標を数値に変換
    x = Number(x);
    y = Number(y);
    // 横幅と縦幅を数値に変換
    w = Number(w);
    h = Number(h);
    // canvas要素を取得
    const ctx = canvas.getContext('2d');
    // 画像が配列にない場合、新たに画像を作成
    makeImage(img);
    // 中心座標を求める
    let a = x + w / 2;
    let b = y + h / 2;
    // 画像を canvas に描画
    ctx.save();
    ctx.translate(a, b);
    ctx.rotate(r * Math.PI / 180);
    ctx.translate(-1 * a, -1 * b);
    ctx.drawImage(images[img], x, y, w, h);
    ctx.restore();
}

// 中心を原点として回転できる画像を描画
function imgCR(img, x, y, w, h, r) {
    // X座標とY座標を数値に変換
    x = Number(x);
    y = Number(y);
    // 横幅と縦幅を数値に変換
    w = Number(w);
    h = Number(h);
    // canvas要素を取得
    const ctx = canvas.getContext('2d');
    // 画像が配列にない場合、新たに画像を作成
    makeImage(img);
    // 中心座標を求める
    let a = -w / 2;
    let b = -h / 2;
    // 画像を canvas に描画
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(r * Math.PI / 180);
    ctx.drawImage(images[img], a, b, w, h);
    ctx.restore();
}

const numberList = {
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '0': '0',
    v: 'ver',
    d: 'dess',
    h: 'hart',
    m: 'money',
    t: 'time',
    '.': 'dot',
    '-': 'mainasu',
    '/': 'slash'
}

function drowNumber(number, x, y, width, height, renderMode = 'left') {
    const t = String(number);
    if (renderMode == 'left') {
        let vx = t.length * width;
        for (let i = t.length - 1; i >= 0; i--) {
            imgC(`assets/images/number/${numberList[t[i]]}.png`, x + vx, y, width, height);
            vx -= width;
        }
    }
    else {
        let vx = 0;
        for (let i = t.length - 1; i >= 0; i--) {
            imgC(`assets/images/number/${numberList[t[i]]}.png`, x + vx, y, width, height);
            vx -= width;
        }
    }
}

function text(x, y, textStr, px, color, font = 'Times New Roman', type = 'center') {
    const ctx = canvas.getContext('2d');
    ctx.font = `${px}px '${font}'`;
    ctx.fillStyle = color;

    const metrics = ctx.measureText(textStr);
    const textWidth = metrics.width;
    const textHeight = px; // 簡易的にフォントサイズで高さを代用（より正確にする方法もあるけど）

    if (type === 'left') {
        ctx.fillText(textStr, x, y + textHeight / 2);
    } else if (type === 'right') {
        ctx.fillText(textStr, x - textWidth, y + textHeight / 2);
    } else {
        ctx.fillText(textStr, x - textWidth / 2, y + textHeight / 2);
    }
}

function drawRoundedRect(x, y, width, height, radius, fill = true, fillColor, stroke = false, strokeColor, lineWidth = 10) {
    //キャンバスを取得
    const ctx = canvas.getContext('2d');
    x -= width / 2;
    y -= height / 2;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fillStyle = fillColor;
    if (fill) ctx.fill();
    if (stroke) ctx.strokeStyle = strokeColor;
    if (stroke) ctx.lineWidth = lineWidth;
    if (stroke) ctx.stroke();
    ctx.restore();
}