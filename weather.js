// weather.js — Atlantik-Wetter via Open-Meteo (extrahiert aus game.js, Sprint 25 #11)
// Kein State, kein Import — setzt DOM und window.triggerWeather() wenn vorhanden.

window.fetchAtlantikWetter = function () {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=29&longitude=-31&current=temperature_2m,rain,cloud_cover,wind_speed_10m')
        .then(r => r.json())
        .then(data => {
            const c = data.current;
            const cloud = c.cloud_cover || 0;
            const rain  = c.rain || 0;
            const wind  = c.wind_speed_10m || 0;

            if (rain > 0.5) {
                if (typeof window.triggerWeather === 'function') window.triggerWeather('rain');
            } else if (cloud > 70) {
                const wrapper = document.querySelector('#canvas-wrapper');
                if (wrapper) wrapper.style.filter = 'brightness(0.85)';
            }

            const statsContent = document.getElementById('stats-content');
            if (statsContent) {
                const icon = rain > 0.5 ? '🌧️' : cloud > 70 ? '⛅' : wind > 40 ? '💨' : '☀️';
                const tempEl = document.createElement('p');
                tempEl.innerHTML = `${icon} ${Math.round(c.temperature_2m)}°C auf der Insel`;
                tempEl.style.cssText = 'font-size:11px; opacity:0.7; text-align:center;';
                statsContent.parentElement.insertBefore(tempEl, statsContent);
            }
        })
        .catch(() => {}); // Wetter ist optional
};
