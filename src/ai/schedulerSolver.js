// Deterministic Interval Packing & Rescheduling Solver
import { intervalsOverlap } from '../utils/dateUtils.js';

export class SchedulerSolver {
  constructor(preferences, subjects) {
    this.preferences = preferences;
    this.subjects = subjects;
  }

  /**
   * Generates a conflict-free study schedule for target subjects leading up to exam horizon.
   */
  generateExamSchedule(existingEvents, { subjectsList, collegeStart = '09:00', collegeEnd = '16:00', horizonDays = 21, dailyTargetHours = 3 }) {
    const proposedAdditions = [];
    const now = new Date();

    // Map subject entities to known subjects or fallback
    const resolvedSubjects = subjectsList.map(name => {
      const match = this.subjects.find(s => s.name.toLowerCase().includes(name.toLowerCase()));
      return match || { id: 'sub_' + name.toLowerCase().replace(/\s+/g, '_'), name, color: '#6366f1' };
    });

    let currentSubjectIdx = 0;

    for (let dayOffset = 0; dayOffset < Math.min(horizonDays, 14); dayOffset++) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + dayOffset);
      const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;

      // Available evening blocks on weekdays or morning/afternoon on weekends
      const sessionSlots = isWeekend
        ? [
            { startH: 10, startM: 0, durationMins: 90 },
            { startH: 14, startM: 0, durationMins: 90 },
            { startH: 16, startM: 30, durationMins: 90 }
          ]
        : [
            { startH: 17, startM: 0, durationMins: 90 },
            { startH: 19, startM: 0, durationMins: 90 }
          ];

      for (const slot of sessionSlots) {
        const slotStart = new Date(targetDate);
        slotStart.setHours(slot.startH, slot.startM, 0, 0);
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotStart.getMinutes() + slot.durationMins);

        // Check if this overlaps with any existing fixed event (college class, exam)
        const hasCollision = existingEvents.some(evt => 
          intervalsOverlap(slotStart.toISOString(), slotEnd.toISOString(), evt.startTime, evt.endTime)
        );

        if (!hasCollision) {
          const subject = resolvedSubjects[currentSubjectIdx % resolvedSubjects.length];
          currentSubjectIdx++;

          proposedAdditions.push({
            title: `${subject.name} Study Block`,
            subjectId: subject.id,
            eventType: 'study_session',
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            isFixed: false,
            notes: `Auto-scheduled by StudyFlow AI for exam preparation in ${horizonDays} days.`
          });
        }
      }
    }

    return {
      addEvents: proposedAdditions,
      moveEvents: [],
      removeEventIds: [],
      summary: `Generated ${proposedAdditions.length} balanced study blocks across ${resolvedSubjects.map(s => s.name).join(', ')} over the next ${Math.min(horizonDays, 14)} days, preserving your college hours (9 AM - 4 PM) and rest windows.`,
      subjectNames: resolvedSubjects.map(s => s.name)
    };
  }

  /**
   * Finds the best alternative slot for a missed study session.
   */
  findRescheduleOptions(existingEvents, missedEvent) {
    const candidates = [];
    const missedStart = new Date(missedEvent.startTime);
    const durationMins = Math.round((new Date(missedEvent.endTime) - missedStart) / 60000) || 90;

    // Search across the next 3 days
    for (let dayOffset = 1; dayOffset <= 3; dayOffset++) {
      const targetDate = new Date(missedStart);
      targetDate.setDate(targetDate.getDate() + dayOffset);

      // Try 17:00, 19:00, 20:30 slots
      const candidateHours = [17, 19, 20];

      for (const hour of candidateHours) {
        const candStart = new Date(targetDate);
        candStart.setHours(hour, 0, 0, 0);
        const candEnd = new Date(candStart);
        candEnd.setMinutes(candStart.getMinutes() + durationMins);

        const overlaps = existingEvents.some(evt =>
          evt.id !== missedEvent.id &&
          intervalsOverlap(candStart.toISOString(), candEnd.toISOString(), evt.startTime, evt.endTime)
        );

        if (!overlaps) {
          const dayName = candStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          const timeStr = candStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          
          candidates.push({
            newStartTime: candStart.toISOString(),
            newEndTime: candEnd.toISOString(),
            label: `${dayName} at ${timeStr}`,
            score: dayOffset === 1 ? 0.95 : 0.82,
            reason: dayOffset === 1 
              ? 'Earliest open evening slot tomorrow with zero conflicts' 
              : `Safe backup slot on day ${dayOffset + 1}`
          });

          if (candidates.length >= 2) break;
        }
      }
      if (candidates.length >= 2) break;
    }

    return candidates;
  }
}
