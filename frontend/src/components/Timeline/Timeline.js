import React, { useMemo, useState } from 'react'
import { useProfile } from '../../contexts/ProfileContext'
import { motion, useReducedMotion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef } from 'react'
import './Timeline.css'

function formatDate(dateStr) {
  if (!dateStr) return '';
  const s = dateStr.trim();
  if (s.toLowerCase() === 'present') return 'Present';
  const m = s.match(/^(\d{4})-(\d{2})/);
  if (m) {
    const date = new Date(Number(m[1]), Number(m[2]) - 1);
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  }
  return s;
}

function formatRange(start, end) {
  const s = formatDate(start);
  const e = formatDate(end);
  if (!s && !e) return '';
  if (s && !e) return s;
  if (!s && e) return e;
  return `${s} — ${e}`;
}

function yearFromDate(dateStr) {
  if (typeof dateStr !== 'string' || !dateStr.trim()) return null
  const s = dateStr.trim().toLowerCase()
  if (s === 'present') return new Date().getFullYear()
  const m = s.match(/^(\d{4})/)
  return m ? Number(m[1]) : null
}

function monthsFromDate(dateStr) {
  if (typeof dateStr !== 'string' || !dateStr.trim()) return null
  const s = dateStr.trim().toLowerCase()
  if (s === 'present') return new Date().getFullYear() * 12 + new Date().getMonth()
  const m = s.match(/^(\d{4})-(\d{2})/)
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2]) - 1
  if (Number.isNaN(year) || Number.isNaN(month)) return null
  return year * 12 + month
}

function formatDurationMonths(months) {
  if (typeof months !== 'number' || months <= 0) return ''
  const yrs = Math.floor(months / 12)
  const mos = months % 12
  if (yrs <= 0) return `${mos} mo`
  if (mos === 0) return `${yrs} yr${yrs > 1 ? 's' : ''}`
  return `${yrs} yr${yrs > 1 ? 's' : ''} ${mos} mo`
}

const Timeline = () => {
  const { profile } = useProfile()
  const [openKey, setOpenKey] = useState(null)
  const prefersReducedMotion = useReducedMotion()
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"] 
  })

  // Add a spring to smooth out the filling motion
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  // Provide a slightly smoother damping to the line so it doesn't stutter 
  // and map 0-1 to 0%-100%
  const lineHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"])

  const items = useMemo(() => {
    const education = Array.isArray(profile.education) ? profile.education : []
    const experience = Array.isArray(profile.experience) ? profile.experience : []

    const expItems = experience.map((e, idx) => {
      const y = yearFromDate(e.startDate) ?? yearFromDate(e.endDate)
      const startM = monthsFromDate(e.startDate)
      const endM = monthsFromDate(e.endDate)
      const durationMonths =
        typeof startM === 'number' && typeof endM === 'number' && endM >= startM ? endM - startM + 1 : 0
      return {
        kind: 'Experience',
        year: y,
        key: `exp-${e.organization || 'org'}-${e.role || 'role'}-${idx}`,
        title: e.role || e.title || '',
        org: e.organization || '',
        location: e.location || '',
        link: e.link || '',
        range: formatRange(e.startDate, e.endDate),
        durationMonths,
        bullets: Array.isArray(e.bullets) ? e.bullets : [],
        tech: Array.isArray(e.techStack) ? e.techStack : [],
        type: e.type || '',
      }
    })

    const eduItems = education.map((e, idx) => {
      const y = yearFromDate(e.startDate) ?? yearFromDate(e.endDate)
      const startM = monthsFromDate(e.startDate)
      const endM = monthsFromDate(e.endDate)
      const durationMonths =
        typeof startM === 'number' && typeof endM === 'number' && endM >= startM ? endM - startM + 1 : 0
      return {
        kind: 'Education',
        year: y,
        key: `edu-${e.institution || 'inst'}-${e.degree || 'deg'}-${idx}`,
        title: e.degree || '',
        org: e.institution || '',
        location: e.location || '',
        link: e.link || '',
        range: formatRange(e.startDate, e.endDate),
        durationMonths,
        coursework: Array.isArray(e.coursework) ? e.coursework : [],
        gpa: e.gpa || '',
      }
    })

    const all = [...expItems, ...eduItems].filter((x) => typeof x.year === 'number' && !Number.isNaN(x.year))
    const groups = new Map()
    all.forEach((it) => {
      const year = it.year
      const existing = groups.get(year) || { year, exp: [], edu: [] }
      if (it.kind === 'Experience') existing.exp.push(it)
      else existing.edu.push(it)
      groups.set(year, existing)
    })

    const grouped = Array.from(groups.values()).sort((a, b) => b.year - a.year)
    if (!grouped.length) return []

    const maxYear = grouped[0].year
    const minYear = grouped[grouped.length - 1].year
    const byYear = new Map(grouped.map((g) => [g.year, g]))

    const full = []
    for (let y = maxYear; y >= minYear; y--) {
      full.push(byYear.get(y) || { year: y, exp: [], edu: [], empty: true })
    }
    return full
  }, [profile.education, profile.experience])

  if (!items.length) return null

  const cardVariants = prefersReducedMotion
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }

  return (
    <section id="timeline" className="section timeline">
      <h2 className="section__title">Timeline</h2>

      <div className="timeline__labels" aria-hidden="true">
        <span className="timeline__col-title">Work</span>
        <span className="timeline__labels-center" />
        <span className="timeline__col-title">Education</span>
      </div>

      <div className="timeline__grid" role="list" ref={containerRef}>
        {/* Animated Central Line */}
        <div className="timeline__line-container">
          <motion.div 
            className="timeline__line-animated"
            style={{ height: prefersReducedMotion ? "100%" : lineHeight }}
          />
        </div>

        {items.map((group) => (
          <React.Fragment key={group.year}>
            <div className="timeline__year">
              <button
                type="button"
                className={`timeline__year-pill ${group.empty ? 'timeline__year-pill--minor' : ''}`}
                onClick={() => setOpenKey((k) => (k === `year-${group.year}` ? null : `year-${group.year}`))}
                aria-expanded={openKey === `year-${group.year}`}
              >
                {group.year}
              </button>
            </div>

            <div className="timeline__left">
              {group.exp.map((it) => {
                const expanded = openKey === it.key || openKey === `year-${group.year}`
                return (
                  <motion.button
                    type="button"
                    key={it.key}
                    className={`timeline__card glass timeline__card--exp ${expanded ? 'is-open' : ''}`}
                    onClick={() => setOpenKey((k) => (k === it.key ? null : it.key))}
                    aria-expanded={expanded}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.1, margin: "0px 0px -50px 0px" }}
                    variants={cardVariants}
                  >
                    <div className="timeline__connector" aria-hidden="true" />
                    <div className="timeline__card-top">
                      <div className="timeline__card-title">{it.title}</div>
                      {it.range ? <div className="timeline__card-range">{it.range}</div> : null}
                    </div>
                    <div className="timeline__card-sub">
                      {it.link ? (
                        <a className="timeline__org-link" href={it.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                          {it.org}
                        </a>
                      ) : (
                        <span className="timeline__org-text">{it.org}</span>
                      )}
                      {it.location ? <span className="timeline__location"> · {it.location}</span> : null}
                      {it.type ? <span className="timeline__meta-inline"> · {it.type}</span> : null}
                    </div>

                    {it.durationMonths ? (
                      <div className="timeline__duration" aria-label={`Duration ${formatDurationMonths(it.durationMonths)}`}>
                        <span className="timeline__duration-text">{formatDurationMonths(it.durationMonths)}</span>
                        <span
                          className="timeline__duration-bar"
                          style={{ '--durationW': `${Math.min(160, 28 + it.durationMonths * 6)}px` }}
                        />
                      </div>
                    ) : null}

                    {expanded ? (
                      <>
                        {it.bullets?.length ? (
                          <ul className="timeline__bullets">
                            {it.bullets.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        ) : null}
                        {it.tech?.length ? (
                          <div className="timeline__meta">
                            {it.tech.map((m, i) => (
                              <span className="timeline__meta-chip" key={i}>
                                {m}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="timeline__hint">Click to expand</div>
                    )}
                  </motion.button>
                )
              })}
            </div>

            <div className="timeline__right">
              {group.edu.map((it) => {
                const expanded = openKey === it.key || openKey === `year-${group.year}`
                return (
                  <motion.button
                    type="button"
                    key={it.key}
                    className={`timeline__card glass timeline__card--edu ${expanded ? 'is-open' : ''}`}
                    onClick={() => setOpenKey((k) => (k === it.key ? null : it.key))}
                    aria-expanded={expanded}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.1, margin: "0px 0px -50px 0px" }}
                    variants={cardVariants}
                  >
                    <div className="timeline__connector" aria-hidden="true" />
                    <div className="timeline__card-top">
                      <div className="timeline__card-title">{it.title}</div>
                      {it.range ? <div className="timeline__card-range">{it.range}</div> : null}
                    </div>
                    <div className="timeline__card-sub">
                      {it.link ? (
                        <a className="timeline__org-link" href={it.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                          {it.org}
                        </a>
                      ) : (
                        <span className="timeline__org-text">{it.org}</span>
                      )}
                      {it.location ? <span className="timeline__location"> · {it.location}</span> : null}
                    </div>

                    {expanded ? (
                      <>
                        {it.gpa ? <div className="timeline__gpa">GPA {it.gpa}</div> : null}
                        {it.coursework?.length ? (
                          <ul className="timeline__bullets">
                            {it.coursework.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        ) : null}
                      </>
                    ) : (
                      <div className="timeline__hint">Click to expand</div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  )
}

export default Timeline

