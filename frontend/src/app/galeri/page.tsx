import Image from 'next/image';

export default function Galeri() {
  const mediaList = [
    { type: 'video', src: '/gallery/video.mp4' },
    { type: 'image', src: '/gallery/1.jpeg' },
    { type: 'image', src: '/gallery/2.jpeg' },
    { type: 'image', src: '/gallery/3.jpeg' },
    { type: 'image', src: '/gallery/4.jpeg' },
    { type: 'image', src: '/gallery/5.jpeg' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-wider mb-4">Galeri</h1>
        <div className="w-20 h-1 bg-gold-500 mx-auto"></div>
        <p className="mt-6 text-gray-400 max-w-2xl mx-auto">Yetmans Barbershop'ta yarattığımız tarz ve kusursuz kesimlerimizden bazı kareler.</p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {mediaList.map((media, index) => (
          <div key={index} className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-sm border border-gold-500/10 hover:border-gold-500/50 transition-colors">
            {media.type === 'video' ? (
              <video 
                src={media.src} 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <Image 
                src={media.src} 
                alt={`Galeri Görseli ${index}`} 
                width={600} 
                height={800} 
                className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
