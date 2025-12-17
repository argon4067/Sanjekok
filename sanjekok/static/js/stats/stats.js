// static/js/stats/stats.js
document.addEventListener("DOMContentLoaded", () => {
    const myInjuryBtn = document.getElementById("myInjuryBtn");
    const dropdown = document.getElementById("injuryDropdown");
    const periodButtons = document.querySelectorAll(".period-btn");
    const visualArea = document.getElementById("stats-visual-area");
    const accidentSummary = document.getElementById("accidentSummary");
    const fatalSummary = document.getElementById("fatalSummary");
    const genderSummary1 = document.getElementById("genderSummary1");
    const genderSummary2 = document.getElementById("genderSummary2");
    const injurySummary1 = document.getElementById("injurySummary1");
    const injurySummary2 = document.getElementById("injurySummary2");
    const diseaseSummary1 = document.getElementById("diseaseSummary1");
    const diseaseSummary2 = document.getElementById("diseaseSummary2");

    // 카드 요소들
    const cardInjury = document.getElementById("card-injury");
    const cardInjuryFatal = document.getElementById("card-injury-fatal");
    const cardDisease = document.getElementById("card-disease");
    const cardDiseaseFatal = document.getElementById("card-disease-fatal");

    const toggleRiskDetailsBtn = document.getElementById("toggleRiskDetailsBtn");
    const riskDetailsPanel = document.getElementById("riskDetailsPanel");

    if (toggleRiskDetailsBtn && riskDetailsPanel) {
        toggleRiskDetailsBtn.addEventListener("click", () => {
            const isOpen = riskDetailsPanel.style.display !== "none";
            riskDetailsPanel.style.display = isOpen ? "none" : "block";
            toggleRiskDetailsBtn.textContent = isOpen ? "상세 보기 ▼" : "상세 닫기 ▲";
        });
    }

    let injurySelected = false;
    let selectedInjuryType = null;
    let selectedDiseaseType = null;
    let injuryStatsByPeriod = null;
    let fatalStatsByPeriod = null;
    let diseaseStatsByPeriod = null;
    let diseaseFatalStatsByPeriod = null;
    const memberageband = visualArea ? (visualArea.dataset.ageBand || null) : null;

    if (visualArea) {
        const hasSelection = visualArea.dataset.hasSelection === "1";
        if (hasSelection) {
            injurySelected = true;
            if (visualArea.dataset.selectedInjury)
                selectedInjuryType = visualArea.dataset.selectedInjury;
            if (visualArea.dataset.selectedDisease)
                selectedDiseaseType = visualArea.dataset.selectedDisease;
        }
    }

    /* ========================= 
     * 0. 백엔드에서 넘긴 JSON 파싱
     * ========================= */
    if (visualArea && visualArea.dataset.summary6) {
        try {
            injuryStatsByPeriod = JSON.parse(visualArea.dataset.summary6);
        } catch (e) {
            console.error("summary6_JSON_파싱_실패:", e);
            injuryStatsByPeriod = null;
        }
    }

    if (visualArea && visualArea.dataset.summary7) {
        try {
            fatalStatsByPeriod = JSON.parse(visualArea.dataset.summary7);
        } catch (e) {
            console.error("summary7_JSON_파싱_실패:", e);
            fatalStatsByPeriod = null;
        }
    }

    if (visualArea && visualArea.dataset.summary8) {
        try {
            diseaseStatsByPeriod = JSON.parse(visualArea.dataset.summary8);
        } catch (e) {
            console.error("summary8_JSON_파싱_실패:", e);
            diseaseStatsByPeriod = null;
        }
    }

    if (visualArea && visualArea.dataset.summary9) {
        try {
            diseaseFatalStatsByPeriod = JSON.parse(visualArea.dataset.summary9);
        } catch (e) {
            console.error("summary9_JSON_파싱_실패:", e);
            diseaseFatalStatsByPeriod = null;
        }
    }

    let riskDataByPeriod = {};

    if (visualArea && visualArea.dataset.riskAnalysis) {
        try {
            riskDataByPeriod = JSON.parse(visualArea.dataset.riskAnalysis);
        } catch (e) {
            console.error("riskAnalysis JSON 파싱 실패:", e);
        }
    }

    /* ========================= 
     * 1. 나의 산재 드롭다운
     * ========================= */
    if (myInjuryBtn && dropdown) {
        myInjuryBtn.addEventListener("click", () => {
            dropdown.classList.toggle("hidden");
        });
    }

    // 산재 선택
    if (dropdown) {
        dropdown.querySelectorAll("li").forEach(item => {
            item.addEventListener("click", () => {
                const accidentId = item.dataset.accidentId;
                if (!accidentId) return;
                const url = new URL(window.location.href);
                url.searchParams.set("accident_id", accidentId);
                window.location.href = url.toString();
            });
        });
    }

    /* ========================= 
     * 2. 분석 기간 버튼 클릭
     * ========================= */
    periodButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const hasInjury = visualArea ? visualArea.dataset.hasInjury === "1" : false;

            // 1) 산재 정보 자체가 없는 경우
            if (!hasInjury) {
                alert("산재 정보가 없습니다. 마이페이지에서 산재 정보를 등록해주세요.");
                window.location.href = "/member/mypage/individual-list/";
                return;
            }

            // 2) 산재를 아직 선택 안 했으면 막기
            if (!injurySelected) {
                alert("먼저 '나의 산재'를 선택해주세요.");
                return;
            }

            // 3) 통계 영역 보이기
            if (visualArea) {
                visualArea.classList.remove("hidden");
            }

            // 4) 버튼 active 표시
            periodButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const yearFlag = btn.dataset.year;
            let periodKey = "최근 1년";
            if (yearFlag === "2") periodKey = "2년";
            else if (yearFlag === "3") periodKey = "3년";

            /* ---------- 기본 수치들 ---------- */
            const accCount = Number(btn.dataset.accCount || 0);
            const accRate = Number(btn.dataset.accRate || 0);
            const fatalCount = Number(btn.dataset.fatalCount || 0);
            const fatalRate = Number(btn.dataset.fatalRate || 0);
            const male = Number(btn.dataset.male || 0);
            const female = Number(btn.dataset.female || 0);
            const maleRate = Number(btn.dataset.maleRate || 0);
            const femaleRate = Number(btn.dataset.femaleRate || 0);
            const male2 = Number(btn.dataset.male2 || 0);
            const female2 = Number(btn.dataset.female2 || 0);
            const maleRate2 = Number(btn.dataset.maleRate2 || 0);
            const femaleRate2 = Number(btn.dataset.femaleRate2 || 0);
            const ageU18 = Number(btn.dataset.ageU18 || 0);
            const age20s = Number(btn.dataset.age20s || 0);
            const age30s = Number(btn.dataset.age30s || 0);
            const age40s = Number(btn.dataset.age40s || 0);
            const age50s = Number(btn.dataset.age50s || 0);
            const age60p = Number(btn.dataset.age60p || 0);
            const ageU18a = Number(btn.dataset.ageU18a || 0);
            const age20sa = Number(btn.dataset.age20sa || 0);
            const age30sa = Number(btn.dataset.age30sa || 0);
            const age40sa = Number(btn.dataset.age40sa || 0);
            const age50sa = Number(btn.dataset.age50sa || 0);
            const age60pa = Number(btn.dataset.age60pa || 0);

            /* ========================= 
             * 2-1. 상단 재해율 / 사망만인율 카드
             * ========================= */
            if (accidentSummary) {
                const rateText = isNaN(accRate) ? "-" : accRate.toFixed(2);
                accidentSummary.innerHTML = `<strong style="font-size:27px;color:#f99b18;">${rateText}%</strong>` +
                    `<span style="font-size:20px;color:#23333d;margin-left:6px;">
                     재해자수 ${accCount.toLocaleString()}명</span>`;
            }

            if (fatalSummary) {
                const rateText = isNaN(fatalRate) ? "-" : fatalRate.toFixed(2);
                fatalSummary.innerHTML = `<strong style="font-size:27px;color:#f99b18;">${rateText}‱ </strong>` +
                    `<span style="font-size:20px;color:#23333d;margin-left:6px;">
                     사망자수 ${fatalCount.toLocaleString()}명</span>`;
            }

            /* ========================= 
             * 2-2. 성별 도넛 차트
             * ========================= */
            if (genderSummary1) {
                const maleRateText = isNaN(maleRate) ? "-" : maleRate.toFixed(1);
                const femaleRateText = isNaN(femaleRate) ? "-" : femaleRate.toFixed(1);
                genderSummary1.innerHTML = `<p style="font-size:20px;color:#23333d;"> 남자: ${maleRateText}%</p> ` +
                    `<p style="font-size:20px;color:#23333d;"> 여자:  ${femaleRateText}% </p>`;
                if (window.GenderChart1) window.GenderChart1(male, female);
            }

            if (genderSummary2) {
                const maleRateText2 = isNaN(maleRate2) ? "-" : maleRate2.toFixed(1);
                const femaleRateText2 = isNaN(femaleRate2) ? "-" : femaleRate2.toFixed(1);
                genderSummary2.innerHTML = `<p style="font-size:20px;color:#23333d;"> 남자: ${maleRateText2}%</p> ` +
                    `<p style="font-size:20px;color:#23333d;"> 여자:  ${femaleRateText2}% </p>`;
                if (window.GenderChart2) window.GenderChart2(male2, female2);
            }

            /* ========================= 
             * 2-3. 연령대별 현황 + 차트
             * ========================= */
            if (window.AgeChart1)
                window.AgeChart1(ageU18, age20s, age30s, age40s, age50s, age60p, memberageband);
            if (window.AgeChart2)
                window.AgeChart2(ageU18a, age20sa, age30sa, age40sa, age50sa, age60pa, memberageband);

            /* =========================
            * 종합 위험도 평가
            * ========================= */
            const riskData = riskDataByPeriod[yearFlag];
            const riskGrid = document.getElementById("riskGrid");
            const riskNoData = document.getElementById("riskNoData");
            const riskScoreWrap = document.getElementById("riskScoreWrap");
            const riskScoreNumber = document.getElementById("riskScoreNumber");
            const riskLevelText = document.getElementById("riskLevelText");
            const riskMessageText = document.getElementById("riskMessageText");
            const breakdownBase = document.getElementById("breakdownBase");
            const breakdownPersonal = document.getElementById("breakdownPersonal");
            const breakdownSeverity = document.getElementById("breakdownSeverity");
            const detailAccidentRate = document.getElementById("detailAccidentRate");
            const detailDeathRate = document.getElementById("detailDeathRate");
            const detailSeverityRatio = document.getElementById("detailSeverityRatio");
            const detailGenderFactor = document.getElementById("detailGenderFactor");
            const detailAgeFactor = document.getElementById("detailAgeFactor");

            const toggleBtn = document.getElementById("toggleRiskDetailsBtn");
            const detailsPanel = document.getElementById("riskDetailsPanel");
            if (detailsPanel) detailsPanel.style.display = "none";
            if (toggleBtn) toggleBtn.textContent = "상세 지표 보기 ▼";
            if (riskScoreWrap) riskScoreWrap.style.display = "block";

            const conditionEl = document.getElementById("riskConditionText");

            if (!riskData) {
                if (conditionEl) conditionEl.textContent = "충분한 통계 데이터가 없습니다.";
                if (riskScoreNumber) riskScoreNumber.textContent = "0";
                if (riskLevelText) riskLevelText.textContent = "데이터 없음";
                if (riskMessageText) riskMessageText.textContent = `최근 ${yearFlag}년 분석`;
                if (breakdownBase) breakdownBase.textContent = "0점";
                if (breakdownPersonal) breakdownPersonal.textContent = "0점";
                if (breakdownSeverity) breakdownSeverity.textContent = "0점";
                if (riskGrid) riskGrid.style.display = "none";
                if (riskNoData) riskNoData.style.display = "block";
            } else {
                if (conditionEl)
                    conditionEl.textContent = riskData.message || "충분한 통계 데이터가 없습니다.";
                const totalScore = (riskData.total_score ?? 0);
                if (riskScoreNumber) riskScoreNumber.textContent = totalScore;
                if (riskLevelText) riskLevelText.textContent = (riskData.risk_level ?? "-");
                const base = riskData.breakdown?.base_score ?? 0;
                const personal = riskData.breakdown?.personal_score ?? 0;
                const severity = riskData.breakdown?.severity_score ?? 0;
                if (breakdownBase) breakdownBase.textContent = `${base}점`;
                if (breakdownPersonal) breakdownPersonal.textContent = `${personal}점`;
                if (breakdownSeverity) breakdownSeverity.textContent = `${severity}점`;

                const accRate = riskData.details?.accident_rate ?? 0;
                const deathRate = riskData.details?.death_rate ?? 0;
                const sevRatio = riskData.details?.severity_ratio ?? 0;
                const genderFactor = riskData.details?.gender_factor ?? 0;
                const ageFactor = riskData.details?.age_factor ?? 0;

                if (detailAccidentRate) detailAccidentRate.textContent = accRate;
                if (detailDeathRate) detailDeathRate.textContent = deathRate;
                if (detailSeverityRatio) detailSeverityRatio.textContent = `${sevRatio}%`;
                if (detailGenderFactor) detailGenderFactor.textContent = `${genderFactor}%`;
                if (detailAgeFactor) detailAgeFactor.textContent = `${ageFactor}%`;

                if (riskData.has_data) {
                    if (riskGrid) riskGrid.style.display = "grid";
                    if (riskNoData) riskNoData.style.display = "none";

                    const renderRiskList = (id, list) => {
                        const c = document.getElementById(id);
                        if (!c) return;
                        c.innerHTML = (list || []).map(item => `
                            <div class="risk-item">
                                <span class="risk-rank rank-${item.rank}">${item.rank}</span>
                                <span class="risk-name">${item.name}</span>
                                <span class="risk-percentage">${item.percentage}%</span>
                            </div>`).join("");
                    };
                    renderRiskList("injuryRiskList", riskData.injury_top5);
                    renderRiskList("diseaseRiskList", riskData.disease_top5);
                    if (document.getElementById("riskAccidentPie")) window.RiskAccidentPieChart?.(riskData.injury_top5);
                    if (document.getElementById("riskDiseasePie")) window.RiskDiseasePieChart?.(riskData.disease_top5);
                } else {
                    if (riskGrid) riskGrid.style.display = "none";
                    if (riskNoData) riskNoData.style.display = "block";
                    const a = document.getElementById("injuryRiskList");
                    const b = document.getElementById("diseaseRiskList");
                    if (a) a.innerHTML = "";
                    if (b) b.innerHTML = "";
                }
            }

            /* =========================
             * KPI 요약 카드 업데이트 
             * ========================= */
            if (riskData) {
                const accidentRate = riskData.details?.accident_rate ?? "-";
                const accidentRateEl = document.getElementById("kpi-accident-rate");
                if (accidentRateEl)
                    accidentRateEl.textContent = isNaN(accidentRate) ? "-" : `${accidentRate.toFixed(2)}%`;

                const diseaseTop = riskData.disease_top5?.[0]?.name || "-";
                const diseaseTopEl = document.getElementById("kpi-disease-top");
                if (diseaseTopEl) diseaseTopEl.textContent = diseaseTop;

                const injuryTop = riskData.injury_top5?.[0]?.name || "-";
                const injuryTopEl = document.getElementById("kpi-injury-top");
                if (injuryTopEl) injuryTopEl.textContent = injuryTop;

                const totalScore = riskData.total_score ?? "-";
                const riskLevel = riskData.risk_level ?? "-";
                const color = riskData.color ?? "#999";
                const scoreEl = document.getElementById("kpi-risk-score");
                if (scoreEl) {
                    scoreEl.textContent = `${totalScore}점`;
                    scoreEl.style.color = color;
                }
                const riskCard = scoreEl ? scoreEl.closest(".kpi-card") : null;
                if (riskCard) {
                    let subEl = riskCard.querySelector(".kpi-sub");
                    if (!subEl) {
                        subEl = document.createElement("span");
                        subEl.className = "kpi-sub";
                        riskCard.appendChild(subEl);
                    }
                    subEl.textContent = riskLevel;
                    subEl.style.color = color;
                }
            } else {
                const reset = (id, text = "-") => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = text;
                };
                reset("kpi-accident-rate");
                reset("kpi-disease-top");
                reset("kpi-injury-top");
                reset("kpi-risk-score");
            }
        });
    });



    // 페이지 로드 시 산재가 선택되어 있으면 자동으로 1년 버튼 클릭
    if (visualArea && visualArea.dataset.hasSelection === "1") {
        const defaultBtn = document.querySelector('.period-btn[data-year="1"]');
        defaultBtn?.click();
    }
});
