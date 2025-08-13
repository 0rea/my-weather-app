const API_KEY = "5c208bba2b37e80b233a6a8e38ff091f";
const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const weatherInfoContainer = document.querySelector('#weather-info-container');

async function getWeather(city) {
    try {
        // ดึงข้อมูลสภาพอากาศปัจจุบัน
        const resCurrent = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=th`);
        if (!resCurrent.ok) throw new Error("ไม่พบข้อมูลเมืองนี้");

        const currentData = await resCurrent.json();

        // ดึงข้อมูลพยากรณ์ 5 วัน (3 ชั่วโมง/ครั้ง)
        const resForecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=th`);
        if (!resForecast.ok) throw new Error("ไม่สามารถโหลดข้อมูลพยากรณ์");

        const forecastData = await resForecast.json();

        // แสดงข้อมูลปัจจุบัน และพยากรณ์ 5 วัน
        displayWeather(currentData);
        displayForecast5Days(forecastData);
    } catch (err) {
        weatherInfoContainer.innerHTML = `<p class="error">${err.message}</p>`;
    }
}

function displayWeather(data) {
    const { name, main, weather } = data;
    const { temp, humidity } = main;
    const { description, icon } = weather[0];

    const weatherHtml = `
        <h2>${name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" class="weather-icon" />
        <p class="temp">${temp.toFixed(1)}°C</p>
        <p>${description}</p>
        <p>ความชื้น: ${humidity}%</p>
    `;

    // แสดงข้อมูลปัจจุบันก่อนข้อมูลพยากรณ์
    weatherInfoContainer.innerHTML = weatherHtml;
}

function displayForecast5Days(data) {
    // สรุปข้อมูลพยากรณ์รายวันจากข้อมูล 3 ชั่วโมง
    const days = {};

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString("th-TH");
        if (!days[date]) {
            days[date] = {
                temp_max: item.main.temp_max,
                temp_min: item.main.temp_min,
                weather: item.weather[0]
            };
        } else {
            days[date].temp_max = Math.max(days[date].temp_max, item.main.temp_max);
            days[date].temp_min = Math.min(days[date].temp_min, item.main.temp_min);
        }
    });

    let forecastHtml = '<div class="forecast-container">';
    let count = 0;
    for (const [date, info] of Object.entries(days)) {
        if (count >= 5) break; // แสดงแค่ 5 วัน
        const icon = `https://openweathermap.org/img/wn/${info.weather.icon}@2x.png`;
        forecastHtml += `
            <div class="weather-card">
                <h3>${count === 0 ? "วันนี้" : date}</h3>
                <img src="${icon}" alt="${info.weather.description}" class="weather-icon" />
                <p class="temp">สูง: ${Math.round(info.temp_max)}°C</p>
                <p class="temp">ต่ำ: ${Math.round(info.temp_min)}°C</p>
                <p>${info.weather.description}</p>
            </div>
        `;
        count++;
    }
    forecastHtml += '</div>';

    // เพิ่มข้อมูลพยากรณ์ต่อท้ายข้อมูลปัจจุบัน
    weatherInfoContainer.innerHTML += forecastHtml;
}

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) getWeather(city);
});

// โหลดสภาพอากาศลำปางตอนเปิดเว็บ
window.addEventListener("load", () => {
    getWeather("Lampang");
});
