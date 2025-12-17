document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById('memberChart');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: DAYS,
            datasets: [
                {
                    label: '오늘 신규 가입자 수',
                    data: COUNTS,
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '일별 신규가입',
                    font: { size: 20 }
                },
                legend: { display: true }
            },
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });
});