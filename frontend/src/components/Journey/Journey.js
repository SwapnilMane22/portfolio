import React, { useRef } from 'react';
import { journey } from '../../portfolio';
import './Journey.css';
import { useCountUp } from 'react-countup';

const Journey = () => {
    const { intro, yoe, numProjects, numOrganizations } = journey[0]
    const journeySectionRef = useRef(null);

  useCountUp({ ref: 'yoe', start: 20, end: yoe, suffix: '+', duration: 2, enableScrollSpy: true });
  useCountUp({ ref: 'numProjects', start: 20, end: numProjects, suffix: '+', duration: 2, enableScrollSpy: true });
  useCountUp({ ref: 'numOrganizations', start: 20, end: numOrganizations, suffix: '+', duration: 2, enableScrollSpy: true });

  return (
    <div id="journey" className='journey center'>

      {journey && (
        <div   className="journey-section" ref={journeySectionRef}>
          
          <div className="journey-stats">
            <div className="journey-stat">
              <h3 id='yoe' className="journey-stat-number">yoe</h3> 
              <p className="journey-stat-label">Years of Experience</p>
            </div>
            
            <div className="journey-stat">

              <h3 id='numProjects' className="journey-stat-number">numProjects</h3> 
              <p className="journey-stat-label">Projects</p>
            </div>
            
            <div className="journey-stat">
              <h3 id='numOrganizations' className="journey-stat-number">numOrganizations</h3> 
              <p className="journey-stat-label">Organizations</p>
            </div>

            <div className="journey-intro" dangerouslySetInnerHTML={{ __html: intro }}/>
          
          </div>
        </div>
      )}

    </div>
  )
}

export default Journey;