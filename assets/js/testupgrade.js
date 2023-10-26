function upgrade() {
    const ratioElm = document.getElementById('ratio');

    const ratioVal = ratioElm.value;

    var randomNumber = Math.floor(Math.random() * 100);
    console.log(randomNumber);
    if (randomNumber < ratioVal) {
        document.getElementById('display-result').textContent = 'Thành công!';
    } else {
        document.getElementById('display-result').textContent = 'Thất bại!';
    }
}