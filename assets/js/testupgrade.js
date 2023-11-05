var sc = 0;
var fail = 0;

function upgrade() {
    const ratioElm = document.getElementById('ratio');

    const ratioVal = ratioElm.value;

    var randomNumber = Math.floor(Math.random() * 100);
    const resultElm = document.getElementById('box');
    if (randomNumber < ratioVal) {
        scFn();
        resultElm.innerHTML = '<h1 style="color: green;" id="display-result">Thành công!</h1>';
    } else {
        failFn();
        resultElm.innerHTML = '<h1 style="color: red;" id="display-result">Thất bại!</h1>';
    }
}

function scFn() {
    sc++;
    const resultElm = document.getElementById('sc');
    resultElm.textContent = sc;
}

function failFn() {
    fail++;
    const resultElm = document.getElementById('fail');
    resultElm.textContent = fail;
}

function rsFn() {
    sc = 0;
    fail = 0;
    const resultElm1 = document.getElementById('sc');
    resultElm1.textContent = sc;
    const resultElm2 = document.getElementById('fail');
    resultElm2.textContent = fail;
}