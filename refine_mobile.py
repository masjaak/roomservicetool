import os

def process_file(path, func):
    with open(path, 'r') as f:
        content = f.read()
    new_content = func(content)
    with open(path, 'w') as f:
        f.write(new_content)

# 1. ProductCard
def refine_product_card(c):
    # Make image taller on mobile (aspect-[4/5] or 3/4) and wider on desktop if needed
    c = c.replace('sm:w-40 sm:h-40 aspect-square', 'sm:w-48 aspect-[4/5] sm:aspect-[4/5]')
    
    # Improve the "View" CTA to a strong, 44px+ mobile touch target
    old_cta = """<div className="ml-auto inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] font-semibold transition-all text-[#1c1917]/50 group-hover:text-[#1c1917]">
              <span>View</span>
              <Plus className="w-3.5 h-3.5" />
            </div>"""
    new_cta = """<div className="w-full sm:w-auto h-12 sm:h-11 px-6 ml-auto flex items-center justify-center sm:justify-start gap-3 text-[11px] uppercase tracking-[0.2em] font-medium transition-all bg-[#f5f5f4] text-[#1c1917] group-hover:bg-[#1c1917] group-hover:text-white mt-4 sm:mt-0">
              <span>View dish</span>
            </div>"""
    c = c.replace(old_cta, new_cta)

    # Adjust flex wrap for the bottom area to give CTA its own landing area on mobile
    c = c.replace('<div className="flex flex-wrap items-center gap-4 mt-auto">', '<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto pt-2">')
    # Because we added flex-col for mobile, let's group the metadata
    old_meta = """{item.prepTime && (
              <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#a8a29e]">
                {item.prepTime}
              </span>
            )}
            {item.spiceLevel && item.spiceLevel !== 'None' && (
              <span style={{ color: item.spiceLevel === 'Hot' ? '#991b1b' : '#a8a29e' }} className="text-[10px] uppercase tracking-[0.15em] font-semibold">
                {item.spiceLevel}
              </span>
            )}"""
    new_meta = """<div className="flex items-center gap-4">
              {item.prepTime && (
                <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#a8a29e]">
                  {item.prepTime}
                </span>
              )}
              {item.spiceLevel && item.spiceLevel !== 'None' && (
                <span style={{ color: item.spiceLevel === 'Hot' ? '#991b1b' : '#a8a29e' }} className="text-[10px] uppercase tracking-[0.15em] font-semibold">
                  {item.spiceLevel}
                </span>
              )}
            </div>"""
    c = c.replace(old_meta, new_meta)

    # Make dish title a bit larger and readable on mobile
    c = c.replace('text-[1.35rem]', 'text-[1.5rem]')
    
    # Increase description readability
    c = c.replace('text-[0.85rem]', 'text-[0.9rem] leading-[1.6]')
    c = c.replace('text-[#78716c]', 'text-[#574b3f]')

    return c
process_file('src/components/ProductCard.tsx', refine_product_card)

# 2. ItemDetailModal
def refine_item_modal(c):
    # Increase CTA size
    c = c.replace('py-4 px-6 text-[10px]', 'h-14 sm:h-12 px-8 text-[11px]')
    
    # Increase qty buttons size to 44px for optimal touch target
    c = c.replace('w-8 h-8 flex', 'w-12 h-12 sm:w-10 sm:h-10 flex')
    c = c.replace('text-sm font-medium w-8 text-center', 'text-base font-medium w-10 text-center')

    # Remove close button background and make it clean
    c = c.replace('w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur border text-[#1a1a1a]', 'w-12 h-12 flex items-center justify-center bg-white shadow-sm text-[#1c1917]')

    # Increase description readability inside modal
    c = c.replace('text-sm leading-relaxed font-light mb-8', 'text-[0.95rem] leading-[1.7] font-normal mb-8')

    return c
process_file('src/components/ItemDetailModal.tsx', refine_item_modal)

# 3. MenuView
def refine_menu_view(c):
    # Make category links taller for mobile touch
    c = c.replace('py-3 text-left transition-all border-b', 'py-4 text-left transition-all border-b')
    c = c.replace('text-[11px]', 'text-[12px]')
    
    # Adjust floating cart CTA
    c = c.replace('px-8 py-5 shadow-2xl', 'px-6 py-4 h-16 shadow-xl')
    
    return c
process_file('src/views/MenuView.tsx', refine_menu_view)

# 4. CartDrawer
def refine_cart_drawer(c):
    # Increase remove button touch target
    c = c.replace('p-1 transition-opacity', 'p-3 -m-3 transition-opacity')
    
    # Increase quantity buttons in cart Drawer
    c = c.replace('w-5 h-5 flex items-center', 'w-10 h-10 flex items-center')
    c = c.replace('text-xs font-medium w-3', 'text-sm font-medium w-6')
    c = c.replace('border px-2 py-1', 'border p-1 bg-[#f5f5f4]')

    # Increase checkout button CTA
    c = c.replace('w-full py-4 font-bold text-xs', 'w-full h-14 font-medium text-[12px]')
    
    return c
process_file('src/components/CartDrawer.tsx', refine_cart_drawer)

# 5. CheckoutView
def refine_checkout_view(c):
    c = c.replace('w-8 h-8 text-xs', 'w-11 h-11 text-sm')
    c = c.replace('w-full py-4 text-[10px]', 'w-full h-14 text-[12px]')
    return c
process_file('src/views/CheckoutView.tsx', refine_checkout_view)

print("Mobile refinement deployed.")
