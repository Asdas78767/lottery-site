// Define the server endpoint URLs
const submitSelectionUrl = '/api/submit-selection';
const triggerDrawUrl = '/api/trigger-draw';
const getDrawResultsUrl = '/api/get-draw-results';

let participantsCount = 0;
let loggedIn = false;
let isAdmin = false;
let winners = [];
let selectedImages = [];

const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const drawBtn = document.getElementById('draw-btn');
const submitSelectionBtn = document.getElementById('submit-selection-btn');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const lottoForm = document.getElementById('lotto-form');
const winnersList = document.getElementById('winners-list');
const participantsCountElem = document.getElementById('participants-count');
const countdownElem = document.getElementById('timer');
const signupLink = document.getElementById('signup-link');
const loginLink = document.getElementById('login-link');
const drawResult = document.getElementById('draw-result');
const completionMessage = document.getElementById('completion-message');
let countdownDate = new Date().setHours(22, 0, 0, 0); // 매일 10시까지

// Handle login functionality
loginBtn.addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === '4483') {
        isAdmin = true;
        loggedIn = true;
        alert('관리자로 로그인했습니다.');
    } else if (username && password) {
        loggedIn = true;
    }

    updateUI();
});

// Handle signup functionality
signupBtn.addEventListener('click', () => {
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    alert('회원가입이 완료되었습니다.');
    updateUI();
});

// Handle form switching
signupLink.addEventListener('click', () => {
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
});

loginLink.addEventListener('click', () => {
    signupForm.classList.remove('active');
    loginForm.classList.add('active');
});

// Handle image selection
const images = document.querySelectorAll('.pokemon-image');
images.forEach(image => {
    image.addEventListener('click', () => {
        if (selectedImages.length < 4 || image.classList.contains('selected')) {
            image.classList.toggle('selected');
            if (image.classList.contains('selected')) {
                selectedImages.push(image.alt);
            } else {
                const index = selectedImages.indexOf(image.alt);
                if (index > -1) {
                    selectedImages.splice(index, 1);
                }
            }
        }
    });
});

// Submit selected images
submitSelectionBtn.addEventListener('click', () => {
    if (selectedImages.length === 4) {
        fetch(submitSelectionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ images: selectedImages })
        }).then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(`HTTP error! Status: ${response.status}, Message: ${err.message}`); });
            }
            return response.json();
        }).then(data => {
            alert('선택이 제출되었습니다.');
            saveSubmissionDate();
        }).catch(error => {
            console.error('Submission Error:', error);
            alert(`제출 실패. 다시 시도해 주세요. 오류 메시지: ${error.message}`);
        });
    } else {
        alert('4개의 이미지를 선택하세요.');
    }
});

// Trigger draw for winners
drawBtn.addEventListener('click', () => {
    if (!loggedIn) {
        alert('로그인이 필요합니다.');
        return;
    }

    fetch(triggerDrawUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
      .then(data => {
          winners = data.winners;
          displayWinners();
          completionMessage.style.display = 'block';
          drawBtn.style.display = 'none';
      }).catch(error => {
          console.error('Draw Error:', error);
          alert('추첨 실패. 다시 시도해 주세요.');
      });
});

// Display winners and selected images
function displayWinners() {
    winnersList.innerHTML = '';
    winners.forEach(winner => {
        const li = document.createElement('li');
        li.textContent = winner;
        winnersList.appendChild(li);
    });
    drawResult.style.display = 'block';

    // Display the selected images
    const selectedImagesContainer = document.createElement('div');
    selectedImagesContainer.classList.add('selected-images-container');
    winners.forEach(image => {
        const imgElement = document.createElement('img');
        imgElement.src = `/lottery-sitepoke/images/${image}`;
        imgElement.alt = image;
        selectedImagesContainer.appendChild(imgElement);
    });
    drawResult.appendChild(selectedImagesContainer);
}

// Update countdown timer
function updateCountdown() {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    if (distance < 0) {
        alert('새로운 추첨이 시작되었습니다!');
        countdownDate = new Date().setHours(22, 0, 0, 0); // Reset to the next day
    }

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdownElem.textContent = `${hours}시간 ${minutes}분 ${seconds}초`;
}

// Update the UI based on login status
function updateUI() {
    if (loggedIn) {
        lottoForm.classList.add('active');
        participantsCount++;
        participantsCountElem.textContent = participantsCount;
        loginForm.classList.remove('active');
        signupForm.classList.remove('active');

        if (isAdmin) {
            console.log('Admin logged in: showing draw button');
            drawBtn.style.display = 'block'; // Show draw button for admin
            drawResult.style.display = 'block'; // Show draw result for admin
        } else {
            console.log('Non-admin user logged in');
        }
    } else {
        lottoForm.classList.remove('active');
        console.log('User not logged in');
    }
}

// Check if the user has already submitted today
function hasSubmittedToday() {
    const submissions = JSON.parse(localStorage.getItem('submissions')) || {};
    const today = new Date().toISOString().split('T')[0];
    return submissions[today] !== undefined;
}

// Save submission date to prevent multiple submissions per day
function saveSubmissionDate() {
    const submissions = JSON.parse(localStorage.getItem('submissions')) || {};
    const today = new Date().toISOString().split('T')[0];
    submissions[today] = true;
    localStorage.setItem('submissions', JSON.stringify(submissions));
}

setInterval(updateCountdown, 1000); // Update countdown every second
