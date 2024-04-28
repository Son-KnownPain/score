const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// Elements
const endScoreElm = $('.score');
const endScoreValueElm = $('.score-value');
const playersElm = $('.players');
const resetBtn = $('.resetBtn');

// App
let appInfo = {
    isChangeCourt: false,
    score: 21,
    players: [
        {
            id: 1,
            name: 'Người chơi 1',
            score: 0,
        },
        {
            id: 2,
            name: 'Người chơi 2',
            score: 0
        }
    ],
    playerTurn: 1,
    setEndScore(newEndScore) {
        this.score = newEndScore
        endScoreValueElm.textContent = newEndScore
    },
    render() {
        const _this = this;
        const score = this.score
        endScoreValueElm.textContent = score
        const playersHtml = this.players.map(player => `
            <div class="col-6">
                <div class="player-item ${appInfo.playerTurn == player.id ? 'turn' : ''}">
                    <h2 class="player-name" data-id="${player.id}">
                        ${player.name}
                    </h2>
                    <div class="player-score">
                        <h4 class="player-scoreText">
                            ${player.score}
                        </h4>
                    </div>
                    <div class="player-actions">
                        <button class="player-actionItem" data-id="${player.id}" data-type="minus">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <button class="player-actionItem" data-id="${player.id}" data-type="plus">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `);
        playersElm.innerHTML = `
            <div class="row">
                ${playersHtml.join('')}
            </div>
        `;

        const playerActionsElms = $$('.player-actionItem');
        playerActionsElms.forEach(elm => {
            elm.onclick = e => {
                const id = elm.dataset.id;
                const player = appInfo.players.find(player => player.id == id);
                if (elm.dataset.type === 'minus') {
                    player.score--;
                } else {
                    player.score++;
                }

                if (player.score == (score / 2).toFixed() && !_this.isChangeCourt) {
                    annouceChangeCourt();
                    _this.isChangeCourt = true;
                }

                appInfo.playerTurn = player.id;

                appInfo.render();
            }
        });

        const playerNameElms = $$('.player-name');
        playerNameElms.forEach(elm => {
            elm.onclick = e => {
                const newName = prompt(`Nhập tên mới cho "${elm.textContent.trim()}"`);
                const id = elm.dataset.id;
                const player = appInfo.players.find(player => player.id == id);
                player.name = newName ?? 'Chưa đặt tên';

                appInfo.render();
            }
        })
    },
}

// Events
endScoreElm.onclick = e => {
    const newEndScore = prompt('Nhập điểm kết thúc mới');
    if (!newEndScore.match('\\d+')) {
        alert('Vui lòng nhập số');
    } else {
        appInfo.setEndScore(newEndScore)
    }
}

resetBtn.onclick = () => {
    appInfo.isChangeCourt = false;
    appInfo.score = 21;
    appInfo.players = [
        {
            id: 1,
            name: 'Người chơi 1',
            score: 0,
        },
        {
            id: 2,
            name: 'Người chơi 2',
            score: 0
        }
    ];
    appInfo.playerTurn = 1;
    appInfo.render();
}

appInfo.render();

function annouceChangeCourt() {
    const modal = document.querySelector('.modal')
    const modalBackdrop = document.querySelector('.modal-backdrop')
    const modalCloseBtn = document.querySelector('.modal .btn button')

    modal.classList.toggle('active')
    modalBackdrop.classList.toggle('active')

    modalCloseBtn.onclick = () => {
        modal.classList.remove('active')
        modalBackdrop.classList.remove('active')
    }
}