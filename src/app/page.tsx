import Link from "next/link";

const stars = ["✦", "✧", "✦", "✧", "✦"];

export default function Home() {
  return (
    <main className="landing">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <Link className="wordmark" href="/">IKYD<span>✦</span></Link>
        <span className="topbar-note">A little game of hidden rules</span>
      </header>

      <section className="hero">
        <div className="eyebrow"><span /> THE TABLE IS YOURS <span /></div>
        <h1>I KNOW<span className="title-soft">…</span><br />YOU DON’T<span className="title-star">✳</span></h1>
        <p className="hero-copy">
          Everyone sees the same cards.<br />
          Only one person knows why they fit.
        </p>
        <div className="hero-actions">
          <button className="primary-button" type="button" disabled>
            Create a room <span>↗</span>
          </button>
          <button className="secondary-button" type="button" disabled>
            Join a room
          </button>
        </div>
        <p className="coming-soon">ROOMS ARE GETTING READY</p>
      </section>

      <section className="preview" aria-label="Character card preview">
        <div className="preview-caption"><span>THE DECK</span><span>01 — 72</span></div>
        <div className="card-fan">
          <article className="sample-card card-pink">
            <div className="card-top"><span>IKYD</span><span>01</span></div>
            <div className="animal-art">🐱</div>
            <div className="card-bottom"><strong>MOCHI</strong><b>1</b></div>
          </article>
          <article className="sample-card card-blue">
            <div className="card-top"><span>IKYD</span><span>02</span></div>
            <div className="animal-art">🐸</div>
            <div className="card-bottom"><strong>RIBBIT</strong><b>4</b></div>
          </article>
          <article className="sample-card card-gold">
            <div className="card-top"><span>IKYD</span><span>03</span></div>
            <div className="animal-art">🐰</div>
            <div className="card-bottom"><strong>BUNBUN</strong><b>2</b></div>
          </article>
        </div>
        <div className="preview-foot">{stars.map((star, i) => <span key={i}>{star}</span>)}</div>
      </section>

      <footer className="footer">
        <span>MADE FOR FRIENDS, AND A LITTLE MYSTERY.</span>
        <span>3–7 PLAYERS · PRIVATE ROOMS</span>
      </footer>
    </main>
  );
}
