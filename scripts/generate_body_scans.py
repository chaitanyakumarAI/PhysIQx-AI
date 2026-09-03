import os
import math
import random
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIR = r"e:\physQIx AI\public\body-shapes"
os.makedirs(OUTPUT_DIR, exist_ok=True)

BG_COLOR = (4, 8, 6)
NEON_GREEN = (0, 230, 118)
NEON_GLOW = (0, 255, 136)
COMPRESSION_COLOR = (0, 255, 160)
CYAN_PARTICLE = (0, 240, 200)

def draw_hud(draw, width, height):
    b_len = 24
    b_pad = 32
    # Corner brackets
    draw.line([(b_pad, b_pad), (b_pad + b_len, b_pad)], fill=NEON_GREEN, width=2)
    draw.line([(b_pad, b_pad), (b_pad, b_pad + b_len)], fill=NEON_GREEN, width=2)
    draw.line([(width - b_pad, b_pad), (width - b_pad - b_len, b_pad)], fill=NEON_GREEN, width=2)
    draw.line([(width - b_pad, b_pad), (width - b_pad, b_pad + b_len)], fill=NEON_GREEN, width=2)
    draw.line([(b_pad, height - b_pad), (b_pad + b_len, height - b_pad)], fill=NEON_GREEN, width=2)
    draw.line([(b_pad, height - b_pad), (b_pad, height - b_pad + b_len)], fill=NEON_GREEN, width=2)
    draw.line([(width - b_pad, height - b_pad), (width - b_pad - b_len, height - b_pad)], fill=NEON_GREEN, width=2)
    draw.line([(width - b_pad, height - b_pad), (width - b_pad, height - b_pad + b_len)], fill=NEON_GREEN, width=2)

    # Height scale ticks
    scale_x = b_pad + 12
    for y_pos in range(int(height * 0.15), int(height * 0.85), 24):
        t_len = 10 if (y_pos // 24) % 5 == 0 else 5
        draw.line([(scale_x, y_pos), (scale_x + t_len, y_pos)], fill=(0, 140, 75), width=1)
    draw.line([(scale_x, int(height * 0.15)), (scale_x, int(height * 0.85))], fill=(0, 90, 50), width=1)

def draw_radar_rings(draw, cx, cy, rx, ry):
    for r_scale in [1.0, 0.7, 0.4]:
        box = [cx - rx * r_scale, cy - ry * r_scale, cx + rx * r_scale, cy + ry * r_scale]
        draw.ellipse(box, outline=(0, 160, 85), width=2 if r_scale == 1.0 else 1)
    draw.line([(cx - rx * 1.15, cy), (cx + rx * 1.15, cy)], fill=(0, 110, 55), width=1)
    draw.line([(cx, cy - ry * 1.15), (cx, cy + ry * 1.15)], fill=(0, 110, 55), width=1)

def generate_mesh_body_v2(category, gender, view, height_tier="average", width=1024, height=1365):
    img = Image.new("RGB", (width, height), BG_COLOR)
    draw = ImageDraw.Draw(img)

    cx = width // 2
    ground_y = int(height * 0.84)

    draw_radar_rings(draw, cx, ground_y, int(width * 0.32), int(height * 0.05))
    draw_hud(draw, width, height)

    # Category & Height proportions
    # Default average height ratios
    height_scale = 1.0
    if height_tier == "short":
        height_scale = 0.88
    elif height_tier == "tall":
        height_scale = 1.12

    if category == "lean":
        s_scale, w_scale, h_scale, leg_w, arm_w = 0.20, 0.12, 0.14, 0.038, 0.028
    elif category == "athletic":
        s_scale, w_scale, h_scale, leg_w, arm_w = 0.24, 0.14, 0.16, 0.048, 0.038
    elif category == "muscular":
        s_scale, w_scale, h_scale, leg_w, arm_w = 0.28, 0.16, 0.18, 0.060, 0.052
    elif category == "powerful":
        s_scale, w_scale, h_scale, leg_w, arm_w = 0.32, 0.22, 0.22, 0.072, 0.065
    elif category == "underweight":
        s_scale, w_scale, h_scale, leg_w, arm_w = 0.18, 0.11, 0.13, 0.032, 0.022
    elif category == "average":
        s_scale, w_scale, h_scale, leg_w, arm_w = 0.22, 0.17, 0.17, 0.044, 0.034
    elif category == "overweight":
        s_scale, w_scale, h_scale, leg_w, arm_w = 0.26, 0.25, 0.24, 0.062, 0.048
    elif category == "skinnyfat":
        s_scale, w_scale, h_scale, leg_w, arm_w = 0.20, 0.18, 0.18, 0.040, 0.030
    elif category == "apple":
        s_scale, w_scale, h_scale, leg_w, arm_w = 0.21, 0.27, 0.21, 0.042, 0.034
    elif category == "pear":
        s_scale, w_scale, h_scale, leg_w, arm_w = 0.18, 0.19, 0.27, 0.065, 0.030
    elif category == "dadbod":
        s_scale, w_scale, h_scale, leg_w, arm_w = 0.23, 0.25, 0.22, 0.052, 0.042
    elif category == "hourglass":
        s_scale, w_scale, h_scale, leg_w, arm_w = 0.26, 0.15, 0.27, 0.060, 0.038
    elif category == "rectangular":
        s_scale, w_scale, h_scale, leg_w, arm_w = 0.22, 0.21, 0.22, 0.050, 0.038
    elif category == "endomorph":
        s_scale, w_scale, h_scale, leg_w, arm_w = 0.25, 0.25, 0.26, 0.065, 0.048
    else:
        s_scale, w_scale, h_scale, leg_w, arm_w = 0.22, 0.14, 0.15, 0.045, 0.035

    if gender == "female":
        s_scale *= 0.90
        h_scale *= 1.08

    if view == "side":
        s_scale *= 0.55
        w_scale *= 0.65
        h_scale *= 0.65
    elif view == "45deg":
        s_scale *= 0.85

    # Vertical landmarks adjusted by height_scale
    body_height = int(height * 0.68 * height_scale)
    h_top = ground_y - body_height - int(height * 0.08)
    head_cy = h_top + int(height * 0.05)
    head_rx = int(width * 0.042)
    head_ry = int(height * 0.048)

    neck_y = head_cy + head_ry
    shoulder_y = neck_y + int(body_height * 0.06)
    chest_y = shoulder_y + int(body_height * 0.10)
    waist_y = chest_y + int(body_height * 0.16)
    hip_y = waist_y + int(body_height * 0.13)
    knee_y = hip_y + int(body_height * 0.27)
    ankle_y = knee_y + int(body_height * 0.25)

    mesh_layer = Image.new("RGBA", (width, height), (0,0,0,0))
    m_draw = ImageDraw.Draw(mesh_layer)

    # 1. FACED OVOID HEAD
    head_nodes = []
    for angle_deg in range(0, 360, 45):
        rad = math.radians(angle_deg)
        hx = cx + int(head_rx * math.cos(rad))
        hy = head_cy + int(head_ry * math.sin(rad))
        head_nodes.append((hx, hy))
    for i in range(len(head_nodes)):
        p1 = head_nodes[i]
        p2 = head_nodes[(i+1)%len(head_nodes)]
        m_draw.polygon([(cx, head_cy), p1, p2], outline=NEON_GREEN, fill=(0, 230, 118, 25))

    # 2. TORSO MESH (Neck -> Shoulders -> Chest -> Waist -> Hips)
    sw = int(width * s_scale)
    cw = int(width * s_scale * 0.92)
    ww = int(width * w_scale)
    hw = int(width * h_scale)

    torso_slices = [
        (neck_y, int(head_rx * 0.55)),
        (shoulder_y, sw),
        (chest_y, cw),
        (waist_y, ww),
        (hip_y, hw)
    ]

    for s_idx in range(len(torso_slices) - 1):
        y1, w1 = torso_slices[s_idx]
        y2, w2 = torso_slices[s_idx + 1]

        # Left & Right quad polygons
        is_comp = s_idx in [1, 2, 3] # Compression top
        stroke = COMPRESSION_COLOR if is_comp else NEON_GREEN
        fill_a = 45 if is_comp else 25

        poly_left = [(cx, y1), (cx - w1, y1), (cx - w2, y2), (cx, y2)]
        poly_right = [(cx, y1), (cx + w1, y1), (cx + w2, y2), (cx, y2)]

        m_draw.polygon(poly_left, outline=stroke, fill=(0, 230, 118, fill_a))
        m_draw.polygon(poly_right, outline=stroke, fill=(0, 200, 100, fill_a // 2))

        # Triangulation cross lines
        m_draw.line([(cx - w1, y1), (cx + w2, y2)], fill=stroke, width=1)
        m_draw.line([(cx + w1, y1), (cx - w2, y2)], fill=stroke, width=1)

    # 3. SEPARATE TWO LEGS (Hip -> Knee -> Ankle)
    lw = int(width * leg_w)
    leg_offsets = [-int(hw * 0.55), int(hw * 0.55)] if view != "side" else [0]

    for l_off in leg_offsets:
        hip_p = (cx + l_off, hip_y)
        knee_p = (cx + int(l_off * 0.8), knee_y)
        ankle_p = (cx + int(l_off * 0.7), ankle_y)

        # Upper leg mesh
        m_draw.polygon([
            (hip_p[0] - lw, hip_y), (hip_p[0] + lw, hip_y),
            (knee_p[0] + int(lw*0.8), knee_y), (knee_p[0] - int(lw*0.8), knee_y)
        ], outline=COMPRESSION_COLOR, fill=(0, 255, 160, 40))

        # Lower leg mesh
        m_draw.polygon([
            (knee_p[0] - int(lw*0.8), knee_y), (knee_p[0] + int(lw*0.8), knee_y),
            (ankle_p[0] + int(lw*0.5), ankle_y), (ankle_p[0] - int(lw*0.5), ankle_y)
        ], outline=NEON_GREEN, fill=(0, 230, 118, 20))

        # Diagonal wireframe lines
        m_draw.line([(hip_p[0] - lw, hip_y), (knee_p[0] + int(lw*0.8), knee_y)], fill=NEON_GREEN, width=1)
        m_draw.line([(knee_p[0] - int(lw*0.8), knee_y), (ankle_p[0] + int(lw*0.5), ankle_y)], fill=NEON_GREEN, width=1)

        # Foot ground contact
        m_draw.polygon([
            (ankle_p[0] - int(lw*0.6), ankle_y), (ankle_p[0] + int(lw*0.6), ankle_y),
            (ankle_p[0] + int(lw*0.9), ground_y), (ankle_p[0] - int(lw*0.9), ground_y)
        ], outline=NEON_GREEN, fill=(0, 230, 118, 30))

    # 4. ARMS (Shoulder -> Elbow -> Wrist)
    aw_size = int(width * arm_w)
    arm_sides = [-1, 1] if view != "side" else [1]

    for side in arm_sides:
        sh_p = (cx + side * sw, shoulder_y)
        el_p = (cx + side * (sw + aw_size * 1.5), chest_y + int(body_height * 0.06))
        wr_p = (cx + side * (sw + aw_size * 0.8), waist_y + int(body_height * 0.05))

        m_draw.line([sh_p, el_p, wr_p], fill=NEON_GREEN, width=3)

        # Joint Nodes
        for j_pt in [sh_p, el_p, wr_p]:
            m_draw.ellipse([j_pt[0]-5, j_pt[1]-5, j_pt[0]+5, j_pt[1]+5], fill=NEON_GLOW, outline=NEON_GREEN)

    # 5. CYCLIC DATA PARTICLES
    random.seed(101)
    for _ in range(140):
        px = random.randint(cx - int(sw * 1.6), cx + int(sw * 1.6))
        py = random.randint(h_top - 10, ground_y + 10)
        p_sz = random.randint(1, 3)
        m_draw.ellipse([px, py, px + p_sz, py + p_sz], fill=CYAN_PARTICLE)

    # Blur + Composite Glow
    glow = mesh_layer.filter(ImageFilter.GaussianBlur(radius=5))
    img.paste(glow, (0, 0), glow)
    img.paste(mesh_layer, (0, 0), mesh_layer)

    return img

def main():
    print("Generating Complete Height-Aware & Shape-Aware Holographic Body Scan Suite...")

    categories = ["lean", "athletic", "muscular", "powerful", "skinnyfat", "apple", "pear", "dadbod", "hourglass", "rectangular", "endomorph"]
    genders = ["male", "female"]
    views = ["front", "side", "45deg"]
    height_tiers = ["short", "average", "tall"]

    generated_count = 0

    for cat in categories:
        for gen in genders:
            for view in views:
                for h_tier in height_tiers:
                    # Output filename with explicit height awareness
                    fname_height = f"{h_tier}_{cat}_{gen}_{view}.png"
                    out_path_height = os.path.join(OUTPUT_DIR, fname_height)

                    img = generate_mesh_body_v3(cat, gen, view, height_tier=h_tier, width=1024, height=1365)
                    img.save(out_path_height, quality=95)
                    generated_count += 1

                    # Also save default alias for average height
                    if h_tier == "average":
                        fname_default = f"{cat}_{gen}_{view}.png"
                        out_path_default = os.path.join(OUTPUT_DIR, fname_default)
                        img.save(out_path_default, quality=95)

    # Icons
    for cat in ["lean", "athletic", "muscular", "powerful"]:
        for h_tier in ["short", "average", "tall"]:
            icon_fname = f"{h_tier}_{cat}_neutral_icon.png"
            out_icon_path = os.path.join(OUTPUT_DIR, icon_fname)
            img_icon = generate_mesh_body_v3(cat, "neutral", "front", height_tier=h_tier, width=1024, height=1024)
            img_icon.save(out_icon_path, quality=95)
            generated_count += 1

            if h_tier == "average":
                default_icon = f"{cat}_neutral_icon.png"
                img_icon.save(os.path.join(OUTPUT_DIR, default_icon), quality=95)

    print(f"[+] Successfully generated all {generated_count} height-aware body scan assets in {OUTPUT_DIR}")

def generate_mesh_body_v3(category, gender, view, height_tier="average", width=1024, height=1365):
    return generate_mesh_body_v2(category, gender, view, height_tier=height_tier, width=width, height=height)

if __name__ == "__main__":
    main()

