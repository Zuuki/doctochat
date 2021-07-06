import { tree_answer, init_tree } from './decision_tree.js';

function GenerateIcs(doctor) {
  var element = document.createElement('a');
  element.setAttribute('href','data:text/plain;charset=utf-8, ' + encodeURIComponent('BEGIN:VCALENDAR\n' +
'VERSION:2.0\n' +
'CALSCALE:GREGORIAN\n' +
'BEGIN:VEVENT\n' +
'SUMMARY:rendez-vous avec ' + doctor +
'\nDTSTART;TZID=America/New_York:20130802T103400\n' +
'DTEND;TZID=America/New_York:20130802T110400\n' +
'LOCATION:1000 Broadway Ave.\, Brooklyn\n' +
'DESCRIPTION: Access-A-Ride to 900 Jay St.\, Brooklyn\n' +
'STATUS:CONFIRMED\n' +
'SEQUENCE:3\n' +
'BEGIN:VALARM\n' +
'TRIGGER:-PT10M\n' +
'DESCRIPTION:Pickup Reminder\n' +
'ACTION:DISPLAY\n' +
'END:VALARM\n' +
'END:VEVENT\n' +
'BEGIN:VEVENT\n' +
'SUMMARY:Access-A-Ride Pickup\n' +
'DTSTART;TZID=America/New_York:20130802T200000\n' +
'DTEND;TZID=America/New_York:20130802T203000\n' +
'LOCATION:900 Jay St.\, Brooklyn\n' +
'DESCRIPTION: Access-A-Ride to 1000 Broadway Ave.\, Brooklyn\n' +
'STATUS:CONFIRMED\n' +
'SEQUENCE:3\n' +
'BEGIN:VALARM\n' +
'TRIGGER:-PT10M\n' +
'DESCRIPTION:Pickup Reminder\n' +
'ACTION:DISPLAY\n' +
'END:VALARM\n' +
'END:VEVENT\n' +
'END:VCALENDAR'));
  element.setAttribute('download', 'event.ics');
  document.body.appendChild(element);
  element.click();
  console.log('tests');
}

var context = {
    "mode": "default"
}

export function bot_answer(text)
{
    if (context.mode === "default")
    {
        // Try to change context.mode
        if (text === "diag" || text === "diagnostic")
        {
            context.mode = "diagnostic"
            return init_tree()
        }
        if (text === "test")
        {
            return "works";
        }
        return "not test";
    }
    else if (context.mode === "diagnostic")
    {
        return tree_answer(text)
    }
    else
    {
        return "Undefined mode, read the doc please 🤓"
    }
}
