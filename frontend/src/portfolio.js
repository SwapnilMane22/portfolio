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
      leetcode: 'https://leetcode.com/CodingW-HelloWorld/',
    },
  }
  
  const projects = [
    // projects can be added an removed
    // if there are no projects, Projects section won't show up
    {
      name: 'Portfolio Website',
      description:
        'The project serves as a dynamic digital resume, showcasing skills, experience, and projects with interactive live demos. Each project features a detailed overview, tech stack, and direct links to both the GitHub repository and a working demo, allowing everyone to explore real-world applications firsthand.',
      stack: ['React', 'CSS', 'MongoDB'],
      sourceCode: 'https://github.com/SwapnilMane22/mern_portfolio.git',
      // livePreview: 'https://github.com',
    },
    {
      name: 'Computer Vision: Edge detection, Feature Matching, Augmented reality, and Video tracking',
      description:
        'This project features a collection of computer vision and image processing implementations, covering tasks such as edge detection, feature matching, 3D reconstruction, and video tracking. It showcases techniques for addressing real-world challenges in machine vision, augmented reality, and video analysis.',
      stack: ['Python', 'OpenCV', 'PyPlot'],
      sourceCode: 'https://github.com/SwapnilMane22/CV-Projects-Edge-Detection-Feature-Matching-AR-and-Video-Tracking.git',
      // livePreview: 'https://github.com',
    },
    {
      name: 'Data Mining: Dimensionality Reduction, Classification and Clustering',
      description:
        'This project implements several techniques for image classification and clustering. The methods used include Principal Component Analysis (PCA), Discrete Cosine Transform (DCT), Deep Neural Networks (DNN), and K-Nearest Neighbors (KNN). The primary goal is to enhance data representation, improve classification accuracy, and optimize clustering outcomes.',
      stack: ['Python', 'Sci-kit Learn', 'SciPy'],
      sourceCode: 'https://github.com/SwapnilMane22/Data-Mining-Dimensionality-Reduction-Classification-and-Clustering.git',
      // livePreview: 'https://github.com',
    },
    {
      name: 'Optimized Course Assignment System',
      description:
        'This Java program assigns courses, considering all the graduation criteria and prerequisites. It uses the State pattern to capture degree requirements and efficiently assigns courses to students while considering prerequisites and constraints. The program ensures that each student completes the required number of courses in different groups and maintains a wait-list for courses that cannot be immediately assigned. It also stops processing courses for students once they become eligible for graduation.',
      stack: ['Java','Design Patterns'],
      sourceCode: 'https://github.com/SwapnilMane22/Optimized-Course-Assignment-System/tree/56cd6916a56da2f0907398f08799b91d7b02e6f5',
      // livePreview: 'https://github.com',
    },
    {
      name: 'Thought to Text Conversion Using Deep Learning',
      description:
        'This paper intends to design a very simplified model of the human brain that learns tasks by mimicking the behavior of brain patterns. An EEG (Electroencephalography) signal is a physiological approach to record the electrical signal pertaining to the brain activity by placing the iron affinity electrode i.e. metal disc sensors on the scalp. The magnitude of this signal is quite small, measured in microvolts.',
      stack: ['Python', 'MATLAB', 'Keras', 'Sci-kit Learn'],
      // sourceCode: 'https://github.com',
      livePreview: 'https://www.taylorfrancis.com/chapters/edit/10.1201/9781003052098-54/thought-text-conversion-using-deep-learning-swapnil-mane-tiasha-nath-shobin-thomas-omkar-swami-pranali-choudhari-smita-chopde',
    },
    {
      name: 'Simple Handwritten Text Recognition using Neural Network',
      description:
        'Handwritten digit recognition using MNIST dataset is a major project made with the help of Neural Network. It basically detects the scanned images of handwritten digits. The project employs a three-layered neural network consisting of an input layer, a hidden layer, and an output layer. It preprocesses data from the MNIST dataset, rescales it, and then trains the neural network using backpropagation and regularization techniques.',
      stack: ['Python','PyTorch', 'OpenCV', 'PyPlot'],
      sourceCode: 'https://github.com/SwapnilMane22/handwritten_digit_recognition_mnist',
      // livePreview: 'https://github.com',
    },
    {
      name: 'Bidirectional Counter for Attendance Record using IoT',
      description:
        'Attendance tracking app for businesses, associations and schools to track employees, members and students tracking services to check-in, check-out and control access for administrators with smartphones and tablets.',
      stack: ['Arduino', 'IoT', 'Android App'],
      sourceCode: 'https://github.com/SwapnilMane22/Bidirectional-Attendance-Barcode-Counter',
      // livePreview: 'https://github.com',
    },
    {
      name: 'Automatic Mains Failure System for Diesel Generators',
      description:
        'It is a vital component in ensuring uninterrupted power supply during electrical outages. This system begins by converting the high 3-phase voltage to a manageable 3 volts. An Arduino UNO board is employed to seamlessly switch from the primary mains voltage supply to the backup power source, guaranteeing a smooth transition and uninterrupted power flow when the need arises. This technology plays a crucial role in various industries, data centers, and critical infrastructure to maintain continuous operations in the face of power disruptions.',
      stack: ['Arduino', 'Voltage Rectifier'],
      // sourceCode: 'https://github.com',
      // livePreview: 'https://github.com',
    },
    // {
    //   name: 'Project 3',
    //   description:
    //     'Amet asperiores et impedit aliquam consectetur? Voluptates sed a nulla ipsa officia et esse aliquam',
    //   stack: ['SASS', 'TypeScript', 'React'],
    //   sourceCode: 'https://github.com',
    //   livePreview: 'https://github.com',
    // },
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