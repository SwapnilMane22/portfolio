import chatbot from './assets/image/chatbot.jpg';
import PortfolioCover from './assets/image/portfolio.jpg';
import movie from './assets/image/movie.jpg';
import soh from './assets/image/soh.png';
import ar from './assets/image/ar.jpg';
import dm from './assets/image/datamining.jpg';
import tcs from './assets/image/ticketing.jpg';
import course from './assets/image/course.jpg';
import tot from './assets/image/Neural Networks.png';
import ocr from './assets/image/ocr.jpg';
import iot from './assets/image/IOT.png';
import arduino from './assets/image/arduino.jpg';

// import smlogo from './assets/image/SM logo.svg';

const header = {
    // all the properties are optional - can be left empty or deleted
    homepage: 'https://swapnilmane22.github.io/portfolio/',
    title: 'SM',
    // image: require('../../assets/SM.jpg'),
    // ilogo:  smlogo,
  }
  
  const about = {
    // all the properties are optional - can be left empty or deleted
    name: 'Swapnil Mane',
    role: 'Software Developer',
    role2: 'Full Stack Developer',
    role3: 'Machine Learning Engineer',
    description:
      'Welcome to my digital corner. I am thrilled to showcase my projects, as well as provide insights into my educational journey and professional endeavors. Let’s connect and explore opportunities together.',
    // resume: 'src/assets/pdf/Swapnil Mane Resume.pdf', //'https://swapnilmane22.github.io/portfolio_html/assets/pdf/Swapnil%20Mane%20Resume.pdf',
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
      name: 'Conversational AI ChatBot',
      // image: '../../assets/chatbot.png', /src
      image: chatbot,//`${process.env.PUBLIC_URL}/assets/chatbot.png`,
      description:
        'The Conversational AI ChatBot is designed to enhance user engagement on a portfolio website by providing personalized responses to career-related queries. It leverages a fine-tuned Large Language Model (LLM) trained with PyTorch, enabling it to deliver natural, interactive answers about professional experience, skills, and resume details. Utilizing natural language processing (NLP) and deep learning techniques, the chatbot effectively understands user intent and offers context-aware responses, making it a valuable tool for networking, job applications, and automating career-related conversations. Deployed on the portfolio website, it ensures that visitors can effortlessly access relevant information without needing to navigate through extensive content. Future enhancements will include real-time resume analysis, interview preparation guidance, and seamless integration with job application platforms to further optimize career advancement.',
      stack: ['Python', 'PyTorch', 'Transformer', 'Natural Language Processing'],
      // sourceCode: 'https://github.com',
      // livePreview: 'https://github.com',
    },
    {
      name: 'Portfolio Website',
      image: PortfolioCover,//'./assets/image/portfolio.jpg',
      description:
        'The project serves as a dynamic digital resume, showcasing skills, experience, and projects with interactive live demos. Each project features a detailed overview, tech stack, and direct links to both the GitHub repository and a working demo, allowing everyone to explore real-world applications firsthand.',
      stack: ['React', 'CSS', 'MongoDB'],
      sourceCode: 'https://github.com/SwapnilMane22/mern_portfolio.git',
      // livePreview: 'https://github.com',
    },
    {
      name: 'Movie Search and Recommendation System',
      image: movie,//'../../assets/image/movie.jpg',
      description:
        'The Movie Search and Recommendation System delivers personalized movie suggestions by leveraging TF-IDF vectorization for keyword-based matching and SBERT embeddings for deep semantic understanding. Users can input a description or keyword, and the model ranks and recommends the most relevant films based on similarity scores. By combining titles and overviews through feature engineering, the system enhances accuracy in capturing contextual meaning. TF-IDF ensures precise word-based retrieval, while SBERT provides more nuanced recommendations by understanding sentence-level semantics.',
      stack: ['Python', 'PyTorch', 'Transformer', 'Natural Language Processing'],
      // sourceCode: 'https://github.com',
      // livePreview: 'https://github.com',
    },
    {
      name: 'Battery State of Health Prediction',
      image: soh, //'../../assets/image/soh.png',
      description:
        'I led the development of a battery State of Health (SOH) prediction system, focusing on estimating Remaining Useful Life (RUL) for efficient lifecycle management. These AI models achieved over 90% accuracy, utilizing advanced machine learning techniques to categorize batteries and model their degradation over time. I optimized Python code for handling over 3.25 million data points using parallel processing and multithreading to ensure performance and scalability.',
      stack: ['Python', 'MATLAB', 'Machine Learning'],
      // sourceCode: 'https://github.com',
      // livePreview: 'https://github.com',
    },
    {
      name: 'Computer Vision: Edge detection, Feature Matching, Augmented reality, and Video tracking',
      image: ar, //'../../assets/image/ar.jpg',
      description:
        'This project features a collection of computer vision and image processing implementations, covering tasks such as edge detection, feature matching, 3D reconstruction, and video tracking. It showcases techniques for addressing real-world challenges in machine vision, augmented reality, and video analysis.',
      stack: ['Python', 'OpenCV', 'PyPlot'],
      sourceCode: 'https://github.com/SwapnilMane22/CV-Projects-Edge-Detection-Feature-Matching-AR-and-Video-Tracking.git',
      // livePreview: 'https://github.com',
    },
    {
      name: 'Data Mining: Dimensionality Reduction, Classification and Clustering',
      image: dm,//'../../assets/image/datamining.jpg',
      description:
        'This project implements several techniques for image classification and clustering. The methods used include Principal Component Analysis (PCA), Discrete Cosine Transform (DCT), Deep Neural Networks (DNN), and K-Nearest Neighbors (KNN). The primary goal is to enhance data representation, improve classification accuracy, and optimize clustering outcomes.',
      stack: ['Python', 'Sci-kit Learn', 'SciPy'],
      sourceCode: 'https://github.com/SwapnilMane22/Data-Mining-Dimensionality-Reduction-Classification-and-Clustering.git',
      // livePreview: 'https://github.com',
    },
    {
      name: 'Ticket Classification System',
      image: tcs,//'../../assets/image/ticketing.jpg',
      description:
        'The Ticket Classification System is designed to streamline ticket management by automatically categorizing incoming support requests based on historical data. This system is particularly useful for customer support teams, IT help desks, and service management platforms, reducing manual effort and improving response efficiency. Built using Azure ML Studio, the model employs TF-IDF for text vectorization and regression techniques for supervised learning on skewed data. When a new ticket is generated, the system calculates a similarity score by comparing it with previously classified tickets, ensuring accurate categorization. The data pipeline, managed through Azure Data Storage, facilitates seamless data ingestion, transformation, and model training, enabling real-time processing and classification. Azure’s cloud-based infrastructure ensures scalability, while machine learning automation enhances accuracy, ultimately improving issue resolution times and customer satisfaction.',
      stack: ['Microsoft Azure ML Studio', 'Python', 'Azure Data Lake'],
      // sourceCode: 'https://github.com',
      // livePreview: 'https://github.com',
    },
    {
      name: 'Optimized Course Assignment System',
      image: course,//'../../assets/image/course.jpg',
      description:
        'This Java program assigns courses, considering all the graduation criteria and prerequisites. It uses the State pattern to capture degree requirements and efficiently assigns courses to students while considering prerequisites and constraints. The program ensures that each student completes the required number of courses in different groups and maintains a wait-list for courses that cannot be immediately assigned. It also stops processing courses for students once they become eligible for graduation.',
      stack: ['Java','Design Patterns'],
      sourceCode: 'https://github.com/SwapnilMane22/Optimized-Course-Assignment-System/tree/56cd6916a56da2f0907398f08799b91d7b02e6f5',
      // livePreview: 'https://github.com',
    },
    {
      name: 'Thought to Text Conversion Using Deep Learning',
      image: tot,//'../../assets/image/Neural Networks.png',
      description:
        'This paper intends to design a very simplified model of the human brain that learns tasks by mimicking the behavior of brain patterns. An EEG (Electroencephalography) signal is a physiological approach to record the electrical signal pertaining to the brain activity by placing the iron affinity electrode i.e. metal disc sensors on the scalp. The magnitude of this signal is quite small, measured in microvolts.',
      stack: ['Python', 'MATLAB', 'Keras', 'Sci-kit Learn'],
      // sourceCode: 'https://github.com',
      livePreview: 'https://www.taylorfrancis.com/chapters/edit/10.1201/9781003052098-54/thought-text-conversion-using-deep-learning-swapnil-mane-tiasha-nath-shobin-thomas-omkar-swami-pranali-choudhari-smita-chopde',
    },
    {
      name: 'Simple Handwritten Text Recognition using Neural Network',
      image: ocr,//'../../assets/image/ocr.jpg',
      description:
        'Handwritten digit recognition using MNIST dataset is a major project made with the help of Neural Network. It basically detects the scanned images of handwritten digits. The project employs a three-layered neural network consisting of an input layer, a hidden layer, and an output layer. It preprocesses data from the MNIST dataset, rescales it, and then trains the neural network using backpropagation and regularization techniques.',
      stack: ['Python','PyTorch', 'OpenCV', 'PyPlot'],
      sourceCode: 'https://github.com/SwapnilMane22/handwritten_digit_recognition_mnist',
      // livePreview: 'https://github.com',
    },
    {
      name: 'Bidirectional Counter for Attendance Record using IoT',
      image: iot,//'../../assets/image/IOT.png',
      description:
        'Attendance tracking app for businesses, associations and schools to track employees, members and students tracking services to check-in, check-out and control access for administrators with smartphones and tablets.',
      stack: ['Arduino', 'IoT', 'Android App'],
      sourceCode: 'https://github.com/SwapnilMane22/Bidirectional-Attendance-Barcode-Counter',
      // livePreview: 'https://github.com',
    },
    {
      name: 'Automatic Mains Failure System for Diesel Generators',
      image: arduino,//'../../assets/image/arduino.jpg',
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
  
  const journey = [
    {
      intro:
      `<p>I am a passionate and driven Software Engineer with a Master of Science degree in Computer Science from Binghamton University with a GPA of 3.71/4.0. I have a strong foundation in Artificial Intelligence (AI), Machine Learning (ML), and Data Science, with hands-on experience in various advanced technologies, tools, and programming languages. My expertise spans across Machine Learning algorithms, Deep Learning, Natural Language Processing (NLP), Computer Vision, and cloud technologies such as AWS, Azure, and GCP.</p>
      <br>
      <p>I’ve developed innovative AI/ML solutions, including predictive models for battery state-of-health (SOH) prediction with over 90% accuracy and automated systems that boosted productivity and operational efficiency. Throughout my career, I’ve had the opportunity to contribute to impactful projects, such as scaling AI algorithms for SaaS platforms and optimizing machine learning pipelines, which resulted in measurable improvements in data processing and model deployment. I have been actively involved in the development of cutting-edge AI applications in areas like battery lifecycle management, NLP automation, and image processing, and have demonstrated leadership abilities as a project lead and architect of AI solutions. </p>
      <br>
      <p>I’m particularly excited about the transformative power of AI, ML and GenAI, and I’m eager to continue exploring their potential to solve real-world problems in diverse industries, such as healthcare, finance, and sustainability. I am committed to utilizing my technical expertise and problem-solving skills to make meaningful contributions to the tech industry, driving innovation and efficiency while promoting diversity and inclusion.</p>
      <p></p>`,
      yoe: 4,
      numProjects: `${projects.length}`,
      numOrganizations: 5,
    },
  ]

  const skills = [
    // skills can be added or removed
    // if there are no skills, Skills section won't show up
    'Python',
    'Artificial Intelligence',
    'Machine Learning',
    'Natural Language Processing',
    'Java',
    'JavaScript',
    'React',
    'SQL',
    'Computer Vision',
    'Git',
    'Generative AI',
    'Microsoft Azure Machine Learning Studio',
    'AI/ML Frameworks',
    'Android',
  ]
  
  const contact = {
    // email is optional - if left empty Contact section won't show up
    email: 'smane@bingamton.edu',
  }
  
  export { header, about, projects, journey, skills, contact }