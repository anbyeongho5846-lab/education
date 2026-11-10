"""3D프린터운용기능사 공개도면 ⑩ - 부품 ①, ② 모델링 (CadQuery)
단위 mm.  부품① 원점 = 왼쪽 보스 중심, 바닥면.  부품② 원점 = 축 중심, 크로스바 아랫면.
"""
import math
import cadquery as cq

def chk(tag, wp):
    ok = wp.val().isValid()
    print(f"  {tag:<28} valid={ok}")
    return wp

# ---------------- 부품 ① ----------------
C = 33.0                       # 두 중심 거리 33
R_BOSS = 8.0                   # Ø16 보스
R_RING = 15.0                  # R15
H_BODY = 10.0                  # ㉠ 10
H_BOSS = 14.0                  # 10 + 4
D_HOLE = 8.0                   # Ø8 관통
D_CB, H_CB = 12.0, 4.0         # Ø12 (숨은선) 아래쪽 카운터보어, 깊이 4
D_RING_HOLE = 20.0             # Ø20
CH = 3.0                       # C3
G_IN, G_OUT, G_DEPTH = 10.5, 17.5, 3.0   # R10.5 ~ R17.5 원호 홈, 깊이 3
FIL = 1.0                      # 2-R1

a = math.asin((R_RING - R_BOSS) / C)     # 외접선 각
p1 = (-R_BOSS * math.sin(a), R_BOSS * math.cos(a))
p2 = (C - R_RING * math.sin(a), R_RING * math.cos(a))

def outline_sketch():
    return (cq.Workplane("XY")
            .moveTo(p1[0], -p1[1])
            .threePointArc((-R_BOSS, 0), (p1[0], p1[1]))
            .lineTo(*p2)
            .threePointArc((C + R_RING, 0), (p2[0], -p2[1]))
            .close())

def build_part1(engrave=True):
    print("part1")
    body = outline_sketch().extrude(H_BODY)
    body = body.union(cq.Workplane("XY").workplane(offset=H_BODY).circle(R_BOSS).extrude(H_BOSS - H_BODY), clean=False)
    chk("base+boss", body)
    groove = (cq.Workplane("XY").workplane(offset=H_BODY - G_DEPTH)
              .circle(G_OUT).circle(G_IN).extrude(G_DEPTH + 5))
    body = chk("groove", body.cut(groove, clean=False))

    def corner(e):
        bb = e.BoundingBox()
        if bb.zlen < 0.5 or bb.xlen > 1e-3 or bb.ylen > 1e-3:
            return False
        return abs(math.hypot(bb.center.x, bb.center.y) - G_OUT) < 0.05 and abs(bb.center.y) > 5
    edges = [e for e in body.val().Edges() if corner(e)]
    assert len(edges) == 2, len(edges)
    body = chk("2-R1", cq.Workplane("XY").add(body.val().fillet(FIL, edges)))

    body = body.cut(cq.Workplane("XY").workplane(offset=-1).circle(D_HOLE / 2).extrude(H_BOSS + 2), clean=False)
    body = chk("cbore", body.cut(cq.Workplane("XY").workplane(offset=-1).circle(D_CB / 2).extrude(H_CB + 1), clean=False))

    # Ø20 관통 + C3 : XZ 단면 프로파일을 회전시켜 한번에 절삭
    r0, r1 = D_RING_HOLE / 2, D_RING_HOLE / 2 + CH
    prof = (cq.Workplane("XZ", origin=(C, 0, 0))
            .polyline([(0, -1), (r0, -1), (r0, H_BODY - CH), (r1 + 1, H_BODY + 1), (0, H_BODY + 1)]).close()
            .revolve(360, (0, 0, 0), (0, 1, 0)))
    body = chk("ring hole + C3", body.cut(prof, clean=False))

    if engrave:
        # "01" 음각 - 글자 크기/깊이는 도면에 없음 → 높이 5, 깊이 0.5 (임의)
        tx, ty = math.cos(a), -math.sin(a)        # 앞쪽(-Y) 측면 방향
        nx, ny = -math.sin(a), -math.cos(a)       # 바깥 법선
        xm = 25.0
        s = (xm - p1[0]) / (p2[0] - p1[0])
        fx = p1[0] + s * (p2[0] - p1[0]); fy = -(p1[1] + s * (p2[1] - p1[1]))
        pl = cq.Plane(origin=(fx, fy, H_BODY / 2), xDir=(tx, ty, 0), normal=(nx, ny, 0))
        txt = cq.Workplane(pl).text("01", 5.0, -0.5, combine=False, halign="center", valign="center", kind="bold")
        body = chk("engrave 01", body.cut(txt, clean=False))
    return body

# ---------------- 부품 ② ----------------
R_IN2, R_OUT2 = 11.0, 17.0     # R11 ~ R17
W2 = 6.0                       # ㉢ 6
T_BAR = 5.0                    # 5
H_TOP = 9.0                    # 9
D_TOP = 10.0                   # ㉡ Ø10, R3
A = 8.0                        # A = 8 (메모)
B = 10.0                       # B = 10 (부품① Ø8 구멍 길이 14-4)
D_COL, T_COL = 12.0, 3.0       # 칼라 Ø12 (메모) × 3
LEG_L, LEG_R = 12.0, 7.0       # 다리 12 / 7

def build_part2():
    print("part2")
    band = lambda z0, h: cq.Workplane("XY").workplane(offset=z0).rect(2 * R_OUT2 + 2, W2).extrude(h)
    bar = band(0, T_BAR).intersect(cq.Workplane("XY").circle(R_OUT2).extrude(T_BAR))
    def leg(h, side):
        ring = cq.Workplane("XY").workplane(offset=-h).circle(R_OUT2).circle(R_IN2).extrude(h)
        half = cq.Workplane("XY").workplane(offset=-h).center(side * 20, 0).rect(40, 40).extrude(h)
        return ring.intersect(band(-h, h)).intersect(half)
    top = (cq.Workplane("XY").workplane(offset=T_BAR).circle(D_TOP / 2).extrude(H_TOP)
           .faces(">Z").edges().fillet(3.0))
    shaft = cq.Workplane("XY").workplane(offset=-B).circle(A / 2).extrude(B + T_BAR)
    collar = cq.Workplane("XY").workplane(offset=-B - T_COL).circle(D_COL / 2).extrude(T_COL)
    p = bar.union(leg(LEG_L, -1)).union(leg(LEG_R, +1)).union(top).union(shaft).union(collar)
    return chk("part2", p)

part1 = build_part1()
part2 = build_part2()

if __name__ == "__main__":
    import sys
    out = sys.argv[1]
    for name, p in (("part1", part1), ("part2", part2)):
        s = p.val(); bb = s.BoundingBox()
        print(name, "solids", len(p.solids().vals()), "vol %.1f" % s.Volume(),
              "bbox", [round(v, 2) for v in (bb.xmin, bb.xmax, bb.ymin, bb.ymax, bb.zmin, bb.zmax)])
        cq.exporters.export(p, f"{out}/{name}.stl", tolerance=0.01, angularTolerance=0.1)
        cq.exporters.export(p, f"{out}/{name}.step")
    asm = cq.Workplane().add(part1.val()).add(part2.translate((0, 0, H_BOSS)).val())
    cq.exporters.export(asm, f"{out}/assembly.stl", tolerance=0.01, angularTolerance=0.1)
    # 간섭 체크
    inter = part1.val().intersect(part2.translate((0, 0, H_BOSS)).val())
    print("interference volume %.3f" % inter.Volume())
