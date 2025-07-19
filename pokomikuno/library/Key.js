let keyPressed = {}; // 押されているキーを記録するオブジェクト
let keyJustPressed = {}; // 今フレームで押されたキー

// キーが押されたら true にする
document.addEventListener('keydown', function (event) {
    if (!keyPressed[event.key]) {
        keyJustPressed[event.key] = true; // 今まで押されてなかったら「押した瞬間」！
    }
    keyPressed[event.key] = true;
});

// キーが離されたら false にする
document.addEventListener('keyup', function (event) {
    keyPressed[event.key] = false;
});

function keyPress(keyCode) {
    if (keyCode == 'any') {
        return Object.values(keyPressed).some(v => v); // true が一個でもあれば true
    }
    return keyPressed[keyCode];
}

function keyJustPress(keyCode) {
    return keyJustPressed[keyCode];
}