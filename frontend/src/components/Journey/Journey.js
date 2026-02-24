import React, { useRef, useState, useEffect } from 'react';
import { useProfile } from '../../contexts/ProfileContext';
import './Journey.css';
import CountUp from 'react-countup';

/**
 * Journey section: intro text + stats (YOE, projects, organizations).
 * Stats come from GET /api/profile (server-computed from knowledge.json projects & experience).
 */
const Journey = () => {
  const { profile, loading } = useProfile();
  const journeySectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const { intro, yoe, numProjects, numOrganizations } = profile.journey || {};
  const hasStats = !loading && (yoe != null || numProjects != null || numOrganizations != null);
  const endYoe = hasStats ? (yoe ?? 0) : 0;
  const endProjects = hasStats ? (Number(numProjects) || 0) : 0;
  const endOrgs = hasStats ? (numOrganizations ?? 0) : 0;
  const showPlaceholder = loading || !hasStats;

  useEffect(() => {
    const el = journeySectionRef.current;
    if (!el || !hasStats) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimationKey((k) => k + 1);
          setIsInView(true);
        } else {
          setIsInView(false);
        }
      },
      { threshold: 0.2, rootMargin: '0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStats]);

  const showCountUp = isInView && hasStats;

  return (
    <section id="journey" className="section journey" ref={journeySectionRef}>
      {(intro || hasStats) && (
        <>
          <h2 className="section__title">Journey</h2>
          <div className="journey__content">
            <div className="journey-stats" key={animationKey}>
              <div className="journey-stat">
                <span className="journey-stat-number">
                  {showPlaceholder ? (
                    '—'
                  ) : showCountUp ? (
                    <CountUp start={50} end={endYoe} duration={2} suffix="+" />
                  ) : (
                    `${endYoe}+`
                  )}
                </span>
                <span className="journey-stat-label">Years of Experience</span>
              </div>
              <div className="journey-stat">
                <span className="journey-stat-number">
                  {showPlaceholder ? (
                    '—'
                  ) : showCountUp ? (
                    <CountUp start={50} end={endProjects} duration={2} suffix="+" />
                  ) : (
                    `${endProjects}+`
                  )}
                </span>
                <span className="journey-stat-label">Projects</span>
              </div>
              <div className="journey-stat">
                <span className="journey-stat-number">
                  {showPlaceholder ? (
                    '—'
                  ) : showCountUp ? (
                    <CountUp start={50} end={endOrgs} duration={2} suffix="+" />
                  ) : (
                    `${endOrgs}+`
                  )}
                </span>
                <span className="journey-stat-label">Organizations</span>
              </div>
            </div>
            <div className="journey-intro" dangerouslySetInnerHTML={{ __html: intro }} />
          </div>
        </>
      )}
    </section>
  )
}

export default Journey;