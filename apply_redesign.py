import re

def process_file(path, func):
    with open(path, 'r') as f:
        content = f.read()
    new_content = func(content)
    with open(path, 'w') as f:
        f.write(new_content)

# Fix MenuView headers and layout
def fix_menu_view(c):
    # Remove the sticky blocking hero
    c = c.replace('className="sticky top-0 z-30 px-6 sm:px-10 pt-6 pb-5 backdrop-blur-md"', 'className="px-6 sm:px-10 pt-8 pb-10"')
    
    # Improve background color to a very clean luxury off-white
    c = c.replace("backgroundColor: '#fbfaf8'", "backgroundColor: '#fdfbf9'")
    c = c.replace("backgroundColor: 'rgba(251,250,248,0.95)'", "backgroundColor: 'transparent'")
    
    # Hero Title typography
    c = c.replace("text-[2.5rem] sm:text-[3.5rem]", "text-[2rem] sm:text-[2.75rem]")
    c = c.replace("fontFamily: \"'Playfair Display', serif\"", "fontFamily: \"'Cormorant Garamond', serif\"")
    c = c.replace("fontFamily: \"'Lato', sans-serif\"", "fontFamily: \"'Manrope', sans-serif\"")
    
    # Improve the "All-day dining" dark block
    c = c.replace("backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.05)'", "backgroundColor: '#f5f5f4', borderColor: 'transparent'")
    c = c.replace("color: '#fbfaf8'", "color: '#1c1917'")
    c = c.replace("color: 'rgba(251,250,248,0.7)'", "color: '#78716c'")
    c = c.replace("borderColor: 'rgba(255,255,255,0.08)'", "borderColor: 'rgba(0,0,0,0.05)'")
    c = c.replace("color: 'rgba(251,250,248,0.5)'", "color: '#a8a29e'")
    
    # Second block "Curated Selection"
    c = c.replace("border border-t-4", "")
    c = c.replace("borderTopColor: '#1a1a1a'", "borderTopColor: 'transparent'")
    c = c.replace("backgroundColor: '#fff'", "backgroundColor: '#ffffff'")
    c = c.replace("borderColor: 'rgba(26,26,26,0.05)'", "borderColor: 'rgba(0,0,0,0.05)'")
    
    # Clean the category sidebar layout (make it scroll normally or sticky but slim)
    c = c.replace("lg:sticky lg:top-[280px]", "lg:sticky lg:top-[40px]")
    
    # Fix dark button
    c = c.replace("backgroundColor: '#1a1a1a', color: '#fbfaf8', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '2px'", "backgroundColor: '#1c1917', color: '#ffffff', borderColor: 'transparent', borderRadius: '0px'")
    
    # Remove awkward decorative icons
    c = c.replace("<Sparkles className=\"w-3 h-3\" />", "")

    return c

process_file('src/views/MenuView.tsx', fix_menu_view)

# ItemDetailModal
def fix_item_modal(c):
    c = c.replace("fontFamily: \"'Playfair Display', serif\"", "fontFamily: \"'Cormorant Garamond', serif\"")
    c = c.replace("fontFamily: \"'Lato', sans-serif\"", "fontFamily: \"'Manrope', sans-serif\"")
    c = c.replace("backgroundColor: '#1a1a1a', color: '#fbfaf8'", "backgroundColor: '#1c1917', color: '#ffffff'")
    c = c.replace("max-h-[90vh]", "max-h-[85vh]")
    c = c.replace("shadow-2xl border", "shadow-xl border-none")
    return c

process_file('src/components/ItemDetailModal.tsx', fix_item_modal)

# CartDrawer
def fix_cart_drawer(c):
    c = c.replace("fontFamily: \"'Playfair Display', serif\"", "fontFamily: \"'Cormorant Garamond', serif\"")
    c = c.replace("fontFamily: \"'Lato', sans-serif\"", "fontFamily: \"'Manrope', sans-serif\"")
    c = c.replace("backgroundColor: '#1a1a1a', color: '#fbfaf8'", "backgroundColor: '#1c1917', color: '#ffffff'")
    c = c.replace("shadow-2xl border-l", "shadow-xl border-l-0")
    return c

process_file('src/components/CartDrawer.tsx', fix_cart_drawer)

# CheckoutView
def fix_checkout_view(c):
    c = c.replace("fontFamily: \"'Playfair Display', serif\"", "fontFamily: \"'Cormorant Garamond', serif\"")
    c = c.replace("fontFamily: \"'Lato', sans-serif\"", "fontFamily: \"'Manrope', sans-serif\"")
    c = c.replace("backgroundColor: '#1a1a1a', color: '#fbfaf8'", "backgroundColor: '#1c1917', color: '#ffffff'")
    return c

process_file('src/views/CheckoutView.tsx', fix_checkout_view)

# TrackingView
def fix_tracking_view(c):
    c = c.replace("fontFamily: \"'Playfair Display', serif\"", "fontFamily: \"'Cormorant Garamond', serif\"")
    c = c.replace("backgroundColor: '#1a1a1a', color: '#fbfaf8'", "backgroundColor: '#1c1917', color: '#ffffff'")
    c = c.replace("fontFamily: \"'Inter', sans-serif\"", "fontFamily: \"'Manrope', sans-serif\"")
    return c

process_file('src/views/TrackingView.tsx', fix_tracking_view)

print("UI Refinements Applied Script")
