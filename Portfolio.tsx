import { useState, useEffect, useRef, useCallback } from 'react';

interface BlobTrail {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

interface MousePos {
  x: number;
  y: number;
}

export default function Portfolio() {
  const [mousePos, setMousePos] = useState<MousePos>({ x: -200, y: -200 });
  const [blobPos, setBlobPos] = useState<MousePos>({ x: -200, y: -200 });
  const [isHovering, setIsHovering] = useState(false);
  const [trails, setTrails] = useState<BlobTrail[]>([]);
  const [velocity, setVelocity] = useState(0);
  const [waveOffset, setWaveOffset] = useState({ x: 0, y: 0 });
  
  const lastMousePos = useRef<MousePos>({ x: 0, y: 0 });
  const targetBlobPos = useRef<MousePos>({ x: -200, y: -200 });
  const currentBlobPos = useRef<MousePos>({ x: -200, y: -200 });
  const trailIdCounter = useRef(0);
  const animationFrameRef = useRef<number>();

  const nameRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLAnchorElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);

  const [invertStates, setInvertStates] = useState({
    name: false,
    portfolio: false,
    social: false
  });

  useEffect(() => {
    const animate = () => {
      const ease = 0.15; // Slightly smoother lag for more fluid feel
      currentBlobPos.current.x += (targetBlobPos.current.x - currentBlobPos.current.x) * ease;
      currentBlobPos.current.y += (targetBlobPos.current.y - currentBlobPos.current.y) * ease;
      
      setBlobPos({
        x: currentBlobPos.current.x,
        y: currentBlobPos.current.y
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const newX = e.clientX;
    const newY = e.clientY;
    
    const dx = newX - lastMousePos.current.x;
    const dy = newY - lastMousePos.current.y;
    const speed = Math.sqrt(dx * dx + dy * dy);
    
    setVelocity(speed);
    setMousePos({ x: newX, y: newY });
    targetBlobPos.current = { x: newX, y: newY };
    
    // Initialize blob position immediately on first move
    if (!isHovering || (currentBlobPos.current.x < 0 && currentBlobPos.current.y < 0)) {
      currentBlobPos.current = { x: newX, y: newY };
      setBlobPos({ x: newX, y: newY });
    }
    
    setWaveOffset({
      x: (newX / window.innerWidth - 0.5) * 20,
      y: (newY / window.innerHeight - 0.5) * 20
    });

    if (speed > 5 && isHovering) {
      const trailCount = Math.min(Math.floor(speed / 12), 4); // More pronounced trails
      const newTrails: BlobTrail[] = [];
      
      for (let i = 0; i < trailCount; i++) {
        newTrails.push({
          id: trailIdCounter.current++,
          x: newX - dx * (i * 0.25),
          y: newY - dy * (i * 0.25),
          size: Math.max(70 - speed * 0.25 - i * 12, 25),
          opacity: 0.7 - i * 0.12
        });
      }
      
      setTrails(prev => [...prev.slice(-15), ...newTrails]);
    }

    lastMousePos.current = { x: newX, y: newY };
  }, [isHovering]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrails(prev => 
        prev
          .map(trail => ({ ...trail, opacity: trail.opacity - 0.03, size: trail.size * 0.97 }))
          .filter(trail => trail.opacity > 0)
      );
    }, 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkIntersection = () => {
      const blobRadius = 100; // Slightly larger detection radius for better hover
      const blobCenter = { x: blobPos.x, y: blobPos.y };

      const checkElement = (ref: React.RefObject<HTMLElement | null>) => {
        if (!ref.current) return false;
        const rect = ref.current.getBoundingClientRect();
        const elementCenter = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        const distance = Math.sqrt(
          Math.pow(blobCenter.x - elementCenter.x, 2) +
          Math.pow(blobCenter.y - elementCenter.y, 2)
        );
        return distance < blobRadius + Math.max(rect.width, rect.height) / 2;
      };

      setInvertStates({
        name: checkElement(nameRef),
        portfolio: checkElement(portfolioRef),
        social: checkElement(socialRef)
      });
    };

    checkIntersection();
  }, [blobPos]);

  const getParallax = (intensity: number) => ({
    transform: `translate(${-waveOffset.x * intensity}px, ${-waveOffset.y * intensity}px)`
  });

  return (
    <div
      className="relative w-screen h-screen overflow-hidden cursor-none"
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => {
        setIsHovering(true);
        // Initialize blob position on enter
        const x = e.clientX;
        const y = e.clientY;
        currentBlobPos.current = { x, y };
        targetBlobPos.current = { x, y };
        setBlobPos({ x, y });
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        targetBlobPos.current = { x: -200, y: -200 };
        currentBlobPos.current = { x: -200, y: -200 };
        setBlobPos({ x: -200, y: -200 });
      }}
      style={{ backgroundColor: '#ffffff' }}
    >
      {/* Animated Wave Background - Subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute w-full h-full opacity-[0.08]"
          style={{
            transform: `translate(${waveOffset.x * 0.3}px, ${waveOffset.y * 0.3}px)`
          }}
        >
          {[...Array(4)].map((_, i) => (
            <path
              key={i}
              d={`M-100 ${200 + i * 180} Q ${250 + Math.sin(Date.now() / 2500 + i) * 40} ${150 + i * 180} 500 ${200 + i * 180} T 1100 ${200 + i * 180} T 1700 ${200 + i * 180} T 2300 ${200 + i * 180}`}
              fill="none"
              stroke="#000"
              strokeWidth="0.5"
              className="animate-wave"
              style={{
                animationDelay: `${i * 0.6}s`,
                animationDuration: `${10 + i * 1.5}s`
              }}
            />
          ))}
        </svg>
      </div>

      {/* Base Image (IMAGE ONE) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('./Image 1.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          ...getParallax(0.3)
        }}
      />

      {/* SVG Filter for Gooey Effect */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Blob Mask Reveal Layer (IMAGE TWO) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          clipPath: isHovering && blobPos.x > 0 && blobPos.y > 0
            ? `url(#blobClip)` 
            : 'circle(0px at -100px -100px)',
          transition: 'clip-path 0.1s ease-out',
          ...getParallax(0.3)
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('./image 2.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </div>

      {/* Blob SVG Clip Path */}
      <svg 
        className="absolute w-0 h-0"
        style={{ position: 'absolute', width: 0, height: 0 }}
      >
        <defs>
          <clipPath id="blobClip" clipPathUnits="userSpaceOnUse">
            <circle
              cx={blobPos.x}
              cy={blobPos.y}
              r={100 + velocity * 0.25}
            />
            {trails.map(trail => (
              <circle
                key={trail.id}
                cx={trail.x}
                cy={trail.y}
                r={trail.size * trail.opacity}
              />
            ))}
          </clipPath>
        </defs>
      </svg>

      {/* Visual Blob Cursor */}
      <div
        className="fixed pointer-events-none z-50"
        style={{
          filter: 'url(#goo)',
          opacity: isHovering ? 1 : 0,
          transition: 'opacity 300ms ease'
        }}
      >
        <div
          className="absolute rounded-full bg-black/5 backdrop-blur-sm border border-white/20"
          style={{
            width: 200 + velocity * 0.5,
            height: 200 + velocity * 0.5,
            left: blobPos.x - (100 + velocity * 0.25),
            top: blobPos.y - (100 + velocity * 0.25),
            transition: 'width 0.1s, height 0.1s'
          }}
        />
        {trails.map(trail => (
          <div
            key={trail.id}
            className="absolute rounded-full bg-black/5"
            style={{
              width: trail.size * 2,
              height: trail.size * 2,
              left: trail.x - trail.size,
              top: trail.y - trail.size,
              opacity: trail.opacity
            }}
          />
        ))}
      </div>

      {/* Name - Top Left */}
      <div
        ref={nameRef}
        className="absolute top-8 left-8 z-10 select-none"
        style={{
          ...getParallax(0.5),
          transition: 'color 300ms ease'
        }}
      >
        <h1
          className="font-serif leading-none tracking-tight"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: invertStates.name ? '#ffffff' : '#1a1a1a',
            transition: 'color 300ms ease',
            textShadow: invertStates.name ? '0 2px 10px rgba(0,0,0,0.3)' : 'none',
            fontSize: 'clamp(3rem, 8vw, 6rem)'
          }}
        >
          <span className="block font-light">Kaleb</span>
          <span className="block font-semibold mt-1">Kassa</span>
        </h1>
      </div>

      {/* Portfolio Link - Top Right */}
      <a
        ref={portfolioRef}
        href="#portfolio"
        className="absolute top-8 right-8 z-10 text-lg tracking-widest uppercase select-none"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          color: invertStates.portfolio ? '#ffffff' : '#1a1a1a',
          transition: 'color 300ms ease',
          textShadow: invertStates.portfolio ? '0 2px 10px rgba(0,0,0,0.3)' : 'none',
          ...getParallax(0.5)
        }}
      >
        Portfolio
      </a>

      {/* Social Icons - Bottom Right */}
      <div
        ref={socialRef}
        className="absolute bottom-8 right-8 z-10 flex items-center gap-5"
        style={getParallax(0.5)}
      >
        {/* Instagram */}
        <a
          href="https://www.instagram.com/klbksa/"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon"
          style={{
            color: invertStates.social ? '#ffffff' : '#1a1a1a',
            filter: invertStates.social ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' : 'none',
            transition: 'all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.2) rotate(5deg)';
            e.currentTarget.style.filter = invertStates.social 
              ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.4)) brightness(1.2)' 
              : 'drop-shadow(0 8px 16px rgba(0,0,0,0.2)) brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1) rotate(0deg)';
            e.currentTarget.style.filter = invertStates.social 
              ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' 
              : 'none';
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>

        {/* X/Twitter */}
        <a
          href="https://x.com/hasabRocky"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon"
          style={{
            color: invertStates.social ? '#ffffff' : '#1a1a1a',
            filter: invertStates.social ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' : 'none',
            transition: 'all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.2) rotate(-5deg)';
            e.currentTarget.style.filter = invertStates.social 
              ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.4)) brightness(1.2)' 
              : 'drop-shadow(0 8px 16px rgba(0,0,0,0.2)) brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1) rotate(0deg)';
            e.currentTarget.style.filter = invertStates.social 
              ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' 
              : 'none';
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>

        {/* YouTube */}
        <a
          href="https://www.youtube.com/@Derejamp4"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon"
          style={{
            color: invertStates.social ? '#ffffff' : '#1a1a1a',
            filter: invertStates.social ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' : 'none',
            transition: 'all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.2) rotate(5deg)';
            e.currentTarget.style.filter = invertStates.social 
              ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.4)) brightness(1.2)' 
              : 'drop-shadow(0 8px 16px rgba(0,0,0,0.2)) brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1) rotate(0deg)';
            e.currentTarget.style.filter = invertStates.social 
              ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' 
              : 'none';
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </a>

        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/in/kaleb-kassa-92b2b8233"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon"
          style={{
            color: invertStates.social ? '#ffffff' : '#1a1a1a',
            filter: invertStates.social ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' : 'none',
            transition: 'all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.2) rotate(-5deg)';
            e.currentTarget.style.filter = invertStates.social 
              ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.4)) brightness(1.2)' 
              : 'drop-shadow(0 8px 16px rgba(0,0,0,0.2)) brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1) rotate(0deg)';
            e.currentTarget.style.filter = invertStates.social 
              ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' 
              : 'none';
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
      </div>

      {/* Custom cursor dot */}
      <div
        className="fixed w-2 h-2 bg-black rounded-full pointer-events-none z-50 mix-blend-difference"
        style={{
          left: mousePos.x - 4,
          top: mousePos.y - 4,
          opacity: isHovering ? 1 : 0,
          transition: 'opacity 300ms ease'
        }}
      />

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700&display=swap');
        
        @keyframes wave {
          0%, 100% {
            d: path("M-100 200 Q 250 150 500 200 T 1100 200 T 1700 200 T 2300 200");
          }
          50% {
            d: path("M-100 200 Q 250 250 500 200 T 1100 200 T 1700 200 T 2300 200");
          }
        }
        
        .animate-wave {
          animation: wave-move 8s ease-in-out infinite;
        }
        
        @keyframes wave-move {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-50px);
          }
        }
        
        .social-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          will-change: transform, filter;
          backface-visibility: hidden;
          transform-origin: center center;
        }
        
        .social-icon svg {
          display: block;
          width: 24px;
          height: 24px;
        }
        
        @keyframes socialPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .social-icon:hover {
          animation: socialPulse 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}

