// 랜덤 추첨 버튼
const drawButton = document.getElementById('draw-button');
const drawResult = document.getElementById('draw-result');

// 추첨 함수
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

drawButton.addEventListener('click', () => {
    drawResult.innerHTML = "추첨 중...";
    const result = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]).slice(0, 4);
    setTimeout(() => {
        drawResult.innerHTML = result.map(id => `<img src="${id}.jpg" alt="Pokemon ${id}" class="result-img">`).join('');
    }, 2000); // 2초 후에 결과 출력
});