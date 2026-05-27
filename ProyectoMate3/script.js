document.addEventListener("DOMContentLoaded", () => {
    // Registrando ejes lineales si Chart.js lo requiere
    let isExpertMode = false;
    const expertToggle = document.getElementById("expert-toggle");

    const renderMath = (id, str, display = false) => {
        katex.render(str, document.getElementById(id), { throwOnError: false, displayMode: display });
    };

    // --- NATIVE CHARTJS PLUGIN ---
    const dynamicExtremaPlugin = {
        id: 'dynamicExtrema',
        afterDatasetsDraw(chart) {
            const ctx = chart.ctx;
            if(!chart.options.extremaStatus) return;
            const status = chart.options.extremaStatus;
            
            const pIndex = chart.data.datasets.findIndex(d => d.label === 'Puntero');
            if(pIndex === -1) return;
            const meta = chart.getDatasetMeta(pIndex);
            if(!meta || !meta.data.length || meta.hidden) return;
            
            const pt = meta.data[0];
            if(!pt) return;

            const isMax = status.includes("MÁX");
            const bg = isMax ? "#10b981" : "#3b82f6";
            
            ctx.save();
            ctx.font = "bold 12px 'Inter', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            const w = ctx.measureText(status).width + 20;
            const h = 26;
            const x = pt.x;
            const yOffset = isMax ? -35 : 35; 
            const y = pt.y + yOffset;
            
            ctx.fillStyle = bg;
            ctx.beginPath();
            ctx.roundRect(x - w/2, y - h/2, w, h, 13);
            ctx.fill();
            
            ctx.beginPath();
            if(isMax) {
                ctx.moveTo(x - 6, y + h/2); ctx.lineTo(x + 6, y + h/2); ctx.lineTo(x, y + h/2 + 8);
            } else {
                ctx.moveTo(x - 6, y - h/2); ctx.lineTo(x + 6, y - h/2); ctx.lineTo(x, y - h/2 - 8);
            }
            ctx.fill();
            
            ctx.fillStyle = "#ffffff";
            ctx.fillText(status, x, y);
            ctx.restore();
        }
    };
    
    // --- CLASSIC TEXTBOOK GRAPH STYLING PLUGIN ---
    const classicMathPlugin = {
        id: 'classicMathGuides',
        beforeDatasetsDraw(chart) {
            const ctx = chart.ctx;
            const pIndex = chart.data.datasets.findIndex(d => d.label === 'Puntero');
            if(pIndex === -1) return;
            const meta = chart.getDatasetMeta(pIndex);
            if(!meta || !meta.data.length || meta.hidden) return;
            
            const pt = meta.data[0];
            const xAxis = chart.scales.x;
            const yAxis = chart.scales.y;
            
            // Draw Dashed Guides to Axes
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "rgba(0,0,0,0.5)";
            ctx.lineWidth = 1;
            // To X axis
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt.x, yAxis.bottom);
            // To Y axis
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(xAxis.left, pt.y);
            ctx.stroke();
            
            // "a" label on X axis
            ctx.font = "italic 12px 'Times New Roman', serif";
            ctx.fillStyle = "#000";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText("a", pt.x, yAxis.bottom + 5);
            
            // Creciente / Decreciente texts (Static on the sides)
            /* Optional aesthetic: Add classic texts */
            ctx.restore();
        }
    };
    Chart.register(dynamicExtremaPlugin, classicMathPlugin);

    const createGradient = (ctx, h, colorStr) => {
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, colorStr.replace('1.0)', '0.6)'));
        bg.addColorStop(1, colorStr.replace('1.0)', '0.05)'));
        return bg;
    };

    const buildChart = (ctx, xTitle, yTitle, cColor, yMin=0, isExpert=false) => {
        const gridColor = isExpert ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)";
        const axisColor = isExpert ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.5)";
        const fontFam = "'Inter', sans-serif";

        return new Chart(ctx, {
            type: 'line',
            data: { datasets: [
                { label: 'Base', data: [], borderColor: '#ef4444', borderWidth: 3, fill: false, pointRadius: 0, tension: 0.4 },
                { label: 'Puntero', data: [], backgroundColor: '#000000', borderColor: '#ffffff', borderWidth: 2, pointHoverRadius: 8, pointRadius: 6, type: 'scatter', z: 3},
                { label: 'Tangente (m)', data: [], borderColor: '#fbbf24', borderWidth: 2, borderDash: [5, 5], pointRadius: 0, tension: 0, type: 'line', z: 4}
            ]},
            options: {
                animation: {duration: 0}, responsive: true, maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'nearest' },
                plugins: { 
                    legend: { display: false }, 
                    tooltip: { filter: (t) => t.datasetIndex === 1 } 
                },
                scales: { 
                    x: { type: 'linear', title: {display: true, text: xTitle, color: axisColor, font: {family: fontFam, weight: 'bold'}}, grid: { color: gridColor }, ticks: { color: axisColor } }, 
                    y: { type: 'linear', title: {display: true, text: yTitle, color: axisColor, font: {family: fontFam, weight: 'bold'}}, min: yMin, grid: { color: gridColor }, ticks: { color: axisColor } } 
                }
            }
        });
    };

    const getTangent = (x0, y0, m, span) => [{x: x0-span, y: m*(x0-span - x0)+y0}, {x: x0+span, y: m*(x0+span - x0)+y0}];

    // ===================================
    // LAB 1: CORRAL (Student)
    // ===================================
    let L1 = 100, isChallenge1 = false;
    const s1 = document.getElementById("slider1"), i1 = document.getElementById("input-cerca1");
    const ctx1 = document.getElementById('chart1').getContext('2d');
    const chart1 = buildChart(ctx1, 'Ancho x (m)', 'Área (m²)', 'rgb(249, 115, 22)'); // Orange 500

    function runLab1() {
        L1 = parseFloat(i1.value) || 100;
        const lim = L1/2; // up to exactly L1/2
        s1.max = lim;
        
        const dLine = [];
        for(let tx=0; tx<=lim; tx+=lim/50) { dLine.push({x: tx, y: tx*(L1 - 2*tx)}); }
        
        const x = parseFloat(s1.value);
        const area = x*(L1 - 2*x);

        chart1.data.datasets[0].data = dLine;
        document.getElementById("val-x").textContent = x.toFixed(1);
        chart1.data.datasets[1].data = [{x:x, y:area}];

        // Tangent
        const m = L1 - 4*x;
        chart1.data.datasets[2].data = getTangent(x, area, m, L1/15);
        chart1.options.extremaStatus = Math.abs(x - L1/4) < 0.2 ? "MÁXIMO (A'(x)=0)" : (x <= 0.2 || x >= lim-0.2 ? "MÍNIMO" : "");
        chart1.update();

        // Dynamic Info Box math
        const optX = L1/4; const optY = optX*(L1 - 2*optX);
        renderMath('ktx-info-box-1-max', `A_{\\text{max}}: ${optY} \\text{ m}^2 \\text{ en } x: ${optX} \\text{ m}`);
        renderMath('ktx-info-box-1-min', `A_{\\text{min}}: \\approx 0 \\text{ m}^2 \\text{ en } x \\rightarrow \\{0, ${L1/2}\\}`);

        // Visual Layout
        const l = L1 - 2*x;
        const box = document.getElementById("corral-drawing");
        box.style.width = `${Math.max(5, (l/L1)*100)}%`;
        box.style.height = `${Math.max(5, (x/(L1/2))*80)}%`;
        document.getElementById("label-length").textContent = `${l.toFixed(1)}m`;
        document.getElementById("label-area").textContent = `${area.toFixed(1)} m²`;

        renderMath('ktx-l1-1', `A(x) = x(${L1} - 2x) = ${L1}x - 2x^2`);
        renderMath('ktx-l1-2', `A'(x) = ${L1} - 4x`);
        renderMath('ktx-l1-3', `${L1} - 4x = 0 \\implies x_{\\text{op}} = ${L1/4} \\text{ m}`);
        renderMath('ktx-l1-expert1', `\\begin{aligned} D_A &= [0, ${L1/2}] \\\\ A''(x) &= -4 < 0 \\implies \\text{Máximo Relativo} \\end{aligned}`, true);
    }
    i1.addEventListener("input", runLab1); s1.addEventListener("input", runLab1);

    // ===================================
    // LAB 2: LATA (Student)
    // ===================================
    let A2 = 300;
    const s2 = document.getElementById("slider2"), i2 = document.getElementById("input-area2");
    const ctx2 = document.getElementById('chart2').getContext('2d');
    const chart2 = buildChart(ctx2, 'Radio r (cm)', 'Volumen (cm³)', 'rgb(99, 102, 241)'); // Indigo 500

    function runLab2() {
        A2 = parseFloat(i2.value) || 300;
        const lim = Math.sqrt(A2 / (2*Math.PI));
        s2.max = (lim - 0.1).toFixed(1);

        const dLine = [];
        for(let tr=0; tr<=lim; tr+=lim/50) { dLine.push({x: tr, y: Math.max(0, (A2/2)*tr - Math.PI*tr*tr*tr)}); }
        
        const r = parseFloat(s2.value);
        const vol = (A2/2)*r - Math.PI*Math.pow(r, 3);
        
        chart2.data.datasets[0].data = dLine;
        document.getElementById("val-r").textContent = r.toFixed(2);
        chart2.data.datasets[1].data = [{x:r, y:Math.max(0, vol)}];

        // Tangent
        const m = (A2/2) - 3*Math.PI*r*r;
        chart2.data.datasets[2].data = getTangent(r, Math.max(0,vol), m, 1);
        
        const optR = Math.sqrt(A2/(6*Math.PI));
        chart2.options.extremaStatus = Math.abs(r - optR) < 0.1 ? "MÁXIMO (V'(r)=0)" : (r <= 1.1 || r >= lim-0.1 ? "MÍNIMO" : "");
        chart2.update();

        const optY = (A2/2)*optR - Math.PI*Math.pow(optR, 3);
        renderMath('ktx-info-box-2-max', `V_{\\text{max}}: ${optY.toFixed(2)} \\text{ cm}^3 \\text{ en } r: ${optR.toFixed(2)}`);
        renderMath('ktx-info-box-2-min', `V_{\\text{min}}: 0 \\text{ en limites}`);

        // Visual
        let h = (A2 - 2*Math.PI*r*r)/(2*Math.PI*r);
        const box = document.getElementById("cylinder-drawing");
        box.style.width = `${Math.max(20, (r/Math.sqrt(A2/(2*Math.PI)))*120)}px`;
        box.style.height = `${Math.max(20, (h/(A2/(2*Math.PI)))*180)}px`;
        document.getElementById("label-height").textContent = `h=${Math.max(0,h).toFixed(1)}cm`;
        document.getElementById("label-radius").textContent = `${r.toFixed(1)}cm`;
        document.getElementById("label-vol").textContent = `${Math.max(0,vol).toFixed(1)} cm³`;

        renderMath('ktx-l2-1', `h = \\frac{${A2} - 2\\pi r^2}{2\\pi r}`);
        renderMath('ktx-l2-2', `V(r) = \\frac{${A2}}{2}r - \\pi r^3`);
        renderMath('ktx-l2-3', `V'(r) = \\frac{${A2}}{2} - 3\\pi r^2 = 0 \\implies r \\approx ${(Math.sqrt(A2/(6*Math.PI))).toFixed(2)} \\text{ cm}`);
        renderMath('ktx-l2-expert1', `\\begin{aligned} D_V &= \\left(0, \\sqrt{\\frac{${A2}}{2\\pi}}\\right) \\\\ V''(r) &= -6\\pi r < 0 \\implies \\text{Máximo Relativo} \\end{aligned}`, true);
    }
    i2.addEventListener("input", runLab2); s2.addEventListener("input", runLab2);


    // ===================================
    // LAB 3: SANDBOX
    // ===================================
    const sA = document.getElementById("slider-a"), sB = document.getElementById("slider-b"), sC = document.getElementById("slider-c");
    const chart3 = new Chart(document.getElementById("chart3").getContext("2d"), {
        type: 'line', data: { datasets: [] }, options: { animation: {duration: 0}, plugins: { legend: { display: false }, tooltip: { filter: (t) => t.datasetIndex === 1 } }, scales: { x: { type: 'linear', min: -10, max: 10 }, y: { type: 'linear', min: -50, max: 50 } } }
    });

    function runLab3() {
        const a = parseFloat(sA.value), b = parseFloat(sB.value), c = parseFloat(sC.value);
        document.getElementById("val-a").textContent = a; document.getElementById("val-b").textContent = b; document.getElementById("val-c").textContent = c;
        renderMath('ktx-sandbox-func', `f(x) = ${a!=0 ? a+'x^2' : ''} ${b!=0 ? (b>0?'+'+b:b)+'x' : ''} ${c!=0 ? (c>0?'+'+c:c) : ''}`);
        renderMath('ktx-sandbox-deriv', `f''(x) = ${2*a}`);

        const box = document.getElementById("sandbox-info");
        if (a < 0) { box.className = "p-4 rounded-lg flex items-start gap-4 bg-green-50 text-green-900 border border-green-200"; document.getElementById("sandbox-title").textContent = "Punto MÁXIMO en el Vértice"; }
        else if (a > 0) { box.className = "p-4 rounded-lg flex items-start gap-4 bg-blue-50 text-blue-900 border border-blue-200"; document.getElementById("sandbox-title").textContent = "Punto MÍNIMO en el Vértice"; }
        else { box.className = "p-4 rounded-lg flex items-start gap-4 bg-gray-100 text-gray-800 border border-gray-300"; document.getElementById("sandbox-title").textContent = "Sin Vértice (Línea Recta)"; }

        const dLine = [];
        for(let tx=-10; tx<=10; tx+=0.5) { dLine.push({x: tx, y: a*tx*tx + b*tx + c}); }

        chart3.data.datasets = [
            { data: dLine, borderColor: '#ef4444', borderWidth: 3, pointRadius: 0, type: 'line', tension: 0.4, fill: false },
            { label: 'Puntero', data: a !== 0 ? [{ x: -b/(2*a), y: a*Math.pow(-b/(2*a),2) + b*(-b/(2*a)) + c }] : [], backgroundColor: '#000000', borderColor: '#ffffff', borderWidth: 2, pointRadius: 6, type: 'scatter' }
        ];
        chart3.options.extremaStatus = a < 0 ? "MÁXIMO" : (a > 0 ? "MÍNIMO" : "");
        chart3.update();
    }
    sA.addEventListener("input", runLab3); sB.addEventListener("input", runLab3); sC.addEventListener("input", runLab3);


    // ===================================
    // EXPERT LAB 1: PIPELINE
    // ===================================
    const Cw = 4, Cl = 2, W1e = 5;
    const sE1 = document.getElementById("sliderE1");
    const ctxE1 = document.getElementById('chartE1').getContext('2d');
    const chartE1 = buildChart(ctxE1, 'Conexión x (km)', 'Costo ($k)', 'rgb(56, 189, 248)', 25, true);

    function runLabE1() {
        const L = 10;
        const dLine = [];
        for(let tx=0; tx<=L; tx+=L/50) { dLine.push({x: tx, y: Cw*Math.sqrt(W1e*W1e + tx*tx) + Cl*(L - tx)}); }
        
        const x = parseFloat(sE1.value);
        const cost = Cw*Math.sqrt(W1e*W1e + x*x) + Cl*(L - x);
        
        chartE1.data.datasets[0].data = dLine;
        document.getElementById("val-xE").textContent = x.toFixed(2);
        chartE1.data.datasets[1].data = [{x:x, y:cost}];

        const m = (Cw * x)/Math.sqrt(W1e*W1e + x*x) - Cl;
        chartE1.data.datasets[2].data = getTangent(x, cost, m, 1); 
        
        const optX = 2.887; // Mathematical analytical min
        chartE1.options.extremaStatus = Math.abs(x - optX) < 0.1 ? "MÍNIMO" : (x <= 0.1 || x >= L-0.1 ? "MÁXIMO" : "");
        chartE1.update();

        const optCost = Cw*Math.sqrt(W1e*W1e + optX*optX) + Cl*(L - optX);
        renderMath('ktx-info-box-e1-min', `C_{\\text{min}}: ${optCost.toFixed(2)} \\text{ }\\$k \\text{ en } x: ${optX.toFixed(2)}`);

        Plotly.react('map-E1', [
            { x: [0, 0, L], y: [W1e, 0, 0], mode: 'lines', line: {color:'rgba(255,255,255,0.4)', width:2}, name: 'Costa' },
            { x: [0, x], y: [W1e, 0], mode: 'lines+markers', line: {color:'#38bdf8', width:4}, marker:{size:8, color:'#e0f2fe'}, name: 'Agua' },
            { x: [x, L], y: [0, 0], mode: 'lines+markers', line: {color:'#d97706', width:4}, marker:{size:8, color:'#fef3c7'}, name: 'Tierra'}
        ], { 
            paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: {color: '#cbd5e1'},
            margin:{l:30,r:30,t:10,b:30}, yaxis:{range:[-1, W1e+1], gridcolor: 'rgba(255,255,255,0.1)'}, 
            xaxis:{range:[-1, L+1], gridcolor: 'rgba(255,255,255,0.1)'}, showlegend:false 
        }, {displayModeBar:false});

        renderMath('ktx-E1', `\\begin{aligned} C(x) &= ${Cw}\\sqrt{${W1e}^2 + x^2} + ${Cl}(${L} - x) \\\\ C'(x) &= \\frac{${Cw}x}{\\sqrt{25 + x^2}} - ${Cl} = 0 \\implies x = 2.887 \\text{ km} \\end{aligned}`, true);
    }
    sE1.addEventListener("input", runLabE1);


    // ===================================
    // EXPERT LAB 2: TRAPEZOID
    // ===================================
    const baseTrap = 10, sideTrap = 10;
    const sE2 = document.getElementById("sliderE2");
    const ctxE2 = document.getElementById('chartE2').getContext('2d');
    const chartE2 = buildChart(ctxE2, 'Ángulo theta (°)', 'Área (cm²)', 'rgb(56, 189, 248)', 0, true);

    function runLabE2() {
        const dLine=[];
        for(let t=0; t<=90; t+=90/50) { 
            let rad = t*Math.PI/180;
            dLine.push({x: t, y: sideTrap * Math.sin(rad) * (baseTrap + sideTrap * Math.cos(rad))});
        }

        const t_deg = parseFloat(sE2.value);
        const t_rad = t_deg*Math.PI/180;
        const area = sideTrap * Math.sin(t_rad) * (baseTrap + sideTrap * Math.cos(t_rad));

        chartE2.data.datasets[0].data = dLine;
        document.getElementById("val-tE").textContent = t_deg.toFixed(0);
        chartE2.data.datasets[1].data = [{x:t_deg, y:area}];

        const m_rad = sideTrap*(baseTrap*Math.cos(t_rad) + sideTrap*(Math.pow(Math.cos(t_rad),2) - Math.pow(Math.sin(t_rad),2)));
        const m_deg = m_rad * (Math.PI/180);
        chartE2.data.datasets[2].data = getTangent(t_deg, area, m_deg, 5);
        
        const optT = 60;
        chartE2.options.extremaStatus = Math.abs(t_deg - optT) <= 1 ? "MÁXIMO" : (t_deg <= 1 || t_deg >= 89 ? "MÍNIMO" : "");
        chartE2.update();

        const optRad = optT*Math.PI/180;
        const optArea = sideTrap * Math.sin(optRad) * (baseTrap + sideTrap * Math.cos(optRad));
        renderMath('ktx-info-box-e2-max', `A_{\\text{max}}: ${optArea.toFixed(2)} \\text{ cm}^2 \\text{ en } \\theta: 60^\\circ`);

        // 3D Plotly Surface Extrusion
        const bxL = -baseTrap/2, bxR = baseTrap/2;
        const txL = bxL - sideTrap*Math.cos(t_rad), txR = bxR + sideTrap*Math.cos(t_rad);
        const h = sideTrap*Math.sin(t_rad);
        
        Plotly.react('plotly-E2', [
            { x: [txL, bxL, bxR, txR], y: [0, 0, 0, 0], z: [h, 0, 0, h], type: 'scatter3d', mode: 'lines', surfaceaxis: 1, surfacecolor: 'rgba(56, 189, 248, 0.4)', line: {color: '#38bdf8'} },
            { x: [txL, bxL, bxR, txR], y: [100, 100, 100, 100], z: [h, 0, 0, h], type: 'scatter3d', mode: 'lines', surfaceaxis: 1, surfacecolor: 'rgba(56, 189, 248, 0.4)', line: {color: '#38bdf8'} },
            { x: [txL, txL], y: [0, 100], z: [h, h], type: 'scatter3d', mode: 'lines', surfaceaxis: 2, surfacecolor: 'rgba(56, 189, 248, 0.4)' },
            { x: [txR, txR], y: [0, 100], z: [h, h], type: 'scatter3d', mode: 'lines', surfaceaxis: 2, surfacecolor: 'rgba(56, 189, 248, 0.4)' },
            { x: [bxL, bxL], y: [0, 100], z: [0, 0], type: 'scatter3d', mode: 'lines', surfaceaxis: 2, surfacecolor: 'rgba(56, 189, 248, 0.4)' },
            { x: [bxR, bxR], y: [0, 100], z: [0, 0], type: 'scatter3d', mode: 'lines', surfaceaxis: 2, surfacecolor: 'rgba(56, 189, 248, 0.4)' }
        ], { 
            paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: {color: '#cbd5e1'},
            margin:{l:0,r:0,t:0,b:0}, 
            scene:{
                xaxis:{range:[-20,20], visible:false}, 
                zaxis:{range:[-5, 15], visible:false}, 
                yaxis:{visible:false},
                camera: { eye: {x: -1.25, y: -1.25, z: 0.5} }
            }, 
            showlegend:false
        }, {displayModeBar:false});

        renderMath('ktx-E2', `\\begin{aligned} A(\\theta) &= ${sideTrap}\\sin\\theta (${baseTrap} + ${sideTrap}\\cos\\theta) \\\\ A'(\\theta) &= ${sideTrap}(${baseTrap}\\cos\\theta + ${sideTrap}\\cos(2\\theta)) = 0 \\implies \\theta_{opt} = 60^\\circ \\end{aligned}`, true);
    }
    sE2.addEventListener("input", runLabE2);


    // ===================================
    // TOGGLES & QUIZ SYSTEM
    // ===================================
    document.getElementById("btn-math1").addEventListener("click", () => document.getElementById("content-math1").classList.toggle("hidden"));
    document.getElementById("btn-math2").addEventListener("click", () => document.getElementById("content-math2").classList.toggle("hidden"));

    document.getElementById("btn-appendix1").addEventListener("click", () => {
        document.getElementById("content-appendix1").classList.toggle("hidden");
        document.getElementById("icon-appendix1").classList.toggle("rotate-180");
        runLabE1();
    });
    
    document.getElementById("btn-appendix2").addEventListener("click", () => {
        document.getElementById("content-appendix2").classList.toggle("hidden");
        document.getElementById("icon-appendix2").classList.toggle("rotate-180");
        runLabE2();
    });

    // Expert Switch Logic
    expertToggle.addEventListener("change", (e) => {
        isExpertMode = e.target.checked;
        const head = document.getElementById("main-header");
        
        const lab1 = document.getElementById("lab1"), lab2 = document.getElementById("lab2"), lab3 = document.getElementById("lab3");
        const ap1 = document.getElementById("expert-appendix1"), ap2 = document.getElementById("expert-appendix2");
        const qS = document.getElementById("quiz-student-panel"), qE = document.getElementById("quiz-expert-panel");

        if(isExpertMode) {
            head.classList.replace("from-math-600", "from-expert-900"); head.classList.replace("to-brand-500", "to-expert-600");
            
            // Hide Student Labs
            lab1.classList.add("hidden"); lab2.classList.add("hidden"); lab3.classList.add("hidden");
            // Show Expert Labs
            ap1.classList.remove("hidden"); ap2.classList.remove("hidden");
            
            qS.classList.add("hidden"); qE.classList.remove("hidden");
            setupQuizE();
            setTimeout(() => { runLabE1(); runLabE2(); }, 100);
        } else {
            head.classList.replace("from-expert-900", "from-math-600"); head.classList.replace("to-expert-600", "to-brand-500");
            
            // Show Student Labs
            lab1.classList.remove("hidden"); lab2.classList.remove("hidden"); lab3.classList.remove("hidden");
            // Hide Expert Labs
            ap1.classList.add("hidden"); ap2.classList.add("hidden");

            qE.classList.add("hidden"); qS.classList.remove("hidden");
        }
    });

    // Validations (Students)
    document.getElementById("btn-quiz-student-validate").addEventListener("click", () => {
        const rad = document.querySelector('input[name="q1"]:checked');
        const msg = document.getElementById("msg-quiz-student-result");
        msg.classList.remove("hidden");
        
        if(!rad) {
            msg.className = "text-sm text-yellow-400 mt-2"; msg.innerHTML = "Por favor selecciona una opción.";
            return;
        }

        if(rad.value === "b") {
            msg.className = "text-sm text-green-400 mt-2"; 
            msg.innerHTML = "<strong>¡Correcto!</strong> Al llegar a un máximo (o mínimo) relativo, la derivada (tasa de cambio) se vuelve cero. Geométricamente, esto significa que la Recta Tangente pierde por completo su inclinación y se vuelve totalmente horizontal.";
            confetti({ particleCount: 150, zIndex: 1000 });
        } else if (rad.value === "a") {
            msg.className = "text-sm text-red-400 mt-2"; 
            msg.innerHTML = "<strong>Incorrecto.</strong> El color o finalización de la gráfica es un aspecto puramente <span class='italic'>visual</span> determinado por las restricciones o el dominio físico (ej. cuando se acaba la cerca), pero no es una propiedad universal del Extremo Matemático en sí mismo.";
        } else if (rad.value === "c") {
            msg.className = "text-sm text-red-400 mt-2"; 
            msg.innerHTML = "<strong>Incorrecto.</strong> Cuando el volumen o área es cero, usualmente estamos en las raíces o límites del dominio (donde no hay material o colapsa la caja). El punto máximo representa el pico de la montaña gráfica, es decir, el valor <em>mayor</em> posible (lejos del cero).";
        }
    });

    // Validations (Expert)
    window.quizEState = { a: 1, b: 0, target: 0 };
    function setupQuizE() {
        window.quizEState.a = Math.floor(Math.random() * 20) - 10 || 1; // != 0
        window.quizEState.b = Math.floor(Math.random() * 40) - 20;
        const c = Math.floor(Math.random() * 10) - 5;
        renderMath("ktx-quiz-e-func", `f(x) = ${window.quizEState.a}x^2 ${window.quizEState.b>=0?'+'+window.quizEState.b:window.quizEState.b}x ${c>=0?'+'+c:c}`, true);
        window.quizEState.target = -window.quizEState.b / (2 * window.quizEState.a);
        document.getElementById("quiz-e-input").value = "";
        document.getElementById("msg-quiz-expert-result").innerText = "";
    }

    document.getElementById("btn-quiz-expert-validate").addEventListener("click", () => {
        const ans = parseFloat(document.getElementById("quiz-e-input").value);
        const msg = document.getElementById("msg-quiz-expert-result");
        if(isNaN(ans)) {
            msg.innerHTML = "<span class='text-yellow-400'>Ingresa un valor numérico.</span>";
            return;
        }
        
        if(Math.abs(ans - window.quizEState.target) < 0.05) {
            msg.className = "text-xs h-auto text-green-600 bg-green-100/10 p-3 rounded mt-2 border border-green-800/30";
            msg.innerHTML = `<strong>¡Validación superada!</strong> Identificaste correctamente el punto crítico en $x \\approx ${window.quizEState.target.toFixed(3)}$.<br/><br/>
            <span class="opacity-80">Razón: Aplicamos el Criterio de la Primera Derivada: <br/>
            $f'(x) = 2(${window.quizEState.a})x + (${window.quizEState.b}) = 0 \\implies ${(2*window.quizEState.a)}x = ${-window.quizEState.b} \\implies x = ${-window.quizEState.b}/${2*window.quizEState.a}$</span>`;
            renderMath(msg.id, msg.innerHTML, false); // Re-trigger katex to parse the inline math explaining the answer
            setTimeout(setupQuizE, 6000);
            confetti({ particleCount: 200, spread: 70, origin: { y: 0.8 }, zIndex: 1000 });
        } else {
            msg.className = "text-xs h-auto text-red-400 bg-red-900/20 p-3 rounded mt-2 border border-red-800/30";
            msg.innerHTML = `<strong>Incorrecto.</strong> El valor esperado es $\\approx ${window.quizEState.target.toFixed(3)}$.<br/><br/>
            <span class="opacity-80">Recuerda: El punto extremo se alcanza cuando la derivada se anula ($f'(x) = 0$).<br/>
            Derivada de la función provista: $f'(x) = ${(2*window.quizEState.a)}x ${window.quizEState.b>=0?'+'+window.quizEState.b:window.quizEState.b} = 0$. <br/>¡Despeja $x$ apropiadamente!</span>`;
            renderMath(msg.id, msg.innerHTML, false);
        }
    });

    // Boot
    runLab1(); runLab2(); runLab3();
});
