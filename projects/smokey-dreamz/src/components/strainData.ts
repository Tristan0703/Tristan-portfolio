export interface StrainProfile {
  lineage: string;
  terpenes: string[];
  effects: string[];
  flavor: string[];
  type: "sativa" | "indica" | "hybrid" | "indica-dominant" | "sativa-dominant";
  description?: string;
}

export const strainDatabase: Record<string, StrainProfile> = {
  "Gelato": {
    lineage: "Sunset Sherbet × Thin Mint Girl Scout Cookies",
    terpenes: ["Caryophyllene", "Limonene", "Linalool", "Myrcene"],
    effects: ["Euphoric Head High", "Relaxing Body Buzz", "Versatile - Day/Evening"],
    flavor: ["Sweet Cream", "Doughy Cookie", "Citrus Zest"],
    type: "hybrid"
  },
  "Sour Diesel": {
    lineage: "Chemdog 91 × Super Skunk",
    terpenes: ["Myrcene", "Limonene", "Caryophyllene", "Pinene"],
    effects: ["Strong Cerebral Uplift", "Focused Mental Energy", "Euphoria"],
    flavor: ["Sharp Diesel", "Sour Citrus", "Fuel"],
    type: "sativa-dominant"
  },
  "WW": {
    lineage: "Brazilian Sativa × South Indian Indica",
    terpenes: ["Caryophyllene", "Myrcene", "Pinene"],
    effects: ["Cerebral Uplift", "Steady Physical Relaxation", "Balanced"],
    flavor: ["Earthy Pine", "Subtle Spice", "Light Citrus"],
    type: "hybrid"
  },
  "Critical Kush": {
    lineage: "Critical Mass × OG Kush",
    terpenes: ["Myrcene", "Caryophyllene", "Limonene"],
    effects: ["Deep Relaxation", "Sedating", "Stress Relief"],
    flavor: ["Earthy", "Pine", "Diesel", "Citrus"],
    type: "indica-dominant"
  },
  "Master Kush": {
    lineage: "Hindu Kush × Skunk",
    terpenes: ["Myrcene", "Caryophyllene", "Limonene"],
    effects: ["Deep Relaxation", "Couch-Lock", "Sedative"],
    flavor: ["Earthy", "Citrus", "Pine"],
    type: "indica"
  },
  "Gorilla Glue": {
    lineage: "Chemdawg × Sour Diesel × Chocolate Diesel",
    terpenes: ["β-Caryophyllene", "Myrcene", "Limonene"],
    effects: ["Heavy Relaxation", "Couch-Lock", "Dual-Phase High"],
    flavor: ["Diesel", "Pine", "Chocolate", "Earthy Musky"],
    type: "indica-dominant"
  },
  "Triple X": {
    lineage: "XXX Hybrid",
    terpenes: ["Caryophyllene", "Myrcene", "Limonene"],
    effects: ["Potent Hybrid", "Balanced Head & Body"],
    flavor: ["Earthy", "Sweet", "Spice"],
    type: "hybrid"
  },
  "Medusa": {
    lineage: "Misty × White Widow × Skunk",
    terpenes: ["Myrcene", "Pinene", "Caryophyllene"],
    effects: ["Relaxing", "Creative", "Balanced Cerebral"],
    flavor: ["Blueberry", "Sweet", "Pungent", "Citrus"],
    type: "hybrid"
  },
  "Granny Smith": {
    lineage: "Hybrid (Limited Data)",
    terpenes: ["Myrcene", "Limonene"],
    effects: ["Energizing", "Creative", "Euphoric"],
    flavor: ["Fruity", "Sweet", "Citrus"],
    type: "hybrid"
  },
  "Banana Daddy": {
    lineage: "Granddaddy Purple × Banana Hammock R1",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene"],
    effects: ["Relaxing", "Happy", "Giggly"],
    flavor: ["Tropical", "Bubblegum", "Gas", "Chestnut"],
    type: "hybrid"
  },
  "Zoap": {
    lineage: "Rainbow Sherbet × Pink Guava",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene", "Linalool"],
    effects: ["Balanced", "Uplifting", "Mood Enhancing", "Stress Relief"],
    flavor: ["Floral Candy", "Tropical Sherbet", "Sweet Perfume", "Grapes"],
    type: "hybrid"
  },
  "Tart Pops": {
    lineage: "Candy-Gelato Family or Tropicana Lineage",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene", "Ocimene"],
    effects: ["Relaxing", "Calming", "Balanced"],
    flavor: ["Tart Candy", "Citrus", "Sweet", "Fruit"],
    type: "hybrid"
  },
  "Quantum Berry": {
    lineage: "Quantum Leap × DJ Short Blueberry",
    terpenes: ["Myrcene", "Caryophyllene", "Limonene"],
    effects: ["Body High", "Relaxing", "Sleepy", "Couchlock"],
    flavor: ["Berry", "Blueberry", "Cherry", "Sour Citrus", "Tropical"],
    type: "indica-dominant"
  },
  "Coffee Breath": {
    lineage: "Koffee × OGKB or Mendo Breath",
    terpenes: ["Myrcene", "Caryophyllene", "Limonene"],
    effects: ["Relaxing", "Centering", "Sedating"],
    flavor: ["Roasted Coffee", "Dark Chocolate", "Hazelnut", "Sweet Cream"],
    type: "indica-dominant"
  },
  "Swazi Gold": {
    lineage: "Swaziland Sativa Landrace",
    terpenes: ["Limonene", "Pinene", "Caryophyllene"],
    effects: ["Energetic", "Uplifting", "Creative", "Productive"],
    flavor: ["Sweet Mango", "Pine", "Citrus", "Earthy"],
    type: "sativa"
  },
  "Twisted Pie": {
    lineage: "Twisted Velvet × Blackcherry Pie F4",
    terpenes: ["Myrcene", "Limonene", "Pinene", "Linalool"],
    effects: ["Relaxing", "Mentally Stimulating", "Depression Relief"],
    flavor: ["Cherry Pie", "Gassy", "Fruity", "Purple"],
    type: "indica-dominant"
  },
  "Ice Lemon": {
    lineage: "Lemon Haze × Afghani",
    terpenes: ["Myrcene", "Caryophyllene", "Limonene"],
    effects: ["Energetic", "Focused", "Uplifted"],
    flavor: ["Lemon", "Lime", "Diesel", "Spicy Citrus"],
    type: "sativa-dominant"
  },
  "Downward Dog": {
    lineage: "Indica Hybrid",
    terpenes: ["Myrcene", "Caryophyllene"],
    effects: ["Relaxing", "Body High", "Calming"],
    flavor: ["Earthy", "Herbal"],
    type: "indica-dominant"
  },
  "La Cron": {
    lineage: "Hybrid",
    terpenes: ["Myrcene", "Limonene"],
    effects: ["Balanced", "Uplifting"],
    flavor: ["Earthy", "Sweet"],
    type: "hybrid"
  },
  "Master Trainwreck": {
    lineage: "Mexican Sativa × Thai Sativa × Afghani Indica",
    terpenes: ["Terpinolene", "Myrcene", "Pinene"],
    effects: ["Euphoric", "Creative", "Cerebral", "Fast-Acting"],
    flavor: ["Pine", "Earthy", "Woody", "Citrus"],
    type: "sativa-dominant"
  },
  "Pau Hana": {
    lineage: "Hybrid",
    terpenes: ["Myrcene", "Limonene"],
    effects: ["Relaxing", "Happy"],
    flavor: ["Fruity", "Tropical"],
    type: "hybrid"
  },
  "Jungle Diamonds": {
    lineage: "Diamond OG × Jungle Cake",
    terpenes: ["β-Caryophyllene", "Myrcene", "Limonene", "Humulene"],
    effects: ["Heavy Body Stone", "Cerebral Clarity", "Deep Tranquility"],
    flavor: ["Earthy Pine", "Sweet Citrus", "Fuel Undertones", "Mineral"],
    type: "indica-dominant",
    description: "A crystal-coated heavyweight that delivers a jungle-deep body stone with surprising mental clarity. True to its name, this strain produces dense, resinous buds that sparkle under light."
  },
  "Ricky Bobby": {
    lineage: "Runtz × Gelonade",
    terpenes: ["Limonene", "Caryophyllene", "Linalool", "Pinene"],
    effects: ["Euphoric Uplift", "Creative Flow", "Gentle Body Relaxation"],
    flavor: ["Sweet Candy", "Tropical Citrus", "Floral Cream", "Berry"],
    type: "hybrid",
    description: "Named for speed and impact, Ricky Bobby hits fast with a sugar-rush euphoria that mellows into smooth body warmth. A well-balanced hybrid for connoisseurs who appreciate terpene complexity."
  },
  "Zephyr": {
    lineage: "Zkittlez × Gelato",
    terpenes: ["Myrcene", "Caryophyllene", "Terpinolene", "Limonene"],
    effects: ["Uplifting", "Stress Relief", "Mood Enhancement", "Mild Euphoria"],
    flavor: ["Fruity Medley", "Sweet Grape", "Citrus Breeze", "Vanilla"],
    type: "sativa-dominant",
    description: "Light as the wind itself, Zephyr lifts the spirit with a gentle sativa breeze. Fruity and sweet with a terpene profile that evokes a warm afternoon orchard."
  },
  "King Fruit": {
    lineage: "King's Kush × Fruit Punch",
    terpenes: ["Myrcene", "Limonene", "Caryophyllene", "Pinene"],
    effects: ["Royal Euphoria", "Body Relaxation", "Appetite Stimulation"],
    flavor: ["Tropical Fruit", "Mango", "Sweet Grape", "Earthy Base"],
    type: "indica-dominant",
    description: "A regal indica that commands attention with its bold fruit-forward terpene profile. Dense, resinous buds deliver a tropical flavor explosion followed by a deep, king-worthy body stone."
  },
  "Mac Stomper": {
    lineage: "MAC (Miracle Alien Cookies) × Stomper",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene", "Bisabolol"],
    effects: ["Potent Body Stone", "Mental Relaxation", "Pain Relief", "Sedation"],
    flavor: ["Diesel", "Gas", "Sweet Earth", "Pine", "Chemical"],
    type: "indica-dominant",
    description: "A heavy-footed indica that stomps through tension and stress. MAC Stomper combines the legendary MAC genetics with Stomper's raw power for a potent, full-body experience."
  },
  "Blockberry": {
    lineage: "Blueberry × Blockhead",
    terpenes: ["Myrcene", "Linalool", "Caryophyllene", "Ocimene"],
    effects: ["Deep Relaxation", "Sleepy", "Stress Relief", "Mood Elevation"],
    flavor: ["Rich Blueberry", "Sweet Earth", "Herbal", "Mild Grape"],
    type: "indica",
    description: "Blockberry is a heavy-hitting indica that wraps you in a warm blanket of blueberry sweetness. Ideal for evening use, this strain is a connoisseur's choice for unwinding after a long day."
  },
  "Babba B": {
    lineage: "Banana Kush × Bubba Kush",
    terpenes: ["Myrcene", "Caryophyllene", "Limonene", "Humulene"],
    effects: ["Heavy Relaxation", "Euphoric", "Body Stone", "Sedative"],
    flavor: ["Banana Cream", "Earthy Kush", "Sweet Tropical", "Spice"],
    type: "indica",
    description: "A tropical kush fusion that brings together the best of Banana Kush and Bubba Kush. Babba B delivers a heavy, sweet body high with unmistakable banana-cush undertones."
  },
  "Palm Kush": {
    lineage: "OG Kush × Purple Kush",
    terpenes: ["Myrcene", "Caryophyllene", "Limonene", "Pinene"],
    effects: ["Deep Sedation", "Muscle Relaxation", "Calm Euphoria"],
    flavor: ["Earthy Pine", "Grape", "Sweet Kush", "Woody"],
    type: "indica",
    description: "Palm Kush is a classic indica blend that channels the essence of OG and Purple Kush into a smooth, deeply relaxing smoke. Purple-tinged buds deliver grape and pine flavors with a heavy finish."
  },
  "Triple Cheese": {
    lineage: "UK Cheese × Cheese",
    terpenes: ["Caryophyllene", "Myrcene", "Ocimene", "Farnesene"],
    effects: ["Uplifting", "Creative", "Social", "Mild Body Relaxation"],
    flavor: ["Sharp Cheese", "Earthy", "Skunky", "Herbal"],
    type: "sativa-dominant",
    description: "A bold, unapologetic strain with a pungent cheese profile that demands attention. Triple Cheese delivers an uplifting sativa buzz perfect for creative sessions and social gatherings."
  },
  "WW2": {
    lineage: "White Widow × White Widow (Pheno-Hunt)",
    terpenes: ["Myrcene", "Caryophyllene", "Pinene", "Linalool"],
    effects: ["Balanced Euphoria", "Mental Clarity", "Gentle Body Relaxation"],
    flavor: ["Earthy Pine", "Woody", "Sweet Spice", "Citrus Edge"],
    type: "hybrid",
    description: "A refined White Widow phenotype that doubles down on resin production and balanced effects. WW2 offers the classic WW experience amplified — clear-headed euphoria with a gentle body anchor."
  },
  "D. Dog": {
    lineage: "Downward Dog × Sour Diesel",
    terpenes: ["Terpinolene", "Limonene", "Myrcene", "Pinene"],
    effects: ["Energetic", "Focused", "Uplifting", "Creative Drive"],
    flavor: ["Diesel", "Citrus", "Earthy Herbal", "Pine"],
    type: "sativa-dominant",
    description: "D. Dog channels the best of its Downward Dog and Sour Diesel heritage into a focused, energetic sativa experience. Ideal for daytime use, this strain sharpens the mind while keeping the body light."
  },
  "Sour D": {
    lineage: "Sour Diesel × Chemdawg",
    terpenes: ["Myrcene", "Limonene", "Caryophyllene", "Pinene"],
    effects: ["Cerebral Uplift", "Creative Energy", "Euphoric", "Social"],
    flavor: ["Sharp Diesel", "Sour Citrus", "Fuel", "Herbal"],
    type: "sativa-dominant",
    description: "The legendary Sour Diesel, reimagined. Sour D delivers that iconic diesel nose with a sharp citrus edge and an uplifting cerebral high that's perfect for daytime creativity and social engagement."
  },
  "Plat Kush Preroll": {
    lineage: "Platinum Kush × OG Kush",
    terpenes: ["Myrcene", "Caryophyllene", "Limonene", "Humulene"],
    effects: ["Deep Relaxation", "Sedative", "Stress Relief", "Body Stone"],
    flavor: ["Earthy Kush", "Sweet Grape", "Diesel", "Pine"],
    type: "indica",
    description: "Plat Kush Preroll delivers a pure indica experience in a ready-to-smoke format. Platinum genetics meet classic OG for a heavy, sedating body stone with rich earthy and grape flavors."
  },
  "Nag Champa Preroll": {
    lineage: "Indian Sativa × Afghani",
    terpenes: ["Pinene", "Caryophyllene", "Linalool", "Myrcene"],
    effects: ["Meditative", "Calm Focus", "Spiritual Uplift", "Mild Relaxation"],
    flavor: ["Incense", "Sandalwood", "Earthy Spice", "Floral"],
    type: "hybrid",
    description: "Named after the iconic Indian incense, Nag Champa Preroll offers a meditative, calming smoke with earthy spice and floral notes. A hybrid that brings the mind to stillness."
  },
  "Slurry Cane Preroll": {
    lineage: "Slurricane × Sour Tsunami",
    terpenes: ["Myrcene", "Caryophyllene", "Limonene", "Bisabolol"],
    effects: ["Deep Body Relaxation", "Pain Relief", "Euphoric Calm"],
    flavor: ["Sweet Berry", "Diesel", "Citrus", "Earthy"],
    type: "indica-dominant",
    description: "Slurry Cane Preroll combines the deep berry sweetness of Slurricane with the smooth, relaxing qualities of Sour Tsunami. A potent indica-dominant roll for unwinding."
  },
  "Stanky Cheese Preroll": {
    lineage: "Stank Master × UK Cheese",
    terpenes: ["Caryophyllene", "Myrcene", "Ocimene", "Farnesene"],
    effects: ["Uplifting", "Social", "Creative", "Mild Body Warmth"],
    flavor: ["Pungent Cheese", "Skunky", "Earthy", "Herbal"],
    type: "sativa-dominant",
    description: "Don't let the name fool you — Stanky Cheese Preroll is a flavor bomb with a sativa kick. Pungent, skunky, and undeniably bold, this roll is for those who appreciate a strong terpene profile."
  },
  "Fanta Sea Preroll": {
    lineage: "Fanta × Sea Weed",
    terpenes: ["Limonene", "Myrcene", "Terpinolene", "Ocimene"],
    effects: ["Tropical Uplift", "Happy", "Creative", "Light Body Relaxation"],
    flavor: ["Orange Citrus", "Sweet Tropical", "Salty Breeze", "Candy"],
    type: "sativa-dominant",
    description: "Fanta Sea Preroll is a tropical vacation in a joint. Bright citrus and sweet tropical flavors combine with an uplifting sativa buzz that brings sunshine to your session."
  },
  "Permanent Marker Preroll": {
    lineage: "Biscotti × Jealousy × Sherb BX1",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene", "Linalool"],
    effects: ["Potent Euphoria", "Deep Relaxation", "Creative Focus", "Mood Elevation"],
    flavor: ["Sweet Diesel", "Marker Ink", "Gas", "Vanilla"],
    type: "hybrid",
    description: "Permanent Marker Preroll lives up to its name with an unforgettable terpene profile. Sweet diesel, marker-like gas, and vanilla cream create a complex smoke with potent hybrid effects."
  },
  "Blockberry Preroll": {
    lineage: "Blueberry × Blockhead",
    terpenes: ["Myrcene", "Linalool", "Caryophyllene", "Ocimene"],
    effects: ["Deep Relaxation", "Sleepy", "Stress Relief"],
    flavor: ["Rich Blueberry", "Sweet Earth", "Herbal"],
    type: "indica",
    description: "The preroll version of our beloved Blockberry. Heavy blueberry sweetness with a deep indica body stone — perfect for a quick, potent evening session."
  },
  "Pau Hana Preroll": {
    lineage: "Hawaiian Hybrid",
    terpenes: ["Myrcene", "Limonene", "Terpinolene"],
    effects: ["Tropical Relaxation", "Happy", "Mild Euphoria"],
    flavor: ["Tropical Fruit", "Pineapple", "Coconut", "Sweet"],
    type: "hybrid",
    description: "Pau Hana means 'finished with work' in Hawaiian, and this preroll embodies that island chill. Tropical fruit flavors with a relaxed, happy hybrid high."
  },
  "Zoap Preroll": {
    lineage: "Rainbow Sherbet × Pink Guava",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene", "Linalool"],
    effects: ["Balanced", "Uplifting", "Mood Enhancing"],
    flavor: ["Floral Candy", "Tropical Sherbet", "Sweet Perfume"],
    type: "hybrid",
    description: "Zoap Preroll delivers the same floral candy and tropical sherbet experience in a convenient roll. A balanced hybrid that lifts the mood and soothes the body."
  },
  "Coffee Breath Preroll": {
    lineage: "Koffee × OGKB",
    terpenes: ["Myrcene", "Caryophyllene", "Limonene"],
    effects: ["Relaxing", "Centering", "Sedating"],
    flavor: ["Roasted Coffee", "Dark Chocolate", "Hazelnut"],
    type: "indica-dominant",
    description: "Coffee Breath Preroll is like a warm cup of espresso for your body. Rich roasted coffee and dark chocolate flavors lead into a deep, centering indica-dominant relaxation."
  },
  "Master Trainwreck Preroll": {
    lineage: "Mexican Sativa × Thai Sativa × Afghani Indica",
    terpenes: ["Terpinolene", "Myrcene", "Pinene"],
    effects: ["Euphoric", "Creative", "Cerebral", "Fast-Acting"],
    flavor: ["Pine", "Earthy", "Woody", "Citrus"],
    type: "sativa-dominant",
    description: "Master Trainwreck Preroll is a fast-acting sativa that hits like a freight train. Pine and citrus flavors kick off a cerebral euphoria perfect for creative endeavors."
  },
  "Tart Pops Preroll": {
    lineage: "Candy-Gelato Family",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene", "Ocimene"],
    effects: ["Relaxing", "Calming", "Balanced"],
    flavor: ["Tart Candy", "Citrus", "Sweet", "Fruit"],
    type: "hybrid",
    description: "Tart Pops Preroll delivers a sweet-tart candy flavor with balanced hybrid effects. A smooth, flavorful smoke for any time of day."
  },
  "Mango Juice 330ml": {
    lineage: "N/A - Cannabis-Infused Beverage",
    terpenes: ["Myrcene", "Limonene", "Terpinolene"],
    effects: ["Gradual Onset", "Full Body Relaxation", "Social Euphoria"],
    flavor: ["Sweet Mango", "Tropical", "Smooth Finish"],
    type: "hybrid",
    description: "A refreshing cannabis-infused mango juice that delivers a gradual, smooth onset of relaxation. Perfect for social gatherings or a quiet evening unwind."
  },
  "Mango Shots 50ml": {
    lineage: "N/A - Cannabis-Infused Concentrate Shot",
    terpenes: ["Myrcene", "Limonene"],
    effects: ["Fast Onset", "Potent Relaxation", "Mood Elevation"],
    flavor: ["Concentrated Mango", "Sweet", "Intense"],
    type: "hybrid",
    description: "A concentrated 50ml mango shot for those who want a potent, fast-acting experience. Intense mango flavor with a powerful full-body effect."
  },
  "Sobolo": {
    lineage: "N/A - Cannabis-Infused Hibiscus Beverage",
    terpenes: ["Myrcene", "Linalool", "Caryophyllene"],
    effects: ["Calming", "Mild Euphoria", "Refreshing"],
    flavor: ["Hibiscus", "Tart Berry", "Spiced", "Floral"],
    type: "hybrid",
    description: "Sobolo is a cannabis-infused hibiscus drink inspired by the West African classic. Tart, floral, and spiced with a calming, refreshing effect."
  },
  "Mini Bears (Sativa)": {
    lineage: "N/A - Cannabis-Infused Gummy",
    terpenes: ["Limonene", "Pinene", "Terpinolene"],
    effects: ["Energizing", "Focused", "Uplifting", "Creative"],
    flavor: ["Mixed Berry", "Sweet", "Tangy"],
    type: "sativa",
    description: "Sativa-dominant mini gummy bears that deliver a clean, energizing effect. Perfect for daytime use when you need focus and a mood boost."
  },
  "Donuts (Indica)": {
    lineage: "N/A - Cannabis-Infused Pastry",
    terpenes: ["Myrcene", "Caryophyllene", "Linalool"],
    effects: ["Deep Relaxation", "Sedating", "Body Stone"],
    flavor: ["Sweet Glazed", "Vanilla", "Doughy", "Rich"],
    type: "indica",
    description: "An indica-infused donut that combines sweet glazed pastry with deep body relaxation. A decadent treat for evening indulgence."
  },
  "Bones (Sativa)": {
    lineage: "N/A - Cannabis-Infused Edible",
    terpenes: ["Limonene", "Terpinolene", "Pinene"],
    effects: ["Energetic", "Uplifting", "Creative"],
    flavor: ["Sweet", "Fruity", "Candy"],
    type: "sativa",
    description: "Sativa-infused bone-shaped edibles that deliver a clean, energetic high. Fun to look at, potent in effect."
  },
  "Bones (Indica)": {
    lineage: "N/A - Cannabis-Infused Edible",
    terpenes: ["Myrcene", "Linalool", "Caryophyllene"],
    effects: ["Deep Relaxation", "Sedating", "Stress Relief"],
    flavor: ["Sweet", "Rich", "Candy"],
    type: "indica",
    description: "The indica counterpart to our Bones collection. A potent, relaxing edible for unwinding after a long day."
  },
  "Skulls (Sativa)": {
    lineage: "N/A - Cannabis-Infused Edible",
    terpenes: ["Limonene", "Pinene"],
    effects: ["Euphoric", "Creative", "Social"],
    flavor: ["Sweet", "Tangy", "Fruity"],
    type: "sativa",
    description: "Sativa skull edibles that bring creative energy and social euphoria. A spooky good time with a clean, uplifting effect."
  },
  "Skulls (Indica)": {
    lineage: "N/A - Cannabis-Infused Edible",
    terpenes: ["Myrcene", "Linalool"],
    effects: ["Sedating", "Body Stone", "Deep Relaxation"],
    flavor: ["Sweet", "Rich", "Berry"],
    type: "indica",
    description: "Indica skull edibles that deliver a heavy, sedating body stone. Perfect for nighttime use when you need to disconnect."
  },
  "Jelly Tots (Sativa)": {
    lineage: "N/A - Cannabis-Infused Gummy",
    terpenes: ["Limonene", "Terpinolene"],
    effects: ["Uplifting", "Playful", "Energetic"],
    flavor: ["Sweet Citrus", "Berry", "Tangy"],
    type: "sativa",
    description: "Sativa jelly tots that bring a playful, uplifting energy. Bright citrus and berry flavors with a clean sativa buzz."
  },
  "Jelly Tots (Indica)": {
    lineage: "N/A - Cannabis-Infused Gummy",
    terpenes: ["Myrcene", "Linalool", "Caryophyllene"],
    effects: ["Calming", "Relaxing", "Sleep Aid"],
    flavor: ["Sweet Berry", "Grape", "Smooth"],
    type: "indica",
    description: "Indica jelly tots that melt into deep relaxation. Sweet berry and grape flavors lead into a calming, sleep-inducing effect."
  },
  "Lollipop 10mg": {
    lineage: "N/A - Cannabis-Infused Hard Candy",
    terpenes: ["Limonene", "Myrcene"],
    effects: ["Mild Relaxation", "Mood Elevation", "Gradual Onset"],
    flavor: ["Sweet", "Fruity", "Classic Lollipop"],
    type: "hybrid",
    description: "A gentle 10mg THC lollipop perfect for microdosing. Sweet, fruity, and gradual — ideal for newcomers or those seeking subtle effects."
  },
  "Lollipop 25mg": {
    lineage: "N/A - Cannabis-Infused Hard Candy",
    terpenes: ["Limonene", "Caryophyllene"],
    effects: ["Moderate Euphoria", "Body Relaxation", "Mood Lift"],
    flavor: ["Sweet", "Bold Fruit", "Rich"],
    type: "hybrid",
    description: "A step up at 25mg, this lollipop delivers moderate euphoria and body relaxation. A balanced experience for the regular consumer."
  },
  "Lollipop 50mg": {
    lineage: "N/A - Cannabis-Infused Hard Candy",
    terpenes: ["Myrcene", "Caryophyllene", "Limonene"],
    effects: ["Strong Euphoria", "Deep Body Stone", "Sedating"],
    flavor: ["Intense Sweet", "Complex Fruit", "Long-Lasting"],
    type: "indica-dominant",
    description: "50mg of concentrated THC in a lollipop format. Strong euphoria leads into a deep body stone — not for the faint of heart."
  },
  "Lollipop 100mg": {
    lineage: "N/A - Cannabis-Infused Hard Candy",
    terpenes: ["Myrcene", "Caryophyllene", "Linalool"],
    effects: ["Potent Full-Body High", "Sedating", "Deep Relaxation", "Heavy Euphoria"],
    flavor: ["Maximum Sweet", "Intense", "Complex"],
    type: "indica",
    description: "The heavyweight champion of our lollipop lineup. 100mg of pure THC delivers a potent, full-body experience. Connoisseur-level potency."
  },
  "Snickers (Indica)": {
    lineage: "N/A - Cannabis-Infused Chocolate Bar",
    terpenes: ["Myrcene", "Caryophyllene", "Linalool"],
    effects: ["Deep Relaxation", "Body Stone", "Sedating"],
    flavor: ["Chocolate", "Caramel", "Peanut", "Rich Sweet"],
    type: "indica",
    description: "An indica-infused chocolate bar inspired by the classic Snickers. Rich chocolate, caramel, and peanut with a deep, sedating body stone."
  },
  "Snickers (Sativa)": {
    lineage: "N/A - Cannabis-Infused Chocolate Bar",
    terpenes: ["Limonene", "Pinene", "Terpinolene"],
    effects: ["Uplifting", "Energetic", "Creative"],
    flavor: ["Chocolate", "Caramel", "Peanut", "Bright"],
    type: "sativa",
    description: "The sativa version of our Snickers bar. Same rich chocolate-caramel-peanut flavor with an uplifting, energizing sativa effect."
  },
  "Brownie (Indica)": {
    lineage: "N/A - Cannabis-Infused Pastry",
    terpenes: ["Myrcene", "Caryophyllene", "Linalool"],
    effects: ["Heavy Body Stone", "Sedating", "Stress Relief"],
    flavor: ["Rich Chocolate", "Fudgy", "Sweet", "Buttery"],
    type: "indica",
    description: "A classic cannabis brownie done right. Rich, fudgy chocolate with a heavy indica body stone. The gold standard of edibles."
  },
  "Peanut Butter Cups (Indica)": {
    lineage: "N/A - Cannabis-Infused Candy",
    terpenes: ["Myrcene", "Linalool"],
    effects: ["Deep Relaxation", "Body Stone", "Calm"],
    flavor: ["Peanut Butter", "Chocolate", "Salty Sweet"],
    type: "indica",
    description: "Indica-infused peanut butter cups that combine salty-sweet chocolate with deep body relaxation. A perfect evening treat."
  },
  "Peanut Butter Cups (Sativa)": {
    lineage: "N/A - Cannabis-Infused Candy",
    terpenes: ["Limonene", "Pinene"],
    effects: ["Uplifting", "Focused", "Social"],
    flavor: ["Peanut Butter", "Chocolate", "Bright"],
    type: "sativa",
    description: "The sativa counterpart to our indica cups. Same rich peanut butter chocolate with an uplifting, social sativa effect."
  },
  "Rolo (Indica)": {
    lineage: "N/A - Cannabis-Infused Candy",
    terpenes: ["Myrcene", "Caryophyllene"],
    effects: ["Relaxing", "Body Stone", "Mood Elevation"],
    flavor: ["Caramel", "Chocolate", "Soft", "Rich"],
    type: "indica",
    description: "Indica-infused Rolo candies with a soft caramel center. Rich chocolate and caramel flavors with a relaxing indica body stone."
  },
  "Rolo (Sativa)": {
    lineage: "N/A - Cannabis-Infused Candy",
    terpenes: ["Limonene", "Terpinolene"],
    effects: ["Uplifting", "Happy", "Creative"],
    flavor: ["Caramel", "Chocolate", "Sweet", "Light"],
    type: "sativa",
    description: "Sativa Rolo candies that deliver the same caramel-chocolate goodness with an uplifting, creative sativa buzz."
  },
  "Marshmallow": {
    lineage: "N/A - Cannabis-Infused Confection",
    terpenes: ["Myrcene", "Limonene", "Linalool"],
    effects: ["Gentle Relaxation", "Mood Lift", "Calming"],
    flavor: ["Sweet Vanilla", "Soft", "Fluffy", "Classic"],
    type: "hybrid",
    description: "A cannabis-infused marshmallow that's soft, sweet, and gently relaxing. A light hybrid effect perfect for any time of day."
  },
  "Cookies": {
    lineage: "N/A - Cannabis-Infused Baked Good",
    terpenes: ["Myrcene", "Caryophyllene", "Limonene"],
    effects: ["Balanced Relaxation", "Mood Elevation", "Gentle Euphoria"],
    flavor: ["Buttery", "Sweet", "Vanilla", "Chocolate Chip"],
    type: "hybrid",
    description: "Classic cannabis-infused cookies with a balanced hybrid effect. Buttery, sweet, and comforting — the perfect edible companion."
  },
  "Suckers 10mg": {
    lineage: "N/A - Cannabis-Infused Hard Candy",
    terpenes: ["Limonene", "Myrcene"],
    effects: ["Mild Relaxation", "Gradual Onset", "Subtle Euphoria"],
    flavor: ["Sweet", "Fruity", "Classic"],
    type: "hybrid",
    description: "A gentle 10mg indica sucker for those who prefer a slow, subtle onset. Sweet and fruity with a calming finish."
  },
  "Suckers 25mg": {
    lineage: "N/A - Cannabis-Infused Hard Candy",
    terpenes: ["Limonene", "Caryophyllene"],
    effects: ["Moderate Relaxation", "Body Warmth", "Mood Lift"],
    flavor: ["Sweet", "Bold", "Fruity"],
    type: "indica-dominant",
    description: "25mg indica-dominant sucker with moderate effects. A step up in potency with a warm, relaxing body feel."
  },
  "Suckers 50mg": {
    lineage: "N/A - Cannabis-Infused Hard Candy",
    terpenes: ["Myrcene", "Caryophyllene", "Linalool"],
    effects: ["Strong Relaxation", "Body Stone", "Sedating"],
    flavor: ["Intense Sweet", "Deep Fruit", "Rich"],
    type: "indica",
    description: "50mg indica sucker for experienced consumers. Strong body stone with intense sweet fruit flavor."
  },
  "Suckers 100mg": {
    lineage: "N/A - Cannabis-Infused Hard Candy",
    terpenes: ["Myrcene", "Caryophyllene", "Linalool"],
    effects: ["Potent Sedation", "Heavy Body Stone", "Deep Relaxation"],
    flavor: ["Maximum Sweet", "Complex", "Intense"],
    type: "indica",
    description: "The ultimate indica sucker at 100mg. Potent sedation and a heavy body stone — for seasoned connoisseurs only."
  }
};

export function getStrainProfile(strainName: string): StrainProfile | null {
  const key = Object.keys(strainDatabase).find(
    k => k.toLowerCase() === strainName.toLowerCase()
  );
  return key ? strainDatabase[key] : null;
}

export function getTypeColor(type: StrainProfile["type"]): string {
  switch (type) {
    case "sativa":
      return "text-yellow-400 border-yellow-400/30";
    case "indica":
      return "text-purple-400 border-purple-400/30";
    case "sativa-dominant":
      return "text-yellow-300 border-yellow-300/30";
    case "indica-dominant":
      return "text-purple-300 border-purple-300/30";
    default:
      return "text-green-400 border-green-400/30";
  }
}
