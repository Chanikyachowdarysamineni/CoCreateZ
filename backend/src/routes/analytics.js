const express = require('express');
const router = express.Router();

// Team Usage Analytics
router.get('/team-usage', (req, res) => {
  res.json({
    mostActiveUser: 'Sarah Johnson',
    topFile: 'Marketing Campaign Analysis.xlsx',
    teamHours: 42,
    avgTimePerUser: 5.2,
    userStats: [
      { name: 'Sarah', hours: 12 },
      { name: 'Mike', hours: 9 },
      { name: 'Emma', hours: 7 },
      { name: 'David', hours: 6 }
    ]
  });
});

// Storage Insights
router.get('/storage', (req, res) => {
  res.json({
    largestUser: 'Mike Rodriguez',
    largestUserStorage: 8.3,
    mostCommonType: 'Excel',
    totalStorage: 24.6,
    breakdown: [
      { name: 'Excel', value: 40 },
      { name: 'Word', value: 35 },
      { name: 'PowerPoint', value: 25 }
    ]
  });
});

// Project Timelines
router.get('/timelines', (req, res) => {
  res.json({
    nextDeadline: 'Product Launch - Sep 15',
    upcomingMilestone: 'Q4 Planning - Sep 20',
    calendarSync: 'Google Calendar',
    eventsThisMonth: 6,
    timeline: [
      { date: 'Sep 10', events: 1 },
      { date: 'Sep 15', events: 2 },
      { date: 'Sep 20', events: 1 },
      { date: 'Sep 25', events: 2 }
    ]
  });
});

module.exports = router;
