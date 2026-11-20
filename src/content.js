// All site copy lives here. Edit this file to update the portfolio; App.jsx only renders it.

const GH = 'https://github.com/YousefAlaaeldin'

export const navItems = ['about', 'experience', 'projects', 'research', 'skills', 'contact']

export const hero = {
  tag: 'AI ENGINEER · TECH PORTFOLIO',
  title: 'THE TECH POLYMATH',
  intro:
    "I'm Yousef Abdou, an AI engineer who works across the whole stack: training and compressing vision and speech models, wiring LLM agents into real systems, designing the PCBs they run on, and testing quant models with the same rigour.",
  stats: [
    { value: 'Patent', label: 'U.S. granted · Smart Vent' },
    { value: '0.91 F1', label: 'RF-DETR traffic detection' },
    { value: '4 papers', label: 'AHFE 2026 · IEEE IV 2027' },
    { value: '3rd', label: 'design, SUAS 2024 (USA)' },
  ],
  now: {
    badge: 'NOW',
    label: 'Currently',
    heading: 'M.Sc. Machine Learning @ Georgia Tech',
    body: 'Fresh off an AI engineering traineeship at TatweerMEA. I\'m currently building Smart Vent v2 at SB Tech, competing in quant and quantum-compilation challenges, and researching edge AI and detection transformers.',
  },
}

export const experience = [
  {
    role: 'AI Engineer Graduate Trainee',
    org: 'Tatweer Middle East and Africa (TatweerMEA)',
    period: 'Aug 2026 – Nov 2026',
    place: 'Abu Dhabi, UAE',
    points: [
      'RITSMS (Real-Time Intelligent Traffic Safety Management System) for ITC: fine-tuned, pruned, quantized and distilled YOLO, RF-DETR and DINOv2 models, reaching 0.91 F1 with RF-DETR.',
      'Benchmarked models across camera qualities and day/night conditions, and supported deployment on Kubernetes and Microsoft Azure.',
      'TatweerOS, a private, locally hosted AI platform: built agentic workflows connecting LLM agents to web, email, meetings and internal systems.',
      'Built chart, table and figure generation so local models can parse files and return visual insights.',
    ],
    tags: ['RF-DETR', 'YOLO', 'DINOv2', 'Distillation', 'LLM Agents', 'Azure', 'Kubernetes'],
  },
  {
    role: 'Co-Founder & Technical Lead',
    org: 'SB Tech: independent tech startup',
    period: 'Jul 2025 – Present',
    place: 'Remote (UAE – Egypt)',
    points: [
      'Smart Vent (U.S. Patent granted, App. No. 18/231,603, "Distributed Zone Control System"): built the embedded system and PCB from scratch, plus a 97%-accuracy on-device voice model, and validated the single-vent prototype.',
      'Stage 2: a multi-vent prototype on a new 4-layer ESP32-C6 board with snap-in sensor pucks, designed as code (SKiDL → scripted checks → SPICE → KiCad), plus an edge keyword-spotting pipeline trained on semi-synthesized data.',
      'Freelance software and hardware projects, including a production bilingual e-commerce store.',
    ],
    tags: ['ESP32', 'PCB Design', 'KiCad', 'Keyword Spotting', 'TinyML'],
  },
  {
    role: 'Computer Vision Sub-Team Member',
    org: 'Alex Eagles: SUAS Competition 2024',
    period: 'Aug 2023 – Apr 2024',
    place: 'Alexandria, Egypt',
    points: [
      'Ranked 3rd in design at the international drone challenge in Tulsa, Oklahoma.',
      'Collected, augmented and preprocessed the data, then fine-tuned YOLOv8 to 96% mAP.',
    ],
    tags: ['YOLOv8', 'Data Augmentation', 'Drones'],
  },
]

export const education = [
  { degree: 'M.Sc. Computer Science (Machine Learning)', school: 'Georgia Institute of Technology', period: '2026 – 2028' },
  { degree: 'B.Eng. Computer & Communications Eng., Minor in AI', school: 'Alexandria University', period: '2020 – 2025' },
]

export const certifications = [
  'Deep Learning Specialization · DeepLearning.AI',
  'CCNA · Cisco',
  'Q Bronze: Quantum Computing · QWorld',
  'People & Power Skills · IBM iX',
]

export const projectFilters = ['All', 'AI/ML', 'Quant', 'Hardware', 'Web & Apps', 'Game Dev']

// status: optional chip text. link: omit for private work.
export const featuredProjects = [
  {
    title: 'Smart Vent v2',
    summary:
      'A connected HVAC vent built around a 4-layer ESP32-C6 board and snap-in sensor pucks. The circuit is written in Python, checked by about 30 scripts against datasheet evidence, simulated in SPICE and laid out in KiCad.',
    highlight: 'U.S. patent granted · 288-run hot-plug SPICE sweep',
    stack: 'SKiDL, KiCad 10, SPICE, ESP-IDF',
    link: `${GH}/smart-vent-v2`,
    category: 'Hardware',
  },
  {
    title: 'Real-Time Structural Break Detection',
    summary:
      'ADIA Lab / CrunchDAO challenge: stream the probability that a time series has already broken, one point at a time. Uses a blend of trees, a GRU and an SVM, plus a pretrained "normal behaviour" GRU whose hidden state feeds the others.',
    highlight: 'Cloud TS-AUC 0.647 · 40+ ideas tested and logged',
    stack: 'XGBoost, PyTorch, numba, BOCPD',
    link: `${GH}/realtime-structural-break`,
    category: 'Quant',
  },
  {
    title: 'AI World',
    summary:
      'A multi-agent LLM simulation that asks whether agents with no assigned goal form stable, state-conditioned commitments. It has a pre-registered protocol, matched controls, world snapshots and replay.',
    highlight: '2×2 mortality × scarcity design · fully reproducible runs',
    stack: 'Python, LLM Agents, Ollama, pytest',
    link: `${GH}/ai-world`,
    category: 'AI/ML',
  },
  {
    title: 'School Bus Safety Tracker',
    summary:
      'Roll call, live bus tracking and "10 minutes away" alerts for UAE schools, in Arabic and English. Security is enforced in the database with row-level security and tested with pgTAP.',
    highlight: '40 migrations · 25 pgTAP suites · exactly-once notifications',
    stack: 'Expo, Next.js, Supabase, Google Routes API',
    link: `${GH}/school-bus-safety-tracker`,
    category: 'Web & Apps',
  },
  {
    title: 'Machine Agent',
    summary:
      'Scan the QR sticker on a machine and chat with an assistant that has read that unit\'s manual and service history. It uses retrieval scoped to the model, a cache-friendly prompt layout and streamed answers.',
    highlight: 'RAG on pgvector · Claude / Ollama swappable',
    stack: 'Next.js, Postgres + pgvector, Claude',
    link: `${GH}/machine-agent`,
    category: 'AI/ML',
  },
  {
    title: 'DataCrunch 2',
    summary:
      'Weekly cross-sectional equity prediction. Since 88% of targets are zero, a 5-class XGBoost model aims at the tails, evaluated with walk-forward CV and Newey-West paired tests.',
    highlight: 'CV Pearson 0.047 · Sharpe 1.18',
    stack: 'XGBoost, LightGBM, PyTorch',
    link: `${GH}/datacrunch-2`,
    category: 'Quant',
  },
  {
    title: 'Tefa Care',
    summary:
      'Production Arabic-first e-commerce store for a medical-supplies client in Libya. Prices are recomputed on the server, order pages use unguessable tokens, search handles Arabic spelling variants, and an admin panel and Telegram alerts are included.',
    highlight: 'Client project · storefront + admin',
    stack: 'Next.js, Drizzle, libSQL, next-intl',
    status: 'Private client repo',
    category: 'Web & Apps',
  },
  {
    title: 'Throat-Mic Comms',
    summary:
      'A private conversation system: a contact sensor on the throat or mastoid streams speech over BLE to a phone, which runs bandwidth extension and speech recognition and sends it on to a bone-conduction earpiece.',
    highlight: 'System design, parts selection, dataset survey',
    stack: 'nRF52840, BLE, Speech ML',
    link: `${GH}/throat-mic`,
    status: 'Concept stage',
    category: 'Hardware',
  },
]

export const moreProjects = [
  {
    title: 'Synth Volatility Tracker',
    summary: 'CrunchDAO Synth: probabilistic price forecasts scored by CRPS against about 313 live trackers. Top-10 ranks on 11 of 18 asset/horizon pairs in an official backtest.',
    stack: 'Volatility Modelling, CRPS',
    status: 'Repo public after the competition',
    category: 'Quant',
  },
  {
    title: 'Quantum Circuit Compilation',
    summary: 'Google Quantum AI Kaggle challenge: hand-optimising fault-tolerant circuits for qubit × Toffoli cost, using swap-network search and measurement-based uncomputation.',
    stack: 'Quantum Computing, Qualtran, Rust',
    status: 'Repo public after the competition',
    category: 'Quant',
  },
  {
    title: 'NFL Big Data Bowl 2027',
    summary: 'Do Combine movement signatures from 10 Hz tracking predict NFL performance beyond stopwatch times? Uses signed kinematics, reliability gates and per-snap outcomes.',
    stack: 'Sports Analytics, Tracking Data',
    status: 'Repo public after the competition',
    category: 'AI/ML',
  },
  {
    title: 'tiny-gpu (fork)',
    summary: 'A minimal Verilog GPU. I contributed a fix for a hang on partial last blocks and added a vector-subtract kernel test.',
    stack: 'Verilog, GPU Architecture',
    link: `${GH}/tiny-gpu`,
    category: 'Hardware',
  },
  {
    title: 'YOLOv8 Object Detection',
    summary: 'Fine-tuned YOLOv8 workflow with custom training experiments and inference evaluation.',
    stack: 'YOLOv8, Computer Vision',
    link: `${GH}/yolov8objectdetection`,
    category: 'AI/ML',
  },
  {
    title: 'Digit-Generation GAN',
    summary: 'Generative adversarial network for handwritten digit generation.',
    stack: 'Python, GANs, Deep Learning',
    link: `${GH}/digit-generatio-GAN`,
    category: 'AI/ML',
  },
  {
    title: 'Smart Vent v1',
    summary: 'The original single-vent prototype: firmware, voice enrolment and identification scripts.',
    stack: 'Embedded C, Python',
    link: `${GH}/Smart-vent`,
    category: 'Hardware',
  },
  {
    title: 'ThermoFlow',
    summary: '2D puzzle game built around thermal-flow mechanics.',
    stack: 'Godot, GDScript',
    link: `${GH}/ThermoFlow`,
    category: 'Game Dev',
  },
  {
    title: 'Connect4',
    summary: 'Connect 4 with a computer player (college assignment).',
    stack: 'Python, Game AI',
    link: `${GH}/Connect4`,
    category: 'Game Dev',
  },
  {
    title: 'Mini Paint',
    summary: 'Lightweight Java drawing application with shape editing.',
    stack: 'Java, Desktop App',
    link: `${GH}/mini-paint`,
    category: 'Web & Apps',
  },
]

export const publications = [
  {
    authors: 'Y. Abdou, C. Wolfaardt',
    title: 'Error Localization and Single-Part Retraining of a Detection Transformer for Traffic Detection',
    venue: 'IEEE IV 2027 (Intelligent Vehicles Symposium)',
    status: 'Submitted',
  },
  {
    authors: 'C. Wolfaardt, Y. Abdou',
    title: 'Class-Specific Gradient Ownership in Roadside Object Detection: Functional Specialization Without Consistent Accuracy Benefits',
    venue: 'IEEE IV 2027 (Intelligent Vehicles Symposium)',
    status: 'Submitted',
  },
  {
    authors: 'Y. Abdou, H. El Shorbagy, A. Abdou',
    title: 'Sharing the Edge: Multiple Concurrent Neural Workloads on a Single Microcontroller in a Smart HVAC Vent',
    venue: 'AHFE 2026 International Conference',
    status: 'Accepted',
  },
  {
    authors: 'A. Abdou, M. Zaghloul, S. Makky, Y. Abdou',
    title: 'Modelling Critical Success Factors for Early Decision-Making: A Preliminary Web-Based Decision Support System for Real Estate Projects in Dubai',
    venue: 'Buildings (MDPI)',
    status: 'Accepted with revisions',
  },
]

export const patent = {
  title: 'Distributed Zone Control System',
  detail: 'U.S. Patent granted · App. No. 18/231,603',
}

export const skillsByDomain = [
  {
    domain: 'AI / Machine Learning',
    focus: 'From data collection to trained, evaluated models.',
    items: ['PyTorch', 'TensorFlow', 'Computer Vision', 'Object Detection', 'Transformers', 'Speech & KWS', 'XGBoost', 'Scikit-learn'],
  },
  {
    domain: 'LLMs & Agents',
    focus: 'Agents wired into real tools, running locally or in the cloud.',
    items: ['Agentic Workflows', 'Tool / API Integration', 'RAG', 'pgvector', 'Local LLM Hosting', 'Claude API', 'Ollama'],
  },
  {
    domain: 'Optimization & Deployment',
    focus: 'Making models small, fast and shippable.',
    items: ['Quantization', 'Pruning', 'Knowledge Distillation', 'ONNX', 'TensorRT', 'TFLite', 'Docker', 'Kubernetes', 'Azure'],
  },
  {
    domain: 'Edge AI & Hardware',
    focus: 'Boards designed, simulated and verified before they are ordered.',
    items: ['ESP32-S3 / C6', 'ESP-IDF', 'FreeRTOS', 'On-device Inference', 'KiCad', 'SKiDL', 'SPICE', 'PCB Design'],
  },
  {
    domain: 'Quant & Research',
    focus: 'Experiments with pre-declared bars, paired tests and honest CV.',
    items: ['Time Series', 'Walk-forward CV', 'Changepoint Detection', 'Volatility Models', 'numba', 'Statistical Testing'],
  },
  {
    domain: 'Software',
    focus: 'Full-stack apps, bilingual and RTL-ready.',
    items: ['TypeScript', 'Next.js', 'React Native / Expo', 'Node.js', 'PostgreSQL', 'Supabase', 'C/C++', 'Java'],
  },
]

export const contact = {
  email: 'eng.yousefabdou@gmail.com',
  linkedin: 'https://www.linkedin.com/in/yousef-abdou/',
  github: GH,
}

// ---------- Redesign: core fields and the project stream ----------

export const coreFields = [
  {
    id: 'ml',
    name: 'Machine Learning',
    color: '#FF2A6D',
    tools: ['PyTorch', 'TensorFlow', 'XGBoost', 'Transformers'],
    practice: ['Quantization', 'Distillation', 'LLM agents', 'Time series'],
  },
  {
    id: 'hardware',
    name: 'Hardware',
    color: '#4FE3F0',
    tools: ['ESP32', 'ESP-IDF', 'KiCad', 'SPICE'],
    practice: ['PCB design', 'Firmware', 'Edge AI', 'FreeRTOS'],
  },
  {
    id: 'cv',
    name: 'Computer Vision',
    color: '#9C8CFF',
    tools: ['YOLO', 'RF-DETR', 'DINOv2', 'TensorRT'],
    practice: ['Object detection', 'Pruning', 'ONNX', 'Benchmarking'],
  },
  {
    id: 'research',
    name: 'Research',
    color: '#FFB347',
    tools: ['4 papers', 'U.S. patent', 'Pre-registration'],
    practice: ['Experiment design', 'Paired testing', 'Walk-forward CV'],
  },
]

const extraWork = [
  {
    title: 'Traffic-Safety Detection',
    summary:
      'At TatweerMEA: fine-tuned, pruned, quantized and distilled YOLO, RF-DETR and DINOv2 for a real-time traffic-safety system, benchmarked across camera qualities and day/night conditions.',
    highlight: '0.91 F1 with RF-DETR · deployed on Kubernetes and Azure',
    stack: 'RF-DETR, YOLO, DINOv2, Distillation',
    status: 'Industry work',
    category: 'AI/ML',
  },
  {
    title: 'Detection-Transformer Error Localization',
    summary:
      'Finding which part of a detection transformer causes its errors on traffic scenes, then retraining only that part instead of the whole network.',
    highlight: 'First author · submitted to IEEE IV 2027',
    stack: 'DETR, PyTorch',
    status: 'Paper',
    category: 'AI/ML',
  },
  {
    title: 'Sharing the Edge',
    summary: 'Running several neural workloads at the same time on a single microcontroller inside the Smart Vent.',
    highlight: 'First author · accepted at AHFE 2026',
    stack: 'TinyML, ESP32, Keyword spotting',
    status: 'Paper',
    category: 'Hardware',
  },
]

const FIELDS = {
  'Smart Vent v2': ['hardware'],
  'Traffic-Safety Detection': ['cv', 'ml'],
  'Real-Time Structural Break Detection': ['ml', 'research'],
  'AI World': ['ml', 'research'],
  'Detection-Transformer Error Localization': ['cv', 'research'],
  'Machine Agent': ['ml'],
  'Sharing the Edge': ['hardware', 'ml', 'research'],
  'DataCrunch 2': ['ml'],
  'YOLOv8 Object Detection': ['cv', 'ml'],
  'Throat-Mic Comms': ['hardware'],
  'Synth Volatility Tracker': ['ml'],
  'Quantum Circuit Compilation': ['research'],
  'NFL Big Data Bowl 2027': ['research', 'ml'],
  'tiny-gpu (fork)': ['hardware'],
}

const STREAM_ORDER = [
  'Smart Vent v2',
  'Traffic-Safety Detection',
  'Real-Time Structural Break Detection',
  'AI World',
  'Detection-Transformer Error Localization',
  'School Bus Safety Tracker',
  'Machine Agent',
  'Sharing the Edge',
  'DataCrunch 2',
  'YOLOv8 Object Detection',
  'Tefa Care',
  'Throat-Mic Comms',
  'Synth Volatility Tracker',
  'Quantum Circuit Compilation',
  'NFL Big Data Bowl 2027',
  'tiny-gpu (fork)',
]

const allWork = [...featuredProjects, ...extraWork, ...moreProjects]
export const streamProjects = STREAM_ORDER.map((title) => allWork.find((p) => p.title === title))
  .filter(Boolean)
  .map((p) => ({ ...p, fields: FIELDS[p.title] ?? [] }))
