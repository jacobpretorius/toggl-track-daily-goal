// SEE: https://jcpretorius.com/post/2018/use-toggl-to-track-daily-goal-achievements

// SECRETS:
// TOGGL_API_TOKEN
// TOGGL_PROJECT_ID
//_____________________________________________

const togglClient = require('toggl-api');
const moment = require('moment');
const request = require('request');

module.exports = function(context, cb) {
  var toggl = new togglClient({apiToken: context.secrets.TOGGL_API_TOKEN});

  // How many minutes each day to spend on this goal?
  var goal = 15;

  // Get yesterdays date
  var date = moment(moment().add(-1,'days').format('LL')).toISOString();

  // Get all time entries for yesterday  
  toggl.getTimeEntries(date, null, function(togglErr, timeEntries) {

  // Handle Toggl API error
  if (togglErr) {
    cb(null, { msg: 'TOGGL ERROR: ' + togglErr });
  }else{
    var durationMs = 0;
    var goalAchieved = false;

    // Check that we have timers
    if (timeEntries !== null && timeEntries.length > 0){

      // Loop em      
      timeEntries.forEach(function(TimedActivity){

        // Check if it is a goal project timer
        if (TimedActivity.pid == context.secrets.TOGGL_PROJECT_ID){
          // Got one
          durationMs = durationMs + TimedActivity.duration;
        }
        
      });           
    }
    
    // Check if we have more than 15 mins (goal)
    if ((durationMs / 60) >= goal){
      goalAchieved = true;
    }

    // Start sample goal tracking server request
    // This is left here as an example request, you should be creative and have it do whatever you like
    request(
    {
      url: 'https://service.somewebsite.com/api/SetDay?day=' + moment().add(-1,'days').format('dddd') + '&goal=' + goalAchieved,      
      rejectUnauthorized: false
    },
    function(err, response) {
      if (err) {
        cb(null, { msg: 'ERROR: ' + err });
      }
    });
    // End sample goal tracking server request

    cb(null, { msg: 'OK'});
  }});
};