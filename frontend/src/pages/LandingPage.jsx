import { useState, useEffect, useRef } from 'react';

function useScrollFade() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, visible] = useScrollFade();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function StatCard({ num, label }) {
  return (
    <div className="lp-card-smooth" style={{
      background: '#F0F4FC',
      border: '1.5px solid #EC0B48',
      borderRadius: '1rem',
      padding: '1.5rem 1.25rem',
      textAlign: 'left',
      boxShadow: '0 4px 16px rgba(240,244,252,1)',
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4C539F', lineHeight: 1 }}>{num}</div>
      <div style={{ fontSize: '0.875rem', color: '#393C46', marginTop: '0.35rem' }}>{label}</div>
    </div>
  );
}

function FaqItem({ q, a, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      onClick={() => setOpen(o => !o)}
      className="lp-card-smooth"
      style={{ background: '#F0F4FC', border: '1.5px solid #EC0B48', borderRadius: '1rem', padding: '0.875rem 1rem', cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#4C539F', flex: 1 }}>{q}</span>
        <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: 'rgba(216,218,220,0.70)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
          <svg viewBox="0 0 10 6" width="10" height="6" style={{ fill: 'rgba(76,83,159,0.90)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}>
            <polygon points="0,0 10,0 5,6" />
          </svg>
        </div>
      </div>
      <div className={`lp-faq-body ${open ? 'open' : ''}`}>
        <p style={{ fontSize: '0.8125rem', color: '#393C46', margin: '0.5rem 0 0', lineHeight: 1.55 }}>{a}</p>
      </div>
    </div>
  );
}

export default function LandingPage({ onOpenChat }) {
  const primaryBtn = {
    border: 'none',
    borderRadius: '999px',
    padding: '0.9rem 1.9rem',
    background: 'linear-gradient(135deg, #4C539F 0%, #EC0B48 100%)',
    color: '#ffffff',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 18px 36px rgba(76, 83, 159, 0.18)',
  };
  const secondaryBtn = {
    border: '1.5px solid rgba(76,83,159,0.24)',
    borderRadius: '999px',
    padding: '0.9rem 1.9rem',
    background: 'rgba(255,255,255,0.88)',
    color: '#4C539F',
    fontWeight: 700,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* HERO */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'radial-gradient(circle at top left, rgba(255,255,255,0.96) 0%, rgba(196,214,255,0.62) 28%, transparent 50%), radial-gradient(circle at 100% 15%, rgba(76,83,159,0.18) 0%, transparent 40%), linear-gradient(180deg, #eef2ff 0%, #d7e1ff 45%, #ffffff 100%)',
      }}>

        {/* NAV */}
        <nav style={{ padding: '1.25rem 2rem' }}>
          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#000000' }}>Blinc Logo</span>
        </nav>

        {/* centered content */}
        <div className="lp-fade-up" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem 2rem 6rem',
        }}>
          <h1 style={{ margin: '0 0 0.25rem', lineHeight: 1.2 }}>
            <span style={{ display: 'block', fontSize: 'clamp(1.75rem, 3.5vw, 2.625rem)', fontWeight: 700, color: '#4C539F' }}>
              Intern smarter at
            </span>
            <span style={{
              display: 'block',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              background: 'linear-gradient(90deg, #F50642 0%, #A62A6E 33%, #923379 55%, #5F4A94 77%, #4E529E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              BLINC Technologies
            </span>
          </h1>

          <p style={{ fontSize: '0.9375rem', color: '#393C46', maxWidth: '480px', margin: '1rem auto 1.75rem', lineHeight: 1.65 }}>
            Bitsy, the AI chatbot answers all your questions about BLIP (BLINC
            Internship Program) - instantly, accurately, any time of day.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onOpenChat} style={primaryBtn}>
              Ask Bitsy now
            </button>
            <a href="https://www.blinc.ph" target="_blank" rel="noopener noreferrer" style={secondaryBtn}>
              View BLIP page
            </a>
          </div>
        </div>

      </section>

      {/* CHALLENGE + SOLUTION */}
      <section style={{
        background: 'radial-gradient(ellipse 80% 100% at 50% 50%, #FFFFFF 0%, #DADDFF 45%, #A2A8FE 70%, #6069FF 100%)',
        padding: '5rem 2rem',
      }}>

        {/* CHALLENGE */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <FadeIn><h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#4C539F', margin: '0 0 0.5rem', letterSpacing: '-0.01em' }}>THE CHALLENGE</h2></FadeIn>
          <FadeIn delay={0.1}><p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(76,83,159,0.84)', letterSpacing: '0.08em', margin: '0 0 0.75rem' }}>INTERNSHIP QUESTIONS SLOW YOU DOWN.</p></FadeIn>
          <FadeIn delay={0.2}><p style={{ fontSize: '0.9rem', color: '#393C46', maxWidth: '520px', margin: '0 auto 3rem', lineHeight: 1.65 }}>Most interns have the same set of concerns before they even apply — and waiting days for an email reply shouldn't stop you from moving forward.</p></FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', maxWidth: '1000px', margin: '0 auto' }}>
            {[
              { icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#4C539F" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Slow response times', body: 'Sending emails and waiting 2–3 days for answers costs you preparation time during critical application windows.' },
              { icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#4C539F" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="13" y2="15"/></svg>, title: 'Unclear requirements', body: "What documents do I need? Is my school a partner? What MOA applies to me? Questions pile up before you start." },
              { icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#4C539F" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, title: 'Role confusion', body: "Web Dev, Mobile, Design, or Social Media — it's hard to know which BLIP team is the right fit without clear info." },
              { icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#4C539F" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, title: 'Missing batch windows', body: 'Batches open in January, May, and September. Missing the right window means a months-long wait to reapply.' },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '50%', background: '#D8DADC', border: '2px solid #EC0B48', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '-1.375rem', position: 'relative', zIndex: 1 }}>{icon}</div>
                <div className="lp-card-smooth" style={{ background: '#F0F4FC', border: '1.5px solid #EC0B48', borderRadius: '1rem', padding: '2.25rem 1.25rem 1.25rem', boxShadow: '0 4px 16px rgba(240,244,252,1)', textAlign: 'left', width: '100%' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4C539F', margin: '0 0 0.5rem' }}>{title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: '#393C46', margin: 0, lineHeight: 1.6 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SOLUTION */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 280px', minWidth: '200px' }}>
            <FadeIn><h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 900, color: '#4C539F', margin: '0 0 0.75rem', lineHeight: 1.05 }}>THE<br />SOLUTION</h2></FadeIn>
            <FadeIn delay={0.1}><p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(76,83,159,0.84)', letterSpacing: '0.07em', margin: '0 0 0.75rem' }}>BITSY KNOWS BLIP INSIDE AND OUT</p></FadeIn>
            <FadeIn delay={0.15}><p style={{ fontSize: '0.875rem', color: '#393C46', lineHeight: 1.65, margin: '0 0 0.75rem' }}>Bitsy is trained on all official BLINC internship information - roles, hiring steps, documents, school partnerships, and schedules - so you get the right answer immediately.</p></FadeIn>
            <FadeIn delay={0.2}><p style={{ fontSize: '0.875rem', color: '#393C46', lineHeight: 1.65, margin: 0 }}>No waiting. No guessing. Just clear guidance whenever you need it.</p></FadeIn>
          </div>
          <div style={{ flex: 1, minWidth: '280px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { n: '01', title: 'Application documents', body: 'Endorsement letter, LOI, CV, portfolio - exactly what to submit' },
              { n: '02', title: 'Hiring process', body: 'All 6 steps from initial submission to onboarding' },
              { n: '03', title: 'Role responsibilities', body: "Detailed breakdown of each BLIP team's work and requirements", center: true },
              { n: '04', title: 'Partner schools & MOA', body: 'Whether your school is partnered and what agreement applies' },
              { n: '05', title: 'Batch schedules', body: 'Exact months when new internship batches open' },
            ].map(({ n, title, body, center }) => (
              <div key={n} style={{ gridColumn: center ? '1 / -1' : undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: center ? '260px' : undefined, margin: center ? '0 auto' : undefined }}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#D8DADC', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#393C46', marginBottom: '-1.25rem', position: 'relative', zIndex: 1 }}>{n}</div>
                <div className="lp-card-smooth" style={{ background: '#F0F4FC', border: '1.5px solid #EC0B48', borderRadius: '1rem', padding: '1.75rem 1rem 1rem', boxShadow: '0 4px 16px rgba(240,244,252,1)', textAlign: 'center', width: '100%' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4C539F', margin: '0 0 0.35rem' }}>{title}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#393C46', margin: 0, lineHeight: 1.55 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ABOUT BLINC */}
      <section style={{
        background: 'radial-gradient(ellipse 60% 100% at 50% 50%, #FFFFFF 0%, #DADDFF 45%, #A2A8FE 70%, #6069FF 100%)',
        padding: '5rem 2rem',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ maxWidth: '900px', width: '100%' }}>
          <FadeIn><h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#4C539F', margin: '0 0 0.5rem', letterSpacing: '-0.01em' }}>ABOUT BLINC</h2></FadeIn>
          <FadeIn delay={0.1}><p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(76,83,159,0.84)', letterSpacing: '0.07em', margin: '0 0 1rem' }}>A BLOCKCHAIN &amp; WEB TECHNOLOGY COMPANY – BASED IN BAGUIO</p></FadeIn>
          <FadeIn delay={0.2}><p style={{ fontSize: '0.9rem', color: '#393C46', maxWidth: '640px', margin: '0 auto 3.5rem', lineHeight: 1.65 }}>BITSHARES LABS, INC. (BLINC) builds blockchain platforms, web and mobile applications, and digital products. We're passionate, competitive, and flexible and we invest in the next generation of tech talent through BLIP.</p></FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', maxWidth: '580px', margin: '0 auto' }}>
            <div style={{ justifySelf: 'end', width: '220px' }}><StatCard num="212+" label="Total interns trained" /></div>
            <div style={{ justifySelf: 'start', width: '220px' }}><StatCard num="15" label="Batches completed" /></div>
            <div style={{ justifySelf: 'start', width: '220px' }}><StatCard num="11" label="Interns hired full-time" /></div>
            <div style={{ justifySelf: 'end', width: '220px' }}><StatCard num="50+" label="Industry partners" /></div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section style={{
        background: 'radial-gradient(ellipse 80% 100% at 20% 60%, #6069FF 0%, #A2A8FE 30%, #DADDFF 55%, #FFFFFF 80%)',
        padding: '5rem 2rem',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', display: 'flex', gap: '3rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* LEFT */}
          <div style={{ flex: '0 0 300px', minWidth: '220px' }}>
            <FadeIn><h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#4C539F', margin: '0 0 0.5rem' }}>FAQs</h2></FadeIn>
            <FadeIn delay={0.1}><p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(76,83,159,0.84)', letterSpacing: '0.07em', margin: '0 0 0.5rem' }}>EVERYTHING INTERNS ASK BEFORE APPLYING</p></FadeIn>
            <FadeIn delay={0.15}><p style={{ fontSize: '0.875rem', color: '#393C46', margin: '0 0 0.5rem', lineHeight: 1.6 }}>These are the real questions that come up during BLIP recruitment.</p></FadeIn>
            <FadeIn delay={0.2}><p style={{ fontSize: '0.875rem', color: '#393C46', margin: '0 0 1.75rem', lineHeight: 1.6 }}>Bitsy can answer all of these - and more.</p></FadeIn>
            <div style={{ background: '#F0F4FC', border: '1.5px solid #EC0B48', borderRadius: '1rem', padding: '1.25rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4C539F', margin: '0 0 0.5rem' }}>STILL HAVE A QUESTIONS?</p>
              <p style={{ fontSize: '0.8125rem', color: '#393C46', margin: '0 0 0.875rem', lineHeight: 1.55 }}>
                Can't find the answer to your question? Send us an email and we'll get back to you as soon as possible.
              </p>
              <button className="lp-btn-smooth" style={{ border: '1.5px solid #4C539F', borderRadius: '999px', padding: '0.4rem 1.25rem', background: 'transparent', color: '#393C46', fontSize: '0.875rem', cursor: 'pointer' }}>
                Send Email
              </button>
            </div>
          </div>

          {/* RIGHT — accordion */}
          <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { q: 'WHEN DOES THE NEXT BLIP BATCH OPEN?', a: 'The next batch for the BLINC Internship Program (BLIP) typically opens in the spring. Please keep an eye on our official BLINC Technologies careers page for the most up-to-date information and application deadlines.' },
              { q: 'WHAT DOCUMENTS DO I NEED TO SUBMIT?', a: 'Endorsement letter, LOI, CV, and portfolio — exactly what to submit.' },
              { q: "WHAT IF MY SCHOOL ISN'T A PARTNER SCHOOL?", a: 'Contact BLINC directly to check if your school has an MOA or can apply as a non-partner.' },
              { q: 'HOW DO I KNOW WHICH BLIP TEAM TO APPLY TO?', a: 'Ask Bitsy for a detailed breakdown of each team.' },
              { q: 'IS THERE A CHANCE OF GETTING HIRED FULL-TIME AFTER?', a: 'Yes! BLINC has hired 11+ interns full-time after their BLIP stint.' },
              { q: 'WHERE IS THE BLINC OFFICE LOCATED?', a: 'Level 5 Abanao Square Mall, Baguio City 2600, Philippines.' },
            ].map(({ q, a }, i) => <FaqItem key={q} q={q} a={a} defaultOpen={i === 0} />)}
          </div>

        </div>
      </section>

      <section style={{
        background: 'radial-gradient(ellipse 50% 150% at 5% 20%, #6069FF 0%, #A2A8FE 30%, #ececec 55%, #FFFFFF 80%)',
        padding: '15rem 6rem',
        margin: '0 0rem 0rem',
        color: '#4C539F',
        textAlign: 'center',
        boxShadow: '0 24px 80px rgba(76, 83, 159, 0.18)',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.08em', margin: '0 0 0.75rem', opacity: 0.9 }}>READY TO BEGIN?</p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.05 }}>Start your BLIP journey today.</h2>
          <p style={{ fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 2.5rem', lineHeight: 1.75, opacity: 0.93 }}>
            Apply for the next batch, explore available roles, or just ask Bitsy your first question right now.
          </p>
           <button onClick={onOpenChat} style={{ ...primaryBtn, background: 'rgba(255,255,255,0.24)', boxShadow: '0 16px 36px rgba(0, 0, 0, 0.22)', border: 'none', color: '#4C539F' }}>
            Ask Bitsy your first question
          </button>
        </div>
      </section>

        {/* FOOTER INNER CONTENT */}
        <footer style={{ background: '#E6E8F8', padding: '2rem', borderTop: '1px solid rgba(0,0,0,0.05)', margin: '0 -2rem' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#393C46', lineHeight: 1.6, textAlign: 'left' }}>
              <strong style={{ color: '#4C539F' }}>BITSHARES LABS, INC. (BLINC)</strong><br />
              Level 5 Abanao Square Mall, Baguio City 2600, Philippines<br />
              Globe: +63 917 459 7000 · Smart: +63 919 627 7000
            </div>
{/* Vector Social Icons matching brand assets */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {/* Facebook Icon Button */}
              <a href="#" aria-label="Facebook" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#4C539F', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                <svg width="16" height="16" fill="#FFFFFF" viewBox="0 0 24 24"><path d="M9 8H7v3h2v9h3v-9h3l.5-3H12V6c0-.88.72-1 1-1h2V2h-3c-2.76 0-5 2.24-5 5v1z"/></svg>
              </a>
              {/* Twitter / X Icon Button */}
              <a href="#" aria-label="Twitter" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#4C539F', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                <svg width="14" height="14" fill="#FFFFFF" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              {/* LinkedIn Icon Button */}
              <a href="https://ph.linkedin.com/company/bitshareslabs" target="_blank" aria-label="LinkedIn" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#4C539F', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                <svg width="14" height="14" fill="#FFFFFF" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
        </footer>

    </div>

  );
}
