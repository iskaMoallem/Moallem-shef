let tInt, tEnd, audioCtx, alarmInterval, autoStopTimeout,  timerWakeLock = null;

function playBeep() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sine'; osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0, audioCtx.currentTime); 
    gain.gain.exponentialRampToValueAtTime(1, audioCtx.currentTime + 0.1); 
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    osc.start(); osc.stop(audioCtx.currentTime + 0.6);
}

function toggleTimerPanel() {
    const panel = document.getElementById('timerPanel');
    if (panel.classList.contains('active')) hideTimer();
    else { panel.style.display = 'flex'; setTimeout(() => panel.classList.add('active'), 10); }
}

function hideTimer() {
    const panel = document.getElementById('timerPanel');
    panel.classList.remove('active');
    setTimeout(() => { if (!panel.classList.contains('active')) panel.style.display = 'none'; }, 300);
}

function triggerAlarm() {
    clearInterval(tInt); clearInterval(alarmInterval);
    playBeep(); alarmInterval = setInterval(playBeep, 1000);
    document.getElementById('timerHeaderBtn').innerText = "🔔!";
    document.body.classList.add('timer-alert');
    document.getElementById('timerNormalContent').style.display = 'none';
    document.getElementById('alarmContent').style.display = 'block';
    const panel = document.getElementById('timerPanel');
    panel.style.display = 'flex'; setTimeout(() => panel.classList.add('active'), 10);
}



function stopTimer() {
    releaseWakeLock(); 
    clearInterval(tInt); clearInterval(alarmInterval);
    document.body.classList.remove('timer-alert');
    document.getElementById('timerHeaderBtn').innerText = '⏱️';
    document.getElementById('timerDisplay').innerText = '00:00';
    document.getElementById('timerInputGroup').style.display = 'block';
    document.getElementById('activeTimerControls').style.display = 'none';
    document.getElementById('timerNormalContent').style.display = 'block';
    document.getElementById('alarmContent').style.display = 'none';
    hideTimer(); 
}

function startTimer() {
    requestWakeLock(); 
    clearInterval(tInt); 
    clearInterval(alarmInterval);
    const m = parseInt(document.getElementById('timerMin').value);
    if(m <= 0 || isNaN(m)) return;
    document.getElementById('timerNormalContent').style.display = 'block';
    document.getElementById('alarmContent').style.display = 'none';
    tEnd = Date.now() + m * 60000;
    tInt = setInterval(() => {
        const diff = tEnd - Date.now();
        if(diff <= 0) { clearInterval(tInt); triggerAlarm(); }
        else {
            const min = Math.floor(diff/60000), sec = Math.floor((diff/1000)%60);
            const timeStr = `${min}:${sec < 10 ? '0' : ''}${sec}`;
            document.getElementById('timerHeaderBtn').innerText = timeStr;
            document.getElementById('timerDisplay').innerText = timeStr;
        }
    }, 1000);
    document.getElementById('timerInputGroup').style.display = 'none';
    document.getElementById('activeTimerControls').style.display = 'block';
    hideTimer(); 
}

function cancelTimer() 
{ stopTimer(); }


    

    const Timer = {
    init: () => {
        document.getElementById('btnStartTimer')?.addEventListener('click', startTimer);
        document.getElementById('btnCancelTimerHeader')?.addEventListener('click', cancelTimer);
        document.getElementById('btnCancelTimerModal')?.addEventListener('click', cancelTimer);
        document.getElementById('btnCloseTimer')?.addEventListener('click', hideTimer);
        document.getElementById('timerHeaderBtn')?.addEventListener('click', toggleTimerPanel);
        document.getElementById('btnStopAlarmModal')?.addEventListener('click', stopTimer);
        document.getElementById('timerStopBtnHeader')?.addEventListener('click', stopTimer);
    }
};