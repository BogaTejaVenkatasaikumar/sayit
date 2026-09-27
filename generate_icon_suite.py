from PIL import Image, ImageDraw, ImageFont
import os

icons_dir = r"C:\Users\tejac\.gemini\antigravity\scratch\sayit-extension\public\icons"

# Master for 128 & 48 (Full 'sayit' + triangle)
master = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
draw = ImageDraw.Draw(master)
corner_radius = 110
draw.rounded_rectangle([4, 4, 507, 507], radius=corner_radius, fill=(18, 18, 22, 255), outline=(234, 88, 12, 255), width=10)

try:
    font_large = ImageFont.truetype("arialbd.ttf", 155)
except:
    font_large = ImageFont.load_default()

text = "sayit"
bbox = draw.textbbox((0, 0), text, font=font_large)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]
tx = (512 - tw) // 2
ty = (512 - th) // 2 - 35
draw.text((tx, ty), text, font=font_large, fill=(255, 255, 255, 255))

tri_center_x = tx + int(tw * 0.47)
tri_top_y = ty + th + 45
tri_width = 86
tri_height = 58
draw.polygon([
    (tri_center_x - tri_width // 2, tri_top_y),
    (tri_center_x + tri_width // 2, tri_top_y),
    (tri_center_x, tri_top_y + tri_height)
], fill=(234, 88, 12, 255))

master.resize((128, 128), Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "icon128.png"))
master.resize((48, 48), Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "icon48.png"))

# Specialized High-Contrast Small Icon for 32x32 and 16x16:
# Bold 's' + orange triangle indicator that looks striking at 16x16 toolbar size
master_small = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
draw_s = ImageDraw.Draw(master_small)
draw_s.rounded_rectangle([4, 4, 507, 507], radius=corner_radius, fill=(18, 18, 22, 255), outline=(234, 88, 12, 255), width=14)

try:
    font_s = ImageFont.truetype("arialbd.ttf", 260)
except:
    font_s = ImageFont.load_default()

s_bbox = draw_s.textbbox((0, 0), "s", font=font_s)
sw = s_bbox[2] - s_bbox[0]
sh = s_bbox[3] - s_bbox[1]
sx = (512 - sw) // 2
sy = (512 - sh) // 2 - 45
draw_s.text((sx, sy), "s", font=font_s, fill=(255, 255, 255, 255))

# Triangle under 's'
tri_s_x = 256
tri_s_y = sy + sh + 35
draw_s.polygon([
    (tri_s_x - 70, tri_s_y),
    (tri_s_x + 70, tri_s_y),
    (tri_s_x, tri_s_y + 80)
], fill=(234, 88, 12, 255))

master_small.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "icon32.png"))
master_small.resize((16, 16), Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "icon16.png"))

print("Created 128, 48, 32, 16 icon suite!")
