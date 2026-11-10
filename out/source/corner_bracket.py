"""2020 알루미늄 프로파일용 L자 코너 브래킷 - 3D 모델 + 2D 도면(DXF, A4, 1:1, 제3각법)

좌표: X = 수평 날개 길이 방향, Y = 폭, Z = 높이. 원점 = 바깥 모서리(꺾인 부분) 앞쪽 아래.
사용: python corner_bracket.py <출력폴더>
"""
import math, sys, datetime
import numpy as np
import cadquery as cq
import ezdxf
from ezdxf.enums import TextEntityAlignment as TA
from OCP.HLRBRep import HLRBRep_Algo, HLRBRep_HLRToShape
from OCP.HLRAlgo import HLRAlgo_Projector
from OCP.gp import gp_Ax2, gp_Pnt, gp_Dir

L, W, T = 40.0, 20.0, 4.0        # 날개 40x40, 폭 20, 두께 4
HOLE_D = 5.5                     # M5 볼트용 관통 구멍 (ISO 273 / KS B 1007 중급 5.5)
HOLE_POS = 20.0                  # 날개 끝(가장자리)에서 구멍 중심까지
HOLE_Y = W / 2                   # 폭 방향 중앙

# ---------------- 3D 모델 ----------------
prof = (cq.Workplane("XZ").polyline([(0, 0), (L, 0), (L, T), (T, T), (T, L), (0, L)]).close())
body = prof.extrude(-W)          # XZ 평면 법선이 -Y 이므로 -W → +Y 방향으로 20
body = body.cut(cq.Workplane("XY").workplane(offset=-1).center(L - HOLE_POS, HOLE_Y)
                .circle(HOLE_D / 2).extrude(T + 2))
body = body.cut(cq.Workplane("YZ").workplane(offset=-1).center(HOLE_Y, L - HOLE_POS)
                .circle(HOLE_D / 2).extrude(T + 2))
solid = body.val()
assert solid.isValid()
bb = solid.BoundingBox()
assert (round(bb.xlen, 3), round(bb.ylen, 3), round(bb.zlen, 3)) == (L, W, L), (bb.xlen, bb.ylen, bb.zlen)

# ---------------- 2D 도면 ----------------
doc = ezdxf.new("R2018", setup=True, units=ezdxf.units.MM)
doc.header["$LTSCALE"] = 1.0
doc.header["$INSUNITS"] = 4
msp = doc.modelspace()
for name, color, lt, lw in [("외형선", 7, "CONTINUOUS", 50), ("숨은선", 3, "HIDDEN2", 35),
                            ("중심선", 1, "CENTER2", 25), ("치수", 4, "CONTINUOUS", 25),
                            ("문자", 7, "CONTINUOUS", 25), ("윤곽선", 7, "CONTINUOUS", 70),
                            ("표제란", 7, "CONTINUOUS", 35)]:
    doc.layers.add(name, color=color, linetype=lt, lineweight=lw)
doc.styles.add("KOR", font="malgun.ttf")
ds = doc.dimstyles.new("KS", dxfattribs={
    "dimtxsty": "KOR", "dimtxt": 3.15, "dimasz": 3.0, "dimexe": 2.0, "dimexo": 1.0, "dimgap": 0.8,
    "dimtad": 1, "dimtih": 0, "dimtoh": 0, "dimdec": 1, "dimzin": 8, "dimlunit": 2, "dimclrd": 4,
    "dimclre": 4, "dimclrt": 4, "dimblk": "", "dimtofl": 1, "dimlfac": 1.0})

def project(shape, n, xdir, ox, oy):
    algo = HLRBRep_Algo(); algo.Add(shape.wrapped)
    algo.Projector(HLRAlgo_Projector(gp_Ax2(gp_Pnt(0, 0, 0), gp_Dir(*n), gp_Dir(*xdir))))
    algo.Update(); algo.Hide()
    h = HLRBRep_HLRToShape(algo)
    vis = [e for c in (h.VCompound(), h.OutLineVCompound()) if c is not None and not c.IsNull()
           for e in cq.Shape.cast(c).Edges()]
    for e in vis:
        emit(e, "외형선", ox, oy)
    allv = cq.Compound.makeCompound(vis)
    for c in (h.HCompound(), h.OutLineHCompound()):
        if c is None or c.IsNull():
            continue
        for e in cq.Shape.cast(c).Edges():
            pts = [e.positionAt(t) for t in (0.1, 0.5, 0.9)]
            if all(allv.distance(cq.Vertex.makeVertex(*p.toTuple())) < 1e-3 for p in pts):
                continue                       # 외형선과 겹치는 숨은선 생략
            emit(e, "숨은선", ox, oy)

def emit(e, layer, ox, oy):
    p = lambda v: (round(v.x + ox, 6), round(v.y + oy, 6))
    if e.geomType() == "LINE":
        a, b = p(e.startPoint()), p(e.endPoint())
        if math.dist(a, b) > 1e-4:
            msp.add_line(a, b, dxfattribs={"layer": layer})
    elif e.geomType() == "CIRCLE":
        c, r = p(e.arcCenter()), e.radius()
        s, m, t = p(e.startPoint()), p(e.positionAt(0.5)), p(e.endPoint())
        if math.dist(s, t) < 1e-4:
            msp.add_circle(c, r, dxfattribs={"layer": layer}); return
        ang = lambda q: math.degrees(math.atan2(q[1] - c[1], q[0] - c[0])) % 360
        a0, am, a1 = ang(s), ang(m), ang(t)
        if not ((am - a0) % 360 < (a1 - a0) % 360):
            a0, a1 = a1, a0
        msp.add_arc(c, r, a0, a1, dxfattribs={"layer": layer})
    else:
        msp.add_lwpolyline([p(v) for v in e.positions(np.linspace(0, 1, 30))], dxfattribs={"layer": layer})

def line(a, b, layer):
    msp.add_line(a, b, dxfattribs={"layer": layer})

def text(s, at, h=3.15, align=TA.MIDDLE_CENTER, layer="문자"):
    msp.add_text(s, height=h, dxfattribs={"layer": layer, "style": "KOR"}).set_placement(at, align=align)

def dim(p1, p2, base, angle=0):
    msp.add_linear_dim(base=base, p1=p1, p2=p2, angle=angle, dimstyle="KS",
                       dxfattribs={"layer": "치수"}).render()

def hole_note(center, r, to, s):
    a = math.atan2(to[1] - center[1], to[0] - center[0])
    tip = (center[0] + r * math.cos(a), center[1] + r * math.sin(a))
    side = 1 if to[0] >= center[0] else -1
    msp.add_leader([tip, to, (to[0] + side * 22, to[1])], dimstyle="KS", dxfattribs={"layer": "치수"})
    text(s, (to[0] + side * 1, to[1] + 0.8), align=TA.BOTTOM_LEFT if side > 0 else TA.BOTTOM_RIGHT, layer="치수")

def cross(c, ext):
    line((c[0] - ext, c[1]), (c[0] + ext, c[1]), "중심선")
    line((c[0], c[1] - ext), (c[0], c[1] + ext), "중심선")

# 배치 (A4 가로 297x210, 1:1, 제3각법: 평면도는 정면도 위, 우측면도는 정면도 오른쪽)
FX, FY = 45, 78          # 정면도: 바깥 모서리
TX, TY = FX, FY + L + 30  # 평면도
SX, SY = FX + L + 40, FY  # 우측면도
r = HOLE_D / 2

# 정면도 (앞 -Y 에서 봄)
project(solid, (0, -1, 0), (1, 0, 0), FX, FY)
hx = FX + L - HOLE_POS; hz = FY + L - HOLE_POS
line((hx, FY - 2), (hx, FY + T + 2), "중심선")          # 수평 날개 구멍 중심선
line((FX - 2, hz), (FX + T + 2, hz), "중심선")          # 수직 날개 구멍 중심선
dim((FX, FY), (FX + L, FY), base=(0, FY - 12))                          # 40
dim((FX, FY), (FX, FY + L), base=(FX - 12, 0), angle=90)                # 40
dim((FX + L, FY), (FX + L, FY + T), base=(FX + L + 8, 0), angle=90)     # 4 (수평 날개)
dim((FX, FY + L), (FX + T, FY + L), base=(0, FY + L + 8))               # 4 (수직 날개)
text("정면도", (FX + L / 2, FY - 24), h=3.5)

# 평면도 (위 +Z 에서 봄)
project(solid, (0, 0, 1), (1, 0, 0), TX, TY)
hc = (TX + L - HOLE_POS, TY + HOLE_Y)
cross(hc, r + 3)
line((TX - 2, TY + HOLE_Y), (TX + T + 2, TY + HOLE_Y), "중심선")       # 수직 날개 구멍(숨은선) 중심선
dim((TX + L, TY), (TX + L, TY + W), base=(TX + L + 18, 0), angle=90)   # 폭 20
dim((TX + L, TY), (hc[0], hc[1]), base=(TX + L + 8, 0), angle=90)      # 10
dim((hc[0], hc[1]), (TX + L, TY + W), base=(0, TY + W + 8))            # 20 (끝에서)
hole_note(hc, r, (hc[0] + 12, TY - 9), "%%c5.5 관통")
text("평면도", (TX + L / 2, TY + W + 20), h=3.5)

# 우측면도 (오른쪽 +X 에서 봄, 가로축 = +Y)
project(solid, (1, 0, 0), (0, 1, 0), SX, SY)
sc = (SX + HOLE_Y, SY + L - HOLE_POS)
cross(sc, r + 3)
line((SX + HOLE_Y, SY - 2), (SX + HOLE_Y, SY + T + 2), "중심선")       # 수평 날개 구멍(숨은선) 중심선
dim((sc[0], sc[1]), (SX + W, SY + L), base=(SX + W + 8, 0), angle=90)  # 20 (끝에서)
dim((SX, SY + L), (sc[0], sc[1]), base=(0, SY + L + 8))                # 10
hole_note(sc, r, (sc[0] + 14, sc[1] - 12), "%%c5.5 관통")
text("우측면도", (SX + W / 2, FY - 24), h=3.5)

# 윤곽선 (A4 가로, 여백 10) + 중심 마크
PW, PH, M = 297, 210, 10
msp.add_lwpolyline([(M, M), (PW - M, M), (PW - M, PH - M), (M, PH - M)], close=True, dxfattribs={"layer": "윤곽선"})
for a, b in [((PW / 2, 0 + 5), (PW / 2, M)), ((PW / 2, PH - M), (PW / 2, PH - 5)),
             ((5, PH / 2), (M, PH / 2)), ((PW - M, PH / 2), (PW - 5, PH / 2))]:
    line(a, b, "윤곽선")

# 표제란 (오른쪽 아래)
BW, RH = 130, 8
bx0, by0 = PW - M - BW, M
rows = [("작성일", datetime.date.today().isoformat(), "단위", "mm"),
        ("척도", "1:1", "투상법", "제3각법"),
        ("재질", "AL6061", "수량", "16"),
        ("품명", "코너 브래킷", "", "")]
cols = [0, 22, 65, 87, BW]
msp.add_lwpolyline([(bx0, by0), (bx0 + BW, by0), (bx0 + BW, by0 + RH * len(rows)), (bx0, by0 + RH * len(rows))],
                   close=True, dxfattribs={"layer": "윤곽선"})
for i, row in enumerate(rows):
    y = by0 + i * RH
    if i:
        line((bx0, y), (bx0 + BW, y), "표제란")
    xs = cols if row[2] else [0, 22, BW]
    for x in xs[1:-1]:
        line((bx0 + x, y), (bx0 + x, y + RH), "표제란")
    cells = row if row[2] else row[:2]
    for j, s in enumerate(cells):
        if s == "제3각법":
            text(s, (bx0 + xs[j] + 13, y + RH / 2)); continue
        text(s, (bx0 + (xs[j] + xs[j + 1]) / 2, y + RH / 2), h=4.0 if s == "코너 브래킷" else 3.15)
# 제3각법 기호 (원뿔대: 왼쪽 정면 사다리꼴, 오른쪽 원 2개)
sx, sy = bx0 + 120, by0 + RH * 1 + RH / 2
msp.add_lwpolyline([(sx - 9, sy + 2.5), (sx - 3, sy + 1.4), (sx - 3, sy - 1.4), (sx - 9, sy - 2.5)], close=True,
                   dxfattribs={"layer": "표제란"})
msp.add_circle((sx + 3, sy), 2.5, dxfattribs={"layer": "표제란"})
msp.add_circle((sx + 3, sy), 1.4, dxfattribs={"layer": "표제란"})
line((sx - 10, sy), (sx + 6.5, sy), "중심선")
line((sx + 3, sy - 3.5), (sx + 3, sy + 3.5), "중심선")
# 주서
text("주서", (M + 8, M + 26), h=3.5, align=TA.BOTTOM_LEFT)
text("1. %%c5.5 관통 구멍은 M5 볼트용 (2020 프로파일 T너트 체결)", (M + 8, M + 19), align=TA.BOTTOM_LEFT)
text("2. 지시 없는 치수 단위: mm", (M + 8, M + 13), align=TA.BOTTOM_LEFT)

if __name__ == "__main__":
    out = sys.argv[1]
    doc.saveas(f"{out}/corner-bracket.dxf")
    cq.exporters.export(body, f"{out}/corner-bracket.step")
    cq.exporters.export(body, f"{out}/corner-bracket.stl", tolerance=0.01, angularTolerance=0.1)
    print("volume", round(solid.Volume(), 2), "bbox", bb.xlen, bb.ylen, bb.zlen)
    a = doc.audit(); print("audit errors", len(a.errors))
    # 미리보기 (미리보기 렌더러용으로만 나눔고딕 사용)
    doc.styles.get("KOR").dxf.font = "NanumGothic.ttf"
    import matplotlib; matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from ezdxf.addons.drawing import RenderContext, Frontend
    from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
    from ezdxf.addons.drawing.config import Configuration, BackgroundPolicy, ColorPolicy
    fig = plt.figure(figsize=(297 / 25.4, 210 / 25.4)); ax = fig.add_axes([0, 0, 1, 1])
    Frontend(RenderContext(doc), MatplotlibBackend(ax),
             config=Configuration(background_policy=BackgroundPolicy.WHITE, color_policy=ColorPolicy.BLACK,
                                  lineweight_scaling=0.8)).draw_layout(msp)
    ax.set_xlim(0, 297); ax.set_ylim(0, 210); ax.set_aspect("equal")
    fig.savefig(f"{out}/corner-bracket.pdf", facecolor="white")
    fig.savefig(f"{out}/corner-bracket.png", dpi=200, facecolor="white")
