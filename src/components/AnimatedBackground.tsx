const AnimatedBackground = () => (
  <div className="fixed inset-0" style={{ zIndex: 0, background: 'hsl(20 100% 97%)' }} aria-hidden="true">
    {/* Large pink organic blob - top left */}
    <svg className="absolute -top-20 -left-20 w-[420px] h-[420px]" viewBox="0 0 420 420" style={{ animation: 'orb-float-1 45s ease-in-out infinite' }}>
      <path
        d="M210 40c80 0 150 40 170 110s-10 140-70 180-130 50-190 20S30 270 20 190 130 40 210 40z"
        fill="hsl(var(--soft-pink))"
        opacity="0.35"
      />
    </svg>

    {/* Medium lavender blob - top right */}
    <svg className="absolute -top-10 -right-16 w-[320px] h-[320px]" viewBox="0 0 320 320" style={{ animation: 'orb-float-2 55s ease-in-out infinite' }}>
      <path
        d="M160 30c70-10 140 30 150 100s-20 130-80 160-120 30-170 0S30 200 40 130 90 40 160 30z"
        fill="hsl(var(--lavender))"
        opacity="0.25"
      />
    </svg>

    {/* Small pink accent blob - mid right */}
    <svg className="absolute top-[35%] -right-10 w-[260px] h-[260px]" viewBox="0 0 260 260" style={{ animation: 'orb-float-3 50s ease-in-out infinite' }}>
      <path
        d="M130 20c60 0 110 40 120 100s-30 110-80 130-100 10-130-20S20 140 30 80 70 20 130 20z"
        fill="hsl(var(--soft-pink))"
        opacity="0.2"
      />
    </svg>

    {/* Bottom left mint blob */}
    <svg className="absolute -bottom-16 -left-16 w-[380px] h-[380px]" viewBox="0 0 380 380" style={{ animation: 'orb-float-4 60s ease-in-out infinite' }}>
      <path
        d="M190 30c80 10 150 60 160 140s-40 140-110 170-140 10-180-30S20 190 40 120 110 20 190 30z"
        fill="hsl(var(--mint))"
        opacity="0.2"
      />
    </svg>

    {/* Bottom right pink wave */}
    <svg className="absolute -bottom-20 -right-20 w-[350px] h-[350px]" viewBox="0 0 350 350" style={{ animation: 'orb-float-1 52s ease-in-out infinite' }}>
      <path
        d="M175 30c70 0 140 50 150 120s-20 120-80 160-110 30-160 0S20 220 30 150 105 30 175 30z"
        fill="hsl(var(--soft-pink))"
        opacity="0.18"
      />
    </svg>

    {/* Decorative curved white lines like the reference */}
    <svg className="absolute top-[15%] left-[10%] w-[200px] h-[200px] opacity-20" viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="2" />
      <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="1.5" />
    </svg>

    {/* Decorative leaf/floral line art */}
    <svg className="absolute top-[8%] right-[15%] w-[100px] h-[100px] opacity-15" viewBox="0 0 100 100" fill="none">
      <path d="M50 10c0 30-20 50-40 60 20-5 35-25 40-60z" stroke="hsl(var(--lavender))" strokeWidth="1.5" fill="hsl(var(--lavender))" fillOpacity="0.1" />
      <path d="M50 10c0 30 20 50 40 60-20-5-35-25-40-60z" stroke="hsl(var(--lavender))" strokeWidth="1.5" fill="hsl(var(--lavender))" fillOpacity="0.1" />
    </svg>

    <svg className="absolute bottom-[20%] left-[5%] w-[80px] h-[80px] opacity-10" viewBox="0 0 80 80" fill="none">
      <path d="M40 10c0 25-15 40-30 50 15-5 27-20 30-50z" stroke="hsl(var(--soft-pink))" strokeWidth="1.5" fill="hsl(var(--soft-pink))" fillOpacity="0.15" />
      <path d="M40 10c0 25 15 40 30 50-15-5-27-20-30-50z" stroke="hsl(var(--soft-pink))" strokeWidth="1.5" fill="hsl(var(--soft-pink))" fillOpacity="0.15" />
    </svg>
  </div>
);

export default AnimatedBackground;
