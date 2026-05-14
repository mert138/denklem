// Oyun Durumu
let gameState = {
    currentLevel: 'kolay', // kolay, orta, zor
    streak: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    timerInterval: null,
    timeLeft: 30,
    isAnswering: false
};

// Rastgele Oyun Bitti Mesajları
const failureMessages = [
    "Eee... Matematiği belki de seçmemeliydim diye düşün! 😅",
    "Bu denklemi bulamayan ne biliyorsun yani! 🤔",
    "Matematik karşı değil misin acaba? 💭",
    "Hmm... X'i bulmak zorunda değilsin! 😜",
    "Şampiyonlar hiç böyle yapmazlar! 👑",
    "Denklemler senin arkadaş değil mi görünüyor! 😩",
    "Bu kadarını bile çözemezsen oyunun en kolay sorusunu naaaa! 😱",
    "Belki matematik yerine tarih oku daha iyi olur! 📚",
    "Bu denklemi bulamamışsın... Başarısız! ❌",
    "X sanırım seni kaçıp gitti! 🏃",
];

const winMessages = [
    "TEBRIKLER ŞAMPIYON! Matematik tanrısısın! 👑✨",
    "YEDİ DÜVELİ TÜRK'ÜN MATEMATIĞINI BAŞARDIN! 🎖️",
    "GÖKTEN İNDİ MUHAMMET ATAN HOCASI! 🌟",
    "HARIKASINA ÇÖZDÜN! Genç matematikçi! 🧮",
    "BÜTÜN TÜRKIYE'NİN MATEMATİK ŞAMPIYONU SEN! 🏆",
];

// Soru Bankası Oluştur
function generateQuestionBank() {
    let questionBank = {
        kolay: [],
        orta: [],
        zor: []
    };

    // Kolay Sorular (basit birinci derece denklemler)
    for (let i = 0; i < 80; i++) {
        const a = Math.floor(Math.random() * 5) + 1; // 1-5
        const b = Math.floor(Math.random() * 10) + 1; // 1-10
        const c = a * b + Math.floor(Math.random() * 10) - 5; // sonuç
        
        const x = b;
        const equation = `${a}x + ${c - a*b} = ${c}`;
        
        questionBank.kolay.push(generateQuestion(equation, x));
    }

    // Orta Sorular (biraz daha karmaşık)
    for (let i = 0; i < 80; i++) {
        const a = Math.floor(Math.random() * 5) + 2; // 2-6
        const b = Math.floor(Math.random() * 5) + 3; // 3-7
        const c = a * b - Math.floor(Math.random() * 20) - 10; // sonuç
        
        const x = b;
        const equation = `${a}x - ${Math.abs(c - a*b)} = ${c}`;
        
        questionBank.orta.push(generateQuestion(equation, x));
    }

    // Zor Sorular (iki taraflı denklemler)
    for (let i = 0; i < 80; i++) {
        const a = Math.floor(Math.random() * 4) + 2; // 2-5
        const b = Math.floor(Math.random() * 4) + 3; // 3-6
        const c = Math.floor(Math.random() * 3) + 1; // 1-3
        const d = Math.floor(Math.random() * 10) + 5; // 5-14
        
        const x = (d - (a*b - c*b)) / (a - c);
        
        if (Number.isInteger(x) && x > 0 && x < 100) {
            const left = `${a}x + ${a*b}`;
            const right = `${c}x + ${d}`;
            const equation = `${left} = ${right}`;
            
            questionBank.zor.push(generateQuestion(equation, Math.floor(x)));
        }
    }

    // Eksik sorular varsa doldur
    while (questionBank.zor.length < 80) {
        const a = Math.floor(Math.random() * 3) + 1;
        const x = Math.floor(Math.random() * 15) + 1;
        const c = Math.floor(Math.random() * 10);
        
        const equation = `${a}x + ${c} = ${a*x + c}`;
        questionBank.zor.push(generateQuestion(equation, x));
    }

    return questionBank;
}

// Soru ve Seçenekler Oluştur
function generateQuestion(equation, correctAnswer) {
    const options = [correctAnswer];
    
    // Yanlış cevaplar
    while (options.length < 4) {
        let wrong = Math.floor(Math.random() * 30) + 1;
        if (!options.includes(wrong)) {
            options.push(wrong);
        }
    }
    
    // Karıştır
    options.sort(() => Math.random() - 0.5);
    
    return {
        equation: equation,
        options: options,
        correctAnswer: correctAnswer,
        correctIndex: options.indexOf(correctAnswer)
    };
}

// Soru Bankasını Global Olarak Oluştur
let questionBank = generateQuestionBank();
let currentQuestionIndex = {
    kolay: 0,
    orta: 0,
    zor: 0
};

// Ana Sayfa'ya Git
function goHome() {
    resetGame();
    showPage('homePage');
}

// Oyuna Başla
function startGame() {
    resetGame();
    gameState.currentLevel = 'kolay';
    gameState.streak = 0;
    gameState.totalCorrect = 0;
    gameState.totalQuestions = 0;
    
    showPage('gamePage');
    displayQuestion();
    startTimer();
}

// Oyun Sıfırla
function resetGame() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    gameState.isAnswering = false;
    gameState.timeLeft = 30;
}

// Sayfa Göster/Gizle
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageName).classList.add('active');
}

// Timer Başlat
function startTimer() {
    gameState.timeLeft = 30;
    updateTimerDisplay();
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            endGame('Zaman Bitti!');
        } else if (gameState.timeLeft <= 10) {
            document.getElementById('timer').classList.add('warning');
        }
    }, 1000);
}

// Timer Göster
function updateTimerDisplay() {
    document.getElementById('timer').textContent = gameState.timeLeft;
}

// Soruyu Göster
function displayQuestion() {
    const level = gameState.currentLevel;
    const levelText = level === 'kolay' ? 'Kolay' : level === 'orta' ? 'Orta' : 'Zor';
    
    document.getElementById('levelDisplay').textContent = levelText;
    document.getElementById('streakCount').textContent = gameState.streak;
    
    const questionList = questionBank[level];
    const questionIndex = currentQuestionIndex[level] % questionList.length;
    const question = questionList[questionIndex];
    
    currentQuestionIndex[level]++;
    
    document.getElementById('equation').textContent = question.equation;
    
    for (let i = 0; i < 4; i++) {
        document.getElementById(`option${i}`).textContent = `x = ${question.options[i]}`;
    }
    
    // Seçenekleri sıfırla
    document.querySelectorAll('.option-btn').forEach((btn, index) => {
        btn.classList.remove('selected', 'correct', 'incorrect', 'disabled');
        btn.onclick = function() { 
            if (!gameState.isAnswering) selectAnswer(index);
        };
    });
    
    gameState.currentQuestion = question;
    gameState.totalQuestions++;
    document.getElementById('questionNum').textContent = `Soru ${gameState.totalQuestions}`;
}

// Cevap Seç
function selectAnswer(index) {
    if (gameState.isAnswering) return;
    
    gameState.isAnswering = true;
    clearInterval(gameState.timerInterval);
    
    const isCorrect = gameState.currentQuestion.correctIndex === index;
    
    // Seçilen butonu göster
    document.querySelectorAll('.option-btn')[index].classList.add('selected');
    
    setTimeout(() => {
        if (isCorrect) {
            document.querySelectorAll('.option-btn')[index].classList.add('correct');
            gameState.streak++;
            gameState.totalCorrect++;
            
            // Seviye Atla Kontrolü
            if (gameState.streak >= 5) {
                if (gameState.currentLevel === 'kolay') {
                    gameState.currentLevel = 'orta';
                    gameState.streak = 0;
                } else if (gameState.currentLevel === 'orta') {
                    gameState.currentLevel = 'zor';
                    gameState.streak = 0;
                } else {
                    // Kazandı!
                    endGame('KAZANDIN!', true);
                    return;
                }
            }
            
            setTimeout(() => {
                gameState.isAnswering = false;
                displayQuestion();
                startTimer();
            }, 1500);
        } else {
            // Yanlış cevap
            document.querySelectorAll('.option-btn')[index].classList.add('incorrect');
            document.querySelectorAll('.option-btn')[gameState.currentQuestion.correctIndex].classList.add('correct');
            
            setTimeout(() => {
                endGame('Oyun Bitti!');
            }, 2000);
        }
    }, 800);
}

// Oyun Bitir
function endGame(message, won = false) {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    const levelText = gameState.currentLevel === 'kolay' ? 'Kolay' : 
                      gameState.currentLevel === 'orta' ? 'Orta' : 'Zor';
    
    document.getElementById('finalLevel').textContent = levelText;
    document.getElementById('correctAnswers').textContent = gameState.totalCorrect;
    
    const successRate = gameState.totalQuestions > 0 ? 
        Math.round((gameState.totalCorrect / gameState.totalQuestions) * 100) : 0;
    document.getElementById('successRate').textContent = successRate + '%';
    
    if (won) {
        document.getElementById('resultTitle').textContent = '🎉 TEBRIKLER ŞAMPIYON! 👑';
        const winMsg = winMessages[Math.floor(Math.random() * winMessages.length)];
        document.getElementById('resultMessage').textContent = winMsg;
    } else {
        document.getElementById('resultTitle').textContent = '😢 Oyun Bitti!';
        const failMsg = failureMessages[Math.floor(Math.random() * failureMessages.length)];
        document.getElementById('resultMessage').textContent = failMsg;
    }
    
    showPage('gameOverPage');
}

// Sayfa Yükleme Tamamlandığında
document.addEventListener('DOMContentLoaded', () => {
    showPage('homePage');
});
