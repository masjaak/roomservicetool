import re
import os

def process_file(path, func):
    with open(path, 'r') as f:
        content = f.read()
    new_content = func(content)
    with open(path, 'w') as f:
        f.write(new_content)

# 1. Update MenuView.tsx
def fix_menu_view(c):
    # Fix fonts
    c = c.replace("'Playfair Display', serif", "'Cormorant Garamond', serif")
    c = c.replace("'Lato', sans-serif", "'Manrope', sans-serif")
    
    # Take away "sticky top-0 z-30" from the WHOLE header block to fix scrolling
    c = c.replace('className="sticky top-0 z-30 px-6 sm:px-10 pt-6 pb-5 backdrop-blur-md"', 'className="px-6 sm:px-10 pt-10 pb-12"')
    
    # Make the smaller top bar sticky instead, or just let it scroll. Let's make it not sticky to feel like a high-end editorial menu.
    
    # Remove awkward decorative icons overload
    c = c.replace('<Sparkles className="w-3 h-3" />', '')
    
    # Simplify the banner, remove ugly borders and background
    c = c.replace('backgroundColor: \'#1a1a1a\', borderColor: \'rgba(255,255,255,0.05)\'', 'backgroundColor: \'#f8f6f0\', borderColor: \'rgba(0,0,0,0.05)\'')
    c = c.replace('color: \'#fbfaf8\', fontWeight: 400', 'color: \'#1a1a1a\', fontWeight: 500')
    c = c.replace('color: \'rgba(251,250,248,0.7)\'', 'color: \'#574b3f\'')
    c = c.replace('borderColor: \'rgba(255,255,255,0.08)\'', 'borderColor: \'rgba(0,0,0,0.08)\'')
    c = c.replace('color: \'rgba(251,250,248,0.5)\'', 'color: \'#1a1a1a\'')
    
    # Modify the hero area typography
    c = c.replace('text-[2.5rem] sm:text-[3.5rem]', 'text-[2rem] sm:text-[2.75rem]')
    
    # Clean the category sidebar
    c = c.replace('className="lg:sticky lg:top-[280px] h-fit space-y-8"', 'className="lg:sticky lg:top-[40px] h-fit space-y-8 mt-4"')
    
    return c

process_file('src/views/MenuView.tsx', fix_menu_view)

# 2. Update ProductCard.tsx
def fix_product_card(c):
    c = c.replace("'Playfair Display', serif", "'Cormorant Garamond', serif")
    c = c.replace("'Lato', sans-serif", "'Manrope', sans-serif")
    c = c.replace('boxShadow: \'0 8px 30px rgba(36,31,26,0.03)\'', 'boxShadow: \'none\'')
    c = c.replace('borderColor: \'rgba(36,31,26,0.1)\'', 'borderColor: \'rgba(0,0,0,0.04)\'')
    # Make typography elegant
    c = c.replace('text-[1.85rem]', 'text-[1.35rem]')
    return c

process_file('src/components/ProductCard.tsx', fix_product_card)

# 3. Update ItemDetailModal.tsx
def fix_item_detail(c):
    c = c.replace("'Playfair Display', serif", "'Cormorant Garamond', serif")
    c = c.replace("'Lato', sans-serif", "'Manrope', sans-serif")
    c = c.replace('backgroundColor: \'#1a1a1a\', color: \'#fbfaf8\'', 'backgroundColor: \'#2a2723\', color: \'#ffffff\'')
    return c

process_file('src/components/ItemDetailModal.tsx', fix_item_detail)

# 4. Update CartDrawer.tsx
def fix_cart_drawer(c):
    c = c.replace("'Playfair Display', serif", "'Cormorant Garamond', serif")
    c = c.replace("'Lato', sans-serif", "'Manrope', sans-serif")
    return c

process_file('src/components/CartDrawer.tsx', fix_cart_drawer)

# 5. Fix App.tsx global fonts
def fix_app(c):
    c = c.replace("'Inter', sans-serif", "'Manrope', sans-serif")
    c = c.replace("backgroundColor: '#faf8f5'", "backgroundColor: '#fdfbf9'")
    return c

process_file('src/App.tsx', fix_app)

print("Redesign applied.")
