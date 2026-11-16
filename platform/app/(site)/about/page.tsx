export const metadata = { title: 'About us' }
export default function Page() {
  return (
    <section className="sec"><div className="narrow prose">
      <div className="eyebrow">Shubh Nimantran</div>
      <h1 style={{ fontSize: 'clamp(34px,6vw,52px)', marginTop: 10 }}>About us</h1>
      <p style={{ marginTop: 16 }}>Shubh Nimantran creates digital wedding invitations for Indian families. We believe an invitation is the first glimpse of a celebration, so it should feel as considered as the wedding itself.</p>
      <p>Every design is drawn and animated by hand, then made simple enough for anyone to fill in from a phone. You add your names, photos and functions; we take care of the craft.</p>
      <h2>What we promise</h2>
      <ul><li>You always see your invitation before you pay.</li><li>Your photos and details stay private and are never used without permission.</li><li>Real help from a real person when you need it.</li></ul>
    </div></section>
  )
}
