/**
 * OptiMath – Analizador de Funciones Reales de Una Variable
 * Motor: math.js (parseo/evaluación segura) + Chart.js (gráfica)
 */

// ─── Utilidades de renderizado KaTeX ───────────────────────────────────────
const renderKatex = (el, tex, display = false) => {
    if (!el) return;
    try {
        katex.render(tex, el, { throwOnError: false, displayMode: display });
    } catch (e) {
        el.textContent = tex;
    }
};

// ─── Evaluación segura con math.js ─────────────────────────────────────────
function buildEvaluator(exprStr) {
    // Reemplaza ** por ^ para que math.js lo acepte
    const safe = exprStr.replace(/\*\*/g, '^');
    const compiled = math.compile(safe);
    return (x) => compiled.evaluate({ x });
}

// ─── Derivada numérica (diferencias centradas de orden 4) ──────────────────
function derivative(f, x, h = 1e-5) {
    return (-f(x + 2 * h) + 8 * f(x + h) - 8 * f(x - h) + f(x - 2 * h)) / (12 * h);
}

function derivative2(f, x, h = 1e-4) {
    return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
}

// ─── Búsqueda de raíces de f'(x)=0 por bisección en sub-intervalos ─────────
function findCriticalPoints(f, a, b, n = 500) {
    const df = (x) => derivative(f, x);
    const xs = [];
    const step = (b - a) / n;
    const found = [];

    for (let i = 0; i < n; i++) {
        const x0 = a + i * step;
        const x1 = x0 + step;
        const fa = df(x0), fb = df(x1);

        if (!isFinite(fa) || !isFinite(fb)) continue;

        if (fa * fb <= 0) {
            // Bisección
            let lo = x0, hi = x1;
            for (let k = 0; k < 60; k++) {
                const mid = (lo + hi) / 2;
                const fm = df(mid);
                if (!isFinite(fm)) break;
                if (Math.abs(hi - lo) < 1e-9) break;
                if (fa * fm <= 0) hi = mid;
                else lo = mid;
            }
            const root = (lo + hi) / 2;
            // Evitar duplicados
            if (!found.some(r => Math.abs(r - root) < 1e-6)) {
                found.push(root);
            }
        }
    }
    return found.sort((a, b) => a - b);
}

// ─── Clasificar punto crítico ───────────────────────────────────────────────
function classifyPoint(f, x) {
    const d2 = derivative2(f, x);
    const df1 = derivative(f, x);

    if (Math.abs(df1) > 0.05) return 'none'; // No es crítico real

    if (d2 < -0.01) return 'max';
    if (d2 > 0.01)  return 'min';
    return 'inflexion'; // f''≈0 → prueba inconclusa
}

// ─── Formatear número ───────────────────────────────────────────────────────
const fmt = (n, d = 4) => parseFloat(n.toFixed(d));
const fmtShort = (n) => parseFloat(n.toFixed(4)).toString();

// ─── Convertir expresión a LaTeX legible ────────────────────────────────────
function toLatex(exprStr) {
    try {
        const safe = exprStr.replace(/\*\*/g, '^');
        const node = math.parse(safe);
        return node.toTex({ parenthesis: 'auto' });
    } catch {
        return exprStr;
    }
}

// ─── Derivada simbólica con math.js ────────────────────────────────────────
function symbolicDerivative(exprStr) {
    try {
        const safe = exprStr.replace(/\*\*/g, '^');
        const node = math.parse(safe);
        const d = math.derivative(node, 'x');
        return { tex: d.toTex({ parenthesis: 'auto' }), str: d.toString() };
    } catch {
        return null;
    }
}

// ─── Instancia de Chart.js ──────────────────────────────────────────────────
let mainChart = null;

function buildChart(xs, ys, criticals) {
    const canvas = document.getElementById('main-chart');
    if (mainChart) { mainChart.destroy(); mainChart = null; }

    // Datos de la curva
    const lineData = xs.map((x, i) => ({ x, y: ys[i] }));

    // Datasets de puntos marcados
    const maxPts = criticals.filter(p => p.type === 'max' || p.globalMax).map(p => ({ x: p.x, y: p.y }));
    const minPts = criticals.filter(p => p.type === 'min' || p.globalMin).map(p => ({ x: p.x, y: p.y }));
    const infPts = criticals.filter(p => p.type === 'inflexion').map(p => ({ x: p.x, y: p.y }));
    const endPts = criticals.filter(p => p.type === 'endpoint').map(p => ({ x: p.x, y: p.y }));

    mainChart = new Chart(canvas.getContext('2d'), {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'f(x)',
                    data: lineData,
                    showLine: true,
                    borderColor: '#6366f1',
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0.3,
                    fill: false,
                    order: 5
                },
                {
                    label: 'Máximo local',
                    data: maxPts,
                    backgroundColor: '#ef4444',
                    borderColor: '#fff',
                    borderWidth: 2,
                    pointRadius: 9,
                    pointHoverRadius: 12,
                    order: 1
                },
                {
                    label: 'Mínimo local',
                    data: minPts,
                    backgroundColor: '#22c55e',
                    borderColor: '#fff',
                    borderWidth: 2,
                    pointRadius: 9,
                    pointHoverRadius: 12,
                    order: 1
                },
                {
                    label: 'Inflexión',
                    data: infPts,
                    backgroundColor: '#f59e0b',
                    borderColor: '#fff',
                    borderWidth: 2,
                    pointRadius: 8,
                    pointStyle: 'triangle',
                    order: 2
                },
                {
                    label: 'Extremo intervalo',
                    data: endPts,
                    backgroundColor: '#8b5cf6',
                    borderColor: '#fff',
                    borderWidth: 2,
                    pointRadius: 8,
                    pointStyle: 'rectRot',
                    order: 2
                }
            ]
        },
        options: {
            animation: { duration: 400, easing: 'easeOutQuart' },
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'nearest', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => `(${fmt(ctx.parsed.x, 4)}, ${fmt(ctx.parsed.y, 4)})`
                    },
                    backgroundColor: '#1e293b',
                    titleFont: { family: "'JetBrains Mono', monospace" },
                    bodyFont:  { family: "'JetBrains Mono', monospace" },
                    padding: 10,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'x', font: { weight: 'bold', size: 13 } },
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { font: { family: "'JetBrains Mono', monospace", size: 11 } }
                },
                y: {
                    title: { display: true, text: 'f(x)', font: { weight: 'bold', size: 13 } },
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { font: { family: "'JetBrains Mono', monospace", size: 11 } }
                }
            }
        },
        plugins: [{
            id: 'annotatePoints',
            afterDatasetsDraw(chart) {
                const ctx = chart.ctx;
                // Anotar coordenadas en la gráfica
                [1, 2, 3, 4].forEach(dsIdx => {
                    const meta = chart.getDatasetMeta(dsIdx);
                    if (!meta) return;
                    meta.data.forEach((pt, i) => {
                        const raw = chart.data.datasets[dsIdx].data[i];
                        if (!raw) return;
                        const label = `(${fmt(raw.x, 3)}, ${fmt(raw.y, 3)})`;
                        ctx.save();
                        ctx.font = "bold 10px 'JetBrains Mono', monospace";
                        ctx.fillStyle = '#1e293b';
                        ctx.textAlign = 'center';
                        // Anotar encima o debajo según el tipo
                        const offsetY = dsIdx === 2 ? 18 : -14;
                        ctx.fillText(label, pt.x, pt.y + offsetY);
                        ctx.restore();
                    });
                });
            }
        }]
    });
}

// ─── Construir leyenda de puntos ────────────────────────────────────────────
function buildLegend(points) {
    const container = document.getElementById('points-legend');
    container.innerHTML = '';
    points.forEach(p => {
        const colors = {
            max: '#ef4444', min: '#22c55e',
            inflexion: '#f59e0b', endpoint: '#8b5cf6'
        };
        const labels = {
            max: 'Máx local', min: 'Mín local',
            inflexion: 'Inflexión', endpoint: 'Extremo'
        };
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <span class="legend-dot" style="background:${colors[p.type] || '#64748b'}"></span>
            x=${fmtShort(p.x)}, f(x)=${fmtShort(p.y)}
            <span style="opacity:0.6;margin-left:2px">(${labels[p.type] || p.type})</span>
        `;
        container.appendChild(item);
    });
}

// ─── Construir pasos matemáticos ────────────────────────────────────────────
function buildSteps(exprStr, a, b, f, criticals, deriv) {
    const container = document.getElementById('steps-content');
    container.innerHTML = '';

    const fTex   = toLatex(exprStr);
    const dfTex  = deriv ? deriv.tex : '\\text{(numérica)}';
    const d2fTex = deriv ? (() => {
        try {
            const safe = deriv.str.replace(/\*\*/g, '^');
            const d2node = math.derivative(math.parse(safe), 'x');
            return d2node.toTex({ parenthesis: 'auto' });
        } catch { return '\\text{(numérica)}'; }
    })() : '\\text{(numérica)}';

    // Paso 1 – Función y derivada
    addStep(container, '1', 'violet', 'Función y Primera Derivada', [
        { type: 'text', content: 'Definimos la función a analizar y calculamos su primera derivada:' },
        { type: 'formula', tex: `f(x) = ${fTex}` },
        { type: 'formula', tex: `f'(x) = ${dfTex}` },
        { type: 'text', content: `Dominio de análisis: intervalo cerrado [a, b] = [${a}, ${b}]` }
    ]);

    // Paso 2 – Resolver f'(x) = 0
    const innerPts = criticals.filter(p => p.type !== 'endpoint');
    const innerTex = innerPts.length > 0
        ? innerPts.map(p => `x \\approx ${fmtShort(p.x)}`).join(',\\quad ')
        : '\\text{No hay puntos críticos interiores}';

    addStep(container, '2', 'blue', "Ecuación f'(x) = 0 — Puntos Críticos Interiores", [
        { type: 'text', content: "Buscamos los valores de x en (a, b) donde la derivada se anula:" },
        { type: 'formula', tex: `f'(x) = ${dfTex} = 0` },
        { type: 'text', content: `Solución numérica (método de bisección sobre ${500} subintervalos):` },
        { type: 'formula', tex: innerTex },
        { type: 'text', content: `Se encontraron ${innerPts.length} punto(s) crítico(s) interior(es).` }
    ]);

    // Paso 3 – Clasificación con segunda derivada
    const classContent = [];
    classContent.push({ type: 'text', content: `Segunda derivada: f''(x) = ${d2fTex}` });
    classContent.push({ type: 'text', content: 'Criterio de la segunda derivada para cada punto crítico:' });

    innerPts.forEach(p => {
        const d2val = derivative2(f, p.x);
        let resultClass = '', resultMsg = '';
        if (p.type === 'max') {
            resultClass = 'max';
            resultMsg = `f''(${fmtShort(p.x)}) = ${fmt(d2val, 4)} < 0 → \\textbf{Máximo local} en (${fmtShort(p.x)},\\, ${fmtShort(p.y)})`;
        } else if (p.type === 'min') {
            resultClass = 'min';
            resultMsg = `f''(${fmtShort(p.x)}) = ${fmt(d2val, 4)} > 0 → \\textbf{Mínimo local} en (${fmtShort(p.x)},\\, ${fmtShort(p.y)})`;
        } else {
            resultClass = 'inf';
            resultMsg = `f''(${fmtShort(p.x)}) = ${fmt(d2val, 4)} \\approx 0 → \\textbf{Punto de inflexión}`;
        }
        classContent.push({ type: 'result', cls: resultClass, tex: resultMsg });
    });

    if (innerPts.length === 0) {
        classContent.push({ type: 'result', cls: 'none', tex: '\\text{Sin puntos críticos interiores en este intervalo.}' });
    }

    addStep(container, '3', 'amber', 'Clasificación por Segunda Derivada', classContent);

    // Paso 4 – Extremos del intervalo
    const endPts = criticals.filter(p => p.type === 'endpoint');
    const endContent = [
        { type: 'text', content: 'Evaluamos f en los extremos del intervalo (candidatos a extremos globales):' },
        { type: 'formula', tex: `f(${a}) = ${fmtShort(endPts.find(p=>Math.abs(p.x - a)<1e-6)?.y ?? f(a))}` },
        { type: 'formula', tex: `f(${b}) = ${fmtShort(endPts.find(p=>Math.abs(p.x - b)<1e-6)?.y ?? f(b))}` }
    ];
    addStep(container, '4', 'green', 'Valores en los Extremos del Intervalo', endContent);

    // Paso 5 – Máximo y mínimo global
    const allY   = criticals.map(p => p.y);
    const globalMax = Math.max(...allY);
    const globalMin = Math.min(...allY);
    const maxPts = criticals.filter(p => Math.abs(p.y - globalMax) < 1e-6);
    const minPts = criticals.filter(p => Math.abs(p.y - globalMin) < 1e-6);

    const globalContent = [
        { type: 'text', content: 'Comparando todos los valores evaluados (puntos críticos + extremos):' }
    ];

    maxPts.forEach(p => {
        globalContent.push({
            type: 'result', cls: 'max',
            tex: `\\textbf{Máximo global:}\\; f(${fmtShort(p.x)}) = ${fmtShort(p.y)}`
        });
    });
    minPts.forEach(p => {
        globalContent.push({
            type: 'result', cls: 'min',
            tex: `\\textbf{Mínimo global:}\\; f(${fmtShort(p.x)}) = ${fmtShort(p.y)}`
        });
    });

    addStep(container, '5', 'red', 'Máximos y Mínimos Globales en [a, b]', globalContent);
}

// ─── Helper para crear un bloque de paso ────────────────────────────────────
function addStep(container, num, color, title, items) {
    const block = document.createElement('div');
    block.className = 'step-block';

    block.innerHTML = `
        <div class="step-header">
            <div class="step-badge step-badge--${color}">Paso ${num}</div>
            <span class="step-title">${title}</span>
        </div>
        <div class="step-body" id="step-body-${num}"></div>
    `;
    container.appendChild(block);

    const body = block.querySelector(`#step-body-${num}`);

    items.forEach(item => {
        if (item.type === 'text') {
            const p = document.createElement('p');
            p.className = 'step-text';
            p.textContent = item.content;
            body.appendChild(p);
        } else if (item.type === 'formula') {
            const div = document.createElement('div');
            div.className = 'step-formula';
            renderKatex(div, item.tex, true);
            body.appendChild(div);
        } else if (item.type === 'result') {
            const div = document.createElement('div');
            div.className = `step-result step-result--${item.cls}`;
            renderKatex(div, item.tex, false);
            body.appendChild(div);
        }
    });
}

// ─── Tabla de resultados ────────────────────────────────────────────────────
function buildTable(criticals, f) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    const allY = criticals.map(p => p.y);
    const globalMax = Math.max(...allY);
    const globalMin = Math.min(...allY);

    const typeInfo = {
        max:      ['type-badge--max', '🔴 Máx local'],
        min:      ['type-badge--min', '🟢 Mín local'],
        inflexion:['type-badge--inf', '🟡 Inflexión'],
        endpoint: ['type-badge--end', '🟣 Extremo']
    };

    criticals.forEach(p => {
        const d2  = p.type !== 'endpoint' ? fmt(derivative2(f, p.x), 4) : '—';
        const df1 = p.type !== 'endpoint' ? fmt(derivative(f, p.x), 4) : '—';
        const [badgeCls, label] = typeInfo[p.type] || ['', p.type];

        const isGMax = Math.abs(p.y - globalMax) < 1e-6;
        const isGMin = Math.abs(p.y - globalMin) < 1e-6;

        const globalCell = [
            isGMax ? '<span class="global-badge global-badge--max">▲ Máx</span>' : '',
            isGMin ? '<span class="global-badge global-badge--min">▼ Mín</span>' : ''
        ].filter(Boolean).join(' ') || '—';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${fmtShort(p.x)}</td>
            <td><strong>${fmtShort(p.y)}</strong></td>
            <td>${df1}</td>
            <td>${d2}</td>
            <td><span class="type-badge ${badgeCls}">${label}</span></td>
            <td>${globalCell}</td>
        `;
        tbody.appendChild(tr);
    });

    // Resumen global
    const maxPts = criticals.filter(p => Math.abs(p.y - globalMax) < 1e-6);
    const minPts = criticals.filter(p => Math.abs(p.y - globalMin) < 1e-6);

    const summary = document.getElementById('global-summary');
    summary.innerHTML = `
        <div class="summary-card summary-card--max">
            <span class="summary-card-label">Máximo Global</span>
            <span class="summary-card-value">f(x) = ${fmtShort(globalMax)}</span>
            <span style="font-size:0.78rem;opacity:0.7">en x = ${maxPts.map(p=>fmtShort(p.x)).join(', ')}</span>
        </div>
        <div class="summary-card summary-card--min">
            <span class="summary-card-label">Mínimo Global</span>
            <span class="summary-card-value">f(x) = ${fmtShort(globalMin)}</span>
            <span style="font-size:0.78rem;opacity:0.7">en x = ${minPts.map(p=>fmtShort(p.x)).join(', ')}</span>
        </div>
    `;
}

// ─── FUNCIÓN PRINCIPAL: Analizar ────────────────────────────────────────────
function analyze() {
    const exprStr = document.getElementById('func-input').value.trim();
    const a       = parseFloat(document.getElementById('a-input').value);
    const b       = parseFloat(document.getElementById('b-input').value);
    const errEl   = document.getElementById('error-msg');
    const btn     = document.getElementById('analyze-btn');

    // Ocultar secciones y errores previos
    errEl.classList.add('hidden');
    ['graph-section','steps-section','table-section'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });

    // Validaciones
    if (!exprStr) {
        showError('Por favor ingresa una función f(x).');
        return;
    }
    if (isNaN(a) || isNaN(b)) {
        showError('Los valores del intervalo [a, b] deben ser números.');
        return;
    }
    if (a >= b) {
        showError('El intervalo es inválido: se requiere a < b.');
        return;
    }
    if (b - a > 1000) {
        showError('El intervalo es demasiado grande. Usa un rango menor a 1000.');
        return;
    }

    // Intentar compilar
    let f;
    try {
        f = buildEvaluator(exprStr);
        const test = f(a);
        if (!isFinite(test)) throw new Error('Valor no finito en a');
    } catch (e) {
        showError(`Error en la función: "${e.message}". Verifica la sintaxis (usa * para multiplicar, ** para potencias).`);
        return;
    }

    btn.classList.add('loading');
    btn.textContent = 'Analizando…';

    // Usamos setTimeout para no bloquear la UI
    setTimeout(() => {
        try {
            // 1. Muestreo de la función
            const N = 600;
            const xs = [], ys = [];
            const step = (b - a) / N;
            for (let i = 0; i <= N; i++) {
                const x = a + i * step;
                const y = f(x);
                if (isFinite(y)) { xs.push(x); ys.push(y); }
            }

            // 2. Derivada simbólica (intentamos)
            const deriv = symbolicDerivative(exprStr);

            // 3. Puntos críticos interiores
            const critX = findCriticalPoints(f, a, b);

            // 4. Construir lista completa de candidatos
            const allPoints = [];

            // Extremos del intervalo
            [a, b].forEach(x => {
                allPoints.push({ x, y: f(x), type: 'endpoint' });
            });

            // Puntos críticos interiores
            critX.forEach(x => {
                if (x <= a + 1e-6 || x >= b - 1e-6) return; // ignorar si coincide con extremo
                const type = classifyPoint(f, x);
                if (type === 'none') return; // No era crítico real
                allPoints.push({ x, y: f(x), type });
            });

            // Ordenar por x
            allPoints.sort((p, q) => p.x - q.x);

            // Marcar extremos globales
            const allY = allPoints.map(p => p.y);
            const globalMax = Math.max(...allY);
            const globalMin = Math.min(...allY);
            allPoints.forEach(p => {
                p.globalMax = Math.abs(p.y - globalMax) < 1e-6;
                p.globalMin = Math.abs(p.y - globalMin) < 1e-6;
            });

            // 5. Gráfica
            buildChart(xs, ys, allPoints);
            buildLegend(allPoints);

            // 6. Pasos matemáticos
            buildSteps(exprStr, a, b, f, allPoints, deriv);

            // 7. Tabla
            buildTable(allPoints, f);

            // Mostrar secciones
            ['graph-section','steps-section','table-section'].forEach(id => {
                const el = document.getElementById(id);
                el.style.display = '';
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });

        } catch (e) {
            showError(`Error durante el análisis: ${e.message}`);
        } finally {
            btn.classList.remove('loading');
            btn.innerHTML = `
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                Analizar Función`;
        }
    }, 50);
}

function showError(msg) {
    const el = document.getElementById('error-msg');
    el.textContent = msg;
    el.classList.remove('hidden');
}

// ─── Botones de ejemplo ─────────────────────────────────────────────────────
document.querySelectorAll('.example-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('func-input').value = btn.dataset.f;
        document.getElementById('a-input').value    = btn.dataset.a;
        document.getElementById('b-input').value    = btn.dataset.b;
        analyze();
    });
});

// ─── Botón principal ────────────────────────────────────────────────────────
document.getElementById('analyze-btn').addEventListener('click', analyze);

// ─── Enter en los campos dispara análisis ───────────────────────────────────
['func-input','a-input','b-input'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
        if (e.key === 'Enter') analyze();
    });
});

// ─── Análisis inicial al cargar ─────────────────────────────────────────────
analyze();
