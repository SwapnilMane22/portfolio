const header = {
    // all the properties are optional - can be left empty or deleted
    homepage: 'https://swapnilmane22.github.io/portfolio/',
    title: 'SM',
  }
  
  const about = {
    // all the properties are optional - can be left empty or deleted
    name: 'Swapnil Mane',
    role: 'Software Developer',
    role2: 'Full Stack Developer',
    role3: 'Machine Learning Engineer',
    description:
      'Welcome to my digital corner. I am thrilled to showcase my projects, as well as provide insights into my educational journey and professional endeavors. Let us connect and explore opportunities together.',
    resume: 'https://swapnilmane22.github.io/portfolio/assets/pdf/Swapnil%20Mane%20Resume.pdf',
    social: {
      linkedin: 'https://www.linkedin.com/in/-swapnilmane-/',
      github: 'https://github.com/SwapnilMane22/',
    },
  }
  
  const projects = [
    // projects can be added an removed
    // if there are no projects, Projects section won't show up
    {
      name: 'Project 1',
      description:
        'Amet asperiores et impedit aliquam consectetur? Voluptates sed a nulla ipsa officia et esse aliquam',
      stack: ['SASS', 'TypeScript', 'React'],
      sourceCode: 'https://github.com',
      livePreview: 'https://github.com',
    },
    {
      name: 'Project 2',
      description:
        'Amet asperiores et impedit aliquam consectetur? Voluptates sed a nulla ipsa officia et esse aliquam',
      stack: ['SASS', 'TypeScript', 'React'],
      sourceCode: 'https://github.com',
      livePreview: 'https://github.com',
    },
    {
      name: 'Project 3',
      description:
        'Amet asperiores et impedit aliquam consectetur? Voluptates sed a nulla ipsa officia et esse aliquam',
      stack: ['SASS', 'TypeScript', 'React'],
      sourceCode: 'https://github.com',
      livePreview: 'https://github.com',
    },
  ]
  
  const skills = [
    // skills can be added or removed
    // if there are no skills, Skills section won't show up
    'HTML',
    'CSS',
    'JavaScript',
    'TypeScript',
    'React',
    'Redux',
    'SASS',
    'Material UI',
    'Git',
    'CI/CD',
    'Jest',
    'Enzyme',
  ]
  
  const contact = {
    // email is optional - if left empty Contact section won't show up
    email: 'smane@bingamton.edu',
  }
  
  export { header, about, projects, skills, contact }