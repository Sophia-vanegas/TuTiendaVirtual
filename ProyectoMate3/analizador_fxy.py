"""
OptiMath – Analizador de Funciones f(x, y)
GUI con tkinter | Cálculo simbólico con sympy | Gráfica 3D con matplotlib

Ejecutar:  python analizador_fxy.py
Requisitos: pip install sympy numpy matplotlib
"""

import tkinter as tk
from tkinter import ttk, font as tkfont, messagebox
import sympy as sp
import numpy as np
import warnings
warnings.filterwarnings("ignore")

import matplotlib
matplotlib.use("TkAgg")
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg, NavigationToolbar2Tk
from mpl_toolkits.mplot3d import Axes3D  # noqa: F401

# ─────────────────────────────────────────────────────────────
#  CONSTANTES DE ESTILO
# ─────────────────────────────────────────────────────────────
BG_DARK   = "#0f172a"
BG_CARD   = "#1e293b"
BG_INPUT  = "#334155"
FG_WHITE  = "#f1f5f9"
FG_MUTED  = "#94a3b8"
ACCENT    = "#7c3aed"
ACCENT2   = "#2563eb"
GREEN     = "#16a34a"
RED       = "#dc2626"
AMBER     = "#d97706"
BORDER    = "#334155"

BTN_STYLE = {
    "relief": "flat", "bd": 0, "padx": 6, "pady": 5,
    "font": ("JetBrains Mono", 10, "bold"),
    "cursor": "hand2", "activeforeground": "#ffffff",
}

EXAMPLES = [
    ("x²+y² (mínimo)",          "x**2 + y**2",          "-3","3","-3","3"),
    ("-x²-y² (máximo)",         "-x**2 - y**2",         "-3","3","-3","3"),
    ("x²-y² (silla)",           "x**2 - y**2",          "-3","3","-3","3"),
    ("sin(x)*cos(y)",           "sin(x)*cos(y)",         "-4","4","-4","4"),
    ("x³-3xy² (silla)",         "x**3 - 3*x*y**2",      "-2","2","-2","2"),
    ("x²+y²-x*y-x",             "x**2 + y**2 - x*y - x","-3","3","-3","3"),
]

SYMPY_NS = {
    "sin": sp.sin, "cos": sp.cos, "tan": sp.tan,
    "asin": sp.asin, "acos": sp.acos, "atan": sp.atan,
    "sinh": sp.sinh, "cosh": sp.cosh, "tanh": sp.tanh,
    "exp": sp.exp, "log": sp.log, "log10": sp.log,
    "sqrt": sp.sqrt, "abs": sp.Abs,
    "pi": sp.pi, "e": sp.E,
}


# ─────────────────────────────────────────────────────────────
#  LÓGICA MATEMÁTICA
# ─────────────────────────────────────────────────────────────
def analizar_funcion(expr_str, x_min, x_max, y_min, y_max):
    """
    Retorna dict con: f, fx, fy, fxx, fxy, fyy, criticos, lineas_proceso
    """
    x, y = sp.Symbol("x"), sp.Symbol("y")
    ns = dict(SYMPY_NS, x=x, y=y)

    # Parsear
    f = sp.sympify(expr_str, locals=ns)

    # Derivadas parciales
    fx  = sp.diff(f, x)
    fy  = sp.diff(f, y)
    fxx = sp.diff(fx, x)
    fxy = sp.diff(fx, y)
    fyy = sp.diff(fy, y)

    # Resolver sistema
    try:
        soluciones = sp.solve([fx, fy], [x, y], dict=True)
    except Exception:
        soluciones = []

    # Si solve falla, intentar nsolve en puntos candidatos
    if not soluciones:
        soluciones = _nsolve_grid(fx, fy, x, y, x_min, x_max, y_min, y_max)

    # Filtrar dentro del dominio y construir lista de críticos
    criticos = []
    for sol in soluciones:
        if isinstance(sol, dict):
            px = sol.get(x, None)
            py = sol.get(y, None)
        else:
            continue
        if px is None or py is None:
            continue
        try:
            px_n = float(px.evalf())
            py_n = float(py.evalf())
        except Exception:
            continue
        if not (x_min <= px_n <= x_max and y_min <= py_n <= y_max):
            continue

        fval = float(f.subs([(x, px), (y, py)]).evalf())
        A = float(fxx.subs([(x, px), (y, py)]).evalf())
        B = float(fxy.subs([(x, px), (y, py)]).evalf())
        C = float(fyy.subs([(x, px), (y, py)]).evalf())
        D = A * C - B**2

        if D > 1e-9 and A > 1e-9:
            tipo, emoji = "Mínimo local",   "🟢"
        elif D > 1e-9 and A < -1e-9:
            tipo, emoji = "Máximo local",   "🔴"
        elif D < -1e-9:
            tipo, emoji = "Punto de silla", "🟡"
        else:
            tipo, emoji = "Dudoso (D≈0)",   "⚪"

        criticos.append({
            "x": px_n, "y": py_n, "f": fval,
            "A": A, "B": B, "C": C, "D": D,
            "tipo": tipo, "emoji": emoji
        })

    # Proceso paso a paso
    lineas = _construir_proceso(expr_str, f, fx, fy, fxx, fxy, fyy, criticos)

    return {
        "f": f, "x": x, "y": y,
        "fx": fx, "fy": fy,
        "fxx": fxx, "fxy": fxy, "fyy": fyy,
        "criticos": criticos,
        "proceso": lineas
    }


def _nsolve_grid(fx, fy, x, y, xmin, xmax, ymin, ymax, n=6):
    """Intenta nsolve desde varios puntos iniciales de una malla."""
    found = []
    xs = np.linspace(xmin, xmax, n)
    ys = np.linspace(ymin, ymax, n)
    seen = []
    for xi in xs:
        for yi in ys:
            try:
                sol = sp.nsolve([fx, fy], [x, y], [xi, yi], tol=1e-8, prec=10)
                px, py = float(sol[0]), float(sol[1])
                if any(abs(px-s[0]) < 1e-4 and abs(py-s[1]) < 1e-4 for s in seen):
                    continue
                seen.append((px, py))
                found.append({x: sp.Float(px), y: sp.Float(py)})
            except Exception:
                pass
    return found


def _construir_proceso(expr_str, f, fx, fy, fxx, fxy, fyy, criticos):
    ancho = 60
    sep = "─" * ancho
    L = []
    L.append("┌" + sep + "┐")
    L.append(f"│  f(x,y) = {expr_str:<{ancho-13}}│")
    L.append(f"│  ∂f/∂x  = {str(fx):<{ancho-13}}│")
    L.append(f"│  ∂f/∂y  = {str(fy):<{ancho-13}}│")
    L.append("│" + " " * ancho + "│")
    L.append(f"│  Sistema: ∂f/∂x = 0,  ∂f/∂y = 0{' '*(ancho-35)}│")
    L.append("│" + " " * ancho + "│")

    if not criticos:
        L.append(f"│  ⚠  No se encontraron puntos críticos en el dominio.{' '*(ancho-54)}│")
    else:
        for i, c in enumerate(criticos, 1):
            L.append(f"│  [{i}] Punto crítico: ({c['x']:.6g},  {c['y']:.6g}){' '*(ancho-38)}│")
            L.append(f"│      f({c['x']:.4g},{c['y']:.4g}) = {c['f']:.6g}{' '*(ancho-34)}│")
            L.append("│" + " " * ancho + "│")
            L.append(f"│      A = ∂²f/∂x²    = {c['A']:.6g}{' '*(ancho-28)}│")
            L.append(f"│      B = ∂²f/∂x∂y   = {c['B']:.6g}{' '*(ancho-28)}│")
            L.append(f"│      C = ∂²f/∂y²    = {c['C']:.6g}{' '*(ancho-28)}│")
            L.append(f"│      D = AC - B²    = {c['D']:.6g}{' '*(ancho-28)}│")
            L.append("│" + " " * ancho + "│")
            clasif = f"  {c['emoji']}  {c['tipo'].upper()}"
            L.append(f"│{clasif:<{ancho+2}}│")
            if i < len(criticos):
                L.append("│" + "·" * ancho + "│")

    L.append("└" + sep + "┘")
    return "\n".join(L)


# ─────────────────────────────────────────────────────────────
#  GRÁFICA 3D
# ─────────────────────────────────────────────────────────────
COLORES_TIPO = {
    "Mínimo local":   "#22c55e",
    "Máximo local":   "#ef4444",
    "Punto de silla": "#f59e0b",
    "Dudoso (D≈0)":   "#94a3b8",
}

def graficar(ax, fig, resultado, x_min, x_max, y_min, y_max):
    ax.clear()
    ax.set_facecolor("#0f172a")
    fig.patch.set_facecolor("#0f172a")

    f  = resultado["f"]
    xs = resultado["x"]
    ys = resultado["y"]

    NP = 80
    xi = np.linspace(x_min, x_max, NP)
    yi = np.linspace(y_min, y_max, NP)
    X, Y = np.meshgrid(xi, yi)

    f_lam = sp.lambdify([xs, ys], f, modules=["numpy"])
    try:
        Z = f_lam(X, Y).astype(float)
    except Exception:
        Z = np.zeros_like(X)
    Z = np.where(np.isfinite(Z), Z, np.nan)

    surf = ax.plot_surface(X, Y, Z, cmap="viridis", alpha=0.82,
                           linewidth=0, antialiased=True)
    ax.set_xlabel("x", color=FG_WHITE, labelpad=6)
    ax.set_ylabel("y", color=FG_WHITE, labelpad=6)
    ax.set_zlabel("f(x,y)", color=FG_WHITE, labelpad=6)
    ax.tick_params(colors=FG_MUTED, labelsize=7)
    ax.xaxis.pane.fill = False
    ax.yaxis.pane.fill = False
    ax.zaxis.pane.fill = False

    # Marcar puntos críticos
    for c in resultado["criticos"]:
        color = COLORES_TIPO.get(c["tipo"], "#ffffff")
        ax.scatter([c["x"]], [c["y"]], [c["f"]],
                   color=color, s=100, zorder=10,
                   edgecolors="white", linewidths=0.8)
        ax.text(c["x"], c["y"], c["f"],
                f"  {c['emoji']} ({c['x']:.2f},{c['y']:.2f})",
                color=color, fontsize=7, zorder=11)

    fig.canvas.draw_idle()


# ─────────────────────────────────────────────────────────────
#  APLICACIÓN PRINCIPAL
# ─────────────────────────────────────────────────────────────
class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("OptiMath — Analizador f(x, y)")
        self.geometry("1280x820")
        self.minsize(1000, 700)
        self.configure(bg=BG_DARK)
        self.resizable(True, True)

        self._build_ui()
        self._run_example(EXAMPLES[0])   # análisis inicial

    # ── UI ────────────────────────────────────────────────────
    def _build_ui(self):
        # ── HEADER ───────────────────────────────────────────
        hdr = tk.Frame(self, bg=ACCENT, height=46)
        hdr.pack(fill="x")
        hdr.pack_propagate(False)
        tk.Label(hdr, text="OptiMath  ·  Analizador de Funciones f(x, y)",
                 bg=ACCENT, fg="white",
                 font=("Inter", 13, "bold")).pack(side="left", padx=18, pady=10)

        # ── BARRA DE CONTROLES (top) ──────────────────────────
        ctrl = tk.Frame(self, bg=BG_CARD, pady=10)
        ctrl.pack(fill="x", padx=0)

        # Campo función
        tk.Label(ctrl, text="f(x, y) =", bg=BG_CARD, fg=FG_WHITE,
                 font=("Inter", 11, "bold")).pack(side="left", padx=(18, 4))
        self.func_var = tk.StringVar(value="x**2 + y**2")
        self.func_entry = tk.Entry(ctrl, textvariable=self.func_var,
                                   bg=BG_INPUT, fg=FG_WHITE, insertbackground=FG_WHITE,
                                   font=("JetBrains Mono", 12), relief="flat",
                                   width=32, bd=0, highlightthickness=2,
                                   highlightbackground=BORDER, highlightcolor=ACCENT)
        self.func_entry.pack(side="left", ipady=6, padx=4)

        # Rangos
        for label, var_name, default in [
            ("x_min", "xmin", "-3"), ("x_max", "xmax", "3"),
            ("y_min", "ymin", "-3"), ("y_max", "ymax", "3"),
        ]:
            tk.Label(ctrl, text=label, bg=BG_CARD, fg=FG_MUTED,
                     font=("Inter", 9)).pack(side="left", padx=(10, 2))
            entry = tk.Entry(ctrl, bg=BG_INPUT, fg=FG_WHITE,
                             insertbackground=FG_WHITE,
                             font=("JetBrains Mono", 10), width=5,
                             relief="flat", highlightthickness=1,
                             highlightbackground=BORDER, highlightcolor=ACCENT)
            entry.insert(0, default)
            entry.pack(side="left", ipady=4)
            setattr(self, var_name, entry)

        # Botón analizar
        tk.Button(ctrl, text="  ▶  Analizar  ",
                  bg=ACCENT, fg="white", activebackground="#6d28d9",
                  font=("Inter", 10, "bold"), relief="flat",
                  cursor="hand2", bd=0, padx=8, pady=6,
                  command=self._on_analizar).pack(side="left", padx=(16, 6))

        # Menú ejemplos
        tk.Label(ctrl, text="Ejemplos:", bg=BG_CARD, fg=FG_MUTED,
                 font=("Inter", 9)).pack(side="left", padx=(10, 2))
        self.ejemplo_var = tk.StringVar(value=EXAMPLES[0][0])
        ej_menu = ttk.Combobox(ctrl, textvariable=self.ejemplo_var,
                               values=[e[0] for e in EXAMPLES],
                               state="readonly", width=22,
                               font=("Inter", 9))
        ej_menu.pack(side="left")
        ej_menu.bind("<<ComboboxSelected>>", self._on_example_selected)

        # ── CUERPO PRINCIPAL ──────────────────────────────────
        body = tk.Frame(self, bg=BG_DARK)
        body.pack(fill="both", expand=True, pady=(0, 0))
        body.columnconfigure(0, weight=3)
        body.columnconfigure(1, weight=2)
        body.rowconfigure(0, weight=3)
        body.rowconfigure(1, weight=2)

        # ── GRÁFICA 3D (izquierda arriba) ─────────────────────
        graph_frame = tk.Frame(body, bg=BG_DARK, bd=0)
        graph_frame.grid(row=0, column=0, sticky="nsew", padx=(8, 4), pady=(8, 4))

        self.fig = plt.Figure(figsize=(6, 4.5), dpi=96)
        self.fig.patch.set_facecolor(BG_DARK)
        self.ax = self.fig.add_subplot(111, projection="3d")
        self.canvas = FigureCanvasTkAgg(self.fig, master=graph_frame)
        self.canvas.get_tk_widget().pack(fill="both", expand=True)

        toolbar_frame = tk.Frame(graph_frame, bg=BG_DARK)
        toolbar_frame.pack(fill="x")
        nav = NavigationToolbar2Tk(self.canvas, toolbar_frame)
        nav.config(background=BG_DARK)
        nav.update()

        # ── TECLADO EN PANTALLA (derecha arriba) ──────────────
        kbd_outer = tk.Frame(body, bg=BG_CARD, bd=0)
        kbd_outer.grid(row=0, column=1, sticky="nsew", padx=(4, 8), pady=(8, 4))
        self._build_keyboard(kbd_outer)

        # ── ÁREA DE TEXTO – proceso matemático (abajo) ────────
        text_frame = tk.Frame(body, bg=BG_CARD)
        text_frame.grid(row=1, column=0, columnspan=2,
                        sticky="nsew", padx=8, pady=(4, 8))

        tk.Label(text_frame, text="  Proceso Matemático Paso a Paso",
                 bg=BG_CARD, fg=ACCENT,
                 font=("Inter", 10, "bold")).pack(anchor="w", pady=(6, 0))

        txt_scroll = tk.Scrollbar(text_frame)
        txt_scroll.pack(side="right", fill="y")

        self.txt_proceso = tk.Text(text_frame, bg="#0d1b2a", fg="#a5f3fc",
                                   font=("JetBrains Mono", 10),
                                   relief="flat", bd=0, wrap="none",
                                   yscrollcommand=txt_scroll.set,
                                   state="disabled", height=12)
        self.txt_proceso.pack(fill="both", expand=True, padx=6, pady=(2, 6))
        txt_scroll.config(command=self.txt_proceso.yview)

        # Tags de color
        self.txt_proceso.tag_config("max",    foreground="#ef4444")
        self.txt_proceso.tag_config("min",    foreground="#22c55e")
        self.txt_proceso.tag_config("silla",  foreground="#f59e0b")
        self.txt_proceso.tag_config("error",  foreground="#f87171")
        self.txt_proceso.tag_config("normal", foreground="#a5f3fc")

    # ── TECLADO EN PANTALLA ────────────────────────────────────
    def _build_keyboard(self, parent):
        tk.Label(parent, text="⌨  Teclado Científico",
                 bg=BG_CARD, fg=ACCENT,
                 font=("Inter", 10, "bold")).pack(anchor="w", padx=10, pady=(8, 4))

        kbd = tk.Frame(parent, bg=BG_CARD)
        kbd.pack(fill="both", expand=True, padx=8, pady=(0, 8))

        # Definición de filas: (texto_botón, texto_insertado)
        rows = [
            [("7","7"),("8","8"),("9","9"),("/","/"),("^","**"),("(",  "("), (")", ")")],
            [("4","4"),("5","5"),("6","6"),("*","*"),("x","x"),("y","y"),(". ",".")],
            [("1","1"),("2","2"),("3","3"),("-","-"),("pi","pi"),("e","e"),],
            [("0","0"),("00","00"),("+","+"),("+/-","-"),(","," "),],
            [("sin(","sin("),("cos(","cos("),("tan(","tan("),("exp(","exp("),("log(","log("),("sqrt(","sqrt(")],
            [("asin(","asin("),("acos(","acos("),("atan(","atan("),("abs(","abs("),("log10(","log10(")],
            [("sinh(","sinh("),("cosh(","cosh("),("tanh(","tanh("),],
            [("⌫", "__BS__"),("C","__CLR__"),("Espacio"," "),("Copiar →","__COPY__")],
        ]

        # Paleta de colores por categoría
        def color(txt):
            if txt in ("x","y"):              return "#7c3aed","#ede9fe"
            if txt in ("⌫","C","Copiar →"):   return "#991b1b","#fca5a5"
            if any(c.isalpha() for c in txt) and txt not in ("pi","e"):
                return "#1e3a8a","#bfdbfe"
            if txt in ("pi","e"):             return "#065f46","#a7f3d0"
            if txt in ("+","-","*","/","^",","," ","Espacio"): return "#334155","#e2e8f0"
            return "#1e293b","#f1f5f9"

        for row in rows:
            fr = tk.Frame(kbd, bg=BG_CARD)
            fr.pack(fill="x", pady=2)
            for (label, insert) in row:
                bg, fg = color(label)
                btn = tk.Button(fr, text=label, bg=bg, fg=fg,
                                activebackground=ACCENT, activeforeground="white",
                                **BTN_STYLE)
                btn.configure(command=lambda v=insert, b=btn: self._kbd_insert(v))
                btn.pack(side="left", padx=2, fill="x", expand=True)

    def _kbd_insert(self, value):
        e = self.func_entry
        if value == "__BS__":
            idx = e.index(tk.INSERT)
            if idx > 0:
                e.delete(idx - 1)
        elif value == "__CLR__":
            e.delete(0, tk.END)
        elif value == "__COPY__":
            self.clipboard_clear()
            self.clipboard_append(e.get())
        else:
            idx = e.index(tk.INSERT)
            e.insert(idx, value)
        e.focus_set()

    # ── EVENTOS ───────────────────────────────────────────────
    def _on_example_selected(self, event=None):
        name = self.ejemplo_var.get()
        for ex in EXAMPLES:
            if ex[0] == name:
                self._run_example(ex)
                break

    def _run_example(self, ex):
        _, expr, xmin, xmax, ymin, ymax = ex
        self.func_var.set(expr)
        self.xmin.delete(0, tk.END); self.xmin.insert(0, xmin)
        self.xmax.delete(0, tk.END); self.xmax.insert(0, xmax)
        self.ymin.delete(0, tk.END); self.ymin.insert(0, ymin)
        self.ymax.delete(0, tk.END); self.ymax.insert(0, ymax)
        self._on_analizar()

    def _on_analizar(self):
        expr = self.func_var.get().strip()
        if not expr:
            self._mostrar_error("Por favor ingresa una función f(x, y).")
            return
        try:
            xmin = float(self.xmin.get())
            xmax = float(self.xmax.get())
            ymin = float(self.ymin.get())
            ymax = float(self.ymax.get())
            if xmin >= xmax or ymin >= ymax:
                raise ValueError("Rangos inválidos: se requiere min < max")
        except ValueError as ve:
            self._mostrar_error(str(ve))
            return

        try:
            resultado = analizar_funcion(expr, xmin, xmax, ymin, ymax)
        except Exception as e:
            self._mostrar_error(f"Error al parsear la función:\n{e}")
            return

        # Mostrar proceso
        self._mostrar_proceso(resultado["proceso"], resultado["criticos"])

        # Graficar
        try:
            graficar(self.ax, self.fig, resultado, xmin, xmax, ymin, ymax)
        except Exception as e:
            self._mostrar_error(f"Error al graficar:\n{e}")

    def _mostrar_proceso(self, texto, criticos):
        self.txt_proceso.config(state="normal")
        self.txt_proceso.delete("1.0", tk.END)
        self.txt_proceso.insert(tk.END, texto, "normal")

        # Colorear líneas clave
        for c in criticos:
            tag = {"Máximo local":"max","Mínimo local":"min",
                   "Punto de silla":"silla"}.get(c["tipo"], "normal")
            # Buscar y colorear la línea del emoji
            start = "1.0"
            while True:
                pos = self.txt_proceso.search(c["emoji"], start, tk.END)
                if not pos:
                    break
                line_start = pos.split(".")[0] + ".0"
                line_end   = pos.split(".")[0] + ".end"
                self.txt_proceso.tag_add(tag, line_start, line_end)
                start = pos + "+1c"

        self.txt_proceso.config(state="disabled")
        self.txt_proceso.see("1.0")

    def _mostrar_error(self, msg):
        self.txt_proceso.config(state="normal")
        self.txt_proceso.delete("1.0", tk.END)
        self.txt_proceso.insert(tk.END, f"⚠  {msg}", "error")
        self.txt_proceso.config(state="disabled")


# ─────────────────────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app = App()
    app.mainloop()
