const SS_BMS_SESSION = 'SS_BMS_SESSION';

const sessionsElm = document.getElementById('sessions')

function generateUUID() {
    // Lấy thời gian milliseconds hiện tại
    var now = new Date().getTime();

    // Tạo một phần ngẫu nhiên
    var randomPart = Math.random().toString(16).substring(2);

    // Kết hợp thời gian milliseconds và phần ngẫu nhiên để tạo UUID
    var uuid = now.toString(16) + randomPart;

    return uuid;
}

const storageDB = {
    data: null,
    isExist(name) {
        return localStorage.getItem(name) !== null;
    },
    generateCreatedAt() {
        function padZero(num) {
            return (num < 10 ? '0' : '') + num;
        }

        const date = new Date();
        var day = date.getDate();
        var month = date.getMonth() + 1; // Lưu ý: Tháng trong JavaScript bắt đầu từ 0
        var year = date.getFullYear();
        var hours = date.getHours();
        var minutes = date.getMinutes();
    
        // Đảm bảo các số có hai chữ số
        day = padZero(day);
        month = padZero(month);
        hours = padZero(hours);
        minutes = padZero(minutes);
    
        return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
    },
    saveToLocalStorage() {
        localStorage.setItem(SS_BMS_SESSION, JSON.stringify(this.data));
    },
    importData() {
        this.data = JSON.parse(localStorage.getItem(SS_BMS_SESSION))
    },
    addPlayer(sID ,name, playPercent) {
        this.data.sessions.find(s => s.id === sID).players.push({
            id: generateUUID(), // ID
            name, // Tên
            playPercent, // Thời lượng đánh (%)
            giving: 0, // Nhận
            costToPay: 0, // Tiền phải trả
            isPaid: false, // Đã thanh toán chưa
            isRefund: false, // Đã thối tiền chưa
        })
        this.refresh(sID)
    },
    addSession(name, courtCost, ballCost) {
        const _this = this;
        const id = generateUUID()
        this.data.sessions.push({
            id,
            name,
            createdAt: _this.generateCreatedAt(),
            courtCost: courtCost || 0,
            ballCost: ballCost || 0,
            costs: [
                
            ],
            players: [
                
            ]
        })
        this.refresh(id)
    },
    updateSession(sessionId, name, courtCost, ballCost) {
        const session = this.findOneSession(sessionId)
        if (!session) return

        session.name = name
        session.courtCost = courtCost
        session.ballCost = ballCost
        this.refresh(session.id)
    },
    deleteSession(sessionId) {
        this.data.sessions = this.data.sessions.filter(s => s.id !== sessionId);
        this.refresh(sessionId)
    },
    findOneSession(sessionId) {
        return this.data.sessions.find(s => s.id === sessionId)
    },
    findOnePlayer(playerId) {
        let sessionId = null;
        
        this.data.sessions.forEach(s => {
            s.players.forEach(p => {
                if (p.id === playerId) {
                    sessionId = s.id
                }
            })
        })
        if (sessionId) {
            const session = this.data.sessions.find(s => s.id === sessionId)
            return {
                session, 
                player: session.players.find(p => p.id === playerId),
            };
        }
        return null;
    },
    receiveFromPlayer(playerId, money) {
        const { player, session } = this.findOnePlayer(playerId)
        if (!player) return
        player.giving = money;
        this.refresh(session.id)
    },
    donePaid(playerId) {
        const { player, session } = this.findOnePlayer(playerId)
        if (!player) return
        player.giving = player.costToPay;
        this.refresh(session.id)
    },
    deletePlayer(playerId) {
        let sessionId = null;
        
        this.data.sessions.forEach(s => {
            s.players.forEach(p => {
                if (p.id === playerId) {
                    sessionId = s.id
                }
            })
        })
        if (sessionId) {
            const session = this.data.sessions.find(s => s.id === sessionId)
            session.players = session.players.filter(p => p.id !== playerId)
            this.refresh(sessionId)
        }
    },
    updatePlayer(playerId, name, giving, playPercent) {
        const { player, session } = this.findOnePlayer(playerId)
        player.name = name
        player.giving = giving
        player.playPercent = playPercent
        this.refresh(session.id)
    },

    refresh(sessionId) {
        this.calculate(sessionId)
        this.saveToLocalStorage()
        this.renderSession()
    },

    calculate(sessionId) {
        const session = this.data.sessions.find(s => s.id === sessionId)
        if (!session) return
        const players = session.players;
        const totalCost = session.courtCost + session.ballCost
        const percents = new Set(
            players.map(player => player.playPercent).sort((a, b) => a - b)
        );
        let oldPercent = 0;
        const costs = [];
        let donePlayerNumber = 0;
        percents.forEach(percent => {
            const cost = totalCost * ((percent - oldPercent)/100) / (players.length - donePlayerNumber);
            costs.push(cost)
            oldPercent = percent;
            const suitablePlayers = Array.from(players).filter(p => p.playPercent === percent);
            donePlayerNumber += suitablePlayers.length;
            suitablePlayers.forEach(player => {
                player.costToPay = costs.reduce((cur, acc) => cur + acc, 0);
                player.isPaid = player.giving >= player.costToPay
                player.isRefund = player.giving === player.costToPay
            });
        })
        let oldTotalCost = 0;
        session.costs = costs.map(c => {
            oldTotalCost += c;
            return oldTotalCost;
        });
    },

    renderAll() {
        this.renderSession()
    },

    renderSession() {
        const _this = this;
        if (this.data.sessions?.length > 0) {
            sessionsElm.innerHTML = this.data.sessions.map(session => `
                <div class="mb-8 p-4 rounded-lg dark:bg-gray-700 bg-slate-100">
                    <p class="text-lg font-semibold text-gray-900 dark:text-white">${session.name}</p>
                    <p class="mt-1 text-sm text-gray-900 dark:text-slate-300">
                        <i class="fa-solid fa-calendar-days"></i>
                        <span class="ml-1">${session.createdAt}</span>
                    </p>
                    <p class="mt-1 text-sm text-gray-900 dark:text-slate-300">
                        <i class="fa-solid fa-money-bills mr-1"></i>
                        Tiền hóa đơn(sân): <span class="font-semibold">${formatDotMoney(session.courtCost)}</span>
                    </p>
                    <p class="mt-1 text-sm text-gray-900 dark:text-slate-300">
                        <i class="fa-solid fa-money-bills mr-1"></i>
                        Tiền cầu: <span class="font-semibold">${formatDotMoney(session.ballCost)}</span>
                    </p>
                    <p class="mt-1 text-sm text-gray-900 dark:text-slate-300">
                        <i class="fa-solid fa-money-bills mr-1"></i>
                        Tổng: <span class="font-semibold">${formatDotMoney(session.courtCost + session.ballCost)}</span>
                    </p>
                    <p class="mt-1 text-sm text-gray-900 dark:text-slate-300">
                        <i class="fa-solid fa-users mr-1"></i>
                        Tổng số người chơi: <span class="font-semibold">${session.players.length}</span>
                    </p>
                    ${
                        session.costs.length > 0
                        ?
                        `
                        <p class="mt-1 text-sm text-gray-900 dark:text-slate-300">
                            <i class="fa-solid fa-money-bills mr-1"></i>
                            Phí mỗi người:
                            ${
                                session.costs.map(cost => `
                                    <span class="bg-blue-100 text-blue-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                                        ${formatShortMoney(cost)}
                                    </span>
                                `).join('')
                            }
                        </p>
                        `
                        :
                        ''
                    }
                    <div class="mt-2 flex items-center">
                        <button type="button" data-apsid="${session.id}" data-modal-target="add-player-modal" data-modal-toggle="add-player-modal" class="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <i class="fa-solid fa-user-plus mr-2"></i>
                            Thêm thành viên
                        </button>
                        <button id="dropdownButton-${session.id}" data-dropdown-toggle="dropdown-${session.id}" class="ml-2 px-4 inline-block text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-1.5" type="button">
                            <span class="sr-only">Menu</span>
                            <i class="fa-solid fa-ellipsis"></i>
                        </button>
                        <div id="dropdown-${session.id}" class="z-40 hidden text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                            <ul class="py-2" aria-labelledby="dropdownButton-${session.id}">
                                <li>
                                    <a data-sid="${session.id}" data-modal-target="update-session-modal" data-modal-toggle="update-session-modal" class="updateSessionBtn block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Chỉnh sửa</a>
                                </li>
                                <li>
                                    <a data-sid="${session.id}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
                                        Nhân bản
                                    </a>
                                </li>
                                <li>
                                    <a data-sid="${session.id}" data-modal-target="deleteSessionConfirmationModal" data-modal-toggle="deleteSessionConfirmationModal" class="deleteSessionBtn block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-red-500 dark:font-semibold dark:hover:text-white">Xóa</a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="p-1 rounded-lg dark:bg-teal-800 bg-slate-200 mt-2">
                        <div class="w-full max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
                            <div class="flex items-center justify-between mb-4">
                            <h5 class="text-lg font-bold leading-none text-gray-900 dark:text-white">Thành viên</h5>
                            <a data-sid="${session.id}" data-modal-target="deleteAllPlayersConfirmationModal" data-modal-toggle="deleteAllPlayersConfirmationModal" class="deleteAllPlayerBtn ${session.players.length > 1 ? '' : 'hidden'} text-sm cursor-pointer font-medium text-red-600 hover:underline dark:text-red-500">
                                Xóa toàn bộ
                            </a>
                        </div>
                        <div class="flow-root">
                            <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-700">
                                ${session.players.length > 0 
                                    ?
                                    session.players.map(player => {
                                        const { isPaid, isRefund } = player;
                                        let status = '';
                                        if (isPaid && isRefund) {
                                            status = `
                                                <p class="text-sm text-green-500 truncate dark:text-green-400">
                                                    Hoàn tất
                                                </p>
                                            `;
                                        } else if (!isRefund && isPaid) {
                                            status = `
                                                <p class="text-sm text-yellow-500 truncate dark:text-yellow-400">
                                                    Chưa thối tiền
                                                </p>
                                            `;
                                        } else if (!isRefund && !isPaid) {
                                            status = `
                                                <p class="text-sm text-red-500 truncate dark:text-red-400 fb_pay select-none" data-pid="${player.id}">
                                                    Chưa thanh toán
                                                </p>
                                            `;
                                        }

                                        return `
                                            <li class="py-3 sm:py-4">
                                                <div class="flex items-center ">
                                                    <button id="dropdownButton-${player.id}" data-dropdown-toggle="dropdown-${player.id}" class="inline-block text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-1.5" type="button">
                                                        <span class="sr-only">Open dropdown</span>
                                                        <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3">
                                                            <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/>
                                                        </svg>
                                                    </button>
                                                    <div id="dropdown-${player.id}" class="z-40 hidden text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                                                        <ul class="py-2" aria-labelledby="dropdownButton-${player.id}">
                                                            <li>
                                                                <a data-pid="${player.id}" data-modal-target="receive-money-modal" data-modal-toggle="receive-money-modal" class="receiveMoneyBtn block cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Nhận tiền</a>
                                                            </li>
                                                            <li>
                                                                <a data-pid="${player.id}" data-modal-target="donePaidConfirmationModal" data-modal-toggle="donePaidConfirmationModal" class="donePaidBtn block cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Hoàn thành</a>
                                                            </li>
                                                            <li>
                                                                <a data-pid="${player.id}" data-modal-target="update-player-modal" data-modal-toggle="update-player-modal" class="updatePlayerModalBtn block cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Chỉnh sửa</a>
                                                            </li>
                                                            <li>
                                                                <a data-pid="${player.id}" data-modal-target="deletePlayerConfirmationModal" data-modal-toggle="deletePlayerConfirmationModal" class="deletePlayerBtn block cursor-pointer px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-red-500 dark:font-semibold dark:hover:text-white">Xóa</a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <div class="flex-1 min-w-0 ms-4">
                                                        <p class="text-sm font-medium text-gray-900 truncate dark:text-white">
                                                            ${player.name} <span class="ml-1 text-gray-500 truncate dark:text-gray-400">${player.playPercent}%</span>
                                                        </p>
                                                        <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                                                            <span class="text-sm text-cyan-600 truncate dark:text-cyan-400">Nhận: ${formatShortMoney(player.giving)}</span>
                                                            <br>
                                                            <span class="text-sm text-yellow-600 truncate dark:text-yellow-400">
                                                                ${player.giving && player.giving < player.costToPay ? 'Còn thiếu' : 'Thối'}: ${player.giving ? formatShortMoney(Math.abs(player.giving - player.costToPay)): '0đ'}
                                                            </span>
                                                        </p>
                                                        ${status}
                                                    </div>
                                                    <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                                        ${formatShortMoney(player.costToPay)}
                                                    </div>
                                                </div>
                                            </li>
                                        `;
                                    }).join('')
                                    : 
                                    '<p class="text-sm text-gray-900 dark:text-gray-300 text-center">Hiện không có thành viên nào.</p>'
                                }
                            </ul>
                        </div>
                        </div>
                    </div>
                </div>
            `).join('');

            // Listen event for this session
    
            // ==> Change session id of add player form
            document.querySelectorAll('[data-apsid]').forEach(btn => {
                btn.onclick = () => {
                    document.querySelector('input#ap-sID').value = btn.dataset.apsid;
                    document.querySelector('#add-player-form #ap-sname').textContent = _this.data.sessions.find(s => s.id === btn.dataset.apsid).name;
                }
            })

            // ==> Click yes in delete all players confirmation modal
            document.querySelectorAll('.deleteAllPlayerBtn').forEach(btn => {
                btn.onclick = () => {
                    const sid = btn.dataset.sid;
                    document.getElementById('yesDltAllPlayerBtn').dataset.sid = sid;
                }
            })
            document.getElementById('yesDltAllPlayerBtn').onclick = e => {
                const sid = e.target.dataset.sid;
                hideFlowbiteModal('deleteAllPlayersConfirmationModal')
                _this.data.sessions.find(s => s.id == sid).players = []
                _this.refresh(sid)
                
                showToast(toastStatus.SUCCESS, 'Thành công')
            }
            // ==> Click yes in delete session confirmation modal
            document.querySelectorAll('.deleteSessionBtn').forEach(btn => {
                btn.onclick = () => {
                    const sid = btn.dataset.sid;
                    document.getElementById('yesDltSessionBtn').dataset.sid = sid;
                }
            })
            document.getElementById('yesDltSessionBtn').onclick = e => {
                const sid = e.target.dataset.sid;
                hideFlowbiteModal('deleteSessionConfirmationModal')
                _this.deleteSession(sid)
                showToast(toastStatus.SUCCESS, 'Thành công')
            }
            // ==> Click update session
            document.querySelectorAll('.updateSessionBtn').forEach(btn => {
                btn.onclick = () => {
                    const session = _this.findOneSession(btn.dataset.sid);
                    document.getElementById('us-sID').value = session.id;
                    document.getElementById('us-sname').value = session.name;
                    document.getElementById('us-ccost').value = session.courtCost;
                    document.getElementById('us-ccost').parentElement.querySelector('span.fmt-val').textContent = formatDotMoney(session.courtCost);
                    document.getElementById('us-bcost').value = session.ballCost;
                    document.getElementById('us-bcost').parentElement.querySelector('span.fmt-val').textContent = formatDotMoney(session.ballCost);
                }
            })
            // ==> Click yes in delete player confirmation modal
            document.querySelectorAll('.deletePlayerBtn').forEach(btn => {
                btn.onclick = () => {
                    const pid = btn.dataset.pid;
                    document.getElementById('yesDltPlayerBtn').dataset.pid = pid;
                }
            })
            document.getElementById('yesDltPlayerBtn').onclick = e => {
                const pid = e.target.dataset.pid;
                hideFlowbiteModal('deletePlayerConfirmationModal')
                _this.deletePlayer(pid)
                showToast(toastStatus.SUCCESS, 'Thành công')
            }
            // ==> Click receive money
            document.querySelectorAll('.receiveMoneyBtn').forEach(btn => {
                btn.onclick = () => {
                    const pid = btn.dataset.pid;
                    const { player } = _this.findOnePlayer(pid);
                    document.getElementById('rm-pID').value = pid
                    document.getElementById('rm-pname').textContent = player.name
                    document.getElementById('rm-giving').value = player.giving
                    document.getElementById('rm-giving').parentElement.querySelector('span.fmt-val').textContent = formatDotMoney(player.giving);
                }
            })
            // ==> Click receive money
            document.querySelectorAll('.receiveMoneyBtn').forEach(btn => {
                btn.onclick = () => {
                    const pid = btn.dataset.pid;
                    const { player } = _this.findOnePlayer(pid);
                    document.getElementById('rm-pID').value = pid
                    document.getElementById('rm-pname').textContent = player.name
                    document.getElementById('rm-giving').value = player.giving
                    document.getElementById('rm-giving').parentElement.querySelector('span.fmt-val').textContent = formatDotMoney(player.giving);
                }
            })

            // ==> Click done paid
            document.querySelectorAll('.donePaidBtn').forEach(btn => {
                btn.onclick = () => {
                    const pid = btn.dataset.pid;
                    document.getElementById('yesDonePaidBtn').dataset.pid = pid;
                }
            })
            document.getElementById('yesDonePaidBtn').onclick = e => {
                const pid = e.target.dataset.pid
                hideFlowbiteModal('donePaidConfirmationModal')
                _this.donePaid(pid)
                showToast(toastStatus.SUCCESS, 'Thành công')
            }

            // ==> Click update player info
            document.querySelectorAll('.updatePlayerModalBtn').forEach(btn => {
                btn.onclick = () => {const pid = btn.dataset.pid;
                    const { player } = _this.findOnePlayer(pid);
                    document.getElementById('upf-pID').value = player.id
                    document.getElementById('upf-name').value = player.name
                    document.getElementById('upf-giving').value = player.giving
                    document.getElementById('upf-giving').parentElement.querySelector('span.fmt-val').textContent = formatDotMoney(player.giving);
                    document.getElementById('upf-playPercent').value = player.playPercent
                }
            });

            // Xử lí sự kiện click "chưa thanh toán" => "hoàn tất"
            // Nhầm mục đích xử lí chuyển đổi trạng thái nhanh chóng hơn
            const fastChangeStatus = ({ pid }) => {
                _this.donePaid(pid)
                showToast(toastStatus.SUCCESS, 'Thành công')
            }
            const fbPayBtn = document.querySelectorAll('.fb_pay');
            
            Array.from(fbPayBtn).forEach(element => {
                let timer;

                element.addEventListener("touchstart", function(e) {
                    timer = setTimeout(function() {
                        fastChangeStatus({pid: e.target.dataset.pid})
                    }, 600);
                });

                element.addEventListener("touchend", function() {
                    clearTimeout(timer);
                });
            });

            // Re-init flowbite
            initFlowbite();
        } else {
            sessionsElm.innerHTML = `
                <div class="text-lg text-gray-900 dark:text-gray-400 text-center">
                    <div class="text-4xl my-4">
                        <i class="fa-regular fa-face-dizzy"></i>
                    </div>
                    Ooops!
                    <br>
                    Hiện bạn chưa có phiên nào
                    <br>
                    Vui lòng nhấn thêm phiên ở bên dưới
                </div>
            `;
        }
    },

    init() {
        if (!this.isExist(SS_BMS_SESSION)) {
            this.data = {
                sessions: [
                    
                ]
            };
            this.saveToLocalStorage()
        } else {
            this.importData()
        }
        this.renderAll()
    },
}

try {
    storageDB.init();
} catch (error) {
    console.log(error);
}