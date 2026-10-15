import os
from PIL import Image

CHAR_CONFIGS = {
    'lula': {
        'folder': 'lula',
        'files': {
            'idle': 'lula_normal.png',
            'walk': 'lula_walk.png',
            'punch': 'lula_punch.png',
            'kick': 'lula kick.png',
            'special': 'lula_power.png',
            'super': 'lula_super.png',
            'victory': 'victory.png',
            'lost': 'lula_normal.png'
        }
    },
    'dilma': {
        'folder': 'Dilma',
        'files': {
            'idle': 'normal.png',
            'walk': 'normal.png',
            'punch': 'punch.png',
            'kick': 'kick.png',
            'special': 'power-yuan.png',
            'super': 'super.png',
            'victory': 'victory.png',
            'lost': 'normal.png'
        }
    },
    'marina': {
        'folder': 'marina',
        'files': {
            'idle': 'normal.png',
            'walk': 'walk.png',
            'punch': 'normal.png',
            'kick': 'kick.png',
            'special': 'power.png',
            'super': 'super.png',
            'victory': 'victory.png',
            'lost': 'normal.png'
        }
    },
    'erika': {
        'folder': 'Erika',
        'files': {
            'idle': 'normal.png',
            'walk': 'normal.png',
            'punch': 'punch.png',
            'kick': 'kick.png',
            'special': 'power.png',
            'super': 'super.png',
            'victory': 'victory.png',
            'lost': 'normal.png'
        }
    },
    'cortez': {
        'folder': 'guilherme',
        'files': {
            'idle': 'normal.png',
            'walk': 'normal.png',
            'punch': 'punch.png',
            'kick': 'kick.png',
            'special': 'power.png',
            'super': 'super.png',
            'victory': 'victory.png',
            'lost': 'normal.png'
        }
    },
    'krenak': {
        'folder': 'Ailton',
        'files': {
            'idle': 'normal.png',
            'walk': 'walk.png',
            'punch': 'punch.png',
            'kick': 'kick.png',
            'special': 'power.png',
            'super': 'super.png',
            'victory': 'victory.png',
            'lost': 'normal.png',
            'defense': 'defense.png',
            'projectile': 'ataque.png',
            'projectile_super': 'ataque - super.png'
        }
    },
    'npc': {
        'folder': 'NPC',
        'files': {
            'idle': 'normal.png',
            'walk': 'normal.png',
            'punch': 'punch.png',
            'kick': 'punch.png',
            'special': 'super.png',
            'super': 'super.png',
            'victory': 'victory.png',
            'lost': 'lost.png'
        }
    },
    'campopiano': {
        'folder': 'Eduarda',
        'files': {
            'idle': 'normal.png',
            'walk': 'normal.png',
            'punch': 'punch.png',
            'kick': 'punch.png',
            'special': 'power.png',
            'super': 'super.png',
            'victory': 'normal.png',
            'lost': 'lost.png'
        }
    },
    'pavanato': {
        'folder': 'Pavanato',
        'files': {
            'idle': 'normal.png',
            'walk': 'normal.png',
            'punch': 'punch.png',
            'kick': 'punch.png',
            'special': 'power.png',
            'super': 'super.png',
            'victory': 'normal.png',
            'lost': 'lost.png'
        }
    },
    'moro': {
        'folder': 'moro',
        'files': {
            'idle': 'normal.png',
            'walk': 'normal.png',
            'punch': 'punch.png',
            'kick': 'punch.png',
            'special': 'power.png',
            'super': 'super.png',
            'victory': 'normal.png',
            'lost': 'lost.png'
        }
    },
    'nikolas': {
        'folder': 'Nikolas',
        'files': {
            'idle': 'normal.png',
            'walk': 'normal.png',
            'punch': 'kick.png',
            'kick': 'kick.png',
            'special': 'power.png',
            'super': 'super.png',
            'victory': 'normal.png',
            'lost': 'lost.png'
        }
    },
    'flavio': {
        'folder': 'flavio',
        'files': {
            'idle': 'normal.png',
            'walk': 'normal.png',
            'punch': 'punch.png',
            'kick': 'kick.png',
            'special': 'power.png',
            'super': 'super.png',
            'victory': 'victory.png',
            'lost': 'lost.png'
        }
    },
    'jair': {
        'folder': 'Bolsonaro',
        'files': {
            'idle': 'normal.png',
            'walk': 'walk.png',
            'punch': 'punch.png',
            'kick': 'punch.png',
            'special': 'power.png',
            'super': 'super-2.png',
            'victory': 'walk.png',
            'lost': 'lost.png'
        }
    },
    'vorcaro': {
        'folder': 'vorcaro',
        'files': {
            'idle': 'normal.png',
            'walk': 'normal.png',
            'punch': 'punch.png',
            'kick': 'punch.png',
            'special': 'power.png',
            'super': 'super.png',
            'victory': 'normal.png',
            'lost': 'lost.png'
        }
    },
    'carlos': {
        'folder': 'Carlos_Bolsonaro',
        'files': {
            'idle': 'normal.png',
            'walk': 'normal.png',
            'punch': 'punch.png',
            'kick': 'punch.png',
            'special': 'power.png',
            'super': 'super.png',
            'victory': 'normal.png',
            'lost': 'lost.png'
        }
    }
}

OUT_DIR = 'assets/optimized'
PORTRAIT_DIR = 'assets/portraits'
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(PORTRAIT_DIR, exist_ok=True)

import sys

TARGET_HEIGHT = 360
target_chars = sys.argv[1:] if len(sys.argv) > 1 else list(CHAR_CONFIGS.keys())

for cid, cfg in CHAR_CONFIGS.items():
    if cid not in target_chars:
        continue
    char_out = os.path.join(OUT_DIR, cid)
    os.makedirs(char_out, exist_ok=True)
    folder = cfg['folder']

    # Process states
    idle_img_cropped = None
    for state, fname in cfg['files'].items():
        src_path = os.path.join('assets', folder, fname)
        if not os.path.exists(src_path):
            print(f'Warning: {src_path} not found')
            continue
        try:
            with Image.open(src_path) as img:
                bbox = img.getbbox()
                if bbox:
                    cropped = img.crop(bbox)
                else:
                    cropped = img
                
                if state == 'idle':
                    idle_img_cropped = cropped.copy()

                # Scale to target height preserving aspect ratio
                aspect = cropped.width / cropped.height
                new_w = max(10, int(TARGET_HEIGHT * aspect))
                resized = cropped.resize((new_w, TARGET_HEIGHT), Image.Resampling.LANCZOS)
                
                out_path = os.path.join(char_out, f'{state}.png')
                resized.save(out_path, format='PNG', optimize=True)
                print(f'Saved: {out_path} ({new_w}x{TARGET_HEIGHT})')
        except Exception as e:
            print(f'Error processing {src_path}: {e}')

    # Create portrait from upper 35% of idle image
    if idle_img_cropped:
        try:
            w, h = idle_img_cropped.size
            # Head and shoulders
            head_h = int(h * 0.40)
            head_w = int(w * 0.70)
            cx = w // 2
            left = max(0, cx - head_w // 2)
            right = min(w, cx + head_w // 2)
            portrait_crop = idle_img_cropped.crop((left, 0, right, head_h))
            portrait_sq = portrait_crop.resize((128, 128), Image.Resampling.LANCZOS)
            p_out = os.path.join(PORTRAIT_DIR, f'{cid}.png')
            portrait_sq.save(p_out, format='PNG', optimize=True)
            print(f'Saved portrait: {p_out}')
        except Exception as e:
            print(f'Error portrait {cid}: {e}')

print('OPTIMIZATION COMPLETE!')
