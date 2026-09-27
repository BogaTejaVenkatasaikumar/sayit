from PIL import Image, ImageDraw, ImageFont
import os

icons_dir = r"C:\Users\tejac\.gemini\antigravity\scratch\sayit-extension\public\icons"
os.makedirs(icons_dir, exist_ok=True)

# Generate master 512x512 high-resolution icon then downsample with LANCZOS
master_size = 512
img = Image.new("RGBA", (master_size, master_size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Rounded squircle background
corner_radius = int(master_size * 0.22)
bg_color = (18, 18, 22, 255) # Deep obsidian black
border_color = (234, 88, 12, 180) # Orange ambient border

# Outer glow / border
draw.rounded_rectangle([2, 2, master_size - 3, master_size - 3], radius=corner_radius, fill=bg_color, outline=(234, 88, 12, 255), width=8)

# Load font or draw clean 'sayit' logo with orange triangle
try:
    # Try system fonts
    font = ImageFont.truetype("arialbd.ttf", 150)
except:
    try:
        font = ImageFont.truetype("segoeuib.ttf", 150)
    except:
        font = ImageFont.load_default()

# Measure text "sayit"
text = "sayit"
bbox = draw.textbbox((0, 0), text, font=font)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]

# Position text in upper-middle
tx = (master_size - tw) // 2
ty = (master_size - th) // 2 - 35

draw.text((tx, ty), text, font=font, fill=(255, 255, 255, 255))

# Draw bold orange downward triangle under the 'y' and 'i'
# In "sayit", 'y' is roughly at position ~42% across the text width
tri_center_x = tx + int(tw * 0.47)
tri_top_y = ty + th + 48
tri_width = 80
tri_height = 55

tri_points = [
    (tri_center_x - tri_width // 2, tri_top_y),
    (tri_center_x + tri_width // 2, tri_top_y),
    (tri_center_x, tri_top_y + tri_height)
]
draw.polygon(tri_points, fill=(234, 88, 12, 255))

# Save sizes
for sz in [16, 32, 48, 128]:
    resized = img.resize((sz, sz), Image.Resampling.LANCZOS)
    out_path = os.path.join(icons_dir, f"icon{sz}.png")
    resized.save(out_path)
    print(f"Generated icon{sz}.png: {resized.size}")

print("Extension icons generated successfully!")
