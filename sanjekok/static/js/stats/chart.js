// chart.js

let genderChart1 = null;
let genderChart2 = null;
let ageChart1 = null;
let ageChart2 = null;
let injuryChart1 = null;
let injuryChart2 = null;
let diseaseChart1 = null;
let diseaseChart2 = null;

/* --------------------------
 *  성별 도넛 차트
 * --------------------------*/

function GenderChart1(male, female) {
    const ctx = document.getElementById("genderChart1");
    if (!ctx) return;

    const data = [male, female];

    if (genderChart1) {
        genderChart1.data.datasets[0].data = data;
        genderChart1.update();
        return;
    }

    genderChart1 = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["남자", "여자"],
            datasets: [{
                data: data,
                backgroundColor: ["#4F46E5", "#F97316"],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,   // ★ 추가
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

function GenderChart2(maleFatal, femaleFatal) {
    const ctx = document.getElementById("genderChart2");
    if (!ctx) return;

    const data = [maleFatal, femaleFatal];

    if (genderChart2) {
        genderChart2.data.datasets[0].data = data;
        genderChart2.update();
        return;
    }

    genderChart2 = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["남자 사망", "여자 사망"],
            datasets: [{
                data: data,
                backgroundColor: ["#EF4444", "#FACC15"],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,   // ★ 추가
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}
/* --------------------------
 *  연령대별 바 차트
 * --------------------------*/

function AgeChart1(ageU18, age20s, age30s, age40s, age50s, age60p) {
    const ctx = document.getElementById("ageChart1");
    if (!ctx) return;

    const labels = ["18세 미만", "20대", "30대", "40대", "50대", "60대 이상"];
    const data = [ageU18, age20s, age30s, age40s, age50s, age60p];

    if (ageChart1) {
        ageChart1.data.labels = labels;
        ageChart1.data.datasets[0].data = data;
        ageChart1.update();
        return;
    }

    ageChart1 = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "연령대별 재해자 수",
                data: data,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            }
        }
    });
}

function AgeChart2(ageU18a, age20sa, age30sa, age40sa, age50sa, age60pa) {
    const ctx = document.getElementById("ageChart2");
    if (!ctx) return;

    const labels = ["18세 미만", "20대", "30대", "40대", "50대", "60대 이상"];
    const data = [ageU18a, age20sa, age30sa, age40sa, age50sa, age60pa];

    if (ageChart2) {
        ageChart2.data.labels = labels;
        ageChart2.data.datasets[0].data = data;
        ageChart2.update();
        return;
    }

    ageChart2 = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "연령대별 사망자 수",
                data: data,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            }
        }
    });
}

/* --------------------------
 *  발생형태 / 질병형태 바 차트
 *  topList: [{ rank, name, count }, ...]
 * --------------------------*/

function InjuryChart1(topList) {
    const ctx = document.getElementById("injuryChart1");
    if (!ctx) return;

    if (!topList || !topList.length) {
        if (injuryChart1) {
            injuryChart1.destroy();
            injuryChart1 = null;
        }
        return;
    }

    const labels = topList.map(item => item.name);
    const data = topList.map(item => item.count || 0);

    if (injuryChart1) {
        injuryChart1.data.labels = labels;
        injuryChart1.data.datasets[0].data = data;
        injuryChart1.update();
        return;
    }

    injuryChart1 = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "재해자 수",
                data: data,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            }
        }
    });
}

function InjuryChart2(topList) {
    const ctx = document.getElementById("injuryChart2");
    if (!ctx) return;

    if (!topList || !topList.length) {
        if (injuryChart2) {
            injuryChart2.destroy();
            injuryChart2 = null;
        }
        return;
    }

    const labels = topList.map(item => item.name);
    const data = topList.map(item => item.count || 0);

    if (injuryChart2) {
        injuryChart2.data.labels = labels;
        injuryChart2.data.datasets[0].data = data;
        injuryChart2.update();
        return;
    }

    injuryChart2 = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "사망자 수",
                data: data,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            }
        }
    });
}

function DiseaseChart1(topList) {
    const ctx = document.getElementById("diseaseChart1");
    if (!ctx) return;

    if (!topList || !topList.length) {
        if (diseaseChart1) {
            diseaseChart1.destroy();
            diseaseChart1 = null;
        }
        return;
    }

    const labels = topList.map(item => item.name);
    const data = topList.map(item => item.count || 0);

    if (diseaseChart1) {
        diseaseChart1.data.labels = labels;
        diseaseChart1.data.datasets[0].data = data;
        diseaseChart1.update();
        return;
    }

    diseaseChart1 = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "재해자 수",
                data: data,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            }
        }
    });
}

function DiseaseChart2(topList) {
    const ctx = document.getElementById("diseaseChart2");
    if (!ctx) return;

    if (!topList || !topList.length) {
        if (diseaseChart2) {
            diseaseChart2.destroy();
            diseaseChart2 = null;
        }
        return;
    }

    const labels = topList.map(item => item.name);
    const data = topList.map(item => item.count || 0);

    if (diseaseChart2) {
        diseaseChart2.data.labels = labels;
        diseaseChart2.data.datasets[0].data = data;
        diseaseChart2.update();
        return;
    }

    diseaseChart2 = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "사망자 수",
                data: data,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            }
        }
    });
}

// 다른 JS 파일에서도 쓸 수 있게 전역에 붙이기
window.GenderChart1 = GenderChart1;
window.GenderChart2 = GenderChart2;
window.AgeChart1 = AgeChart1;
window.AgeChart2 = AgeChart2;
window.InjuryChart1 = InjuryChart1;
window.InjuryChart2 = InjuryChart2;
window.DiseaseChart1 = DiseaseChart1;
window.DiseaseChart2 = DiseaseChart2;
