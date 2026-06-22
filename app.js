let gameSeq = []
let userSeq = []

let btns = ["yellow", "red", "purple", "blue"]
let started = false;
let level = 0;

let h2 = document.querySelector("h2")

document.addEventListener("keypress", function () {
    if (started === false){
        console.log("Game Has started")
        started = true
        levelup();
    }
})

function levelup (){
    userSeq = []
    level ++ ;
    h2.innerText = `Level ${level}`;

    let randIdx = Math.floor(Math.random() *3);
    let randColor = btns[randIdx];
    let randBtn = document.querySelector(`.${randColor}`)
    gameSeq.push(randColor);

    gameFlash(randBtn);

}

function gameFlash (btn) {
    btn.classList.add("flash")
    setTimeout(function (){
        btn.classList.remove("flash")}, 300
    )
}

function userFlash (btn) {
    btn.classList.add("userflash")
    setTimeout(function (){
        btn.classList.remove("userflash")}, 150
    )
}

function checkAns (idx){
    
    if (userSeq[idx] === gameSeq[idx]) {
        if (userSeq.length == gameSeq.length){
            setTimeout(levelup, 1000)
        }
    }
    else {

        h2.innerHTML = `Game Over ! You score was <b> ${level}</b> <br> Press any key to start. `;
        document.querySelector("body").style.backgroundColor = "red";
        setTimeout(function () {
            document.querySelector("body").style.backgroundColor = "white";
        }, 150)
        reset()
}
}

function createSparkles(x, y, colorId) {
    const colorMap = {
        red: '#ff4b5c',
        yellow: '#ffd200',
        blue: '#00b4ff',
        purple: '#b61aff'
    };
    const sparkleColor = colorMap[colorId] || '#ffffff';

    const count = 12;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'sparkle-particle';
        
        const size = Math.random() * 8 + 6;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = sparkleColor;
        particle.style.boxShadow = `0 0 8px ${sparkleColor}, 0 0 16px ${sparkleColor}`;
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.opacity = '1';
        
        document.body.appendChild(particle);

        const angle = (i * (360 / count)) + (Math.random() * 20 - 10);
        const distance = Math.random() * 50 + 40;
        const dx = Math.cos((angle * Math.PI) / 180) * distance;
        const dy = Math.sin((angle * Math.PI) / 180) * distance;

        // Force a layout/render pass and animate
        setTimeout(() => {
            particle.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.1)`;
            particle.style.opacity = '0';
        }, 10);

        setTimeout(() => {
            particle.remove();
        }, 600);
    }
}

function btnPress (e) {
    let btn = this;
    
    if (started) {
        if (e && e.clientX && e.clientY) {
            createSparkles(e.clientX, e.clientY, btn.id);
        } else {
            let rect = btn.getBoundingClientRect();
            createSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2, btn.id);
        }
    }
    
    userFlash(btn)
    userColor = btn.getAttribute("id");
    userSeq.push(userColor);

    checkAns(userSeq.length - 1);
}

let allBtns = document.querySelectorAll(".btn");
for (let btn of allBtns) {

    btn.addEventListener("click", btnPress);

}

function reset () {
    started = false;
    gameSeq = [];
    userSeq = [];
    level = 0;

}

