import os
import sys
from PIL import Image, ImageChops

def remove_background(img, bg_color='green', tolerance=45):
    """
    Removes solid background (chroma green or white) and outputs clean RGBA.
    """
    img = img.convert('RGBA')
    datas = img.getdata()
    new_data = []

    for item in datas:
        r, g, b, a = item
        if a == 0:
            new_data.append((0, 0, 0, 0))
            continue

        if bg_color == 'green':
            # Detect chromatic green: high G, lower R and B
            if g > 130 and g > r + 30 and g > b + 30:
                new_data.append((0, 0, 0, 0))
            elif g > 110 and g > r + 15 and g > b + 15:
                # Soft edge despill
                new_data.append((r, min(g, max(r, b)), b, 128))
            else:
                new_data.append((r, min(g, max(r, b) + 20), b, a))
        elif bg_color == 'white':
            # Detect pure or near white background
            if r > 240 and g > 240 and b > 240:
                new_data.append((0, 0, 0, 0))
            else:
                new_data.append(item)
        else:
            new_data.append(item)

    img.putdata(new_data)
    return img

print("Chroma key and sprite slicer utility ready.")
