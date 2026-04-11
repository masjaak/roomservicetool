const fs = require('fs');
let code = fs.readFileSync('src/data/constants.ts', 'utf8');

// 1. Replace images
code = code.replace(/category:\s*'Signatures',\n\s*image:\s*'[^']+',/g, "category: 'Signatures',\n    image: '/assets/menu/signatures.jpg',");
code = code.replace(/category:\s*'Starters',\n\s*image:\s*'[^']+',/g, "category: 'Starters',\n    image: '/assets/menu/starters.jpg',");
code = code.replace(/category:\s*'Mains',\n\s*image:\s*'[^']+',/g, "category: 'Mains',\n    image: '/assets/menu/mains.jpg',");
code = code.replace(/category:\s*'Desserts',\n\s*image:\s*'[^']+',/g, "category: 'Desserts',\n    image: '/assets/menu/desserts.jpg',");
code = code.replace(/category:\s*'Beverages',\n\s*image:\s*'[^']+',/g, "category: 'Beverages',\n    image: '/assets/menu/beverages.jpg',");

// 2. Add realistic tags manually or generically to signatures
code = code.replace(/name: 'Beef Cheek Rendang',(.*?)\n\s*allergens: 'Coconut, Nuts',\n  }/s, 
  "name: 'Beef Cheek Rendang',$1\n    allergens: 'Coconut, Nuts',\n    prepTime: '25–30 min',\n    spiceLevel: 'Medium',\n    serviceTag: 'Chef Recommendation',\n    dietaryTags: ['Contains Nuts'],\n  }");

code = code.replace(/name: 'Wagyu Striploin 200g',(.*?)\n\s*allergens: 'Dairy',\n  }/s, 
  "name: 'Wagyu Striploin 200g',$1\n    allergens: 'Dairy',\n    prepTime: '20–25 min',\n    spiceLevel: 'None',\n    serviceTag: 'Best Seller',\n    dietaryTags: ['Gluten-Free Option'],\n  }");

code = code.replace(/name: 'Gado Gado',(.*?)\n\s*allergens: 'Peanut, Egg',\n  }/s, 
  "name: 'Gado Gado',$1\n    allergens: 'Peanut, Egg',\n    prepTime: '15 min',\n    spiceLevel: 'Mild',\n    serviceTag: 'Local Favourite',\n    dietaryTags: ['Vegetarian', 'Contains Nuts'],\n  }");

fs.writeFileSync('src/data/constants.ts', code);
