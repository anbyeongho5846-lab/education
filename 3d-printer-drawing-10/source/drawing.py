"""3D 모델에서 은선처리(HLR) 투영으로 2D 도면(DXF) 생성 + 치수 기입."""
import math, sys
import numpy as np
import cadquery as cq
import ezdxf
from ezdxf.enums import TextEntityAlignment
from OCP.HLRBRep import HLRBRep_Algo, HLRBRep_HLRToShape
from OCP.HLRAlgo import HLRAlgo_Projector
from OCP.gp import gp_Ax2, gp_Pnt, gp_Dir

sys.path.insert(0, sys.argv[1])
import build as B

doc = ezdxf.new("R2018", setup=True, units=ezdxf.units.MM)
msp = doc.modelspace()
doc.layers.add("VISIBLE", color=7, lineweight=50)
doc.layers.add("HIDDEN", color=3, linetype="HIDDEN", lineweight=25)
doc.layers.add("CENTER", color=1, linetype="CENTER", lineweight=18)
doc.layers.add("DIM", color=4, lineweight=18)
doc.layers.add("HATCH", color=8, lineweight=13)
doc.layers.add("TEXT", color=7)
doc.header["$LTSCALE"] = 0.3
doc.styles.add("KOR", font="malgun.ttf")
ds = doc.dimstyles.get("EZDXF")
ds.dxf.dimtxt = 2.5; ds.dxf.dimasz = 2.0; ds.dxf.dimexe = 1.0; ds.dxf.dimexo = 0.8; ds.dxf.dimgap = 0.6
ds.dxf.dimdec = 1; ds.dxf.dimzin = 8; ds.dxf.dimtad = 1; ds.dxf.dimtih = 0; ds.dxf.dimtoh = 0

# ---------- HLR 투영 ----------
def project(shape, n, xdir, ox, oy, hidden=True):
    algo = HLRBRep_Algo(); algo.Add(shape.wrapped)
    algo.Projector(HLRAlgo_Projector(gp_Ax2(gp_Pnt(0, 0, 0), gp_Dir(*n), gp_Dir(*xdir))))
    algo.Update(); algo.Hide()
    h = HLRBRep_HLRToShape(algo)
    vis = [cq.Shape.cast(c) for c in (h.VCompound(), h.OutLineVCompound()) if c is not None and not c.IsNull()]
    vis_edges = [e for c in vis for e in c.Edges()]
    for e in vis_edges:
        emit(e, "VISIBLE", ox, oy)
    if not hidden:
        return
    vis_all = cq.Compound.makeCompound(vis_edges)
    for c in (h.HCompound(), h.OutLineHCompound()):
        if c is None or c.IsNull():
            continue
        for e in cq.Shape.cast(c).Edges():
            # 실선과 겹치는 숨은선은 생략
            pts = [e.positionAt(t) for t in (0.1, 0.35, 0.5, 0.65, 0.9)]
            if all(vis_all.distance(cq.Vertex.makeVertex(*p.toTuple())) < 1e-3 for p in pts):
                continue
            emit(e, "HIDDEN", ox, oy)

def emit(e, layer, ox, oy):
    p = lambda v: (v.x + ox, v.y + oy)
    gt = e.geomType()
    if gt == "LINE":
        a, b = p(e.startPoint()), p(e.endPoint())
        if math.dist(a, b) > 1e-4:
            msp.add_line(a, b, dxfattribs={"layer": layer})
    elif gt == "CIRCLE":
        c = p(e.arcCenter()); r = e.radius()
        s, m, t = p(e.startPoint()), p(e.positionAt(0.5)), p(e.endPoint())
        if math.dist(s, t) < 1e-4:
            msp.add_circle(c, r, dxfattribs={"layer": layer}); return
        ang = lambda q: math.degrees(math.atan2(q[1] - c[1], q[0] - c[0])) % 360
        a0, am, a1 = ang(s), ang(m), ang(t)
        if not ((am - a0) % 360 < (a1 - a0) % 360):   # 반시계 방향으로 맞춤
            a0, a1 = a1, a0
        msp.add_arc(c, r, a0, a1, dxfattribs={"layer": layer})
    else:
        pts = [p(v) for v in e.positions(np.linspace(0, 1, 40))]
        msp.add_lwpolyline(pts, dxfattribs={"layer": layer})

def cl(a, b):  # 중심선
    msp.add_line(a, b, dxfattribs={"layer": "CENTER"})

def cross(c, r):
    cl((c[0] - r, c[1]), (c[0] + r, c[1])); cl((c[0], c[1] - r), (c[0], c[1] + r))

def txt(s, at, h=2.5, rot=0, align=TextEntityAlignment.MIDDLE_CENTER, layer="TEXT"):
    msp.add_text(s, height=h, rotation=rot, dxfattribs={"layer": layer, "style": "KOR"}).set_placement(at, align=align)

def lin(p1, p2, base, angle=0, text="<>"):
    msp.add_linear_dim(base=base, p1=p1, p2=p2, angle=angle, text=text, dimstyle="EZDXF",
                       dxfattribs={"layer": "DIM"}).render()

def dia(c, r, ang, text, loc=None):
    msp.add_diameter_dim(center=c, radius=r, angle=ang, text=text, dimstyle="EZDXF", location=loc,
                         dxfattribs={"layer": "DIM"}).render()

def rad(c, r, ang, text, loc=None):
    msp.add_radius_dim(center=c, radius=r, angle=ang, text=text, dimstyle="EZDXF", location=loc,
                       dxfattribs={"layer": "DIM"}).render()

def leader(pts, text, side=1):
    msp.add_leader(pts, dimstyle="EZDXF", dxfattribs={"layer": "DIM"})
    end = pts[-1]
    txt(text, (end[0] + side * 0.8, end[1] + 0.6), align=TextEntityAlignment.BOTTOM_LEFT if side > 0 else TextEntityAlignment.BOTTOM_RIGHT, layer="DIM")

def callout(c, r, loc, text):
    a = math.atan2(loc[1] - c[1], loc[0] - c[0])
    tip = (c[0] + r * math.cos(a), c[1] + r * math.sin(a))
    side = 1 if loc[0] >= c[0] else -1
    msp.add_line(c, tip, dxfattribs={"layer": "DIM"}) if text.startswith("%%c") else None
    leader([tip, loc, (loc[0] + side * 5, loc[1])], text, side=side)

part1 = B.build_part1(engrave=False).val()     # 도면용(각인 제외)
part2 = B.part2.val()

# ===================== 부품 ① =====================
TX, TY = 0, 0           # 평면도 원점(보스 중심)
project(part1, (0, 0, 1), (1, 0, 0), TX, TY)
cross((TX, TY), 12); cross((TX + 33, TY), 18)
# 단면 지시선 A-A
cl((TX - 14, TY), (TX + 52, TY))
for x in (TX - 14, TX + 52):
    msp.add_lwpolyline([(x, TY), (x, TY - 1.5)], dxfattribs={"layer": "VISIBLE", "const_width": 0.5})
    msp.add_line((x, TY - 1.5), (x, TY - 6), dxfattribs={"layer": "DIM"})
    msp.add_solid([(x - 0.9, TY - 3.5), (x + 0.9, TY - 3.5), (x, TY - 1.2)], dxfattribs={"layer": "DIM"})
    txt("A", (x + (-2.5 if x < TX else 2.5), TY - 5), h=3.5)
callout((TX, TY), 4, (TX - 24, TY + 5), "%%c8")
callout((TX, TY), 6, (TX - 22, TY + 11), "%%c12")
callout((TX, TY), 8, (TX - 13, TY + 19), "%%c16")
callout((TX, TY), 10.5, (TX + 7, TY + 21), "R10.5")
callout((TX, TY), 17.5, (TX + 20, TY + 21), "R17.5")
callout((TX + 33, TY), 15, (TX + 46, TY + 21), "R15")
callout((TX + 33, TY), 10, (TX + 56, TY + 15), "%%c20")
lin((TX, TY), (TX + 33, TY), base=(0, TY - 20), text="33")
# 2-R1 : 필렛 면(원통 R1)의 중심 찾아 지시
fc = None
for f in part1.Faces():
    if f.geomType() != "CYLINDER":
        continue
    circ = [e for e in f.Edges() if e.geomType() == "CIRCLE" and abs(e.radius() - 1.0) < 1e-3]
    if circ:
        c = circ[0].arcCenter()
        if c.y < 0:
            fc = (c.x, c.y)
if fc:
    leader([(TX + fc[0] - 0.7, TY + fc[1] - 0.7), (TX + fc[0] - 6, TY + fc[1] - 7), (TX + fc[0] - 14, TY + fc[1] - 7)], "2-R1", side=-1)
txt("①", (TX - 22, TY + 16), h=5)

# 단면 A-A : y<0 쪽 제거 후 앞(-Y)에서 투영
SX, SY = 0, -42
half = part1.cut(cq.Solid.makeBox(200, 100, 100, pnt=cq.Vector(-50, -100, -10)))
project(half, (0, -1, 0), (1, 0, 0), SX, SY, hidden=False)
for f in half.Faces():                       # 절단면 해칭
    if f.geomType() == "PLANE" and abs(f.Center().y) < 1e-6 and abs(f.normalAt().y) > 0.99:
        h = msp.add_hatch(dxfattribs={"layer": "HATCH"}); h.set_pattern_fill("ANSI31", scale=0.5)
        for w in [f.outerWire()] + f.innerWires():
            pts = []
            for e in w.Edges():
                pts += [(v.x + SX, v.z + SY) for v in e.positions(np.linspace(0, 1, 8))]
            h.paths.add_polyline_path(pts, is_closed=True)
cl((SX, SY - 3), (SX, SY + 17)); cl((SX + 33, SY - 3), (SX + 33, SY + 13))
lin((SX - 8, SY), (SX - 8, SY + 4), base=(SX - 13, 0), angle=90, text="4")
lin((SX - 8, SY + 4), (SX - 8, SY + 14), base=(SX - 13, 0), angle=90, text="10")
lin((SX + 48, SY), (SX + 48, SY + 10), base=(SX + 53, 0), angle=90, text="10")
lin((SX + 14, SY + 7), (SX + 14, SY + 10), base=(SX + 14, 0), angle=90, text="3")
lin((SX - 4, SY + 14), (SX + 4, SY + 14), base=(0, SY + 18), text="%%c8")
lin((SX - 6, SY), (SX + 6, SY), base=(0, SY - 5), text="%%c12")
leader([(SX + 33 - 11.5, SY + 8.5), (SX + 33 - 16, SY + 15), (SX + 33 - 12, SY + 15)], "C3")
txt("단면 A-A", (SX + 20, SY - 11), h=3.5)

# ===================== 부품 ② =====================
FX, FY = 110, -5        # 정면도 (z=0 : 크로스바 아랫면)
project(part2, (0, -1, 0), (1, 0, 0), FX, FY)
cl((FX, FY - 16), (FX, FY + 17))
lin((FX - 17, FY + 5), (FX - 17, FY + 14), base=(FX - 23, 0), angle=90, text="9")
lin((FX - 17, FY), (FX - 17, FY + 5), base=(FX - 23, 0), angle=90, text="5")
lin((FX - 17, FY - 12), (FX - 17, FY), base=(FX - 23, 0), angle=90, text="12")
lin((FX + 17, FY - 7), (FX + 17, FY), base=(FX + 22, 0), angle=90, text="7")
lin((FX + 4, FY - 10), (FX + 4, FY), base=(FX + 8, 0), angle=90, text="B=10")
lin((FX + 6, FY - 13), (FX + 6, FY - 10), base=(FX + 13, 0), angle=90, text="3")
lin((FX - 5, FY + 14), (FX + 5, FY + 14), base=(0, FY + 18), text="%%c10")
lin((FX - 4, FY - 13), (FX + 4, FY - 13), base=(0, FY - 17), text="A=%%c8")
lin((FX - 6, FY - 13), (FX + 6, FY - 13), base=(0, FY - 22), text="%%c12")
leader([(FX - 4.1, FY + 12.9), (FX - 8, FY + 19), (FX - 11, FY + 19)], "R3", side=-1)
txt("②", (FX - 28, FY + 20), h=5)

PX, PY = 110, -45       # 평면도
project(part2, (0, 0, 1), (1, 0, 0), PX, PY)
cross((PX, PY), 20)
msp.add_circle((PX, PY), 17, dxfattribs={"layer": "CENTER"})
lin((PX + 17, PY - 3), (PX + 17, PY + 3), base=(PX + 22, 0), angle=90, text="6")
callout((PX, PY), 5, (PX - 14, PY + 12), "%%c10")
callout((PX, PY), 11, (PX - 20, PY - 16), "R11")
callout((PX, PY), 17, (PX + 18, PY - 18), "R17")

# 표제
txt("3D프린터운용기능사 공개도면 ⑩ - 3D모델링작업 (재작성)   척도 NS   단위 mm", (55, 32), h=3.5)
txt("메모 반영: A=%%c8, B=10, 칼라 %%c12 / 각인 '01'은 3D 모델에만 적용(높이5, 깊이0.5 임의)", (55, 27), h=2.2)

out = sys.argv[2]
doc.saveas(out)
print("saved", out, "entities", len(msp))

# 미리보기 PNG/PDF
doc.styles.get("KOR").dxf.font = "NanumGothic.ttf"   # 미리보기 전용 (DXF 파일은 malgun.ttf로 저장됨)
from ezdxf.fonts import fonts as _fonts
_fonts.build_font_manager_cache(_fonts._get_font_manager_path()) if hasattr(_fonts, "_get_font_manager_path") else None
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from ezdxf.addons.drawing import RenderContext, Frontend
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
fig = plt.figure(figsize=(16, 11)); ax = fig.add_axes([0, 0, 1, 1])
from ezdxf.addons.drawing.config import Configuration, BackgroundPolicy, ColorPolicy
cfg = Configuration(background_policy=BackgroundPolicy.WHITE, color_policy=ColorPolicy.BLACK, lineweight_scaling=0.6)
ctx = RenderContext(doc); ctx.current_layout_properties.set_colors("#ffffff")
Frontend(ctx, MatplotlibBackend(ax), config=cfg).draw_layout(msp)
ax.set_aspect("equal"); fig.savefig(out.replace(".dxf", ".png"), dpi=120, facecolor="white")
fig.savefig(out.replace(".dxf", ".pdf"), facecolor="white")
