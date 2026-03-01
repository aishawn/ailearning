#!/usr/bin/env python3
"""
Convert SVG logo to favicon.ico and logo.png

This script tries multiple methods to convert SVG:
1. Uses subprocess to call Inkscape (if available)
2. Uses subprocess to call ImageMagick/convert (if available)
3. Falls back to using Node.js with sharp (if available in the project)
"""

import os
import sys
import subprocess
from pathlib import Path
from PIL import Image
import tempfile
import shutil


def find_command(cmd):
    """Check if a command is available in PATH."""
    return shutil.which(cmd) is not None


def svg_to_png_inkscape(svg_path, output_size):
    """Convert SVG to PNG using Inkscape."""
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
        tmp_path = tmp.name
    
    try:
        # Inkscape command
        cmd = [
            'inkscape',
            str(svg_path),
            f'--export-width={int(output_size)}',
            f'--export-height={int(output_size)}',
            f'--export-filename={tmp_path}',
            '--export-type=png'
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        img = Image.open(tmp_path)
        os.unlink(tmp_path)
        return img
    except Exception as e:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        raise e


def svg_to_png_imagemagick(svg_path, output_size):
    """Convert SVG to PNG using ImageMagick."""
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
        tmp_path = tmp.name
    
    try:
        # ImageMagick convert command
        cmd = [
            'convert',
            '-background', 'none',
            '-resize', f'{int(output_size)}x{int(output_size)}',
            str(svg_path),
            tmp_path
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        img = Image.open(tmp_path)
        os.unlink(tmp_path)
        return img
    except Exception as e:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        raise e


def detect_package_manager(project_root):
    """Detect which package manager is being used."""
    if (project_root / 'pnpm-lock.yaml').exists():
        return 'pnpm'
    elif (project_root / 'yarn.lock').exists():
        return 'yarn'
    elif (project_root / 'package-lock.json').exists():
        return 'npm'
    return 'npm'  # default


def svg_to_png_nodejs(svg_path, output_size, project_root):
    """Convert SVG to PNG using Node.js with sharp (if available)."""
    import json
    import base64
    import io
    
    script_content = f"""
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = {json.dumps(str(svg_path))};
const outputSize = {int(output_size)};

sharp(svgPath)
  .resize(outputSize, outputSize, {{
    fit: 'contain',
    background: {{ r: 0, g: 0, b: 0, alpha: 0 }}
  }})
  .png()
  .toBuffer()
  .then(data => {{
    const base64 = data.toString('base64');
    console.log(JSON.stringify({{ success: true, data: base64 }}));
  }})
  .catch(err => {{
    console.error(JSON.stringify({{ success: false, error: err.message }}));
    process.exit(1);
  }});
"""
    
    # Create temp script in project directory to ensure proper module resolution
    temp_dir = project_root / '.temp'
    temp_dir.mkdir(exist_ok=True)
    
    with tempfile.NamedTemporaryFile(
        mode='w', 
        suffix='.js', 
        delete=False, 
        encoding='utf-8',
        dir=str(temp_dir)
    ) as tmp:
        tmp.write(script_content)
        tmp_path = tmp.name
    
    try:
        # Detect package manager and use appropriate command
        pm = detect_package_manager(project_root)
        
        # Build node command based on package manager
        env = os.environ.copy()
        
        if pm == 'pnpm':
            # Use pnpm exec to ensure proper module resolution
            node_cmd = ['pnpm', 'exec', 'node', tmp_path]
        elif pm == 'yarn':
            node_cmd = ['yarn', 'node', tmp_path]
        else:
            # For npm, try to set NODE_PATH
            node_cmd = ['node', tmp_path]
            # Set NODE_PATH to help resolve modules
            node_modules_path = str(project_root / 'node_modules')
            if 'NODE_PATH' in env:
                env['NODE_PATH'] = f"{node_modules_path}{os.pathsep}{env['NODE_PATH']}"
            else:
                env['NODE_PATH'] = node_modules_path
        
        # Run the command
        if pm == 'npm':
            result = subprocess.run(
                node_cmd,
                cwd=project_root,
                capture_output=True,
                text=True,
                env=env
            )
        else:
            result = subprocess.run(
                node_cmd,
                cwd=project_root,
                capture_output=True,
                text=True,
                env=env
            )
        
        os.unlink(tmp_path)
        
        if result.returncode != 0:
            raise Exception(f"Node.js script failed: {result.stderr}")
        
        response = json.loads(result.stdout)
        if not response.get('success'):
            raise Exception(f"Conversion failed: {response.get('error', 'Unknown error')}")
        
        png_data = base64.b64decode(response['data'])
        img = Image.open(io.BytesIO(png_data))
        
        # Ensure exact size
        if img.size != (output_size, output_size):
            img = img.resize((output_size, output_size), Image.Resampling.LANCZOS)
        
        return img
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse Node.js output: {result.stdout}")
    except Exception as e:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        raise e


def svg_to_png(svg_path, output_size, project_root):
    """Convert SVG to PNG using the best available method."""
    import io
    
    # Try Inkscape first (best quality)
    if find_command('inkscape'):
        try:
            print(f"  Using Inkscape...")
            return svg_to_png_inkscape(svg_path, output_size)
        except Exception as e:
            print(f"  Inkscape failed: {e}")
    
    # Try ImageMagick
    if find_command('convert') or find_command('magick'):
        try:
            print(f"  Using ImageMagick...")
            cmd = 'magick' if find_command('magick') else 'convert'
            return svg_to_png_imagemagick(svg_path, output_size)
        except Exception as e:
            print(f"  ImageMagick failed: {e}")
    
    # Try Node.js with sharp
    if find_command('node'):
        try:
            print(f"  Using Node.js with sharp...")
            return svg_to_png_nodejs(svg_path, output_size, project_root)
        except Exception as e:
            print(f"  Node.js method failed: {e}")
    
    # If all else fails, provide helpful error message
    raise Exception(
        "No SVG conversion tool found. Please install one of:\n"
        "  - Inkscape: https://inkscape.org/release/\n"
        "  - ImageMagick: https://imagemagick.org/script/download.php\n"
        "  - Or install sharp in Node.js: npm install sharp"
    )


def create_favicon(svg_path, output_path, project_root):
    """Create favicon.ico with multiple sizes."""
    print(f"Creating favicon.ico from {svg_path}...")
    
    # Common favicon sizes
    sizes = [16, 32, 48]
    images = []
    
    for size in sizes:
        img = svg_to_png(svg_path, size, project_root)
        images.append(img)
        print(f"  Generated {size}x{size} icon")
    
    # Save as ICO file with multiple sizes
    images[0].save(
        output_path,
        format='ICO',
        sizes=[(img.width, img.height) for img in images]
    )
    print(f"✓ Saved favicon.ico to {output_path}")


def create_logo_png(svg_path, output_path, project_root, size=512):
    """Create logo.png at specified size."""
    print(f"Creating logo.png ({size}x{size}) from {svg_path}...")
    
    img = svg_to_png(svg_path, size, project_root)
    img.save(output_path, format='PNG')
    print(f"✓ Saved logo.png to {output_path}")


def check_nodejs():
    """Check if Node.js is available."""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        return result.returncode == 0
    except:
        return False


def install_sharp_if_needed(project_root):
    """Check if sharp is installed, install if not."""
    node_modules = project_root / 'node_modules' / 'sharp'
    
    if node_modules.exists():
        return True
    
    print("Installing sharp package...")
    try:
        # Try npm first
        result = subprocess.run(['npm', 'install', 'sharp'], cwd=project_root, capture_output=True, text=True)
        if result.returncode == 0:
            print("✓ sharp installed successfully")
            return True
    except:
        pass
    
    try:
        # Try pnpm
        result = subprocess.run(['pnpm', 'add', 'sharp'], cwd=project_root, capture_output=True, text=True)
        if result.returncode == 0:
            print("✓ sharp installed successfully")
            return True
    except:
        pass
    
    try:
        # Try yarn
        result = subprocess.run(['yarn', 'add', 'sharp'], cwd=project_root, capture_output=True, text=True)
        if result.returncode == 0:
            print("✓ sharp installed successfully")
            return True
    except:
        pass
    
    print("Warning: Could not install sharp automatically.")
    print("Please run manually: npm install sharp (or pnpm/yarn)")
    return False


def main():
    # Get script directory and project root
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    # Check Node.js if we're going to use it
    if not find_command('inkscape') and not find_command('convert') and not find_command('magick'):
        if not check_nodejs():
            print("Error: Node.js is not installed or not in PATH.")
            print("Please install Node.js from https://nodejs.org/")
            print("Or install Inkscape or ImageMagick for SVG conversion.")
            sys.exit(1)
        
        # Install sharp if needed
        if not install_sharp_if_needed(project_root):
            print("Error: Could not install sharp package.")
            print("Please run manually: npm install sharp")
            sys.exit(1)
    
    # Input and output paths
    svg_path = project_root / "public" / "logo.svg"
    favicon_path = project_root / "public" / "favicon.ico"
    logo_path = project_root / "public" / "logo.png"
    
    # Check if SVG exists
    if not svg_path.exists():
        print(f"Error: SVG file not found at {svg_path}")
        sys.exit(1)
    
    # Create outputs
    try:
        create_favicon(svg_path, favicon_path, project_root)
        create_logo_png(svg_path, logo_path, project_root, size=512)
        print("\n✓ Conversion completed successfully!")
    except Exception as e:
        print(f"\n✗ Error during conversion: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()

