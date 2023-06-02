const addPlayerBtn = document.getElementById('addPlayerBtn');
const playerNameInput = document.getElementById('playerNameInput');
const playersBox = document.querySelector('.players');
const updateBtn = document.getElementById('updateBtn');
const endScoreElm = document.getElementById('endScore');
const endScoreInput = document.getElementById('endScoreInput');
const endScoreEditBtn = document.querySelector('.score-edit');

let playerID = 1;

function addPlayer(name) {
    if (name === '') return;
    const oldHtml = playersBox.innerHTML;
    playersBox.innerHTML = oldHtml +
        `
        <div class="player">
            <div class="row">
                <div class="col-3">
                    <h2 class="player-name namePlayer${playerID}">
                        ${name}
                    </h2>
                </div>
                <div class="col-3">
                    <span class="player-score player${playerID}" data-score="0">
                        0
                    </span>
                </div>
                <div class="col-6">
                    <input type="number" class="player-input" data-player="${playerID}">
                </div>
            </div>
        </div>
    `;
    playerNameInput.value = '';
    playerID++;
}

function updateScore() {

    const scoreInputs = document.querySelectorAll('.player-input');
    scoreInputs.forEach(item => {
        const id = item.dataset.player;
        const scoreElm = document.querySelector('.player' + id);
        const oldScore = parseInt(scoreElm.dataset.score);
        if (item.value !== '') {
            const score = oldScore + parseInt(item.value);
            scoreElm.textContent = score;
            scoreElm.dataset.score = score;

            if (score >= parseInt(endScoreElm.dataset.endScore)) {
                const playerNameElm = document.querySelector('.player-name.namePlayer' + id);
                const winnerElm = document.querySelector('.winner');
                winnerElm.textContent = 'Người chiến thắng: ' + playerNameElm.textContent.trim();
                winnerElm.style.display = 'block';
            }
        }
        item.value = '';
    })
}

addPlayerBtn.onclick = e => {
    addPlayer(playerNameInput.value);
}

updateBtn.onclick = e => {
    updateScore();
}

endScoreEditBtn.onclick = e => {
    const newEndScore = parseInt(endScoreInput.value);
    endScoreElm.textContent = newEndScore;
    endScoreElm.dataset.endScore = newEndScore;
    endScoreInput.value = '';
}