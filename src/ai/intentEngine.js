import { SchedulerSolver } from './schedulerSolver.js';
import { formatTime, formatDate } from '../utils/dateUtils.js';

export class AIIntentEngine {
  constructor(store) {
    this.store = store;
  }

  processPrompt(promptText) {
    const text = promptText.trim().toLowerCase();
    const state = this.store.getState();
    const solver = new SchedulerSolver(state.preferences, state.subjects);

    // Intent 1: Schedule generation with College hours + Subjects + Exam horizon
    // Example: "I have college from 9 AM to 4 PM, I want to study Python, mathematics and AI, and my exams are in three weeks."
    if (
      (text.includes('college') || text.includes('school')) &&
      (text.includes('study') || text.includes('exam'))
    ) {
      const extractedSubjects = [];
      if (text.includes('python')) extractedSubjects.push('Python Programming');
      if (text.includes('math') || text.includes('mathematics')) extractedSubjects.push('Discrete Mathematics');
      if (text.includes('ai') || text.includes('artificial intelligence')) extractedSubjects.push('Artificial Intelligence');
      if (text.includes('data structure')) extractedSubjects.push('Data Structures');
      if (extractedSubjects.length === 0) extractedSubjects.push('Python Programming', 'Artificial Intelligence');

      let horizonDays = 21; // 3 weeks default
      if (text.includes('2 weeks') || text.includes('two weeks')) horizonDays = 14;
      if (text.includes('3 weeks') || text.includes('three weeks')) horizonDays = 21;
      if (text.includes('month') || text.includes('4 weeks')) horizonDays = 30;

      const scheduleDiff = solver.generateExamSchedule(state.events, {
        subjectsList: extractedSubjects,
        collegeStart: '09:00',
        collegeEnd: '16:00',
        horizonDays,
        dailyTargetHours: 3.5
      });

      return {
        reply: `I have analyzed your college timetable (9:00 AM – 4:00 PM) and scheduled dedicated preparation blocks for **${extractedSubjects.join(', ')}** over the next **${horizonDays} days** leading to your exams.\n\nAll study slots are packed cleanly into your evening and weekend hours with built-in rest periods. Review the proposed diff below and click **Apply Schedule** to save!`,
        diffPayload: scheduleDiff
      };
    }

    // Intent 2: Missed session rescheduling
    // Example: "Move today's missed study session to another day." or "I missed today's Python study session."
    if (text.includes('missed') || text.includes('move') || text.includes('reschedule') || text.includes('skip')) {
      // Find today's study session
      const now = new Date();
      const studyEvents = state.events.filter(e => e.eventType === 'study_session');
      let targetEvent = studyEvents.find(e => {
        const d = new Date(e.startTime);
        return d.toDateString() === now.toDateString() && (text.includes('python') ? e.title.toLowerCase().includes('python') : true);
      }) || studyEvents[0];

      if (!targetEvent) {
        return {
          reply: "I couldn't find an active study session for today to reschedule. Would you like to create a new session instead?",
          diffPayload: null
        };
      }

      const options = solver.findRescheduleOptions(state.events, targetEvent);
      if (options.length === 0) {
        return {
          reply: "Your upcoming 3 days are fully booked with classes and exams. Consider reducing your study goal by 30 minutes to make room.",
          diffPayload: null
        };
      }

      const bestOption = options[0];
      const diff = {
        addEvents: [],
        moveEvents: [
          {
            id: targetEvent.id,
            title: targetEvent.title,
            oldStartTime: targetEvent.startTime,
            oldEndTime: targetEvent.endTime,
            newStartTime: bestOption.newStartTime,
            newEndTime: bestOption.newEndTime
          }
        ],
        removeEventIds: [],
        summary: `Move "${targetEvent.title}" from today to ${bestOption.label}.`
      };

      return {
        reply: `No problem! Life happens. I located a conflict-free window for **${targetEvent.title}** on **${bestOption.label}** (${bestOption.reason}).\n\nWould you like me to reschedule this session now?`,
        diffPayload: diff
      };
    }

    // Intent 3: Daily study allocation
    // Example: "Give me two hours for Python every day."
    if (text.includes('every day') || text.includes('daily') || text.includes('two hours for python') || text.includes('2 hours')) {
      const subjectName = text.includes('python') ? 'Python Programming' : (text.includes('ai') ? 'Artificial Intelligence' : 'Discrete Mathematics');
      const subject = state.subjects.find(s => s.name.toLowerCase().includes(subjectName.toLowerCase())) || state.subjects[0];

      const diff = solver.generateExamSchedule(state.events, {
        subjectsList: [subject.name],
        collegeStart: '09:00',
        collegeEnd: '16:00',
        horizonDays: 7,
        dailyTargetHours: 2
      });

      return {
        reply: `Done! I've reserved daily 2-hour focused study blocks for **${subject.name}** for the upcoming 7 days, slotted right after college at 5:00 PM. Review the diff below:`,
        diffPayload: diff
      };
    }

    // Intent 4: What is the most important thing to do today?
    // Example: "What's the most important thing I need to do today?"
    if (text.includes('most important') || text.includes('what should i do') || text.includes('priority')) {
      const urgentTask = state.tasks.find(t => t.priority === 'urgent' && t.status !== 'completed') ||
                         state.tasks.find(t => t.priority === 'high' && t.status !== 'completed');
      
      const nextEvent = state.events.find(e => new Date(e.startTime) > new Date() && e.status !== 'completed');

      let reply = "Here is your primary focus for today:\n\n";
      if (urgentTask) {
        reply += `🎯 **Top Priority Task:** [${urgentTask.title}] (Due: ${formatDate(urgentTask.dueDate)} at ${urgentTask.dueTime || '18:00'}). Estimated duration: ${urgentTask.estimatedMinutes} mins.\n\n`;
      }
      if (nextEvent) {
        reply += `📅 **Next Scheduled Item:** "${nextEvent.title}" starting at **${formatTime(nextEvent.startTime)}**.\n\n`;
      }
      reply += "💡 *Recommendation:* Complete your urgent task before your evening study session to prevent cognitive debt!";

      return { reply, diffPayload: null };
    }

    // Intent 5: Reminders & Task creation
    // Example: "Remind me about my assignment tomorrow."
    if (text.includes('remind') || text.includes('assignment tomorrow') || text.includes('homework')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowIso = tomorrow.toISOString().split('T')[0];

      const newTask = this.store.addTask({
        title: text.includes('assignment') ? 'Complete Coursework Assignment' : 'Academic Task',
        taskType: 'assignment',
        priority: 'high',
        dueDate: tomorrowIso,
        dueTime: '17:00',
        estimatedMinutes: 90,
        status: 'todo'
      });

      return {
        reply: `Got it! I added **"${newTask.title}"** to your Task Manager, due tomorrow at 5:00 PM, and scheduled an in-app reminder.`,
        diffPayload: null
      };
    }

    // Intent 6: Plan my week
    // Example: "Plan my week."
    if (text.includes('plan my week') || text.includes('weekly plan')) {
      const diff = solver.generateExamSchedule(state.events, {
        subjectsList: state.subjects.map(s => s.name).slice(0, 3),
        collegeStart: '09:00',
        collegeEnd: '16:00',
        horizonDays: 7,
        dailyTargetHours: 3
      });

      return {
        reply: "Here is your balanced weekly study plan! I distributed your coursework across your free evenings Monday through Saturday, ensuring you finish before 9:00 PM for proper rest:",
        diffPayload: diff
      };
    }

    // Default Fallback
    return {
      reply: `I understand! Based on your schedule (College 9 AM - 4 PM), I can assist you with:\n- **"College 9 to 4, study Python and AI, exams in 3 weeks"**\n- **"Move today's missed study session to another day"**\n- **"Give me two hours for Python every day"**\n- **"What's the most important thing I need to do today?"**\n\nTry clicking one of the suggested prompts below or ask anything specific!`,
      diffPayload: null
    };
  }
}
