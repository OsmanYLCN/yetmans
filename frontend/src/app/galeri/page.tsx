import Image from 'next/image';

export default function Galeri() {
  const photos = [
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1988&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1520338661084-5f1620a2e374?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=1974&auto=format&fit=crop",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-wider mb-4">Galeri</h1>
        <div className="w-20 h-1 bg-gold-500 mx-auto"></div>
        <p className="mt-6 text-gray-400 max-w-2xl mx-auto">Yetmans Barbershop'ta yarattığımız tarz ve kusursuz kesimlerimizden bazı kareler.</p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {photos.map((src, index) => (
          <div key={index} className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-sm border border-gold-500/10 hover:border-gold-500/50 transition-colors">
            <Image 
              src={src} 
              alt={`Galeri Görseli ${index + 1}`} 
              width={600} 
              height={800} 
              className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
