"""
로우폴리 타지마할 + 차르바그 정원 (Blender 4.2+ / 5.x)

사용법
  1) Blender > Scripting 탭 > Open 으로 이 파일을 열고 Run Script
  2) 또는 Blender MCP가 연결된 Claude 대화에서 "이 파일 내용을 execute_blender_code로 실행해줘"

주의: CLEAR_SCENE = True 이면 현재 씬의 모든 오브젝트를 지웁니다.
     기존 작업 파일에서 실행할 때는 False 로 바꾸세요.

규칙
  - 모든 메쉬 오브젝트는 면(face) 32개 이하 (실행 끝에 검사, 초과 시 오류)
  - 카메라: 정면(남쪽)에서 45도 고각, 정원 전체가 화면 안에 들어오도록 거리 자동 계산
  - 조명: 아그라(북위 약 27.2도) 춘분 무렵 오후 2시 태양 위치(고도 약 50도, 남서쪽) + 따뜻한 황금빛
  - 재질: 흰 대리석 / 황금 / 에메랄드 정원 (물은 에메랄드 톤의 청록색)
  - 단위: 1 = 약 10 m (실제 비율을 참고한 양식화 모델)
"""

import math
import os

import bpy
from mathutils import Vector

CLEAR_SCENE = True
MAX_FACES = 32
COLL_NAME = "TajMahal_LowPoly"

scene = bpy.context.scene

# --------------------------------------------------------------------------
# 씬 정리
# --------------------------------------------------------------------------
if CLEAR_SCENE:
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob, do_unlink=True)
if COLL_NAME in bpy.data.collections:
    old = bpy.data.collections[COLL_NAME]
    for ob in list(old.objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    bpy.data.collections.remove(old)
for me in list(bpy.data.meshes):
    if me.users == 0:
        bpy.data.meshes.remove(me)

COLL = bpy.data.collections.new(COLL_NAME)
scene.collection.children.link(COLL)


# --------------------------------------------------------------------------
# 재질
# --------------------------------------------------------------------------
def make_mat(name, color, metallic=0.0, roughness=0.5):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    m.diffuse_color = (*color, 1.0)  # 뷰포트 솔리드 모드 색
    return m


M_MARBLE = make_mat("Marble_White", (0.93, 0.91, 0.86), 0.0, 0.32)
M_MARBLE_SHADE = make_mat("Marble_ArchShade", (0.42, 0.39, 0.35), 0.0, 0.5)
M_PAVING = make_mat("Marble_Paving", (0.80, 0.76, 0.68), 0.0, 0.6)
M_GOLD = make_mat("Gold", (1.0, 0.72, 0.26), 1.0, 0.28)
M_GRASS = make_mat("Emerald_Grass", (0.04, 0.40, 0.20), 0.0, 0.8)
M_TREE = make_mat("Emerald_Tree", (0.02, 0.24, 0.11), 0.0, 0.7)
M_GROUND = make_mat("Emerald_Ground", (0.10, 0.26, 0.13), 0.0, 0.9)
M_WATER = make_mat("Emerald_Water", (0.03, 0.30, 0.28), 0.0, 0.06)


# --------------------------------------------------------------------------
# 메쉬 헬퍼 (모두 직접 정점/면을 지정해 면 수를 통제)
# --------------------------------------------------------------------------
def add_obj(name, verts, faces, mat):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], [], faces)
    me.validate()
    me.update()
    ob = bpy.data.objects.new(name, me)
    ob.data.materials.append(mat)
    COLL.objects.link(ob)
    return ob


def box(name, x0, x1, y0, y1, z0, z1, mat):
    v = [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
         (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]
    f = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4),
         (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    return add_obj(name, v, f, mat)


def box_c(name, cx, cy, sx, sy, z0, z1, mat):
    return box(name, cx - sx / 2, cx + sx / 2, cy - sy / 2, cy + sy / 2, z0, z1, mat)


def poly_prism(name, pts, z0, z1, mat):
    """임의 다각형(반시계) 기둥: 면 = 변 수 + 2"""
    n = len(pts)
    v = [(x, y, z0) for x, y in pts] + [(x, y, z1) for x, y in pts]
    f = [tuple(reversed(range(n))), tuple(range(n, 2 * n))]
    for i in range(n):
        j = (i + 1) % n
        f.append((i, j, n + j, n + i))
    return add_obj(name, v, f, mat)


def prism(name, cx, cy, z0, z1, r0, r1, n, mat, rot=None):
    """n각 기둥/원뿔대/원뿔: 면 = n + 2 (원뿔이면 n + 1)"""
    if rot is None:
        rot = math.pi / n
    ring = [(math.cos(rot + 2 * math.pi * i / n), math.sin(rot + 2 * math.pi * i / n)) for i in range(n)]
    v = [(cx + r0 * c, cy + r0 * s, z0) for c, s in ring]
    f = [tuple(reversed(range(n)))]
    if r1 <= 0:
        v.append((cx, cy, z1))
        for i in range(n):
            f.append((i, (i + 1) % n, n))
    else:
        v += [(cx + r1 * c, cy + r1 * s, z1) for c, s in ring]
        f.append(tuple(range(n, 2 * n)))
        for i in range(n):
            j = (i + 1) % n
            f.append((i, j, n + j, n + i))
    return add_obj(name, v, f, mat)


def revolve(name, cx, cy, profile, n, mat, cap_bottom=False, rot=None):
    """(반지름, 높이) 프로파일 회전체: 면 = n * (구간 수) (+1 바닥)"""
    if rot is None:
        rot = math.pi / n
    v, rings = [], []
    for r, z in profile:
        if r <= 0:
            rings.append([len(v)])
            v.append((cx, cy, z))
        else:
            idx = []
            for i in range(n):
                a = rot + 2 * math.pi * i / n
                idx.append(len(v))
                v.append((cx + r * math.cos(a), cy + r * math.sin(a), z))
            rings.append(idx)
    f = []
    if cap_bottom and len(rings[0]) > 1:
        f.append(tuple(reversed(rings[0])))
    for a, b in zip(rings[:-1], rings[1:]):
        for i in range(n):
            j = (i + 1) % n
            if len(b) == 1:
                f.append((a[i], a[j], b[0]))
            elif len(a) == 1:
                f.append((a[0], b[j], b[i]))
            else:
                f.append((a[i], a[j], b[j], b[i]))
    return add_obj(name, v, f, mat)


def icosahedron(name, cx, cy, cz, r, mat):
    """정이십면체 (면 20)"""
    p = (1 + math.sqrt(5)) / 2
    raw = [(-1, p, 0), (1, p, 0), (-1, -p, 0), (1, -p, 0),
           (0, -1, p), (0, 1, p), (0, -1, -p), (0, 1, -p),
           (p, 0, -1), (p, 0, 1), (-p, 0, -1), (-p, 0, 1)]
    k = r / math.sqrt(1 + p * p)
    v = [(cx + x * k, cy + y * k, cz + z * 0.85 * k) for x, y, z in raw]
    f = [(0, 11, 5), (0, 5, 1), (0, 1, 7), (0, 7, 10), (0, 10, 11),
         (1, 5, 9), (5, 11, 4), (11, 10, 2), (10, 7, 6), (7, 1, 8),
         (3, 9, 4), (3, 4, 2), (3, 2, 6), (3, 6, 8), (3, 8, 9),
         (4, 9, 5), (2, 4, 11), (6, 2, 10), (8, 6, 7), (9, 8, 1)]
    return add_obj(name, v, f, mat)


def wall_panel(name, base, phi, prof, depth, mat):
    """벽면에 붙는 판(아치/사각). base=벽 표면 위 바닥 중앙점, phi=바깥 방향 각도.
    면 = 프로파일 꼭짓점 수 + 2"""
    nx, ny = math.cos(phi), math.sin(phi)
    tx, ty = -ny, nx
    bx, by, bz = base
    back = [(bx + tx * u, by + ty * u, bz + w) for u, w in prof]
    front = [(x + nx * depth, y + ny * depth, z) for x, y, z in back]
    k = len(prof)
    f = [tuple(reversed(range(k))), tuple(range(k, 2 * k))]
    for i in range(k):
        j = (i + 1) % k
        f.append((i, j, k + j, k + i))
    return add_obj(name, back + front, f, mat)


def rect_prof(w, h):
    return [(-w / 2, 0), (w / 2, 0), (w / 2, h), (-w / 2, h)]


def arch_prof(w, h, rise_ratio=0.5):
    """무굴 양식 뾰족 아치 (꼭짓점 9개 → 판 하나당 면 11)"""
    rise = min(w * rise_ratio, h * 0.45)
    hj = h - rise
    pts = []
    for a in (160, 140):
        ar = math.radians(a)
        pts.append((w / 2 + w * math.cos(ar), hj + (math.sin(ar) / math.sin(math.radians(120))) * rise))
    right = [(-x, z) for x, z in reversed(pts)]
    return ([(-w / 2, 0), (w / 2, 0), (w / 2, hj)] + right + [(0, h)]
            + list(reversed(pts)) + [(-w / 2, hj)])


def onto_face(cx, cy, phi, dist, u, z):
    """중심(cx,cy)에서 phi 방향으로 dist 만큼 나간 벽면 위, 접선 방향 u 지점"""
    nx, ny = math.cos(phi), math.sin(phi)
    return (cx + nx * dist - ny * u, cy + ny * dist + nx * u, z)


def gold_arch(name, base, phi, w, h, d0=0.02):
    """금색 테두리 + 어두운 대리석 아치 (2개 오브젝트)"""
    wall_panel(name + "_Gold", base, phi, arch_prof(w * 1.14, h * 1.07), d0, M_GOLD)
    wall_panel(name + "_Arch", base, phi, arch_prof(w, h), d0 + 0.012, M_MARBLE_SHADE)


def chhatri(prefix, x, y, z, s=1.0):
    """작은 돔 정자: 기단 / 기둥 8 / 지붕판 / 돔 / 금 피니얼"""
    prism(prefix + "_Base", x, y, z, z + 0.18 * s, 0.55 * s, 0.55 * s, 8, M_MARBLE)
    for i in range(8):
        a = math.pi / 8 + 2 * math.pi * i / 8
        px, py = x + 0.44 * s * math.cos(a), y + 0.44 * s * math.sin(a)
        box_c(f"{prefix}_Pillar{i}", px, py, 0.07 * s, 0.07 * s, z + 0.18 * s, z + 0.75 * s, M_MARBLE)
    prism(prefix + "_Roof", x, y, z + 0.75 * s, z + 0.85 * s, 0.62 * s, 0.62 * s, 8, M_MARBLE)
    revolve(prefix + "_Dome", x, y,
            [(0.48 * s, z + 0.85 * s), (0.56 * s, z + 1.05 * s), (0.38 * s, z + 1.3 * s), (0, z + 1.45 * s)],
            8, M_MARBLE)
    revolve(prefix + "_Finial", x, y,
            [(0.07 * s, z + 1.42 * s), (0.09 * s, z + 1.52 * s), (0.03 * s, z + 1.6 * s), (0, z + 1.78 * s)],
            6, M_GOLD, cap_bottom=True)


# --------------------------------------------------------------------------
# 지형: 바깥 대지 / 야무나 강 / 테라스 / 정원 바닥
# --------------------------------------------------------------------------
box("Ground_Outer", -150, 150, -150, 10, -0.25, -0.01, M_GROUND)
box("Yamuna_River", -150, 150, 10, 150, -0.9, -0.55, M_WATER)
box("River_Terrace", -15.6, 15.6, 0, 10, -0.9, 0.3, M_MARBLE)
box("Garden_Paving", -15, 15, -30, 0, -0.1, 0.0, M_PAVING)

# 정원 외벽 + 모서리 팔각탑
box("Wall_West", -15.6, -15.0, -30.6, 0, 0, 0.7, M_MARBLE)
box("Wall_East", 15.0, 15.6, -30.6, 0, 0, 0.7, M_MARBLE)
box("Wall_South_W", -15.6, -1.6, -30.6, -30.0, 0, 0.7, M_MARBLE)
box("Wall_South_E", 1.6, 15.6, -30.6, -30.0, 0, 0.7, M_MARBLE)
box("Wall_South_GateStep", -1.6, 1.6, -30.6, -30.0, 0, 0.12, M_MARBLE)
for i, (tx, ty) in enumerate([(-15.3, -30.3), (15.3, -30.3), (-15.3, 9.7), (15.3, 9.7)]):
    base_z = 0.3 if ty > 0 else 0.0
    prism(f"CornerTower{i}_Body", tx, ty, base_z, base_z + 1.0, 0.62, 0.55, 8, M_MARBLE)
    chhatri(f"CornerTower{i}_Chhatri", tx, ty, base_z + 1.0, 0.75)

# --------------------------------------------------------------------------
# 차르바그(4분 정원): 화단 16개, 수로 2개, 중앙 연못, 사이프러스/둥근 나무
# --------------------------------------------------------------------------
X_SPANS = [(-14.5, -8.25), (-7.25, -1.0), (1.0, 7.25), (8.25, 14.5)]
Y_SPANS = [(-29.5, -23.25), (-22.25, -16.0), (-14.0, -7.75), (-6.75, -0.5)]
bed_i = 0
for (x0, x1) in X_SPANS:
    for (y0, y1) in Y_SPANS:
        box(f"Garden_Bed{bed_i:02d}", x0, x1, y0, y1, 0.0, 0.06, M_GRASS)
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        prism(f"Garden_Tree{bed_i:02d}_Trunk", cx, cy, 0.06, 0.6, 0.09, 0.07, 5, M_PAVING)
        icosahedron(f"Garden_Tree{bed_i:02d}_Crown", cx, cy, 1.15, 0.85, M_TREE)
        bed_i += 1

# 남북 수로 (중앙 축) + 동서 수로
box("Canal_NS_Water", -0.4, 0.4, -30.0, 0.0, -0.08, 0.03, M_WATER)
box("Canal_EW_Water", -15.0, 15.0, -15.4, -14.6, -0.08, 0.03, M_WATER)
for side, (a, b) in (("W", (-0.65, -0.4)), ("E", (0.4, 0.65))):
    box(f"Canal_NS_Rim{side}_S", a, b, -30.0, -16.5, 0.0, 0.12, M_MARBLE)
    box(f"Canal_NS_Rim{side}_N", a, b, -13.5, 0.0, 0.0, 0.12, M_MARBLE)
for side, (a, b) in (("S", (-15.65, -15.4)), ("N", (-14.6, -14.35))):
    box(f"Canal_EW_Rim{side}_W", -15.0, -1.5, a, b, 0.0, 0.12, M_MARBLE)
    box(f"Canal_EW_Rim{side}_E", 1.5, 15.0, a, b, 0.0, 0.12, M_MARBLE)

# 중앙 연꽃 연못 (높인 대리석 단)
box_c("Pool_Platform", 0, -15, 3.0, 3.0, 0.0, 0.35, M_MARBLE)
box_c("Pool_Water", 0, -15, 2.2, 2.2, 0.30, 0.36, M_WATER)
prism("Pool_Fountain", 0, -15, 0.36, 0.55, 0.12, 0.05, 6, M_MARBLE)

# 수로 분수 노즐
for i, y in enumerate([y for y in [-28.5 + 1.5 * k for k in range(19)] if abs(y + 15) > 2.0]):
    prism(f"Fountain_NS_{i:02d}", 0, y, 0.0, 0.1, 0.06, 0.03, 5, M_MARBLE)

# 사이프러스 나무 (수로 양옆)
t_i = 0
for y in [-29.0 + 1.6 * k for k in range(19)]:
    if abs(y + 15) < 2.3:
        continue
    for x in (-1.15, 1.15):
        prism(f"Cypress_NS_{t_i:02d}", x, y, 0.0, 2.0, 0.3, 0.0, 6, M_TREE)
        t_i += 1
t_i = 0
for x in [-14.0 + 1.6 * k for k in range(18)]:
    if abs(x) < 2.3:
        continue
    for y in (-16.15, -13.85):
        prism(f"Cypress_EW_{t_i:02d}", x, y, 0.0, 1.6, 0.26, 0.0, 6, M_TREE)
        t_i += 1

# --------------------------------------------------------------------------
# 영묘 본체
# --------------------------------------------------------------------------
CX, CY = 0.0, 5.0      # 영묘 중심 (북쪽 강변 테라스 위)
PLINTH_H = 0.7
Z_PLINTH = 0.3 + PLINTH_H   # 기단 윗면 = 1.0

# 기단 + 기단 측면 아치 열
box_c("Plinth", CX, CY, 9.5, 9.5, 0.3, Z_PLINTH, M_MARBLE)
for fi, phi in enumerate([math.radians(a) for a in (-90, 0, 90, 180)]):
    for i in range(11):
        u = -4.2 + i * 0.84
        wall_panel(f"Plinth_Arch_{fi}_{i:02d}", onto_face(CX, CY, phi, 4.75, u, 0.36),
                   phi, arch_prof(0.48, 0.5), 0.02, M_MARBLE_SHADE)

# 모서리를 깎은 정사각 본체 (팔각 기둥)
A, C = 2.85, 0.9
Z_BODY_TOP = 3.9
body_pts = [(A, -(A - C)), (A, A - C), (A - C, A), (-(A - C), A),
            (-A, A - C), (-A, -(A - C)), (-(A - C), -A), (A - C, -A)]
poly_prism("Mausoleum_Body", [(CX + x, CY + y) for x, y in body_pts], Z_PLINTH, Z_BODY_TOP, M_MARBLE)

# 네 정면의 피슈타크(큰 아치 문)
for fi, deg in enumerate((-90, 0, 90, 180)):
    phi = math.radians(deg)
    base = onto_face(CX, CY, phi, A, 0, Z_PLINTH)
    wall_panel(f"Pishtaq{fi}_Frame", base, phi, rect_prof(2.7, 3.35), 0.15, M_MARBLE)
    wall_panel(f"Pishtaq{fi}_GoldBand", base, phi, rect_prof(2.15, 3.0), 0.16, M_GOLD)
    wall_panel(f"Pishtaq{fi}_Inner", base, phi, rect_prof(2.0, 2.9), 0.17, M_MARBLE)
    wall_panel(f"Pishtaq{fi}_ArchGold", base, phi, arch_prof(1.75, 2.65), 0.18, M_GOLD)
    wall_panel(f"Pishtaq{fi}_Arch", base, phi, arch_prof(1.55, 2.5), 0.19, M_MARBLE_SHADE)
    # 피슈타크 양옆 2단 작은 아치
    for side in (-1, 1):
        for lvl, z in enumerate((Z_PLINTH + 0.15, Z_PLINTH + 1.5)):
            gold_arch(f"Pishtaq{fi}_Side{side:+d}_L{lvl}",
                      onto_face(CX, CY, phi, A, side * 1.65, z), phi, 0.36, 1.1)
    # 피슈타크 모서리 첨탑 (굴다스타)
    for side in (-1, 1):
        px, py, _ = onto_face(CX, CY, phi, A + 0.08, side * 1.4, 0)
        prism(f"Pishtaq{fi}_Pinnacle{side:+d}", px, py, Z_PLINTH, 4.7, 0.08, 0.08, 6, M_MARBLE)
        prism(f"Pishtaq{fi}_PinnacleTip{side:+d}", px, py, 4.7, 4.98, 0.09, 0.0, 6, M_GOLD)

# 모서리 사선면의 2단 아치
CHAMFER_DIST = (2 * A - C) / math.sqrt(2)
for fi, deg in enumerate((45, 135, 225, 315)):
    phi = math.radians(deg)
    for lvl, z in enumerate((Z_PLINTH + 0.15, Z_PLINTH + 1.55)):
        gold_arch(f"Chamfer{fi}_L{lvl}", onto_face(CX, CY, phi, CHAMFER_DIST, 0, z), phi, 0.8, 1.2)

# 지붕 위 4개의 차트리
for i, (dx, dy) in enumerate([(-2.05, -2.05), (2.05, -2.05), (-2.05, 2.05), (2.05, 2.05)]):
    chhatri(f"Roof_Chhatri{i}", CX + dx, CY + dy, Z_BODY_TOP, 1.0)

# 드럼 + 양파형 대형 돔 + 금 피니얼
prism("Dome_Drum", CX, CY, Z_BODY_TOP, 4.75, 1.6, 1.6, 8, M_MARBLE)
prism("Dome_Drum_GoldBand", CX, CY, 4.58, 4.68, 1.63, 1.63, 8, M_GOLD)
revolve("Main_Dome", CX, CY,
        [(1.6, 4.75), (2.1, 5.6), (1.55, 6.6), (0.4, 7.25), (0.0, 7.42)], 8, M_MARBLE)
revolve("Main_Dome_Finial", CX, CY,
        [(0.25, 7.3), (0.12, 7.55), (0.2, 7.72), (0.08, 7.9), (0.13, 8.05), (0.0, 8.6)],
        6, M_GOLD, cap_bottom=True)

# 네 개의 미나렛 (발코니 2단 + 꼭대기 차트리)
for i, (dx, dy) in enumerate([(-4.3, -4.3), (4.3, -4.3), (-4.3, 4.3), (4.3, 4.3)]):
    mx, my = CX + dx, CY + dy
    prism(f"Minaret{i}_Base", mx, my, Z_PLINTH, Z_PLINTH + 0.3, 0.55, 0.55, 8, M_MARBLE)
    prism(f"Minaret{i}_Shaft", mx, my, Z_PLINTH + 0.3, 5.5, 0.4, 0.3, 8, M_MARBLE)
    for b, bz in enumerate((2.7, 4.1)):
        prism(f"Minaret{i}_Balcony{b}", mx, my, bz, bz + 0.08, 0.52, 0.52, 8, M_MARBLE)
        prism(f"Minaret{i}_BalconyGold{b}", mx, my, bz + 0.08, bz + 0.13, 0.48, 0.48, 8, M_GOLD)
    prism(f"Minaret{i}_TopBalcony", mx, my, 5.5, 5.58, 0.58, 0.58, 8, M_MARBLE)
    chhatri(f"Minaret{i}_Chhatri", mx, my, 5.58, 0.8)

# --------------------------------------------------------------------------
# 좌우 부속 건물: 서쪽 모스크 / 동쪽 자와브
# --------------------------------------------------------------------------
for name, sx, phi in (("Mosque", -11.0, 0.0), ("Jawab", 11.0, math.pi)):
    box(f"{name}_Body", sx - 1.3, sx + 1.3, 1.8, 8.2, 0.3, 1.7, M_MARBLE)
    fdist = 1.3
    base = onto_face(sx, 5.0, phi, fdist, 0, 0.3)
    wall_panel(f"{name}_Pishtaq", base, phi, rect_prof(1.7, 1.75), 0.1, M_MARBLE)
    wall_panel(f"{name}_PishtaqGold", base, phi, arch_prof(1.05, 1.35), 0.11, M_GOLD)
    wall_panel(f"{name}_PishtaqArch", base, phi, arch_prof(0.9, 1.25), 0.122, M_MARBLE_SHADE)
    for k, off in enumerate((-2.0, -1.0, 1.0, 2.0)):
        gold_arch(f"{name}_Arch{k}", onto_face(sx, 5.0, phi, fdist, off, 0.4), phi, 0.6, 0.95)
    for k, (dy, r) in enumerate(((5.0, 0.6), (3.2, 0.42), (6.8, 0.42))):
        prism(f"{name}_Drum{k}", sx, dy, 1.7, 1.95, r, r, 8, M_MARBLE)
        revolve(f"{name}_Dome{k}", sx, dy,
                [(r, 1.95), (r * 1.25, 1.95 + r * 0.6), (r * 0.8, 1.95 + r * 1.2), (0, 1.95 + r * 1.6)],
                8, M_MARBLE)
        revolve(f"{name}_Finial{k}", sx, dy,
                [(0.06, 1.9 + r * 1.6), (0.08, 2.0 + r * 1.6), (0.0, 2.25 + r * 1.6)],
                6, M_GOLD, cap_bottom=True)
    for k, (cx2, cy2) in enumerate([(sx - 1.3, 1.8), (sx + 1.3, 1.8), (sx - 1.3, 8.2), (sx + 1.3, 8.2)]):
        prism(f"{name}_Tower{k}", cx2, cy2, 0.3, 2.1, 0.22, 0.2, 8, M_MARBLE)
        revolve(f"{name}_TowerDome{k}", cx2, cy2, [(0.24, 2.1), (0.26, 2.25), (0.0, 2.5)], 8, M_MARBLE)
        prism(f"{name}_TowerTip{k}", cx2, cy2, 2.48, 2.7, 0.04, 0.0, 6, M_GOLD)

# --------------------------------------------------------------------------
# 조명: 아그라 오후 2시 (태양 고도 약 50도, 방위 약 232도 = 남서)
#  - 춘분 무렵, 지방 태양시 14:00 기준 계산값: 고도 50.4도, 남쪽에서 서쪽으로 51.7도
# --------------------------------------------------------------------------
SUN_ELEV = math.radians(50.4)
SUN_AZ = math.radians(180 + 51.7)  # 북쪽 기준 시계방향
to_sun = Vector((math.sin(SUN_AZ) * math.cos(SUN_ELEV),
                 math.cos(SUN_AZ) * math.cos(SUN_ELEV),
                 math.sin(SUN_ELEV)))
sun_data = bpy.data.lights.new("Sun_Agra_2PM", type='SUN')
sun_data.energy = 5.0
sun_data.color = (1.0, 0.68, 0.36)       # 따뜻한 황금빛
sun_data.angle = math.radians(1.5)       # 부드러운 그림자 가장자리
sun = bpy.data.objects.new("Sun_Agra_2PM", sun_data)
sun.rotation_euler = (-to_sun).to_track_quat('-Z', 'Y').to_euler()
COLL.objects.link(sun)

# 하늘(월드): 따뜻한 오후 하늘빛 환경광
world = scene.world or bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
bg.inputs["Color"].default_value = (0.95, 0.70, 0.40, 1.0)
bg.inputs["Strength"].default_value = 0.45

# --------------------------------------------------------------------------
# 카메라: 정면(남쪽)에서 45도 고각, 정원 전체가 들어오도록 거리 자동 맞춤
# --------------------------------------------------------------------------
from bpy_extras.object_utils import world_to_camera_view  # noqa: E402

scene.render.resolution_x = 1600
scene.render.resolution_y = 1000
scene.render.resolution_percentage = 100

cam_data = bpy.data.cameras.new("Camera_Front45")
cam_data.lens = 35
cam_data.clip_end = 1000
cam = bpy.data.objects.new("Camera_Front45", cam_data)
COLL.objects.link(cam)
scene.camera = cam

PITCH = math.radians(45)
TARGET = Vector((0.0, -11.0, 0.0))
must_see = [Vector(p) for p in [
    (-15.6, -30.6, 0), (15.6, -30.6, 0), (-15.6, 10, 0.3), (15.6, 10, 0.3),
    (0, 5, 8.6), (-4.3, 9.3, 7.0), (4.3, 9.3, 7.0), (-15.3, 9.7, 3.0), (15.3, 9.7, 3.0)]]
MARGIN = 0.03
for i in range(400):
    dist = 20 + i * 0.25
    cam.location = TARGET + Vector((0, -math.cos(PITCH), math.sin(PITCH))) * dist
    cam.rotation_euler = (PITCH, 0, 0)
    bpy.context.view_layer.update()
    ok = all(MARGIN <= c.x <= 1 - MARGIN and MARGIN <= c.y <= 1 - MARGIN and c.z > 0
             for c in (world_to_camera_view(scene, cam, p) for p in must_see))
    if ok:
        break

# --------------------------------------------------------------------------
# 렌더 설정 (Cycles: GPU 없는 환경에서도 동작)
# --------------------------------------------------------------------------
scene.render.engine = 'CYCLES'
scene.cycles.samples = 64
try:
    scene.cycles.use_denoising = True
except AttributeError:
    pass
try:
    scene.view_settings.view_transform = 'AgX'
except TypeError:
    pass

# --------------------------------------------------------------------------
# 면 수 검사 (오브젝트당 최대 32면)
# --------------------------------------------------------------------------
counts = {ob.name: len(ob.data.polygons) for ob in COLL.objects if ob.type == 'MESH'}
over = {k: v for k, v in counts.items() if v > MAX_FACES}
print(f"[TajMahal] 메쉬 오브젝트 {len(counts)}개, 총 면 {sum(counts.values())}개, "
      f"오브젝트당 최대 {max(counts.values())}면 ({max(counts, key=counts.get)})")
print(f"[TajMahal] 카메라 거리 {dist:.2f}, 위치 {tuple(round(c, 2) for c in cam.location)}")
if over:
    raise RuntimeError(f"면 수 {MAX_FACES} 초과 오브젝트: {over}")

# 헤드리스 실행 시 저장/렌더 (Blender UI에서 실행할 때는 동작하지 않음)
OUT = os.environ.get("TAJ_OUT_DIR")
if OUT:
    os.makedirs(OUT, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "taj_mahal_lowpoly.blend"))
    scene.render.filepath = os.path.join(OUT, "taj_mahal_lowpoly_render.png")
    bpy.ops.render.render(write_still=True)
    print("[TajMahal] 렌더 저장:", scene.render.filepath)
