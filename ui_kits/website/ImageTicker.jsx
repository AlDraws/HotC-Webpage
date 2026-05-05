/* ImageTicker — marquee horizontal full-bleed */
function ImageTicker({ images = [], speed = 45 }) {
  const cells = [...images, ...images, ...images];
  return (
    <div className="hotc-ticker hotc-hover-pause" style={{ "--marquee-speed": speed + "s" }}>
      <div className="hotc-ticker__rail hotc-marquee" style={{ "--marquee-end": "-66.667%" }}>
        {cells.map((src, i) => (
          <div key={i} className="hotc-ticker__cell" style={{ backgroundImage: `url(${src})` }} />
        ))}
      </div>
    </div>
  );
}
window.ImageTicker = ImageTicker;
