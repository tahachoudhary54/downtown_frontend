export const products = [
  { id: "1", name: "Midnight Navy Polo", price: "₹2,499", img: "/luxury_polo.png", description: "Experience true luxury with the Midnight Navy Polo. Crafted from premium materials with meticulous attention to detail, this piece offers a perfect blend of sophisticated style and unparalleled comfort." },
  { id: "2", name: "Classic White Oxford", price: "₹3,299", img: "/sleek_button_down.png", description: "A staple for any wardrobe, this Classic White Oxford shirt brings an air of sophistication to your look, featuring crisp, clean lines and premium breathable fabric." },
  { id: "3", name: "Earth Tone Cashmere", price: "₹5,499", img: "/elegant_sweater.png", description: "Stay warm and effortlessly stylish in this Earth Tone Cashmere. Woven from the finest fibers, it provides unparalleled softness and a perfect, tailored fit." },
  { id: "4", name: "Premium Velvet Blazer", price: "₹8,999", img: "/product_image.png", description: "Make a bold statement with the Premium Velvet Blazer. Its rich texture and meticulous tailoring make it the ultimate choice for an elevated evening look." },
  { id: "5", name: "Signature Velvet Jacket", price: "₹8,999", img: "/product_image.png", description: "Step out in unparalleled style with the Signature Velvet Jacket. Designed for those who appreciate the finer things, it combines classic elegance with modern flair." },
  { id: "6", name: "Premium Navy Polo", price: "₹2,799", img: "/luxury_polo.png", description: "An everyday essential elevated to luxury status. The Premium Navy Polo offers exceptional comfort and a sleek silhouette perfect for any casual occasion." },
  { id: "7", name: "Autumn Cashmere Blend", price: "₹6,499", img: "/elegant_sweater.png", description: "Embrace the cooler months with our Autumn Cashmere Blend. Incredibly soft and rich in color, it's a testament to refined craftsmanship." },
  { id: "8", name: "Executive Oxford Shirt", price: "₹3,499", img: "/sleek_button_down.png", description: "Command attention in the boardroom with the Executive Oxford Shirt. Tailored for success, it features premium cotton for all-day comfort and sharpness." }
];

export const getProductById = (id) => products.find(p => p.id === id);
