// Initial Demo Data for realistic student experience

export const initialSubjects = [
  { id: 'sub_python', name: 'Python Programming', code: 'CS102', color: '#10b981', difficulty: 4 },
  { id: 'sub_ai', name: 'Artificial Intelligence', code: 'CS305', color: '#8b5cf6', difficulty: 5 },
  { id: 'sub_math', name: 'Discrete Mathematics', code: 'MA201', color: '#3b82f6', difficulty: 4 },
  { id: 'sub_ds', name: 'Data Structures & Algorithms', code: 'CS201', color: '#06b6d4', difficulty: 4 },
  { id: 'sub_web', name: 'Web Architecture', code: 'CS240', color: '#f59e0b', difficulty: 3 },
];

export const initialPreferences = {
  collegeStartTime: '09:00',
  collegeEndTime: '16:00',
  sleepStartTime: '23:00',
  sleepEndTime: '07:00',
  maxStudyHoursPerDay: 4.5,
  preferredSessionMins: 90,
  breakDurationMins: 15,
  notificationsEnabled: true,
  autoRescheduleMissed: true,
  userName: 'Alex Rivers',
  degree: 'B.S. Computer Science (Year 2)'
};

// Recurring College Timetable (Mon-Fri)
export const initialTimetableSlots = [
  // Monday
  { id: 'tt_1', dayOfWeek: 1, startTime: '09:00', endTime: '10:30', subjectId: 'sub_ds', room: 'Lab 3', professor: 'Dr. Vance' },
  { id: 'tt_2', dayOfWeek: 1, startTime: '10:45', endTime: '12:15', subjectId: 'sub_ai', room: 'Hall B', professor: 'Prof. Turing' },
  { id: 'tt_3', dayOfWeek: 1, startTime: '13:15', endTime: '14:45', subjectId: 'sub_python', room: 'Lab 1', professor: 'Dr. Guido' },
  { id: 'tt_4', dayOfWeek: 1, startTime: '15:00', endTime: '16:00', subjectId: 'sub_math', room: 'Room 402', professor: 'Prof. Euler' },

  // Tuesday
  { id: 'tt_5', dayOfWeek: 2, startTime: '09:00', endTime: '10:30', subjectId: 'sub_math', room: 'Room 402', professor: 'Prof. Euler' },
  { id: 'tt_6', dayOfWeek: 2, startTime: '10:45', endTime: '12:15', subjectId: 'sub_python', room: 'Lab 1', professor: 'Dr. Guido' },
  { id: 'tt_7', dayOfWeek: 2, startTime: '13:15', endTime: '14:45', subjectId: 'sub_web', room: 'Room 204', professor: 'Prof. Berners' },
  { id: 'tt_8', dayOfWeek: 2, startTime: '15:00', endTime: '16:00', subjectId: 'sub_ai', room: 'Hall B', professor: 'Prof. Turing' },

  // Wednesday
  { id: 'tt_9', dayOfWeek: 3, startTime: '09:00', endTime: '10:30', subjectId: 'sub_ds', room: 'Lab 3', professor: 'Dr. Vance' },
  { id: 'tt_10', dayOfWeek: 3, startTime: '10:45', endTime: '12:15', subjectId: 'sub_math', room: 'Room 402', professor: 'Prof. Euler' },
  { id: 'tt_11', dayOfWeek: 3, startTime: '13:15', endTime: '14:45', subjectId: 'sub_ai', room: 'Hall B', professor: 'Prof. Turing' },
  { id: 'tt_12', dayOfWeek: 3, startTime: '15:00', endTime: '16:00', subjectId: 'sub_web', room: 'Room 204', professor: 'Prof. Berners' },

  // Thursday
  { id: 'tt_13', dayOfWeek: 4, startTime: '09:00', endTime: '10:30', subjectId: 'sub_python', room: 'Lab 1', professor: 'Dr. Guido' },
  { id: 'tt_14', dayOfWeek: 4, startTime: '10:45', endTime: '12:15', subjectId: 'sub_ai', room: 'Hall B', professor: 'Prof. Turing' },
  { id: 'tt_15', dayOfWeek: 4, startTime: '13:15', endTime: '14:45', subjectId: 'sub_ds', room: 'Lab 3', professor: 'Dr. Vance' },
  { id: 'tt_16', dayOfWeek: 4, startTime: '15:00', endTime: '16:00', subjectId: 'sub_math', room: 'Room 402', professor: 'Prof. Euler' },

  // Friday
  { id: 'tt_17', dayOfWeek: 5, startTime: '09:00', endTime: '11:00', subjectId: 'sub_ai', room: 'Robotics Lab', professor: 'Prof. Turing' },
  { id: 'tt_18', dayOfWeek: 5, startTime: '11:15', endTime: '12:45', subjectId: 'sub_python', room: 'Lab 1', professor: 'Dr. Guido' },
  { id: 'tt_19', dayOfWeek: 5, startTime: '13:30', endTime: '15:30', subjectId: 'sub_web', room: 'Room 204', professor: 'Prof. Berners' },
];

export const initialTasks = [
  {
    id: 'task_1',
    title: 'AI Term Project: A* Search & Grid Navigation',
    description: 'Implement heuristic A* pathfinder with dynamic obstacle recalculation and write 4-page report.',
    subjectId: 'sub_ai',
    taskType: 'project',
    priority: 'urgent',
    dueDate: '2026-10-14',
    dueTime: '23:59',
    estimatedMinutes: 240,
    status: 'in_progress',
    subtasks: [
      { id: 'st_1', title: 'Implement Priority Queue Node open-list', completed: true },
      { id: 'st_2', title: 'Write Manhattan and Euclidean heuristics', completed: true },
      { id: 'st_3', title: 'Benchmark visualizer in browser', completed: false },
      { id: 'st_4', title: 'Draft PDF discussion & complexity analysis', completed: false }
    ]
  },
  {
    id: 'task_2',
    title: 'Python Homework 4: Decorators & Memory Profiling',
    description: 'Solve exercises 1-8 in Chapter 7: custom caching decorators and generator pipelines.',
    subjectId: 'sub_python',
    taskType: 'homework',
    priority: 'high',
    dueDate: '2026-10-09',
    dueTime: '18:00',
    estimatedMinutes: 90,
    status: 'todo',
    subtasks: [
      { id: 'st_5', title: 'Implement LRU memoization decorator', completed: false },
      { id: 'st_6', title: 'Run memory_profiler test suite', completed: false }
    ]
  },
  {
    id: 'task_3',
    title: 'Discrete Math: Graph Coloring & Chromatic Numbers',
    description: 'Complete problem set on planar graphs, 4-color theorem proofs, and Euler formula.',
    subjectId: 'sub_math',
    taskType: 'assignment',
    priority: 'medium',
    dueDate: '2026-10-12',
    dueTime: '17:00',
    estimatedMinutes: 120,
    status: 'todo',
    subtasks: [
      { id: 'st_7', title: 'Problems 1-5 proofs', completed: false },
      { id: 'st_8', title: 'Review inductive step for Theorem 3', completed: false }
    ]
  },
  {
    id: 'task_4',
    title: 'Review Lecture 6: Backpropagation Matrix Gradients',
    description: 'Study forward/backward pass vector equations for 2-layer MLP.',
    subjectId: 'sub_ai',
    taskType: 'study',
    priority: 'low',
    dueDate: '2026-10-08',
    dueTime: '21:00',
    estimatedMinutes: 45,
    status: 'completed',
    subtasks: []
  }
];

// Helper to generate dynamic dates relative to current day
function getRelativeDate(offsetDays, timeStr) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const [hours, minutes] = timeStr.split(':').map(Number);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export function getInitialEvents() {
  return [
    // Today's events
    {
      id: 'evt_today_1',
      title: 'College: Data Structures Lab',
      subjectId: 'sub_ds',
      eventType: 'college_class',
      startTime: getRelativeDate(0, '09:00'),
      endTime: getRelativeDate(0, '10:30'),
      isFixed: true,
      status: 'completed',
      location: 'Lab 3'
    },
    {
      id: 'evt_today_2',
      title: 'College: Artificial Intelligence',
      subjectId: 'sub_ai',
      eventType: 'college_class',
      startTime: getRelativeDate(0, '10:45'),
      endTime: getRelativeDate(0, '12:15'),
      isFixed: true,
      status: 'completed',
      location: 'Hall B'
    },
    {
      id: 'evt_today_3',
      title: 'College: Python Programming',
      subjectId: 'sub_python',
      eventType: 'college_class',
      startTime: getRelativeDate(0, '13:15'),
      endTime: getRelativeDate(0, '14:45'),
      isFixed: true,
      status: 'completed',
      location: 'Lab 1'
    },
    {
      id: 'evt_today_4',
      title: 'College: Discrete Math Lecture',
      subjectId: 'sub_math',
      eventType: 'college_class',
      startTime: getRelativeDate(0, '15:00'),
      endTime: getRelativeDate(0, '16:00'),
      isFixed: true,
      status: 'completed',
      location: 'Room 402'
    },
    {
      id: 'evt_today_5',
      title: 'Python Study Session: Decorators & Generators',
      subjectId: 'sub_python',
      eventType: 'study_session',
      startTime: getRelativeDate(0, '17:00'),
      endTime: getRelativeDate(0, '18:30'),
      isFixed: false,
      status: 'scheduled',
      notes: 'Prepare for Homework 4 submission'
    },
    {
      id: 'evt_today_6',
      title: 'Active Rest / Dinner Break',
      eventType: 'break',
      startTime: getRelativeDate(0, '18:30'),
      endTime: getRelativeDate(0, '19:15'),
      isFixed: true,
      status: 'scheduled'
    },
    {
      id: 'evt_today_7',
      title: 'AI Study: A* Search Algorithm Coding',
      subjectId: 'sub_ai',
      eventType: 'study_session',
      startTime: getRelativeDate(0, '19:15'),
      endTime: getRelativeDate(0, '20:45'),
      isFixed: false,
      status: 'scheduled',
      notes: 'Work on Priority Queue implementation'
    },

    // Tomorrow's events
    {
      id: 'evt_tom_1',
      title: 'College: Discrete Math',
      subjectId: 'sub_math',
      eventType: 'college_class',
      startTime: getRelativeDate(1, '09:00'),
      endTime: getRelativeDate(1, '10:30'),
      isFixed: true,
      status: 'scheduled',
      location: 'Room 402'
    },
    {
      id: 'evt_tom_2',
      title: 'College: Python Programming',
      subjectId: 'sub_python',
      eventType: 'college_class',
      startTime: getRelativeDate(1, '10:45'),
      endTime: getRelativeDate(1, '12:15'),
      isFixed: true,
      status: 'scheduled',
      location: 'Lab 1'
    },
    {
      id: 'evt_tom_3',
      title: 'Mathematics Study Session: Graph Proofs',
      subjectId: 'sub_math',
      eventType: 'study_session',
      startTime: getRelativeDate(1, '17:00'),
      endTime: getRelativeDate(1, '18:30'),
      isFixed: false,
      status: 'scheduled'
    },

    // Upcoming Exams
    {
      id: 'evt_exam_ai',
      title: 'Final Exam: Artificial Intelligence & Search',
      subjectId: 'sub_ai',
      eventType: 'exam',
      startTime: getRelativeDate(18, '09:00'),
      endTime: getRelativeDate(18, '12:00'),
      isFixed: true,
      status: 'scheduled',
      location: 'Auditorium North'
    },
    {
      id: 'evt_exam_py',
      title: 'Practical Exam: Python & Software Design',
      subjectId: 'sub_python',
      eventType: 'exam',
      startTime: getRelativeDate(21, '13:00'),
      endTime: getRelativeDate(21, '16:00'),
      isFixed: true,
      status: 'scheduled',
      location: 'Computer Center 2'
    },
    {
      id: 'evt_exam_math',
      title: 'Final Exam: Discrete Mathematics',
      subjectId: 'sub_math',
      eventType: 'exam',
      startTime: getRelativeDate(25, '09:00'),
      endTime: getRelativeDate(25, '12:00'),
      isFixed: true,
      status: 'scheduled',
      location: 'Auditorium South'
    }
  ];
}
